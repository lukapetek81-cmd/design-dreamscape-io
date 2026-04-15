import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, X } from 'lucide-react';
import { SyntheticPosition } from '@/hooks/useSyntheticTrading';

interface ActivePositionsProps {
  positions: SyntheticPosition[];
  currentPrices: Record<string, number>;
  calcUnrealizedPnl: (position: SyntheticPosition, currentPrice: number) => number;
  onClose: (positionId: string, currentPrice: number) => void;
}

const ActivePositions: React.FC<ActivePositionsProps> = ({ positions, currentPrices, calcUnrealizedPnl, onClose }) => {
  if (positions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Open Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-6">No open positions. Select a market to trade.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          Open Positions
          <Badge variant="secondary" className="text-xs">{positions.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {positions.map((pos) => {
          const currentPrice = currentPrices[pos.commodity_name] || pos.entry_price;
          const pnl = calcUnrealizedPnl(pos, currentPrice);
          const pnlPercent = pos.margin_used > 0 ? (pnl / pos.margin_used) * 100 : 0;
          const isProfit = pnl >= 0;

          return (
            <div key={pos.id} className="rounded-lg border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={pos.direction === 'long' ? 'default' : 'destructive'} className="text-[10px] px-1.5">
                    {pos.direction === 'long' ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
                    {pos.direction.toUpperCase()}
                  </Badge>
                  <span className="font-medium text-sm">{pos.commodity_name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => onClose(pos.id, currentPrice)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Entry</span>
                  <p className="font-medium">${pos.entry_price.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Current</span>
                  <p className="font-medium">${currentPrice.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Margin</span>
                  <p className="font-medium">{pos.margin_used.toFixed(2)} USDC</p>
                </div>
                <div>
                  <span className="text-muted-foreground">P&L</span>
                  <p className={`font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                    {isProfit ? '+' : ''}{pnl.toFixed(2)} ({pnlPercent.toFixed(1)}%)
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default ActivePositions;
