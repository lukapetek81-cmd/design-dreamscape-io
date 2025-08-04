import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const fmpApiKey = Deno.env.get('FMP_API_KEY')
    if (!fmpApiKey || fmpApiKey === 'demo') {
      return new Response(
        JSON.stringify({ error: 'FMP API key not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Researching FMP futures capabilities...')

    // Test different FMP endpoints for futures data
    const endpoints = [
      'quotes/commodity',
      'historical-price-full/CLUSD',  // Crude oil futures
      'historical-price-full/NGUSD',  // Natural gas futures  
      'historical-price-full/GCUSD',  // Gold futures
      'search?query=CL&limit=50',     // Search for crude oil contracts
      'search?query=futures&limit=50', // Search for futures
    ]

    const results: any = {}

    for (const endpoint of endpoints) {
      try {
        console.log(`Testing endpoint: ${endpoint}`)
        const response = await fetch(
          `https://financialmodelingprep.com/api/v3/${endpoint}?apikey=${fmpApiKey}`
        )
        
        if (response.ok) {
          const data = await response.json()
          results[endpoint] = {
            status: 'success',
            dataType: Array.isArray(data) ? 'array' : typeof data,
            sampleCount: Array.isArray(data) ? data.length : 1,
            sample: Array.isArray(data) ? data.slice(0, 3) : data
          }
          console.log(`✓ ${endpoint}: ${Array.isArray(data) ? data.length : 1} items`)
        } else {
          results[endpoint] = {
            status: 'error',
            error: `HTTP ${response.status}`
          }
          console.log(`✗ ${endpoint}: HTTP ${response.status}`)
        }
      } catch (error) {
        results[endpoint] = {
          status: 'error', 
          error: error.message
        }
        console.log(`✗ ${endpoint}: ${error.message}`)
      }
    }

    // Also test if FMP has a dedicated futures endpoint
    try {
      console.log('Testing potential futures-specific endpoints...')
      const futuresEndpoints = [
        'symbol/available-futures',
        'futures',
        'commodities/futures',
        'quotes/futures'
      ]

      for (const endpoint of futuresEndpoints) {
        try {
          const response = await fetch(
            `https://financialmodelingprep.com/api/v3/${endpoint}?apikey=${fmpApiKey}`
          )
          if (response.ok) {
            const data = await response.json()
            results[`futures-test-${endpoint}`] = {
              status: 'success',
              data: Array.isArray(data) ? data.slice(0, 3) : data
            }
          }
        } catch (e) {
          // Silently fail, endpoint probably doesn't exist
        }
      }
    } catch (error) {
      console.log('Futures endpoint testing failed:', error)
    }

    return new Response(
      JSON.stringify({ 
        results,
        summary: {
          totalEndpoints: endpoints.length,
          successfulEndpoints: Object.values(results).filter((r: any) => r.status === 'success').length,
          timestamp: new Date().toISOString()
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error researching FMP futures:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})