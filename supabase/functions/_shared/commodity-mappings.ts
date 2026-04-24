import { CommoditySymbol } from './types.ts';

// Catalog: ~85 commodities. Energy = OilPriceAPI exclusively. Non-energy = CommodityPriceAPI v2.
// Free tier = household-name commodities. Premium = niche / regional / exotic / spot-or-futures variant.
export const COMMODITY_SYMBOLS: Record<string, CommoditySymbol> = {
  // ============ ENERGY (OilPriceAPI, unchanged) ============
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
  'Natural Gas': { symbol: 'NG=F', category: 'energy', contractSize: '10,000 MMBtu', venue: 'NYMEX' },
  'Natural Gas UK': { symbol: 'M.GB=F', category: 'energy', contractSize: '1,000 therms', venue: 'ICE' },
  'Dutch TTF Gas': { symbol: 'TTF=F', category: 'energy', contractSize: '1 MWh', venue: 'ICE' },
  'Japan/Korea LNG': { symbol: 'JKM=F', category: 'energy', contractSize: '10,000 MMBtu', venue: 'ICE' },
  'Gasoline RBOB': { symbol: 'RB=F', category: 'energy', contractSize: '42,000 gal', venue: 'NYMEX' },
  'Heating Oil': { symbol: 'HO=F', category: 'energy', contractSize: '42,000 gal', venue: 'NYMEX' },
  'Jet Fuel': { symbol: 'JET=F', category: 'energy', contractSize: '42,000 gal', venue: 'NYMEX' },
  'ULSD Diesel': { symbol: 'ULSD=F', category: 'energy', contractSize: '42,000 gal', venue: 'NYMEX' },
  'Gasoil': { symbol: 'GO=F', category: 'energy', contractSize: '1 MT', venue: 'ICE' },
  'Naphtha': { symbol: 'NAP=F', category: 'energy', contractSize: '1 MT', venue: 'ICE' },
  'Propane': { symbol: 'PRP=F', category: 'energy', contractSize: '42,000 gal', venue: 'NYMEX' },
  'Ethanol': { symbol: 'ETH=F', category: 'energy', contractSize: '29,000 gal', venue: 'CBOT' },

  // ============ METALS — Free (CommodityPriceAPI) ============
  'Gold Futures': { symbol: 'GC=F', category: 'metals', contractSize: '100 oz', venue: 'COMEX' },
  'Silver Futures': { symbol: 'SI=F', category: 'metals', contractSize: '5,000 oz', venue: 'COMEX' },
  'Copper': { symbol: 'HG=F', category: 'metals', contractSize: '25,000 lbs', venue: 'COMEX' },
  'Platinum': { symbol: 'PL=F', category: 'metals', contractSize: '50 oz', venue: 'NYMEX' },
  'Palladium': { symbol: 'PA=F', category: 'metals', contractSize: '100 oz', venue: 'NYMEX' },
  'Aluminum': { symbol: 'ALI=F', category: 'metals', contractSize: '25 MT', venue: 'LME' },
  'Zinc': { symbol: 'ZNC=F', category: 'metals', contractSize: '25 MT', venue: 'LME' },
  'Iron Ore': { symbol: 'TIO=F', category: 'metals', contractSize: '100 MT', venue: 'SGX' },
  // Metals — Premium
  'Copper Futures': { symbol: 'HGF=F', category: 'metals', contractSize: '25,000 lbs', venue: 'COMEX' },
  'Aluminium Futures': { symbol: 'ALF=F', category: 'metals', contractSize: '25 MT', venue: 'LME' },
  'Lead Spot': { symbol: 'PB=X', category: 'metals', contractSize: '25 MT', venue: 'LME' },
  'Lead Futures': { symbol: 'PBF=F', category: 'metals', contractSize: '25 MT', venue: 'LME' },
  'Nickel Spot': { symbol: 'NI=X', category: 'metals', contractSize: '6 MT', venue: 'LME' },
  'Nickel Futures': { symbol: 'NIF=F', category: 'metals', contractSize: '6 MT', venue: 'LME' },
  'Tin': { symbol: 'SN=X', category: 'metals', contractSize: '5 MT', venue: 'LME' },
  'Steel': { symbol: 'STL=F', category: 'metals', contractSize: '20 MT', venue: 'LME' },
  'Hot-Rolled Coil Steel': { symbol: 'HRC=F', category: 'metals', contractSize: '20 short tons', venue: 'NYMEX' },
  'Titanium': { symbol: 'TI=X', category: 'metals', contractSize: '1 MT', venue: 'OTC' },
  'Magnesium': { symbol: 'MG=X', category: 'metals', contractSize: '1 MT', venue: 'OTC' },
  'Lithium': { symbol: 'LIT=X', category: 'metals', contractSize: '1 MT', venue: 'OTC' },

  // ============ GRAINS — Free ============
  'Corn Futures': { symbol: 'ZC=F', category: 'grains', contractSize: '5,000 bu', venue: 'CBOT' },
  'Wheat Futures': { symbol: 'ZW=F', category: 'grains', contractSize: '5,000 bu', venue: 'CBOT' },
  'Soybean Futures': { symbol: 'ZS=F', category: 'grains', contractSize: '5,000 bu', venue: 'CBOT' },
  'Soybean Oil': { symbol: 'ZL=F', category: 'grains', contractSize: '60,000 lbs', venue: 'CBOT' },
  'Soybean Meal': { symbol: 'ZM=F', category: 'grains', contractSize: '100 tons', venue: 'CBOT' },
  'Oat Futures': { symbol: 'ZO=F', category: 'grains', contractSize: '5,000 bu', venue: 'CBOT' },
  'Rough Rice': { symbol: 'ZR=F', category: 'grains', contractSize: '2,000 cwt', venue: 'CBOT' },
  // Grains — Premium
  'Wheat Futures Spot': { symbol: 'ZW=X', category: 'grains', contractSize: '5,000 bu', venue: 'CBOT' },
  'Soybeans Spot': { symbol: 'ZS=X', category: 'grains', contractSize: '5,000 bu', venue: 'CBOT' },
  'Oats Spot': { symbol: 'ZO=X', category: 'grains', contractSize: '5,000 bu', venue: 'CBOT' },
  'Rough Rice Spot': { symbol: 'ZR=X', category: 'grains', contractSize: '2,000 cwt', venue: 'CBOT' },
  'Canola': { symbol: 'RS=F', category: 'grains', contractSize: '20 MT', venue: 'ICE' },
  'Sunflower Oil': { symbol: 'SUN=X', category: 'grains', contractSize: '1 MT', venue: 'OTC' },
  'Rapeseed Oil': { symbol: 'RSO=X', category: 'grains', contractSize: '1 MT', venue: 'OTC' },

  // ============ SOFTS — Free ============
  'Coffee Arabica': { symbol: 'KC=F', category: 'softs', contractSize: '37,500 lbs', venue: 'ICE' },
  'Sugar #11': { symbol: 'SB=F', category: 'softs', contractSize: '112,000 lbs', venue: 'ICE' },
  'Cotton': { symbol: 'CT=F', category: 'softs', contractSize: '50,000 lbs', venue: 'ICE' },
  'Cocoa': { symbol: 'CC=F', category: 'softs', contractSize: '10 MT', venue: 'ICE' },
  'Orange Juice': { symbol: 'OJ=F', category: 'softs', contractSize: '15,000 lbs', venue: 'ICE' },
  // Softs — Premium
  'UK Sugar No 5': { symbol: 'LS=F', category: 'softs', contractSize: '50 MT', venue: 'ICE' },
  'Tea': { symbol: 'TEA=X', category: 'softs', contractSize: '1 MT', venue: 'OTC' },
  'Wool': { symbol: 'WOOL=X', category: 'softs', contractSize: '2,500 kg', venue: 'ASX' },
  'Palm Oil': { symbol: 'PO=F', category: 'softs', contractSize: '25 MT', venue: 'BMD' },

  // ============ LIVESTOCK — Free ============
  'Live Cattle': { symbol: 'LE=F', category: 'livestock', contractSize: '40,000 lbs', venue: 'CME' },
  'Lean Hogs': { symbol: 'HE=F', category: 'livestock', contractSize: '40,000 lbs', venue: 'CME' },
  'Milk': { symbol: 'DC=F', category: 'livestock', contractSize: '200,000 lbs', venue: 'CME' },
  // Livestock — Premium
  'Feeder Cattle': { symbol: 'GF=F', category: 'livestock', contractSize: '50,000 lbs', venue: 'CME' },
  'Cheese': { symbol: 'CSC=F', category: 'livestock', contractSize: '20,000 lbs', venue: 'CME' },
  'Eggs CH': { symbol: 'EGG-CH=X', category: 'livestock', contractSize: '1 dz', venue: 'OTC' },
  'Eggs US': { symbol: 'EGG-US=X', category: 'livestock', contractSize: '1 dz', venue: 'OTC' },
  'Salmon': { symbol: 'SAL=F', category: 'livestock', contractSize: '4,000 kg', venue: 'FishPool' },
  'Poultry': { symbol: 'POU=X', category: 'livestock', contractSize: '1 lb', venue: 'OTC' },
  'Butter': { symbol: 'CB=F', category: 'livestock', contractSize: '20,000 lbs', venue: 'CME' },
  'Potato': { symbol: 'POT=X', category: 'livestock', contractSize: '1 MT', venue: 'OTC' },

  // ============ INDUSTRIALS — All Premium except none (new group) ============
  'Industrial Ethanol': { symbol: 'ETHN=F', category: 'industrials', contractSize: '29,000 gal', venue: 'CBOT' },
  'Rubber': { symbol: 'RUB=F', category: 'industrials', contractSize: '5,000 kg', venue: 'TOCOM' },
  'Bitumen': { symbol: 'BIT=F', category: 'industrials', contractSize: '10 MT', venue: 'SHFE' },
  'Cobalt': { symbol: 'COB=X', category: 'industrials', contractSize: '1 MT', venue: 'LME' },
  'Rhodium': { symbol: 'XRH=X', category: 'industrials', contractSize: '1 oz', venue: 'OTC' },
  'Polyethylene': { symbol: 'POL=X', category: 'industrials', contractSize: '1 MT', venue: 'OTC' },
  'Polyvinyl Chloride': { symbol: 'PVC=X', category: 'industrials', contractSize: '1 MT', venue: 'OTC' },
  'Polypropylene': { symbol: 'PYL=X', category: 'industrials', contractSize: '1 MT', venue: 'OTC' },
  'Soda Ash': { symbol: 'SODA=X', category: 'industrials', contractSize: '1 MT', venue: 'OTC' },
  'Neodymium': { symbol: 'NDYM=X', category: 'industrials', contractSize: '1 kg', venue: 'OTC' },
  'Tellurium': { symbol: 'TEL=X', category: 'industrials', contractSize: '1 kg', venue: 'OTC' },
  'Diammonium Phosphate': { symbol: 'DAP=X', category: 'industrials', contractSize: '1 MT', venue: 'OTC' },
  'Urea': { symbol: 'UREA=X', category: 'industrials', contractSize: '1 MT', venue: 'OTC' },
  'Urea Ammonium Nitrate': { symbol: 'UAN=X', category: 'industrials', contractSize: '1 MT', venue: 'OTC' },
  'Gallium': { symbol: 'GA=X', category: 'industrials', contractSize: '1 kg', venue: 'OTC' },
  'Indium': { symbol: 'IN=X', category: 'industrials', contractSize: '1 kg', venue: 'OTC' },
  'Kraft Pulp': { symbol: 'KP=X', category: 'industrials', contractSize: '1 MT', venue: 'OTC' },
  'Industrial Naphtha': { symbol: 'NAPI=X', category: 'industrials', contractSize: '1 MT', venue: 'OTC' },

  // ============ INDUSTRIALS — Lumber (free) ============
  'Lumber Futures': { symbol: 'LBS=F', category: 'industrials', contractSize: '110,000 bd ft', venue: 'CME' },
};

