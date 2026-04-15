import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const OIL_API_BASE = 'https://api.oilpriceapi.com/v1';

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

      const response = await fetch(`${OIL_API_BASE}/prices/latest?by_code=${code}`, {
        headers: { 'Authorization': `Token ${apiKey}` },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`OilPriceAPI error for ${code}: ${response.status} - ${errorText}`);
        throw new Error(`OilPriceAPI error: ${response.status}`);
      }

      const result = await response.json();
      console.log(`OilPriceAPI response for ${code}:`, JSON.stringify(result));

      return new Response(
        JSON.stringify({
          data: {
            price: result.data?.price || 0,
            formatted: result.data?.formatted || '$0.00',
            code: result.data?.code || code,
            timestamp: result.data?.created_at || new Date().toISOString(),
            source: result.data?.source || 'oilpriceapi',
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Batch request for multiple commodities
    if (commodities && Array.isArray(commodities)) {
      const results: Record<string, any> = {};

      // Fetch prices in parallel for all requested commodities
      const fetchPromises = commodities
        .filter((name: string) => OIL_BLEND_CODES[name])
        .map(async (name: string) => {
          const code = OIL_BLEND_CODES[name];
          try {
            const response = await fetch(`${OIL_API_BASE}/prices/latest?by_code=${code}`, {
              headers: { 'Authorization': `Token ${apiKey}` },
            });

            if (!response.ok) {
              const errorText = await response.text();
              console.warn(`OilPriceAPI error for ${code}: ${response.status} - ${errorText}`);
              return;
            }

            const result = await response.json();
            if (result.data?.price) {
              results[name] = {
                price: result.data.price,
                change: 0, // OilPriceAPI latest doesn't include change
                changePercent: 0,
                timestamp: result.data.created_at || new Date().toISOString(),
                source: 'oilpriceapi',
                code: code,
              };
            }
          } catch (err) {
            console.warn(`Failed to fetch ${code} from OilPriceAPI:`, err);
          }
        });

      await Promise.all(fetchPromises);

      console.log(`OilPriceAPI batch: fetched prices for ${Object.keys(results).length} commodities`);

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
