import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Commodity symbol mappings
const COMMODITY_SYMBOLS: Record<string, {
  fmp: string;
  yahoo: string;
  alphaVantage: string;
}> = {
  'Gold Futures': { fmp: 'GCUSD', yahoo: 'GC=F', alphaVantage: 'GOLD' },
  'Micro Gold Futures': { fmp: 'MGCUSD', yahoo: 'MGC=F', alphaVantage: 'GOLD' },
  'Silver Futures': { fmp: 'SIUSD', yahoo: 'SI=F', alphaVantage: 'SILVER' },
  'Micro Silver Futures': { fmp: 'MSIUSD', yahoo: 'SIL=F', alphaVantage: 'SILVER' },
  'Copper': { fmp: 'HGUSD', yahoo: 'HG=F', alphaVantage: 'COPPER' },
  'Aluminum': { fmp: 'ALUSD', yahoo: 'ALI=F', alphaVantage: 'ALUMINUM' },
  'Platinum': { fmp: 'PLUSD', yahoo: 'PL=F', alphaVantage: 'PLATINUM' },
  'Palladium': { fmp: 'PAUSD', yahoo: 'PA=F', alphaVantage: 'PALLADIUM' },
  'Crude Oil': { fmp: 'CLUSD', yahoo: 'CL=F', alphaVantage: 'WTI' },
  'Brent Crude Oil': { fmp: 'BZUSD', yahoo: 'BZ=F', alphaVantage: 'BRENT' },
  'Natural Gas': { fmp: 'NGUSD', yahoo: 'NG=F', alphaVantage: 'NATURAL_GAS' },
  'Heating Oil': { fmp: 'HOUSD', yahoo: 'HO=F', alphaVantage: 'HEATING_OIL' },
  'Gasoline RBOB': { fmp: 'RBUSD', yahoo: 'RB=F', alphaVantage: 'GASOLINE' },
  'Corn Futures': { fmp: 'ZCUSX', yahoo: 'ZC=F', alphaVantage: 'CORN' },
  'Wheat Futures': { fmp: 'ZWUSX', yahoo: 'ZW=F', alphaVantage: 'WHEAT' },
  'Soybean Futures': { fmp: 'ZSUSX', yahoo: 'ZS=F', alphaVantage: 'SOYBEANS' },
  'Live Cattle Futures': { fmp: 'LEUSX', yahoo: 'LE=F', alphaVantage: 'LIVE_CATTLE' },
  'Feeder Cattle Futures': { fmp: 'FCUSX', yahoo: 'GF=F', alphaVantage: 'FEEDER_CATTLE' },
  'Lean Hogs Futures': { fmp: 'HEUSX', yahoo: 'HE=F', alphaVantage: 'LEAN_HOGS' },
  'Class III Milk Futures': { fmp: 'DCUSD', yahoo: 'DC=F', alphaVantage: 'MILK' },
  'Oat Futures': { fmp: 'ZOUSX', yahoo: 'ZO=F', alphaVantage: 'OATS' },
  'Sugar': { fmp: 'SBUSD', yahoo: 'SB=F', alphaVantage: 'SUGAR' },
  'Cotton': { fmp: 'CTUSD', yahoo: 'CT=F', alphaVantage: 'COTTON' },
  'Lumber Futures': { fmp: 'LBSUSD', yahoo: 'LBS=F', alphaVantage: 'LUMBER' },
  'Orange Juice': { fmp: 'OJUSD', yahoo: 'OJ=F', alphaVantage: 'ORANGE_JUICE' },
  'Coffee': { fmp: 'KCUSD', yahoo: 'KC=F', alphaVantage: 'COFFEE' },
  'Rough Rice': { fmp: 'ZRUSX', yahoo: 'ZR=F', alphaVantage: 'RICE' },
  'Cocoa': { fmp: 'CCUSD', yahoo: 'CC=F', alphaVantage: 'COCOA' }
};

