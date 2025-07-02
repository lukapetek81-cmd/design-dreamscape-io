
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CommodityPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  lastUpdate: string;
}

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  urlToImage?: string;
}

export interface CommodityInfo {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  category: string;
}

export const useCommodityPrice = (commodityName: string) => {
  const [price, setPrice] = useState<CommodityPrice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error: functionError } = await supabase.functions.invoke('fetch-commodity-prices', {
          body: { commodityName }
        });

        if (functionError) {
          throw new Error(functionError.message);
        }

        setPrice(data.price);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch price');
        console.error('Error fetching commodity price:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();
    
    // Refresh price every 5 minutes
    const interval = setInterval(fetchPrice, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [commodityName]);

  return { price, loading, error };
};

export const useCommodityNews = (commodityName: string) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);
        // For now, return empty array since we're focusing on price data
        setNews([]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch news');
        console.error('Error fetching commodity news:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    
    // Refresh news every 5 minutes
    const interval = setInterval(fetchNews, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [commodityName]);

  return { news, loading, error };
};

export const useCommodityHistoricalData = (commodityName: string, timeframe: string) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data: responseData, error: functionError } = await supabase.functions.invoke('fetch-commodity-data', {
          body: { commodityName, timeframe }
        });

        if (functionError) {
          throw new Error(functionError.message);
        }

        setData(responseData.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch historical data');
        console.error('Error fetching historical data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalData();
  }, [commodityName, timeframe]);

  return { data, loading, error };
};

export const useAvailableCommodities = () => {
  const [commodities, setCommodities] = useState<CommodityInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommodities = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Return fallback commodities for now
        const fallbackCommodities: CommodityInfo[] = [
          { symbol: 'GCUSD', name: 'Gold Futures', price: 2000, change: 5.5, changePercent: 0.28, category: 'metals' },
          { symbol: 'MGCUSD', name: 'Micro Gold Futures', price: 2000, change: 3.2, changePercent: 0.16, category: 'metals' },
          { symbol: 'SIUSD', name: 'Silver Futures', price: 25, change: -0.5, changePercent: -1.96, category: 'metals' },
          { symbol: 'MSIUSD', name: 'Micro Silver Futures', price: 25, change: -0.3, changePercent: -1.18, category: 'metals' },
          { symbol: 'HGUSD', name: 'Copper', price: 4.2, change: 0.08, changePercent: 1.94, category: 'metals' },
          { symbol: 'PLUSD', name: 'Platinum', price: 950, change: -12.5, changePercent: -1.30, category: 'metals' },
          { symbol: 'PAUSD', name: 'Palladium', price: 1800, change: 25.0, changePercent: 1.41, category: 'metals' },
          { symbol: 'ALUSD', name: 'Aluminum', price: 2.2, change: 0.05, changePercent: 2.32, category: 'metals' },
          { symbol: 'CLUSD', name: 'Crude Oil', price: 65, change: 2.1, changePercent: 3.34, category: 'energy' },
          { symbol: 'BZUSD', name: 'Brent Crude Oil', price: 67, change: 1.8, changePercent: 2.76, category: 'energy' },
          { symbol: 'NGUSD', name: 'Natural Gas', price: 2.85, change: -0.15, changePercent: -5.0, category: 'energy' },
          { symbol: 'HOUSD', name: 'Heating Oil', price: 2.3, change: 0.05, changePercent: 2.22, category: 'energy' },
          { symbol: 'RBUSD', name: 'Gasoline RBOB', price: 2.1, change: 0.08, changePercent: 3.95, category: 'energy' },
          { symbol: 'ZCUSX', name: 'Corn Futures', price: 430, change: -8, changePercent: -1.83, category: 'grains' },
          { symbol: 'ZWUSX', name: 'Wheat Futures', price: 550, change: 12, changePercent: 2.23, category: 'grains' },
          { symbol: 'ZSUSX', name: 'Soybean Futures', price: 1150, change: -25, changePercent: -2.13, category: 'grains' },
          { symbol: 'LEUSX', name: 'Live Cattle Futures', price: 170, change: 2.5, changePercent: 1.49, category: 'livestock' },
          { symbol: 'FCUSX', name: 'Feeder Cattle Futures', price: 240, change: -3.2, changePercent: -1.32, category: 'livestock' },
          { symbol: 'HEUSX', name: 'Lean Hogs Futures', price: 75, change: 1.8, changePercent: 2.46, category: 'livestock' },
          { symbol: 'DCUSD', name: 'Class III Milk Futures', price: 20.85, change: 0.32, changePercent: 1.56, category: 'livestock' },
          { symbol: 'ZOUSX', name: 'Oat Futures', price: 385, change: 8.50, changePercent: 2.26, category: 'softs' },
          { symbol: 'SBUSD', name: 'Sugar', price: 19.75, change: 0.45, changePercent: 2.33, category: 'softs' },
          { symbol: 'CTUSD', name: 'Cotton', price: 72.80, change: -1.25, changePercent: -1.69, category: 'softs' },
          { symbol: 'LBSUSD', name: 'Lumber Futures', price: 485, change: 12.30, changePercent: 2.60, category: 'softs' },
          { symbol: 'OJUSD', name: 'Orange Juice', price: 315, change: -8.75, changePercent: -2.70, category: 'softs' },
          { symbol: 'KCUSD', name: 'Coffee', price: 165, change: 3.50, changePercent: 2.17, category: 'softs' },
          { symbol: 'ZRUSX', name: 'Rough Rice', price: 16.25, change: 0.18, changePercent: 1.12, category: 'softs' },
          { symbol: 'CCUSD', name: 'Cocoa', price: 2850, change: -45, changePercent: -1.55, category: 'softs' },
          
        ];
        
        setCommodities(fallbackCommodities);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch commodities');
        console.error('Error fetching available commodities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCommodities();
    
    // Refresh commodities every 5 minutes
    const interval = setInterval(fetchCommodities, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return { commodities, loading, error };
};
