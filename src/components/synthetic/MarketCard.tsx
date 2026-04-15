import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MarketCardProps {
  name: string;
  price: number;
  change: number;
  changePercent: number;
  category: string;
  onLong: () => void;
  onShort: () => void;
}

const categoryColors: Record<string, string> = {
  energy: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  metals: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  grains: 'bg-green-500/10 text-green-400 border-green-500/20',
  livestock: 'bg-red-500/10 text-red-400 border-red-500/20',
  softs: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  other: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

const MarketCard: React.FC<MarketCardProps> = ({ name, price, change, changePercent, category, onLong, onShort }) => {
  const isPositive = change >= 0;

  return (
    <Card className="hover:border-primary/40 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 min-w-0 flex-1">
            <h3 className="font-semibold text-sm leading-tight truncate">{name}</h3>
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${categoryColors[category] || categoryColors.other}`}>
              {category}
            </Badge>
          </div>
          <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
          </div>
        </div>

        <div className="text-2xl font-bold tracking-tight">
          ${price.toFixed(2)}
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs h-8"
            onClick={onLong}
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            Long
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs h-8"
            onClick={onShort}
          >
            <TrendingDown className="h-3 w-3 mr-1" />
            Short
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketCard;