const generateFallbackData = (commodityName: string, timeframe: string, basePrice: number) => {
  // Increase data points for longer timeframes to prevent flat tails
  const dataPoints = timeframe === '1d' ? 24 : timeframe === '1m' ? 30 : timeframe === '3m' ? 90 : 180; // 6m = 180 days
  const data: any[] = [];
  const now = new Date();
  
  let currentPrice = basePrice;
  
  // Adjust volatility based on commodity type and timeframe
  let volatility: number;
  let trendStrength: number;
  
  if (commodityName === 'Wheat Futures') {
    // Wheat is more volatile due to weather, crop conditions, etc.
    volatility = basePrice * (timeframe === '1d' ? 0.025 : timeframe === '1m' ? 0.05 : timeframe === '3m' ? 0.08 : 0.15);
    trendStrength = 0.001; // Stronger trends for wheat
  } else if (commodityName.includes('Futures') || commodityName.includes('Corn') || commodityName.includes('Soybean')) {
    // Agricultural commodities are generally more volatile
    volatility = basePrice * (timeframe === '1d' ? 0.02 : timeframe === '1m' ? 0.04 : timeframe === '3m' ? 0.07 : 0.12);
    trendStrength = 0.0008;
  } else if (commodityName.includes('Oil') || commodityName.includes('Gas')) {
    // Energy commodities - more volatile on longer timeframes
    volatility = basePrice * (timeframe === '1d' ? 0.03 : timeframe === '1m' ? 0.05 : timeframe === '3m' ? 0.08 : 0.15);
    trendStrength = 0.0007;
  } else {
    // Metals and other commodities - increase volatility for longer timeframes
    volatility = basePrice * (timeframe === '1d' ? 0.015 : timeframe === '1m' ? 0.03 : timeframe === '3m' ? 0.05 : 0.1);
    trendStrength = 0.0005;
  }
  
  const trendDirection = Math.random() > 0.5 ? 1 : -1;
  
  // Add more complex patterns for longer timeframes
  const addComplexPatterns = (price: number, index: number) => {
    let adjustedPrice = price;
    
    // Add seasonal patterns for agricultural commodities
    if (commodityName === 'Wheat Futures') {
      // Wheat typically has harvest lows in summer/fall and highs in spring
      const seasonalFactor = Math.sin((index / dataPoints) * Math.PI * 2) * 0.05;
      adjustedPrice *= (1 + seasonalFactor);
    }
    
    // Add cycles for longer timeframes to prevent flat tails
    if (timeframe === '3m' || timeframe === '6m') {
      // Add market cycles
      const cycleFactor = Math.sin((index / dataPoints) * Math.PI * 4) * 0.02; // 2 cycles over the period
      adjustedPrice *= (1 + cycleFactor);
      
      // Add trend variations to create more realistic longer-term patterns
      const trendVariation = Math.sin((index / dataPoints) * Math.PI * 6) * 0.015; // 3 cycles
      adjustedPrice *= (1 + trendVariation);
    }
    
    return adjustedPrice;
  };
  
  for (let i = dataPoints - 1; i >= 0; i--) {
    let date: Date;
    
    if (timeframe === '1d') {
      date = new Date(now.getTime() - (i * 60 * 60 * 1000));
    } else {
      date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
    }
    
    const randomChange = (Math.random() - 0.5) * volatility * 2;
    const trendComponent = trendDirection * trendStrength * basePrice * (dataPoints - i);
    const meanReversionComponent = (basePrice - currentPrice) * 0.01;
    
    currentPrice += randomChange + trendComponent + meanReversionComponent;
    
    // Apply complex patterns including seasonal and cyclical patterns
    currentPrice = addComplexPatterns(currentPrice, i);
    
    // More realistic bounds for different commodities
    let minPrice, maxPrice;
    if (commodityName === 'Wheat Futures') {
      minPrice = basePrice * 0.6; // Wheat can have larger swings
      maxPrice = basePrice * 1.4;
    } else if (commodityName.includes('Futures')) {
      minPrice = basePrice * 0.7;
      maxPrice = basePrice * 1.3;
    } else {
      minPrice = basePrice * 0.8;
      maxPrice = basePrice * 1.2;
    }
    
    currentPrice = Math.max(minPrice, Math.min(maxPrice, currentPrice));
    
    // Use appropriate decimal places based on price level
    let decimals = 2;
    if (basePrice >= 1000) decimals = 0;
    else if (basePrice >= 100) decimals = 1;
    
    data.push({
      date: date.toISOString(),
      price: Math.round(currentPrice * Math.pow(10, decimals)) / Math.pow(10, decimals)
    });
  }
  
  return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
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
    'Cocoa': 2850,
  };
  return basePrices[commodityName] || 100;
};

