import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// CommodityPriceAPI symbol mappings - matches the ones in fetch-commodity-symbols
const COMMODITY_PRICE_API_SYMBOLS: Record<string, string> = {
  // Precious Metals
  'Gold Futures': 'XAU',
  'Silver Futures': 'XAG', 
  'Platinum': 'XPT',
  'Palladium': 'XPD',
  'Rhodium': 'XRH',
  
  // Base Metals
  'Copper': 'HG',
  'Aluminum': 'ALU',
  'Aluminum LME': 'AL',
  'Zinc': 'ZNC',
  'Zinc LME': 'ZINC',
  'Lead': 'LEAD',
  'Nickel': 'NICKEL',
  'Tin': 'TIN',
  'Steel': 'STEEL',
  'Hot-Rolled Coil Steel': 'HRC-STEEL',
  'Iron Ore 62% FE': 'TIOC',
  'Magnesium': 'MG',
  
  // Industrial/Tech Metals
  'Lithium': 'LC',
  'Cobalt': 'COB',
  'Titanium': 'TITAN',
  'Gallium': 'GA',
  'Indium': 'INDIUM',
  'Tellurium': 'TEL',
  'Neodymium': 'NDYM',
  
  // Energy
  'Crude Oil': 'WTIOIL',
  'Brent Crude Oil': 'BRENTOIL',
  'Crude Oil Dubai': 'DBLC1',
  'Ural Oil': 'URAL-OIL',
  'Natural Gas': 'NG',
  'Natural Gas US': 'NGUS',
  'Natural Gas Europe': 'NGEU',
  'Liquefied Natural Gas Japan': 'LNG',
  'TTF Gas': 'TTF-GAS',
  'UK Gas': 'UK-GAS',
  'Heating Oil': 'HO',
  'Gasoline RBOB': 'RB',
  'Gas Oil': 'LGO',
  'Coal': 'COAL',
  'Coal Australia': 'AUCOAL',
  'Coal South Africa': 'RB1COAL',
  'Uranium': 'UXA',
  'Ethanol': 'ETHANOL',
  'Methanol': 'METH',
  'Propane': 'PROP',
  'Naphtha': 'NAPHTHA',
  
  // Grains & Agriculture
  'Corn Futures': 'CORN',
  'Wheat Futures': 'ZW',
  'Soybean Futures': 'SOYBEAN',
  'Soybean Oil': 'ZL',
  'Soybean Meal': 'ZM',
  'Oat Futures': 'OAT',
  'Rough Rice': 'RR',
  'Canola': 'CANOLA',
  
  // Soft Commodities
  'Sugar': 'LS',
  'Cotton': 'CT',
  'Coffee Arabica': 'CA',
  'Coffee Robusta': 'CR',
  'Cocoa': 'CC',
  'Tea': 'TEA',
  'Tea Kolkata': 'TEAK',
  'Tea Colombo': 'TEAC',
  'Tea Mombasa': 'TEAM',
  
  // Oils & Fats
  'Palm Oil': 'PO',
  'Sunflower Oil': 'SUNF',
  'Rapeseed Oil': 'RSO',
  'Coconut Oil': 'CO',
  
  // Livestock & Dairy
  'Live Cattle Futures': 'CATTLE',
  'Lean Hogs Futures': 'HOGS',
  'Milk': 'MILK',
  'Cheese': 'CHE',
  'Butter': 'BUTTER',
  'Eggs US': 'EGGS-US',
  'Eggs China': 'EGGS-CH',
  'Poultry': 'POUL',
  'Salmon': 'SALMON',
  'Fish Meal': 'FM',
  
  // Industrial Materials
  'Lumber': 'LB',
  'Rubber': 'RUBBER',
  'Wool': 'WOOL',
  'Bitumen': 'BIT',
  'Kraft Pulp': 'K-PULP',
  
  // Plastics & Chemicals
  'Polyethylene': 'POL',
  'Polyvinyl Chloride': 'PVC',
  'Polypropylene': 'PYL',
  'Soda Ash': 'SODASH',
  'Urea': 'UREA',
  'Diammonium Phosphate': 'DIAPH',
  
  // Food & Agriculture
  'Potato': 'POTATO',
  'Orange Juice': 'OJ'
};

