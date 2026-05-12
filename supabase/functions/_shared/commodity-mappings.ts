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
  'Lead Futures': { symbol: 'PBF=F', category: 'metals', contractSize: '25 MT', venue: 'LME' },
  'Nickel Futures': { symbol: 'NIF=F', category: 'metals', contractSize: '6 MT', venue: 'LME' },
  'Tin': { symbol: 'SN=X', category: 'metals', contractSize: '5 MT', venue: 'LME' },
  'Steel': { symbol: 'STL=F', category: 'metals', contractSize: '20 MT', venue: 'LME' },
  'Hot-Rolled Coil Steel': { symbol: 'HRC=F', category: 'metals', contractSize: '20 short tons', venue: 'NYMEX' },
  'Titanium': { symbol: 'TI=X', category: 'metals', contractSize: '1 MT', venue: 'OTC' },
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
  'Canola': { symbol: 'RS=F', category: 'grains', contractSize: '20 MT', venue: 'ICE' },
  'Sunflower Oil': { symbol: 'SUN=X', category: 'grains', contractSize: '1 MT', venue: 'OTC' },

  // ============ SOFTS — Free ============
  'Coffee Arabica': { symbol: 'KC=F', category: 'softs', contractSize: '37,500 lbs', venue: 'ICE' },
  'Sugar #11': { symbol: 'SB=F', category: 'softs', contractSize: '112,000 lbs', venue: 'ICE' },
  'Cotton': { symbol: 'CT=F', category: 'softs', contractSize: '50,000 lbs', venue: 'ICE' },
  'Cocoa': { symbol: 'CC=F', category: 'softs', contractSize: '10 MT', venue: 'ICE' },
  'Orange Juice': { symbol: 'OJ=F', category: 'softs', contractSize: '15,000 lbs', venue: 'ICE' },
  // Softs — Premium
  'UK Sugar No 5': { symbol: 'LS=F', category: 'softs', contractSize: '50 MT', venue: 'ICE' },
  'Palm Oil': { symbol: 'PO=F', category: 'softs', contractSize: '25 MT', venue: 'BMD' },

  // ============ LIVESTOCK — Free ============
  'Live Cattle': { symbol: 'LE=F', category: 'livestock', contractSize: '40,000 lbs', venue: 'CME' },
  'Lean Hogs': { symbol: 'HE=F', category: 'livestock', contractSize: '40,000 lbs', venue: 'CME' },
  'Milk': { symbol: 'DC=F', category: 'livestock', contractSize: '200,000 lbs', venue: 'CME' },

  // ============ INDUSTRIALS — All Premium except none (new group) ============
  'Industrial Ethanol': { symbol: 'ETHN=F', category: 'industrials', contractSize: '29,000 gal', venue: 'CBOT' },
  'Rubber': { symbol: 'RUB=F', category: 'industrials', contractSize: '5,000 kg', venue: 'TOCOM' },
  'Cobalt': { symbol: 'COB=X', category: 'industrials', contractSize: '1 MT', venue: 'LME' },

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
  'Lead Futures': 'LEAD-FUT',
  'Nickel Futures': 'NICKEL-FUT',
  'Tin': 'TIN',
  'Steel': 'STEEL',
  'Hot-Rolled Coil Steel': 'HRC-STEEL',
  'Titanium': 'TITAN',
  'Lithium': 'LC',
  // Grains
  'Corn Futures': 'CORN',
  'Wheat Futures': 'ZW-SPOT',
  'Soybean Futures': 'SOYBEAN-FUT',
  'Soybean Oil': 'ZL',
  'Soybean Meal': 'ZM',
  'Oat Futures': 'OAT-SPOT',
  'Rough Rice': 'RR-FUT',
  'Canola': 'CANOLA',
  'Sunflower Oil': 'SUNF',
  // Softs
  'Coffee Arabica': 'CA',
  'Sugar #11': 'LS11',
  'Cotton': 'CT',
  'Cocoa': 'CC',
  'Orange Juice': 'OJ',
  'UK Sugar No 5': 'LS',
  'Palm Oil': 'PO',
  // Livestock
  'Live Cattle': 'LC1',
  'Lean Hogs': 'LHOGS',
  'Milk': 'MILK',
  // Industrials
  'Industrial Ethanol': 'ETHANOL',
  'Rubber': 'RUBBER',
  'Cobalt': 'COB',
  // Other
  'Lumber Futures': 'LB-FUT',
};

