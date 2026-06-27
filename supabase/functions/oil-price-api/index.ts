import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/utils.ts'
import { IpRateLimiter } from '../_shared/rateLimit.ts'
import { PREMIUM_COMMODITIES } from '../_shared/commodity-mappings.ts'

const OIL_API_BASE = 'https://api.oilpriceapi.com/v1';

// IP rate limit: 60 req/min/IP. Generous because cached responses are cheap;
// uncached calls forward to OilPriceAPI which is per-call billed.
const limiter = new IpRateLimiter({ limit: 60, windowMs: 60_000 });

// In-memory cache with TTL (5 minutes for single, 3 minutes for batch)
const priceCache = new Map<string, { data: any; timestamp: number }>();
const SINGLE_CACHE_TTL = 2 * 60 * 60 * 1000; // 2 hours — protects OilPriceAPI quota for premium subscribers
const BATCH_CACHE_TTL = 2 * 60 * 60 * 1000;  // 2 hours
// DB snapshot fallback TTL — survives Edge Function cold starts (in-memory cache
// is per-instance and lost on reboot). 4h is fine for daily-moving futures.
const SNAPSHOT_FALLBACK_TTL = 4 * 60 * 60 * 1000;

let _sbClient: ReturnType<typeof createClient> | null = null;
function getServiceClient() {
  if (_sbClient) return _sbClient;
  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (!url || !key) return null;
  _sbClient = createClient(url, key, { auth: { persistSession: false } });
  return _sbClient;
}

async function readSnapshot(name: string): Promise<{ price: number; ts: string } | null> {
  const sb = getServiceClient();
  if (!sb) return null;
  try {
    const since = new Date(Date.now() - SNAPSHOT_FALLBACK_TTL).toISOString();
    const { data } = await sb
      .from('commodity_price_snapshots')
      .select('price, created_at')
      .eq('commodity_name', name)
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data && Number(data.price) > 0) {
      return { price: Number(data.price), ts: (data as any).created_at };
    }
  } catch (_e) { /* fall through to upstream */ }
  return null;
}

function getCached(key: string, ttl: number): any | null {
  const entry = priceCache.get(key);
  if (entry && Date.now() - entry.timestamp < ttl) {
    return entry.data;
  }
  if (entry) priceCache.delete(key);
  return null;
}

function setCache(key: string, data: any): void {
  // Cap cache at 200 entries to prevent memory issues
  if (priceCache.size > 200) {
    const oldest = priceCache.keys().next().value;
    if (oldest) priceCache.delete(oldest);
  }
  priceCache.set(key, { data, timestamp: Date.now() });
}

// Mapping from our internal commodity names to OilPriceAPI codes
const OIL_BLEND_CODES: Record<string, string> = {
  // Crude Oil Benchmarks
  'WTI Crude Oil': 'WTI_USD',
  'Brent Crude Oil': 'BRENT_CRUDE_USD',
  'Crude Oil Dubai': 'DUBAI_CRUDE_USD',
  'DME Oman Crude': 'DME_OMAN_USD',
  'Murban Crude': 'MURBAN_CRUDE_USD',
  'OPEC Basket': 'OPEC_BASKET_USD',
  'Western Canadian Select': 'WCS_CRUDE_USD',
  // Regional Crude Benchmarks
  'WTI Midland': 'WTI_MIDLAND_USD',
  'Mars Blend': 'MARS_USD',
  'Louisiana Light Sweet': 'LOUISIANA_LIGHT_USD',
  // Refined Products
  'Gasoline RBOB': 'GASOLINE_RBOB_USD',
  'Heating Oil': 'HEATING_OIL_USD',
  'Jet Fuel': 'JET_FUEL_USD',
  'ULSD Diesel': 'ULSD_DIESEL_USD',
  'Gasoil': 'GASOIL_USD',
  'Naphtha': 'NAPHTHA_USD',
  // Natural Gas & LNG
  'Natural Gas': 'NATURAL_GAS_USD',
  'Natural Gas UK': 'NATURAL_GAS_GBP',
  'Dutch TTF Gas': 'DUTCH_TTF_EUR',
  'Japan/Korea LNG': 'JKM_LNG_USD',
  'US Gas Storage': 'NATURAL_GAS_STORAGE',
  // Carbon / Emissions futures (Karl @ OilPriceAPI, 2026 expansion)
  'UK Carbon (UKA)': 'UKA_CARBON_GBP',
  'EU Carbon (EUA)': 'EUA_CARBON_EUR',
  // Marine Fuels
  'VLSFO Global': 'VLSFO_USD',
  'HFO 380 Global': 'HFO_380_USD',
  'MGO 0.5%S Global': 'MGO_05S_USD',
  'HFO 380 Rotterdam': 'HFO_380_NLRTM_USD',
  'VLSFO Singapore': 'VLSFO_SGSIN_USD',
  'MGO Houston': 'MGO_05S_USHOU_USD',
  'VLSFO Fujairah': 'VLSFO_AEFUJ_USD',
};

