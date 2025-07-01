
import React from 'react';
import CommodityCard from '@/components/CommodityCard';
import { SidebarProvider } from "@/components/ui/sidebar";
import CommoditySidebar from '@/components/CommoditySidebar';
import { SidebarTrigger } from "@/components/ui/sidebar";

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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-muted/20">
        <CommoditySidebar 
          activeGroup={activeGroup} 
          onGroupSelect={setActiveGroup}
        />
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-4 md:px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Commodity Markets
                  </h1>
                  <p className="text-xs text-muted-foreground">Live market data & analytics</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-muted-foreground">Live</span>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Section Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{getGroupTitle()}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {getCommodities().length} commodities • Updated every 15 seconds
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Market Status</p>
                  <p className="text-sm font-medium text-green-600">Open</p>
                </div>
              </div>

              {/* Commodities Grid */}
              <div className="grid gap-4 md:gap-6">
                {getCommodities().map((commodity, index) => (
                  <div 
                    key={commodity.symbol}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
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
