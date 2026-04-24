import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  DollarSign,
  BarChart3,
  X
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface IBKRPosition {
  accountId: string;
  symbol: string;
  position: number;
  avgPrice: number;
  marketPrice: number;
  unrealizedPnl: number;
  realizedPnl: number;
}

interface PositionsListProps {
  positions: IBKRPosition[];
  isLoading: boolean;
}

export const PositionsList: React.FC<PositionsListProps> = ({ 
  positions, 
  isLoading 
}) => {
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatPercent = (current: number, avg: number) => {
    if (avg === 0) return '0.00%';
    const percent = ((current - avg) / avg) * 100;
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  const getPnLColor = (pnl: number) => {
    if (pnl > 0) return 'text-emerald-600';
    if (pnl < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  const getPnLIcon = (pnl: number) => {
    if (pnl > 0) return <TrendingUp className="w-4 h-4" />;
    if (pnl < 0) return <TrendingDown className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Positions
          </CardTitle>
          <CardDescription>Current portfolio positions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (positions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Positions
          </CardTitle>
          <CardDescription>Current portfolio positions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Activity className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Positions</h3>
            <p className="text-muted-foreground">
              You don't have any open positions yet. Place your first order to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Positions
        </CardTitle>
        <CardDescription>
          {positions.length} open position{positions.length !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead className="text-center">Position</TableHead>
                <TableHead className="text-right">Avg Price</TableHead>
                <TableHead className="text-right">Market Price</TableHead>
                <TableHead className="text-right">P&L %</TableHead>
                <TableHead className="text-right">Unrealized P&L</TableHead>
                <TableHead className="text-right">Realized P&L</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map((position, index) => (
                <TableRow key={`${position.symbol}-${index}`}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {position.symbol}
                      </Badge>
                      <span className="hidden sm:inline text-xs text-muted-foreground">
                        {position.accountId}
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <Badge 
                      variant={position.position > 0 ? "default" : "secondary"}
                      className={position.position > 0 ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}
                    >
                      {position.position > 0 ? 'LONG' : 'SHORT'} {Math.abs(position.position)}
                    </Badge>
                  </TableCell>
                  
                  <TableCell className="text-right font-mono">
                    {formatCurrency(position.avgPrice)}
                  </TableCell>
                  
                  <TableCell className="text-right font-mono">
                    {formatCurrency(position.marketPrice)}
                  </TableCell>
                  
                  <TableCell className={`text-right font-medium ${getPnLColor(position.unrealizedPnl)}`}>
                    <div className="flex items-center justify-end gap-1">
                      {getPnLIcon(position.unrealizedPnl)}
                      {formatPercent(position.marketPrice, position.avgPrice)}
                    </div>
                  </TableCell>
                  
                  <TableCell className={`text-right font-mono ${getPnLColor(position.unrealizedPnl)}`}>
                    {formatCurrency(position.unrealizedPnl)}
                  </TableCell>
                  
                  <TableCell className={`text-right font-mono ${getPnLColor(position.realizedPnl)}`}>
                    {formatCurrency(position.realizedPnl)}
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-6 px-2 text-xs"
                      >
                        Close
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Summary Footer */}
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total Positions</p>
              <p className="font-medium">{positions.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Unrealized P&L</p>
              <p className={`font-medium ${getPnLColor(positions.reduce((sum, pos) => sum + pos.unrealizedPnl, 0))}`}>
                {formatCurrency(positions.reduce((sum, pos) => sum + pos.unrealizedPnl, 0))}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Realized P&L</p>
              <p className={`font-medium ${getPnLColor(positions.reduce((sum, pos) => sum + pos.realizedPnl, 0))}`}>
                {formatCurrency(positions.reduce((sum, pos) => sum + pos.realizedPnl, 0))}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Net P&L</p>
              <p className={`font-medium ${getPnLColor(positions.reduce((sum, pos) => sum + pos.unrealizedPnl + pos.realizedPnl, 0))}`}>
                {formatCurrency(positions.reduce((sum, pos) => sum + pos.unrealizedPnl + pos.realizedPnl, 0))}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};