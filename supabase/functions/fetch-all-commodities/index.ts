import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

// Mapping of CommodityPriceAPI symbols to our commodity names - MUST match frontend
const COMMODITY_PRICE_API_SYMBOLS: Record<string, string> = {
  // Precious Metals
  'XAU': 'Gold Futures',
  'XAG': 'Silver Futures', 
  'XPT': 'Platinum',
  'XPD': 'Palladium',
  'XRH': 'Rhodium',
  
  // Base Metals
  'HG': 'Copper',
  'ALU': 'Aluminum',
  'AL': 'Aluminum LME',
  'ZNC': 'Zinc',
  'ZINC': 'Zinc LME',
  'LEAD': 'Lead',
  'NICKEL': 'Nickel',
  'TIN': 'Tin',
  'STEEL': 'Steel',
  'HRC-STEEL': 'Hot-Rolled Coil Steel',
  'TIOC': 'Iron Ore 62% FE',
  'MG': 'Magnesium',
  
  // Industrial/Tech Metals
  'LC': 'Lithium',
  'COB': 'Cobalt',
  'TITAN': 'Titanium',
  'GA': 'Gallium',
  'INDIUM': 'Indium',
  'TEL': 'Tellurium',
  'NDYM': 'Neodymium',
  
  // Energy
  'WTIOIL': 'Crude Oil',
  'BRENTOIL': 'Brent Crude Oil',
  'DBLC1': 'Crude Oil Dubai',
  'URAL-OIL': 'Ural Oil',
  'NG': 'Natural Gas',
  'NGUS': 'Natural Gas US',
  'NGEU': 'Natural Gas Europe',
  'LNG': 'Liquefied Natural Gas Japan',
  'TTF-GAS': 'TTF Gas',
  'UK-GAS': 'UK Gas',
  'HO': 'Heating Oil',
  'RB': 'Gasoline RBOB',
  'LGO': 'Gas Oil',
  'COAL': 'Coal',
  'AUCOAL': 'Coal Australia',
  'RB1COAL': 'Coal South Africa',
  'UXA': 'Uranium',
  'ETHANOL': 'Ethanol',
  'METH': 'Methanol',
  'PROP': 'Propane',
  'NAPHTHA': 'Naphtha',
  
  // Grains & Agriculture
  'CORN': 'Corn Futures',
  'ZW': 'Wheat Futures',
  'SOYBEAN': 'Soybean Futures',
  'ZL': 'Soybean Oil',
  'ZM': 'Soybean Meal',
  'OAT': 'Oat Futures',
  'RR': 'Rough Rice',
  'CANOLA': 'Canola',
  
  // Soft Commodities
  'LS': 'Sugar',
  'CT': 'Cotton',
  'CA': 'Coffee Arabica',
  'CR': 'Coffee Robusta',
  'CC': 'Cocoa',
  'TEA': 'Tea',
  'TEAK': 'Tea Kolkata',
  'TEAC': 'Tea Colombo',
  'TEAM': 'Tea Mombasa',
  
  // Oils & Fats
  'PO': 'Palm Oil',
  'SUNF': 'Sunflower Oil',
  'RSO': 'Rapeseed Oil',
  'CO': 'Coconut Oil',
  
  // Livestock & Dairy
  'CATTLE': 'Live Cattle Futures',
  'HOGS': 'Lean Hogs Futures',
  'MILK': 'Milk',
  'CHE': 'Cheese',
  'BUTTER': 'Butter',
  'EGGS-US': 'Eggs US',
  'EGGS-CH': 'Eggs China',
  'POUL': 'Poultry',
  'SALMON': 'Salmon',
  'FM': 'Fish Meal',
  
  // Industrial Materials
  'LB': 'Lumber',
  'RUBBER': 'Rubber',
  'WOOL': 'Wool',
  'BIT': 'Bitumen',
  'K-PULP': 'Kraft Pulp',
  
  // Plastics & Chemicals
  'POL': 'Polyethylene',
  'PVC': 'Polyvinyl Chloride',
  'PYL': 'Polypropylene',
  'SODASH': 'Soda Ash',
  'UREA': 'Urea',
  'DIAPH': 'Diammonium Phosphate',
  
  // Food & Agriculture
  'POTATO': 'Potato',
  'OJ': 'Orange Juice'
};

