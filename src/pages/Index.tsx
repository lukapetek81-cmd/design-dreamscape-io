
import React from 'react';
import CommodityCard from '@/components/CommodityCard';

const COMMODITIES = [
  { name: 'Gold', symbol: 'XAU', price: 2024.50, change: 0.45 },
  { name: 'Silver', symbol: 'XAG', price: 23.75, change: -0.32 },
  { name: 'Crude Oil', symbol: 'CL', price: 76.80, change: 1.25 },
  { name: 'Natural Gas', symbol: 'NG', price: 2.85, change: -2.15 },
  { name: 'Copper', symbol: 'HG', price: 3.85, change: 0.75 },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto p-4">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Commodity Prices</h1>
          <p className="text-sm text-gray-500">Live market data</p>
        </header>
        
        <div className="space-y-4">
          {COMMODITIES.map((commodity) => (
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
  );
};

export default Index;
