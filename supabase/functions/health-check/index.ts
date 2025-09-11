import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const healthChecks = [];

    // Database health check
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      healthChecks.push({
        service: 'database',
        status: error ? 'unhealthy' : 'healthy',
        responseTime: performance.now(),
        error: error?.message
      });
    } catch (error) {
      healthChecks.push({
        service: 'database',
        status: 'unhealthy',
        error: error.message
      });
    }

    // API endpoints health check
    const apiChecks = [
      { name: 'FMP API', url: `https://financialmodelingprep.com/api/v3/quote/AAPL?apikey=${Deno.env.get('FMP_API_KEY')}` },
      { name: 'Alpha Vantage', url: `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=${Deno.env.get('ALPHA_VANTAGE_API_KEY')}` }
    ];

    for (const apiCheck of apiChecks) {
      try {
        const startTime = performance.now();
        const response = await fetch(apiCheck.url);
        const endTime = performance.now();
        
        healthChecks.push({
          service: apiCheck.name,
          status: response.ok ? 'healthy' : 'unhealthy',
          responseTime: endTime - startTime,
          httpStatus: response.status
        });
      } catch (error) {
        healthChecks.push({
          service: apiCheck.name,
          status: 'unhealthy',
          error: error.message
        });
      }
    }

    // Overall health status
    const overallStatus = healthChecks.every(check => check.status === 'healthy') 
      ? 'healthy' 
      : 'degraded';

    const response = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks: healthChecks,
      version: '1.0.0'
    };

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: overallStatus === 'healthy' ? 200 : 503
      }
    );

  } catch (error) {
    console.error('Health check error:', error);
    
    return new Response(
      JSON.stringify({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 503
      }
    );
  }
})