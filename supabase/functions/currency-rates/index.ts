import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Fallback rates (approximate) if API is unavailable
const FALLBACK_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  CNY: 7.25,
  INR: 83.50,
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const fmpApiKey = Deno.env.get('FMP_API_KEY')
    let rates: Record<string, number> = { ...FALLBACK_RATES }
    let source = 'fallback'

    if (fmpApiKey && fmpApiKey !== 'demo') {
      try {
        // FMP forex quotes endpoint
        const pairs = ['EURUSD', 'USDCNY', 'USDINR']
        const response = await fetch(
          `https://financialmodelingprep.com/api/v3/quote/${pairs.join(',')}?apikey=${fmpApiKey}`
        )

        if (response.ok) {
          const data = await response.json()
          if (Array.isArray(data)) {
            for (const quote of data) {
              if (quote.symbol === 'EURUSD' && quote.price) {
                rates.EUR = 1 / quote.price
              } else if (quote.symbol === 'USDCNY' && quote.price) {
                rates.CNY = quote.price
              } else if (quote.symbol === 'USDINR' && quote.price) {
                rates.INR = quote.price
              }
            }
            source = 'fmp'
          }
        }
      } catch (error) {
        console.warn('FMP forex API failed, using fallback rates:', error)
      }
    }

    return new Response(
      JSON.stringify({
        rates,
        source,
        baseCurrency: 'USD',
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in currency-rates function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
