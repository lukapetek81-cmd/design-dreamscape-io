import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const OIL_API_BASE = 'https://api.oilpriceapi.com/v1';

// In-memory cache with TTL (5 minutes for single, 3 minutes for batch)
const priceCache = new Map<string, { data: any; timestamp: number }>();
const SINGLE_CACHE_TTL = 30 * 60 * 1000; // 30 minutes — OilPriceAPI free tier is heavily rate-limited
const BATCH_CACHE_TTL = 30 * 60 * 1000;  // 30 minutes

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
  'Indian Basket': 'INDIAN_BASKET_USD',
  'Tapis Crude Oil': 'TAPIS_CRUDE_USD',
  'Urals Crude Oil': 'URALS_CRUDE_USD',
  'Western Canadian Select': 'WCS_CRUDE_USD',
  // Regional Crude Benchmarks
  'WTI Midland': 'WTI_MIDLAND_USD',
  'Alaska North Slope': 'ANS_WEST_COAST_USD',
  'Mars Blend': 'MARS_USD',
  'Louisiana Light Sweet': 'LOUISIANA_LIGHT_USD',
  // Refined Products
  'Gasoline RBOB': 'GASOLINE_RBOB_USD',
  'Heating Oil': 'HEATING_OIL_USD',
  'Jet Fuel': 'JET_FUEL_USD',
  'ULSD Diesel': 'ULSD_DIESEL_USD',
  'Gasoil': 'GASOIL_USD',
  'Naphtha': 'NAPHTHA_USD',
  'Propane': 'PROPANE_MONT_BELVIEU_USD',
  'Ethanol': 'ETHANOL_USD',
  // Natural Gas & LNG
  'Natural Gas': 'NATURAL_GAS_USD',
  'Natural Gas UK': 'NATURAL_GAS_GBP',
  'Dutch TTF Gas': 'DUTCH_TTF_EUR',
  'Japan/Korea LNG': 'JKM_LNG_USD',
  'US Gas Storage': 'NATURAL_GAS_STORAGE',
  // Marine Fuels
  'VLSFO Global': 'VLSFO_USD',
  'HFO 380 Global': 'HFO_380_USD',
  'MGO 0.5%S Global': 'MGO_05S_USD',
  'HFO 380 Rotterdam': 'HFO_380_NLRTM_USD',
  'VLSFO Singapore': 'VLSFO_SGSIN_USD',
  'MGO Houston': 'MGO_05S_USHOU_USD',
  'VLSFO Fujairah': 'VLSFO_AEFUJ_USD',
};

// Premium-only energy commodities. See mem://monetization/strategy.
// These are excluded from free-tier responses to conserve OilPriceAPI quota.
const PREMIUM_ENERGY = new Set<string>([
  'WTI Midland', 'Alaska North Slope', 'Mars Blend', 'Louisiana Light Sweet',
  'Gasoline RBOB', 'Heating Oil', 'Jet Fuel', 'ULSD Diesel',
  'Gasoil', 'Naphtha', 'Propane', 'Ethanol',
  'VLSFO Global', 'HFO 380 Global', 'MGO 0.5%S Global',
  'HFO 380 Rotterdam', 'VLSFO Singapore', 'MGO Houston', 'VLSFO Fujairah',
]);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('OIL_PRICE_API_KEY');
    if (!apiKey) {
      throw new Error('OIL_PRICE_API_KEY is not configured');
    }

    const body = req.method === 'POST' ? await req.json() : {};
    const { commodityName, commodities } = body;

    // Single commodity request
    if (commodityName) {
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
      const results: Record<string, any> = {};
      const uncachedNames: string[] = [];

      // Check cache for each commodity first
      for (const name of commodities) {
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
