// Modelled forward curve (cost-of-carry).
// Spot price pulled from FMP `/v3/quote/{SYMBOL}=F` (works on Basic plan).
// Curve generated as F(t) = S * exp((r + storage - convenience) * t/12).
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
  spotSym: string;
  storage: number;
  conv: number;
  seasonal?: number[];
}
const MODEL: Record<string, ModelParams> = {
  wti:      { label: 'WTI Crude',    spotSym: 'CL=F', storage: 0.06, conv: 0.04 },
  brent:    { label: 'Brent Crude',  spotSym: 'BZ=F', storage: 0.06, conv: 0.04 },
  // Natural gas: strong winter premium (Nov–Feb), summer discount.
  natgas:   { label: 'Natural Gas',  spotSym: 'NG=F', storage: 0.12, conv: 0.02,
              seasonal: [1.08,1.06,1.00,0.95,0.93,0.94,0.96,0.98,1.00,1.02,1.06,1.10] },
  gold:     { label: 'Gold',         spotSym: 'GC=F', storage: 0.005, conv: 0.0 },
  silver:   { label: 'Silver',       spotSym: 'SI=F', storage: 0.01,  conv: 0.0 },
  copper:   { label: 'Copper',       spotSym: 'HG=F', storage: 0.02,  conv: 0.015 },
  // Grains: harvest discount, pre-harvest premium (rough US harvest cycles).
  corn:     { label: 'Corn',         spotSym: 'ZC=F', storage: 0.05, conv: 0.01,
              seasonal: [1.03,1.04,1.05,1.06,1.07,1.06,1.02,0.97,0.94,0.95,0.97,1.00] },
  soybeans: { label: 'Soybeans',     spotSym: 'ZS=F', storage: 0.05, conv: 0.01,
              seasonal: [1.04,1.05,1.06,1.06,1.05,1.03,1.00,0.96,0.94,0.95,0.98,1.01] },
  wheat:    { label: 'Wheat',        spotSym: 'ZW=F', storage: 0.05, conv: 0.01,
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

const ROOT_FROM_SPOT: Record<string, string> = {
  'CL=F': 'CL', 'BZ=F': 'BZ', 'NG=F': 'NG', 'GC=F': 'GC', 'SI=F': 'SI',
  'HG=F': 'HG', 'ZC=F': 'ZC', 'ZS=F': 'ZS', 'ZW=F': 'ZW',
};

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
    const root = ROOT_FROM_SPOT[params.spotSym];
    const contracts = genContracts(root, monthsAhead);

    // 1. Fetch spot/front-month price from FMP (works on Basic plan).
    const fmpKey = Deno.env.get('FMP_API_KEY');
    if (!fmpKey) throw new Error('FMP_API_KEY missing');
    const url = `https://financialmodelingprep.com/api/v3/quote/${params.spotSym}?apikey=${fmpKey}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`FMP ${resp.status}`);
    const quotes: Array<{ price: number | null }> = await resp.json();
    const spot = quotes?.[0]?.price ?? null;
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

    logger.info(`Modelled curve for ${commodity}: spot=${spot}, m1=${m1}, m2=${m2}`);
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
        model: { type: 'cost_of_carry', riskFree: RISK_FREE, storage: params.storage, convenience: params.conv, seasonal: !!params.seasonal },
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