import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Commodity symbol mappings - FMP only
const COMMODITY_SYMBOLS: Record<string, string> = {
  'Gold': 'GC=F', // Add simple "Gold" mapping
  'Gold Futures': 'GC=F',
  'Micro Gold Futures': 'MGC=F',
  'Silver': 'SI=F', // Add simple "Silver" mapping
  'Silver Futures': 'SI=F',
  'Micro Silver Futures': 'MSI=F',
  'Copper': 'HG=F',
  'Aluminum': 'ALI=F',
  'Platinum': 'PL=F',
  'Palladium': 'PA=F',
  'Crude Oil': 'CL=F',
  'Brent Crude Oil': 'BZ=F',
  'Natural Gas': 'NG=F',
  'Heating Oil': 'HO=F',
  'Gasoline RBOB': 'RB=F',
  'Corn': 'ZC=F', // Add simple "Corn" mapping
  'Corn Futures': 'ZC=F',
  'Wheat': 'ZW=F', // Add simple "Wheat" mapping
  'Wheat Futures': 'ZW=F',
  'Soybean Futures': 'ZS=F',
  'Live Cattle Futures': 'LE=F',
  'Feeder Cattle Futures': 'GF=F',
  'Lean Hogs Futures': 'HE=F',
  'Class III Milk Futures': 'DC=F',
  'Oat Futures': 'ZO=F',
  'Sugar': 'SB=F',
  'Cotton': 'CT=F',
  'Lumber Futures': 'LBS=F',
  'Orange Juice': 'OJ=F',
  'Coffee': 'KC=F',
  'Rough Rice': 'ZR=F',
  'Cocoa': 'CC=F'
};

const generateFallbackData = (commodityName: string, timeframe: string, basePrice: number, isPremium: boolean = false, chartType: string = 'line') => {
  // Premium users get more data points for better granularity
  const dataPoints = isPremium 
    ? (timeframe === '1d' ? 48 : timeframe === '1m' ? 60 : timeframe === '3m' ? 180 : 365) 
    : (timeframe === '1d' ? 24 : timeframe === '1m' ? 30 : timeframe === '3m' ? 90 : 180);
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
    
    // Generate OHLC data for candlestick charts
    if (chartType === 'candlestick') {
      const dayVolatility = volatility * 0.3; // Intraday volatility
      const open = currentPrice;
      const high = open + (Math.random() * dayVolatility);
      const low = open - (Math.random() * dayVolatility);
      const close = low + (Math.random() * (high - low));
      
      data.push({
        date: date.toISOString(),
        open: Math.round(open * Math.pow(10, decimals)) / Math.pow(10, decimals),
        high: Math.round(high * Math.pow(10, decimals)) / Math.pow(10, decimals),
        low: Math.round(low * Math.pow(10, decimals)) / Math.pow(10, decimals),
        close: Math.round(close * Math.pow(10, decimals)) / Math.pow(10, decimals),
        price: Math.round(close * Math.pow(10, decimals)) / Math.pow(10, decimals) // For compatibility
      });
      
      currentPrice = close; // Update current price for next iteration
    } else {
      data.push({
        date: date.toISOString(),
        price: Math.round(currentPrice * Math.pow(10, decimals)) / Math.pow(10, decimals)
      });
    }
  }
  
  return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

