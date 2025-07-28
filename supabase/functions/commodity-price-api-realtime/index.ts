import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CommodityPriceAPIResponse {
  success: boolean;
  timestamp?: number;
  rates?: Record<string, number>;
  metaData?: Record<string, { unit: string; quote: string }>;
  plan?: string;
  quota?: number;
  used?: number;
  error?: string;
  message?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Verify user authentication
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Verify premium subscription
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('subscription_active, subscription_tier')
      .eq('id', user.id)
      .single()

    if (!profile?.subscription_active || profile.subscription_tier !== 'premium') {
      return new Response(
        JSON.stringify({ error: 'Premium subscription required' }),
        {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const { apiKey, symbols, action } = await req.json()

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const baseUrl = 'https://api.commoditypriceapi.com/v2'
    let endpoint: string
    let url: string

    if (action === 'usage') {
      endpoint = 'usage'
      url = `${baseUrl}/${endpoint}`
    } else if (action === 'symbols') {
      endpoint = 'symbols'
      url = `${baseUrl}/${endpoint}`
    } else {
      // Default to latest rates
      endpoint = 'rates/latest'
      if (!symbols) {
        return new Response(
          JSON.stringify({ error: 'Symbols are required for rate requests' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }
      url = `${baseUrl}/${endpoint}?symbols=${symbols}`
    }

    // Make request to CommodityPriceAPI
    const response = await fetch(url, {
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json() as CommodityPriceAPIResponse
      return new Response(
        JSON.stringify({ 
          error: errorData.error || 'API request failed',
          message: errorData.message || `HTTP ${response.status}`
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const data = await response.json() as CommodityPriceAPIResponse

    return new Response(
      JSON.stringify(data),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error in commodity-price-api-realtime function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})