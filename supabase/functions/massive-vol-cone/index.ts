// Historical Volatility Cone — Pro tier.
// Computes annualized realized volatility over rolling windows (10/20/60/120 days)
// for a single product's front-month, plus historical percentile distribution
// (min / p25 / median / p75 / max) over the last ~5y of daily bars.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { z } from 'https://esm.sh/zod@3.23.8';
import { corsHeaders, EdgeLogger } from '../_shared/utils.ts';
import { fetchMassiveFrontMonthBars } from '../_shared/massive-client.ts';

const PRODUCTS: Record<string, { label: string; code: string }> = {
  gold:     { label: 'Gold',         code: 'GC' },
  silver:   { label: 'Silver',       code: 'SI' },
  copper:   { label: 'Copper',       code: 'HG' },
  platinum: { label: 'Platinum',     code: 'PL' },
  palladium:{ label: 'Palladium',    code: 'PA' },
  corn:     { label: 'Corn',         code: 'ZC' },
  wheat:    { label: 'Wheat',        code: 'ZW' },
  soybeans: { label: 'Soybeans',     code: 'ZS' },
  cattle:   { label: 'Live Cattle',  code: 'LE' },
  hogs:     { label: 'Lean Hogs',    code: 'HE' },
  lumber:   { label: 'Lumber',       code: 'LBR' },
};

const WINDOWS = [10, 20, 60, 120] as const;

const BodySchema = z.object({
  commodity: z.enum(Object.keys(PRODUCTS) as [string, ...string[]]),
});

const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const cache = new Map<string, { at: number; payload: unknown }>();

function rollingVol(closes: number[], window: number): number[] {
  if (closes.length < window + 1) return [];
  const rets: number[] = [];
  for (let i = 1; i < closes.length; i++) rets.push(Math.log(closes[i] / closes[i - 1]));
  const out: number[] = [];
  for (let i = window; i <= rets.length; i++) {
    const slice = rets.slice(i - window, i);
    const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
    const variance = slice.reduce((a, b) => a + (b - mean) ** 2, 0) / (slice.length - 1);
    out.push(Math.sqrt(variance) * Math.sqrt(252) * 100); // annualized %
  }
  return out;
}

function percentile(sorted: number[], p: number): number {
  if (!sorted.length) return NaN;
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const logger = new EdgeLogger({ functionName: 'massive-vol-cone' });

  try {
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
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    const { data: tierData } = await admin.rpc('get_user_tier', { _user_id: userData.user.id });
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
    const { commodity } = parsed.data;
    const product = PRODUCTS[commodity];

    const hit = cache.get(commodity);
    if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
      return new Response(JSON.stringify(hit.payload), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Cache': 'HIT' },
      });
    }

    const today = new Date();
    const from = new Date(today.getTime() - 5 * 365 * 24 * 60 * 60 * 1000);
    const bars = await fetchMassiveFrontMonthBars(
      product.code,
      from.toISOString().slice(0, 10),
      today.toISOString().slice(0, 10),
    );
    if (bars.length < 130) {
      logger.warn(`vol-cone ${product.code} only ${bars.length} bars`);
      return new Response(JSON.stringify({ error: 'insufficient_history' }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const closes = bars.map((b) => b.close);

    const cone = WINDOWS.map((w) => {
      const series = rollingVol(closes, w);
      if (!series.length) return { window: w, current: null, min: null, p25: null, median: null, p75: null, max: null };
      const sorted = [...series].sort((a, b) => a - b);
      return {
        window: w,
        current: +series[series.length - 1].toFixed(2),
        min: +percentile(sorted, 0).toFixed(2),
        p25: +percentile(sorted, 0.25).toFixed(2),
        median: +percentile(sorted, 0.5).toFixed(2),
        p75: +percentile(sorted, 0.75).toFixed(2),
        max: +percentile(sorted, 1).toFixed(2),
      };
    });

    // current vs 1y percentile for the 20-day window — headline number
    const series20 = rollingVol(closes, 20);
    const last252 = series20.slice(-252);
    const sorted252 = [...last252].sort((a, b) => a - b);
    const currentVol = series20[series20.length - 1];
    const rank = sorted252.findIndex((v) => v >= currentVol);
    const percentile1y = rank < 0 ? 100 : Math.round((rank / sorted252.length) * 100);

    const payload = {
      commodity,
      label: product.label,
      provider: 'Massive Futures Starter',
      asOf: bars[bars.length - 1].date,
      bars: bars.length,
      cone,
      currentVol: +currentVol.toFixed(2),
      percentile1y,
    };
    cache.set(commodity, { at: Date.now(), payload });

    return new Response(JSON.stringify(payload), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Cache': 'MISS' },
    });
  } catch (err) {
    logger.error('vol-cone failed', err);
    return new Response(JSON.stringify({ error: 'fetch_failed' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});