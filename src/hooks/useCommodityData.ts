
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
  change: number;
  changePercent: number;
  venue: string;
  contractSize?: string;
  category: string;
  // Enhanced fields for Market Screener - can be null if not available
  volume: number | null;
  volumeDisplay: string | null;
  weekHigh: number | null;
  weekLow: number | null;
  volatility: number | null;
  beta: string | null;
  avgVolume: number | null;
  marketCap: string | null;
}

export const useAvailableCommodities = () => {
  return useQuery({
    queryKey: ['available-commodities'],
    queryFn: async (): Promise<Commodity[]> => {
      try {
        const { data, error } = await supabase.functions.invoke('fetch-all-commodities');

        if (error) {
          console.warn('Failed to fetch commodities:', error);
          throw new Error(error.message);
        }

        console.log('Raw commodities API response:', data);

        return data?.commodities || [];
      } catch (error) {
        console.warn('Error fetching commodities:', error);
        throw error;
      }
    },
    refetchInterval: 300000, // Refetch every 5 minutes
    staleTime: 240000, // Consider data stale after 4 minutes
  });
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
