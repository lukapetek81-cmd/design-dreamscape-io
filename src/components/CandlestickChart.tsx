
import React from 'react';
import { ResponsiveContainer } from 'recharts';
import { CommodityHistoricalData } from '@/hooks/useCommodityData';

interface CandlestickData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface CandlestickChartProps {
  data: CandlestickData[];
  formatXAxisTick: (date: string) => string;
  formatTooltipLabel: (label: string) => string;
}

const CandlestickChart = ({ data, formatXAxisTick, formatTooltipLabel }: CandlestickChartProps) => {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const [tooltipData, setTooltipData] = React.useState<{
    x: number;
    y: number;
    data: CandlestickData;
  } | null>(null);

  console.log('CandlestickChart received data:', data.length, 'items:', data.slice(0, 2));

  const handleMouseMove = (event: React.MouseEvent<SVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = rect.width;
    const dataIndex = Math.floor((x / width) * data.length);
    
    if (dataIndex >= 0 && dataIndex < data.length) {
      setHoveredIndex(dataIndex);
      setTooltipData({
        x: event.clientX,
        y: event.clientY,
        data: data[dataIndex]
      });
    }
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    setTooltipData(null);
  };

  const maxPrice = Math.max(...data.map(d => d.high));
  const minPrice = Math.min(...data.map(d => d.low));
  const priceRange = maxPrice - minPrice;
  const padding = priceRange * 0.1;

  // If no data, show message
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">No OHLC data available for candlestick chart</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <svg
        width="100%"
        height="100%"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="cursor-crosshair"
        viewBox="0 0 800 400"
        preserveAspectRatio="none"
      >
        {data.map((item, index) => {
          const x = (index / Math.max(data.length - 1, 1)) * 740 + 30; // Leave margin
          const isGreen = item.close > item.open;
          const bodyTop = Math.max(item.open, item.close);
          const bodyBottom = Math.min(item.open, item.close);
          
          // Calculate positions as absolute coordinates
          const chartHeight = 340; // Leave space for labels
          const highY = ((maxPrice + padding - item.high) / (priceRange + 2 * padding)) * chartHeight + 20;
          const lowY = ((maxPrice + padding - item.low) / (priceRange + 2 * padding)) * chartHeight + 20;
          const bodyTopY = ((maxPrice + padding - bodyTop) / (priceRange + 2 * padding)) * chartHeight + 20;
          const bodyBottomY = ((maxPrice + padding - bodyBottom) / (priceRange + 2 * padding)) * chartHeight + 20;
          
          const isHovered = hoveredIndex === index;
          const candleWidth = Math.max(3, Math.min(12, 740 / data.length * 0.8));

          return (
            <g key={`candle-${index}`} className={`transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-80'}`}>
              {/* Wick */}
              <line
                x1={x}
                y1={highY}
                x2={x}
                y2={lowY}
                stroke={isGreen ? '#10b981' : '#ef4444'}
                strokeWidth={isHovered ? 2 : 1}
              />
              
              {/* Body */}
              <rect
                x={x - candleWidth/2}
                y={Math.min(bodyTopY, bodyBottomY)}
                width={candleWidth}
                height={Math.max(Math.abs(bodyBottomY - bodyTopY), 2)}
                fill={isGreen ? '#10b981' : '#ef4444'}
                stroke={isGreen ? '#059669' : '#dc2626'}
                strokeWidth={isHovered ? 2 : 1}
                className="transition-all duration-200"
              />
              
              {/* Hover highlight */}
              {isHovered && (
                <rect
                  x={Math.max(0, x - candleWidth)}
                  y={20}
                  width={candleWidth * 2}
                  height={chartHeight}
                  fill="rgba(59, 130, 246, 0.1)"
                  stroke="rgba(59, 130, 246, 0.3)"
                  strokeWidth={1}
                />
              )}
            </g>
          );
        })}
        
        {/* X-axis labels */}
        {data.filter((_, index) => index % Math.ceil(data.length / 6) === 0).map((item, index) => {
          const actualIndex = index * Math.ceil(data.length / 6);
          const x = (actualIndex / Math.max(data.length - 1, 1)) * 740 + 30;
          
          return (
            <text
              key={actualIndex}
              x={x}
              y={380}
              textAnchor="middle"
              className="text-xs fill-muted-foreground font-medium"
            >
              {formatXAxisTick(item.date)}
            </text>
          );
        })}
      </svg>
      
      {/* Custom Tooltip */}
      {tooltipData && (
        <div
          className="fixed z-50 bg-background border border-border/50 rounded-lg p-3 shadow-xl pointer-events-none"
          style={{
            left: tooltipData.x + 10,
            top: tooltipData.y - 10,
            transform: 'translateY(-100%)'
          }}
        >
          <div className="text-sm font-semibold text-foreground mb-2">
            {formatTooltipLabel(tooltipData.data.date)}
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Open:</span>
              <span className="font-medium">${tooltipData.data.open.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">High:</span>
              <span className="font-medium text-green-600">${tooltipData.data.high.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Low:</span>
              <span className="font-medium text-red-600">${tooltipData.data.low.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Close:</span>
              <span className="font-medium">${tooltipData.data.close.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandlestickChart;
