
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar, Loader, AlertCircle } from 'lucide-react';
import { useCommodityHistoricalData, useCommodityPrice } from '@/hooks/useCommodityData';

interface TimeframeOption {
  label: string;
  value: string;
}

const timeframes: TimeframeOption[] = [
  { label: '7D', value: '7d' },
  { label: '1M', value: '1m' },
  { label: '3M', value: '3m' },
  { label: '6M', value: '6m' },
];

interface CommodityChartProps {
  name: string;
  basePrice: number;
}

const CommodityChart = ({ name, basePrice }: CommodityChartProps) => {
  const [selectedTimeframe, setSelectedTimeframe] = React.useState<string>('1m');
  const { data, loading, error } = useCommodityHistoricalData(name, selectedTimeframe);
  const { price: currentPrice } = useCommodityPrice(name);

  // Use current price from API if available, otherwise use base price
  const displayPrice = currentPrice?.price || basePrice;
  const isPositiveTrend = data.length > 1 && data[data.length - 1].price > data[0].price;

  // Calculate price change
  const priceChange = data.length > 1 ? 
    ((data[data.length - 1].price - data[0].price) / data[0].price) * 100 : 0;

  console.log(`Chart data for ${name}:`, { 
    dataPoints: data.length, 
    currentPrice: displayPrice, 
    trend: isPositiveTrend ? 'positive' : 'negative',
    priceChange: priceChange.toFixed(2) + '%'
  });

  return (
    <Card className="p-4 sm:p-6 mt-4 sm:mt-6 bg-gradient-to-br from-card/80 to-muted/20 border border-border/50 shadow-soft hover:shadow-medium transition-all duration-300 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl transition-all duration-300 ${
            isPositiveTrend 
              ? 'bg-green-100 dark:bg-green-950/20 text-green-600 dark:text-green-400' 
              : 'bg-red-100 dark:bg-red-950/20 text-red-600 dark:text-red-400'
          }`}>
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-foreground">{name} Price History</h4>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              {selectedTimeframe.toUpperCase()} • {loading ? 'Loading...' : `${data.length} data points`}
              {data.length > 0 && (
                <span className={`ml-2 font-semibold ${
                  isPositiveTrend ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {priceChange > 0 ? '+' : ''}{priceChange.toFixed(2)}%
                </span>
              )}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <div className="flex gap-1 sm:gap-2 p-1 bg-muted/50 rounded-lg">
            {timeframes.map((tf) => (
              <Button
                key={tf.value}
                variant={selectedTimeframe === tf.value ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedTimeframe(tf.value)}
                disabled={loading}
                className={`text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  selectedTimeframe === tf.value
                    ? 'bg-primary text-primary-foreground shadow-soft hover:bg-primary/90'
                    : 'hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                }`}
              >
                {tf.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-[200px] sm:h-[250px] lg:h-[300px] w-full p-2 sm:p-4 bg-gradient-to-br from-background/50 to-muted/20 rounded-xl border border-border/30">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <Loader className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">Loading real market data...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                Unable to load real market data
              </p>
              <p className="text-xs text-muted-foreground">{error}</p>
              <p className="text-xs text-muted-foreground mt-1">Using fallback data</p>
            </div>
          </div>
        )}

        {!loading && !error && data.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })} 
                minTickGap={30}
                tick={{ 
                  fontSize: 12, 
                  fill: 'hsl(var(--muted-foreground))',
                  fontWeight: 500
                }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                tick={{ 
                  fontSize: 12, 
                  fill: 'hsl(var(--muted-foreground))',
                  fontWeight: 500
                }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
                domain={['dataMin - 5', 'dataMax + 5']}
              />
              <Tooltip 
                labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { 
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                  fontSize: '14px',
                  fontWeight: 500,
                  padding: '12px 16px'
                }}
                labelStyle={{
                  color: 'hsl(var(--foreground))',
                  fontWeight: 600,
                  marginBottom: '4px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke={isPositiveTrend ? '#10b981' : '#ef4444'}
                strokeWidth={3}
                dot={false}
                activeDot={{ 
                  r: 6, 
                  fill: isPositiveTrend ? '#10b981' : '#ef4444',
                  stroke: 'hsl(var(--background))',
                  strokeWidth: 2,
                  className: 'animate-pulse'
                }}
                className="transition-all duration-300"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-muted/30 to-muted/20 rounded-xl border border-border/30">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full animate-pulse ${
            loading ? 'bg-blue-500' : error ? 'bg-red-500' : isPositiveTrend ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <div>
            <p className="text-xs sm:text-sm font-semibold text-foreground">
              {loading ? 'Loading Real Data...' : error ? 'Using Fallback Data' : isPositiveTrend ? 'Upward Trend' : 'Downward Trend'}
            </p>
            <p className="text-2xs sm:text-xs text-muted-foreground">
              {loading ? 'Fetching from FMP API...' : `Based on ${selectedTimeframe.toUpperCase()} data`}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-xs sm:text-sm font-semibold text-muted-foreground">Current Price</p>
          <p className="text-lg sm:text-xl font-bold text-foreground number-display">
            ${displayPrice.toFixed(2)}
          </p>
          {currentPrice && (
            <p className={`text-xs font-medium ${
              currentPrice.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {currentPrice.change >= 0 ? '+' : ''}{currentPrice.change.toFixed(2)} ({currentPrice.changePercent.toFixed(2)}%)
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CommodityChart;
