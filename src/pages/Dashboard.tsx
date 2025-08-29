import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import CommodityCard from '@/components/CommodityCard';
import VirtualizedCommodityList from '@/components/VirtualizedCommodityList';
import UserProfile from '@/components/UserProfile';
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import CommoditySidebar from '@/components/CommoditySidebar';
import { BarChart3, Menu, Loader, Zap, Coins, Wheat, Beef, Coffee, Package } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeDataContext } from '@/contexts/RealtimeDataContext';
import { useAvailableCommodities, Commodity } from '@/hooks/useCommodityData';
import { Button } from '@/components/ui/button';
import { OfflineIndicator } from '@/components/OfflineIndicator';

const Dashboard = () => {
  const [activeGroup, setActiveGroup] = useState("energy");
  const isMobile = useIsMobile();
  const { isGuest, profile, loading: authLoading } = useAuth();
  const { data: commodities, isLoading: commoditiesLoading, error: commoditiesError, refetch: refetchCommodities } = useAvailableCommodities();

  // Show loading screen while auth is checking
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 p-8">
          <Loader className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading application...</p>
          <p className="text-xs text-muted-foreground/60">
            If this takes too long, try refreshing the page
          </p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <DashboardContent 
        activeGroup={activeGroup}
        setActiveGroup={setActiveGroup}
        isMobile={isMobile}
        profile={profile}
        commodities={commodities || []}
        loading={commoditiesLoading}
        error={commoditiesError?.message || null}
        onRetry={() => refetchCommodities()}
      />
    </SidebarProvider>
  );
};

const DashboardContent = ({ 
  activeGroup, 
  setActiveGroup,
  isMobile, 
  profile, 
  commodities, 
  loading, 
  error, 
  onRetry
}: {
  activeGroup: string;
  setActiveGroup: (group: string) => void;
  isMobile: boolean;
  profile: any;
  commodities: Commodity[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) => {
  const { setOpenMobile } = useSidebar();
  const { connected: realtimeConnected, delayStatus } = useRealtimeDataContext();

  // Simple swipe handler for mobile sidebar
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    
    // Swipe right to open sidebar
    if (diff < -100 && isMobile) {
      setOpenMobile(true);
    }
  };

  // Get filtered commodities
  const filteredCommodities = React.useMemo(() => {
    return commodities.filter(commodity => commodity.category === activeGroup);
  }, [commodities, activeGroup]);

  // Get group info
  const getGroupInfo = React.useMemo(() => {
    const groups = {
      energy: { title: "Energy Commodities", icon: Zap },
      metals: { title: "Metal Commodities", icon: Coins },
      grains: { title: "Agricultural Commodities", icon: Wheat },
      livestock: { title: "Livestock Commodities", icon: Beef },
      softs: { title: "Soft Commodities", icon: Coffee },
      other: { title: "Other Commodities", icon: Package }
    };
    return groups[activeGroup as keyof typeof groups] || groups.energy;
  }, [activeGroup]);

  const getCommodityCount = React.useCallback((category: string) => {
    return commodities.filter(commodity => commodity.category === category).length;
  }, [commodities]);

  return (
    <div 
      className="min-h-screen flex w-full"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
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
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Simplified Header */}
        <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-xl">
          <div className="container flex h-16 items-center justify-between px-4">
            {isMobile ? (
              <div className="flex w-full items-center justify-between">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => setOpenMobile(true)}
                  className="p-3 min-h-[48px] min-w-[48px]"
                >
                  <Menu className="w-6 h-6" />
                </Button>
                
                <div className="text-center flex-1">
                  <p className="text-xs text-muted-foreground">
                    {delayStatus.delayText} data
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <OfflineIndicator />
                  <div className={`w-2 h-2 rounded-full ${
                    loading ? 'bg-blue-500' : error ? 'bg-red-500' : 'bg-green-500'
                  }`} />
                  <UserProfile />
                </div>
              </div>
            ) : (
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-4">
                  <getGroupInfo.icon className="w-6 h-6" />
                  <div>
                    <h1 className="text-lg font-semibold">{getGroupInfo.title}</h1>
                    <p className="text-sm text-muted-foreground">
                      {filteredCommodities.length} commodities
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${
                      loading ? 'bg-blue-500' : error ? 'bg-red-500' : 'bg-green-500'
                    }`} />
                    <span className="text-muted-foreground">
                      {loading ? 'Loading' : error ? 'Error' : delayStatus.delayText}
                    </span>
                  </div>
                  <UserProfile />
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container px-4 py-6">
            {/* Loading State */}
            {loading && (
              <div className="text-center py-16">
                <Loader className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-lg font-semibold">Loading Commodities</p>
                <p className="text-sm text-muted-foreground">Fetching real-time market data...</p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="text-center py-16">
                <div className="w-12 h-12 mx-auto bg-red-100 dark:bg-red-950/50 rounded-full flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <p className="text-lg font-semibold text-red-700 dark:text-red-400">Connection Issue</p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
                <Button onClick={onRetry} className="mt-4">
                  Try Again
                </Button>
              </div>
            )}

            {/* Commodities List */}
            {!loading && filteredCommodities.length > 0 && (
              <VirtualizedCommodityList 
                commodities={filteredCommodities} 
                loading={loading}
              />
            )}

            {/* Empty State */}
            {!loading && !error && filteredCommodities.length === 0 && (
              <div className="text-center py-16">
                <BarChart3 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-xl font-semibold">No Commodities Available</p>
                <p className="text-sm text-muted-foreground mt-2">
                  There are currently no commodities available in this category.
                </p>
                <Button onClick={onRetry} className="mt-4">
                  Refresh Data
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;