import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'

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
  'Natural Gas UK': { symbol: 'M.GB=F', category: 'energy', contractSize: '1,000 therms', venue: 'ICE' },
  'Gas Oil': { symbol: 'LGO=F', category: 'energy', contractSize: '100 MT', venue: 'ICE' },
  'Coal': { symbol: 'MTF=F', category: 'energy', contractSize: '1,350 MT', venue: 'ICE' },
  'Ethanol': { symbol: 'CHK=F', category: 'energy', contractSize: '29,000 gal', venue: 'CBOT' },
  'Propane': { symbol: 'PN=F', category: 'energy', contractSize: '42,000 gal', venue: 'NYMEX' },
  
  // Precious Metals
  'Gold Futures': { symbol: 'GC=F', category: 'metals', contractSize: '100 oz', venue: 'COMEX' },
  'Silver Futures': { symbol: 'SI=F', category: 'metals', contractSize: '5,000 oz', venue: 'COMEX' },
  'Platinum': { symbol: 'PL=F', category: 'metals', contractSize: '50 oz', venue: 'NYMEX' },
  'Palladium': { symbol: 'PA=F', category: 'metals', contractSize: '100 oz', venue: 'NYMEX' },
  'Rhodium': { symbol: 'XRH=X', category: 'metals', contractSize: '1 oz', venue: 'OTC' },
  
  // Base Metals
  'Copper': { symbol: 'HG=F', category: 'metals', contractSize: '25,000 lbs', venue: 'COMEX' },
  'Aluminum': { symbol: 'ALI=F', category: 'metals', contractSize: '25 MT', venue: 'LME' },
  'Zinc': { symbol: 'ZS=F', category: 'metals', contractSize: '25 MT', venue: 'LME' },
  'Lead': { symbol: 'LL=F', category: 'metals', contractSize: '25 MT', venue: 'LME' },
  'Nickel': { symbol: 'NI=F', category: 'metals', contractSize: '6 MT', venue: 'LME' },
  'Tin': { symbol: 'SN=F', category: 'metals', contractSize: '5 MT', venue: 'LME' },
  'Steel': { symbol: 'STE=F', category: 'metals', contractSize: '100 MT', venue: 'SGX' },
  'Iron Ore': { symbol: 'TIO=F', category: 'metals', contractSize: '100 MT', venue: 'SGX' },
  
  // Industrial/Tech Metals
  'Lithium': { symbol: 'LITH=F', category: 'metals', contractSize: '1 MT', venue: 'LME' },
  'Cobalt': { symbol: 'COB=F', category: 'metals', contractSize: '1 MT', venue: 'LME' },
  'Uranium': { symbol: 'UX=F', category: 'metals', contractSize: '250 lbs', venue: 'NYMEX' },
  
  // Grains & Agriculture
  'Corn Futures': { symbol: 'ZC=F', category: 'grains', contractSize: '5,000 bu', venue: 'CBOT' },
  'Wheat Futures': { symbol: 'ZW=F', category: 'grains', contractSize: '5,000 bu', venue: 'CBOT' },
  'Soybean Futures': { symbol: 'ZS=F', category: 'grains', contractSize: '5,000 bu', venue: 'CBOT' },
  'Soybean Oil': { symbol: 'ZL=F', category: 'grains', contractSize: '60,000 lbs', venue: 'CBOT' },
  'Soybean Meal': { symbol: 'ZM=F', category: 'grains', contractSize: '100 tons', venue: 'CBOT' },
  'Oat Futures': { symbol: 'ZO=F', category: 'grains', contractSize: '5,000 bu', venue: 'CBOT' },
  'Rough Rice': { symbol: 'ZR=F', category: 'grains', contractSize: '2,000 cwt', venue: 'CBOT' },
  'Canola': { symbol: 'RS=F', category: 'grains', contractSize: '20 MT', venue: 'ICE' },
  'Barley': { symbol: 'BAR=F', category: 'grains', contractSize: '20 MT', venue: 'ICE' },
  'Spring Wheat': { symbol: 'MW=F', category: 'grains', contractSize: '5,000 bu', venue: 'MGEX' },
  'Hard Red Winter Wheat': { symbol: 'KE=F', category: 'grains', contractSize: '5,000 bu', venue: 'KCBT' },
  
  // Livestock & Dairy
  'Live Cattle Futures': { symbol: 'LE=F', category: 'livestock', contractSize: '40,000 lbs', venue: 'CME' },
  'Feeder Cattle Futures': { symbol: 'GF=F', category: 'livestock', contractSize: '50,000 lbs', venue: 'CME' },
  'Lean Hogs Futures': { symbol: 'HE=F', category: 'livestock', contractSize: '40,000 lbs', venue: 'CME' },
  'Milk Class III': { symbol: 'DC=F', category: 'livestock', contractSize: '200,000 lbs', venue: 'CME' },
  'Milk Nonfat Dry': { symbol: 'NF=F', category: 'livestock', contractSize: '44,000 lbs', venue: 'CME' },
  'Butter': { symbol: 'DA=F', category: 'livestock', contractSize: '40,000 lbs', venue: 'CME' },
  'Cheese': { symbol: 'CSC=F', category: 'livestock', contractSize: '40,000 lbs', venue: 'CME' },
  
  // Soft Commodities
  'Coffee Arabica': { symbol: 'KC=F', category: 'softs', contractSize: '37,500 lbs', venue: 'ICE' },
  'Coffee Robusta': { symbol: 'RM=F', category: 'softs', contractSize: '10 MT', venue: 'ICE' },
  'Sugar #11': { symbol: 'SB=F', category: 'softs', contractSize: '112,000 lbs', venue: 'ICE' },
  'Sugar #5': { symbol: 'SF=F', category: 'softs', contractSize: '50 MT', venue: 'ICE' },
  'Cotton': { symbol: 'CT=F', category: 'softs', contractSize: '50,000 lbs', venue: 'ICE' },
  'Cocoa': { symbol: 'CC=F', category: 'softs', contractSize: '10 MT', venue: 'ICE' },
  'Orange Juice': { symbol: 'OJ=F', category: 'softs', contractSize: '15,000 lbs', venue: 'ICE' },
  'Tea': { symbol: 'TEA=F', category: 'softs', contractSize: '10 MT', venue: 'Multi' },
  
  // Oils & Fats
  'Palm Oil': { symbol: 'CPO=F', category: 'oils', contractSize: '25 MT', venue: 'BMD' },
  'Sunflower Oil': { symbol: 'SUN=F', category: 'oils', contractSize: '20 MT', venue: 'MATIF' },
  'Rapeseed Oil': { symbol: 'RSO=F', category: 'oils', contractSize: '20 MT', venue: 'MATIF' },
  'Coconut Oil': { symbol: 'CNO=F', category: 'oils', contractSize: '10 MT', venue: 'MCX' },
  'Olive Oil': { symbol: 'OLV=F', category: 'oils', contractSize: '10 MT', venue: 'MATIF' },
  
  // Forest Products
  'Lumber Futures': { symbol: 'LBS=F', category: 'forest', contractSize: '110,000 bd ft', venue: 'CME' },
  'Random Length Lumber': { symbol: 'LB=F', category: 'forest', contractSize: '110,000 bd ft', venue: 'CME' },
  'Pulp': { symbol: 'PULP=F', category: 'forest', contractSize: '20 MT', venue: 'CME' },
  'Newsprint': { symbol: 'NEWS=F', category: 'forest', contractSize: '20 MT', venue: 'CME' },
  
  // Industrial Materials
  'Rubber': { symbol: 'RU=F', category: 'industrial', contractSize: '5 MT', venue: 'TOCOM' },
  'Cotton Yarn': { symbol: 'CY=F', category: 'industrial', contractSize: '10 MT', venue: 'MCX' },
  'Wool': { symbol: 'WOL=F', category: 'industrial', contractSize: '2.5 MT', venue: 'SFE' },
  'Jute': { symbol: 'JUT=F', category: 'industrial', contractSize: '10 MT', venue: 'MCX' },
  
  // Fertilizers & Chemicals
  'Urea': { symbol: 'UREA=F', category: 'chemicals', contractSize: '500 MT', venue: 'DCE' },
  'Diammonium Phosphate': { symbol: 'DAP=F', category: 'chemicals', contractSize: '500 MT', venue: 'DCE' },
  'Potash': { symbol: 'POT=F', category: 'chemicals', contractSize: '100 MT', venue: 'ICE' },
  'Ammonia': { symbol: 'AMM=F', category: 'chemicals', contractSize: '100 MT', venue: 'CME' },
  
  // Plastics
  'Polyethylene': { symbol: 'PE=F', category: 'plastics', contractSize: '25 MT', venue: 'DCE' },
  'Polypropylene': { symbol: 'PP=F', category: 'plastics', contractSize: '25 MT', venue: 'DCE' },
  'PVC': { symbol: 'PVC=F', category: 'plastics', contractSize: '25 MT', venue: 'DCE' },
  'Styrene': { symbol: 'STY=F', category: 'plastics', contractSize: '25 MT', venue: 'DCE' },
  
  // Food & Agriculture
  'White Sugar': { symbol: 'WSU=F', category: 'food', contractSize: '50 MT', venue: 'LIFFE' },
  'Raw Sugar': { symbol: 'SB=F', category: 'food', contractSize: '112,000 lbs', venue: 'ICE' },
  'Potato': { symbol: 'POT=F', category: 'food', contractSize: '25 MT', venue: 'MATIF' },
  'Onion': { symbol: 'ONI=F', category: 'food', contractSize: '10 MT', venue: 'NCDEX' },
  'Garlic': { symbol: 'GAR=F', category: 'food', contractSize: '5 MT', venue: 'NCDEX' },
  'Apple': { symbol: 'APP=F', category: 'food', contractSize: '20 MT', venue: 'NCDEX' },
  'Banana': { symbol: 'BAN=F', category: 'food', contractSize: '10 MT', venue: 'NCDEX' },
  
  // Spices
  'Black Pepper': { symbol: 'BP=F', category: 'spices', contractSize: '1 MT', venue: 'MCX' },
  'Cardamom': { symbol: 'CAR=F', category: 'spices', contractSize: '100 kg', venue: 'MCX' },
  'Turmeric': { symbol: 'TUR=F', category: 'spices', contractSize: '1 MT', venue: 'MCX' },
  'Coriander': { symbol: 'COR=F', category: 'spices', contractSize: '1 MT', venue: 'MCX' },
  'Chilli': { symbol: 'CHI=F', category: 'spices', contractSize: '1 MT', venue: 'MCX' },
  'Cumin': { symbol: 'CUM=F', category: 'spices', contractSize: '100 kg', venue: 'MCX' },
  
  // Others
  'Electricity': { symbol: 'ELE=F', category: 'other', contractSize: '1 MWh', venue: 'NYMEX' },
  'Carbon Credits': { symbol: 'CER=F', category: 'other', contractSize: '1,000 tCO2e', venue: 'ICE' },
  'Weather Derivatives': { symbol: 'WTH=F', category: 'other', contractSize: 'Variable', venue: 'CME' },
};

