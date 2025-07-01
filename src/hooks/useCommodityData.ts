
import { useState, useEffect } from 'react';
import { commodityApi, CommodityPrice, NewsItem, CommodityInfo } from '@/services/commodityApi';

export const useCommodityPrice = (commodityName: string) => {
  const [price, setPrice] = useState<CommodityPrice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        setLoading(true);
        setError(null);
        const priceData = await commodityApi.fetchCommodityPrice(commodityName);
        setPrice(priceData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch price');
        console.error('Error fetching commodity price:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();
    
    // Refresh price every 5 minutes instead of 30 seconds
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
        const newsData = await commodityApi.fetchCommodityNews(commodityName);
        setNews(newsData);
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
        const historicalData = await commodityApi.fetchHistoricalData(commodityName, timeframe);
        setData(historicalData);
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
        const commodityData = await commodityApi.fetchAvailableCommodities();
        setCommodities(commodityData);
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
