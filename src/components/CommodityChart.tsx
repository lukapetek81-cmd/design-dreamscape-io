
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

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

// Mock data generator for demo purposes
const generateMockData = (days: number, basePrice: number) => {
  const data = [];
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const randomChange = (Math.random() - 0.5) * 2; // Random price movement
    const price = basePrice + (randomChange * (basePrice * 0.1));
    data.push({
      date: date.toISOString().split('T')[0],
      price: parseFloat(price.toFixed(2))
    });
  }
  return data;
};

interface CommodityChartProps {
  name: string;
  basePrice: number;
}

const CommodityChart = ({ name, basePrice }: CommodityChartProps) => {
  const [selectedTimeframe, setSelectedTimeframe] = React.useState<string>('7d');
  
  const getDaysForTimeframe = (timeframe: string): number => {
    switch (timeframe) {
      case '7d': return 7;
      case '1m': return 30;
      case '3m': return 90;
      case '6m': return 180;
      default: return 7;
    }
  };

  const data = React.useMemo(() => {
    const days = getDaysForTimeframe(selectedTimeframe);
    return generateMockData(days, basePrice);
  }, [selectedTimeframe, basePrice]);

  return (
    <Card className="p-4 mt-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-sm font-medium">{name} Price History</h4>
        <div className="flex gap-2">
          {timeframes.map((tf) => (
            <Button
              key={tf.value}
              variant={selectedTimeframe === tf.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeframe(tf.value)}
            >
              {tf.label}
            </Button>
          ))}
        </div>
      </div>
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => new Date(date).toLocaleDateString()} 
              minTickGap={30}
            />
            <YAxis />
            <Tooltip 
              labelFormatter={(label) => new Date(label).toLocaleDateString()}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#2563eb" 
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default CommodityChart;
