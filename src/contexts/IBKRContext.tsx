import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAvailableCommodities } from '@/hooks/useCommodityData';
import { useIBKRRealtimeData } from '@/hooks/useIBKRRealtimeData';
import { useIBKRCredentials } from '@/hooks/useIBKRCredentials';

interface IBKRCredentials {
  username: string;
  password: string;
  gateway: string;
}

interface IBKRPrice {
  price: number;
  bid?: number;
  ask?: number;
  volume?: number;
  lastUpdate: string;
  source: string;
}

interface IBKRContextType {
  prices: Record<string, IBKRPrice>;
  connected: boolean;
  authenticated: boolean;
  error: string | null;
  lastUpdate: Date | null;
  connect: (credentials: IBKRCredentials) => Promise<void>;
  disconnect: () => void;
  subscribe: (symbols: string[]) => Promise<void>;
  isConnecting: boolean;
  isPremium: boolean;
}

const IBKRContext = createContext<IBKRContextType | null>(null);

export const useIBKR = () => {
  const context = useContext(IBKRContext);
  if (!context) {
    throw new Error('useIBKR must be used within an IBKRProvider');
  }
  return context;
};

interface IBKRProviderProps {
  children: React.ReactNode;
}

export const IBKRProvider: React.FC<IBKRProviderProps> = ({ children }) => {
  const { profile } = useAuth();
  const { data: commodities } = useAvailableCommodities();
  const [isConnecting, setIsConnecting] = useState(false);
  const { storedCredentials, getDecryptedCredentials } = useIBKRCredentials();

  // Get all available commodities for IBKR
  const allCommodityNames = React.useMemo(() => {
    if (!commodities) return [];
    return commodities.map(c => c.name);
  }, [commodities]);

  const isPremium = profile?.subscription_active && profile?.subscription_tier === 'premium';

  const {
    prices,
    connected,
    authenticated,
    error,
    lastUpdate,
    connect: connectToIBKR,
    disconnect,
    subscribe
  } = useIBKRRealtimeData({
    commodities: allCommodityNames,
    enabled: true
  });

  // Auto-connect when stored credentials are available
  useEffect(() => {
    const autoConnect = async () => {
      if (isPremium && storedCredentials && !connected && !isConnecting) {
        const credentials = await getDecryptedCredentials();
        if (credentials) {
          setIsConnecting(true);
          try {
            await connectToIBKR(credentials);
          } catch (error) {
            console.error('Auto-connect failed:', error);
          } finally {
            setIsConnecting(false);
          }
        }
      }
    };

    autoConnect();
  }, [isPremium, storedCredentials, connected, isConnecting, getDecryptedCredentials, connectToIBKR]);

  const connect = useCallback(async (credentials: IBKRCredentials) => {
    setIsConnecting(true);
    try {
      await connectToIBKR(credentials);
    } catch (error) {
      console.error('Failed to connect to IBKR:', error);
    } finally {
      setIsConnecting(false);
    }
  }, [connectToIBKR]);

  const value: IBKRContextType = {
    prices,
    connected,
    authenticated,
    error,
    lastUpdate,
    connect,
    disconnect,
    subscribe,
    isConnecting,
    isPremium
  };

  return (
    <IBKRContext.Provider value={value}>
      {children}
    </IBKRContext.Provider>
  );
};