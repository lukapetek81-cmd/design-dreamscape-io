import React from 'react';
import { Navigate } from 'react-router-dom';
import CommodityCard from '@/components/CommodityCard';
import UserProfile from '@/components/UserProfile';
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import CommoditySidebar from '@/components/CommoditySidebar';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { BarChart3, Activity, Menu, TrendingUp, Loader, Zap, Coins, Wheat, Beef, Coffee, Package } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeDataContext } from '@/contexts/RealtimeDataContext';
import { useAvailableCommodities } from '@/hooks/useCommodityData';
import { useDelayedData } from '@/hooks/useDelayedData';


const Dashboard = () => {
  const [activeGroup, setActiveGroup] = React.useState("energy");
  const isMobile = useIsMobile();
  const { isGuest, profile, loading: authLoading } = useAuth();
  const { data: commodities, isLoading: commoditiesLoading, error: commoditiesError } = useAvailableCommodities();
  const { connected: realtimeConnected, lastUpdate, error: realtimeError, delayStatus } = useRealtimeDataContext();

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
        realtimeConnected={realtimeConnected}
        delayStatus={delayStatus}
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
  realtimeConnected,
  delayStatus
}: {
  activeGroup: string;
  setActiveGroup: (group: string) => void;
  isMobile: boolean;
  profile: any;
  commodities: any[];
  loading: boolean;
  error: string | null;
  realtimeConnected: boolean;
  delayStatus: {
    isDelayed: boolean;
    delayText: string;
    statusText: string;
  };
}) => {
  const { toggleSidebar, setOpenMobile } = useSidebar();
  const [touchStart, setTouchStart] = React.useState<number | null>(null);
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null);
  const [isLandscape, setIsLandscape] = React.useState(false);

  // Handle swipe detection
  const minSwipeDistance = 50;

  // Detect orientation changes and hide sidebar in landscape
  React.useEffect(() => {
    const checkOrientation = () => {
      // Use a small timeout to ensure window dimensions are updated
      setTimeout(() => {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const isLandscapeMode = windowWidth > windowHeight;
        const isMobileDevice = isMobile || windowWidth <= 768; // More flexible mobile detection
        
        console.log('Orientation check:', {
          windowWidth,
          windowHeight,
          isMobile,
          isMobileDevice,
          isLandscapeMode,
          currentIsLandscape: isLandscape
        });
        
        setIsLandscape(isLandscapeMode);
        
        // Hide sidebar in landscape mode for mobile devices
        if (isLandscapeMode && isMobileDevice) {
          console.log('Hiding sidebar - landscape mode detected');
          setOpenMobile(false);
        }
      }, 100); // Small delay to ensure dimensions are updated
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    
    // Also listen for screen orientation changes if available
    if (screen.orientation) {
      screen.orientation.addEventListener('change', checkOrientation);
    }

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
      if (screen.orientation) {
        screen.orientation.removeEventListener('change', checkOrientation);
      }
    };
  }, [isMobile, setOpenMobile, isLandscape]);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isRightSwipe) {
      if (isMobile) {
        setOpenMobile(true);
      } else {
        toggleSidebar();
      }
    }
  };

  const getCommodities = () => {
    return commodities.filter(commodity => commodity.category === activeGroup);
  };

  const getGroupTitle = () => {
    switch (activeGroup) {
      case "metals":
        return "Metal Commodities";
      case "grains":
        return "Agricultural Commodities";
      case "livestock":
        return "Livestock Commodities";
      case "softs":
        return "Soft Commodities";
      case "other":
        return "Other Commodities";
      default:
        return "Energy Commodities";
    }
  };

  const getGroupIcon = () => {
    switch (activeGroup) {
      case "metals":
        return <Coins className="w-5 h-5 sm:w-6 sm:h-6" />;
      case "grains":
        return <Wheat className="w-5 h-5 sm:w-6 sm:h-6" />;
      case "livestock":
        return <Beef className="w-5 h-5 sm:w-6 sm:h-6" />;
      case "softs":
        return <Coffee className="w-5 h-5 sm:w-6 sm:h-6" />;
      case "other":
        return <Package className="w-5 h-5 sm:w-6 sm:h-6" />;
      default:
        return <Zap className="w-5 h-5 sm:w-6 sm:h-6" />;
    }
  };

  const getCommodityCount = (category: string) => {
    return commodities.filter(commodity => commodity.category === category).length;
  };

  return (
    <div 
      className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-muted/20"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
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
      
      {/* Floating Sidebar Trigger Button - Hide in landscape */}
      {!isLandscape && (
        <SidebarTrigger className="fixed left-4 bottom-20 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl active:scale-95 touch-manipulation transition-all duration-200 flex items-center justify-center md:hidden">
          <Menu className="w-6 h-6" />
        </SidebarTrigger>
      )}
      
      <div className="flex-1 flex flex-col min-w-0">
          {/* Enhanced Responsive Header */}
          <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-soft">
            <div className="container flex h-16 sm:h-20 items-center justify-between px-3 sm:px-4 md:px-6">
              {/* Mobile Layout - Better spacing to prevent overlap */}
              <div className="flex sm:hidden w-full items-center justify-between gap-2">
                <div className="text-left space-y-0.5 min-w-0 flex-1">
                  <p className="text-2xs text-muted-foreground font-medium tracking-wide truncate">
                    {delayStatus.delayText} data
                  </p>
                </div>
                
                {/* Mobile Status and Profile - Right aligned with proper spacing */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full border hover:scale-105 transition-transform duration-200 ${
                    loading 
                      ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
                      : error 
                        ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                        : 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                  }`}>
                    {loading ? (
                      <Loader className="h-1.5 w-1.5 animate-spin text-blue-500" />
                    ) : error ? (
                      <div className="h-1.5 w-1.5 bg-red-500 rounded-full"></div>
                    ) : (
                      <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-500/50"></div>
                    )}
                     <span className={`text-2xs font-semibold whitespace-nowrap ${
                       loading
                         ? 'text-blue-700 dark:text-blue-400'
                         : error
                           ? 'text-red-700 dark:text-red-400'
                           : delayStatus.isDelayed
                             ? 'text-orange-700 dark:text-orange-400'
                             : 'text-green-700 dark:text-green-400'
                     }`}>
                       {loading ? 'Loading' : error ? 'Error' : delayStatus.delayText}
                     </span>
                  </div>
                  <UserProfile />
                </div>
              </div>

              {/* Desktop Layout - Original */}
              <div className="hidden sm:flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="text-left space-y-0.5 sm:space-y-1 min-w-0 flex-1">
                  <p className="text-2xs sm:text-xs lg:text-sm text-muted-foreground font-medium tracking-wide truncate">
                    {delayStatus.statusText}
                  </p>
                </div>
              </div>
              
              <div className="hidden sm:flex items-center gap-2 sm:gap-4 shrink-0">
                <div className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-1 sm:py-2 rounded-full border hover:scale-105 transition-transform duration-200 ${
                  loading 
                    ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
                    : error 
                      ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                      : 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                }`}>
                  {loading ? (
                    <Loader className="h-1.5 w-1.5 sm:h-2.5 sm:w-2.5 animate-spin text-blue-500" />
                  ) : error ? (
                    <div className="h-1.5 w-1.5 sm:h-2.5 sm:w-2.5 bg-red-500 rounded-full"></div>
                  ) : (
                    <div className="h-1.5 w-1.5 sm:h-2.5 sm:w-2.5 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-500/50"></div>
                  )}
                   <span className={`text-2xs sm:text-xs lg:text-sm font-semibold whitespace-nowrap ${
                     loading
                       ? 'text-blue-700 dark:text-blue-400'
                       : error
                         ? 'text-red-700 dark:text-red-400'
                         : delayStatus.isDelayed
                           ? 'text-orange-700 dark:text-orange-400'
                           : 'text-green-700 dark:text-green-400'
                   }`}>
                     {loading ? 'Loading Markets' : error ? 'Error' : delayStatus.delayText}
                   </span>
                </div>
                <UserProfile />
              </div>
            </div>
          </header>

          {/* Enhanced Responsive Main Content */}
          <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 overflow-x-hidden">
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
              {/* Enhanced Responsive Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-card/50 to-muted/30 border border-border/50 shadow-soft hover:shadow-medium transition-shadow duration-300 space-y-3 sm:space-y-0">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="p-2 sm:p-3 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 hover:scale-110 transition-all duration-300">
                    {getGroupIcon()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-1 truncate">
                      {isMobile ? activeGroup.charAt(0).toUpperCase() + activeGroup.slice(1) : getGroupTitle()}
                    </h2>
                     <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-2xs sm:text-xs lg:text-sm text-muted-foreground">
                       <span className="flex items-center gap-1">
                         <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-primary rounded-full"></span>
                         {getCommodities().length} active commodities
                       </span>
                     </div>
                  </div>
                </div>
                <div className="text-center sm:text-right space-y-1 shrink-0">
                  <p className="text-2xs sm:text-xs lg:text-sm font-medium text-muted-foreground">
                    {profile?.subscription_active ? 'Real-time Status' : 'Market Status'}
                  </p>
                  <div className="flex items-center justify-center sm:justify-end gap-2">
                    <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                      profile?.subscription_active && realtimeConnected 
                        ? 'bg-blue-500 animate-pulse' 
                        : 'bg-green-500 animate-pulse'
                    }`}></div>
                    <span className={`text-sm sm:text-base lg:text-lg font-bold ${
                      profile?.subscription_active && realtimeConnected 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'text-green-600 dark:text-green-400'
                    }`}>
                      {profile?.subscription_active && realtimeConnected 
                        ? 'LIVE' 
                        : 'OPEN'
                      }
                    </span>
                  </div>
                </div>
              </div>


              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center space-y-4">
                    <Loader className="w-8 h-8 animate-spin text-primary mx-auto" />
                    <div className="space-y-2">
                      <p className="text-lg font-semibold text-foreground">Loading Commodities</p>
                      <p className="text-sm text-muted-foreground">Fetching real-time data from FMP API...</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && !loading && (
                <div className="p-6 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 border border-red-200 dark:border-red-800">
                  <div className="text-center space-y-2">
                    <p className="text-lg font-semibold text-red-700 dark:text-red-400">Failed to Load Commodities</p>
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    <p className="text-xs text-red-500 dark:text-red-500">Using fallback data instead</p>
                  </div>
                </div>
              )}

              {/* Enhanced Responsive Commodities Grid */}
              {!loading && getCommodities().length > 0 && (
                <div className="grid gap-3 sm:gap-4 lg:gap-6">
                  {getCommodities().map((commodity, index) => (
                    <div 
                      key={commodity.symbol}
                      className="animate-slide-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <CommodityCard
                        name={commodity.name}
                        symbol={commodity.symbol}
                        price={commodity.price}
                        change={commodity.changePercent}
                        venue={commodity.venue}
                        contractSize={commodity.contractSize}
                        
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!loading && !error && getCommodities().length === 0 && (
                <div className="text-center py-16 space-y-4">
                  <div className="w-16 h-16 mx-auto bg-muted/50 rounded-full flex items-center justify-center">
                    <BarChart3 className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-foreground">No Commodities Found</p>
                    <p className="text-sm text-muted-foreground">No commodities available in this category.</p>
                  </div>
                </div>
              )}
            </div>
          </main>
      </div>
    </div>
  );
};

export default Dashboard;