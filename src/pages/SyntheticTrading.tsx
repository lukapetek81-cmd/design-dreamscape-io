import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CommodityApiService } from '@/services/commodityApi';
import { useSyntheticTrading } from '@/hooks/useSyntheticTrading';
import ActivePositions from '@/components/synthetic/ActivePositions';
import PortfolioSummary from '@/components/synthetic/PortfolioSummary';
import TradeHistoryPanel from '@/components/synthetic/TradeHistory';
import WalletStatusCard from '@/components/wallet/WalletStatusCard';
import SEOHead from '@/components/SEOHead';

const SyntheticTrading = () => {
  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>({});
  const navigate = useNavigate();

  const {
    balance,
    positions,
    tradeHistory,
    closePosition,
    calcUnrealizedPnl,
    totalRealizedPnl,
    winRate,
  } = useSyntheticTrading();

  // Fetch live prices for open positions / portfolio P&L
  useEffect(() => {
    const loadPrices = async () => {
      try {
        const api = CommodityApiService.getInstance();
        const commodities = await api.fetchAvailableCommodities();
        const map: Record<string, number> = {};
        commodities.forEach((c) => { if (c.price > 0) map[c.name] = c.price; });
        setCurrentPrices(map);
      } catch {
        console.error('Failed to load prices');
      }
    };
    loadPrices();
    const interval = setInterval(loadPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <SEOHead
        title="Synthetic Trading Portfolio"
        description="Track your virtual USDC trading portfolio, open positions, and trade history."
      />
      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
          <div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Dashboard
            </Button>
            <div className="flex items-center gap-2 mb-2">
              <Coins className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold tracking-tight">My Trading Portfolio</h1>
              <Badge variant="outline" className="text-[10px]">USDC</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Open new trades from any commodity card on the dashboard. Manage your positions here.
            </p>
          </div>

          <WalletStatusCard />

          <PortfolioSummary
            balance={balance}
            positions={positions}
            totalRealizedPnl={totalRealizedPnl}
            winRate={winRate}
            currentPrices={currentPrices}
            calcUnrealizedPnl={calcUnrealizedPnl}
          />
          <ActivePositions
            positions={positions}
            currentPrices={currentPrices}
            calcUnrealizedPnl={calcUnrealizedPnl}
            onClose={closePosition}
          />
          <TradeHistoryPanel trades={tradeHistory} />
        </div>
      </div>
    </>
  );
};

export default SyntheticTrading;
