import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Activity, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useIBKRTrading } from '@/hooks/useIBKRTrading';
import { usePremiumGating } from '@/hooks/usePremiumGating';
import { OrderEntry } from './OrderEntry';
import { RiskManager } from './RiskManager';
import { TradeHistory } from './TradeHistory';
import { AccountSummary } from './AccountSummary';

export const TradingDashboard: React.FC = () => {
  const { requirePremium } = usePremiumGating();
  const {
    session,
    isConnected,
    isConnecting,
    isLoading,
    portfolio,
    accountInfo,
    connect,
    disconnect,
    refreshPortfolio,
    refreshAccountInfo
  } = useIBKRTrading();

  useEffect(() => {
    if (!requirePremium(false)) return;
    
    if (isConnected) {
      refreshPortfolio();
      refreshAccountInfo();
    }
  }, [isConnected, requirePremium, refreshPortfolio, refreshAccountInfo]);

  if (!requirePremium()) return null;

  const handleRefresh = async () => {
    if (isConnected) {
      await Promise.all([
        refreshPortfolio(),
        refreshAccountInfo()
      ]);
    }
  };

  const getConnectionStatusBadge = () => {
    if (isConnecting) {
      return <Badge variant="secondary"><RefreshCw className="w-3 h-3 mr-1 animate-spin" />Connecting...</Badge>;
    }
    
    if (isConnected) {
      return <Badge variant="default" className="bg-emerald-500"><CheckCircle className="w-3 h-3 mr-1" />Connected</Badge>;
    }
    
    return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Disconnected</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trading Dashboard</h1>
          <p className="text-muted-foreground">Interactive Brokers Integration</p>
        </div>
        
        <div className="flex items-center gap-4">
          {getConnectionStatusBadge()}
          
          {isConnected ? (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={disconnect}
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <Button 
              onClick={connect} 
              disabled={isConnecting}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4 mr-2" />
                  Connect to IBKR
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {!isConnected && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  IBKR Connection Required
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Connect to your Interactive Brokers account to access live trading features. 
                  Make sure you have valid IBKR credentials configured in your settings.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account Summary */}
      {isConnected && accountInfo && (
        <AccountSummary accountInfo={accountInfo} />
      )}

      {/* Main Trading Interface */}
      {isConnected && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Entry */}
          <div className="lg:col-span-1">
            <OrderEntry />
          </div>
          
          {/* Positions */}
          <div className="lg:col-span-2">
            <PositionsList 
              positions={portfolio}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {isConnected && portfolio.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${portfolio.reduce((sum, pos) => sum + pos.unrealizedPnl + pos.realizedPnl, 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Realized + Unrealized
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{portfolio.length}</div>
              <p className="text-xs text-muted-foreground">
                Active positions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Winners</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {portfolio.filter(pos => pos.unrealizedPnl > 0).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Profitable positions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Losers</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {portfolio.filter(pos => pos.unrealizedPnl < 0).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Loss positions
              </p>
            </CardContent>
          </Card>
          
          {/* Trade History Section */}
          <div className="mt-8">
            <TradeHistory />
          </div>
        </div>
      )}
    </div>
  );
};