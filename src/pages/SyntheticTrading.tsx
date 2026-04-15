import React, { useState, useEffect, useMemo } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { SidebarInset } from '@/components/ui/sidebar';
import CommoditySidebar from '@/components/CommoditySidebar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Coins, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CommodityApiService } from '@/services/commodityApi';
import { useSyntheticTrading } from '@/hooks/useSyntheticTrading';
import MarketCard from '@/components/synthetic/MarketCard';
import PositionEntryModal from '@/components/synthetic/PositionEntryModal';
import ActivePositions from '@/components/synthetic/ActivePositions';
import PortfolioSummary from '@/components/synthetic/PortfolioSummary';
import TradeHistoryPanel from '@/components/synthetic/TradeHistory';

interface MarketItem {
  name: string;
  price: number;
  change: number;
  changePercent: number;
  category: string;
}

const CATEGORY_FILTERS = ['all', 'energy', 'metals', 'grains', 'livestock', 'softs', 'other'];

const SyntheticTrading = () => {
  const [activeGroup, setActiveGroup] = useState('energy');
  const [markets, setMarkets] = useState<MarketItem[]>([]);
  const [marketsLoading, setMarketsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCommodity, setSelectedCommodity] = useState('');
  const [selectedDirection, setSelectedDirection] = useState<'long' | 'short'>('long');
  const navigate = useNavigate();

  const {
    balance,
    positions,
    tradeHistory,
    loading: tradingLoading,
    openPosition,
    closePosition,
    calcUnrealizedPnl,
    totalRealizedPnl,
    winRate,
  } = useSyntheticTrading();

  const commodityCounts = {
    energy: 0, metals: 0, grains: 0, livestock: 0, softs: 0, other: 0,
  };

  // Fetch market data
  useEffect(() => {
    const loadMarkets = async () => {
      setMarketsLoading(true);
      try {
        const api = CommodityApiService.getInstance();
        const commodities = await api.fetchAvailableCommodities();
        setMarkets(
          commodities
            .filter((c) => c.price > 0)
            .map((c) => ({
              name: c.name,
              price: c.price,
              change: c.change,
              changePercent: c.changePercent,
              category: c.category,
            }))
        );
      } catch {
        console.error('Failed to load markets');
      } finally {
        setMarketsLoading(false);
      }
    };
    loadMarkets();
  }, []);

  // Build current prices map
  const currentPrices = useMemo(() => {
    const map: Record<string, number> = {};
    markets.forEach((m) => { map[m.name] = m.price; });
    return map;
  }, [markets]);

  // Filter markets
  const filteredMarkets = useMemo(() => {
    return markets.filter((m) => {
      const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || m.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [markets, search, categoryFilter]);

  const handleTrade = (name: string, direction: 'long' | 'short') => {
    setSelectedCommodity(name);
    setSelectedDirection(direction);
    setModalOpen(true);
  };

  const handleConfirmTrade = async (amount: number) => {
    const price = currentPrices[selectedCommodity];
    if (price) {
      await openPosition(selectedCommodity, selectedDirection, amount, price);
    }
  };

  const selectedPrice = currentPrices[selectedCommodity] || 0;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <CommoditySidebar
          activeGroup={activeGroup}
          onGroupSelect={setActiveGroup}
          commodityCounts={commodityCounts}
        />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center border-b px-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Dashboard
            </Button>
            <Separator orientation="vertical" className="mr-2 h-4" />
            <SidebarTrigger className="p-2 min-h-[48px] min-w-[48px]" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center gap-2">
              <Coins className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold">Synthetic Trading</h1>
              <Badge variant="outline" className="text-[10px]">USDC</Badge>
            </div>
          </header>

          <main className="flex-1 p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">
              <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                {/* Left: Markets */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search markets..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                      {CATEGORY_FILTERS.map((cat) => (
                        <Button
                          key={cat}
                          variant={categoryFilter === cat ? 'default' : 'outline'}
                          size="sm"
                          className="text-xs capitalize h-8"
                          onClick={() => setCategoryFilter(cat)}
                        >
                          {cat}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {marketsLoading ? (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="h-36 rounded-lg border animate-pulse bg-muted/30" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredMarkets.map((m) => (
                        <MarketCard
                          key={m.name}
                          name={m.name}
                          price={m.price}
                          change={m.change}
                          changePercent={m.changePercent}
                          category={m.category}
                          onLong={() => handleTrade(m.name, 'long')}
                          onShort={() => handleTrade(m.name, 'short')}
                        />
                      ))}
                      {filteredMarkets.length === 0 && (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                          No markets found matching your search.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Right: Portfolio & Positions */}
                <div className="space-y-4">
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
            </div>
          </main>
        </SidebarInset>
      </div>

      <PositionEntryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        commodityName={selectedCommodity}
        direction={selectedDirection}
        currentPrice={selectedPrice}
        availableBalance={balance.balance}
        onConfirm={handleConfirmTrade}
      />
    </SidebarProvider>
  );
};

export default SyntheticTrading;
