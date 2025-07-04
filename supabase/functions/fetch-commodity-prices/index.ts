import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Commodity symbol mappings - FMP only
const COMMODITY_SYMBOLS: Record<string, string> = {
  'Gold Futures': 'GCUSD',
  'Micro Gold Futures': 'MGCUSD',
  'Silver Futures': 'SIUSD',
  'Micro Silver Futures': 'MSIUSD',
  'Copper': 'HGUSD',
  'Aluminum': 'ALUSD',
  'Platinum': 'PLUSD',
  'Palladium': 'PAUSD',
  'Crude Oil': 'CLUSD',
  'Brent Crude Oil': 'BZUSD',
  'Natural Gas': 'NGUSD',
  'Heating Oil': 'HOUSD',
  'Gasoline RBOB': 'RBUSD',
  'Corn Futures': 'ZCUSX',
  'Wheat Futures': 'ZWUSX',
  'Soybean Futures': 'ZSUSX',
  'Live Cattle Futures': 'LEUSX',
  'Feeder Cattle Futures': 'FCUSX',
  'Lean Hogs Futures': 'HEUSX',
  'Class III Milk Futures': 'DCUSD',
  'Oat Futures': 'ZOUSX',
  'Sugar': 'SBUSD',
  'Cotton': 'CTUSD',
  'Lumber Futures': 'LBSUSD',
  'Orange Juice': 'OJUSD',
  'Coffee': 'KCUSD',
  'Rough Rice': 'ZRUSX',
  'Cocoa': 'CCUSD'
};

const getBasePriceForCommodity = (commodityName: string): number => {
  const basePrices: Record<string, number> = {
    'Gold Futures': 2000,
    'Micro Gold Futures': 2000,
    'Silver Futures': 25,
    'Micro Silver Futures': 25,
    'Copper': 4.2,
    'Aluminum': 2.2,
    'Platinum': 950,
    'Palladium': 1800,
    'Crude Oil': 65,
    'Brent Crude Oil': 67,
    'Natural Gas': 2.85,
    'Gasoline RBOB': 2.1,
    'Heating Oil': 2.3,
    'Corn Futures': 430,
    'Wheat Futures': 550,
    'Soybean Futures': 1150,
    'Live Cattle Futures': 170,
    'Feeder Cattle Futures': 240,
    'Lean Hogs Futures': 75,
    'Class III Milk Futures': 20.85,
    'Oat Futures': 385,
    'Sugar': 19.75,
    'Cotton': 72.80,
    'Lumber Futures': 485,
    'Orange Juice': 315,
    'Coffee': 165,
    'Rough Rice': 16.25,
    'Cocoa': 2850
  };
  return basePrices[commodityName] || 100;
};

async function fetchPriceFromFMP(symbol: string, apiKey: string) {
  const response = await fetch(
    `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${apiKey}`
  );
  
  if (!response.ok) {
    throw new Error(`FMP API error: ${response.status}`);
  }
  
  const data = await response.json();
  if (!Array.isArray(data) || data.length === 0) return null;
  
  const quote = data[0];
  return {
    symbol: symbol,
    price: parseFloat(quote.price) || 0,
    change: parseFloat(quote.change) || 0,
    changePercent: parseFloat(quote.changesPercentage) || 0,
    lastUpdate: new Date().toISOString()
  };
}

// Removed Alpha Vantage API - using FMP API only for consistency

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { commodityName } = await req.json()
    
    if (!commodityName) {
      return new Response(
        JSON.stringify({ error: 'Missing commodityName' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Fetching current price for ${commodityName}`)

    // Get FMP API key from Supabase secrets
    const fmpApiKey = Deno.env.get('FMP_API_KEY')
    
    const symbol = COMMODITY_SYMBOLS[commodityName]
    if (!symbol) {
      throw new Error(`Commodity ${commodityName} not found`)
    }

    let priceData = null

    // Try FMP API if we have an API key
    if (fmpApiKey && fmpApiKey !== 'demo') {
      try {
        priceData = await fetchPriceFromFMP(symbol, fmpApiKey)
        console.log(`Successfully fetched price from FMP for ${commodityName}:`, priceData)
      } catch (error) {
        console.warn(`FMP API failed for ${commodityName}:`, error)
      }
    } else {
      console.log('No FMP API key configured, using fallback data')
    }

    // Use fallback data if FMP API failed
    if (!priceData) {
      console.log(`Using fallback price data for ${commodityName}`)
      const basePrice = getBasePriceForCommodity(commodityName)
      priceData = {
        symbol: symbol,
        price: basePrice,
        change: (Math.random() - 0.5) * basePrice * 0.02,
        changePercent: (Math.random() - 0.5) * 4,
        lastUpdate: new Date().toISOString()
      }
    }

    return new Response(
      JSON.stringify({ 
        price: priceData,
        source: priceData && fmpApiKey && fmpApiKey !== 'demo' ? 'fmp' : 'fallback',
        commodity: commodityName,
        symbol: symbol
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in fetch-commodity-prices function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})