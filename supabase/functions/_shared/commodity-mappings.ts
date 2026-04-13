import { CommoditySymbol } from './types.ts';

// Only commodities with confirmed live data from OilPriceAPI or FMP basic plan
export const COMMODITY_SYMBOLS: Record<string, CommoditySymbol> = {
  // Energy (OilPriceAPI)
  'WTI Crude Oil': { symbol: 'CL=F', category: 'energy', contractSize: '1,000 bbl', venue: 'NYMEX' },
  'Brent Crude Oil': { symbol: 'BZ=F', category: 'energy', contractSize: '1,000 bbl', venue: 'ICE' },
  'Natural Gas': { symbol: 'NG=F', category: 'energy', contractSize: '10,000 MMBtu', venue: 'NYMEX' },
  'Gasoline RBOB': { symbol: 'RB=F', category: 'energy', contractSize: '42,000 gal', venue: 'NYMEX' },
  'Heating Oil': { symbol: 'HO=F', category: 'energy', contractSize: '42,000 gal', venue: 'NYMEX' },
  'Crude Oil Dubai': { symbol: 'DC=F', category: 'energy', contractSize: '1,000 bbl', venue: 'DME' },
  'Tapis Crude Oil': { symbol: 'TAP=F', category: 'energy', contractSize: '1,000 bbl', venue: 'SGX' },
  'Urals Crude Oil': { symbol: 'URL=F', category: 'energy', contractSize: '1,000 bbl', venue: 'ICE' },
  'Western Canadian Select': { symbol: 'WCS=F', category: 'energy', contractSize: '1,000 bbl', venue: 'CME' },
  'Natural Gas UK': { symbol: 'M.GB=F', category: 'energy', contractSize: '1,000 therms', venue: 'ICE' },
  'Dutch TTF Gas': { symbol: 'TTF=F', category: 'energy', contractSize: '1 MWh', venue: 'ICE' },
  'Japan/Korea LNG': { symbol: 'JKM=F', category: 'energy', contractSize: '10,000 MMBtu', venue: 'ICE' },
  'Jet Fuel': { symbol: 'JET=F', category: 'energy', contractSize: '42,000 gal', venue: 'NYMEX' },
  'ULSD Diesel': { symbol: 'ULSD=F', category: 'energy', contractSize: '42,000 gal', venue: 'NYMEX' },
  
  // Metals (FMP)
  'Gold Futures': { symbol: 'GC=F', category: 'metals', contractSize: '100 oz', venue: 'COMEX' },
  'Silver Futures': { symbol: 'SI=F', category: 'metals', contractSize: '5,000 oz', venue: 'COMEX' },
  'Copper': { symbol: 'HG=F', category: 'metals', contractSize: '25,000 lbs', venue: 'COMEX' },
  'Platinum': { symbol: 'PL=F', category: 'metals', contractSize: '50 oz', venue: 'NYMEX' },
  'Palladium': { symbol: 'PA=F', category: 'metals', contractSize: '100 oz', venue: 'NYMEX' },
  'Aluminum': { symbol: 'ALI=F', category: 'metals', contractSize: '25 MT', venue: 'LME' },
  'Zinc': { symbol: 'ZS=F', category: 'metals', contractSize: '25 MT', venue: 'LME' },
  
  // Grains (FMP)
  'Corn Futures': { symbol: 'ZC=F', category: 'grains', contractSize: '5,000 bu', venue: 'CBOT' },
  'Soybean Futures': { symbol: 'ZS=F', category: 'grains', contractSize: '5,000 bu', venue: 'CBOT' },
  'Soybean Oil': { symbol: 'ZL=F', category: 'grains', contractSize: '60,000 lbs', venue: 'CBOT' },
  'Soybean Meal': { symbol: 'ZM=F', category: 'grains', contractSize: '100 tons', venue: 'CBOT' },
  'Oat Futures': { symbol: 'ZO=F', category: 'grains', contractSize: '5,000 bu', venue: 'CBOT' },
  'Rough Rice': { symbol: 'ZR=F', category: 'grains', contractSize: '2,000 cwt', venue: 'CBOT' },
  
  // Livestock (FMP)
  'Live Cattle Futures': { symbol: 'LE=F', category: 'livestock', contractSize: '40,000 lbs', venue: 'CME' },
  'Feeder Cattle Futures': { symbol: 'GF=F', category: 'livestock', contractSize: '50,000 lbs', venue: 'CME' },
  'Lean Hogs Futures': { symbol: 'HE=F', category: 'livestock', contractSize: '40,000 lbs', venue: 'CME' },
  'Milk Class III': { symbol: 'DC=F', category: 'livestock', contractSize: '200,000 lbs', venue: 'CME' },
  
  // Softs (FMP)
  'Coffee Arabica': { symbol: 'KC=F', category: 'softs', contractSize: '37,500 lbs', venue: 'ICE' },
  'Sugar #11': { symbol: 'SB=F', category: 'softs', contractSize: '112,000 lbs', venue: 'ICE' },
  'Cotton': { symbol: 'CT=F', category: 'softs', contractSize: '50,000 lbs', venue: 'ICE' },
  'Cocoa': { symbol: 'CC=F', category: 'softs', contractSize: '10 MT', venue: 'ICE' },
  'Orange Juice': { symbol: 'OJ=F', category: 'softs', contractSize: '15,000 lbs', venue: 'ICE' },
  
  // Other (FMP)
  'Lumber Futures': { symbol: 'LBS=F', category: 'other', contractSize: '110,000 bd ft', venue: 'CME' },
  'Random Length Lumber': { symbol: 'LB=F', category: 'other', contractSize: '110,000 bd ft', venue: 'CME' },
};

