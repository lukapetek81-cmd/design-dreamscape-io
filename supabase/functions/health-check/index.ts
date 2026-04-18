import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify JWT authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const healthChecks: Array<{
      service: string;
      status: string;
      responseTime?: number;
      error?: string;
    }> = [];

    // Database health check
    try {
      const t0 = performance.now();
      const { error } = await supabase.from('profiles').select('count').limit(1);
      healthChecks.push({
        service: 'database',
        status: error ? 'unhealthy' : 'healthy',
        responseTime: performance.now() - t0,
        error: error?.message,
      });
    } catch (error) {
      healthChecks.push({
        service: 'database',
        status: 'unhealthy',
        error: (error as Error).message,
      });
    }

    // External provider readiness — just verify secret presence (avoids quota burn).
    const apiChecks = [
      { name: 'CommodityPriceAPI', key: 'COMMODITYPRICE_API_KEY' },
      { name: 'OilPriceAPI', key: 'OIL_PRICE_API_KEY' },
      { name: 'Alpha Vantage', key: 'ALPHA_VANTAGE_API_KEY' },
      { name: 'FRED API', key: 'FRED_API_KEY' },
    ];

    for (const apiCheck of apiChecks) {
      const apiKey = Deno.env.get(apiCheck.key);
      healthChecks.push({
        service: apiCheck.name,
        status: apiKey ? 'configured' : 'not_configured',
      });
    }

    // Overall health status
    const overallStatus = healthChecks.every(
      (check) => check.status === 'healthy' || check.status === 'configured'
    )
      ? 'healthy'
      : 'degraded';

    return new Response(
      JSON.stringify({
        status: overallStatus,
        timestamp: new Date().toISOString(),
        checks: healthChecks,
        version: '1.1.0',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: overallStatus === 'healthy' ? 200 : 503,
      }
    );
  } catch (error) {
    console.error('Health check error:', error);
    return new Response(
      JSON.stringify({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Internal health check error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 503,
      }
    );
  }
})
