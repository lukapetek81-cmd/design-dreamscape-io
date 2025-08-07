import React from 'react';
import { Card } from '@/components/ui/card';
import { PriceChangeIndicator } from '@/components/ui/price-change-indicator';
import { Commodity } from '@/hooks/useCommodityData';

interface OptimizedCommodityCardProps extends Pick<Commodity, 'name' | 'symbol' | 'price' | 'change' | 'changePercent' | 'venue' | 'contractSize'> {
  loading?: boolean;
}

// Pre-computed color classes to avoid runtime calculations
const POSITIVE_CLASSES = 'text-green-600 dark:text-green-400';
const NEGATIVE_CLASSES = 'text-red-600 dark:text-red-400';
const NEUTRAL_CLASSES = 'text-muted-foreground';

const OptimizedCommodityCard = React.memo<OptimizedCommodityCardProps>(({
  name,
  symbol,
  price,
  change,
  changePercent,
  venue,
  contractSize,
  loading = false
}) => {
  // Pre-calculate values to avoid inline calculations
  const isPositive = change > 0;
  const isNegative = change < 0;
  const changeColorClass = isPositive ? POSITIVE_CLASSES : isNegative ? NEGATIVE_CLASSES : NEUTRAL_CLASSES;
  const changePrefix = isPositive ? '+' : '';
  const formattedPrice = price.toFixed(2);
  const formattedChange = Math.abs(change).toFixed(2);
  const formattedChangePercent = Math.abs(changePercent).toFixed(2);

  if (loading) {
    return (
      <Card className="p-4 animate-pulse">
        <div className="space-y-3">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-6 bg-muted rounded w-1/2"></div>
          <div className="h-4 bg-muted rounded w-1/4"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 hover:shadow-md transition-shadow duration-200 mobile-card">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-foreground truncate text-sm sm:text-base">
            {name}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {symbol} • {venue}
          </p>
          {contractSize && (
            <p className="text-2xs text-muted-foreground/80 mt-0.5">
              {contractSize}
            </p>
          )}
        </div>
        
        <div className="text-right ml-4 shrink-0">
          <div className="font-bold text-lg number-display">
            ${formattedPrice}
          </div>
          <div className={`text-sm font-medium ${changeColorClass} inline-flex items-center gap-1`}>
            <PriceChangeIndicator
              change={change}
              changePercent={changePercent}
              showIcon={true}
              size="sm"
              className="inline-flex items-center gap-1"
            />
            <span>
              {changePrefix}{formattedChange} ({changePrefix}{formattedChangePercent}%)
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
});

OptimizedCommodityCard.displayName = 'OptimizedCommodityCard';

export default OptimizedCommodityCard;