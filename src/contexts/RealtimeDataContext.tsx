import React, { createContext, useContext, ReactNode } from 'react';
import { CommodityPrice, useAvailableCommodities } from '@/hooks/useCommodityData';
import { useDelayedData } from '@/hooks/useDelayedData';
import { useCommodityPriceAPI } from '@/contexts/CommodityPriceAPIContext';

interface RealtimeDataContextType {
  prices: Record<string, CommodityPrice>;
  connected: boolean;
  error: string | null;
  lastUpdate: Date | null;
  getPriceForCommodity: (commodityName: string) => CommodityPrice | null;
  isLiveData: (commodityName: string) => boolean;
  isDelayedData: boolean;
  delayStatus: {
    isDelayed: boolean;
    delayText: string;
    statusText: string;
  };
}

const RealtimeDataContext = createContext<RealtimeDataContextType | undefined>(undefined);

export const useRealtimeDataContext = () => {
  const context = useContext(RealtimeDataContext);
  if (context === undefined) {
    throw new Error('useRealtimeDataContext must be used within a RealtimeDataProvider');
  }
  return context;
};

interface RealtimeDataProviderProps {
  children: ReactNode;
}

export const RealtimeDataProvider: React.FC<RealtimeDataProviderProps> = ({ children }) => {
  const { data: commodities } = useAvailableCommodities();
  const { shouldDelayData, isPremium, getDelayStatus } = useDelayedData();
  const delayStatus = getDelayStatus();
  const { prices: apiPrices, connected, error, lastUpdate } = useCommodityPriceAPI();
  
  // Convert CommodityPriceAPI format to CommodityPrice format
  const prices = React.useMemo(() => {
    const convertedPrices: Record<string, CommodityPrice> = {};
    Object.entries(apiPrices).forEach(([name, priceData]) => {
      convertedPrices[name] = {
        price: priceData.price,
        change: 0, // CommodityPriceAPI doesn't provide change data
        changePercent: 0, // CommodityPriceAPI doesn't provide change data
        timestamp: priceData.lastUpdate
      };
    });
    return convertedPrices;
  }, [apiPrices]);

  const getPriceForCommodity = (commodityName: string): CommodityPrice | null => {
    return prices[commodityName] || null;
  };

  const isLiveData = (commodityName: string): boolean => {
    return !shouldDelayData && connected && prices[commodityName] !== undefined;
  };

  const value = {
    prices,
    connected: !shouldDelayData && connected,
    error,
    lastUpdate,
    getPriceForCommodity,
    isLiveData,
    isDelayedData: shouldDelayData,
    delayStatus
  };

  return (
    <RealtimeDataContext.Provider value={value}>
      {children}
    </RealtimeDataContext.Provider>
  );
};