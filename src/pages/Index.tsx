
import React from 'react';
import CommodityCard from '@/components/CommodityCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto p-4">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Commodity & Metal Prices</h1>
          <p className="text-sm text-gray-500">Live market data</p>
        </header>
        
        <Tabs defaultValue="metals" className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="metals" className="flex-1">Metals</TabsTrigger>
            <TabsTrigger value="grains" className="flex-1">Grains</TabsTrigger>
          </TabsList>
          
          <TabsContent value="metals" className="space-y-4">
            {METAL_COMMODITIES.map((commodity) => (
              <CommodityCard
                key={commodity.symbol}
                name={commodity.name}
                symbol={commodity.symbol}
                price={commodity.price}
                change={commodity.change}
              />
            ))}
          </TabsContent>
          
          <TabsContent value="grains" className="space-y-4">
            {GRAIN_COMMODITIES.map((commodity) => (
              <CommodityCard
                key={commodity.symbol}
                name={commodity.name}
                symbol={commodity.symbol}
                price={commodity.price}
                change={commodity.change}
              />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
