import React from 'react';
import { CommodityPriceAPICredentialsManager } from '@/components/CommodityPriceAPICredentialsManager';

const CommodityPriceAPISettings: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          CommodityPriceAPI Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Configure your CommodityPriceAPI connection for real-time commodity price data.
        </p>
      </div>
      
      <CommodityPriceAPICredentialsManager />
    </div>
  );
};

export default CommodityPriceAPISettings;