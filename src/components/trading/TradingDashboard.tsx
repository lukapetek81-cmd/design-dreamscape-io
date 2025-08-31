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
  XCircle,
  Shield
} from 'lucide-react';
import { useIBKRTrading } from '@/hooks/useIBKRTrading';
import { usePremiumGating } from '@/hooks/usePremiumGating';
import { OrderEntry } from './OrderEntry';
import { PositionsList } from './PositionsList';
import { RiskManager } from './RiskManager';
import { TradeHistory } from './TradeHistory';
import { AccountSummary } from './AccountSummary';
import { IBKRCredentialsForm } from '../IBKRCredentialsForm';
import { useIBKRCredentials } from '@/hooks/useIBKRCredentials';

export const TradingDashboard: React.FC = () => {
  const { requirePremium } = usePremiumGating();
  const { hasActiveCredentials } = useIBKRCredentials();
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

      {!hasActiveCredentials() && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800 dark:text-blue-200">
                  IBKR Credentials Required
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Enter your Interactive Brokers credentials to enable trading functionality.
                </p>
              </div>
            </div>
            <IBKRCredentialsForm />
          </CardContent>
        </Card>
      )}

      {hasActiveCredentials() && !isConnected && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  Ready to Connect
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Your IBKR credentials are configured. Click "Connect to IBKR" to start trading.
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
        </div>
      )}

      {/* Main Trading Interface */}
      {isConnected && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Left Column - Order Entry */}
          <div className="space-y-6">
            <OrderEntry />
            
            {/* Real-time Market Data Status */}
            {session?.sessionId && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Real-time Market Data</CardTitle>
                  <CardDescription>Live streaming data for active positions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-muted-foreground">
                      Streaming enabled for {portfolio.length} positions
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Right Column - Positions and Risk */}
          <div className="space-y-6">
            <PositionsList 
              positions={portfolio}
              isLoading={isLoading}
            />
            
            {/* Risk Management */}
            {portfolio.length > 0 && accountInfo && (
              <RiskManager 
                portfolioValue={accountInfo.netLiquidation}
                positions={portfolio}
                accountInfo={accountInfo}
              />
            )}
          </div>
        </div>
      )}

      {/* Trade History Section */}
      {isConnected && (
        <div className="mt-8">
          <TradeHistory />
        </div>
      )}
    </div>
  );
};