import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAvailableCommodities } from '@/hooks/useCommodityData';
import { useCommodityPriceAPIRealtimeData } from '@/hooks/useCommodityPriceAPIRealtimeData';

interface CommodityPriceAPICredentials {
  apiKey: string;
}

interface CommodityPriceAPIPrice {
  price: number;
  lastUpdate: string;
  source: string;
  unit: string;
  quote: string;
}

interface CommodityPriceAPIContextType {
  prices: Record<string, CommodityPriceAPIPrice>;
  connected: boolean;
  error: string | null;
  lastUpdate: Date | null;
  connect: (credentials: CommodityPriceAPICredentials) => Promise<void>;
  disconnect: () => void;
  isConnecting: boolean;
  isPremium: boolean;
  usage: {
    plan: string;
    quota: number;
    used: number;
  } | null;
}

const CommodityPriceAPIContext = createContext<CommodityPriceAPIContextType | null>(null);

export const useCommodityPriceAPI = () => {
  const context = useContext(CommodityPriceAPIContext);
  if (!context) {
    throw new Error('useCommodityPriceAPI must be used within a CommodityPriceAPIProvider');
  }
  return context;
};

interface CommodityPriceAPIProviderProps {
  children: React.ReactNode;
}

export const CommodityPriceAPIProvider: React.FC<CommodityPriceAPIProviderProps> = ({ children }) => {
  const { profile } = useAuth();
  const { data: commodities } = useAvailableCommodities();
  const [isConnecting, setIsConnecting] = useState(false);

  // Get all available commodities for CommodityPriceAPI
  const allCommodityNames = React.useMemo(() => {
    if (!commodities) return [];
    return commodities.map(c => c.name);
  }, [commodities]);

  const isPremium = profile?.subscription_active && profile?.subscription_tier === 'premium';

  const {
    prices,
    connected,
    error,
    lastUpdate,
    usage,
    connect: connectToCommodityPriceAPI,
    disconnect
  } = useCommodityPriceAPIRealtimeData({
    commodities: allCommodityNames,
    enabled: isPremium
  });

  const connect = useCallback(async (credentials: CommodityPriceAPICredentials) => {
    setIsConnecting(true);
    try {
      await connectToCommodityPriceAPI(credentials);
    } catch (error) {
      console.error('Failed to connect to CommodityPriceAPI:', error);
    } finally {
      setIsConnecting(false);
    }
  }, [connectToCommodityPriceAPI]);

  const value: CommodityPriceAPIContextType = {
    prices,
    connected,
    error,
    lastUpdate,
    connect,
    disconnect,
    isConnecting,
    isPremium,
    usage
  };

  return (
    <CommodityPriceAPIContext.Provider value={value}>
      {children}
    </CommodityPriceAPIContext.Provider>
  );
};