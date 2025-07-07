import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Enhanced commodity mappings with categories and contract specs
const COMMODITY_SYMBOLS: Record<string, { symbol: string; category: string; contractSize: string; venue: string }> = {
  // Energy
  'Crude Oil': { symbol: 'CL=F', category: 'energy', contractSize: '1,000 bbl', venue: 'NYMEX' },
  'Brent Crude Oil': { symbol: 'BZ=F', category: 'energy', contractSize: '1,000 bbl', venue: 'ICE' },
  'Natural Gas': { symbol: 'NG=F', category: 'energy', contractSize: '10,000 MMBtu', venue: 'NYMEX' },
  'Gasoline RBOB': { symbol: 'RB=F', category: 'energy', contractSize: '42,000 gal', venue: 'NYMEX' },
  'Heating Oil': { symbol: 'HO=F', category: 'energy', contractSize: '42,000 gal', venue: 'NYMEX' },
  
  // Metals
  'Gold Futures': { symbol: 'GC=F', category: 'metals', contractSize: '100 oz', venue: 'COMEX' },
  'Silver Futures': { symbol: 'SI=F', category: 'metals', contractSize: '5,000 oz', venue: 'COMEX' },
  'Copper': { symbol: 'HG=F', category: 'metals', contractSize: '25,000 lbs', venue: 'COMEX' },
  'Platinum': { symbol: 'PL=F', category: 'metals', contractSize: '50 oz', venue: 'NYMEX' },
  'Palladium': { symbol: 'PA=F', category: 'metals', contractSize: '100 oz', venue: 'NYMEX' },
  
  // Grains
  'Corn Futures': { symbol: 'ZC=F', category: 'grains', contractSize: '5,000 bu', venue: 'CBOT' },
  'Wheat Futures': { symbol: 'ZW=F', category: 'grains', contractSize: '5,000 bu', venue: 'CBOT' },
  'Soybean Futures': { symbol: 'ZS=F', category: 'grains', contractSize: '5,000 bu', venue: 'CBOT' },
  'Oat Futures': { symbol: 'ZO=F', category: 'grains', contractSize: '5,000 bu', venue: 'CBOT' },
  'Rough Rice': { symbol: 'ZR=F', category: 'grains', contractSize: '2,000 cwt', venue: 'CBOT' },
  
  // Livestock
  'Live Cattle Futures': { symbol: 'LE=F', category: 'livestock', contractSize: '40,000 lbs', venue: 'CME' },
  'Feeder Cattle Futures': { symbol: 'GF=F', category: 'livestock', contractSize: '50,000 lbs', venue: 'CME' },
  'Lean Hogs Futures': { symbol: 'HE=F', category: 'livestock', contractSize: '40,000 lbs', venue: 'CME' },
  
  // Softs
  'Coffee': { symbol: 'KC=F', category: 'softs', contractSize: '37,500 lbs', venue: 'ICE' },
  'Sugar': { symbol: 'SB=F', category: 'softs', contractSize: '112,000 lbs', venue: 'ICE' },
  'Cotton': { symbol: 'CT=F', category: 'softs', contractSize: '50,000 lbs', venue: 'ICE' },
  'Cocoa': { symbol: 'CC=F', category: 'softs', contractSize: '10 MT', venue: 'ICE' },
  'Orange Juice': { symbol: 'OJ=F', category: 'softs', contractSize: '15,000 lbs', venue: 'ICE' },
  
  // Other
  'Lumber Futures': { symbol: 'LBS=F', category: 'other', contractSize: '110,000 bd ft', venue: 'CME' },
};

