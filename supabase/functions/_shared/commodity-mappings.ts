import { CommoditySymbol } from './types.ts';

// Catalog: 35 commodities. Energy = OilPriceAPI exclusively. Non-energy = FMP Starter (/v3/quote/).
// Niche commodities that FMP doesn't quote (Iron Ore, HRC Steel, Lithium, Cobalt, Steel, Titanium,
// Sunflower Oil, UK Sugar No 5, Palm Oil, Industrial Ethanol, Rubber, Milk) were dropped 2026-05.
// Free tier = household names. Premium = niche / regional / exotic variants.
export const COMMODITY_SYMBOLS: Record<string, CommoditySymbol> = {
  // ============ ENERGY (OilPriceAPI, unchanged) ============
  'WTI Crude Oil': { symbol: 'CL=F', category: 'energy', contractSize: '1,000 bbl', venue: 'NYMEX' },
  'Brent Crude Oil': { symbol: 'BZ=F', category: 'energy', contractSize: '1,000 bbl', venue: 'ICE' },
  'Crude Oil Dubai': { symbol: 'DC=F', category: 'energy', contractSize: '1,000 bbl', venue: 'DME' },
  'DME Oman Crude': { symbol: 'OQD=F', category: 'energy', contractSize: '1,000 bbl', venue: 'DME' },
  'Murban Crude': { symbol: 'MUR=F', category: 'energy', contractSize: '1,000 bbl', venue: 'ICE' },
  'OPEC Basket': { symbol: 'OPEC=X', category: 'energy', contractSize: '1 bbl', venue: 'OPEC' },
  'Western Canadian Select': { symbol: 'WCS=F', category: 'energy', contractSize: '1,000 bbl', venue: 'CME' },
  'WTI Midland': { symbol: 'WTIM=F', category: 'energy', contractSize: '1,000 bbl', venue: 'CME' },
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

  // ============ METALS — Free (FMP) ============
  'Gold Futures': { symbol: 'GC=F', category: 'metals', contractSize: '100 oz', venue: 'COMEX' },
  'Silver Futures': { symbol: 'SI=F', category: 'metals', contractSize: '5,000 oz', venue: 'COMEX' },
  'Copper': { symbol: 'HG=F', category: 'metals', contractSize: '25,000 lbs', venue: 'COMEX' },
  'Platinum': { symbol: 'PL=F', category: 'metals', contractSize: '50 oz', venue: 'NYMEX' },
  'Palladium': { symbol: 'PA=F', category: 'metals', contractSize: '100 oz', venue: 'NYMEX' },
  'Aluminum': { symbol: 'ALI=F', category: 'metals', contractSize: '25 MT', venue: 'LME' },
  'Zinc': { symbol: 'ZNC=F', category: 'metals', contractSize: '25 MT', venue: 'LME' },
  // Metals — Premium
  'Lead Futures': { symbol: 'PBF=F', category: 'metals', contractSize: '25 MT', venue: 'LME' },
  'Nickel Futures': { symbol: 'NIF=F', category: 'metals', contractSize: '6 MT', venue: 'LME' },
  'Tin': { symbol: 'SN=X', category: 'metals', contractSize: '5 MT', venue: 'LME' },

  // ============ GRAINS — Free ============
  'Corn Futures': { symbol: 'ZC=F', category: 'grains', contractSize: '5,000 bu', venue: 'CBOT' },
  'Wheat Futures': { symbol: 'ZW=F', category: 'grains', contractSize: '5,000 bu', venue: 'CBOT' },
  'Soybean Futures': { symbol: 'ZS=F', category: 'grains', contractSize: '5,000 bu', venue: 'CBOT' },
  'Soybean Oil': { symbol: 'ZL=F', category: 'grains', contractSize: '60,000 lbs', venue: 'CBOT' },
  'Soybean Meal': { symbol: 'ZM=F', category: 'grains', contractSize: '100 tons', venue: 'CBOT' },
  'Oat Futures': { symbol: 'ZO=F', category: 'grains', contractSize: '5,000 bu', venue: 'CBOT' },
  'Rough Rice': { symbol: 'ZR=F', category: 'grains', contractSize: '2,000 cwt', venue: 'CBOT' },
  // Grains — Premium
  'Canola': { symbol: 'RS=F', category: 'grains', contractSize: '20 MT', venue: 'ICE' },

  // ============ SOFTS — Free ============
  'Coffee Arabica': { symbol: 'KC=F', category: 'softs', contractSize: '37,500 lbs', venue: 'ICE' },
  'Sugar #11': { symbol: 'SB=F', category: 'softs', contractSize: '112,000 lbs', venue: 'ICE' },
  'Cotton': { symbol: 'CT=F', category: 'softs', contractSize: '50,000 lbs', venue: 'ICE' },
  'Cocoa': { symbol: 'CC=F', category: 'softs', contractSize: '10 MT', venue: 'ICE' },
  'Orange Juice': { symbol: 'OJ=F', category: 'softs', contractSize: '15,000 lbs', venue: 'ICE' },

  // ============ LIVESTOCK — Free ============
  'Live Cattle': { symbol: 'LE=F', category: 'livestock', contractSize: '40,000 lbs', venue: 'CME' },
  'Lean Hogs': { symbol: 'HE=F', category: 'livestock', contractSize: '40,000 lbs', venue: 'CME' },

  // ============ INDUSTRIALS — Lumber (free) ============
  'Lumber Futures': { symbol: 'LBS=F', category: 'industrials', contractSize: '110,000 bd ft', venue: 'CME' },
};