// Premium-only energy commodities. Single source of truth = PREMIUM_COMMODITIES
// in commodity-mappings.ts. We intersect with the OilPriceAPI catalog plus add
// marine-fuel SKUs that only this function knows about (not in the main catalog).
const MARINE_PREMIUM = ['VLSFO Global', 'HFO 380 Global', 'MGO 0.5%S Global',
  'HFO 380 Rotterdam', 'VLSFO Singapore', 'MGO Houston', 'VLSFO Fujairah'];
const PREMIUM_ENERGY = new Set<string>([
  ...Object.keys(OIL_BLEND_CODES).filter((n) => PREMIUM_COMMODITIES.has(n)),
  ...MARINE_PREMIUM,
]);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. IP-based rate limit (defense against unauthenticated quota burn)
    const ip = IpRateLimiter.getClientIp(req);
    const rl = limiter.check(ip);
    if (!rl.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Retry-After': String(rl.retryAfterSeconds),
          },
        }
      );
    }

    // 2. Resolve subscription status from JWT (server-side; ignores client flags)
    let isPremium = false;
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      try {
        const supa = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_ANON_KEY') ?? ''
        );
        const { data: { user } } = await supa.auth.getUser(authHeader.replace('Bearer ', ''));
        if (user) {
          const { data: profile } = await supa.from('profiles')
            .select('subscription_active, subscription_tier')
            .eq('id', user.id)
            .maybeSingle();
          isPremium = !!(profile?.subscription_active && profile?.subscription_tier && profile.subscription_tier !== 'free');
        }
      } catch (err) {
        console.warn('Subscription lookup failed; treating as free tier:', err);
      }
    }

    const apiKey = Deno.env.get('OIL_PRICE_API_KEY');
    if (!apiKey) {
      throw new Error('OIL_PRICE_API_KEY is not configured');
    }

    const body = req.method === 'POST' ? await req.json() : {};
    const { commodityName, commodities } = body;
    // SECURITY: includePremium is now derived server-side from the JWT/profile.
    // Any client-supplied includePremium field is ignored.
    const includePremium = isPremium;

    // Single commodity request
    if (commodityName) {
      if (!includePremium && PREMIUM_ENERGY.has(commodityName)) {
        return new Response(
          JSON.stringify({ error: 'Premium-only commodity', data: null, premium: true }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const code = OIL_BLEND_CODES[commodityName];
      if (!code) {
        return new Response(
          JSON.stringify({ error: `No OilPriceAPI mapping for: ${commodityName}`, data: null }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check cache first
      const cacheKey = `single:${code}`;
      const cached = getCached(cacheKey, SINGLE_CACHE_TTL);
      if (cached) {
        console.log(`Cache hit for ${code}`);
        return new Response(
          JSON.stringify({ data: cached }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // DB snapshot fallback (survives cold starts) — avoids burning OilPriceAPI credit
      // when a fresh-enough price already exists in commodity_price_snapshots.
      const snap = await readSnapshot(commodityName);
      if (snap) {
        const snapData = {
          price: snap.price,
          formatted: `$${snap.price}`,
          code,
          timestamp: snap.ts,
          source: 'oilpriceapi-snapshot',
        };
        setCache(cacheKey, snapData);
        console.log(`Snapshot fallback for ${code}: $${snap.price}`);
        return new Response(
          JSON.stringify({ data: snapData }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const response = await fetch(`${OIL_API_BASE}/prices/latest?by_code=${code}`, {
        headers: { 'Authorization': `Token ${apiKey}` },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`OilPriceAPI error for ${code}: ${response.status} - ${errorText}`);
        throw new Error(`OilPriceAPI error: ${response.status}`);
      }

      const result = await response.json();
      const responseData = {
        price: result.data?.price || 0,
        formatted: result.data?.formatted || '$0.00',
        code: result.data?.code || code,
        timestamp: result.data?.created_at || new Date().toISOString(),
        source: result.data?.source || 'oilpriceapi',
      };
      
      setCache(cacheKey, responseData);
      console.log(`OilPriceAPI response for ${code}: $${responseData.price} (cached)`);

      return new Response(
        JSON.stringify({ data: responseData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Batch request for multiple commodities
    if (commodities && Array.isArray(commodities)) {
      // Filter premium commodities for free callers — protects OilPriceAPI quota.
      const allowed = includePremium
        ? commodities
        : commodities.filter((n: string) => !PREMIUM_ENERGY.has(n));
      const results: Record<string, any> = {};
      const uncachedNames: string[] = [];

      // Check cache for each commodity first
      for (const name of allowed) {
        if (!OIL_BLEND_CODES[name]) continue;
        const cacheKey = `single:${OIL_BLEND_CODES[name]}`;
        const cached = getCached(cacheKey, BATCH_CACHE_TTL);
        if (cached) {
          results[name] = {
            price: cached.price,
            change: 0,
            changePercent: 0,
            timestamp: cached.timestamp,
            source: 'oilpriceapi',
            code: OIL_BLEND_CODES[name],
          };
        } else {
          uncachedNames.push(name);
        }
      }

      console.log(`Batch: ${Object.keys(results).length} cached, ${uncachedNames.length} to fetch`);

      // Sequential fetch with throttling — OilPriceAPI rate-limits aggressive parallel calls (429).
      // Concurrency=4 with small inter-batch delay keeps us under typical free-tier limits
      // while still finishing 33 commodities in a few seconds.
      const CONCURRENCY = 4;
      const INTER_BATCH_DELAY_MS = 1100;
      let rateLimited = false;

      for (let i = 0; i < uncachedNames.length; i += CONCURRENCY) {
        if (rateLimited) break; // Stop hammering the API once we hit a 429
        const slice = uncachedNames.slice(i, i + CONCURRENCY);
        await Promise.all(slice.map(async (name: string) => {
          const code = OIL_BLEND_CODES[name];
          try {
            const response = await fetch(`${OIL_API_BASE}/prices/latest?by_code=${code}`, {
              headers: { 'Authorization': `Token ${apiKey}` },
            });

            if (!response.ok) {
              const errorText = await response.text();
              if (response.status === 429) {
                rateLimited = true;
                console.warn(`OilPriceAPI 429 on ${code}; aborting remaining batch`);
              } else {
                console.warn(`OilPriceAPI error for ${code}: ${response.status} - ${errorText.slice(0, 100)}`);
              }
              return;
            }

            const result = await response.json();
            if (result.data?.price) {
              const priceEntry = {
                price: result.data.price,
                change: 0,
                changePercent: 0,
                timestamp: result.data.created_at || new Date().toISOString(),
                source: 'oilpriceapi',
                code: code,
              };
              results[name] = priceEntry;
              setCache(`single:${code}`, {
                price: result.data.price,
                formatted: result.data.formatted || `$${result.data.price}`,
                code,
                timestamp: result.data.created_at || new Date().toISOString(),
                source: 'oilpriceapi',
              });
            }
          } catch (err) {
            console.warn(`Failed to fetch ${code} from OilPriceAPI:`, err);
          }
        }));
        if (i + CONCURRENCY < uncachedNames.length && !rateLimited) {
          await new Promise((r) => setTimeout(r, INTER_BATCH_DELAY_MS));
        }
      }

      console.log(`OilPriceAPI batch: ${Object.keys(results).length} total (${uncachedNames.length} requested, ${rateLimited ? 'RATE-LIMITED' : 'ok'})`);

      return new Response(
        JSON.stringify({ data: results }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // List available commodities
    return new Response(
      JSON.stringify({
        available: Object.entries(OIL_BLEND_CODES).map(([name, code]) => ({ name, code })),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('OilPriceAPI function error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