// FMP fallback symbols for commodities not in CommodityPriceAPI
const FMP_FALLBACK_SYMBOLS: Record<string, string> = {
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

    // Check if user is authenticated
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

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

    // Check if user has CommodityPriceAPI credentials and is premium
    if (isPremium) {
      try {
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('commodity_price_api_credentials')
          .eq('id', user.id)
          .single()

        if (profile?.commodity_price_api_credentials) {
          // Get CommodityPriceAPI symbol
          const commoditySymbol = COMMODITY_PRICE_API_SYMBOLS[commodityName]
          
          if (commoditySymbol) {
            console.log(`Using CommodityPriceAPI for ${commodityName} with symbol ${commoditySymbol}`)
            
            // Decrypt the user's API key
            const decryptedData = atob(profile.commodity_price_api_credentials).replace(/ibkr-creds-key-2024/g, '');
            const credentials = JSON.parse(decryptedData);
            
            // Invoke the CommodityPriceAPI edge function
            const { data: apiData, error: apiError } = await supabaseClient.functions.invoke('commodity-price-api-realtime', {
              body: {
                apiKey: credentials.apiKey, // Use the user's decrypted API key
                symbols: commoditySymbol,
                action: 'latest'
              }
            })

            if (!apiError && apiData?.rates && apiData.rates[commoditySymbol]) {
              const price = apiData.rates[commoditySymbol]
              const metadata = apiData.metadata?.[commoditySymbol] || {}
              
              priceData = {
                symbol: commoditySymbol,
                price: price,
                change: (Math.random() - 0.5) * price * 0.02, // Simulate change
                changePercent: (Math.random() - 0.5) * 4,
                lastUpdate: new Date(apiData.timestamp * 1000).toISOString(),
                unit: metadata.unit || 'USD',
                quote: metadata.quote || 'USD'
              }
              
              dataSource = 'commodity-price-api'
              console.log(`Successfully fetched from CommodityPriceAPI:`, priceData)
            } else {
              console.warn(`CommodityPriceAPI failed for ${commodityName}:`, apiError?.message || 'No data')
            }
          }
        }
      } catch (error) {
        console.warn(`Error accessing CommodityPriceAPI for ${commodityName}:`, error)
      }
    }

    // Fallback to FMP API if CommodityPriceAPI failed
    if (!priceData) {
      const fmpApiKey = Deno.env.get('FMP_API_KEY')
      const fmpSymbol = FMP_FALLBACK_SYMBOLS[commodityName]
      
      if (fmpApiKey && fmpApiKey !== 'demo' && fmpSymbol) {
        try {
          console.log(`Falling back to FMP API for ${commodityName} with symbol ${fmpSymbol}`)
          
          const endpoint = `https://financialmodelingprep.com/api/v3/quote/${fmpSymbol}?apikey=${fmpApiKey}`
          const response = await fetch(endpoint)
          
          if (response.ok) {
            const data = await response.json()
            if (Array.isArray(data) && data.length > 0) {
              const quote = data[0]
              priceData = {
                symbol: fmpSymbol,
                price: parseFloat(quote.price) || 0,
                change: parseFloat(quote.change) || 0,
                changePercent: parseFloat(quote.changesPercentage) || 0,
                lastUpdate: new Date().toISOString()
              }
              dataSource = 'fmp-fallback'
              console.log(`Successfully fetched from FMP fallback:`, priceData)
            }
          }
        } catch (error) {
          console.warn(`FMP API fallback failed for ${commodityName}:`, error)
        }
      }
    }

    // Use fallback data if both APIs failed
    if (!priceData) {
      console.log(`Using fallback price data for ${commodityName}`)
      const basePrice = getBasePriceForCommodity(commodityName)
      priceData = {
        symbol: COMMODITY_PRICE_API_SYMBOLS[commodityName] || commodityName,
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
      
      priceData = {
        ...priceData,
        price: priceData.price * (0.995 + Math.random() * 0.01),
        change: priceData.change * (0.9 + Math.random() * 0.2),
        changePercent: priceData.changePercent * (0.9 + Math.random() * 0.2),
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