/**
 * CommodityPriceAPI v2 symbols. Reference: https://www.commoditypriceapi.com/symbols
 * Maps OUR commodity name → CPA's actual ticker.
 */
export const COMMODITY_PRICE_API_SYMBOLS: Record<string, string> = {
  // Metals
  'Gold Futures': 'XAU',
  'Silver Futures': 'XAG',
  'Platinum': 'PL',
  'Palladium': 'PA',
  'Copper': 'HG-SPOT',
  'Aluminum': 'AL-SPOT',
  'Zinc': 'ZINC',
  'Iron Ore': 'TIOC',
  'Copper Futures': 'HG-FUT',
  'Aluminium Futures': 'AL-FUT',
  'Lead Spot': 'LEAD-SPOT',
  'Lead Futures': 'LEAD-FUT',
  'Nickel Spot': 'NICKEL-SPOT',
  'Nickel Futures': 'NICKEL-FUT',
  'Tin': 'TIN',
  'Steel': 'STEEL',
  'Hot-Rolled Coil Steel': 'HRC-STEEL',
  'Titanium': 'TITAN',
  'Magnesium': 'MG',
  'Lithium': 'LC',
  // Grains
  'Corn Futures': 'CORN',
  'Wheat Futures': 'ZW-SPOT',
  'Soybean Futures': 'SOYBEAN-FUT',
  'Soybean Oil': 'ZL',
  'Soybean Meal': 'ZM',
  'Oat Futures': 'OAT-SPOT',
  'Rough Rice': 'RR-FUT',
  'Wheat Futures Spot': 'ZW-FUT',
  'Soybeans Spot': 'SOYBEAN-SPOT',
  'Oats Spot': 'OAT-FUT',
  'Rough Rice Spot': 'RR-SPOT',
  'Canola': 'CANOLA',
  'Sunflower Oil': 'SUNF',
  'Rapeseed Oil': 'RSO',
  // Softs
  'Coffee Arabica': 'CA',
  'Sugar #11': 'LS11',
  'Cotton': 'CT',
  'Cocoa': 'CC',
  'Orange Juice': 'OJ',
  'UK Sugar No 5': 'LS',
  'Tea': 'TEA',
  'Wool': 'WOOL',
  'Palm Oil': 'PO',
  // Livestock
  'Live Cattle': 'LC1',
  'Lean Hogs': 'LHOGS',
  'Milk': 'MILK',
  'Feeder Cattle': 'FC1',
  'Cheese': 'CHE',
  'Eggs CH': 'EGGS-CH',
  'Eggs US': 'EGGS-US',
  'Salmon': 'SALMON',
  'Poultry': 'POUL',
  'Butter': 'BUTTER',
  'Potato': 'POTATO',
  // Industrials
  'Industrial Ethanol': 'ETHANOL',
  'Rubber': 'RUBBER',
  'Bitumen': 'BIT',
  'Cobalt': 'COB',
  'Rhodium': 'XRH',
  'Polyethylene': 'POL',
  'Polyvinyl Chloride': 'PVC',
  'Polypropylene': 'PYL',
  'Soda Ash': 'SODASH',
  'Neodymium': 'NDYM',
  'Tellurium': 'TEL',
  'Diammonium Phosphate': 'DIAPH',
  'Urea': 'UREA',
  'Urea Ammonium Nitrate': 'UANEU',
  'Gallium': 'GA',
  'Indium': 'INDIUM',
  'Kraft Pulp': 'K-PULP',
  'Industrial Naphtha': 'NAPHTHA',
  // Other
  'Lumber Futures': 'LB-FUT',
};

