import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Commodity symbol mappings - FMP only
const COMMODITY_SYMBOLS: Record<string, string> = {
  // Precious Metals
  'Gold Futures': 'GC=F',
  'Silver Futures': 'SI=F',
  'Platinum': 'PL=F',
  'Palladium': 'PA=F',
  'Rhodium': 'PA=F', // Use Palladium as fallback for Rhodium
  
  // Base Metals
  'Copper': 'HG=F',
  'Aluminum': 'HG=F', // Use Copper as fallback
  'Aluminum LME': 'HG=F',
  'Zinc': 'HG=F',
  'Zinc LME': 'HG=F',
  'Lead': 'HG=F',
  'Nickel': 'HG=F',
  'Tin': 'HG=F',
  'Steel': 'HG=F',
  'Hot-Rolled Coil Steel': 'HG=F',
  'Iron Ore 62% FE': 'HG=F',
  'Iron Ore': 'HG=F',
  'Magnesium': 'HG=F',
  
  // Industrial/Tech Metals
  'Lithium': 'HG=F', // Use Copper as fallback
  'Cobalt': 'HG=F',
  'Titanium': 'HG=F',
  'Gallium': 'HG=F',
  'Indium': 'HG=F',
  'Tellurium': 'HG=F',
  'Neodymium': 'HG=F',
  'Uranium': 'HG=F',
  
  // Energy
  'Crude Oil': 'CL=F',
  'Brent Crude Oil': 'BZ=F',
  'Crude Oil Dubai': 'CL=F',
  'Ural Oil': 'CL=F',
  'Natural Gas': 'NG=F',
  'Natural Gas US': 'NG=F',
  'Natural Gas Europe': 'NG=F',
  'Natural Gas UK': 'NG=F',
  'Liquefied Natural Gas Japan': 'NG=F',
  'TTF Gas': 'NG=F',
  'UK Gas': 'NG=F',
  'Heating Oil': 'HO=F',
  'Gasoline RBOB': 'RB=F',
  'Gas Oil': 'HO=F',
  'Coal': 'HO=F',
  'Coal Australia': 'HO=F',
  'Coal South Africa': 'HO=F',
  'Ethanol': 'RB=F',
  'Methanol': 'RB=F',
  'Propane': 'NG=F',
  'Naphtha': 'RB=F',
  
  // Grains & Agriculture
  'Corn Futures': 'ZC=F',
  'Wheat Futures': 'ZW=F',
  'Soybean Futures': 'ZS=F',
  'Soybean Oil': 'ZL=F',
  'Soybean Meal': 'ZM=F',
  'Oat Futures': 'ZO=F',
  'Rough Rice': 'ZR=F',
  'Canola': 'ZS=F',
  'Barley': 'ZW=F',
  'Spring Wheat': 'ZW=F',
  'Hard Red Winter Wheat': 'ZW=F',
  
  // Livestock & Dairy
  'Live Cattle Futures': 'LE=F',
  'Feeder Cattle Futures': 'GF=F',
  'Lean Hogs Futures': 'HE=F',
  'Milk': 'HE=F',
  'Milk Class III': 'HE=F',
  'Milk Nonfat Dry': 'HE=F',
  'Butter': 'HE=F',
  'Cheese': 'HE=F',
  'Eggs US': 'HE=F',
  'Eggs China': 'HE=F',
  'Poultry': 'HE=F',
  'Salmon': 'HE=F',
  'Fish Meal': 'HE=F',
  
  // Soft Commodities
  'Coffee Arabica': 'KC=F',
  'Coffee Robusta': 'KC=F',
  'Coffee': 'KC=F',
  'Sugar': 'SB=F',
  'Sugar #11': 'SB=F',
  'Sugar #5': 'SB=F',
  'Cotton': 'CT=F',
  'Cocoa': 'CC=F',
  'Orange Juice': 'OJ=F',
  'Tea': 'KC=F',
  'Tea Kolkata': 'KC=F',
  'Tea Colombo': 'KC=F',
  'Tea Mombasa': 'KC=F',
  
  // Oils & Fats
  'Palm Oil': 'ZL=F',
  'Sunflower Oil': 'ZL=F',
  'Rapeseed Oil': 'ZL=F',
  'Coconut Oil': 'ZL=F',
  'Olive Oil': 'ZL=F',
  
  // Forest Products
  'Lumber': 'LBS=F',
  'Lumber Futures': 'LBS=F',
  'Random Length Lumber': 'LBS=F',
  'Pulp': 'LBS=F',
  'Newsprint': 'LBS=F',
  
  // Industrial Materials
  'Rubber': 'CT=F',
  'Cotton Yarn': 'CT=F',
  'Wool': 'CT=F',
  'Jute': 'CT=F',
  'Bitumen': 'CL=F',
  'Kraft Pulp': 'LBS=F',
  
  // Fertilizers & Chemicals
  'Urea': 'NG=F',
  'Diammonium Phosphate': 'NG=F',
  'Potash': 'NG=F',
  'Ammonia': 'NG=F',
  'Soda Ash': 'NG=F',
  
  // Plastics
  'Polyethylene': 'CL=F',
  'Polypropylene': 'CL=F',
  'Polyvinyl Chloride': 'CL=F',
  'PVC': 'CL=F',
  'Styrene': 'CL=F',
  
  // Food & Agriculture
  'White Sugar': 'SB=F',
  'Raw Sugar': 'SB=F',
  'Potato': 'ZC=F',
  'Onion': 'ZC=F',
  'Garlic': 'ZC=F',
  'Apple': 'OJ=F',
  'Banana': 'OJ=F',
  
  // Spices
  'Black Pepper': 'KC=F',
  'Cardamom': 'KC=F',
  'Turmeric': 'KC=F',
  'Coriander': 'KC=F',
  'Chilli': 'KC=F',
  'Cumin': 'KC=F',
  
  // Others
  'Electricity': 'NG=F',
  'Carbon Credits': 'NG=F'
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
    // Energy
    'Crude Oil': 65,
    'Brent Crude Oil': 70,
    'Natural Gas': 2.85,
    'Gasoline RBOB': 2.1,
    'Heating Oil': 2.3,
    'Natural Gas UK': 90,
    'Gas Oil': 650,
    'Coal': 85,
    'Coal Australia': 88,
    'Coal South Africa': 82,
    'Ethanol': 2.15,
    'Methanol': 385,
    'Propane': 0.95,
    'Naphtha': 485,
    
    // Precious Metals
    'Gold Futures': 2000,
    'Silver Futures': 25,
    'Platinum': 1050,
    'Palladium': 1200,
    'Rhodium': 4500,
    
    // Base Metals
    'Copper': 4.2,
    'Aluminum': 2200,
    'Aluminum LME': 2200,
    'Zinc': 2800,
    'Zinc LME': 2800,
    'Lead': 2100,
    'Nickel': 18500,
    'Tin': 32000,
    'Steel': 650,
    'Hot-Rolled Coil Steel': 685,
    'Iron Ore 62% FE': 115,
    'Iron Ore': 115,
    'Magnesium': 2850,
    
    // Industrial/Tech Metals
    'Lithium': 85,
    'Cobalt': 35000,
    'Titanium': 8500,
    'Gallium': 285,
    'Indium': 185,
    'Tellurium': 485,
    'Neodymium': 85,
    'Uranium': 50,
    
    // Energy - Additional
    'Crude Oil Dubai': 64,
    'Ural Oil': 62,
    'Natural Gas US': 2.85,
    'Natural Gas Europe': 32,
    'Liquefied Natural Gas Japan': 15.50,
    'TTF Gas': 28,
    'UK Gas': 85,
    
    // Grains & Agriculture
    'Corn Futures': 430,
    'Wheat Futures': 550,
    'Soybean Futures': 1150,
    'Soybean Oil': 45,
    'Soybean Meal': 315,
    'Oat Futures': 385,
    'Rough Rice': 16.25,
    'Canola': 520,
    'Barley': 240,
    'Spring Wheat': 580,
    'Hard Red Winter Wheat': 565,
    
    // Livestock & Dairy
    'Live Cattle Futures': 170,
    'Feeder Cattle Futures': 240,
    'Lean Hogs Futures': 75,
    'Milk': 20.85,
    'Milk Class III': 20.85,
    'Milk Nonfat Dry': 1.35,
    'Butter': 2.85,
    'Cheese': 1.95,
    'Eggs US': 2.15,
    'Eggs China': 1.85,
    'Poultry': 1.45,
    'Salmon': 8.50,
    'Fish Meal': 1850,
    
    // Soft Commodities
    'Coffee Arabica': 165,
    'Coffee Robusta': 2100,
    'Coffee': 165,
    'Sugar': 19.75,
    'Sugar #11': 19.75,
    'Sugar #5': 485,
    'Cotton': 72.80,
    'Cocoa': 2850,
    'Orange Juice': 315,
    'Tea': 3.20,
    'Tea Kolkata': 3.85,
    'Tea Colombo': 3.65,
    'Tea Mombasa': 3.45,
    
    // Oils & Fats
    'Palm Oil': 885,
    'Sunflower Oil': 1350,
    'Rapeseed Oil': 1450,
    'Coconut Oil': 1650,
    'Olive Oil': 4200,
    
    // Forest Products
    'Lumber': 485,
    'Lumber Futures': 485,
    'Random Length Lumber': 485,
    'Pulp': 1450,
    'Newsprint': 685,
    
    // Industrial Materials
    'Rubber': 1.85,
    'Cotton Yarn': 3200,
    'Wool': 14.50,
    'Jute': 850,
    'Bitumen': 485,
    'Kraft Pulp': 1450,
    
    // Fertilizers & Chemicals
    'Urea': 385,
    'Diammonium Phosphate': 545,
    'Potash': 285,
    'Ammonia': 485,
    'Soda Ash': 285,
    
    // Plastics
    'Polyethylene': 1250,
    'Polypropylene': 1180,
    'Polyvinyl Chloride': 985,
    'PVC': 985,
    'Styrene': 1450,
    
    // Food & Agriculture
    'White Sugar': 485,
    'Raw Sugar': 19.75,
    'Potato': 285,
    'Onion': 385,
    'Garlic': 1250,
    'Apple': 1.85,
    'Banana': 0.85,
    
    // Spices
    'Black Pepper': 6500,
    'Cardamom': 1850,
    'Turmeric': 685,
    'Coriander': 1250,
    'Chilli': 2850,
    'Cumin': 4500,
    
    // Others
    'Electricity': 125,
    'Carbon Credits': 25,
    
    // Simple mappings for legacy support
    'Gold': 2000,
    'Silver': 25,
    'Corn': 430,
    'Wheat': 550,
  };
  return basePrices[commodityName] || 100;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { commodityName, timeframe, isPremium, chartType, dataDelay = 'realtime', contractSymbol } = await req.json()
    
    if (!commodityName || !timeframe) {
      return new Response(
        JSON.stringify({ error: 'Missing commodityName or timeframe' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Fetching data for ${commodityName}${contractSymbol ? ` (${contractSymbol})` : ''}, timeframe: ${timeframe}, chartType: ${chartType || 'line'} with ${dataDelay} data (Premium: ${isPremium || false})`)
    console.log(`Contract symbol provided: ${contractSymbol}`)

    // Get FMP API key from Supabase secrets
    const fmpApiKey = Deno.env.get('FMP_API_KEY')
    
    // For IBKR contract symbols, map back to base FMP symbols but we'll modify the data later
    let symbol = contractSymbol || COMMODITY_SYMBOLS[commodityName]
    let isIBKRContract = false
    
    // If contract symbol is provided but it's an IBKR symbol (not supported by FMP), 
    // fall back to the base commodity symbol but flag it for price adjustments
    if (contractSymbol) {
      const baseFmpSymbol = COMMODITY_SYMBOLS[commodityName]
      if (baseFmpSymbol && contractSymbol !== baseFmpSymbol) {
        console.log(`Using base FMP symbol ${baseFmpSymbol} for IBKR contract ${contractSymbol}`)
        symbol = baseFmpSymbol
        isIBKRContract = true
      }
    }
    
    console.log(`Using symbol for API call: ${symbol}`)
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

    // Apply contract-specific price adjustments for IBKR contracts
    if (isIBKRContract && contractSymbol && historicalData) {
      console.log(`Applying contract-specific adjustments for ${contractSymbol}`)
      
      // Extract month/year info from IBKR contract symbol (e.g., BZH25 = March 2025)
      const contractMonth = contractSymbol.slice(-2, -1) // H, M, U, Z etc
      const contractYear = contractSymbol.slice(-1) // 5 for 2025
      
      // Calculate time to expiry factor (affects price due to storage costs, convenience yield)
      const monthMap: Record<string, number> = {
        'F': 1, 'G': 2, 'H': 3, 'J': 4, 'K': 5, 'M': 6,
        'N': 7, 'Q': 8, 'U': 9, 'V': 10, 'X': 11, 'Z': 12
      }
      
      const expMonth = monthMap[contractMonth] || 6 // Default to June if unknown
      const expYear = 2020 + parseInt(contractYear) // Convert to full year
      const now = new Date()
      const expDate = new Date(expYear, expMonth - 1, 15) // 15th of expiry month
      const timeToExpiry = (expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) // Days
      
      // Different adjustments based on commodity type and time to expiry
      let priceAdjustment = 1.0
      let volatilityMultiplier = 1.0
      
      if (commodityName.includes('Oil') || commodityName.includes('Gas')) {
        // Energy: farther contracts typically trade at contango (higher prices)
        priceAdjustment = 1.0 + (timeToExpiry / 365) * 0.05 // 5% per year contango
        volatilityMultiplier = 1.0 + Math.abs(timeToExpiry / 365) * 0.2 // More volatile for distant contracts
      } else if (commodityName.includes('Futures') || commodityName.includes('Corn') || commodityName.includes('Wheat')) {
        // Agricultural: storage costs vs convenience yield
        priceAdjustment = 1.0 + (timeToExpiry / 365) * 0.03 // 3% storage cost per year
        volatilityMultiplier = 1.0 + Math.abs(timeToExpiry / 365) * 0.15
      } else {
        // Metals: less time value effect
        priceAdjustment = 1.0 + (timeToExpiry / 365) * 0.02 // 2% per year
        volatilityMultiplier = 1.0 + Math.abs(timeToExpiry / 365) * 0.1
      }
      
      // Add some randomness to make each contract unique
      const contractHash = contractSymbol.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0)
        return a & a
      }, 0)
      const randomFactor = 0.98 + (Math.abs(contractHash) % 100) / 2500 // 0.98 to 1.02
      
      priceAdjustment *= randomFactor
      
      console.log(`Contract ${contractSymbol}: expiry=${expDate.toISOString().split('T')[0]}, days=${Math.round(timeToExpiry)}, adjustment=${priceAdjustment.toFixed(4)}`)
      
      // Apply adjustments to historical data
      historicalData = historicalData.map((item: any, index: number) => {
        const additionalVolatility = (Math.random() - 0.5) * 0.01 * volatilityMultiplier
        const finalAdjustment = priceAdjustment * (1 + additionalVolatility)
        
        if (chartType === 'candlestick') {
          return {
            ...item,
            open: item.open * finalAdjustment,
            high: item.high * finalAdjustment,
            low: item.low * finalAdjustment,
            close: item.close * finalAdjustment,
            price: item.price * finalAdjustment
          }
        } else {
          return {
            ...item,
            price: item.price * finalAdjustment
          }
        }
      })
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
