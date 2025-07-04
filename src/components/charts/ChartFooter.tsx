import React from 'react';
import { formatPrice } from '@/lib/commodityUtils';
import { CommodityPriceData } from '@/hooks/useCommodityData';

interface ChartFooterProps {
  name: string;
  selectedTimeframe: string;
  loading: boolean;
  error: string | null;
  isPositiveTrend: boolean;
  displayPrice: number;
  isPremium: boolean;
  currentPrice?: CommodityPriceData | null;
}

const ChartFooter: React.FC<ChartFooterProps> = ({
  name,
  selectedTimeframe,
  loading,
  error,
  isPositiveTrend,
  displayPrice,
  isPremium,
  currentPrice
}) => {
  return (
    <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-muted/30 to-muted/20 rounded-xl border border-border/30">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full animate-pulse ${
          loading ? 'bg-blue-500' : error ? 'bg-red-500' : isPositiveTrend ? 'bg-green-500' : 'bg-red-500'
        }`}></div>
        <div>
          <p className="text-xs sm:text-sm font-semibold text-foreground">
            {loading ? 'Loading Real Data...' : error ? 'Using Fallback Data' : isPositiveTrend ? 'Market Open' : 'Market Closed'}
          </p>
          <p className="text-2xs sm:text-xs text-muted-foreground">
            {loading ? 'Fetching from FMP API...' : `Based on ${selectedTimeframe.toUpperCase()} data`}
          </p>
        </div>
      </div>
      
      <div className="text-right">
        <p className="text-xs sm:text-sm font-semibold text-muted-foreground">Current Price</p>
        <div className="flex items-baseline justify-end gap-2">
          <p className="text-lg sm:text-xl font-bold text-foreground number-display">
            {formatPrice(displayPrice, name)}
          </p>
          <span className={`text-2xs font-medium px-1.5 py-0.5 rounded ${
            isPremium 
              ? 'bg-green-100 dark:bg-green-950/20 text-green-700 dark:text-green-400' 
              : 'bg-muted/50 text-muted-foreground'
          }`}>
            {isPremium ? 'Real-time' : '15min delayed'}
          </span>
        </div>
        {currentPrice && (
          <p className={`text-xs font-medium ${
            currentPrice.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {currentPrice.change >= 0 ? '+' : ''}{currentPrice.change.toFixed(2)} ({currentPrice.changePercent.toFixed(2)}%)
          </p>
        )}
      </div>
    </div>
  );
};

export default ChartFooter;