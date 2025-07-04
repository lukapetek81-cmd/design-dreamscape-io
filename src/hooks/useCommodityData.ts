
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CommodityPriceData {
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

export interface CommodityHistoricalData {
  date: string;
  price: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
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

        return { 
          data: data.data || [], 
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
