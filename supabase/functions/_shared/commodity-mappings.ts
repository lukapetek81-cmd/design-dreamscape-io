import { CommoditySymbol } from './types.ts';

// Only commodities with confirmed live data from OilPriceAPI or CommodityPriceAPI v2.
// Three previously-listed items (Feeder Cattle, Lean Hogs, Milk Class III) were
// dropped because neither provider supplies them.
export const COMMODITY_SYMBOLS: Record<string, CommoditySymbol> = {
  // Energy — Crude Oil Benchmarks (OilPriceAPI)
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
  // Regional Crude Benchmarks (OilPriceAPI)
  'WTI Midland': { symbol: 'WTIM=F', category: 'energy', contractSize: '1,000 bbl', venue: 'CME' },
  'Alaska North Slope': { symbol: 'ANS=F', category: 'energy', contractSize: '1,000 bbl', venue: 'ICE' },
  'Mars Blend': { symbol: 'MARS=F', category: 'energy', contractSize: '1,000 bbl', venue: 'CME' },
  'Louisiana Light Sweet': { symbol: 'LLS=F', category: 'energy', contractSize: '1,000 bbl', venue: 'CME' },
  // Natural Gas (OilPriceAPI)
  'Natural Gas': { symbol: 'NG=F', category: 'energy', contractSize: '10,000 MMBtu', venue: 'NYMEX' },
  'Natural Gas UK': { symbol: 'M.GB=F', category: 'energy', contractSize: '1,000 therms', venue: 'ICE' },
  'Dutch TTF Gas': { symbol: 'TTF=F', category: 'energy', contractSize: '1 MWh', venue: 'ICE' },
  'Japan/Korea LNG': { symbol: 'JKM=F', category: 'energy', contractSize: '10,000 MMBtu', venue: 'ICE' },
  // Refined Products (OilPriceAPI)
  'Gasoline RBOB': { symbol: 'RB=F', category: 'energy', contractSize: '42,000 gal', venue: 'NYMEX' },
  'Heating Oil': { symbol: 'HO=F', category: 'energy', contractSize: '42,000 gal', venue: 'NYMEX' },
  'Jet Fuel': { symbol: 'JET=F', category: 'energy', contractSize: '42,000 gal', venue: 'NYMEX' },
  'ULSD Diesel': { symbol: 'ULSD=F', category: 'energy', contractSize: '42,000 gal', venue: 'NYMEX' },
  'Gasoil': { symbol: 'GO=F', category: 'energy', contractSize: '1 MT', venue: 'ICE' },
  'Naphtha': { symbol: 'NAP=F', category: 'energy', contractSize: '1 MT', venue: 'ICE' },
  'Propane': { symbol: 'PRP=F', category: 'energy', contractSize: '42,000 gal', venue: 'NYMEX' },
  'Ethanol': { symbol: 'ETH=F', category: 'energy', contractSize: '29,000 gal', venue: 'CBOT' },

  // Metals (CommodityPriceAPI)
  'Gold Futures': { symbol: 'GC=F', category: 'metals', contractSize: '100 oz', venue: 'COMEX' },
  'Silver Futures': { symbol: 'SI=F', category: 'metals', contractSize: '5,000 oz', venue: 'COMEX' },
  'Copper': { symbol: 'HG=F', category: 'metals', contractSize: '25,000 lbs', venue: 'COMEX' },
  'Platinum': { symbol: 'PL=F', category: 'metals', contractSize: '50 oz', venue: 'NYMEX' },
  'Palladium': { symbol: 'PA=F', category: 'metals', contractSize: '100 oz', venue: 'NYMEX' },
  'Aluminum': { symbol: 'ALI=F', category: 'metals', contractSize: '25 MT', venue: 'LME' },
  'Zinc': { symbol: 'ZNC=F', category: 'metals', contractSize: '25 MT', venue: 'LME' },

  // Grains (CommodityPriceAPI)
  'Corn Futures': { symbol: 'ZC=F', category: 'grains', contractSize: '5,000 bu', venue: 'CBOT' },
  'Wheat Futures': { symbol: 'ZW=F', category: 'grains', contractSize: '5,000 bu', venue: 'CBOT' },
  'Soybean Futures': { symbol: 'ZS=F', category: 'grains', contractSize: '5,000 bu', venue: 'CBOT' },
  'Soybean Oil': { symbol: 'ZL=F', category: 'grains', contractSize: '60,000 lbs', venue: 'CBOT' },
  'Soybean Meal': { symbol: 'ZM=F', category: 'grains', contractSize: '100 tons', venue: 'CBOT' },
  'Oat Futures': { symbol: 'ZO=F', category: 'grains', contractSize: '5,000 bu', venue: 'CBOT' },
  'Rough Rice': { symbol: 'ZR=F', category: 'grains', contractSize: '2,000 cwt', venue: 'CBOT' },

  // Softs (CommodityPriceAPI)
  'Coffee Arabica': { symbol: 'KC=F', category: 'softs', contractSize: '37,500 lbs', venue: 'ICE' },
  'Sugar #11': { symbol: 'SB=F', category: 'softs', contractSize: '112,000 lbs', venue: 'ICE' },
  'Cotton': { symbol: 'CT=F', category: 'softs', contractSize: '50,000 lbs', venue: 'ICE' },
  'Cocoa': { symbol: 'CC=F', category: 'softs', contractSize: '10 MT', venue: 'ICE' },
  'Orange Juice': { symbol: 'OJ=F', category: 'softs', contractSize: '15,000 lbs', venue: 'ICE' },

  // Other (CommodityPriceAPI)
  'Lumber Futures': { symbol: 'LBS=F', category: 'other', contractSize: '110,000 bd ft', venue: 'CME' },
};

