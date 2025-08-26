import { CommoditySymbol } from './types.ts';

// Enhanced commodity mappings with categories and contract specs
export const COMMODITY_SYMBOLS: Record<string, CommoditySymbol> = {
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
export const COMMODITY_PRICE_API_SYMBOLS: Record<string, string> = {
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
  
  // Agriculture - Grains
  'CORN': 'Corn Futures',
  'WHEAT': 'Wheat Futures',
  'SOYBEAN': 'Soybean Futures',
  'OATS': 'Oat Futures',
  'RICE': 'Rough Rice',
  'BARLEY': 'Barley',
  'CANOLA': 'Canola',
  'SOYOIL': 'Soybean Oil',
  'SOYMEAL': 'Soybean Meal',
  
  // Agriculture - Livestock
  'CATTLE': 'Live Cattle Futures',
  'FCATTLE': 'Feeder Cattle Futures',
  'HOGS': 'Lean Hogs Futures',
  
  // Agriculture - Softs
  'COFFEE': 'Coffee',
  'SUGAR': 'Sugar',
  'COTTON': 'Cotton',
  'COCOA': 'Cocoa',
  'OJ': 'Orange Juice',
  
  // Other Commodities
  'LUMBER': 'Lumber Futures',
};

// Category mappings for grouping
export const CATEGORY_MAPPINGS: Record<string, string[]> = {
  energy: ['Crude Oil', 'Brent Crude Oil', 'Natural Gas', 'Gasoline RBOB', 'Heating Oil', 'Coal', 'Uranium', 'Ethanol'],
  metals: ['Gold Futures', 'Silver Futures', 'Copper', 'Platinum', 'Palladium', 'Aluminum', 'Zinc', 'Lead', 'Nickel'],
  grains: ['Corn Futures', 'Wheat Futures', 'Soybean Futures', 'Oat Futures', 'Rough Rice', 'Barley'],
  livestock: ['Live Cattle Futures', 'Feeder Cattle Futures', 'Lean Hogs Futures'],
  softs: ['Coffee', 'Sugar', 'Cotton', 'Cocoa', 'Orange Juice'],
  other: ['Lumber Futures'],
};

// Helper functions
export function getCommodityCategory(commodityName: string): string {
  const symbol = COMMODITY_SYMBOLS[commodityName];
  return symbol?.category || 'other';
}

export function getCommodityByApiSymbol(apiSymbol: string): string | null {
  return COMMODITY_PRICE_API_SYMBOLS[apiSymbol] || null;
}

export function getApiSymbolByCommodity(commodityName: string): string | null {
  for (const [apiSymbol, name] of Object.entries(COMMODITY_PRICE_API_SYMBOLS)) {
    if (name === commodityName) {
      return apiSymbol;
    }
  }
  return null;
}

export function getAllCommoditiesByCategory(): Record<string, string[]> {
  const categorized: Record<string, string[]> = {};
  
  for (const [commodityName, details] of Object.entries(COMMODITY_SYMBOLS)) {
    const category = details.category;
    if (!categorized[category]) {
      categorized[category] = [];
    }
    categorized[category].push(commodityName);
  }
  
  return categorized;
}
