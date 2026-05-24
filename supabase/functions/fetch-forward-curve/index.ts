// Forward curve — real-market sourcing:
//   - All commodities: REAL monthly contract strip from FMP Starter
//     (e.g. CLG26 = WTI Feb-26, GCG26 = Gold Feb-26, ZCH27 = Corn Mar-27).
//   - Spot reference: OilPriceAPI for energy (per memory rule), FMP for the rest.
//   - Cost-of-carry MODEL is the fallback when <60% of FMP contracts return
//     prices (deep back-months or off-hours).
// Pro-tier gated. JWT-verified. 5-min response cache.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { z } from 'https://esm.sh/zod@3.23.8';
import { corsHeaders, EdgeLogger } from '../_shared/utils.ts';
import { fetchFmpFuturesCurve } from '../_shared/fmp-client.ts';
import { FMP_FUTURES_ROOTS } from '../_shared/commodity-mappings.ts';

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
  source: 'energy' | 'fmp';
  energyName?: string;            // OilPriceAPI commodity name (when source==='energy')
  fmpSpotSym?: string;            // FMP front-month symbol for spot fallback (when source==='fmp')
  storage: number;
  conv: number;
  seasonal?: number[];
}
const MODEL: Record<string, ModelParams> = {
  wti:      { label: 'WTI Crude',   root: 'CL', source: 'energy', energyName: 'WTI Crude Oil',   storage: 0.06, conv: 0.04 },
  brent:    { label: 'Brent Crude', root: 'BZ', source: 'energy', energyName: 'Brent Crude Oil', storage: 0.06, conv: 0.04 },
  // Natural gas: strong winter premium (Nov–Feb), summer discount (fallback only).
  natgas:   { label: 'Natural Gas', root: 'NG', source: 'energy', energyName: 'Natural Gas',     storage: 0.12, conv: 0.02,
              seasonal: [1.08,1.06,1.00,0.95,0.93,0.94,0.96,0.98,1.00,1.02,1.06,1.10] },
  gold:     { label: 'Gold',        root: 'GC', source: 'fmp', fmpSpotSym: 'GC=F',   storage: 0.005, conv: 0.0 },
  silver:   { label: 'Silver',      root: 'SI', source: 'fmp', fmpSpotSym: 'SI=F',   storage: 0.01,  conv: 0.0 },
  copper:   { label: 'Copper',      root: 'HG', source: 'fmp', fmpSpotSym: 'HG=F',   storage: 0.02,  conv: 0.015 },
  // Grains: harvest discount, pre-harvest premium (rough US harvest cycles).
  corn:     { label: 'Corn',        root: 'ZC', source: 'fmp', fmpSpotSym: 'ZC=F',   storage: 0.05, conv: 0.01,
              seasonal: [1.03,1.04,1.05,1.06,1.07,1.06,1.02,0.97,0.94,0.95,0.97,1.00] },
  soybeans: { label: 'Soybeans',    root: 'ZS', source: 'fmp', fmpSpotSym: 'ZS=F',   storage: 0.05, conv: 0.01,
              seasonal: [1.04,1.05,1.06,1.06,1.05,1.03,1.00,0.96,0.94,0.95,0.98,1.01] },
  wheat:    { label: 'Wheat',       root: 'ZW', source: 'fmp', fmpSpotSym: 'ZW=F',   storage: 0.05, conv: 0.01,
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

async function fetchSpotFmp(sym: string): Promise<number | null> {
  const key = Deno.env.get('FMP_API_KEY');
  if (!key) return null;
  const url = `https://financialmodelingprep.com/api/v3/quote/${encodeURIComponent(sym)}?apikey=${key}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const arr = await res.json();
    const price = Array.isArray(arr) ? arr[0]?.price : null;
    return typeof price === 'number' && price > 0 ? price : null;
  } catch {
    return null;
  }
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

    // 1. Fetch spot for the source-tag and modelled fallback.
    const spot = params.source === 'energy'
      ? await fetchSpotEnergy(params.energyName!)
      : await fetchSpotFmp(params.fmpSpotSym!);
    if (spot == null) {
      return new Response(JSON.stringify({ error: 'spot_unavailable' }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2a. Try the real FMP monthly contract strip for EVERY commodity
    //     (energy roots CL/BZ/NG are on NYMEX/ICE and quoted by FMP Starter too).
    let curve: Array<{ symbol: string; expiry: string; monthIdx: number; price: number }> = [];
    let usedSource: 'market' | 'model' = 'model';

    {
      const root = FMP_FUTURES_ROOTS[commodity] ?? params.root;
      const realCurve = await fetchFmpFuturesCurve(root, monthsAhead);
      const withPrice = realCurve.filter((c) => typeof c.price === 'number' && c.price > 0);
      // Require ≥60% of contracts to have real prices to call it "market"; otherwise fall back.
      if (withPrice.length >= Math.ceil(monthsAhead * 0.6)) {
        // Interpolate any missing months linearly between neighbours.
        const filled = realCurve.map((c, idx) => {
          if (typeof c.price === 'number' && c.price > 0) return { ...c, price: c.price };
          // find nearest left + right with prices
          let left: number | null = null, right: number | null = null;
          for (let i = idx - 1; i >= 0; i--) {
            if (typeof realCurve[i].price === 'number' && (realCurve[i].price as number) > 0) {
              left = realCurve[i].price as number; break;
            }
          }
          for (let i = idx + 1; i < realCurve.length; i++) {
            if (typeof realCurve[i].price === 'number' && (realCurve[i].price as number) > 0) {
              right = realCurve[i].price as number; break;
            }
          }
          const fill = left != null && right != null ? (left + right) / 2 : (left ?? right ?? spot);
          return { ...c, price: +fill.toFixed(4) };
        });
        curve = filled.map((c) => ({
          symbol: c.symbol,
          expiry: c.expiry,
          monthIdx: c.monthIdx,
          price: +(c.price as number).toFixed(4),
        }));
        usedSource = 'market';
      }
    }

    // 2b. Modelled curve fallback (energy always; FMP on insufficient data).
    if (curve.length === 0) {
      const carry = RISK_FREE + params.storage - params.conv;
      curve = contracts.map((c) => {
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
      usedSource = 'model';
    }

    const m1 = curve[0]?.price ?? null;
    const m2 = curve[1]?.price ?? null;
    const structure: 'contango' | 'backwardation' | 'flat' | 'unknown' =
      m1 == null || m2 == null ? 'unknown'
        : m2 > m1 * 1.001 ? 'contango'
        : m2 < m1 * 0.999 ? 'backwardation'
        : 'flat';
    const rollYield = m1 && m2 ? ((m2 - m1) / m1) * 100 : null;

    logger.info(`Curve for ${commodity} (source=${usedSource}, provider=${params.source}): spot=${spot}, m1=${m1}, m2=${m2}`);
    return new Response(
      JSON.stringify({
        commodity,
        spot,
        curve,
        structure,
        rollYield,
        m1,
        m2,
        source: usedSource,
        model: usedSource === 'model'
          ? { type: 'cost_of_carry', spotSource: params.source === 'energy' ? 'oilpriceapi' : 'fmp', riskFree: RISK_FREE, storage: params.storage, convenience: params.conv, seasonal: !!params.seasonal }
          : { type: 'market', spotSource: 'fmp', provider: 'FMP Starter (/v3/quote)' },
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