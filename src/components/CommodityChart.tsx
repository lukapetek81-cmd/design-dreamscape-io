import React from 'react';
import { Card } from '@/components/ui/card';
import { useCommodityHistoricalData, useCommodityPrice } from '@/hooks/useCommodityData';
import { useAuth } from '@/contexts/AuthContext';
import ChartHeader from './charts/ChartHeader';
import ChartContainer from './charts/ChartContainer';
import ChartFooter from './charts/ChartFooter';

interface CommodityChartProps {
  name: string;
  basePrice: number;
}

const CommodityChart = ({ name, basePrice }: CommodityChartProps) => {
  const [selectedTimeframe, setSelectedTimeframe] = React.useState<string>('1m');
  const [chartType, setChartType] = React.useState<'line' | 'candlestick'>('line');
  
  const { data: queryData, isLoading: loading, error: queryError } = useCommodityHistoricalData(name, selectedTimeframe, chartType);
  const { data: currentPrice } = useCommodityPrice(name);
  const { profile } = useAuth();

  const isPremium = profile?.subscription_active && profile?.subscription_tier === 'premium';
  
  // Extract data from query result
  const data = queryData?.data || [];
  const error = queryError?.message || queryData?.error || null;
  
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
    priceChange: priceChange.toFixed(2) + '%',
    chartType,
    sampleData: data.slice(0, 2),
    hasOHLC: chartType === 'candlestick' ? data.some(item => 
      typeof item.open === 'number' && 
      typeof item.high === 'number' && 
      typeof item.low === 'number' && 
      typeof item.close === 'number'
    ) : false
  });

  return (
    <Card className="p-4 sm:p-6 mt-4 sm:mt-6 bg-gradient-to-br from-card/80 to-muted/20 border border-border/50 shadow-soft hover:shadow-medium transition-all duration-300 animate-fade-in">
      <ChartHeader
        name={name}
        selectedTimeframe={selectedTimeframe}
        onTimeframeChange={setSelectedTimeframe}
        chartType={chartType}
        onChartTypeChange={setChartType}
        dataPoints={data.length}
        loading={loading}
        isPositiveTrend={isPositiveTrend}
        priceChange={priceChange}
      />

      <div className="h-[200px] sm:h-[250px] lg:h-[300px] w-full p-2 sm:p-4 bg-gradient-to-br from-background/50 to-muted/20 rounded-xl border border-border/30">
        <ChartContainer
          data={data}
          name={name}
          selectedTimeframe={selectedTimeframe}
          chartType={chartType}
          loading={loading}
          error={error}
          isPositiveTrend={isPositiveTrend}
        />
      </div>

      <ChartFooter
        name={name}
        selectedTimeframe={selectedTimeframe}
        loading={loading}
        error={error}
        isPositiveTrend={isPositiveTrend}
        displayPrice={displayPrice}
        isPremium={isPremium}
        currentPrice={currentPrice}
      />
    </Card>
  );
};

export default CommodityChart;