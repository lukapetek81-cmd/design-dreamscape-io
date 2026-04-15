import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const results: Record<string, any> = {};

  // Test CommodityPriceAPI
  const cpApiKey = Deno.env.get('COMMODITYPRICE_API_KEY');
  if (cpApiKey) {
    try {
      const resp = await fetch(
        `https://api.commoditypriceapi.com/api/latest?base=USD&symbols=XAU,XAG,HG,CORN,SOYBEAN,CA,LS,CT,CC,CATTLE`,
        { headers: { 'Authorization': `Bearer ${cpApiKey}` } }
      );
      const text = await resp.text();
      results.commodityPriceAPI = { status: resp.status, body: text.substring(0, 500) };
    } catch (err) {
      results.commodityPriceAPI = { error: String(err) };
    }
  } else {
    results.commodityPriceAPI = { error: 'No API key' };
  }

  // Test FMP symbols
  const fmpKey = Deno.env.get('FMP_API_KEY');
  if (fmpKey) {
    const testSymbols = ['GCUSD', 'SIUSD', 'HGUSD', 'ZCUSD', 'ZSUSD', 'KCUSD', 'SBUSD', 'CCUSD', 'CTUSD', 'OJUSD', 'LEUSD', 'HEUSD', 'PLUSD', 'PAUSD', 'ZLUSD', 'ZMUSD'];
    const fmpResults: Record<string, any> = {};
    
    for (const sym of testSymbols) {
      try {
        const resp = await fetch(`https://financialmodelingprep.com/stable/quote?symbol=${sym}&apikey=${fmpKey}`);
        const text = await resp.text();
        fmpResults[sym] = { status: resp.status, preview: text.substring(0, 100) };
      } catch (err) {
        fmpResults[sym] = { error: String(err) };
      }
    }
    results.fmpSymbols = fmpResults;
  }

  return new Response(JSON.stringify(results, null, 2), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
