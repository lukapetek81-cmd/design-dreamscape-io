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
    const alphaVantageApiKey = Deno.env.get('ALPHA_VANTAGE_API_KEY')
    if (!alphaVantageApiKey || alphaVantageApiKey === 'demo') {
      return new Response(
        JSON.stringify({ error: 'Alpha Vantage API key not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Researching Alpha Vantage futures capabilities...')

    const baseUrl = 'https://www.alphavantage.co/query'
    
    // Test different Alpha Vantage endpoints for futures data
    const endpoints = [
      // Real-time commodity prices
      { name: 'WTI Crude Oil', params: 'function=WTI&interval=monthly' },
      { name: 'Brent Crude Oil', params: 'function=BRENT&interval=monthly' },
      { name: 'Natural Gas', params: 'function=NATURAL_GAS&interval=monthly' },
      { name: 'Copper', params: 'function=COPPER&interval=monthly' },
      { name: 'Aluminum', params: 'function=ALUMINUM&interval=monthly' },
      { name: 'Wheat', params: 'function=WHEAT&interval=monthly' },
      { name: 'Corn', params: 'function=CORN&interval=monthly' },
      { name: 'Cotton', params: 'function=COTTON&interval=monthly' },
      { name: 'Sugar', params: 'function=SUGAR&interval=monthly' },
      { name: 'Coffee', params: 'function=COFFEE&interval=monthly' },
      
      // Test intraday data capabilities
      { name: 'WTI Intraday', params: 'function=WTI&interval=daily' },
      { name: 'Natural Gas Daily', params: 'function=NATURAL_GAS&interval=daily' },
      
      // Test if they have futures-specific endpoints
      { name: 'Commodities Function', params: 'function=COMMODITIES' },
      { name: 'Real-time Quote Test', params: 'function=GLOBAL_QUOTE&symbol=CL=F' },
      { name: 'Time Series Test', params: 'function=TIME_SERIES_DAILY&symbol=CL=F' },
      
      // Test economic indicators that might include futures
      { name: 'Economic Indicators', params: 'function=REAL_GDP&interval=annual&datatype=json' },
      { name: 'Treasury Yield', params: 'function=TREASURY_YIELD&interval=monthly&maturity=10year' },
    ]

    const results: any = {}

    for (const endpoint of endpoints) {
      try {
        console.log(`Testing Alpha Vantage endpoint: ${endpoint.name}`)
        const url = `${baseUrl}?${endpoint.params}&apikey=${alphaVantageApiKey}`
        
        const response = await fetch(url)
        
        if (response.ok) {
          const data = await response.json()
          
          // Check for API limit or error messages
          if (data['Error Message']) {
            results[endpoint.name] = {
              status: 'error',
              error: data['Error Message']
            }
          } else if (data['Note']) {
            results[endpoint.name] = {
              status: 'rate_limited',
              note: data['Note']
            }
          } else {
            // Analyze the response structure
            const dataKeys = Object.keys(data)
            const hasTimeSeriesData = dataKeys.some(key => 
              key.toLowerCase().includes('time series') || 
              key.toLowerCase().includes('data') ||
              key.toLowerCase().includes('monthly') ||
              key.toLowerCase().includes('daily')
            )
            
            let sampleData = null
            if (hasTimeSeriesData) {
              const timeSeriesKey = dataKeys.find(key => 
                key.toLowerCase().includes('time series') || 
                key.toLowerCase().includes('data') ||
                key.toLowerCase().includes('monthly') ||
                key.toLowerCase().includes('daily')
              )
              if (timeSeriesKey && data[timeSeriesKey]) {
                const timeSeriesData = data[timeSeriesKey]
                const dates = Object.keys(timeSeriesData).slice(0, 3)
                sampleData = dates.reduce((acc, date) => {
                  acc[date] = timeSeriesData[date]
                  return acc
                }, {})
              }
            } else {
              sampleData = data
            }
            
            results[endpoint.name] = {
              status: 'success',
              dataKeys: dataKeys,
              hasTimeSeriesData,
              sampleCount: hasTimeSeriesData && sampleData ? Object.keys(sampleData).length : 1,
              sample: sampleData,
              metadata: data['Meta Data'] || null
            }
          }
          
          console.log(`✓ ${endpoint.name}: success`)
        } else {
          results[endpoint.name] = {
            status: 'error',
            error: `HTTP ${response.status}`
          }
          console.log(`✗ ${endpoint.name}: HTTP ${response.status}`)
        }
        
        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 200))
        
      } catch (error) {
        results[endpoint.name] = {
          status: 'error', 
          error: error.message
        }
        console.log(`✗ ${endpoint.name}: ${error.message}`)
      }
    }

    // Test specific futures contract endpoints if available
    try {
      console.log('Testing potential futures contract endpoints...')
      const futuresTests = [
        { name: 'CL Front Month', params: 'function=TIME_SERIES_DAILY&symbol=CLZ25' }, // Dec 2025 crude
        { name: 'NG Front Month', params: 'function=TIME_SERIES_DAILY&symbol=NGZ25' }, // Dec 2025 natural gas
        { name: 'GC Front Month', params: 'function=TIME_SERIES_DAILY&symbol=GCZ25' }, // Dec 2025 gold
      ]

      for (const test of futuresTests) {
        try {
          const url = `${baseUrl}?${test.params}&apikey=${alphaVantageApiKey}`
          const response = await fetch(url)
          if (response.ok) {
            const data = await response.json()
            if (!data['Error Message'] && !data['Note']) {
              results[`futures-${test.name}`] = {
                status: 'success',
                data: data
              }
            }
          }
          await new Promise(resolve => setTimeout(resolve, 200))
        } catch (e) {
          // Silently fail, endpoint probably doesn't exist
        }
      }
    } catch (error) {
      console.log('Futures contract testing failed:', error)
    }

    const summary = {
      totalEndpoints: endpoints.length,
      successfulEndpoints: Object.values(results).filter((r: any) => r.status === 'success').length,
      rateLimitedEndpoints: Object.values(results).filter((r: any) => r.status === 'rate_limited').length,
      errorEndpoints: Object.values(results).filter((r: any) => r.status === 'error').length,
      timestamp: new Date().toISOString()
    }

    return new Response(
      JSON.stringify({ 
        results,
        summary,
        recommendations: {
          supportsCommodities: summary.successfulEndpoints > 0,
          hasTimeSeriesData: Object.values(results).some((r: any) => r.hasTimeSeriesData),
          rateLimited: summary.rateLimitedEndpoints > 0,
          nextSteps: summary.successfulEndpoints > 0 ? 
            'Alpha Vantage shows promise for futures data. Consider implementing contract selection UI.' :
            'Limited futures support detected. May need to explore other APIs.'
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error researching Alpha Vantage futures:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})