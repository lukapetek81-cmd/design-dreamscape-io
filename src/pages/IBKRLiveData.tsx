import React from 'react';
import { Navigate } from 'react-router-dom';
import { SidebarProvider } from "@/components/ui/sidebar";
import CommoditySidebar from '@/components/CommoditySidebar';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Menu, Activity, Loader } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { useAvailableCommodities } from '@/hooks/useCommodityData';
import { IBKRConnectionManager } from '@/components/IBKRConnectionManager';
import UserProfile from '@/components/UserProfile';

const IBKRLiveData = () => {
  const [activeGroup, setActiveGroup] = React.useState("energy");
  const [ibkrPrices, setIbkrPrices] = React.useState<Record<string, any>>({});
  const isMobile = useIsMobile();
  const { isGuest, profile, loading: authLoading } = useAuth();
  const { data: commodities, isLoading: commoditiesLoading } = useAvailableCommodities();

  // Get all available commodities for IBKR
  const allCommodityNames = React.useMemo(() => {
    if (!commodities) return [];
    return commodities.map(c => c.name);
  }, [commodities]);

  // Show loading screen while auth is checking
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center space-y-4">
          <Loader className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const getCommodityCount = (category: string) => {
    return commodities?.filter(commodity => commodity.category === category).length || 0;
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-muted/20">
        <CommoditySidebar 
          activeGroup={activeGroup} 
          onGroupSelect={setActiveGroup}
          commodityCounts={{
            energy: getCommodityCount('energy'),
            metals: getCommodityCount('metals'),
            grains: getCommodityCount('grains'),
            livestock: getCommodityCount('livestock'),
            softs: getCommodityCount('softs'),
            other: getCommodityCount('other')
          }}
        />
        
        {/* Floating Sidebar Trigger Button */}
        <SidebarTrigger className="fixed left-4 bottom-20 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl active:scale-95 touch-manipulation transition-all duration-200 flex items-center justify-center md:hidden">
          <Menu className="w-6 h-6" />
        </SidebarTrigger>
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-soft">
            <div className="container flex h-16 sm:h-20 items-center justify-between px-3 sm:px-4 md:px-6">
              <div className="flex items-center gap-3">
                <Activity className="w-6 h-6 text-primary" />
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground">IBKR Live Data</h1>
                  <p className="text-sm text-muted-foreground">Real-time commodity data from Interactive Brokers</p>
                </div>
              </div>
              <UserProfile />
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 overflow-x-hidden">
            <div className="max-w-4xl mx-auto space-y-6">
              <IBKRConnectionManager 
                commodities={allCommodityNames}
                onPricesUpdate={setIbkrPrices}
              />

              {/* Live Prices Display */}
              {Object.keys(ibkrPrices).length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-foreground">Live Price Feed</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(ibkrPrices).map(([symbol, data]) => (
                      <div key={symbol} className="p-4 bg-card rounded-lg border shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-foreground">{symbol}</h3>
                          <span className="text-xs bg-purple-100 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 px-2 py-1 rounded">
                            IBKR Live
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Price:</span>
                            <span className="font-mono text-sm">${data.price}</span>
                          </div>
                          {data.bid && data.ask && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Bid:</span>
                                <span className="font-mono text-sm text-green-600">${data.bid}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Ask:</span>
                                <span className="font-mono text-sm text-red-600">${data.ask}</span>
                              </div>
                            </>
                          )}
                          {data.volume && (
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Volume:</span>
                              <span className="font-mono text-sm">{data.volume.toLocaleString()}</span>
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            Updated: {new Date(data.lastUpdate).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default IBKRLiveData;