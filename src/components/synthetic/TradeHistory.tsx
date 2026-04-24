import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, TrendingUp, TrendingDown } from 'lucide-react';
import { TradeHistoryItem } from '@/hooks/useSyntheticTrading';

interface TradeHistoryProps {
  trades: TradeHistoryItem[];
}

const TradeHistoryPanel: React.FC<TradeHistoryProps> = ({ trades }) => {
  if (trades.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4" />
            Trade History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">No trades yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <History className="h-4 w-4" />
          Trade History
          <Badge variant="secondary" className="text-xs">{trades.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {trades.map((trade) => {
            const isProfit = trade.realized_pnl >= 0;
            return (
              <div key={trade.id} className="flex items-center justify-between py-2 border-b last:border-0 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant={trade.direction === 'long' ? 'default' : 'destructive'} className="text-[10px] px-1">
                    {trade.direction === 'long' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  </Badge>
                  <span className="font-medium">{trade.commodity_name}</span>
                </div>
                <span className={`font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                  {isProfit ? '+' : ''}{trade.realized_pnl.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default TradeHistoryPanel;
