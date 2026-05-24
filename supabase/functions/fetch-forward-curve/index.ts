// Modelled forward curve (cost-of-carry).
// Spot price sourced provider-by-commodity:
//   - Energy (WTI, Brent, NatGas) → internal oil-price-api proxy (OilPriceAPI).
//   - Metals & grains            → CommodityPriceAPI /v2/rates/latest.
// No FMP dependency. Curve generated as F(t) = S * exp((r + storage - convenience) * t/12).
// Pro-tier gated. JWT-verified. 5-min response cache.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { z } from 'https://esm.sh/zod@3.23.8';
import { corsHeaders, EdgeLogger } from '../_shared/utils.ts';

const MONTH_CODES = ['F', 'G', 'H', 'J', 'K', 'M', 'N', 'Q', 'U', 'V', 'X', 'Z'];

// Per-commodity model params (annualised %):
//   spotSym  — FMP symbol returning current spot/front-month
//   storage  — annual storage + insurance cost (carry positive)
//   conv     — convenience yield (carry negative; tightness premium)
//   seasonal — optional 12-month seasonal multipliers (Jan=0…Dec=11), 1.0 = neutral
const RISK_FREE = 0.045; // ~3M T-bill proxy. Refresh later via FRED DGS3MO.
interface ModelParams {
  label: string;
  root: string;                   // futures root used for synthetic contract symbols (e.g. 'CL')
  source: 'energy' | 'cpa';
  energyName?: string;            // OilPriceAPI commodity name (when source==='energy')
  cpaSym?: string;                // CommodityPriceAPI symbol (when source==='cpa')
  cpaCentQuoted?: boolean;        // divide CPA price by 100 when true
  storage: number;
  conv: number;
  seasonal?: number[];
}
const MODEL: Record<string, ModelParams> = {
  wti:      { label: 'WTI Crude',   root: 'CL', source: 'energy', energyName: 'WTI Crude Oil',   storage: 0.06, conv: 0.04 },
  brent:    { label: 'Brent Crude', root: 'BZ', source: 'energy', energyName: 'Brent Crude Oil', storage: 0.06, conv: 0.04 },
  // Natural gas: strong winter premium (Nov–Feb), summer discount.
  natgas:   { label: 'Natural Gas', root: 'NG', source: 'energy', energyName: 'Natural Gas',     storage: 0.12, conv: 0.02,
              seasonal: [1.08,1.06,1.00,0.95,0.93,0.94,0.96,0.98,1.00,1.02,1.06,1.10] },
  gold:     { label: 'Gold',        root: 'GC', source: 'cpa', cpaSym: 'XAU',         storage: 0.005, conv: 0.0 },
  silver:   { label: 'Silver',      root: 'SI', source: 'cpa', cpaSym: 'XAG',         storage: 0.01,  conv: 0.0 },
  copper:   { label: 'Copper',      root: 'HG', source: 'cpa', cpaSym: 'HG-SPOT',     storage: 0.02,  conv: 0.015 },
  // Grains: harvest discount, pre-harvest premium (rough US harvest cycles).
  corn:     { label: 'Corn',        root: 'ZC', source: 'cpa', cpaSym: 'CORN',         storage: 0.05, conv: 0.01,
              seasonal: [1.03,1.04,1.05,1.06,1.07,1.06,1.02,0.97,0.94,0.95,0.97,1.00] },
  soybeans: { label: 'Soybeans',    root: 'ZS', source: 'cpa', cpaSym: 'SOYBEAN-FUT',  storage: 0.05, conv: 0.01,
              seasonal: [1.04,1.05,1.06,1.06,1.05,1.03,1.00,0.96,0.94,0.95,0.98,1.01] },
  wheat:    { label: 'Wheat',       root: 'ZW', source: 'cpa', cpaSym: 'ZW-SPOT', cpaCentQuoted: true, storage: 0.05, conv: 0.01,
              seasonal: [1.02,1.03,1.04,1.05,1.04,1.00,0.96,0.95,0.97,0.99,1.00,1.01] },
};

const BodySchema = z.object({
  commodity: z.enum(['wti','brent','natgas','gold','silver','copper','corn','soybeans','wheat']),
  monthsAhead: z.number().int().min(3).max(24).default(12),
});

