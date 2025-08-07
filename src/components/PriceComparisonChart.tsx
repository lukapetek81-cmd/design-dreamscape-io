import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, Activity, Clock } from 'lucide-react';
import { useCommodityHistoricalData } from '@/hooks/useCommodityData';
import { useRealtimeDataContext } from '@/contexts/RealtimeDataContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface Commodity {
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  group: string;
  contractSymbol?: string; // Optional contract symbol for futures
}

interface PriceComparisonChartProps {
  commodities: Commodity[];
}

interface ChartDataPoint {
  date: string;
  timestamp?: number;
  [key: string]: any; // For dynamic commodity price keys
}

const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0', 
  '#ffb3ba', '#bae1ff', '#ffffba', '#baffc9', '#ffd6cc', '#e1c6ff'
];

const TIMEFRAMES = [
  { value: '1D', label: '1 Day' },
  { value: '5D', label: '5 Days' },
  { value: '1M', label: '1 Month' },
  { value: '3M', label: '3 Months' },
  { value: '6M', label: '6 Months' },
  { value: '1Y', label: '1 Year' }
];

export const PriceComparisonChart: React.FC<PriceComparisonChartProps> = ({ commodities }) => {
  const [timeframe, setTimeframe] = useState('1D');
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [failedCommodities, setFailedCommodities] = useState<string[]>([]);
  const [useLogScale, setUseLogScale] = useState(false);
  const { prices, connected, lastUpdate, isLiveData } = useRealtimeDataContext();
  const isMobile = useIsMobile();

  // Get historical data for each commodity (with contract support)
  const historicalQueries = commodities.map(commodity => 
    useCommodityHistoricalData(
      commodity.name, 
      timeframe, 
      'line', 
      commodity.contractSymbol
    )
  );

  // Process and combine historical data
  useEffect(() => {
    if (commodities.length === 0) {
      setChartData([]);
      return;
    }

    setIsLoading(true);
    
    // Check which queries have data (allow partial data)
    const queriesWithData = historicalQueries.filter((query, index) => 
      query.data && query.data.data && query.data.data.length > 0 && !query.data.error
    );

    if (queriesWithData.length === 0) {
      console.warn('No commodity data available for chart');
      setIsLoading(false);
      return;
    }

    try {
      // Create a map of dates to price data
      const dateMap = new Map<string, ChartDataPoint>();
      const failed: string[] = [];

      historicalQueries.forEach((query, index) => {
        const commodity = commodities[index];
        
        // Only process successful queries
        if (!query.data || !query.data.data || query.data.error) {
          console.warn(`Skipping ${commodity.name} due to data fetch error:`, query.data?.error);
          failed.push(commodity.name);
          return;
        }

        const data = query.data.data;

        data.forEach((point) => {
          const dateKey = point.date;
          const timestamp = new Date(point.date).getTime();
          
          if (!dateMap.has(dateKey)) {
            dateMap.set(dateKey, {
              date: dateKey,
              timestamp: timestamp
            });
          }

          const existing = dateMap.get(dateKey)!;
          // Use the display symbol (contract symbol if available, otherwise base symbol)
          const displaySymbol = commodity.contractSymbol || commodity.symbol;
          existing[displaySymbol] = point.price;
        });
      });

      setFailedCommodities(failed);

      // Convert map to array and sort by timestamp
      const combinedData = Array.from(dateMap.values())
        .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
        .map(point => {
          const { timestamp, ...rest } = point;
          return rest;
        });

      console.log('Chart data processed:', combinedData.length, 'data points');
      setChartData(combinedData);
    } catch (error) {
      console.error('Error processing chart data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [commodities, historicalQueries]);

  // Update chart with real-time data
  useEffect(() => {
    if (!connected || !lastUpdate || chartData.length === 0) return;

    const now = new Date();
    const currentTime = now.toISOString();

    // Create new data point with current real-time prices
    const newDataPoint: ChartDataPoint = {
      date: currentTime,
      timestamp: now.getTime()
    };

    commodities.forEach(commodity => {
      const displaySymbol = commodity.contractSymbol || commodity.symbol;
      const livePrice = prices[commodity.name];
      if (livePrice) {
        newDataPoint[displaySymbol] = livePrice.price;
      } else {
        // Fallback to last known price if no live data
        newDataPoint[displaySymbol] = commodity.price;
      }
    });

    setChartData(prevData => {
      // Add new point and keep last 100 points for performance
      const updatedData = [...prevData, newDataPoint].slice(-100);
      return updatedData;
    });
  }, [lastUpdate, prices, connected, commodities]);

  const formatTooltipValue = (value: number) => {
    return [`$${value.toFixed(2)}`, ''];
  };

  const formatAxisLabel = (value: string) => {
    const date = new Date(value);
    if (timeframe === '1D') {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getConnectionStatus = () => {
    if (connected) {
      return (
        <Badge variant="secondary" className="text-green-600">
          <Activity className="w-3 h-3 mr-1" />
          Live
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-muted-foreground">
        <Clock className="w-3 h-3 mr-1" />
        Historical
      </Badge>
    );
  };

  if (commodities.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Price Movement Comparison
            </CardTitle>
            <CardDescription>
              Real-time price movements across selected commodities
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getConnectionStatus()}
            <Button
              variant={useLogScale ? "default" : "outline"}
              size="sm"
              onClick={() => setUseLogScale(!useLogScale)}
              className="whitespace-nowrap"
            >
              Log Scale
            </Button>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEFRAMES.map((tf) => (
                  <SelectItem key={tf.value} value={tf.value}>
                    {tf.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground">Loading chart data...</p>
              </div>
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No chart data available</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatAxisLabel}
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  scale={useLogScale ? "log" : "linear"}
                  domain={useLogScale ? ['dataMin', 'dataMax'] : ['auto', 'auto']}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                />
                <Tooltip
                  formatter={formatTooltipValue}
                  labelFormatter={(label) => {
                    const date = new Date(label);
                    return date.toLocaleString();
                  }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Legend />
                {commodities.map((commodity, index) => {
                  const displaySymbol = commodity.contractSymbol || commodity.symbol;
                  const displayName = commodity.contractSymbol 
                    ? `${commodity.name} (${commodity.contractSymbol})` 
                    : `${commodity.name} (${commodity.symbol})`;
                    
                  return (
                    <Line
                      key={displaySymbol}
                      type="monotone"
                      dataKey={displaySymbol}
                      stroke={COLORS[index % COLORS.length]}
                      strokeWidth={2}
                      dot={false}
                      name={displayName}
                      connectNulls={false}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        
        {/* Show warning for failed commodities */}
        {failedCommodities.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                Warning
              </Badge>
              <span className="text-sm text-yellow-700 dark:text-yellow-300">
                Failed to load data for: {failedCommodities.join(', ')}
              </span>
            </div>
          </div>
        )}
        
        {connected && lastUpdate && (
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>Last update: {lastUpdate.toLocaleTimeString()}</span>
            <div className="flex items-center gap-4">
              {commodities.map((commodity) => {
                const displaySymbol = commodity.contractSymbol || commodity.symbol;
                const livePrice = prices[commodity.name];
                const hasLiveData = isLiveData(commodity.name);
                
                return (
                  <div key={displaySymbol} className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${hasLiveData ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                    <span>{displaySymbol}</span>
                    {livePrice && (
                      <span className={livePrice.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                        ${livePrice.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
