import { serve } from "https://deno.land/std@0.168.0/http/server.ts"


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// FMP symbols for commodities
const FMP_SYMBOLS: Record<string, string> = {
  'Natural Gas UK': 'NG=F',
  'Gas Oil': 'HO=F',
  'Coal': 'ANR',
  'Ethanol': 'ZE=F',
  'Propane': 'PN=F',
  'Iron Ore': 'BHP',
  'Barley': 'ZW=F',
  'Spring Wheat': 'MW=F',
  'Hard Red Winter Wheat': 'KE=F',
  'Feeder Cattle Futures': 'GF=F',
  'Milk Class III': 'DC=F',
  'Milk Nonfat Dry': 'NF=F',
  'Sugar #11': 'SB=F',
  'Sugar #5': 'SB=F',
  'Coffee': 'KC=F',
  'Lumber Futures': 'LBS=F',
  'Random Length Lumber': 'LB=F'
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
    'Weather Derivatives': 100,
    
    // Legacy mappings
    'Coffee': 165,
    'Micro Gold Futures': 2000,
    'Micro Silver Futures': 25,
    'Class III Milk Futures': 20.85
  };
  return basePrices[commodityName] || 100;
};

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

    let priceData = null
    let dataSource = 'fallback'

    // Use FMP API as primary source - get the symbol directly from FMP's commodity list
    const fmpApiKey = Deno.env.get('FMP_API_KEY')
    
    if (fmpApiKey && fmpApiKey !== 'demo') {
      try {
        console.log(`Using FMP API to find current price for ${commodityName}`)
        
        // First, get all available commodities to find the correct symbol
        const commoditiesResponse = await fetch(
          `https://financialmodelingprep.com/api/v3/quotes/commodity?apikey=${fmpApiKey}`
        )
        
        if (commoditiesResponse.ok) {
          const commoditiesData = await commoditiesResponse.json()
          
          if (Array.isArray(commoditiesData) && commoditiesData.length > 0) {
            // Find the matching commodity from FMP's list
            const fmpCommodity = commoditiesData.find(item => {
              // Try exact name match first
              if (item.name && item.name.toLowerCase() === commodityName.toLowerCase()) {
                return true;
              }
              
              // Try symbol match with our hardcoded mapping as fallback
              const hardcodedSymbol = FMP_SYMBOLS[commodityName];
              if (hardcodedSymbol && item.symbol === hardcodedSymbol) {
                return true;
              }
              
              // Try partial name matching
              const itemNameLower = (item.name || '').toLowerCase();
              const commodityNameLower = commodityName.toLowerCase();
              
              // Extract key words for matching
              const commodityWords = commodityNameLower.split(' ').filter(w => w.length > 2);
              return commodityWords.some(word => itemNameLower.includes(word));
            });
            
            if (fmpCommodity) {
              priceData = {
                symbol: fmpCommodity.symbol,
                price: parseFloat(fmpCommodity.price) || 0,
                change: parseFloat(fmpCommodity.change) || 0,
                changePercent: parseFloat(fmpCommodity.changesPercentage) || 0,
                lastUpdate: new Date().toISOString()
              }
              dataSource = 'fmp'
              console.log(`Successfully fetched from FMP:`, priceData)
            } else {
              console.log(`No FMP commodity found matching "${commodityName}"`)
            }
          }
        }
      } catch (error) {
        console.warn(`FMP API failed for ${commodityName}:`, error)
      }
    }

    // Use fallback data if both APIs failed
    if (!priceData) {
      console.log(`Using fallback price data for ${commodityName}`)
      const basePrice = getBasePriceForCommodity(commodityName)
      priceData = {
        symbol: FMP_SYMBOLS[commodityName] || commodityName,
        price: basePrice,
        change: (Math.random() - 0.5) * basePrice * 0.02,
        changePercent: (Math.random() - 0.5) * 4,
        lastUpdate: new Date().toISOString()
      }
      dataSource = 'fallback'
    }

    // Apply data delay for free users
    if (dataDelay === '15min' && priceData) {
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000)
      console.log(`Applying 15-minute delay - simulating price data from ${fifteenMinutesAgo.toISOString()}`)
      
      // Use a deterministic seed based on commodity name for consistent delayed pricing
      const commodityHash = commodityName.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0)
        return a & a
      }, 0)
      const seededRandom = (Math.abs(commodityHash) % 100) / 100
      
      priceData = {
        ...priceData,
        price: priceData.price * (0.995 + seededRandom * 0.01),
        change: priceData.change * (0.9 + seededRandom * 0.2),
        changePercent: priceData.changePercent * (0.9 + seededRandom * 0.2),
        lastUpdate: fifteenMinutesAgo.toISOString()
      }
    }

    return new Response(
      JSON.stringify({ 
        price: priceData,
        source: dataSource,
        commodity: commodityName,
        symbol: priceData?.symbol,
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