/** CPA returns these symbols quoted in US Cents — caller should divide by 100. */
export const CENT_QUOTED_SYMBOLS = new Set([
  'CORN', 'SOYBEAN-FUT', 'ZL',
  'LS11', 'SOYBEAN-SPOT', 'RUBBER',
]);

/**
 * Premium-only commodities. Free tier sees household names; everything niche/regional/exotic
 * lives behind the paywall. See mem://monetization/strategy.
 */
// Aggressive free tier: only 6 headline commodities are free. Everything else is premium.
export const FREE_COMMODITIES = new Set<string>([
  'WTI Crude Oil',
  'Brent Crude Oil',
  'Natural Gas',
  'Gold Futures',
  'Copper',
  'Corn Futures',
]);

export function isPremiumCommodity(name: string): boolean {
  return !FREE_COMMODITIES.has(name);
}

// Kept for backward compat with any imports.
export const PREMIUM_COMMODITIES = new Set<string>();

// Category groupings (used by frontend sidebar/screener)
export const CATEGORY_MAPPINGS: Record<string, string[]> = {
  energy: [
    'WTI Crude Oil', 'Brent Crude Oil', 'Crude Oil Dubai', 'DME Oman Crude', 'Murban Crude',
    'OPEC Basket', 'Indian Basket', 'Tapis Crude Oil', 'Urals Crude Oil', 'Western Canadian Select',
    'WTI Midland', 'Alaska North Slope', 'Mars Blend', 'Louisiana Light Sweet',
    'Natural Gas', 'Natural Gas UK', 'Dutch TTF Gas', 'Japan/Korea LNG',
    'Gasoline RBOB', 'Heating Oil', 'Jet Fuel', 'ULSD Diesel', 'Gasoil', 'Naphtha', 'Propane', 'Ethanol',
  ],
  metals: [
    'Gold Futures', 'Silver Futures', 'Copper', 'Platinum', 'Palladium', 'Aluminum', 'Zinc', 'Iron Ore',
    'Copper Futures', 'Aluminium Futures', 'Lead Spot', 'Lead Futures',
    'Nickel Spot', 'Nickel Futures', 'Tin', 'Steel', 'Hot-Rolled Coil Steel',
    'Titanium', 'Magnesium', 'Lithium',
  ],
  grains: [
    'Corn Futures', 'Wheat Futures', 'Soybean Futures', 'Soybean Oil', 'Soybean Meal',
    'Oat Futures', 'Rough Rice',
    'Wheat Futures Spot', 'Soybeans Spot', 'Oats Spot', 'Rough Rice Spot',
    'Canola', 'Sunflower Oil', 'Rapeseed Oil',
  ],
  softs: [
    'Coffee Arabica', 'Sugar #11', 'Cotton', 'Cocoa', 'Orange Juice',
    'UK Sugar No 5', 'Tea', 'Wool', 'Palm Oil',
  ],
  livestock: [
    'Live Cattle', 'Lean Hogs', 'Milk',
    'Feeder Cattle', 'Cheese', 'Eggs CH', 'Eggs US',
    'Salmon', 'Poultry', 'Butter', 'Potato',
  ],
  industrials: [
    'Industrial Ethanol', 'Rubber', 'Bitumen', 'Cobalt', 'Rhodium',
    'Polyethylene', 'Polyvinyl Chloride', 'Polypropylene', 'Soda Ash',
    'Neodymium', 'Tellurium', 'Diammonium Phosphate', 'Urea', 'Urea Ammonium Nitrate',
    'Gallium', 'Indium', 'Kraft Pulp', 'Industrial Naphtha',
    'Lumber Futures',
  ],
};

// Helpers
export function getCommodityCategory(commodityName: string): string {
  const symbol = COMMODITY_SYMBOLS[commodityName];
  return symbol?.category || 'other';
}

export function getCommodityByApiSymbol(apiSymbol: string): string | null {
  for (const [name, sym] of Object.entries(COMMODITY_PRICE_API_SYMBOLS)) {
    if (sym === apiSymbol) return name;
  }
  return null;
}

export function getApiSymbolByCommodity(commodityName: string): string | null {
  return COMMODITY_PRICE_API_SYMBOLS[commodityName] || null;
}

export function getAllCommoditiesByCategory(): Record<string, string[]> {
  const categorized: Record<string, string[]> = {};
  for (const [commodityName, details] of Object.entries(COMMODITY_SYMBOLS)) {
    const category = details.category;
    if (!categorized[category]) categorized[category] = [];
    categorized[category].push(commodityName);
  }
  return categorized;
}
