/**
 * Utility functions for commodity chart configuration and formatting
 */

export interface TimeframeOption {
  label: string;
  value: string;
}

export const TIMEFRAMES: TimeframeOption[] = [
  { label: '1D', value: '1d' },
  { label: '1M', value: '1m' },
  { label: '3M', value: '3m' },
  { label: '6M', value: '6m' },
];

/**
 * Calculate dynamic y-axis domain to prevent flat-looking charts
 */
export const getYAxisDomain = (
  data: Array<{ price: number }>,
  name: string,
  selectedTimeframe: string
): [number, number] => {
  if (data.length === 0) return [0, 100];
  
  const prices = data.map(d => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = maxPrice - minPrice;
  const avgPrice = (minPrice + maxPrice) / 2;
  
  // Enhanced flat chart detection - check if range is very small
  const isFlat = range < avgPrice * 0.005; // 0.5% threshold
  
  if (isFlat) {
    // For flat charts, create meaningful scale based on commodity type
    let artificialRange;
    
    if (name.includes('Wheat') || name.includes('Corn') || name.includes('Soybean')) {
      // Agricultural commodities need larger scales
      if (avgPrice < 100) {
        artificialRange = Math.max(2.0, avgPrice * 0.08);
      } else if (avgPrice < 500) {
        artificialRange = avgPrice * 0.06;
      } else if (avgPrice < 800) {
        // Wheat typically trades around 550-700 cents
        artificialRange = Math.max(15.0, avgPrice * 0.04);
      } else if (avgPrice < 1200) {
        // Soybeans typically trade around 1000-1200 cents
        artificialRange = Math.max(25.0, avgPrice * 0.035);
      } else {
        artificialRange = avgPrice * 0.03;
      }
    } else if (avgPrice < 10) {
      artificialRange = Math.max(0.5, avgPrice * 0.05);
    } else if (avgPrice < 100) {
      artificialRange = avgPrice * 0.03;
    } else if (avgPrice < 1000) {
      artificialRange = avgPrice * 0.02;
    } else {
      artificialRange = avgPrice * 0.015;
    }
    
    return [
      Math.max(0, avgPrice - artificialRange),
      avgPrice + artificialRange
    ];
  }
  
  // Use tighter y-axis bounds with strategic padding
  let paddingMultiplier;
  
  if (name.includes('Wheat') || name.includes('Corn') || name.includes('Soybean')) {
    // Agricultural commodities get more padding to show volatility
    if (selectedTimeframe === '1d') {
      paddingMultiplier = 0.12; // 12% padding for daily grains
    } else if (selectedTimeframe === '1m') {
      paddingMultiplier = 0.08; // 8% padding for monthly grains
    } else if (selectedTimeframe === '3m') {
      paddingMultiplier = 0.06; // 6% padding for 3-month grains
    } else { // 6-month
      paddingMultiplier = 0.04; // 4% padding for 6-month grains
    }
  } else {
    // Other commodities use standard padding
    if (selectedTimeframe === '1d') {
      paddingMultiplier = 0.05; // 5% padding for daily
    } else if (selectedTimeframe === '1m') {
      paddingMultiplier = 0.03; // 3% padding for monthly
    } else if (selectedTimeframe === '3m') {
      paddingMultiplier = 0.02; // 2% padding for 3-month
    } else { // 6-month
      paddingMultiplier = 0.01; // 1% padding for 6-month
    }
  }
  
  const padding = range * paddingMultiplier;
  const minPadding = avgPrice * 0.002; // Minimum 0.2% of average price
  const finalPadding = Math.max(padding, minPadding);
  
  return [
    Math.max(0, minPrice - finalPadding),
    maxPrice + finalPadding
  ];
};

/**
 * Format X-axis tick based on timeframe
 */
export const formatXAxisTick = (date: string, timeframe: string): string => {
  if (timeframe === '1d') {
    // For daily timeframe, show hours
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  } else {
    // For other timeframes, show date
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }
};

/**
 * Format tooltip label based on timeframe
 */
export const formatTooltipLabel = (label: string, timeframe: string): string => {
  if (timeframe === '1d') {
    // For daily timeframe, show full date and time
    return new Date(label).toLocaleString('en-US', { 
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } else {
    // For other timeframes, show date only
    return new Date(label).toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
};
