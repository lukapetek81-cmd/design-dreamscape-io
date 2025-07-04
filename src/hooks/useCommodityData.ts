
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CommodityPriceData {
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

export interface CommodityPrice {
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

export interface Commodity {
  name: string;
  symbol: string;
  price: number;
  changePercent: number;
  venue: string;
  contractSize?: string;
  category: string;
}

export const useAvailableCommodities = () => {
  // Mock commodity data - replace with actual API call if needed
  const commodities: Commodity[] = [
    // Energy
    { name: 'Crude Oil', symbol: 'CL=F', price: 65.50, changePercent: 1.2, venue: 'NYMEX', category: 'energy' },
    { name: 'Natural Gas', symbol: 'NG=F', price: 2.85, changePercent: -0.5, venue: 'NYMEX', category: 'energy' },
    { name: 'Gasoline RBOB', symbol: 'RB=F', price: 2.1, changePercent: 0.8, venue: 'NYMEX', category: 'energy' },
    { name: 'Heating Oil', symbol: 'HO=F', price: 2.3, changePercent: 1.1, venue: 'NYMEX', category: 'energy' },
    { name: 'Brent Crude Oil', symbol: 'BZ=F', price: 67.20, changePercent: 1.4, venue: 'ICE', category: 'energy' },
    
    // Metals
    { name: 'Gold Futures', symbol: 'GC=F', price: 2000.50, changePercent: 0.3, venue: 'COMEX', category: 'metals' },
    { name: 'Silver Futures', symbol: 'SI=F', price: 25.75, changePercent: -0.2, venue: 'COMEX', category: 'metals' },
    { name: 'Copper', symbol: 'HG=F', price: 4.20, changePercent: 1.5, venue: 'COMEX', category: 'metals' },
    { name: 'Platinum', symbol: 'PL=F', price: 1050.00, changePercent: 0.7, venue: 'NYMEX', category: 'metals' },
    { name: 'Palladium', symbol: 'PA=F', price: 1200.00, changePercent: -1.2, venue: 'NYMEX', category: 'metals' },
    
    // Grains
    { name: 'Corn Futures', symbol: 'ZC=F', price: 430.25, changePercent: 2.1, venue: 'CBOT', contractSize: '5,000 bu', category: 'grains' },
    { name: 'Wheat Futures', symbol: 'ZW=F', price: 550.75, changePercent: 1.8, venue: 'CBOT', contractSize: '5,000 bu', category: 'grains' },
    { name: 'Soybean Futures', symbol: 'ZS=F', price: 1150.50, changePercent: 1.3, venue: 'CBOT', contractSize: '5,000 bu', category: 'grains' },
    { name: 'Oat Futures', symbol: 'ZO=F', price: 385.00, changePercent: 0.9, venue: 'CBOT', contractSize: '5,000 bu', category: 'grains' },
    { name: 'Rough Rice', symbol: 'ZR=F', price: 16.25, changePercent: 0.4, venue: 'CBOT', contractSize: '2,000 cwt', category: 'grains' },
    
    // Livestock
    { name: 'Live Cattle Futures', symbol: 'LE=F', price: 170.50, changePercent: 0.6, venue: 'CME', contractSize: '40,000 lbs', category: 'livestock' },
    { name: 'Feeder Cattle Futures', symbol: 'GF=F', price: 240.25, changePercent: 0.8, venue: 'CME', contractSize: '50,000 lbs', category: 'livestock' },
    { name: 'Lean Hogs Futures', symbol: 'HE=F', price: 75.40, changePercent: -0.3, venue: 'CME', contractSize: '40,000 lbs', category: 'livestock' },
    
    // Softs
    { name: 'Coffee', symbol: 'KC=F', price: 165.25, changePercent: 1.2, venue: 'ICE', category: 'softs' },
    { name: 'Sugar', symbol: 'SB=F', price: 19.75, changePercent: 0.5, venue: 'ICE', category: 'softs' },
    { name: 'Cotton', symbol: 'CT=F', price: 72.80, changePercent: 1.1, venue: 'ICE', category: 'softs' },
    { name: 'Cocoa', symbol: 'CC=F', price: 2850.00, changePercent: -0.7, venue: 'ICE', category: 'softs' },
    { name: 'Orange Juice', symbol: 'OJ=F', price: 315.50, changePercent: 0.9, venue: 'ICE', category: 'softs' },
    
    // Other
    { name: 'Lumber Futures', symbol: 'LBS=F', price: 485.75, changePercent: 2.3, venue: 'CME', contractSize: '110,000 bd ft', category: 'other' },
  ];

  return {
    commodities,
    loading: false,
    error: null
  };
};

export interface CommodityHistoricalData {
  date: string;
  price: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
}

// Add a specific interface for candlestick data
export interface CandlestickData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  price: number; // Keep for compatibility
}

export const useCommodityPrice = (commodityName: string) => {
  return useQuery({
    queryKey: ['commodity-price', commodityName],
    queryFn: async (): Promise<CommodityPriceData | null> => {
      try {
        const { data, error } = await supabase.functions.invoke('fetch-commodity-prices', {
          body: { commodityName }
        });

        if (error) {
          console.warn(`Failed to fetch price for ${commodityName}:`, error);
          return null;
        }

        return data?.price || null;
      } catch (error) {
        console.warn(`Error fetching price for ${commodityName}:`, error);
        return null;
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 25000, // Consider data stale after 25 seconds
  });
};

export const useCommodityHistoricalData = (commodityName: string, timeframe: string, chartType: string = 'line') => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['commodity-historical', commodityName, timeframe, chartType],
    queryFn: async (): Promise<{ data: CommodityHistoricalData[], loading: boolean, error: string | null }> => {
      try {
        const isPremium = profile?.subscription_active && profile?.subscription_tier === 'premium';
        
        const { data, error } = await supabase.functions.invoke('fetch-commodity-data', {
          body: { 
            commodityName, 
            timeframe, 
            isPremium,
            chartType 
          }
        });

        if (error) {
          console.warn(`Failed to fetch historical data for ${commodityName}:`, error);
          return { data: [], loading: false, error: error.message };
        }

        console.log(`Raw API response for ${commodityName} (${chartType}):`, data);

        // Ensure OHLC data is properly structured for candlestick charts
        const processedData = data.data?.map((item: any) => {
          if (chartType === 'candlestick') {
            return {
              date: item.date,
              price: item.close || item.price,
              open: item.open,
              high: item.high,
              low: item.low,
              close: item.close
            };
          } else {
            return {
              date: item.date,
              price: item.price
            };
          }
        }) || [];

        console.log(`Processed data for ${commodityName} (${chartType}):`, processedData.slice(0, 2));

        return { 
          data: processedData, 
          loading: false, 
          error: null 
        };
      } catch (error) {
        console.warn(`Error fetching historical data for ${commodityName}:`, error);
        return { 
          data: [], 
          loading: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
      }
    },
    refetchInterval: 60000, // Refetch every minute
    staleTime: 50000, // Consider data stale after 50 seconds
  });
};
