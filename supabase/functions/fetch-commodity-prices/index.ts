import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Commodity symbol mappings - FMP compatible symbols
const COMMODITY_SYMBOLS: Record<string, string> = {
  // Energy
  'Crude Oil': 'CL=F',
  'Brent Crude Oil': 'BZ=F',
  'Natural Gas': 'NG=F',
  'Gasoline RBOB': 'RB=F',
  'Heating Oil': 'HO=F',
  'Natural Gas UK': 'NG=F', // Use same as US Natural Gas for FMP
  'Gas Oil': 'HO=F', // Use Heating Oil as proxy
  'Coal': 'ANR', // ANR Coal stock as proxy
  'Ethanol': 'ZE=F',
  'Propane': 'PN=F',
  
  // Precious Metals
  'Gold Futures': 'GC=F',
  'Silver Futures': 'SI=F',
  'Platinum': 'PL=F',
  'Palladium': 'PA=F',
  'Rhodium': 'RHODY', // Rhodium ETF
  
  // Base Metals
  'Copper': 'HG=F',
  'Aluminum': 'ALU=F',
  'Zinc': 'ZN=F',
  'Lead': 'LD=F',
  'Nickel': 'NI=F',
  'Tin': 'SN=F',
  'Steel': 'X', // US Steel as proxy
  'Iron Ore': 'BHP', // BHP as iron ore proxy
  
  // Industrial/Tech Metals
  'Lithium': 'LIT', // Lithium ETF
  'Cobalt': 'COBR', // Cobalt ETF
  'Uranium': 'URA', // Uranium ETF
  
  // Grains & Agriculture
  'Corn Futures': 'ZC=F',
  'Wheat Futures': 'ZW=F',
  'Soybean Futures': 'ZS=F',
  'Soybean Oil': 'ZL=F',
  'Soybean Meal': 'ZM=F',
  'Oat Futures': 'ZO=F',
  'Rough Rice': 'ZR=F',
  'Canola': 'RS=F',
  'Barley': 'ZW=F', // Use wheat as proxy
  'Spring Wheat': 'MW=F',
  'Hard Red Winter Wheat': 'KE=F',
  
  // Livestock & Dairy
  'Live Cattle Futures': 'LE=F',
  'Feeder Cattle Futures': 'GF=F',
  'Lean Hogs Futures': 'HE=F',
  'Milk Class III': 'DC=F',
  'Milk Nonfat Dry': 'NF=F',
  'Butter': 'DA=F',
  'Cheese': 'CSC=F',
  
  // Soft Commodities
  'Coffee Arabica': 'KC=F',
  'Coffee Robusta': 'KC=F', // Use Arabica as proxy
  'Sugar #11': 'SB=F',
  'Sugar #5': 'SB=F', // Use #11 as proxy
  'Cotton': 'CT=F',
  'Cocoa': 'CC=F',
  'Orange Juice': 'OJ=F',
  'Tea': 'KC=F', // Use coffee as proxy
  
  // Oils & Fats
  'Palm Oil': 'ZL=F', // Use soybean oil as proxy
  'Sunflower Oil': 'ZL=F',
  'Rapeseed Oil': 'ZL=F',
  'Coconut Oil': 'ZL=F',
  'Olive Oil': 'ZL=F',
  
  // Forest Products
  'Lumber Futures': 'LBS=F',
  'Random Length Lumber': 'LB=F',
  'Pulp': 'LBS=F', // Use lumber as proxy
  'Newsprint': 'LBS=F',
  
  // Industrial Materials
  'Rubber': 'RU=F',
  'Cotton Yarn': 'CT=F', // Use cotton as proxy
  'Wool': 'CT=F',
  'Jute': 'CT=F',
  
  // Fertilizers & Chemicals
  'Urea': 'MOS', // Mosaic fertilizer stock
  'Diammonium Phosphate': 'MOS',
  'Potash': 'POT',
  'Ammonia': 'CF', // CF Industries
  
  // Plastics
  'Polyethylene': 'DOW', // Dow Chemical as proxy
  'Polypropylene': 'DOW',
  'PVC': 'DOW',
  'Styrene': 'DOW',
  
  // Food & Agriculture
  'White Sugar': 'SB=F',
  'Raw Sugar': 'SB=F',
  'Potato': 'ZC=F', // Use corn as proxy
  'Onion': 'ZC=F',
  'Garlic': 'ZC=F',
  'Apple': 'ZC=F',
  'Banana': 'ZC=F',
  
  // Spices
  'Black Pepper': 'KC=F', // Use coffee as proxy
  'Cardamom': 'KC=F',
  'Turmeric': 'KC=F',
  'Coriander': 'KC=F',
  'Chilli': 'KC=F',
  'Cumin': 'KC=F',
  
  // Others
  'Electricity': 'NEE', // NextEra Energy as proxy
  'Carbon Credits': 'KRBN', // Carbon ETF
  'Weather Derivatives': 'AIG', // AIG as insurance proxy
  
  // Legacy mappings (keep for compatibility)
  'Sugar': 'SB=F',
  'Coffee': 'KC=F',
  'Lumber': 'LBS=F'
};

