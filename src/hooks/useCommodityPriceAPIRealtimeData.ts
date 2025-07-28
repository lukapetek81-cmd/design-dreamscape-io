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
  isPremium?: boolean; // Add isPremium prop
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

// Map common commodity names to CommodityPriceAPI symbols - MUST match backend
const COMMODITY_SYMBOL_MAP: Record<string, string> = {
  // Precious Metals
  'Gold Futures': 'XAU',
  'Silver Futures': 'XAG', 
  'Platinum': 'XPT',
  'Palladium': 'XPD',
  'Rhodium': 'XRH',
  
  // Base Metals
  'Copper': 'HG',
  'Aluminum': 'ALU',
  'Aluminum LME': 'AL',
  'Zinc': 'ZNC',
  'Zinc LME': 'ZINC',
  'Lead': 'LEAD',
  'Nickel': 'NICKEL',
  'Tin': 'TIN',
  'Steel': 'STEEL',
  'Hot-Rolled Coil Steel': 'HRC-STEEL',
  'Iron Ore 62% FE': 'TIOC',
  'Magnesium': 'MG',
  
  // Industrial/Tech Metals
  'Lithium': 'LC',
  'Cobalt': 'COB',
  'Titanium': 'TITAN',
  'Gallium': 'GA',
  'Indium': 'INDIUM',
  'Tellurium': 'TEL',
  'Neodymium': 'NDYM',
  
  // Energy
  'Crude Oil': 'WTIOIL',
  'Brent Crude Oil': 'BRENTOIL',
  'Crude Oil Dubai': 'DBLC1',
  'Ural Oil': 'URAL-OIL',
  'Natural Gas': 'NG',
  'Natural Gas US': 'NGUS',
  'Natural Gas Europe': 'NGEU',
  'Liquefied Natural Gas Japan': 'LNG',
  'TTF Gas': 'TTF-GAS',
  'UK Gas': 'UK-GAS',
  'Heating Oil': 'HO',
  'Gasoline RBOB': 'RB',
  'Gas Oil': 'LGO',
  'Coal': 'COAL',
  'Coal Australia': 'AUCOAL',
  'Coal South Africa': 'RB1COAL',
  'Uranium': 'UXA',
  'Ethanol': 'ETHANOL',
  'Methanol': 'METH',
  'Propane': 'PROP',
  'Naphtha': 'NAPHTHA',
  
  // Grains & Agriculture
  'Corn Futures': 'CORN',
  'Wheat Futures': 'ZW',
  'Soybean Futures': 'SOYBEAN',
  'Soybean Oil': 'ZL',
  'Soybean Meal': 'ZM',
  'Oat Futures': 'OAT',
  'Rough Rice': 'RR',
  'Canola': 'CANOLA',
  
  // Soft Commodities
  'Sugar': 'LS',
  'Cotton': 'CT',
  'Coffee Arabica': 'CA',
  'Coffee Robusta': 'CR',
  'Cocoa': 'CC',
  'Tea': 'TEA',
  'Tea Kolkata': 'TEAK',
  'Tea Colombo': 'TEAC',
  'Tea Mombasa': 'TEAM',
  
  // Oils & Fats
  'Palm Oil': 'PO',
  'Sunflower Oil': 'SUNF',
  'Rapeseed Oil': 'RSO',
  'Coconut Oil': 'CO',
  
  // Livestock & Dairy
  'Live Cattle Futures': 'CATTLE',
  'Lean Hogs Futures': 'HOGS',
  'Milk': 'MILK',
  'Cheese': 'CHE',
  'Butter': 'BUTTER',
  'Eggs US': 'EGGS-US',
  'Eggs China': 'EGGS-CH',
  'Poultry': 'POUL',
  'Salmon': 'SALMON',
  'Fish Meal': 'FM',
  
  // Industrial Materials
  'Lumber': 'LB',
  'Rubber': 'RUBBER',
  'Wool': 'WOOL',
  'Bitumen': 'BIT',
  'Kraft Pulp': 'K-PULP',
  
  // Plastics & Chemicals
  'Polyethylene': 'POL',
  'Polyvinyl Chloride': 'PVC',
  'Polypropylene': 'PYL',
  'Soda Ash': 'SODASH',
  'Urea': 'UREA',
  'Diammonium Phosphate': 'DIAPH',
  
  // Food & Agriculture
  'Potato': 'POTATO',
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
  const [isLimitReached, setIsLimitReached] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const apiKeyRef = useRef<string | null>(null);

  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setConnected(false);
    setError(null);
    setIsLimitReached(false);
    apiKeyRef.current = null;
  }, []);

  const fetchPrices = useCallback(async (apiKey: string) => {
    // Don't make API calls if we've already hit the limit
    if (isLimitReached) {
      console.log('Skipping API call - limit already reached');
      return;
    }

    try {
      console.log('fetchPrices called, isLimitReached:', isLimitReached);
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session) {
        throw new Error('No authentication session');
      }

      // Get symbols for the commodities we need
      const symbols = props.commodities
        .map(name => {
          const symbol = COMMODITY_SYMBOL_MAP[name];
          console.log(`Mapping commodity "${name}" to symbol "${symbol}"`);
          return symbol;
        })
        .filter(Boolean)
        .join(',');

      console.log(`Found ${props.commodities.length} commodities, mapped to ${symbols ? symbols.split(',').length : 0} symbols`);
      console.log('All commodity names:', props.commodities);
      console.log('Mapped symbols:', symbols);

      if (!symbols) {
        console.warn('No matching symbols found for commodities');
        console.warn('Available mappings:', Object.keys(COMMODITY_SYMBOL_MAP));
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
        // Handle different types of API errors
        const errorMessage = response.error.message || '';
        console.log('API Error received:', errorMessage);
        
        if (errorMessage.includes('LIMIT_REACHED') || 
            errorMessage.includes('usage limit reached') ||
            errorMessage.includes('maximum request count')) {
          console.log('Setting limit reached to true');
          setIsLimitReached(true);
          // Clear the polling interval when limit is reached
          if (intervalRef.current) {
            console.log('Clearing interval due to limit reached');
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          throw new Error('API usage limit reached. Please upgrade your CommodityPriceAPI plan or wait for the next billing cycle.');
        }
        
        if (errorMessage.includes('Edge Function returned a non-2xx status code')) {
          throw new Error('API request failed. Your API key may have reached its limit or expired.');
        }
        
        throw new Error(errorMessage || 'Failed to fetch prices');
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
      // Only clear error if we're not at limit - don't clear limit errors
      if (!isLimitReached) {
        setError(null);
      }

    } catch (err) {
      console.error('Error fetching CommodityPriceAPI data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [props.commodities, isLimitReached]);

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
      } else if (response.error) {
        const errorMessage = response.error.message || '';
        
        // Handle limit reached scenarios
        if (errorMessage.includes('LIMIT_REACHED') || 
            errorMessage.includes('usage limit reached') ||
            errorMessage.includes('maximum request count')) {
          setIsLimitReached(true);
          setUsage({
            plan: 'Free',
            quota: 1000,
            used: 1000
          });
        }
      }
    } catch (err) {
      console.error('Error fetching usage data:', err);
    }
  }, []);

  const connect = useCallback(async (credentials: CommodityPriceAPICredentials) => {
    try {
      setError(null);
      setIsLimitReached(false);
      apiKeyRef.current = credentials.apiKey;

      // Test the API key and fetch initial data
      await fetchPrices(credentials.apiKey);
      await fetchUsage(credentials.apiKey);
      
      setConnected(true);

      // Set up polling for real-time updates with different frequencies
      // Premium users: 30 seconds, Free users: 15 minutes
      // Only start polling if we haven't reached the limit
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      if (!isLimitReached) {
        const updateInterval = props.isPremium ? 30000 : 900000; // 30 seconds vs 15 minutes
        console.log(`Setting update interval to ${updateInterval/1000} seconds for ${props.isPremium ? 'premium' : 'free'} user`);
        
        intervalRef.current = setInterval(() => {
          if (apiKeyRef.current && !isLimitReached) {
            fetchPrices(apiKeyRef.current);
          }
        }, updateInterval);
      }

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