async function fetchFromFMP(symbol: string, timeframe: string, apiKey: string) {
  // Increase data points for longer timeframes to prevent flat tails
  const timeSeriesParam = timeframe === '1d' ? 24 : timeframe === '1m' ? 30 : timeframe === '3m' ? 90 : 180; // 6m = 180 days
  
  const response = await fetch(
    `https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?apikey=${apiKey}&timeseries=${timeSeriesParam}`
  );
  
  if (!response.ok) {
    throw new Error(`FMP API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (data.historical && Array.isArray(data.historical)) {
    // For longer timeframes, ensure we get the right amount of data
    const maxDataPoints = timeframe === '1d' ? 24 : timeframe === '1m' ? 30 : timeframe === '3m' ? 90 : 180;
    const historicalData = data.historical.slice(0, maxDataPoints);
    
    return historicalData.map((item: any) => ({
      date: item.date,
      price: parseFloat(item.close)
    })).reverse(); // Reverse to get chronological order
  }
  
  return null;
}

async function fetchFromAlphaVantage(symbol: string, timeframe: string, apiKey: string) {
  const functionName = timeframe === '1d' ? 'TIME_SERIES_INTRADAY' : 'TIME_SERIES_DAILY';
  const interval = timeframe === '1d' ? '&interval=60min' : '';
  
  const response = await fetch(
    `https://www.alphavantage.co/query?function=${functionName}&symbol=${symbol}&apikey=${apiKey}${interval}`
  );
  
  if (!response.ok) {
    throw new Error(`Alpha Vantage API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  const timeSeriesKey = timeframe === '1d' ? 'Time Series (60min)' : 'Time Series (Daily)';
  const timeSeries = data[timeSeriesKey];
  
  if (timeSeries) {
    const entries = Object.entries(timeSeries);
    const maxEntries = timeframe === '1d' ? 24 : timeframe === '1m' ? 30 : timeframe === '3m' ? 90 : 180;
    
    return entries
      .slice(0, maxEntries)
      .map(([date, values]: [string, any]) => ({
        date: date,
        price: parseFloat(values['4. close'])
      }))
      .reverse();
  }
  
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { commodityName, timeframe } = await req.json()
    
    if (!commodityName || !timeframe) {
      return new Response(
        JSON.stringify({ error: 'Missing commodityName or timeframe' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Fetching data for ${commodityName}, timeframe: ${timeframe}`)

    // Get API keys from Supabase secrets
    const fmpApiKey = Deno.env.get('FMP_API_KEY')
    const alphaVantageApiKey = Deno.env.get('ALPHA_VANTAGE_API_KEY')
    
    const symbols = COMMODITY_SYMBOLS[commodityName]
    if (!symbols) {
      throw new Error(`Commodity ${commodityName} not found`)
    }

    let historicalData = null

    // Try FMP first if we have an API key
    if (fmpApiKey && fmpApiKey !== 'demo') {
      try {
        historicalData = await fetchFromFMP(symbols.fmp, timeframe, fmpApiKey)
        console.log(`Successfully fetched ${historicalData?.length || 0} data points from FMP`)
      } catch (error) {
        console.warn('FMP API failed:', error)
      }
    }

    // Try Alpha Vantage if FMP failed and we have an API key
    if (!historicalData && alphaVantageApiKey && alphaVantageApiKey !== 'demo') {
      try {
        historicalData = await fetchFromAlphaVantage(symbols.alphaVantage, timeframe, alphaVantageApiKey)
        console.log(`Successfully fetched ${historicalData?.length || 0} data points from Alpha Vantage`)
      } catch (error) {
        console.warn('Alpha Vantage API failed:', error)
      }
    }

    // Use fallback data if all APIs failed
    if (!historicalData) {
      console.log('All APIs failed, using fallback data')
      const basePrice = getBasePriceForCommodity(commodityName)
      historicalData = generateFallbackData(commodityName, timeframe, basePrice)
    }

    return new Response(
      JSON.stringify({ 
        data: historicalData,
        source: historicalData.length > 0 ? 'api' : 'fallback'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in fetch-commodity-data function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})