// Auto-categorize function for new symbols
const categorizeSymbol = (symbol: string): { category: string; contractSize: string; venue: string } => {
  const lowerSymbol = symbol.toLowerCase();
  
  if (lowerSymbol.includes('oil') || lowerSymbol.includes('gas') || lowerSymbol.includes('petroleum') || 
      lowerSymbol.includes('gasoline') || lowerSymbol.includes('heating') || lowerSymbol.includes('propane') ||
      lowerSymbol.includes('ethanol') || lowerSymbol.includes('lng') || lowerSymbol.includes('coal')) {
    return { category: 'energy', contractSize: 'TBD', venue: 'Various' };
  }
  
  if (lowerSymbol.includes('gold') || lowerSymbol.includes('silver') || lowerSymbol.includes('copper') ||
      lowerSymbol.includes('platinum') || lowerSymbol.includes('palladium') || lowerSymbol.includes('aluminum') ||
      lowerSymbol.includes('zinc') || lowerSymbol.includes('nickel') || lowerSymbol.includes('lead') ||
      lowerSymbol.includes('tin') || lowerSymbol.includes('iron') || lowerSymbol.includes('steel') ||
      lowerSymbol.includes('uranium') || lowerSymbol.includes('lithium') || lowerSymbol.includes('cobalt')) {
    return { category: 'metals', contractSize: 'TBD', venue: 'Various' };
  }
  
  if (lowerSymbol.includes('corn') || lowerSymbol.includes('wheat') || lowerSymbol.includes('soybean') ||
      lowerSymbol.includes('rice') || lowerSymbol.includes('oat') || lowerSymbol.includes('barley') ||
      lowerSymbol.includes('rye') || lowerSymbol.includes('millet') || lowerSymbol.includes('sorghum') ||
      lowerSymbol.includes('quinoa') || lowerSymbol.includes('buckwheat')) {
    return { category: 'grains', contractSize: 'TBD', venue: 'Various' };
  }
  
  if (lowerSymbol.includes('cattle') || lowerSymbol.includes('hog') || lowerSymbol.includes('beef') ||
      lowerSymbol.includes('pork') || lowerSymbol.includes('lamb') || lowerSymbol.includes('chicken') ||
      lowerSymbol.includes('turkey') || lowerSymbol.includes('duck') || lowerSymbol.includes('milk') ||
      lowerSymbol.includes('cheese') || lowerSymbol.includes('butter') || lowerSymbol.includes('eggs')) {
    return { category: 'livestock', contractSize: 'TBD', venue: 'Various' };
  }
  
  if (lowerSymbol.includes('coffee') || lowerSymbol.includes('sugar') || lowerSymbol.includes('cotton') ||
      lowerSymbol.includes('cocoa') || lowerSymbol.includes('orange') || lowerSymbol.includes('tea') ||
      lowerSymbol.includes('vanilla') || lowerSymbol.includes('pepper') || lowerSymbol.includes('cinnamon') ||
      lowerSymbol.includes('rubber') || lowerSymbol.includes('tobacco')) {
    return { category: 'softs', contractSize: 'TBD', venue: 'Various' };
  }
  
  if (lowerSymbol.includes('lumber') || lowerSymbol.includes('wood') || lowerSymbol.includes('timber') ||
      lowerSymbol.includes('plywood') || lowerSymbol.includes('hardwood') || lowerSymbol.includes('softwood')) {
    return { category: 'lumber', contractSize: 'TBD', venue: 'Various' };
  }
  
  return { category: 'other', contractSize: 'TBD', venue: 'Various' };
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
    
    console.log(`Fetching all commodities with ${dataDelay} data`)

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Check if user is authenticated and premium
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    let isPremium = false;
    let commodityPriceAPIKey = null;
    
    if (user && !userError) {
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('subscription_active, subscription_tier, commodity_price_api_credentials')
        .eq('id', user.id)
        .single();
      
      isPremium = profile?.subscription_active && profile?.subscription_tier === 'premium';
      commodityPriceAPIKey = profile?.commodity_price_api_credentials;
    }

    let commoditiesData: any[] = []
    let dataSource = 'fallback';

    // Try CommodityPriceAPI first if premium user with credentials
    if (isPremium && commodityPriceAPIKey) {
      try {
        console.log('Using CommodityPriceAPI for commodities (premium user with credentials)');
        
        // Decrypt the API key
        const { data: decryptedKey, error: decryptError } = await supabaseClient.functions.invoke('decrypt-api-key', {
          body: { encryptedKey: commodityPriceAPIKey }
        });
        
        if (decryptError || !decryptedKey) {
          console.error('Failed to decrypt CommodityPriceAPI key:', decryptError);
          throw new Error('Failed to decrypt CommodityPriceAPI key');
        }

        console.log('Successfully decrypted API key, length:', decryptedKey.key?.length);

        console.log('Fetching commodity prices from CommodityPriceAPI');
        
        // Get prices for the symbols we support
        const supportedSymbols = Object.keys(COMMODITY_PRICE_API_SYMBOLS);
        const symbolsQuery = supportedSymbols.join(',');
        
        console.log(`Requesting prices for symbols: ${symbolsQuery}`);
        
        const pricesResponse = await fetch(`https://api.commoditypriceapi.com/v2/rates/latest?symbols=${symbolsQuery}`, {
          headers: {
            'x-api-key': decryptedKey.key,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('CommodityPriceAPI prices response status:', pricesResponse.status);
        
        if (!pricesResponse.ok) {
          const errorText = await pricesResponse.text();
          console.error('CommodityPriceAPI prices error response:', errorText);
          throw new Error(`CommodityPriceAPI prices error: ${pricesResponse.status} - ${errorText}`);
        }
        
        const pricesData = await pricesResponse.json();
        
        if (pricesData.success && pricesData.rates) {
          console.log(`CommodityPriceAPI returned prices for ${Object.keys(pricesData.rates).length} symbols`);
          
          // Process all supported symbols from CommodityPriceAPI
          commoditiesData = Object.entries(COMMODITY_PRICE_API_SYMBOLS).map(([symbol, mappedName]) => {
            const price = pricesData.rates[symbol] || 0;
            
            // Get existing metadata or auto-categorize
            const existingMetadata = COMMODITY_SYMBOLS[mappedName];
            const metadata = existingMetadata || {
              symbol: symbol,
              ...categorizeSymbol(mappedName)
            };
            
            return generateEnhancedData({
              symbol: metadata.symbol,
              price: price,
              change: 0, // CommodityPriceAPI doesn't provide change data
              changePercent: 0, // CommodityPriceAPI doesn't provide change data
              volume: 0, // CommodityPriceAPI doesn't provide volume
            }, mappedName);
          });
          
          dataSource = 'commoditypriceapi';
          console.log(`Processed ${commoditiesData.length} commodities from CommodityPriceAPI`);
        } else {
          throw new Error('No price data returned from CommodityPriceAPI');
        }
      } catch (error) {
        console.error('CommodityPriceAPI failed:', error);
        throw new Error(`CommodityPriceAPI error: ${error.message}`);
      }
    } else {
      throw new Error('CommodityPriceAPI access requires premium subscription and valid API credentials');
    }

    // Use fallback data if both APIs failed
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
      
      // Use deterministic seeded randomization for consistent delayed pricing
      commoditiesData = commoditiesData.map(commodity => {
        // Create a deterministic seed based on commodity name
        const commodityHash = commodity.name.split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0)
          return a & a
        }, 0)
        const seededRandom = (Math.abs(commodityHash) % 100) / 100
        
        return {
          ...commodity,
          price: commodity.price > 0 ? commodity.price * (0.995 + seededRandom * 0.01) : 0,
          change: commodity.change * (0.9 + seededRandom * 0.2),
          changePercent: commodity.changePercent * (0.9 + seededRandom * 0.2),
        }
      });
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
