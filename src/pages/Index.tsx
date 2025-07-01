import React from 'react';
import CommodityCard from '@/components/CommodityCard';
import { SidebarProvider } from "@/components/ui/sidebar";
import CommoditySidebar from '@/components/CommoditySidebar';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { TrendingUp, BarChart3, Activity } from 'lucide-react';

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

const Index = () => {
  const [activeGroup, setActiveGroup] = React.useState("energy");

  const getCommodities = () => {
    switch (activeGroup) {
      case "metals":
        return METAL_COMMODITIES;
      case "grains":
        return GRAIN_COMMODITIES;
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
      default:
        return "Energy Commodities";
    }
  };

  const getGroupIcon = () => {
    switch (activeGroup) {
      case "metals":
        return <BarChart3 className="w-6 h-6" />;
      case "grains":
        return <Activity className="w-6 h-6" />;
      default:
        return <TrendingUp className="w-6 h-6" />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-muted/20">
        <CommoditySidebar 
          activeGroup={activeGroup} 
          onGroupSelect={setActiveGroup}
        />
        <div className="flex-1 flex flex-col">
          {/* Enhanced Header */}
          <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-soft">
            <div className="container flex h-20 items-center justify-between px-4 md:px-6">
              <div className="flex items-center gap-6">
                <SidebarTrigger className="hover:bg-muted/80 transition-colors" />
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold text-gradient animate-float">
                    Commodity Markets
                  </h1>
                  <p className="text-sm text-muted-foreground font-medium tracking-wide">
                    Live market data & real-time analytics
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                  <div className="h-2.5 w-2.5 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-500/50"></div>
                  <span className="text-sm font-semibold text-green-700 dark:text-green-400">Live Market</span>
                </div>
              </div>
            </div>
          </header>

          {/* Enhanced Main Content */}
          <main className="flex-1 p-6 md:p-8 lg:p-10">
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Enhanced Section Header */}
              <div className="flex items-center justify-between p-6 rounded-2xl bg-gradient-to-r from-card/50 to-muted/30 border border-border/50 shadow-soft">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    {getGroupIcon()}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-1">
                      {getGroupTitle()}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                        {getCommodities().length} active commodities
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        Updated every 15 seconds
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Market Status</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">OPEN</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Market Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Total Volume</p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 number-display">$45.2B</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/20 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Active Markets</p>
                      <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 number-display">142</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-purple-500" />
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/20 dark:to-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Last Update</p>
                      <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 number-display">2s ago</p>
                    </div>
                    <Activity className="w-8 h-8 text-emerald-500" />
                  </div>
                </div>
              </div>

              {/* Enhanced Commodities Grid */}
              <div className="grid gap-6">
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
      </div>
    </SidebarProvider>
  );
};

export default Index;