/**
 * CommodityPriceAPI v2 symbols.
 * Reference: https://www.commoditypriceapi.com/symbols
 *
 * Maps OUR commodity name → CPA's actual ticker symbol.
 * Some commodities use spot prices when futures unavailable in CPA's catalog.
 *
 * Note on units returned by CPA:
 *  - CORN, SOYBEAN-FUT, ZL → US Cents per bushel/lb (divide by 100 for USD)
 *  - All others → USD in their stated unit
 */
export const COMMODITY_PRICE_API_SYMBOLS: Record<string, string> = {
  // Precious & base metals
  'Gold Futures': 'XAU',
  'Silver Futures': 'XAG',
  'Platinum': 'PL',
  'Palladium': 'PA',
  'Copper': 'HG-SPOT',
  'Aluminum': 'AL-SPOT',
  'Zinc': 'ZINC',
  // Grains (cents-quoted symbols flagged in CENT_QUOTED_SYMBOLS)
  'Corn Futures': 'CORN',
  'Wheat Futures': 'ZW-SPOT',
  'Soybean Futures': 'SOYBEAN-FUT',
  'Soybean Oil': 'ZL',
  'Soybean Meal': 'ZM',
  'Oat Futures': 'OAT-SPOT',
  'Rough Rice': 'RR-FUT',
  // Softs
  'Coffee Arabica': 'CA',
  'Sugar #11': 'LS',
  'Cotton': 'CT',
  'Cocoa': 'CC',
  'Orange Juice': 'OJ',
  // Other
  'Lumber Futures': 'LB-FUT',
};

/** CPA returns these symbols quoted in US Cents — caller should divide by 100. */
export const CENT_QUOTED_SYMBOLS = new Set(['CORN', 'SOYBEAN-FUT', 'ZL']);

// Category mappings for grouping
export const CATEGORY_MAPPINGS: Record<string, string[]> = {
  energy: ['WTI Crude Oil', 'Brent Crude Oil', 'Crude Oil Dubai', 'DME Oman Crude', 'Murban Crude', 'OPEC Basket', 'Indian Basket', 'Tapis Crude Oil', 'Urals Crude Oil', 'Western Canadian Select', 'WTI Midland', 'Alaska North Slope', 'Mars Blend', 'Louisiana Light Sweet', 'Natural Gas', 'Natural Gas UK', 'Dutch TTF Gas', 'Japan/Korea LNG', 'Gasoline RBOB', 'Heating Oil', 'Jet Fuel', 'ULSD Diesel', 'Gasoil', 'Naphtha', 'Propane', 'Ethanol'],
  metals: ['Gold Futures', 'Silver Futures', 'Copper', 'Platinum', 'Palladium', 'Aluminum', 'Zinc'],
  grains: ['Corn Futures', 'Wheat Futures', 'Soybean Futures', 'Soybean Oil', 'Soybean Meal', 'Oat Futures', 'Rough Rice'],
  softs: ['Coffee Arabica', 'Sugar #11', 'Cotton', 'Cocoa', 'Orange Juice'],
  other: ['Lumber Futures'],
};

// Helper functions
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