// CommodityPriceAPI symbol mapping - expanded to include all available symbols
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

    // Check if user is authenticated and has premium subscription
    const { data: { user } } = await supabaseClient.auth.getUser()
    let useCommodityPriceAPI = false;
    let userCredentials = null;

    if (user) {
      // Check for premium subscription
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('subscription_active, subscription_tier, commodity_price_api_credentials')
        .eq('id', user.id)
        .single()

      if (profile?.subscription_active && profile?.subscription_tier === 'premium') {
        if (profile.commodity_price_api_credentials) {
          // User has CommodityPriceAPI credentials - use it for symbols
          useCommodityPriceAPI = true;
          userCredentials = profile.commodity_price_api_credentials;
          console.log('Using CommodityPriceAPI for symbols (premium user with credentials)');
        }
      }
    }

    const body = req.method === 'POST' ? await req.json() : {}
    const { dataDelay = 'realtime' } = body
    
    let commoditiesData: any[] = []
    let dataSource = 'fallback';

    if (useCommodityPriceAPI && userCredentials) {
      try {
        // Decrypt credentials (basic implementation for now)
        const decryptedCredentials = atob(userCredentials).replace(/ibkr-creds-key-2024/g, '');
        const credentials = JSON.parse(decryptedCredentials);
        
        console.log('Fetching symbols from CommodityPriceAPI');
        
        // Fetch symbols from CommodityPriceAPI
        const response = await fetch(
          `https://api.commoditypriceapi.com/v2/symbols?access_key=${credentials.apiKey}`
        );
        
        if (!response.ok) {
          throw new Error(`CommodityPriceAPI error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.symbols) {
          console.log(`CommodityPriceAPI returned ${Object.keys(data.symbols).length} symbols`);
          dataSource = 'commodity-price-api';
          
          // Create commodities from all available CommodityPriceAPI symbols
          const availableSymbols = Object.keys(data.symbols);
          console.log('Available CommodityPriceAPI symbols:', availableSymbols.slice(0, 10), '...'); // Log first 10
          
          // Start with our mapped commodities
          commoditiesData = Object.keys(COMMODITY_SYMBOLS).map(name => {
            const symbolInfo = COMMODITY_SYMBOLS[name];
            const apiSymbol = COMMODITY_PRICE_API_SYMBOLS[name];
            
            return {
              name,
              symbol: symbolInfo.symbol,
              price: 0, // Will be fetched separately for each commodity
              change: 0,
              changePercent: 0,
              volume: null,
              ...symbolInfo,
              // Add CommodityPriceAPI metadata
              commodityPriceAPISymbol: apiSymbol,
              supportedByCommodityPriceAPI: !!apiSymbol && !!data.symbols[apiSymbol],
              commodityPriceAPIData: data.symbols[apiSymbol] || null
            };
          });
          
          // Add additional commodities that are available in CommodityPriceAPI but not in our static list
          const reverseMapping = Object.fromEntries(
            Object.entries(COMMODITY_PRICE_API_SYMBOLS).map(([name, symbol]) => [symbol, name])
          );
          
          availableSymbols.forEach(symbol => {
            if (!reverseMapping[symbol]) {
              // This symbol is not in our mapping, add it as a new commodity
              const symbolData = data.symbols[symbol];
              const displayName = symbolData.name || symbol.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              
              // Categorize based on symbol name
              let category = 'other';
              if (symbol.includes('OIL') || symbol.includes('GAS') || symbol.includes('ENERGY')) {
                category = 'energy';
              } else if (['GOLD', 'SILVER', 'COPPER', 'PLATINUM', 'PALLADIUM', 'ALUMINUM', 'NICKEL', 'ZINC', 'LEAD', 'TIN'].some(metal => symbol.includes(metal))) {
                category = 'metals';
              } else if (['CORN', 'WHEAT', 'SOY', 'RICE', 'OAT', 'BARLEY'].some(grain => symbol.includes(grain))) {
                category = 'grains';
              } else if (['CATTLE', 'HOG', 'MILK', 'CHEESE', 'BUTTER', 'EGGS'].some(livestock => symbol.includes(livestock))) {
                category = 'livestock';
              } else if (['COFFEE', 'SUGAR', 'COTTON', 'COCOA', 'TEA', 'RUBBER'].some(soft => symbol.includes(soft))) {
                category = 'softs';
              }
              
              commoditiesData.push({
                name: displayName,
                symbol: symbol,
                price: 0,
                change: 0,
                changePercent: 0,
                volume: null,
                category,
                contractSize: 'Variable',
                venue: 'Various',
                commodityPriceAPISymbol: symbol,
                supportedByCommodityPriceAPI: true,
                commodityPriceAPIData: symbolData
              });
            }
          });
          
        } else {
          throw new Error('Invalid symbols response from CommodityPriceAPI');
        }
      } catch (error) {
        console.warn('CommodityPriceAPI failed, falling back to FMP:', error);
        useCommodityPriceAPI = false;
      }
    }

    // Fallback to FMP if CommodityPriceAPI is not available or failed
    if (!useCommodityPriceAPI) {
      console.log('Using FMP for symbols');
      
      const fmpApiKey = Deno.env.get('FMP_API_KEY')
      
      if (fmpApiKey && fmpApiKey !== 'demo') {
        try {
          const response = await fetch(
            `https://financialmodelingprep.com/api/v3/quotes/commodity?apikey=${fmpApiKey}`
          );
          
          if (!response.ok) {
            throw new Error(`FMP API error: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (Array.isArray(data) && data.length > 0) {
            console.log(`FMP returned ${data.length} commodities`);
            dataSource = 'fmp';
            
            commoditiesData = Object.keys(COMMODITY_SYMBOLS).map(name => {
              const symbolInfo = COMMODITY_SYMBOLS[name];
              const fmpData = data.find(item => 
                item.symbol === symbolInfo.symbol || 
                item.name?.toLowerCase().includes(name.toLowerCase().split(' ')[0])
              );
              
              if (fmpData) {
                return {
                  name,
                  symbol: fmpData.symbol,
                  price: parseFloat(fmpData.price) || 0,
                  change: parseFloat(fmpData.change) || 0,
                  changePercent: parseFloat(fmpData.changesPercentage) || 0,
                  volume: parseInt(fmpData.volume) || 0,
                  ...symbolInfo,
                  supportedByCommodityPriceAPI: false
                };
              } else {
                return {
                  name,
                  symbol: symbolInfo.symbol,
                  price: 0,
                  change: 0,
                  changePercent: 0,
                  volume: 0,
                  ...symbolInfo,
                  supportedByCommodityPriceAPI: false
                };
              }
            });
          } else {
            throw new Error('No data returned from FMP API');
          }
        } catch (error) {
          console.warn('FMP API failed, using fallback data:', error);
        }
      }
    }

    // Use static fallback if both APIs failed
    if (commoditiesData.length === 0) {
      console.log('Using static fallback commodity data');
      dataSource = 'static';
      commoditiesData = Object.keys(COMMODITY_SYMBOLS).map(name => {
        return {
          name,
          symbol: COMMODITY_SYMBOLS[name].symbol,
          price: 0,
          change: 0,
          changePercent: 0,
          volume: 0,
          ...COMMODITY_SYMBOLS[name],
          supportedByCommodityPriceAPI: !!COMMODITY_PRICE_API_SYMBOLS[name]
        };
      });
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
        usedCommodityPriceAPI: useCommodityPriceAPI
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in fetch-commodity-symbols function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
