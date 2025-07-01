import React from 'react';
import CommodityCard from '@/components/CommodityCard';
import { SidebarProvider } from "@/components/ui/sidebar";
import CommoditySidebar from '@/components/CommoditySidebar';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { BarChart3, Activity, Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import ApiSettings from '@/components/ApiSettings';

const METAL_COMMODITIES = [
  { name: 'Gold', symbol: 'XAU', price: 2024.50, change: 0.45 },
  { name: 'Silver', symbol: 'XAG', price: 23.75, change: -0.32 },
  { name: 'Copper', symbol: 'HG', price: 3.85, change: 0.75 },
  { name: 'Platinum', symbol: 'XPT', price: 904.20, change: 0.78 },
  { name: 'Palladium', symbol: 'XPD', price: 1243.50, change: -1.15 }
];

const GRAIN_COMMODITIES = [
  { name: 'Corn', symbol: 'ZC', price: 442.25, change: -0.85 },
  { name: 'Oats', symbol: 'ZO', price: 372.50, change: 1.20 },
  { name: 'Rough Rice', symbol: 'ZR', price: 15.85, change: 0.32 },
  { name: 'Soybeans', symbol: 'ZS', price: 1198.75, change: -0.65 },
  { name: 'Soybean Meal', symbol: 'ZM', price: 352.80, change: -1.15 },
  { name: 'Soybean Oil', symbol: 'ZL', price: 47.85, change: 0.92 },
  { name: 'Wheat', symbol: 'ZW', price: 542.25, change: -0.45 }
];

const ENERGY_COMMODITIES = [
  { name: 'WTI Crude', symbol: 'CL', price: 76.80, change: 1.25 },
  { name: 'Brent Crude', symbol: 'BZ', price: 81.45, change: 0.95 },
  { name: 'Natural Gas', symbol: 'NG', price: 2.85, change: -2.15 },
  { name: 'RBOB Gasoline', symbol: 'RB', price: 2.15, change: -0.45 },
  { name: 'Heating Oil', symbol: 'HO', price: 2.65, change: 0.35 }
];

const LIVESTOCK_COMMODITIES = [
  { name: 'Feeder Cattle', symbol: 'FC', price: 245.50, change: 0.85 },
  { name: 'Live Cattle', symbol: 'LC', price: 152.75, change: -0.25 },
  { name: 'Lean Hogs', symbol: 'LH', price: 72.40, change: 1.15 }
];

const SOFTS_COMMODITIES = [
  { name: 'Cocoa', symbol: 'CC', price: 3125.00, change: 2.15 },
  { name: 'Coffee', symbol: 'KC', price: 165.40, change: -1.25 },
  { name: 'Cotton', symbol: 'CT', price: 68.75, change: 0.45 },
  { name: 'Lumber', symbol: 'LB', price: 445.20, change: -2.35 },
  { name: 'Orange Juice', symbol: 'OJ', price: 385.50, change: 1.85 },
  { name: 'Sugar', symbol: 'SB', price: 19.65, change: 0.75 }
];

const Index = () => {
  const [activeGroup, setActiveGroup] = React.useState("energy");
  const isMobile = useIsMobile();

  const getCommodities = () => {
    switch (activeGroup) {
      case "metals":
        return METAL_COMMODITIES;
      case "grains":
        return GRAIN_COMMODITIES;
      case "livestock":
        return LIVESTOCK_COMMODITIES;
      case "softs":
        return SOFTS_COMMODITIES;
      default:
        return ENERGY_COMMODITIES;
    }
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
      default:
        return "Energy Commodities";
    }
  };

  const getGroupIcon = () => {
    switch (activeGroup) {
      case "metals":
        return <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />;
      case "grains":
        return <Activity className="w-5 h-5 sm:w-6 sm:h-6" />;
      case "livestock":
        return <Activity className="w-5 h-5 sm:w-6 sm:h-6" />;
      case "softs":
        return <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />;
      default:
        return <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-muted/20">
        <CommoditySidebar 
          activeGroup={activeGroup} 
          onGroupSelect={setActiveGroup}
        />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Enhanced Responsive Header */}
          <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-soft">
            <div className="container flex h-16 sm:h-20 items-center justify-between px-3 sm:px-4 md:px-6">
              <div className="flex items-center gap-3 sm:gap-6 min-w-0 flex-1">
                <SidebarTrigger className="hover:bg-muted/80 transition-colors p-2 rounded-lg active:scale-95 touch-manipulation">
                  <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
                </SidebarTrigger>
                <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gradient animate-float truncate">
                    {isMobile ? 'Markets' : 'Commodity Markets'}
                  </h1>
                  <p className="text-2xs sm:text-xs lg:text-sm text-muted-foreground font-medium tracking-wide truncate">
                    {isMobile ? 'Live data' : 'Live market data & real-time analytics'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-1 sm:py-2 rounded-full bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 hover:scale-105 transition-transform duration-200">
                  <div className="h-1.5 w-1.5 sm:h-2.5 sm:w-2.5 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-500/50"></div>
                  <span className="text-2xs sm:text-xs lg:text-sm font-semibold text-green-700 dark:text-green-400 whitespace-nowrap">
                    {isMobile ? 'Live' : 'Live Market'}
                  </span>
                </div>
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
                      <span className="flex items-center gap-1">
                        <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        Updated every 30s
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-center sm:text-right space-y-1 shrink-0">
                  <p className="text-2xs sm:text-xs lg:text-sm font-medium text-muted-foreground">Market Status</p>
                  <div className="flex items-center justify-center sm:justify-end gap-2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm sm:text-base lg:text-lg font-bold text-green-600 dark:text-green-400">OPEN</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Responsive Market Stats Cards - Removed Total Volume */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/20 border border-purple-200 dark:border-purple-800 hover:scale-105 transition-all duration-300 cursor-pointer active:scale-95 touch-manipulation">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-2xs sm:text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider truncate">
                        Active Markets
                      </p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-900 dark:text-purple-100 number-display">
                        142
                      </p>
                      <p className="text-2xs sm:text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">
                        Currently trading
                      </p>
                    </div>
                    <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-purple-500 shrink-0" />
                  </div>
                </div>
                
                <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/20 dark:to-emerald-900/20 border border-emerald-200 dark:border-emerald-800 hover:scale-105 transition-all duration-300 cursor-pointer active:scale-95 touch-manipulation">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-2xs sm:text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider truncate">
                        Last Update
                      </p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-emerald-900 dark:text-emerald-100 number-display">
                        Just now
                      </p>
                      <p className="text-2xs sm:text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1">
                        Data refreshed
                      </p>
                    </div>
                    <Activity className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-emerald-500 shrink-0" />
                  </div>
                </div>
              </div>

              {/* Enhanced Responsive Commodities Grid */}
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
                      change={commodity.change}
                    />
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
        
        {/* API Settings Component */}
        <ApiSettings />
      </div>
    </SidebarProvider>
  );
};

export default Index;
