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
  // LME metals (Zinc, Lead, Nickel, Tin) removed 2026-05 — no free/affordable
  // data source covers LME. CME-listed Aluminum (ALI) is sourced via Massive.
  'Aluminum': { symbol: 'ALI=F', category: 'metals', contractSize: '25 MT', venue: 'CME' },

  // ============ GRAINS — Free ============
  'Corn Futures': { symbol: 'ZC=F', category: 'grains', contractSize: '5,000 bu', venue: 'CBOT' },
  'Wheat Futures': { symbol: 'ZW=F', category: 'grains', contractSize: '5,000 bu', venue: 'CBOT' },
  'Soybean Futures': { symbol: 'ZS=F', category: 'grains', contractSize: '5,000 bu', venue: 'CBOT' },
  'Soybean Oil': { symbol: 'ZL=F', category: 'grains', contractSize: '60,000 lbs', venue: 'CBOT' },
  'Soybean Meal': { symbol: 'ZM=F', category: 'grains', contractSize: '100 tons', venue: 'CBOT' },
  'Oat Futures': { symbol: 'ZO=F', category: 'grains', contractSize: '5,000 bu', venue: 'CBOT' },
  'Rough Rice': { symbol: 'ZR=F', category: 'grains', contractSize: '2,000 cwt', venue: 'CBOT' },
  'KC HRW Wheat': { symbol: 'KE=F', category: 'grains', contractSize: '5,000 bu', venue: 'CBOT' },
  // Canola (ICE) and all ICE softs (Coffee, Sugar #11, Cotton, Cocoa, OJ)
  // removed 2026-05 — no free/affordable data source covers ICE.

  // ============ LIVESTOCK — Free ============
  'Live Cattle': { symbol: 'LE=F', category: 'livestock', contractSize: '40,000 lbs', venue: 'CME' },
  'Lean Hogs': { symbol: 'HE=F', category: 'livestock', contractSize: '40,000 lbs', venue: 'CME' },
  'Feeder Cattle': { symbol: 'GF=F', category: 'livestock', contractSize: '50,000 lbs', venue: 'CME' },

  // ============ DAIRY (Massive / CME) — Premium ============
  'Class III Milk': { symbol: 'DC=F', category: 'dairy', contractSize: '200,000 lbs', venue: 'CME' },
  'Class IV Milk': { symbol: 'DY=F', category: 'dairy', contractSize: '200,000 lbs', venue: 'CME' },
  'Cash-Settled Cheese': { symbol: 'CSC=F', category: 'dairy', contractSize: '20,000 lbs', venue: 'CME' },
  'Cash-Settled Butter': { symbol: 'CB=F', category: 'dairy', contractSize: '20,000 lbs', venue: 'CME' },
  'Nonfat Dry Milk': { symbol: 'GNF=F', category: 'dairy', contractSize: '44,000 lbs', venue: 'CME' },

  // ============ INDUSTRIALS ============
  'Lumber Futures': { symbol: 'LBS=F', category: 'industrials', contractSize: '110,000 bd ft', venue: 'CME' },
  'HRC Steel': { symbol: 'HRC=F', category: 'industrials', contractSize: '20 ST', venue: 'NYMEX' },
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
  'Aluminum': 'ALI',
  // Grains (CBOT)
  'Corn Futures': 'ZC',
  'Wheat Futures': 'ZW',
  'Soybean Futures': 'ZS',
  'Soybean Oil': 'ZL',
  'Soybean Meal': 'ZM',
  'Oat Futures': 'ZO',
  'Rough Rice': 'ZR',
  'KC HRW Wheat': 'KE',
  // Livestock (CME)
  'Live Cattle': 'LE',
  'Lean Hogs': 'HE',
  'Feeder Cattle': 'GF',
  // Dairy (CME)
  'Class III Milk': 'DC',
  'Class IV Milk': 'DY',
  'Cash-Settled Cheese': 'CSC',
  'Cash-Settled Butter': 'CB',
  'Nonfat Dry Milk': 'GNF',
  // Industrials (CME/NYMEX)
  'Lumber Futures': 'LBR',
  'HRC Steel': 'HRC',
};

/**
 * FMP `/v3/quote/{SYMBOL}` — ICE/LME-listed items only. Massive can't quote
 * these exchanges, so FMP free tier (250 req/day) keeps them alive. 11 items.
 */
/**
 * FMP symbol map — currently empty. All ICE/LME items removed 2026-05 because
 * FMP Starter no longer covers them and we have no alternative free source.
 * Kept exported so callers don't break; CommodityService skips FMP when empty.
 */
export const FMP_SYMBOLS: Record<string, string> = {};

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
  'Palladium', 'Aluminum',
  // Grains — premium
  'Soybean Oil', 'Soybean Meal',
  'Oat Futures', 'Rough Rice', 'KC HRW Wheat',
  // Dairy — premium (all)
  'Class III Milk', 'Class IV Milk', 'Cash-Settled Cheese',
  'Cash-Settled Butter', 'Nonfat Dry Milk',
  // Industrials — premium
  'HRC Steel',
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
    'Gold Futures', 'Silver Futures', 'Copper', 'Platinum', 'Palladium', 'Aluminum',
  ],
  grains: [
    'Corn Futures', 'Wheat Futures', 'Soybean Futures', 'Soybean Oil', 'Soybean Meal',
    'Oat Futures', 'Rough Rice', 'KC HRW Wheat',
  ],
  softs: [],
  livestock: [
    'Live Cattle', 'Lean Hogs', 'Feeder Cattle',
  ],
  dairy: [
    'Class III Milk', 'Class IV Milk', 'Cash-Settled Cheese',
    'Cash-Settled Butter', 'Nonfat Dry Milk',
  ],
  industrials: [
    'Lumber Futures', 'HRC Steel',
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