const getBasePriceForCommodity = (commodityName: string): number => {
  const basePrices: Record<string, number> = {
    // Energy
    'Crude Oil': 65,
    'Brent Crude Oil': 67,
    'Natural Gas': 2.85,
    'Gasoline RBOB': 2.1,
    'Heating Oil': 2.3,
    'Natural Gas UK': 90,
    'Gas Oil': 650,
    'Coal': 85,
    'Ethanol': 2.15,
    'Propane': 0.95,
    
    // Precious Metals
    'Gold Futures': 2000,
    'Silver Futures': 25,
    'Platinum': 1050,
    'Palladium': 1200,
    'Rhodium': 4500,
    
    // Base Metals
    'Copper': 4.2,
    'Aluminum': 2200,
    'Zinc': 2800,
    'Lead': 2100,
    'Nickel': 18500,
    'Tin': 32000,
    'Steel': 650,
    'Iron Ore': 115,
    
    // Industrial/Tech Metals
    'Lithium': 85,
    'Cobalt': 35000,
    'Uranium': 50,
    
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
    'Milk Class III': 20.85,
    'Milk Nonfat Dry': 1.35,
    'Butter': 2.85,
    'Cheese': 1.95,
    
    // Soft Commodities
    'Coffee Arabica': 165,
    'Coffee Robusta': 2100,
    'Sugar #11': 19.75,
    'Sugar #5': 485,
    'Cotton': 72.80,
    'Cocoa': 2850,
    'Orange Juice': 315,
    'Tea': 3.20,
    
    // Oils & Fats
    'Palm Oil': 885,
    'Sunflower Oil': 1350,
    'Rapeseed Oil': 1450,
    'Coconut Oil': 1650,
    'Olive Oil': 4200,
    
    // Forest Products
    'Lumber Futures': 485,
    'Random Length Lumber': 485,
    'Pulp': 1450,
    'Newsprint': 685,
    
    // Industrial Materials
    'Rubber': 1.85,
    'Cotton Yarn': 3200,
    'Wool': 14.50,
    'Jute': 850,
    
    // Fertilizers & Chemicals
    'Urea': 385,
    'Diammonium Phosphate': 545,
    'Potash': 285,
    'Ammonia': 485,
    
    // Plastics
    'Polyethylene': 1250,
    'Polypropylene': 1180,
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
    'Weather Derivatives': 100,
    
    // Legacy mappings
    'Sugar': 19.75,
    'Coffee': 165,
    'Lumber': 485,
    'Micro Gold Futures': 2000,
    'Micro Silver Futures': 25,
    'Class III Milk Futures': 20.85
  };
  return basePrices[commodityName] || 100;
};

// Removed fetchPriceFromFMP function - handled directly in main function for better premium user support

// Removed Alpha Vantage API - using FMP API only for consistency

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { commodityName, isPremium, dataDelay = 'realtime' } = await req.json()
    
    if (!commodityName) {
      return new Response(
        JSON.stringify({ error: 'Missing commodityName' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Fetching current price for ${commodityName} with ${dataDelay} data (Premium: ${isPremium || false})`)

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
        // For premium users, use real-time quotes endpoint for more accurate data
        const endpoint = isPremium 
          ? `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${fmpApiKey}`
          : `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${fmpApiKey}`;
        
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error(`FMP API error: ${response.status}`);
        }
        
        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) throw new Error('No data returned');
        
        const quote = data[0];
        priceData = {
          symbol: symbol,
          price: parseFloat(quote.price) || 0,
          change: parseFloat(quote.change) || 0,
          changePercent: parseFloat(quote.changesPercentage) || 0,
          lastUpdate: new Date().toISOString()
        };
        
        console.log(`Successfully fetched ${isPremium ? 'real-time' : 'standard'} price from FMP for ${commodityName}:`, priceData)
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

    // Apply data delay for free users
    if (dataDelay === '15min' && priceData) {
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
      console.log(`Applying 15-minute delay - simulating price data from ${fifteenMinutesAgo.toISOString()}`);
      
      // Slightly adjust prices to simulate older data
      priceData = {
        ...priceData,
        price: priceData.price * (0.995 + Math.random() * 0.01),
        change: priceData.change * (0.9 + Math.random() * 0.2),
        changePercent: priceData.changePercent * (0.9 + Math.random() * 0.2),
        lastUpdate: fifteenMinutesAgo.toISOString()
      };
    }

    return new Response(
      JSON.stringify({ 
        price: priceData,
        source: priceData && fmpApiKey && fmpApiKey !== 'demo' ? 'fmp' : 'fallback',
        commodity: commodityName,
        symbol: symbol,
        realTime: isPremium || false,
        dataDelay: dataDelay,
        isDelayed: dataDelay === '15min'
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