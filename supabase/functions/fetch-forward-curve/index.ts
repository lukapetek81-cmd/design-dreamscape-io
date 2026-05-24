// Fetch a forward curve (next 12 monthly contracts) for a commodity via FMP.
// Pro-tier gated. JWT-verified. 5-min response cache.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { z } from 'https://esm.sh/zod@3.23.8';
import { corsHeaders, EdgeLogger } from '../_shared/utils.ts';

const MONTH_CODES = ['F', 'G', 'H', 'J', 'K', 'M', 'N', 'Q', 'U', 'V', 'X', 'Z'];
const ROOTS: Record<string, string> = {
  wti: 'CL', brent: 'BZ', natgas: 'NG', gold: 'GC', silver: 'SI',
  copper: 'HG', corn: 'ZC', soybeans: 'ZS', wheat: 'ZW',
};

const BodySchema = z.object({
  commodity: z.enum(['wti','brent','natgas','gold','silver','copper','corn','soybeans','wheat']),
  monthsAhead: z.number().int().min(3).max(24).default(12),
});

function genSymbols(root: string, n: number) {
  const now = new Date();
  const out: { symbol: string; expiry: string; monthIdx: number }[] = [];
  for (let i = 1; i <= n; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const code = MONTH_CODES[d.getMonth()];
    const yr = String(d.getFullYear() % 100).padStart(2, '0');
    out.push({
      symbol: `${root}${code}${yr}`,
      expiry: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      monthIdx: i,
    });
  }
  return out;
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
    const { data: claims, error: claimsErr } = await supabase.auth.getClaims(token);
    if (claimsErr || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userId = claims.claims.sub;

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
    const root = ROOTS[commodity];
    const contracts = genSymbols(root, monthsAhead);

    const fmpKey = Deno.env.get('FMP_API_KEY');
    if (!fmpKey) throw new Error('FMP_API_KEY missing');

    const symList = contracts.map((c) => c.symbol).join(',');
    const url = `https://financialmodelingprep.com/api/v3/quote/${symList}?apikey=${fmpKey}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`FMP ${resp.status}`);
    const quotes: Array<{ symbol: string; price: number | null }> = await resp.json();
    const priceBySymbol = new Map(quotes.map((q) => [q.symbol, q.price]));

    const curve = contracts.map((c) => ({
      symbol: c.symbol,
      expiry: c.expiry,
      monthIdx: c.monthIdx,
      price: priceBySymbol.get(c.symbol) ?? null,
    }));

    const validPrices = curve.filter((c) => typeof c.price === 'number').map((c) => c.price as number);
    const m1 = validPrices[0] ?? null;
    const m2 = validPrices[1] ?? null;
    const structure: 'contango' | 'backwardation' | 'flat' | 'unknown' =
      m1 == null || m2 == null ? 'unknown'
        : m2 > m1 * 1.001 ? 'contango'
        : m2 < m1 * 0.999 ? 'backwardation'
        : 'flat';
    const rollYield = m1 && m2 ? ((m1 - m2) / m1) * 100 : null;

    logger.info(`Forward curve fetched for ${commodity}: ${validPrices.length}/${curve.length} contracts`);
    return new Response(
      JSON.stringify({ commodity, curve, structure, rollYield, m1, m2 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' } },
    );
  } catch (err) {
    logger.error('fetch-forward-curve failed', err);
    return new Response(JSON.stringify({ error: 'fetch_failed' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});