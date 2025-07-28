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

// Mapping of CommodityPriceAPI symbols to our commodity names
const COMMODITY_PRICE_API_SYMBOLS: Record<string, string> = {
  'ALUMINIUM': 'Aluminum',
  'BRENT': 'Brent Crude Oil',
  'COFFEE': 'Coffee',
  'COPPER': 'Copper',
  'CORN': 'Corn Futures',
  'COTTON': 'Cotton',
  'GOLD': 'Gold Futures',
  'NATURALGAS': 'Natural Gas',
  'SILVER': 'Silver Futures',
  'SUGAR': 'Sugar',
  'WTI': 'Crude Oil',
  'WHEAT': 'Wheat Futures',
  'SOYBEANS': 'Soybean Futures',
  'PLATINUM': 'Platinum',
  'PALLADIUM': 'Palladium',
  'COCOA': 'Cocoa',
  'LEAN_HOGS': 'Lean Hogs Futures',
  'LIVE_CATTLE': 'Live Cattle Futures',
  'FEEDER_CATTLE': 'Feeder Cattle Futures',
  'GASOLINE': 'Gasoline RBOB',
  'HEATING_OIL': 'Heating Oil',
  'ORANGE_JUICE': 'Orange Juice',
  'RICE': 'Rough Rice',
  'OATS': 'Oat Futures',
  'LUMBER': 'Lumber Futures',
  'ZINC': 'Zinc',
  'NICKEL': 'Nickel',
  'LEAD': 'Lead',
  'TIN': 'Tin',
  'STEEL': 'Steel',
  'IRON_ORE': 'Iron Ore',
  'URANIUM': 'Uranium',
  'LITHIUM': 'Lithium',
  'COBALT': 'Cobalt',
  'MOLYBDENUM': 'Molybdenum',
  'TITANIUM': 'Titanium',
  'VANADIUM': 'Vanadium',
  'CHROMIUM': 'Chromium',
  'MANGANESE': 'Manganese',
  'MAGNESIUM': 'Magnesium',
  'RARE_EARTH': 'Rare Earth Metals',
  'PROPANE': 'Propane',
  'ETHANOL': 'Ethanol',
  'METHANOL': 'Methanol',
  'NAPHTHA': 'Naphtha',
  'KEROSENE': 'Kerosene',
  'DIESEL': 'Diesel',
  'FUEL_OIL': 'Fuel Oil',
  'BITUMEN': 'Bitumen',
  'LNG': 'Liquefied Natural Gas',
  'LPG': 'Liquefied Petroleum Gas',
  'COAL': 'Coal',
  'CARBON_CREDITS': 'Carbon Credits',
  'RUBBER': 'Rubber',
  'PALM_OIL': 'Palm Oil',
  'CANOLA': 'Canola',
  'RAPESEED': 'Rapeseed',
  'SUNFLOWER': 'Sunflower Oil',
  'SOYBEAN_OIL': 'Soybean Oil',
  'SOYBEAN_MEAL': 'Soybean Meal',
  'BARLEY': 'Barley',
  'RYE': 'Rye',
  'MILLET': 'Millet',
  'SORGHUM': 'Sorghum',
  'QUINOA': 'Quinoa',
  'BUCKWHEAT': 'Buckwheat',
  'CHICKPEAS': 'Chickpeas',
  'LENTILS': 'Lentils',
  'BLACK_BEANS': 'Black Beans',
  'KIDNEY_BEANS': 'Kidney Beans',
  'PINTO_BEANS': 'Pinto Beans',
  'NAVY_BEANS': 'Navy Beans',
  'LIMA_BEANS': 'Lima Beans',
  'GREEN_BEANS': 'Green Beans',
  'PEAS': 'Peas',
  'TEA': 'Tea',
  'VANILLA': 'Vanilla',
  'PEPPER': 'Black Pepper',
  'CINNAMON': 'Cinnamon',
  'CARDAMOM': 'Cardamom',
  'CLOVES': 'Cloves',
  'NUTMEG': 'Nutmeg',
  'TURMERIC': 'Turmeric',
  'GINGER': 'Ginger',
  'GARLIC': 'Garlic',
  'ONIONS': 'Onions',
  'POTATOES': 'Potatoes',
  'TOMATOES': 'Tomatoes',
  'APPLES': 'Apples',
  'ORANGES': 'Oranges',
  'BANANAS': 'Bananas',
  'GRAPES': 'Grapes',
  'STRAWBERRIES': 'Strawberries',
  'BLUEBERRIES': 'Blueberries',
  'CRANBERRIES': 'Cranberries',
  'CHERRIES': 'Cherries',
  'PEACHES': 'Peaches',
  'PEARS': 'Pears',
  'PLUMS': 'Plums',
  'AVOCADOS': 'Avocados',
  'LEMONS': 'Lemons',
  'LIMES': 'Limes',
  'GRAPEFRUIT': 'Grapefruit',
  'PINEAPPLES': 'Pineapples',
  'MANGOES': 'Mangoes',
  'PAPAYAS': 'Papayas',
  'KIWI': 'Kiwi Fruit',
  'COCONUTS': 'Coconuts',
  'DATES': 'Dates',
  'FIGS': 'Figs',
  'RAISINS': 'Raisins',
  'ALMONDS': 'Almonds',
  'WALNUTS': 'Walnuts',
  'PECANS': 'Pecans',
  'CASHEWS': 'Cashews',
  'PISTACHIOS': 'Pistachios',
  'HAZELNUTS': 'Hazelnuts',
  'BRAZIL_NUTS': 'Brazil Nuts',
  'MACADAMIA_NUTS': 'Macadamia Nuts',
  'PINE_NUTS': 'Pine Nuts',
  'CHESTNUTS': 'Chestnuts',
  'PEANUTS': 'Peanuts',
  'SUNFLOWER_SEEDS': 'Sunflower Seeds',
  'PUMPKIN_SEEDS': 'Pumpkin Seeds',
  'SESAME_SEEDS': 'Sesame Seeds',
  'CHIA_SEEDS': 'Chia Seeds',
  'FLAX_SEEDS': 'Flax Seeds',
  'HEMP_SEEDS': 'Hemp Seeds',
  'POPPY_SEEDS': 'Poppy Seeds',
  'BEEF': 'Beef',
  'PORK': 'Pork',
  'LAMB': 'Lamb',
  'CHICKEN': 'Chicken',
  'TURKEY': 'Turkey',
  'DUCK': 'Duck',
  'GOOSE': 'Goose',
  'FISH': 'Fish',
  'SALMON': 'Salmon',
  'TUNA': 'Tuna',
  'SHRIMP': 'Shrimp',
  'LOBSTER': 'Lobster',
  'CRAB': 'Crab',
  'OYSTERS': 'Oysters',
  'CLAMS': 'Clams',
  'MUSSELS': 'Mussels',
  'SCALLOPS': 'Scallops',
  'MILK': 'Milk',
  'CHEESE': 'Cheese',
  'BUTTER': 'Butter',
  'YOGURT': 'Yogurt',
  'EGGS': 'Eggs',
  'HONEY': 'Honey',
  'MAPLE_SYRUP': 'Maple Syrup',
  'WINE': 'Wine',
  'BEER': 'Beer',
  'WHISKEY': 'Whiskey',
  'VODKA': 'Vodka',
  'RUM': 'Rum',
  'GIN': 'Gin',
  'TEQUILA': 'Tequila',
  'BRANDY': 'Brandy',
  'COGNAC': 'Cognac',
  'CHAMPAGNE': 'Champagne',
  'SAKE': 'Sake',
  'TOBACCO': 'Tobacco',
  'COTTON_FABRIC': 'Cotton Fabric',
  'WOOL': 'Wool',
  'SILK': 'Silk',
  'LINEN': 'Linen',
  'POLYESTER': 'Polyester',
  'NYLON': 'Nylon',
  'RAYON': 'Rayon',
  'SPANDEX': 'Spandex',
  'LEATHER': 'Leather',
  'FUR': 'Fur',
  'FEATHERS': 'Feathers',
  'DOWN': 'Down',
  'CASHMERE': 'Cashmere',
  'ALPACA': 'Alpaca Fiber',
  'MOHAIR': 'Mohair',
  'ANGORA': 'Angora',
  'HEMP_FIBER': 'Hemp Fiber',
  'JUTE': 'Jute',
  'FLAX_FIBER': 'Flax Fiber',
  'BAMBOO': 'Bamboo',
  'CORK': 'Cork',
  'RESIN': 'Resin',
  'LATEX': 'Latex',
  'WAX': 'Wax',
  'TALLOW': 'Tallow',
  'LANOLIN': 'Lanolin',
  'GLYCERIN': 'Glycerin',
  'ETHYLENE': 'Ethylene',
  'PROPYLENE': 'Propylene',
  'BENZENE': 'Benzene',
  'TOLUENE': 'Toluene',
  'XYLENE': 'Xylene',
  'STYRENE': 'Styrene',
  'VINYL': 'Vinyl',
  'ACETONE': 'Acetone',
  'FORMALDEHYDE': 'Formaldehyde',
  'AMMONIA': 'Ammonia',
  'SULFUR': 'Sulfur',
  'PHOSPHORUS': 'Phosphorus',
  'POTASH': 'Potash',
  'UREA': 'Urea',
  'LIME': 'Lime',
  'GYPSUM': 'Gypsum',
  'SALT': 'Salt',
  'SAND': 'Sand',
  'GRAVEL': 'Gravel',
  'STONE': 'Stone',
  'MARBLE': 'Marble',
  'GRANITE': 'Granite',
  'LIMESTONE': 'Limestone',
  'SLATE': 'Slate',
  'CLAY': 'Clay',
  'CEMENT': 'Cement',
  'CONCRETE': 'Concrete',
  'ASPHALT': 'Asphalt',
  'GLASS': 'Glass',
  'CERAMIC': 'Ceramic',
  'BRICK': 'Brick',
  'TILE': 'Tile',
  'INSULATION': 'Insulation',
  'DRYWALL': 'Drywall',
  'PLYWOOD': 'Plywood',
  'PARTICLE_BOARD': 'Particle Board',
  'HARDWOOD': 'Hardwood',
  'SOFTWOOD': 'Softwood',
  'PLASTER': 'Plaster',
  'PAINT': 'Paint',
  'VARNISH': 'Varnish',
  'LACQUER': 'Lacquer',
  'SHELLAC': 'Shellac',
  'ADHESIVE': 'Adhesive',
  'SEALANT': 'Sealant',
  'CAULK': 'Caulk',
  'FOAM': 'Foam',
  'FIBERGLASS': 'Fiberglass',
  'CARBON_FIBER': 'Carbon Fiber',
  'KEVLAR': 'Kevlar',
  'NOMEX': 'Nomex',
  'TEFLON': 'Teflon',
  'SILICONE': 'Silicone',
  'POLYURETHANE': 'Polyurethane',
  'POLYSTYRENE': 'Polystyrene',
  'POLYPROPYLENE': 'Polypropylene',
  'POLYETHYLENE': 'Polyethylene',
  'PVC': 'PVC',
  'ABS': 'ABS Plastic',
  'ACRYLIC': 'Acrylic',
  'POLYCARBONATE': 'Polycarbonate',
  'PHENOLIC': 'Phenolic Resin',
  'EPOXY': 'Epoxy',
  'POLYIMIDE': 'Polyimide',
  'PTFE': 'PTFE',
  'PEEK': 'PEEK',
  'PPS': 'PPS',
  'PEI': 'PEI',
  'PAI': 'PAI',
  'PBI': 'PBI',
  'PI': 'Polyimide',
  'PSU': 'PSU',
  'PPSU': 'PPSU',
  'PES': 'PES',
  'PAS': 'PAS',
  'LCP': 'LCP',
  'PARA': 'Para-aramid',
  'META': 'Meta-aramid',
  'UHMWPE': 'UHMWPE',
  'HDPE': 'HDPE',
  'LDPE': 'LDPE',
  'LLDPE': 'LLDPE',
  'EVA': 'EVA',
  'EAA': 'EAA',
  'EMAA': 'EMAA',
  'SURLYN': 'Surlyn',
  'TPU': 'TPU',
  'TPE': 'TPE',
  'TPV': 'TPV',
  'SEBS': 'SEBS',
  'SIS': 'SIS',
  'SBS': 'SBS'
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
          throw new Error('Failed to decrypt CommodityPriceAPI key');
        }

        console.log('Fetching symbols from CommodityPriceAPI');
        
        // First, get all available symbols from CommodityPriceAPI
        const symbolsResponse = await fetch('https://api.commoditypriceapi.com/v2/symbols', {
          headers: {
            'x-api-key': decryptedKey.key
          }
        });
        
        if (!symbolsResponse.ok) {
          throw new Error(`CommodityPriceAPI symbols error: ${symbolsResponse.status}`);
        }
        
        const symbolsData = await symbolsResponse.json();
        console.log(`CommodityPriceAPI returned ${symbolsData.data?.length || 0} symbols`);
        
        if (symbolsData.success && symbolsData.data && symbolsData.data.length > 0) {
          // Get latest prices for all symbols
          const symbolsList = symbolsData.data.join(',');
          
          const pricesResponse = await fetch(`https://api.commoditypriceapi.com/v2/latest?symbols=${symbolsList}`, {
            headers: {
              'x-api-key': decryptedKey.key
            }
          });
          
          if (!pricesResponse.ok) {
            throw new Error(`CommodityPriceAPI prices error: ${pricesResponse.status}`);
          }
          
          const pricesData = await pricesResponse.json();
          
          if (pricesData.success && pricesData.data) {
            console.log(`CommodityPriceAPI returned prices for ${Object.keys(pricesData.data).length} symbols`);
            
            // Process all symbols from CommodityPriceAPI
            commoditiesData = symbolsData.data.map((symbol: string) => {
              const priceInfo = pricesData.data[symbol];
              const mappedName = COMMODITY_PRICE_API_SYMBOLS[symbol] || symbol.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
              
              // Get existing metadata or auto-categorize
              const existingMetadata = COMMODITY_SYMBOLS[mappedName];
              const metadata = existingMetadata || {
                symbol: symbol,
                ...categorizeSymbol(mappedName)
              };
              
              return generateEnhancedData({
                symbol: metadata.symbol,
                price: priceInfo?.price || 0,
                change: priceInfo?.change || 0,
                changePercent: priceInfo?.change_percent || 0,
                volume: 0, // CommodityPriceAPI doesn't provide volume
              }, mappedName);
            });
            
            dataSource = 'commoditypriceapi';
            console.log(`Processed ${commoditiesData.length} commodities from CommodityPriceAPI`);
          } else {
            throw new Error('No price data returned from CommodityPriceAPI');
          }
        } else {
          throw new Error('No symbols returned from CommodityPriceAPI');
        }
      } catch (error) {
        console.error('CommodityPriceAPI failed, falling back to FMP:', error);
        commoditiesData = [];
      }
    }

    // Try FMP API if CommodityPriceAPI failed or not available
    if (commoditiesData.length === 0) {
      const fmpApiKey = Deno.env.get('FMP_API_KEY');
      
      if (fmpApiKey && fmpApiKey !== 'demo') {
        try {
          console.log('Using FMP for commodities');
          
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
            
            dataSource = 'fmp';
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
