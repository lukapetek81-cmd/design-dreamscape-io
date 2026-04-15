import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, BarChart3, Target } from 'lucide-react';
import { UsdcBalance, SyntheticPosition } from '@/hooks/useSyntheticTrading';

interface PortfolioSummaryProps {
  balance: UsdcBalance;
  positions: SyntheticPosition[];
  totalRealizedPnl: number;
  winRate: number;
  currentPrices: Record<string, number>;
  calcUnrealizedPnl: (pos: SyntheticPosition, price: number) => number;
}

const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({
  balance,
  positions,
  totalRealizedPnl,
  winRate,
  currentPrices,
  calcUnrealizedPnl,
}) => {
  const totalUnrealizedPnl = positions.reduce((sum, pos) => {
    const price = currentPrices[pos.commodity_name] || pos.entry_price;
    return sum + calcUnrealizedPnl(pos, price);
  }, 0);

  const totalEquity = balance.balance + balance.frozen_balance + totalUnrealizedPnl;

  const stats = [
    { label: 'Total Equity', value: `$${totalEquity.toFixed(2)}`, icon: DollarSign, color: 'text-primary' },
    { label: 'Available', value: `$${balance.balance.toFixed(2)}`, icon: DollarSign, color: 'text-green-400' },
    { label: 'In Positions', value: `$${balance.frozen_balance.toFixed(2)}`, icon: BarChart3, color: 'text-amber-400' },
    {
      label: 'Unrealized P&L',
      value: `${totalUnrealizedPnl >= 0 ? '+' : ''}$${totalUnrealizedPnl.toFixed(2)}`,
      icon: TrendingUp,
      color: totalUnrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400',
    },
    {
      label: 'Realized P&L',
      value: `${totalRealizedPnl >= 0 ? '+' : ''}$${totalRealizedPnl.toFixed(2)}`,
      icon: Target,
      color: totalRealizedPnl >= 0 ? 'text-green-400' : 'text-red-400',
    },
    { label: 'Win Rate', value: `${winRate.toFixed(0)}%`, icon: BarChart3, color: 'text-blue-400' },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-primary" />
          USDC Portfolio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
              {stat.label}
            </div>
            <span className={`font-semibold ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default PortfolioSummary;