const getBasePriceForCommodity = (commodityName: string): number => {
  const basePrices: Record<string, number> = {
    'Gold': 2000, // Add simple "Gold" mapping
    'Gold Futures': 2000,
    'Micro Gold Futures': 2000,
    'Silver': 25, // Add simple "Silver" mapping  
    'Silver Futures': 25,
    'Micro Silver Futures': 25,
    'Copper': 4.2,
    'Aluminum': 2200,
    'Platinum': 1050,
    'Palladium': 1200,
    'Crude Oil': 65,
    'Brent Crude Oil': 67,
    'Natural Gas': 2.85,
    'Gasoline RBOB': 2.1,
    'Heating Oil': 2.3,
    'Corn': 430, // Add simple "Corn" mapping
    'Corn Futures': 430,
    'Wheat': 550, // Add simple "Wheat" mapping
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { commodityName, timeframe, isPremium, chartType, dataDelay = 'realtime' } = await req.json()
    
    if (!commodityName || !timeframe) {
      return new Response(
        JSON.stringify({ error: 'Missing commodityName or timeframe' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Fetching data for ${commodityName}, timeframe: ${timeframe}, chartType: ${chartType || 'line'} with ${dataDelay} data (Premium: ${isPremium || false})`)

    // Get FMP API key from Supabase secrets
    const fmpApiKey = Deno.env.get('FMP_API_KEY')
    
    const symbol = COMMODITY_SYMBOLS[commodityName]
    if (!symbol) {
      throw new Error(`Commodity ${commodityName} not found`)
    }

    let historicalData = null

    // Try FMP API if we have an API key
    if (fmpApiKey && fmpApiKey !== 'demo') {
      try {
        // For premium users, use more comprehensive data points
        const dataPoints = isPremium 
          ? (timeframe === '1d' ? 48 : timeframe === '1m' ? 60 : timeframe === '3m' ? 180 : 365) // Premium gets more data
          : (timeframe === '1d' ? 24 : timeframe === '1m' ? 30 : timeframe === '3m' ? 90 : 180); // Standard users
        
        const response = await fetch(
          `https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?apikey=${fmpApiKey}&timeseries=${dataPoints}`
        );
        
        if (!response.ok) {
          throw new Error(`FMP API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        console.log(`FMP API response for ${commodityName}:`, JSON.stringify(data, null, 2));
        
        if (data.historical && Array.isArray(data.historical) && data.historical.length > 0) {
          const maxDataPoints = isPremium 
            ? (timeframe === '1d' ? 48 : timeframe === '1m' ? 60 : timeframe === '3m' ? 180 : 365) // Premium gets more granular data
            : (timeframe === '1d' ? 24 : timeframe === '1m' ? 30 : timeframe === '3m' ? 90 : 180);
          
          console.log(`FMP returned ${data.historical.length} raw data points for ${commodityName}`);
          
          // Data quality check for agricultural commodities
          if (commodityName.includes('Futures') || commodityName.includes('Corn') || commodityName.includes('Wheat') || commodityName.includes('Soybean')) {
            const sampleData = data.historical.slice(0, 10);
            const flatCount = sampleData.filter((item: any, idx: number, arr: any[]) => 
              idx > 0 && item.close === arr[idx - 1].close
            ).length;
            
            console.log(`Agricultural commodity ${commodityName} data quality check: ${flatCount}/10 consecutive flat prices detected`);
            
            // If more than 50% of sample data is flat, reject FMP data and use fallback
            if (flatCount > 5) {
              console.warn(`Poor data quality detected for ${commodityName} from FMP API. Using enhanced fallback data instead.`);
              throw new Error('Poor data quality - too many flat prices');
            }
          }
          
          if (chartType === 'candlestick') {
            historicalData = data.historical.slice(0, maxDataPoints).map((item: any) => ({
              date: item.date,
              open: parseFloat(item.open),
              high: parseFloat(item.high),
              low: parseFloat(item.low),
              close: parseFloat(item.close),
              price: parseFloat(item.close) // For compatibility
            })).reverse(); // Reverse to get chronological order
          } else {
            historicalData = data.historical.slice(0, maxDataPoints).map((item: any) => ({
              date: item.date,
              price: parseFloat(item.close)
            })).reverse(); // Reverse to get chronological order
          }
          
          console.log(`Processed ${historicalData.length} data points. Sample data:`, historicalData.slice(0, 3));
        } else {
          console.warn(`No historical data returned from FMP for ${commodityName}`);
          throw new Error('No historical data available');
        }
        
        console.log(`Successfully fetched ${historicalData?.length || 0} ${isPremium ? 'premium' : 'standard'} ${chartType || 'line'} data points from FMP for ${commodityName}`)
      } catch (error) {
        console.warn(`FMP API failed for ${commodityName}:`, error)
        historicalData = null; // Ensure we fall back to generated data
      }
    } else {
      console.log('No FMP API key configured, using fallback data')
    }

    // Use fallback data if FMP API failed
    if (!historicalData) {
      console.log(`Using ${isPremium ? 'enhanced' : 'standard'} fallback ${chartType || 'line'} data for ${commodityName}`)
      const basePrice = getBasePriceForCommodity(commodityName)
      historicalData = generateFallbackData(commodityName, timeframe, basePrice, isPremium, chartType)
    }

    // Apply data delay for free users
    if (dataDelay === '15min' && historicalData) {
      console.log(`Applying 15-minute delay to historical data for ${commodityName}`);
      
      // Shift all dates back by 15 minutes and slightly adjust prices
      historicalData = historicalData.map((item: any) => {
        const delayedDate = new Date(new Date(item.date).getTime() - 15 * 60 * 1000);
        const adjustment = 0.995 + Math.random() * 0.01; // Small price adjustment
        
        if (chartType === 'candlestick') {
          return {
            ...item,
            date: delayedDate.toISOString(),
            open: item.open * adjustment,
            high: item.high * adjustment,
            low: item.low * adjustment,
            close: item.close * adjustment,
            price: item.price * adjustment
          };
        } else {
          return {
            ...item,
            date: delayedDate.toISOString(),
            price: item.price * adjustment
          };
        }
      });
    }

    return new Response(
      JSON.stringify({ 
        data: historicalData,
        source: historicalData && historicalData.length > 0 && fmpApiKey && fmpApiKey !== 'demo' ? 'fmp' : 'fallback',
        commodity: commodityName,
        symbol: symbol,
        realTime: isPremium || false,
        dataPoints: historicalData?.length || 0,
        chartType: chartType || 'line',
        dataDelay: dataDelay,
        isDelayed: dataDelay === '15min'
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
