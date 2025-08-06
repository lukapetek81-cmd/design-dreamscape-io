
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useDelayedData } from './useDelayedData';

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
  const { getDataDelay, shouldDelayData } = useDelayedData();
  
  return useQuery({
    queryKey: ['all-commodities', getDataDelay()], // Changed key to force cache refresh
    queryFn: async (): Promise<Commodity[]> => {
      try {
        const { data, error } = await supabase.functions.invoke('fetch-commodity-symbols', {
          body: { dataDelay: getDataDelay() }
        });

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
    refetchInterval: shouldDelayData ? 900000 : 300000, // 15 min for delayed, 5 min for real-time
    staleTime: shouldDelayData ? 840000 : 240000, // 14 min for delayed, 4 min for real-time
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
  const { getDataDelay, shouldDelayData, isPremium } = useDelayedData();
  
  return useQuery({
    queryKey: ['commodity-price', commodityName, getDataDelay(), isPremium],
    queryFn: async (): Promise<CommodityPriceData | null> => {
      try {
        const { data, error } = await supabase.functions.invoke('fetch-commodity-prices', {
          body: { 
            commodityName, 
            dataDelay: getDataDelay(),
            isPremium 
          }
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
    refetchInterval: shouldDelayData ? 900000 : 30000, // 15 min for delayed, 30 sec for real-time
    staleTime: shouldDelayData ? 840000 : 25000, // 14 min for delayed, 25 sec for real-time
  });
};

export const useCommodityHistoricalData = (commodityName: string, timeframe: string, chartType: string = 'line', contractSymbol?: string) => {
  const { profile } = useAuth();
  const { getDataDelay, shouldDelayData } = useDelayedData();
  
  // Debug logging to see what contract symbol is being passed
  console.log(`useCommodityHistoricalData called for ${commodityName} with contract: ${contractSymbol}`);
  
  return useQuery({
    queryKey: ['commodity-historical', commodityName, timeframe, chartType, contractSymbol, getDataDelay()],
    queryFn: async (): Promise<{ data: CommodityHistoricalData[], loading: boolean, error: string | null }> => {
      try {
        const isPremium = profile?.subscription_active && profile?.subscription_tier === 'premium';
        
        console.log(`Fetching commodity data for ${commodityName} with contract symbol: ${contractSymbol}`);
        
        const { data, error } = await supabase.functions.invoke('fetch-commodity-data', {
          body: { 
            commodityName, 
            timeframe, 
            isPremium,
            chartType,
            dataDelay: getDataDelay(),
            contractSymbol
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
    refetchInterval: shouldDelayData ? 900000 : 60000, // 15 min for delayed, 1 min for real-time
    staleTime: shouldDelayData ? 840000 : 50000, // 14 min for delayed, 50 sec for real-time
  });
};