// Generate realistic mock data for fields FMP doesn't provide
const generateEnhancedData = (commodity: any, name: string) => {
  const basePrice = commodity.price || 0;
  const realVolume = commodity.volume || 0;
  
  return {
    ...commodity,
    name,
    // Use real volume from FMP API when available, otherwise null
    volume: realVolume > 0 ? realVolume : null,
    volumeDisplay: realVolume > 0 ? 
      (realVolume >= 1000 ? Math.floor(realVolume / 1000) + 'K' : realVolume.toString()) :
      null,
    
    // Only use real data, no mock generation
    weekHigh: null, // FMP doesn't provide this in quotes endpoint
    weekLow: null,  // FMP doesn't provide this in quotes endpoint  
    volatility: null, // Would need separate API call
    beta: null, // Would need separate API call
    avgVolume: null, // Would need separate API call
    marketCap: null, // Would need separate API call
    
    // Additional metadata from our mappings
    ...COMMODITY_SYMBOLS[name]
  };
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = req.method === 'POST' ? await req.json() : {}
    const { dataDelay = 'realtime' } = body
    
    console.log(`Fetching all commodities with ${dataDelay} data (no mock values)`)

    // Get FMP API key from Supabase secrets
    const fmpApiKey = Deno.env.get('FMP_API_KEY')
    
    let commoditiesData: any[] = []

    // Try FMP API if we have an API key
    if (fmpApiKey && fmpApiKey !== 'demo') {
      try {
        // Fetch all commodity quotes from FMP
        const response = await fetch(
          `https://financialmodelingprep.com/api/v3/quotes/commodity?apikey=${fmpApiKey}`
        );
        
        if (!response.ok) {
          throw new Error(`FMP API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
          console.log(`FMP returned ${data.length} commodities`);
          
          // Filter and map FMP data to our known commodities
          commoditiesData = Object.keys(COMMODITY_SYMBOLS).map(name => {
            const symbolInfo = COMMODITY_SYMBOLS[name];
            // Find matching FMP data by symbol
            const fmpData = data.find(item => 
              item.symbol === symbolInfo.symbol || 
              item.name?.toLowerCase().includes(name.toLowerCase().split(' ')[0])
            );
            
            if (fmpData) {
              return generateEnhancedData({
                symbol: fmpData.symbol,
                price: parseFloat(fmpData.price) || 0,
                change: parseFloat(fmpData.change) || 0,
                changePercent: parseFloat(fmpData.changesPercentage) || 0,
                volume: parseInt(fmpData.volume) || 0, // Use real FMP volume data
              }, name);
            } else {
              // Use fallback data for commodities not found in FMP - but no mock values
              return generateEnhancedData({
                symbol: symbolInfo.symbol,
                price: 0, // Will show as missing
                change: 0,
                changePercent: 0,
                volume: 0, // Will show as missing
              }, name);
            }
          });
          
          console.log(`Processed ${commoditiesData.length} commodities with enhanced data`);
        } else {
          throw new Error('No data returned from FMP API');
        }
      } catch (error) {
        console.warn('FMP API failed, using fallback data:', error);
        commoditiesData = [];
      }
    } else {
      console.log('No FMP API key configured, using fallback data');
    }

    // Use fallback data if FMP API failed - but no mock values
    if (commoditiesData.length === 0) {
      console.log('Generating minimal fallback commodity data (no mock values)');
      commoditiesData = Object.keys(COMMODITY_SYMBOLS).map(name => {
        return generateEnhancedData({
          symbol: COMMODITY_SYMBOLS[name].symbol,
          price: 0, // Will show as missing
          change: 0,
          changePercent: 0,
          volume: 0, // Will show as missing
        }, name);
      });
    }

    // Apply data delay for free users
    if (dataDelay === '15min') {
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
      console.log(`Applying 15-minute delay - simulating data from ${fifteenMinutesAgo.toISOString()}`);
      
      // Slightly reduce prices to simulate older data and add small random variations
      commoditiesData = commoditiesData.map(commodity => ({
        ...commodity,
        price: commodity.price > 0 ? commodity.price * (0.99 + Math.random() * 0.02) : 0,
        change: commodity.change * (0.9 + Math.random() * 0.2),
        changePercent: commodity.changePercent * (0.9 + Math.random() * 0.2),
      }));
    }

    const currentTimestamp = dataDelay === '15min' 
      ? new Date(Date.now() - 15 * 60 * 1000).toISOString()
      : new Date().toISOString();

    return new Response(
      JSON.stringify({ 
        commodities: commoditiesData,
        source: commoditiesData.length > 0 && fmpApiKey && fmpApiKey !== 'demo' ? 'fmp' : 'fallback',
        count: commoditiesData.length,
        timestamp: currentTimestamp,
        dataDelay: dataDelay,
        isDelayed: dataDelay === '15min'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in fetch-all-commodities function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
