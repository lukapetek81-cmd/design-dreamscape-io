import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CommodityPriceAPIPrice {
  price: number;
  lastUpdate: string;
  source: string;
  unit: string;
  quote: string;
}

interface CommodityPriceAPICredentials {
  apiKey: string;
}

interface UseCommodityPriceAPIRealtimeDataProps {
  commodities: string[];
  enabled: boolean;
  credentials?: CommodityPriceAPICredentials;
}

interface CommodityPriceAPIRealtimeDataHook {
  prices: Record<string, CommodityPriceAPIPrice>;
  connected: boolean;
  error: string | null;
  lastUpdate: Date | null;
  usage: {
    plan: string;
    quota: number;
    used: number;
  } | null;
  connect: (credentials: CommodityPriceAPICredentials) => Promise<void>;
  disconnect: () => void;
}

// Map common commodity names to CommodityPriceAPI symbols
const COMMODITY_SYMBOL_MAP: Record<string, string> = {
  'Gold': 'XAU',
  'Silver': 'XAG',
  'Crude Oil WTI': 'WTIOIL',
  'Crude Oil Brent': 'BRENTOIL',
  'Natural Gas': 'NG',
  'Copper': 'HG',
  'Platinum': 'XPT',
  'Palladium': 'XPD',
  'Aluminum': 'ALU',
  'Zinc': 'ZNC',
  'Lead': 'LEAD',
  'Nickel': 'NI',
  'Tin': 'TIN',
  'Uranium': 'UX',
  'Coal': 'COAL',
  'Heating Oil': 'HO',
  'Gasoline': 'RB',
  'Corn': 'CORN',
  'Wheat': 'WHEAT',
  'Soybeans': 'SOYBEAN',
  'Sugar': 'SUGAR',
  'Cotton': 'COTTON',
  'Coffee': 'COFFEE',
  'Cocoa': 'COCOA',
  'Rice': 'RICE',
  'Oats': 'OATS',
  'Live Cattle': 'CATTLE',
  'Lean Hogs': 'HOGS',
  'Orange Juice': 'OJ'
};

export const useCommodityPriceAPIRealtimeData = (
  props: UseCommodityPriceAPIRealtimeDataProps
): CommodityPriceAPIRealtimeDataHook => {
  const [prices, setPrices] = useState<Record<string, CommodityPriceAPIPrice>>({});
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [usage, setUsage] = useState<{
    plan: string;
    quota: number;
    used: number;
  } | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const apiKeyRef = useRef<string | null>(null);

  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setConnected(false);
    setError(null);
    apiKeyRef.current = null;
  }, []);

  const fetchPrices = useCallback(async (apiKey: string) => {
    try {
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session) {
        throw new Error('No authentication session');
      }

      // Get symbols for the commodities we need
      const symbols = props.commodities
        .map(name => COMMODITY_SYMBOL_MAP[name])
        .filter(Boolean)
        .join(',');

      if (!symbols) {
        console.warn('No matching symbols found for commodities');
        return;
      }

      const response = await supabase.functions.invoke('commodity-price-api-realtime', {
        body: {
          apiKey,
          symbols,
          action: 'latest'
        },
        headers: {
          Authorization: `Bearer ${authData.session.access_token}`
        }
      });

      if (response.error) {
        // Check if this is a limit reached error
        if (response.error.message?.includes('LIMIT_REACHED') || 
            response.error.message?.includes('usage limit reached')) {
          throw new Error('API usage limit reached. Please upgrade your plan or wait for the next billing cycle.');
        }
        throw new Error(response.error.message || 'Failed to fetch prices');
      }

      const { rates, metadata, timestamp } = response.data;
      
      // Convert API response to our price format
      const newPrices: Record<string, CommodityPriceAPIPrice> = {};
      
      Object.entries(rates).forEach(([symbol, price]) => {
        // Find the commodity name for this symbol
        const commodityName = Object.entries(COMMODITY_SYMBOL_MAP)
          .find(([_, sym]) => sym === symbol)?.[0];
        
        if (commodityName && metadata[symbol]) {
          newPrices[commodityName] = {
            price: price as number,
            lastUpdate: new Date(timestamp * 1000).toISOString(),
            source: 'CommodityPriceAPI',
            unit: metadata[symbol].unit,
            quote: metadata[symbol].quote
          };
        }
      });

      setPrices(prev => ({ ...prev, ...newPrices }));
      setLastUpdate(new Date());
      setError(null);

    } catch (err) {
      console.error('Error fetching CommodityPriceAPI data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [props.commodities]);

  const fetchUsage = useCallback(async (apiKey: string) => {
    try {
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session) return;

      const response = await supabase.functions.invoke('commodity-price-api-realtime', {
        body: {
          apiKey,
          action: 'usage'
        },
        headers: {
          Authorization: `Bearer ${authData.session.access_token}`
        }
      });

      if (!response.error && response.data) {
        setUsage(response.data);
      } else if (response.error?.message?.includes('LIMIT_REACHED')) {
        // Still set usage data if available in error response
        setUsage({
          plan: 'Free',
          quota: 1000,
          used: 1000
        });
      }
    } catch (err) {
      console.error('Error fetching usage data:', err);
    }
  }, []);

  const connect = useCallback(async (credentials: CommodityPriceAPICredentials) => {
    try {
      setError(null);
      apiKeyRef.current = credentials.apiKey;

      // Test the API key and fetch initial data
      await fetchPrices(credentials.apiKey);
      await fetchUsage(credentials.apiKey);
      
      setConnected(true);

      // Set up polling for real-time updates (every minute for premium users)
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        if (apiKeyRef.current) {
          fetchPrices(apiKeyRef.current);
        }
      }, 60000); // Update every minute

    } catch (err) {
      console.error('Failed to connect to CommodityPriceAPI:', err);
      setError(err instanceof Error ? err.message : 'Connection failed');
      throw err;
    }
  }, [fetchPrices, fetchUsage]);

  const disconnect = useCallback(() => {
    cleanup();
    setPrices({});
    setUsage(null);
  }, [cleanup]);

  // Auto-connect when credentials are provided and enabled
  useEffect(() => {
    if (props.enabled && props.credentials && !connected) {
      connect(props.credentials);
    }
    
    return () => {
      cleanup();
    };
  }, [props.enabled, props.credentials, connected, connect, cleanup]);

  return {
    prices,
    connected,
    error,
    lastUpdate,
    usage,
    connect,
    disconnect
  };
};