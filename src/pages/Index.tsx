import React from 'react';
import CommodityCard from '@/components/CommodityCard';
import { SidebarProvider } from "@/components/ui/sidebar";
import CommoditySidebar from '@/components/CommoditySidebar';

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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <CommoditySidebar 
          activeGroup={activeGroup} 
          onGroupSelect={setActiveGroup}
        />
        <div className="flex-1 p-4 md:p-6">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Commodity & Metal Prices</h1>
            <p className="text-sm text-muted-foreground">Live market data</p>
          </header>
          <div className="space-y-4">
            {getCommodities().map((commodity) => (
              <CommodityCard
                key={commodity.symbol}
                name={commodity.name}
                symbol={commodity.symbol}
                price={commodity.price}
                change={commodity.change}
              />
            ))}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
