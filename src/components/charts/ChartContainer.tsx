import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader, AlertCircle } from 'lucide-react';
import { CommodityHistoricalData } from '@/hooks/useCommodityData';
import { formatPrice, getCurrencySymbol, getDecimalPlaces } from '@/lib/commodityUtils';
import { getYAxisDomain, formatXAxisTick, formatTooltipLabel, smoothPriceData } from './chartUtils';
import CandlestickChart from '../CandlestickChart';

interface ChartContainerProps {
  data: CommodityHistoricalData[];
  name: string;
  selectedTimeframe: string;
  chartType: 'line' | 'candlestick';
  loading: boolean;
  error: string | null;
  isPositiveTrend: boolean;
}

const ChartContainer: React.FC<ChartContainerProps> = ({
  data,
  name,
  selectedTimeframe,
  chartType,
  loading,
  error,
  isPositiveTrend
}) => {
  // Apply data smoothing only for line charts on problematic commodities
  const smoothedData = chartType === 'line' ? smoothPriceData(data, name) : data;
  const yAxisDomain = getYAxisDomain(smoothedData, name, selectedTimeframe);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Loading real market data...</span>
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {chartType === 'candlestick' ? (
        (() => {
          const filteredData = data.filter((item): item is CommodityHistoricalData & { open: number; high: number; low: number; close: number } => 
            typeof item.open === 'number' && 
            typeof item.high === 'number' && 
            typeof item.low === 'number' && 
            typeof item.close === 'number'
          );
          
          return (
            <CandlestickChart
              data={filteredData}
              formatXAxisTick={(date) => formatXAxisTick(date, selectedTimeframe)}
              formatTooltipLabel={(label) => formatTooltipLabel(label, selectedTimeframe)}
              commodityName={name}
            />
          );
        })()
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={smoothedData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => formatXAxisTick(date, selectedTimeframe)}
              minTickGap={selectedTimeframe === '1d' ? 60 : 30}
              tick={{ 
                fontSize: 12, 
                fill: 'hsl(var(--muted-foreground))',
                fontWeight: 500
              }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
              interval={selectedTimeframe === '1d' ? 'preserveStartEnd' : 'preserveStartEnd'}
            />
            <YAxis 
              tick={{ 
                fontSize: 12, 
                fill: 'hsl(var(--muted-foreground))',
                fontWeight: 500
              }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
              tickFormatter={(value) => {
                const decimals = getDecimalPlaces(name, selectedTimeframe);
                const symbol = getCurrencySymbol(name);
                return `${symbol}${value.toFixed(decimals)}`;
              }}
              domain={yAxisDomain}
            />
            <Tooltip 
              labelFormatter={(label) => formatTooltipLabel(label, selectedTimeframe)}
              formatter={(value: number) => [formatPrice(value, name), 'Price']}
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
    </>
  );
};

export default ChartContainer;