/**
 * @deprecated CommodityPriceAPI removed 2026-05 in favour of FMP Starter.
 * Empty object retained so older imports don't break — callers naturally
 * skip CPA branches when symbol lookup returns undefined.
 */
export const COMMODITY_PRICE_API_SYMBOLS: Record<string, string> = {};

/** @deprecated CPA removed. */
export const CENT_QUOTED_SYMBOLS = new Set<string>();

/**
 * Massive Futures Basic product codes. Massive covers CME/CBOT/COMEX/NYMEX
 * only — these 15 non-energy items are now sourced from Massive (front-month
 * snapshot + daily aggs). Energy stays on OilPriceAPI; ICE/LME items below
 * stay on FMP because Massive doesn't carry those exchanges.
 */
export const MASSIVE_PRODUCT_CODES: Record<string, string> = {
  // Metals (COMEX/NYMEX)
  'Gold Futures': 'GC',
  'Silver Futures': 'SI',
  'Copper': 'HG',
  'Platinum': 'PL',
  'Palladium': 'PA',
  // Grains (CBOT)
  'Corn Futures': 'ZC',
  'Wheat Futures': 'ZW',
  'Soybean Futures': 'ZS',
  'Soybean Oil': 'ZL',
  'Soybean Meal': 'ZM',
  'Oat Futures': 'ZO',
  'Rough Rice': 'ZR',
  // Livestock (CME)
  'Live Cattle': 'LE',
  'Lean Hogs': 'HE',
  // Lumber (CME)
  'Lumber Futures': 'LBR',
};

/**
 * FMP `/v3/quote/{SYMBOL}` — ICE/LME-listed items only. Massive can't quote
 * these exchanges, so FMP free tier (250 req/day) keeps them alive. 11 items.
 */
export const FMP_SYMBOLS: Record<string, string> = {
  // Softs (ICE)
  'Coffee Arabica': 'KC=F',
  'Sugar #11': 'SB=F',
  'Cotton': 'CT=F',
  'Cocoa': 'CC=F',
  'Orange Juice': 'OJ=F',
  // Grains (ICE)
  'Canola': 'RS=F',
  // Metals (LME)
  'Aluminum': 'ALI=F',
  'Zinc': 'ZNC=F',
  'Lead Futures': 'PBF=F',
  'Nickel Futures': 'NIF=F',
  'Tin': 'SN=X',
};

// FMP_FUTURES_ROOTS removed — forward curve now uses Massive (see massive-client.ts).

/**
 * Premium-only commodities. Free tier sees household names; everything niche/regional/exotic
 * lives behind the paywall. See mem://monetization/strategy.
 */
// Free tier: 17 household-name commodities — top 2-4 from each group.
// Everything else is premium-gated. See mem://monetization/strategy.
// Free: household-name commodities. Premium = niche/regional/exotic variants.
export const PREMIUM_COMMODITIES = new Set<string>([
  // Energy — premium
  'Crude Oil Dubai', 'DME Oman Crude', 'Murban Crude', 'OPEC Basket',
  'Western Canadian Select', 'WTI Midland', 'Mars Blend', 'Louisiana Light Sweet',
  'Natural Gas UK', 'Dutch TTF Gas', 'Japan/Korea LNG',
  'Gasoline RBOB', 'Heating Oil', 'Jet Fuel', 'ULSD Diesel', 'Gasoil', 'Naphtha',
  // Metals — premium
  'Palladium', 'Aluminum', 'Zinc',
  'Lead Futures', 'Nickel Futures', 'Tin',
  // Grains — premium
  'Soybean Oil', 'Soybean Meal',
  'Oat Futures', 'Rough Rice',
  'Canola',
  // Softs — premium
  'Orange Juice',
]);

export function isPremiumCommodity(name: string): boolean {
  return PREMIUM_COMMODITIES.has(name);
}

// Category groupings (used by frontend sidebar/screener)
export const CATEGORY_MAPPINGS: Record<string, string[]> = {
  energy: [
    'WTI Crude Oil', 'Brent Crude Oil', 'Crude Oil Dubai', 'DME Oman Crude', 'Murban Crude',
    'OPEC Basket', 'Western Canadian Select',
    'WTI Midland', 'Mars Blend', 'Louisiana Light Sweet',
    'Natural Gas', 'Natural Gas UK', 'Dutch TTF Gas', 'Japan/Korea LNG',
    'Gasoline RBOB', 'Heating Oil', 'Jet Fuel', 'ULSD Diesel', 'Gasoil', 'Naphtha',
  ],
  metals: [
    'Gold Futures', 'Silver Futures', 'Copper', 'Platinum', 'Palladium', 'Aluminum', 'Zinc',
    'Lead Futures', 'Nickel Futures', 'Tin',
  ],
  grains: [
    'Corn Futures', 'Wheat Futures', 'Soybean Futures', 'Soybean Oil', 'Soybean Meal',
    'Oat Futures', 'Rough Rice',
    'Canola',
  ],
  softs: [
    'Coffee Arabica', 'Sugar #11', 'Cotton', 'Cocoa', 'Orange Juice',
  ],
  livestock: [
    'Live Cattle', 'Lean Hogs',
  ],
  industrials: [
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
