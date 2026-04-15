import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Enhanced commodity mappings with categories and contract specs
const COMMODITY_SYMBOLS: Record<string, { symbol: string; category: string; contractSize: string; venue: string }> = {
  // Energy — Crude Oil Benchmarks
  'WTI Crude Oil': { symbol: 'CL=F', category: 'energy', contractSize: '1,000 bbl', venue: 'NYMEX' },
  'Brent Crude Oil': { symbol: 'BZ=F', category: 'energy', contractSize: '1,000 bbl', venue: 'ICE' },
  'Crude Oil Dubai': { symbol: 'DC=F', category: 'energy', contractSize: '1,000 bbl', venue: 'DME' },
  'DME Oman Crude': { symbol: 'OQD=F', category: 'energy', contractSize: '1,000 bbl', venue: 'DME' },
  'Murban Crude': { symbol: 'MUR=F', category: 'energy', contractSize: '1,000 bbl', venue: 'ICE' },
  'OPEC Basket': { symbol: 'OPEC=X', category: 'energy', contractSize: '1 bbl', venue: 'OPEC' },
  'Indian Basket': { symbol: 'INB=X', category: 'energy', contractSize: '1 bbl', venue: 'PPAC' },
  'Tapis Crude Oil': { symbol: 'TAP=F', category: 'energy', contractSize: '1,000 bbl', venue: 'SGX' },
  'Urals Crude Oil': { symbol: 'URL=F', category: 'energy', contractSize: '1,000 bbl', venue: 'ICE' },
  'Western Canadian Select': { symbol: 'WCS=F', category: 'energy', contractSize: '1,000 bbl', venue: 'CME' },
  // Regional Crude Benchmarks
  'WTI Midland': { symbol: 'WTIM=F', category: 'energy', contractSize: '1,000 bbl', venue: 'CME' },
  'Alaska North Slope': { symbol: 'ANS=F', category: 'energy', contractSize: '1,000 bbl', venue: 'ICE' },
  'Mars Blend': { symbol: 'MARS=F', category: 'energy', contractSize: '1,000 bbl', venue: 'CME' },
  'Louisiana Light Sweet': { symbol: 'LLS=F', category: 'energy', contractSize: '1,000 bbl', venue: 'CME' },
  // Natural Gas & LNG
  'Natural Gas': { symbol: 'NG=F', category: 'energy', contractSize: '10,000 MMBtu', venue: 'NYMEX' },
  'Natural Gas UK': { symbol: 'M.GB=F', category: 'energy', contractSize: '1,000 therms', venue: 'ICE' },
  'Dutch TTF Gas': { symbol: 'TTF=F', category: 'energy', contractSize: '1 MWh', venue: 'ICE' },
  'Japan/Korea LNG': { symbol: 'JKM=F', category: 'energy', contractSize: '10,000 MMBtu', venue: 'ICE' },
  // Refined Products
  'Gasoline RBOB': { symbol: 'RB=F', category: 'energy', contractSize: '42,000 gal', venue: 'NYMEX' },
  'Heating Oil': { symbol: 'HO=F', category: 'energy', contractSize: '42,000 gal', venue: 'NYMEX' },
  'Jet Fuel': { symbol: 'JET=F', category: 'energy', contractSize: '42,000 gal', venue: 'NYMEX' },
  'ULSD Diesel': { symbol: 'ULSD=F', category: 'energy', contractSize: '42,000 gal', venue: 'NYMEX' },
  'Gasoil': { symbol: 'GO=F', category: 'energy', contractSize: '1 MT', venue: 'ICE' },
  'Naphtha': { symbol: 'NAP=F', category: 'energy', contractSize: '1 MT', venue: 'ICE' },
  'Propane': { symbol: 'PRP=F', category: 'energy', contractSize: '42,000 gal', venue: 'NYMEX' },
  'Ethanol': { symbol: 'ETH=F', category: 'energy', contractSize: '29,000 gal', venue: 'CBOT' },
  'US Gas Storage': { symbol: 'NGS=X', category: 'energy', contractSize: '1 Bcf', venue: 'EIA' },
  // Marine Fuels
  'VLSFO Global': { symbol: 'VLSFO=X', category: 'energy', contractSize: '1 MT', venue: 'Global' },
  'HFO 380 Global': { symbol: 'HFO380=X', category: 'energy', contractSize: '1 MT', venue: 'Global' },
  'MGO 0.5%S Global': { symbol: 'MGO05S=X', category: 'energy', contractSize: '1 MT', venue: 'Global' },
  'HFO 380 Rotterdam': { symbol: 'HFO380RTM=X', category: 'energy', contractSize: '1 MT', venue: 'Rotterdam' },
  'VLSFO Singapore': { symbol: 'VLSFOSGP=X', category: 'energy', contractSize: '1 MT', venue: 'Singapore' },
  'MGO Houston': { symbol: 'MGOHOU=X', category: 'energy', contractSize: '1 MT', venue: 'Houston' },
  'VLSFO Fujairah': { symbol: 'VLSFOFUJ=X', category: 'energy', contractSize: '1 MT', venue: 'Fujairah' },
  
  // Precious Metals
  'Gold Futures': { symbol: 'GC=F', category: 'metals', contractSize: '100 oz', venue: 'COMEX' },
  'Silver Futures': { symbol: 'SI=F', category: 'metals', contractSize: '5,000 oz', venue: 'COMEX' },
  'Platinum': { symbol: 'PL=F', category: 'metals', contractSize: '50 oz', venue: 'NYMEX' },
  'Palladium': { symbol: 'PA=F', category: 'metals', contractSize: '100 oz', venue: 'NYMEX' },
  
  // Base Metals
  'Copper': { symbol: 'HG=F', category: 'metals', contractSize: '25,000 lbs', venue: 'COMEX' },
  'Aluminum': { symbol: 'ALI=F', category: 'metals', contractSize: '25 MT', venue: 'LME' },
  'Zinc': { symbol: 'ZS=F', category: 'metals', contractSize: '25 MT', venue: 'LME' },
  
  // Grains & Agriculture
  'Corn Futures': { symbol: 'ZC=F', category: 'grains', contractSize: '5,000 bu', venue: 'CBOT' },
  'Soybean Futures': { symbol: 'ZS=F', category: 'grains', contractSize: '5,000 bu', venue: 'CBOT' },
  'Soybean Oil': { symbol: 'ZL=F', category: 'grains', contractSize: '60,000 lbs', venue: 'CBOT' },
  'Soybean Meal': { symbol: 'ZM=F', category: 'grains', contractSize: '100 tons', venue: 'CBOT' },
  'Oat Futures': { symbol: 'ZO=F', category: 'grains', contractSize: '5,000 bu', venue: 'CBOT' },
  'Rough Rice': { symbol: 'ZR=F', category: 'grains', contractSize: '2,000 cwt', venue: 'CBOT' },
  
  // Livestock & Dairy
  'Live Cattle Futures': { symbol: 'LE=F', category: 'livestock', contractSize: '40,000 lbs', venue: 'CME' },
  'Feeder Cattle Futures': { symbol: 'GF=F', category: 'livestock', contractSize: '50,000 lbs', venue: 'CME' },
  'Lean Hogs Futures': { symbol: 'HE=F', category: 'livestock', contractSize: '40,000 lbs', venue: 'CME' },
  'Milk Class III': { symbol: 'DC=F', category: 'livestock', contractSize: '200,000 lbs', venue: 'CME' },
  
  // Soft Commodities
  'Coffee Arabica': { symbol: 'KC=F', category: 'softs', contractSize: '37,500 lbs', venue: 'ICE' },
  'Sugar #11': { symbol: 'SB=F', category: 'softs', contractSize: '112,000 lbs', venue: 'ICE' },
  'Cotton': { symbol: 'CT=F', category: 'softs', contractSize: '50,000 lbs', venue: 'ICE' },
  'Cocoa': { symbol: 'CC=F', category: 'softs', contractSize: '10 MT', venue: 'ICE' },
  'Orange Juice': { symbol: 'OJ=F', category: 'softs', contractSize: '15,000 lbs', venue: 'ICE' },
  
  // Forest Products
  'Lumber Futures': { symbol: 'LBS=F', category: 'forest', contractSize: '110,000 bd ft', venue: 'CME' },
  'Random Length Lumber': { symbol: 'LB=F', category: 'forest', contractSize: '110,000 bd ft', venue: 'CME' },
};

