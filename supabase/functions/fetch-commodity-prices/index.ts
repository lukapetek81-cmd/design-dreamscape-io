import { serve } from "https://deno.land/std@0.168.0/http/server.ts"


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// FMP symbols for non-energy commodities only
const FMP_SYMBOLS: Record<string, string> = {
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

// ALL energy commodities use OilPriceAPI exclusively
const OIL_API_CODES: Record<string, string> = {
  // Core oil benchmarks
  'Crude Oil': 'WTI_USD',
  'Brent Crude Oil': 'BRENT_CRUDE_USD',
  'Crude Oil Dubai': 'DUBAI_CRUDE_USD',
  'Tapis Crude Oil': 'TAPIS_CRUDE_USD',
  'Western Canadian Select': 'WCS_CRUDE_USD',
  'Urals Crude Oil': 'URALS_CRUDE_USD',
  // Refined products
  'Gasoline RBOB': 'GASOLINE_RBOB_USD',
  'Heating Oil': 'HEATING_OIL_USD',
  'Jet Fuel': 'JET_FUEL_USD',
  'ULSD Diesel': 'ULSD_DIESEL_USD',
  // Natural gas
  'Natural Gas': 'NATURAL_GAS_USD',
  'Natural Gas UK': 'NATURAL_GAS_GBP',
  'Dutch TTF Gas': 'DUTCH_TTF_EUR',
  'Japan/Korea LNG': 'JKM_LNG_USD',
  'US Gas Storage': 'NATURAL_GAS_STORAGE',
  // Marine fuels
  'VLSFO Global': 'VLSFO_USD',
  'HFO 380 Global': 'HFO_380_USD',
  'MGO 0.5%S Global': 'MGO_05S_USD',
  'HFO 380 Rotterdam': 'HFO_380_NLRTM_USD',
  'VLSFO Singapore': 'VLSFO_SGSIN_USD',
  'MGO Houston': 'MGO_05S_USHOU_USD',
  'VLSFO Fujairah': 'VLSFO_AEFUJ_USD',
};

// All energy commodity names — FMP is never used for these
const ENERGY_NAMES = new Set(Object.keys(OIL_API_CODES).concat([
  'Gas Oil', 'Coal', 'Ethanol', 'Propane'
]));

const getBasePriceForCommodity = (commodityName: string): number => {
  const basePrices: Record<string, number> = {
    'Crude Oil': 65, 'Brent Crude Oil': 70, 'Natural Gas': 2.85,
    'Gasoline RBOB': 2.1, 'Heating Oil': 2.3, 'Natural Gas UK': 90,
    'Gas Oil': 650, 'Coal': 85, 'Ethanol': 2.15, 'Propane': 0.95,
    'Gold Futures': 2000, 'Silver Futures': 25, 'Platinum': 1050,
    'Palladium': 1200, 'Copper': 4.2, 'Aluminum': 2200,
    'Corn Futures': 430, 'Wheat Futures': 550, 'Soybean Futures': 1150,
    'Coffee Arabica': 165, 'Sugar #11': 19.75, 'Cotton': 72.80,
    'Cocoa': 2850, 'Live Cattle Futures': 170, 'Lean Hogs Futures': 75,
  };
  return basePrices[commodityName] || 100;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    
    const commodityName = typeof body.commodityName === 'string' && body.commodityName.length > 0 && body.commodityName.length <= 100
      ? body.commodityName
      : null;
    const isPremium = typeof body.isPremium === 'boolean' ? body.isPremium : false;
    const validDelays = ['realtime', '15min'];
    const dataDelay = validDelays.includes(body.dataDelay) ? body.dataDelay : 'realtime';
    
    if (!commodityName) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid commodityName (must be string, 1-100 chars)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Fetching current price for ${commodityName} with ${dataDelay} data (Premium: ${isPremium || false})`)

    let priceData = null
    let dataSource = 'fallback'

    // Check if this commodity is available from OilPriceAPI first
    const oilApiCode = OIL_API_CODES[commodityName];
    const oilApiKey = Deno.env.get('OIL_PRICE_API_KEY');
    
    if (oilApiCode && oilApiKey) {
      try {
        console.log(`Trying OilPriceAPI for ${commodityName} (${oilApiCode})`);
        const oilResp = await fetch(
          `https://api.oilpriceapi.com/v1/prices/latest?by_code=${oilApiCode}`,
          { headers: { 'Authorization': `Token ${oilApiKey}` } }
        );
        
        if (oilResp.ok) {
          const oilResult = await oilResp.json();
          if (oilResult.data?.price) {
            priceData = {
              symbol: oilApiCode,
              price: oilResult.data.price,
              change: 0,
              changePercent: 0,
              lastUpdate: oilResult.data.created_at || new Date().toISOString()
            };
            dataSource = 'oilpriceapi';
            console.log(`OilPriceAPI price for ${commodityName}: ${oilResult.data.price}`);
          }
        } else {
          const errText = await oilResp.text();
          console.warn(`OilPriceAPI error for ${oilApiCode}: ${oilResp.status} - ${errText}`);
        }
      } catch (err) {
        console.warn(`OilPriceAPI failed for ${commodityName}:`, err);
      }
    }

    // Use FMP API as secondary source for commodities not from OilPriceAPI
    if (!priceData) {
      const fmpApiKey = Deno.env.get('FMP_API_KEY')
      
      if (fmpApiKey && fmpApiKey !== 'demo') {
        try {
          console.log(`Using FMP API to find current price for ${commodityName}`)
          
          const commoditiesResponse = await fetch(
            `https://financialmodelingprep.com/api/v3/quotes/commodity?apikey=${fmpApiKey}`
          )
          
          if (commoditiesResponse.ok) {
            const commoditiesData = await commoditiesResponse.json()
            
            if (Array.isArray(commoditiesData) && commoditiesData.length > 0) {
              const fmpCommodity = commoditiesData.find(item => {
                if (item.name && item.name.toLowerCase() === commodityName.toLowerCase()) {
                  return true;
                }
                const hardcodedSymbol = FMP_SYMBOLS[commodityName];
                if (hardcodedSymbol && item.symbol === hardcodedSymbol) {
                  return true;
                }
                const itemNameLower = (item.name || '').toLowerCase();
                const commodityNameLower = commodityName.toLowerCase();
                const commodityWords = commodityNameLower.split(' ').filter(w => w.length > 2);
                return commodityWords.every(word => itemNameLower.includes(word));
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
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})