// CommodityPriceAPI symbol mapping
export const COMMODITY_PRICE_API_SYMBOLS: Record<string, string> = {
  'XAU': 'Gold Futures', 'XAG': 'Silver Futures', 'XPT': 'Platinum', 'XPD': 'Palladium',
  'HG': 'Copper', 'ALU': 'Aluminum', 'ZNC': 'Zinc',
  'WTIOIL': 'WTI Crude Oil', 'BRENTOIL': 'Brent Crude Oil', 'NG': 'Natural Gas',
  'HO': 'Heating Oil', 'RB': 'Gasoline RBOB',
  'CORN': 'Corn Futures', 'SOYBEAN': 'Soybean Futures',
  'ZL': 'Soybean Oil', 'ZM': 'Soybean Meal', 'OAT': 'Oat Futures', 'RR': 'Rough Rice',
  'CA': 'Coffee Arabica', 'LS': 'Sugar #11', 'CT': 'Cotton', 'CC': 'Cocoa', 'OJ': 'Orange Juice',
  'CATTLE': 'Live Cattle Futures', 'HOGS': 'Lean Hogs Futures',
  'LUMBER': 'Lumber Futures',
};

// Category mappings for grouping
export const CATEGORY_MAPPINGS: Record<string, string[]> = {
  energy: ['WTI Crude Oil', 'Brent Crude Oil', 'Crude Oil Dubai', 'Tapis Crude Oil', 'Urals Crude Oil', 'Western Canadian Select', 'Natural Gas', 'Natural Gas UK', 'Dutch TTF Gas', 'Japan/Korea LNG', 'Gasoline RBOB', 'Heating Oil', 'Jet Fuel', 'ULSD Diesel'],
  metals: ['Gold Futures', 'Silver Futures', 'Copper', 'Platinum', 'Palladium', 'Aluminum', 'Zinc'],
  grains: ['Corn Futures', 'Soybean Futures', 'Soybean Oil', 'Soybean Meal', 'Oat Futures', 'Rough Rice'],
  livestock: ['Live Cattle Futures', 'Feeder Cattle Futures', 'Lean Hogs Futures', 'Milk Class III'],
  softs: ['Coffee Arabica', 'Sugar #11', 'Cotton', 'Cocoa', 'Orange Juice'],
  other: ['Lumber Futures', 'Random Length Lumber'],
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