// CommodityPriceAPI symbol mapping - only for commodities we support
const COMMODITY_PRICE_API_SYMBOLS: Record<string, string> = {
  // Precious Metals
  'XAU': 'Gold Futures', 'XAG': 'Silver Futures', 'XPT': 'Platinum', 'XPD': 'Palladium',
  // Base Metals
  'HG': 'Copper', 'ALU': 'Aluminum', 'ZNC': 'Zinc',
  // Energy
  'WTIOIL': 'WTI Crude Oil', 'BRENTOIL': 'Brent Crude Oil', 'NG': 'Natural Gas',
  'HO': 'Heating Oil', 'RB': 'Gasoline RBOB',
  // Grains
  'CORN': 'Corn Futures', 'SOYBEAN': 'Soybean Futures',
  'ZL': 'Soybean Oil', 'ZM': 'Soybean Meal', 'OAT': 'Oat Futures', 'RR': 'Rough Rice',
  // Softs
  'CA': 'Coffee Arabica', 'LS': 'Sugar #11', 'CT': 'Cotton', 'CC': 'Cocoa', 'OJ': 'Orange Juice',
  // Livestock
  'CATTLE': 'Live Cattle Futures', 'HOGS': 'Lean Hogs Futures',
  // Other
  'LUMBER': 'Lumber Futures',
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
    let isPremium = false;

    if (user) {
      // Check for premium subscription
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('subscription_active, subscription_tier')
        .eq('id', user.id)
        .single()

      isPremium = profile?.subscription_active && profile?.subscription_tier === 'premium';
    }

    const body = req.method === 'POST' ? await req.json() : {}
    const { dataDelay = 'realtime' } = body
    
    let commoditiesData: any[] = []
    let dataSource = 'fallback';

    // ALL energy commodities are reserved for OilPriceAPI — never use FMP for energy
    const OIL_API_ONLY_NAMES = new Set([
      'WTI Crude Oil', 'Brent Crude Oil', 'Natural Gas', 'Gasoline RBOB', 'Heating Oil',
      'Natural Gas UK',
      'Crude Oil Dubai', 'Tapis Crude Oil', 'Western Canadian Select', 'Urals Crude Oil',
      'Jet Fuel', 'ULSD Diesel', 'Dutch TTF Gas', 'Japan/Korea LNG', 'US Gas Storage',
      'VLSFO Global', 'HFO 380 Global', 'MGO 0.5%S Global', 'HFO 380 Rotterdam',
      'VLSFO Singapore', 'MGO Houston', 'VLSFO Fujairah',
    ]);

    // ALL energy products use OilPriceAPI exclusively
    const OIL_API_BLENDS: Record<string, string> = {
      'WTI Crude Oil': 'WTI_USD',
      'Brent Crude Oil': 'BRENT_CRUDE_USD',
      'Natural Gas': 'NATURAL_GAS_USD',
      'Gasoline RBOB': 'GASOLINE_RBOB_USD',
      'Heating Oil': 'HEATING_OIL_USD',
      'Crude Oil Dubai': 'DUBAI_CRUDE_USD',
      'Tapis Crude Oil': 'TAPIS_CRUDE_USD',
      'Western Canadian Select': 'WCS_CRUDE_USD',
      'Urals Crude Oil': 'URALS_CRUDE_USD',
      'Jet Fuel': 'JET_FUEL_USD',
      'ULSD Diesel': 'ULSD_DIESEL_USD',
      'Natural Gas UK': 'NATURAL_GAS_GBP',
      'Dutch TTF Gas': 'DUTCH_TTF_EUR',
      'Japan/Korea LNG': 'JKM_LNG_USD',
      'US Gas Storage': 'NATURAL_GAS_STORAGE',
      'VLSFO Global': 'VLSFO_USD',
      'HFO 380 Global': 'HFO_380_USD',
      'MGO 0.5%S Global': 'MGO_05S_USD',
      'HFO 380 Rotterdam': 'HFO_380_NLRTM_USD',
      'VLSFO Singapore': 'VLSFO_SGSIN_USD',
      'MGO Houston': 'MGO_05S_USHOU_USD',
      'VLSFO Fujairah': 'VLSFO_AEFUJ_USD',
    };

    // Step 1: Fetch energy commodities from OilPriceAPI (independent of FMP)
    const oilApiKey = Deno.env.get('OIL_PRICE_API_KEY');
    if (oilApiKey) {
      try {
        console.log('Fetching energy commodities from OilPriceAPI...');
        const oilApiFetches = Object.entries(OIL_API_BLENDS)
          .filter(([name]) => COMMODITY_SYMBOLS[name])
          .map(async ([name, code]) => {
            try {
              const resp = await fetch(
                `https://api.oilpriceapi.com/v1/prices/latest?by_code=${code}`,
                { headers: { 'Authorization': `Token ${oilApiKey}` } }
              );
              if (!resp.ok) {
                const errText = await resp.text();
                console.warn(`OilPriceAPI ${code}: ${resp.status} - ${errText}`);
                return null;
              }
              const result = await resp.json();
              if (result.data?.price) {
                return {
                  name,
                  symbol: COMMODITY_SYMBOLS[name].symbol,
                  price: result.data.price,
                  change: 0,
                  changePercent: 0,
                  volume: 0,
                  ...COMMODITY_SYMBOLS[name],
                  supportedByFMP: false,
                  source: 'oilpriceapi',
                };
              }
            } catch (err) {
              console.warn(`OilPriceAPI fetch failed for ${code}:`, err);
            }
            return null;
          });

        const oilApiResults = await Promise.all(oilApiFetches);
        for (const result of oilApiResults) {
          if (result) {
            commoditiesData.push(result);
          }
        }
        console.log(`OilPriceAPI: loaded ${commoditiesData.length} energy commodities`);
        if (commoditiesData.length > 0) dataSource = 'oilpriceapi';
      } catch (err) {
        console.warn('OilPriceAPI batch fetch failed:', err);
      }
    }

    // Step 2: Fetch non-energy commodities from CommodityPriceAPI (primary) or FMP (secondary)
    const existingNames = new Set(commoditiesData.map(c => c.name));
    let nonEnergyLoaded = false;

    // Try CommodityPriceAPI first for non-energy commodities
    const commodityPriceApiKey = Deno.env.get('COMMODITYPRICE_API_KEY');
    if (commodityPriceApiKey && !nonEnergyLoaded) {
      try {
        console.log('Trying CommodityPriceAPI for non-energy symbols');
        // Build reverse mapping: API symbol -> our commodity name (non-energy only)
        const nonEnergySymbols = Object.entries(COMMODITY_PRICE_API_SYMBOLS)
          .filter(([_, name]) => !OIL_API_ONLY_NAMES.has(name) && COMMODITY_SYMBOLS[name] && !existingNames.has(name));
        
        // Fetch prices for each symbol
        const fetchPromises = nonEnergySymbols.map(async ([apiSymbol, commodityName]) => {
          try {
            const resp = await fetch(
              `https://api.commoditypriceapi.com/api/latest?base=USD&symbols=${apiSymbol}`,
              { headers: { 'Authorization': `Bearer ${commodityPriceApiKey}` } }
            );
            if (!resp.ok) {
              await resp.text();
              return null;
            }
            const result = await resp.json();
            if (result.data && result.data[apiSymbol]) {
              const price = 1 / result.data[apiSymbol]; // API returns USD per unit inverse
              return {
                name: commodityName,
                symbol: COMMODITY_SYMBOLS[commodityName].symbol,
                price: Math.round(price * 100) / 100,
                change: 0,
                changePercent: 0,
                volume: 0,
                ...COMMODITY_SYMBOLS[commodityName],
                supportedByFMP: false,
                source: 'commoditypriceapi',
              };
            }
          } catch (err) {
            // Silently skip
          }
          return null;
        });

        const results = await Promise.all(fetchPromises);
        const validResults = results.filter(Boolean);
        if (validResults.length > 0) {
          commoditiesData.push(...validResults);
          validResults.forEach(r => existingNames.add(r.name));
          nonEnergyLoaded = true;
          dataSource = commoditiesData.length > validResults.length ? 'mixed' : 'commoditypriceapi';
          console.log(`CommodityPriceAPI: loaded ${validResults.length} non-energy commodities`);
        }
      } catch (error) {
        console.warn('CommodityPriceAPI failed:', error);
      }
    }

    // Always try FMP for any non-energy commodities not yet loaded
    {
      const fmpApiKey = Deno.env.get('FMP_API_KEY');
      if (fmpApiKey && fmpApiKey !== 'demo') {
        try {
          // Map our commodity names to FMP-compatible symbols
          const FMP_SYMBOL_MAP: Record<string, string> = {
            // Metals (USD suffix)
            'Gold Futures': 'GCUSD', 'Silver Futures': 'SIUSD', 'Platinum': 'PLUSD',
            'Palladium': 'PAUSD', 'Copper': 'HGUSD',
            'Aluminum': 'ALIUSD', 'Zinc': 'ZNUSD',
            // Grains (USX suffix for CME/CBOT grains)
            'Corn Futures': 'ZCUSX', 'Soybean Futures': 'ZSUSX',
            'Soybean Oil': 'ZLUSX', 'Soybean Meal': 'ZMUSD', 'Oat Futures': 'ZOUSX',
            'Rough Rice': 'ZRUSD',
            // Softs
            'Coffee Arabica': 'KCUSX', 'Sugar #11': 'SBUSD', 'Cotton': 'CTUSX',
            'Cocoa': 'CCUSD', 'Orange Juice': 'OJUSX',
            // Livestock (USX suffix)
            'Live Cattle Futures': 'LEUSX', 'Lean Hogs Futures': 'HEUSX',
            'Feeder Cattle Futures': 'GFUSX',
            // Other
            'Lumber Futures': 'LBSUSD', 'Random Length Lumber': 'LBUSD',
            'Milk Class III': 'DCUSD',
          };

          const entriesToFetch = Object.entries(FMP_SYMBOL_MAP)
            .filter(([name]) => !existingNames.has(name) && COMMODITY_SYMBOLS[name]);

          if (entriesToFetch.length > 0) {
            const symbolList = entriesToFetch.map(([_, sym]) => sym).join(',');
            console.log(`FMP: fetching ${entriesToFetch.length} symbols via /quote batch: ${symbolList}`);
            
            const response = await fetch(
              `https://financialmodelingprep.com/api/v3/quote/${symbolList}?apikey=${fmpApiKey}`
            );
            
            console.log(`FMP /quote response status: ${response.status}`);
            
            if (response.ok) {
              const data = await response.json();
              
              if (Array.isArray(data) && data.length > 0) {
                console.log(`FMP /quote returned ${data.length} results`);
                
                for (const fmpItem of data) {
                  const matched = entriesToFetch.find(([_, sym]) => sym === fmpItem.symbol);
                  if (matched && !existingNames.has(matched[0])) {
                    const meta = COMMODITY_SYMBOLS[matched[0]];
                    commoditiesData.push({
                      name: matched[0],
                      symbol: meta.symbol,
                      price: parseFloat(fmpItem.price) || 0,
                      change: parseFloat(fmpItem.change) || 0,
                      changePercent: parseFloat(fmpItem.changesPercentage) || 0,
                      volume: parseInt(fmpItem.volume) || 0,
                      ...meta,
                      supportedByFMP: true,
                      source: 'fmp',
                    });
                    existingNames.add(matched[0]);
                  }
                }
                
                nonEnergyLoaded = commoditiesData.length > 22;
                dataSource = 'mixed';
                console.log(`FMP: successfully loaded ${data.length} non-energy commodities with real prices`);
              }
            } else {
              const errorBody = await response.text();
              console.warn(`FMP /quote error: ${response.status} - ${errorBody.substring(0, 200)}`);
            }
          }
        } catch (error) {
          console.warn('FMP API failed:', error);
        }
      }
    }

    // Step 3: Any remaining commodities in COMMODITY_SYMBOLS that weren't loaded get added with price 0
    {
      const remaining = Object.entries(COMMODITY_SYMBOLS)
        .filter(([name, info]) => !OIL_API_ONLY_NAMES.has(name) && info.category !== 'energy' && !existingNames.has(name))
        .map(([name, info]) => ({
          name,
          symbol: info.symbol,
          price: 0,
          change: 0,
          changePercent: 0,
          volume: 0,
          ...info,
          supportedByFMP: false,
          source: 'static',
        }));
      
      if (remaining.length > 0) {
        commoditiesData.push(...remaining);
        console.log(`Static fallback: added ${remaining.length} remaining non-energy commodities`);
      }
    }

    // Apply data delay for free users
    if (dataDelay === '15min') {
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
      console.log(`Applying 15-minute delay - simulating data from ${fifteenMinutesAgo.toISOString()}`);
    }

    const currentTimestamp = dataDelay === '15min' 
      ? new Date(Date.now() - 15 * 60 * 1000).toISOString()
      : new Date().toISOString();

    return new Response(
      JSON.stringify({ 
        commodities: commoditiesData,
        source: dataSource,
        count: commoditiesData.length,
        timestamp: currentTimestamp,
        dataDelay: dataDelay,
        isDelayed: dataDelay === '15min',
        usedFMP: dataSource === 'fmp'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in fetch-commodity-symbols function:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch commodity symbols' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
