import React, { createContext, useContext, ReactNode } from 'react';
import { useGlobalRealtimeData } from '@/hooks/useGlobalRealtimeData';
import { CommodityPrice, useAvailableCommodities } from '@/hooks/useCommodityData';

interface RealtimeDataContextType {
  prices: Record<string, CommodityPrice>;
  connected: boolean;
  error: string | null;
  lastUpdate: Date | null;
  getPriceForCommodity: (commodityName: string) => CommodityPrice | null;
  isLiveData: (commodityName: string) => boolean;
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
  const { commodities } = useAvailableCommodities();
  const commodityNames = commodities.map(c => c.name);
  
  const { prices, connected, error, lastUpdate } = useGlobalRealtimeData(commodityNames);

  const getPriceForCommodity = (commodityName: string): CommodityPrice | null => {
    return prices[commodityName] || null;
  };

  const isLiveData = (commodityName: string): boolean => {
    return connected && prices[commodityName] !== undefined;
  };

  const value = {
    prices,
    connected,
    error,
    lastUpdate,
    getPriceForCommodity,
    isLiveData
  };

  return (
    <RealtimeDataContext.Provider value={value}>
      {children}
    </RealtimeDataContext.Provider>
  );
};