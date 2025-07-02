
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
          { symbol: 'SIUSD', name: 'Silver Futures', price: 25, change: -0.5, changePercent: -1.96, category: 'metals' },
          { symbol: 'CLUSD', name: 'Crude Oil', price: 65, change: 2.1, changePercent: 3.34, category: 'energy' },
          { symbol: 'NGUSD', name: 'Natural Gas', price: 2.85, change: -0.15, changePercent: -5.0, category: 'energy' },
          { symbol: 'HOUSD', name: 'Heating Oil', price: 2.3, change: 0.05, changePercent: 2.22, category: 'energy' },
          { symbol: 'ZCUSX', name: 'Corn Futures', price: 430, change: -8, changePercent: -1.83, category: 'grains' },
          { symbol: 'ZWUSX', name: 'Wheat Futures', price: 550, change: 12, changePercent: 2.23, category: 'grains' },
          { symbol: 'ZSUSX', name: 'Soybean Futures', price: 1150, change: -25, changePercent: -2.13, category: 'grains' }
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
