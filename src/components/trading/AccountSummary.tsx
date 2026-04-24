import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Wallet, 
  TrendingUp, 
  Shield,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface IBKRAccountInfo {
  accountId: string;
  netLiquidation: number;
  totalCashValue: number;
  buyingPower: number;
  dayTradesRemaining: number;
  currency: string;
}

interface AccountSummaryProps {
  accountInfo: IBKRAccountInfo;
}

export const AccountSummary: React.FC<AccountSummaryProps> = ({ accountInfo }) => {
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: accountInfo.currency || 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const getBuyingPowerStatus = () => {
    const ratio = accountInfo.buyingPower / accountInfo.netLiquidation;
    if (ratio > 2) return { color: 'text-emerald-600', label: 'High' };
    if (ratio > 1) return { color: 'text-blue-600', label: 'Good' };
    return { color: 'text-amber-600', label: 'Limited' };
  };

  const getDayTradeStatus = () => {
    if (accountInfo.dayTradesRemaining >= 2) return { color: 'text-emerald-600', icon: Shield };
    if (accountInfo.dayTradesRemaining === 1) return { color: 'text-amber-600', icon: AlertTriangle };
    return { color: 'text-red-600', icon: AlertTriangle };
  };

  const buyingPowerStatus = getBuyingPowerStatus();
  const dayTradeStatus = getDayTradeStatus();
  const DayTradeIcon = dayTradeStatus.icon;

  return (
    <div className="space-y-4">
      {/* Account Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Account Summary</CardTitle>
              <CardDescription className="flex items-center gap-2">
                Account: <Badge variant="outline">{accountInfo.accountId}</Badge>
              </CardDescription>
            </div>
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
              Active
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Liquidation */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Liquidation</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(accountInfo.netLiquidation)}</div>
            <p className="text-xs text-muted-foreground">
              Total account value
            </p>
          </CardContent>
        </Card>

        {/* Cash Value */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(accountInfo.totalCashValue)}</div>
            <p className="text-xs text-muted-foreground">
              Available cash
            </p>
          </CardContent>
        </Card>

        {/* Buying Power */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Buying Power</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(accountInfo.buyingPower)}</div>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">Status:</p>
              <Badge variant="outline" className={buyingPowerStatus.color}>
                {buyingPowerStatus.label}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Day Trades Remaining */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Day Trades</CardTitle>
            <DayTradeIcon className={`h-4 w-4 ${dayTradeStatus.color}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${dayTradeStatus.color}`}>
              {accountInfo.dayTradesRemaining}
            </div>
            <p className="text-xs text-muted-foreground">
              Remaining today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Warnings */}
      {accountInfo.dayTradesRemaining === 0 && (
        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            <strong>Pattern Day Trader Rule:</strong> No day trades remaining. 
            Any additional day trades may result in account restrictions.
          </AlertDescription>
        </Alert>
      )}

      {accountInfo.dayTradesRemaining === 1 && (
        <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            <strong>Caution:</strong> Only 1 day trade remaining. 
            Use carefully to avoid PDT restrictions.
          </AlertDescription>
        </Alert>
      )}

      {accountInfo.buyingPower < accountInfo.totalCashValue && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Your buying power is currently limited. This may be due to recent trades, 
            margin requirements, or account restrictions.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};