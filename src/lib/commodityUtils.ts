/**
 * Utility functions for commodity data formatting
 */

// Commodities that are priced in cents rather than dollars
const CENT_PRICED_COMMODITIES = [
  // Grains (cents per bushel/cwt)
  'Corn Futures',
  'Wheat Futures', 
  'Soybean Futures',
  'Oat Futures',
  'Rough Rice',
  
  // Livestock (cents per pound)
  'Live Cattle Futures',
  'Feeder Cattle Futures', 
  'Lean Hogs Futures',
  
  // Softs (cents per pound)
  'Coffee',
  'Sugar',
  'Cotton', 
  'Orange Juice'
];

/**
 * Check if a commodity should be displayed in cents
 */
export const isCentPriced = (commodityName: string): boolean => {
  return CENT_PRICED_COMMODITIES.some(name => 
    commodityName.toLowerCase().includes(name.toLowerCase()) ||
    name.toLowerCase().includes(commodityName.toLowerCase())
  );
};

/**
 * Format price with appropriate currency symbol and decimal places
 */
export const formatPrice = (price: number, commodityName: string, decimals: number = 2): string => {
  if (isCentPriced(commodityName)) {
    return `${price.toFixed(decimals)}¢`;
  }
  return `$${price.toFixed(decimals)}`;
};

/**
 * Get the currency symbol for a commodity
 */
export const getCurrencySymbol = (commodityName: string): string => {
  return isCentPriced(commodityName) ? '¢' : '$';
};

/**
 * Get appropriate decimal places for a commodity based on timeframe
 */
export const getDecimalPlaces = (commodityName: string, timeframe?: string): number => {
  if (isCentPriced(commodityName)) {
    // Cent-priced commodities typically show 1-2 decimal places
    return timeframe === '1d' ? 2 : 1;
  }
  
  // Dollar-priced commodities
  if (commodityName.includes('Gold') || commodityName.includes('Silver') || commodityName.includes('Platinum') || commodityName.includes('Palladium')) {
    return 2; // Precious metals always show 2 decimals
  }
  
  return timeframe === '1d' ? 2 : 0; // Other dollar commodities
};