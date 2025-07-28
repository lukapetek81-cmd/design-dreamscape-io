import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAvailableCommodities } from '@/hooks/useCommodityData';
import { useCommodityPriceAPIRealtimeData } from '@/hooks/useCommodityPriceAPIRealtimeData';
import { decryptCredential } from '@/lib/encryption';

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
  const [storedCredentials, setStoredCredentials] = useState<CommodityPriceAPICredentials | null>(null);

  // Get all available commodities for CommodityPriceAPI
  const allCommodityNames = React.useMemo(() => {
    if (!commodities) return [];
    return commodities.map(c => c.name);
  }, [commodities]);

  const isPremium = profile?.subscription_active && profile?.subscription_tier === 'premium';

  // Load stored credentials on mount
  React.useEffect(() => {
    const loadCredentials = async () => {
      if ((profile as any)?.commodity_price_api_credentials) {
        try {
          const decrypted = decryptCredential((profile as any).commodity_price_api_credentials);
          const credentials = JSON.parse(decrypted) as CommodityPriceAPICredentials;
          setStoredCredentials(credentials);
        } catch (error) {
          console.error('Failed to decrypt CommodityPriceAPI credentials:', error);
        }
      }
    };

    if (isPremium && profile) {
      loadCredentials();
    }
  }, [profile, isPremium]);

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
    enabled: isPremium && !!storedCredentials,
    credentials: storedCredentials,
    isPremium: isPremium // Pass isPremium to the hook
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