import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'
import { PREMIUM_COMMODITIES } from '../_shared/commodity-mappings.ts'

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

// CommodityPriceAPI v2 symbol mapping for NON-energy commodities
// Maps CommodityPriceAPI symbol → our commodity name
const CPAPI_SYMBOL_MAP: Record<string, string> = {
  'XAU': 'Gold Futures',
  'XAG': 'Silver Futures',
  'PL': 'Platinum',
  'PA': 'Palladium',
  'HG-SPOT': 'Copper',
  'AL-SPOT': 'Aluminum',
  'ZINC': 'Zinc',
  'CORN': 'Corn Futures',
  'SOYBEAN-FUT': 'Soybean Futures',
  'ZL': 'Soybean Oil',
  'ZM': 'Soybean Meal',
  'OAT-SPOT': 'Oat Futures',
  'RR-FUT': 'Rough Rice',
  'CA': 'Coffee Arabica',
  'LS': 'Sugar #11',
  'CT': 'Cotton',
  'CC': 'Cocoa',
  'OJ': 'Orange Juice',
  'MILK': 'Milk Class III',
  'LB-FUT': 'Lumber Futures',
  'BEEF': 'Live Cattle Futures',
};

// Symbols priced in US cents — need to divide by 100 to get USD
const CENT_SYMBOLS = new Set(['CORN', 'SOYBEAN-FUT', 'ZL']);

// Reverse map: our commodity name → CommodityPriceAPI symbol
const NAME_TO_CPAPI: Record<string, string> = {};
for (const [sym, name] of Object.entries(CPAPI_SYMBOL_MAP)) {
  NAME_TO_CPAPI[name] = sym;
}

// ALL energy commodity names — only use OilPriceAPI for these
const OIL_API_ONLY_NAMES = new Set([
  'WTI Crude Oil', 'Brent Crude Oil', 'Natural Gas', 'Gasoline RBOB', 'Heating Oil',
  'Natural Gas UK', 'Crude Oil Dubai', 'Tapis Crude Oil', 'Western Canadian Select',
  'Urals Crude Oil', 'Jet Fuel', 'ULSD Diesel', 'Dutch TTF Gas', 'Japan/Korea LNG',
  'US Gas Storage', 'VLSFO Global', 'HFO 380 Global', 'MGO 0.5%S Global',
  'HFO 380 Rotterdam', 'VLSFO Singapore', 'MGO Houston', 'VLSFO Fujairah',
  'DME Oman Crude', 'Murban Crude', 'OPEC Basket', 'Indian Basket',
  'WTI Midland', 'Alaska North Slope', 'Mars Blend', 'Louisiana Light Sweet',
  'Gasoil', 'Naphtha', 'Propane', 'Ethanol',
]);

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
  'DME Oman Crude': 'DME_OMAN_USD',
  'Murban Crude': 'MURBAN_CRUDE_USD',
  'OPEC Basket': 'OPEC_BASKET_USD',
  'Indian Basket': 'INDIAN_BASKET_USD',
  'WTI Midland': 'WTI_MIDLAND_USD',
  'Alaska North Slope': 'ANS_WEST_COAST_USD',
  'Mars Blend': 'MARS_USD',
  'Louisiana Light Sweet': 'LOUISIANA_LIGHT_USD',
  'Gasoil': 'GASOIL_USD',
  'Naphtha': 'NAPHTHA_USD',
  'Propane': 'PROPANE_MONT_BELVIEU_USD',
  'Ethanol': 'ETHANOL_USD',
};