/** CPA returns these symbols quoted in US Cents — caller should divide by 100.
 * Audited 2026-05-11 against /rates/latest:
 *   - CORN/SOYBEAN-FUT/SOYBEAN-SPOT/ZL/RUBBER are already returned in USD by CPA
 *     (not cents). Removing them fixes Corn $0.05, Soybeans $0.12, Soy Oil $0.01,
 *     Rubber $0.02 → real $/bu, $/lb, $/kg.
 *   - ZW-SPOT/ZW-FUT (Wheat) and OAT-SPOT/OAT-FUT come back as cents/bu (~615, ~355);
 *     dividing by 100 yields the correct ~$6/bu and ~$3.50/bu.
 *   - LS11 (Sugar #11) stays — correctly produces $0.15/lb.
 */
export const CENT_QUOTED_SYMBOLS = new Set([
  'LS11',
  'ZW-SPOT',
  'OAT-SPOT',
]);

/**
 * Premium-only commodities. Free tier sees household names; everything niche/regional/exotic
 * lives behind the paywall. See mem://monetization/strategy.
 */
// Free tier: 17 household-name commodities — top 2-4 from each group.
// Everything else is premium-gated. See mem://monetization/strategy.
// Free (17): WTI, Brent, Natural Gas, Gold Futures, Silver Futures, Copper, Platinum,
// Corn Futures, Wheat Futures, Soybean Futures, Coffee Arabica, Sugar #11, Cotton,
// Cocoa, Live Cattle, Lean Hogs, Lumber Futures.
export const PREMIUM_COMMODITIES = new Set<string>([
  // Energy — premium
  'Crude Oil Dubai', 'DME Oman Crude', 'Murban Crude', 'OPEC Basket',
  'Western Canadian Select', 'WTI Midland', 'Mars Blend', 'Louisiana Light Sweet',
  'Natural Gas UK', 'Dutch TTF Gas', 'Japan/Korea LNG',
  'Gasoline RBOB', 'Heating Oil', 'Jet Fuel', 'ULSD Diesel', 'Gasoil', 'Naphtha',
  // Metals — premium
  'Palladium', 'Aluminum', 'Zinc', 'Iron Ore',
  'Lead Futures', 'Nickel Futures', 'Tin', 'Steel', 'Hot-Rolled Coil Steel',
  'Titanium', 'Lithium',
  // Grains — premium
  'Soybean Oil', 'Soybean Meal',
  'Oat Futures', 'Rough Rice',
  'Canola', 'Sunflower Oil',
  // Softs — premium
  'Orange Juice', 'UK Sugar No 5', 'Palm Oil',
  // Livestock — premium
  'Milk',
  // Industrials — premium
  'Industrial Ethanol', 'Rubber', 'Cobalt',
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
    'Gold Futures', 'Silver Futures', 'Copper', 'Platinum', 'Palladium', 'Aluminum', 'Zinc', 'Iron Ore',
    'Lead Futures', 'Nickel Futures', 'Tin', 'Steel', 'Hot-Rolled Coil Steel',
    'Titanium', 'Lithium',
  ],
  grains: [
    'Corn Futures', 'Wheat Futures', 'Soybean Futures', 'Soybean Oil', 'Soybean Meal',
    'Oat Futures', 'Rough Rice',
    'Canola', 'Sunflower Oil',
  ],
  softs: [
    'Coffee Arabica', 'Sugar #11', 'Cotton', 'Cocoa', 'Orange Juice',
    'UK Sugar No 5', 'Palm Oil',
  ],
  livestock: [
    'Live Cattle', 'Lean Hogs', 'Milk',
  ],
  industrials: [
    'Industrial Ethanol', 'Rubber', 'Cobalt', 'Lumber Futures',
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
