import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CommodityPriceAPICredentialsManager } from '@/components/CommodityPriceAPICredentialsManager';

const CommodityPriceAPISettings: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            CommodityPriceAPI Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Configure your CommodityPriceAPI connection for real-time commodity price data.
          </p>
        </div>
      </div>
      
      <CommodityPriceAPICredentialsManager />
    </div>
  );
};

export default CommodityPriceAPISettings;