// In-memory cache for the symbols list (keyed by tier)
let symbolsCacheFree: { data: any[]; timestamp: number } | null = null;
let symbolsCachePremium: { data: any[]; timestamp: number } | null = null;
const SYMBOLS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    let isPremium = false;
    if (user) {
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('subscription_active, subscription_tier')
        .eq('id', user.id)
        .single()
      isPremium = profile?.subscription_active && profile?.subscription_tier === 'premium';
    }

    const body = req.method === 'POST' ? await req.json() : {}
    const { dataDelay = 'realtime' } = body

    // Check cache
    if (symbolsCache && Date.now() - symbolsCache.timestamp < SYMBOLS_CACHE_TTL) {
      console.log(`Cache hit: returning ${symbolsCache.data.length} commodities`);
      return new Response(
        JSON.stringify({
          commodities: symbolsCache.data,
          source: 'cached',
          count: symbolsCache.data.length,
          timestamp: new Date().toISOString(),
          dataDelay,
          isDelayed: dataDelay === '15min',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let commoditiesData: any[] = []
    let dataSource = 'fallback';
    const existingNames = new Set<string>();

    // ──────────────────────────────────────────────
    // Step 1: Fetch energy commodities from OilPriceAPI
    // ──────────────────────────────────────────────
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
              if (!resp.ok) { await resp.text(); return null; }
              const result = await resp.json();
              if (result.data?.price) {
                return {
                  name, symbol: COMMODITY_SYMBOLS[name].symbol,
                  price: result.data.price, change: 0, changePercent: 0, volume: 0,
                  ...COMMODITY_SYMBOLS[name],
                  supportedByFMP: false, source: 'oilpriceapi',
                };
              }
            } catch (_) { /* skip */ }
            return null;
          });

        const results = await Promise.all(oilApiFetches);
        for (const r of results) {
          if (r) { commoditiesData.push(r); existingNames.add(r.name); }
        }
        console.log(`OilPriceAPI: loaded ${commoditiesData.length} energy commodities`);
        if (commoditiesData.length > 0) dataSource = 'oilpriceapi';
      } catch (err) {
        console.warn('OilPriceAPI batch fetch failed:', err);
      }
    }

    // ──────────────────────────────────────────────
    // Step 2: Fetch non-energy commodities from CommodityPriceAPI v2
    // ──────────────────────────────────────────────
    const cpApiKey = Deno.env.get('COMMODITYPRICE_API_KEY');
    let nonEnergyLoaded = false;

    if (cpApiKey) {
      try {
        // Build list of CPAPI symbols for commodities not yet loaded
        const neededSymbols = Object.entries(CPAPI_SYMBOL_MAP)
          .filter(([_, name]) => !existingNames.has(name) && COMMODITY_SYMBOLS[name])
          .map(([sym]) => sym);

        if (neededSymbols.length > 0) {
          // Split into batches of 5 to avoid "Maximum symbols per request exceeded"
          const BATCH_SIZE = 5;
          let totalLoaded = 0;
          
          for (let i = 0; i < neededSymbols.length; i += BATCH_SIZE) {
            const batch = neededSymbols.slice(i, i + BATCH_SIZE);
            const symbolList = batch.join(',');
            console.log(`CommodityPriceAPI batch ${Math.floor(i/BATCH_SIZE)+1}: ${symbolList}`);

            try {
              const resp = await fetch(
                `https://api.commoditypriceapi.com/v2/rates/latest?symbols=${symbolList}&quote=USD&apiKey=${cpApiKey}`
              );

              if (resp.ok) {
                const result = await resp.json();
                if (result.success && result.rates) {
                  for (const sym of batch) {
                    const commodityName = CPAPI_SYMBOL_MAP[sym];
                    if (!commodityName || existingNames.has(commodityName)) continue;
                    const rate = result.rates[sym];
                    if (rate !== undefined && rate !== null) {
                      let price = typeof rate === 'number' ? rate : parseFloat(rate);
                      if (CENT_SYMBOLS.has(sym) && price > 100) price = price / 100;
                      if (price > 0) {
                        const meta = COMMODITY_SYMBOLS[commodityName];
                        commoditiesData.push({
                          name: commodityName, symbol: meta.symbol,
                          price: Math.round(price * 100) / 100,
                          change: 0, changePercent: 0, volume: 0,
                          ...meta, supportedByFMP: false, source: 'commoditypriceapi',
                        });
                        existingNames.add(commodityName);
                        totalLoaded++;
                      }
                    }
                  }
                }
              } else {
                const errText = await resp.text();
                console.warn(`CommodityPriceAPI batch error: ${resp.status} - ${errText.substring(0, 150)}`);
              }
            } catch (batchErr) {
              console.warn(`CommodityPriceAPI batch failed:`, batchErr);
            }
          }
          
          if (totalLoaded > 0) {
            nonEnergyLoaded = true;
            dataSource = 'mixed';
            console.log(`CommodityPriceAPI: loaded ${totalLoaded} non-energy commodities total`);
          }
        }
      } catch (error) {
        console.warn('CommodityPriceAPI failed:', error);
      }
    }

    // ──────────────────────────────────────────────
    // Step 3: Remaining commodities get static fallback (price 0)
    // ──────────────────────────────────────────────
    {
      const remaining = Object.entries(COMMODITY_SYMBOLS)
        .filter(([name]) => !existingNames.has(name))
        .map(([name, info]) => ({
          name, symbol: info.symbol,
          price: 0, change: 0, changePercent: 0, volume: 0,
          ...info, supportedByFMP: false, source: 'static',
        }));

      if (remaining.length > 0) {
        commoditiesData.push(...remaining);
        console.log(`Static fallback: added ${remaining.length} remaining commodities`);
      }
    }

    // Apply data delay for free users
    const currentTimestamp = dataDelay === '15min'
      ? new Date(Date.now() - 15 * 60 * 1000).toISOString()
      : new Date().toISOString();

    // Cache the result
    symbolsCache = { data: commoditiesData, timestamp: Date.now() };

    return new Response(
      JSON.stringify({
        commodities: commoditiesData,
        source: dataSource,
        count: commoditiesData.length,
        timestamp: currentTimestamp,
        dataDelay,
        isDelayed: dataDelay === '15min',
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
