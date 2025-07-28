import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Common commodities to compare between both APIs
const COMPARISON_COMMODITIES = [
  'Crude Oil',
  'Brent Crude Oil', 
  'Gold Futures',
  'Silver Futures',
  'Natural Gas',
  'Copper',
  'Wheat Futures',
  'Corn Futures'
];

// CommodityPriceAPI symbols
const COMMODITY_PRICE_API_SYMBOLS: Record<string, string> = {
  'Crude Oil': 'WTIOIL',
  'Brent Crude Oil': 'BRENTOIL',
  'Gold Futures': 'XAU',
  'Silver Futures': 'XAG',
  'Natural Gas': 'NG',
  'Copper': 'HG',
  'Wheat Futures': 'ZW',
  'Corn Futures': 'CORN'
};

// FMP symbols  
const FMP_SYMBOLS: Record<string, string> = {
  'Crude Oil': 'CL=F',
  'Brent Crude Oil': 'BZ=F',
  'Gold Futures': 'GC=F',
  'Silver Futures': 'SI=F',
  'Natural Gas': 'NG=F',
  'Copper': 'HG=F',
  'Wheat Futures': 'ZW=F',
  'Corn Futures': 'ZC=F'
};

interface PriceComparison {
  commodity: string;
  commodityPriceAPI: {
    price: number | null;
    error?: string;
    unit?: string;
  };
  fmp: {
    price: number | null;
    error?: string;
    change?: number;
    changePercent?: number;
  };
  difference: {
    absolute: number | null;
    percentage: number | null;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify authentication
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('subscription_active, subscription_tier')
      .eq('id', user.id)
      .single();

    const isPremium = profile?.subscription_active && profile?.subscription_tier !== 'free';
    
    if (!isPremium) {
      return new Response(
        JSON.stringify({ error: 'Premium subscription required for API comparison' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const comparisons: PriceComparison[] = [];

    // Get secrets
    const COMMODITY_API_KEY = Deno.env.get('COMMODITYPRICE_API_KEY');
    const FMP_API_KEY = Deno.env.get('FMP_API_KEY');

    for (const commodity of COMPARISON_COMMODITIES) {
      const comparison: PriceComparison = {
        commodity,
        commodityPriceAPI: { price: null },
        fmp: { price: null },
        difference: { absolute: null, percentage: null }
      };

      // Fetch from CommodityPriceAPI
      if (COMMODITY_API_KEY && COMMODITY_PRICE_API_SYMBOLS[commodity]) {
        try {
          const commoditySymbol = COMMODITY_PRICE_API_SYMBOLS[commodity];
          const commodityResponse = await fetch(
            `https://api.commoditypriceapi.com/v1/latest?access_key=${COMMODITY_API_KEY}&base=USD&symbols=${commoditySymbol}`
          );
          
          if (commodityResponse.ok) {
            const commodityData = await commodityResponse.json();
            if (commodityData.success && commodityData.data?.[commoditySymbol]) {
              comparison.commodityPriceAPI.price = commodityData.data[commoditySymbol];
              comparison.commodityPriceAPI.unit = commodityData.unit || 'USD';
            } else {
              comparison.commodityPriceAPI.error = 'No data returned';
            }
          } else {
            comparison.commodityPriceAPI.error = `HTTP ${commodityResponse.status}`;
          }
        } catch (error) {
          comparison.commodityPriceAPI.error = error.message;
        }
      } else {
        comparison.commodityPriceAPI.error = 'No API key or symbol mapping';
      }

      // Fetch from FMP
      if (FMP_API_KEY && FMP_SYMBOLS[commodity]) {
        try {
          const fmpSymbol = FMP_SYMBOLS[commodity];
          const fmpResponse = await fetch(
            `https://financialmodelingprep.com/api/v3/quote/${fmpSymbol}?apikey=${FMP_API_KEY}`
          );
          
          if (fmpResponse.ok) {
            const fmpData = await fmpResponse.json();
            if (fmpData && fmpData.length > 0) {
              const quote = fmpData[0];
              comparison.fmp.price = quote.price;
              comparison.fmp.change = quote.change;
              comparison.fmp.changePercent = quote.changesPercentage;
            } else {
              comparison.fmp.error = 'No data returned';
            }
          } else {
            comparison.fmp.error = `HTTP ${fmpResponse.status}`;
          }
        } catch (error) {
          comparison.fmp.error = error.message;
        }
      } else {
        comparison.fmp.error = 'No API key or symbol mapping';
      }

      // Calculate differences
      if (comparison.commodityPriceAPI.price && comparison.fmp.price) {
        const apiPrice = comparison.commodityPriceAPI.price;
        const fmpPrice = comparison.fmp.price;
        
        comparison.difference.absolute = Math.abs(apiPrice - fmpPrice);
        comparison.difference.percentage = Math.abs(((apiPrice - fmpPrice) / fmpPrice) * 100);
      }

      comparisons.push(comparison);
    }

    // Sort by largest percentage difference
    comparisons.sort((a, b) => {
      const aDiff = a.difference.percentage || 0;
      const bDiff = b.difference.percentage || 0;
      return bDiff - aDiff;
    });

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        comparisons,
        summary: {
          totalCompared: comparisons.length,
          bothAPIsWorking: comparisons.filter(c => c.commodityPriceAPI.price && c.fmp.price).length,
          largestDifference: comparisons[0]?.difference.percentage || 0
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error comparing API prices:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});