function genContracts(root: string, n: number) {
  const now = new Date();
  const out: { symbol: string; expiry: string; monthIdx: number; monthOfYear: number }[] = [];
  for (let i = 1; i <= n; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const code = MONTH_CODES[d.getMonth()];
    const yr = String(d.getFullYear() % 100).padStart(2, '0');
    out.push({
      symbol: `${root}${code}${yr}`,
      expiry: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      monthIdx: i,
      monthOfYear: d.getMonth(),
    });
  }
  return out;
}

async function fetchSpotEnergy(name: string): Promise<number | null> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!supabaseUrl || !anonKey) return null;
  const res = await fetch(`${supabaseUrl}/functions/v1/oil-price-api`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${anonKey}` },
    body: JSON.stringify({ commodityName: name }),
  });
  if (!res.ok) return null;
  const json = await res.json();
  const price = json?.price ?? json?.data?.price ?? json?.[name]?.price;
  return typeof price === 'number' && price > 0 ? price : null;
}

async function fetchSpotCpa(sym: string, centQuoted = false): Promise<number | null> {
  const key = Deno.env.get('COMMODITYPRICE_API_KEY');
  if (!key) return null;
  const url = `https://api.commoditypriceapi.com/v2/rates/latest?symbols=${encodeURIComponent(sym)}`;
  const res = await fetch(url, { headers: { 'x-api-key': key } });
  if (!res.ok) return null;
  const json = await res.json();
  let raw = json?.rates?.[sym];
  if (typeof raw !== 'number' || !(raw > 0)) return null;
  if (centQuoted) raw = raw / 100;
  return raw;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const logger = new EdgeLogger({ functionName: 'fetch-forward-curve' });

  try {
    // JWT auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user?.id) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userId = userData.user.id;

    // Pro-tier gate
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    const { data: tierData } = await admin.rpc('get_user_tier', { _user_id: userId });
    if (tierData !== 'pro') {
      return new Response(JSON.stringify({ error: 'pro_required' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json().catch(() => ({}));
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'invalid_input' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const { commodity, monthsAhead } = parsed.data;
    const params = MODEL[commodity];
    const contracts = genContracts(params.root, monthsAhead);

    // 1. Fetch spot/front-month price from the right provider.
    //    Energy → OilPriceAPI (via internal proxy). Metals/grains → CommodityPriceAPI.
    const spot = params.source === 'energy'
      ? await fetchSpotEnergy(params.energyName!)
      : await fetchSpotCpa(params.cpaSym!, params.cpaCentQuoted);
    if (spot == null) {
      return new Response(JSON.stringify({ error: 'spot_unavailable' }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Build modelled curve via cost-of-carry + optional seasonal multipliers.
    const carry = RISK_FREE + params.storage - params.conv;
    const curve = contracts.map((c) => {
      const t = c.monthIdx / 12;
      const base = spot * Math.exp(carry * t);
      const season = params.seasonal ? params.seasonal[c.monthOfYear] : 1;
      return {
        symbol: c.symbol,
        expiry: c.expiry,
        monthIdx: c.monthIdx,
        price: +(base * season).toFixed(4),
      };
    });

    const m1 = curve[0]?.price ?? null;
    const m2 = curve[1]?.price ?? null;
    const structure: 'contango' | 'backwardation' | 'flat' | 'unknown' =
      m1 == null || m2 == null ? 'unknown'
        : m2 > m1 * 1.001 ? 'contango'
        : m2 < m1 * 0.999 ? 'backwardation'
        : 'flat';
    const rollYield = m1 && m2 ? ((m2 - m1) / m1) * 100 : null;

    logger.info(`Modelled curve for ${commodity} (src=${params.source}): spot=${spot}, m1=${m1}, m2=${m2}`);
    return new Response(
      JSON.stringify({
        commodity,
        spot,
        curve,
        structure,
        rollYield,
        m1,
        m2,
        source: 'model',
        model: { type: 'cost_of_carry', spotSource: params.source === 'energy' ? 'oilpriceapi' : 'commoditypriceapi', riskFree: RISK_FREE, storage: params.storage, convenience: params.conv, seasonal: !!params.seasonal },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' } },
    );
  } catch (err) {
    logger.error('fetch-forward-curve failed', err);
    return new Response(JSON.stringify({ error: 'fetch_failed' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});