import React, { createContext, useContext, ReactNode } from 'react';
import { useGlobalRealtimeData } from '@/hooks/useGlobalRealtimeData';
import { CommodityPrice, useAvailableCommodities } from '@/hooks/useCommodityData';
import { useDelayedData } from '@/hooks/useDelayedData';

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
  const commodityNames = (commodities || []).map(c => c.name);
  const { shouldDelayData, isPremium, getDelayStatus } = useDelayedData();
  const delayStatus = getDelayStatus();
  
  // Only connect to real-time data for premium users
  const { prices, connected, error, lastUpdate } = useGlobalRealtimeData(
    shouldDelayData ? [] : commodityNames
  );

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