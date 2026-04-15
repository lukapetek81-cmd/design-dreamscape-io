import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// In-memory cache with TTL
const priceCache = new Map<string, { data: any; source: string; timestamp: number }>();
const CACHE_TTL = 3 * 60 * 1000; // 3 minutes

function getCachedPrice(key: string): { data: any; source: string } | null {
  const entry = priceCache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return { data: entry.data, source: entry.source };
  }
  if (entry) priceCache.delete(key);
  return null;
}

function setCachedPrice(key: string, data: any, source: string): void {
  if (priceCache.size > 200) {
    const oldest = priceCache.keys().next().value;
    if (oldest) priceCache.delete(oldest);
  }
  priceCache.set(key, { data, source, timestamp: Date.now() });
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// FMP symbols for non-energy commodities — only those confirmed working on basic plan
const FMP_SYMBOLS: Record<string, string> = {
  // Metals
  'Gold Futures': 'GCUSD', 'Silver Futures': 'SIUSD', 'Platinum': 'PLUSD',
  'Palladium': 'PAUSD', 'Copper': 'HGUSD',
  'Aluminum': 'ALIUSD', 'Zinc': 'ZNUSD',
  // Grains (USX for CBOT grains)
  'Corn Futures': 'ZCUSX', 'Soybean Futures': 'ZSUSX',
  'Soybean Oil': 'ZLUSX', 'Soybean Meal': 'ZMUSD', 'Oat Futures': 'ZOUSX',
  'Rough Rice': 'ZRUSD',
  // Softs
  'Coffee Arabica': 'KCUSX', 'Sugar #11': 'SBUSD',
  'Cotton': 'CTUSX', 'Cocoa': 'CCUSD', 'Orange Juice': 'OJUSX',
  // Livestock
  'Live Cattle Futures': 'LEUSX', 'Lean Hogs Futures': 'HEUSX',
  'Feeder Cattle Futures': 'GFUSX',
  'Milk Class III': 'DCUSD',
  // Other
  'Lumber Futures': 'LBSUSD', 'Random Length Lumber': 'LBUSD',
};

// ALL energy commodities use OilPriceAPI exclusively
const OIL_API_CODES: Record<string, string> = {
  // Crude Oil Benchmarks
  'WTI Crude Oil': 'WTI_USD',
  'Brent Crude Oil': 'BRENT_CRUDE_USD',
  'Crude Oil Dubai': 'DUBAI_CRUDE_USD',
  'DME Oman Crude': 'DME_OMAN_USD',
  'Murban Crude': 'MURBAN_CRUDE_USD',
  'OPEC Basket': 'OPEC_BASKET_USD',
  'Indian Basket': 'INDIAN_BASKET_USD',
  'Tapis Crude Oil': 'TAPIS_CRUDE_USD',
  'Urals Crude Oil': 'URALS_CRUDE_USD',
  'Western Canadian Select': 'WCS_CRUDE_USD',
  // Regional Crude Benchmarks
  'WTI Midland': 'WTI_MIDLAND_USD',
  'Alaska North Slope': 'ANS_WEST_COAST_USD',
  'Mars Blend': 'MARS_USD',
  'Louisiana Light Sweet': 'LOUISIANA_LIGHT_USD',
  // Refined Products
  'Gasoline RBOB': 'GASOLINE_RBOB_USD',
  'Heating Oil': 'HEATING_OIL_USD',
  'Jet Fuel': 'JET_FUEL_USD',
  'ULSD Diesel': 'ULSD_DIESEL_USD',
  'Gasoil': 'GASOIL_USD',
  'Naphtha': 'NAPHTHA_USD',
  'Propane': 'PROPANE_MONT_BELVIEU_USD',
  'Ethanol': 'ETHANOL_USD',
  // Natural Gas & LNG
  'Natural Gas': 'NATURAL_GAS_USD',
  'Natural Gas UK': 'NATURAL_GAS_GBP',
  'Dutch TTF Gas': 'DUTCH_TTF_EUR',
  'Japan/Korea LNG': 'JKM_LNG_USD',
  'US Gas Storage': 'NATURAL_GAS_STORAGE',
  // Marine Fuels
  'VLSFO Global': 'VLSFO_USD',
  'HFO 380 Global': 'HFO_380_USD',
  'MGO 0.5%S Global': 'MGO_05S_USD',
  'HFO 380 Rotterdam': 'HFO_380_NLRTM_USD',
  'VLSFO Singapore': 'VLSFO_SGSIN_USD',
  'MGO Houston': 'MGO_05S_USHOU_USD',
  'VLSFO Fujairah': 'VLSFO_AEFUJ_USD',
};

// All energy commodity names — FMP is never used for these
const ENERGY_NAMES = new Set(Object.keys(OIL_API_CODES));

const getBasePriceForCommodity = (commodityName: string): number => {
  const basePrices: Record<string, number> = {
    'WTI Crude Oil': 65, 'Brent Crude Oil': 70, 'Natural Gas': 2.85,
    'Gasoline RBOB': 2.1, 'Heating Oil': 2.3, 'Natural Gas UK': 90,
    'Gold Futures': 2000, 'Silver Futures': 25, 'Platinum': 1050,
    'Palladium': 1200, 'Copper': 4.2, 'Aluminum': 2200,
    'Corn Futures': 430, 'Soybean Futures': 1150,
    'Coffee Arabica': 165, 'Sugar #11': 19.75,
    'Cotton': 72.80, 'Cocoa': 2850,
    'Live Cattle Futures': 170, 'Lean Hogs Futures': 75,
    'Feeder Cattle Futures': 245, 'Milk Class III': 18.50,
    'Orange Juice': 450, 'Lumber Futures': 550, 'Oat Futures': 350,
    'Soybean Oil': 45, 'Soybean Meal': 330, 'Rough Rice': 17,
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

    // Check cache first
    const cacheKey = `price:${commodityName}:${dataDelay}`;
    const cached = getCachedPrice(cacheKey);
    if (cached) {
      console.log(`Cache hit for ${commodityName}`);
      return new Response(
        JSON.stringify({
          price: cached.data,
          source: cached.source,
          commodity: commodityName,
          symbol: cached.data?.symbol,
          realTime: isPremium || false,
          dataDelay,
          isDelayed: dataDelay === '15min',
          cached: true,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    // Use FMP API only for NON-energy commodities (per-symbol endpoint)
    if (!priceData && !ENERGY_NAMES.has(commodityName)) {
      const fmpApiKey = Deno.env.get('FMP_API_KEY')
      
      if (fmpApiKey && fmpApiKey !== 'demo') {
        try {
          // Try direct symbol lookup first
          const hardcodedSymbol = FMP_SYMBOLS[commodityName];
          const symbolToFetch = hardcodedSymbol || commodityName.replace(/\s+/g, '');
          
          console.log(`Using FMP /stable/quote for ${commodityName} (symbol: ${symbolToFetch})`)
          
          const response = await fetch(
            `https://financialmodelingprep.com/stable/quote?symbol=${symbolToFetch}&apikey=${fmpApiKey}`
          )
          
          if (response.ok) {
            const data = await response.json()
            
            if (Array.isArray(data) && data.length > 0) {
              const fmpCommodity = data[0];
              priceData = {
                symbol: fmpCommodity.symbol,
                price: parseFloat(fmpCommodity.price) || 0,
                change: parseFloat(fmpCommodity.change) || 0,
                changePercent: parseFloat(fmpCommodity.changesPercentage) || 0,
                lastUpdate: new Date().toISOString()
              }
              dataSource = 'fmp'
              console.log(`Successfully fetched from FMP /quote:`, priceData)
            }
          } else {
            console.warn(`FMP /quote error for ${symbolToFetch}: ${response.status}`)
            await response.text(); // consume body
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

    // Cache the result
    if (dataSource !== 'fallback') {
      setCachedPrice(cacheKey, priceData, dataSource);
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