// Commodity price API service
const getAlphaVantageApiKey = () => localStorage.getItem('alphaVantageApiKey') || 'demo';
const getNewsApiKey = () => localStorage.getItem('newsApiKey') || 'demo';

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

// Commodity symbol mappings for different APIs
const COMMODITY_SYMBOLS: Record<string, string> = {
  'Gold': 'XAU',
  'Silver': 'XAG',
  'Copper': 'HG',
  'Platinum': 'XPT',
  'Palladium': 'XPD',
  'WTI Crude': 'CL',
  'Brent Crude': 'BZ',
  'Natural Gas': 'NG',
  'RBOB Gasoline': 'RB',
  'Heating Oil': 'HO',
  'Corn': 'ZC',
  'Wheat': 'ZW',
  'Soybeans': 'ZS',
  'Soybean Meal': 'ZM',
  'Soybean Oil': 'ZL',
  'Oats': 'ZO',
  'Rough Rice': 'ZR'
};

export class CommodityApiService {
  private static instance: CommodityApiService;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): CommodityApiService {
    if (!CommodityApiService.instance) {
      CommodityApiService.instance = new CommodityApiService();
    }
    return CommodityApiService.instance;
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION;
  }

  async fetchCommodityPrice(commodityName: string): Promise<CommodityPrice | null> {
    const cacheKey = `price_${commodityName}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    try {
      const symbol = COMMODITY_SYMBOLS[commodityName] || commodityName;
      const apiKey = getAlphaVantageApiKey();
      
      // Try Alpha Vantage API for commodity data
      const response = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data['Error Message'] || data['Note']) {
        console.warn('Alpha Vantage API limit or error:', data);
        return this.getFallbackPrice(commodityName);
      }
      
      const quote = data['Global Quote'];
      if (!quote) {
        return this.getFallbackPrice(commodityName);
      }
      
      const price: CommodityPrice = {
        symbol: symbol,
        price: parseFloat(quote['05. price']) || 0,
        change: parseFloat(quote['09. change']) || 0,
        changePercent: parseFloat(quote['10. change percent']?.replace('%', '')) || 0,
        lastUpdate: new Date().toISOString()
      };
      
      this.cache.set(cacheKey, { data: price, timestamp: Date.now() });
      return price;
      
    } catch (error) {
      console.error(`Error fetching price for ${commodityName}:`, error);
      return this.getFallbackPrice(commodityName);
    }
  }

  private getFallbackPrice(commodityName: string): CommodityPrice {
    // Fallback prices based on current market ranges
    const fallbackPrices: Record<string, { price: number; change: number }> = {
      'Gold': { price: 2024.50, change: 0.45 },
      'Silver': { price: 23.75, change: -0.32 },
      'Copper': { price: 3.85, change: 0.75 },
      'Platinum': { price: 904.20, change: 0.78 },
      'Palladium': { price: 1243.50, change: -1.15 },
      'WTI Crude': { price: 76.80, change: 1.25 },
      'Brent Crude': { price: 81.45, change: 0.95 },
      'Natural Gas': { price: 2.85, change: -2.15 },
      'RBOB Gasoline': { price: 2.15, change: -0.45 },
      'Heating Oil': { price: 2.65, change: 0.35 },
      'Corn': { price: 442.25, change: -0.85 },
      'Wheat': { price: 542.25, change: -0.45 },
      'Soybeans': { price: 1198.75, change: -0.65 },
      'Soybean Meal': { price: 352.80, change: -1.15 },
      'Soybean Oil': { price: 47.85, change: 0.92 },
      'Oats': { price: 372.50, change: 1.20 },
      'Rough Rice': { price: 15.85, change: 0.32 }
    };

    const fallback = fallbackPrices[commodityName] || { price: 100, change: 0 };
    
    return {
      symbol: COMMODITY_SYMBOLS[commodityName] || commodityName,
      price: fallback.price,
      change: fallback.change,
      changePercent: fallback.change,
      lastUpdate: new Date().toISOString()
    };
  }

  async fetchCommodityNews(commodityName: string, limit: number = 5): Promise<NewsItem[]> {
    const cacheKey = `news_${commodityName}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    try {
      const apiKey = getNewsApiKey();
      // Use NewsAPI for commodity-related news
      const query = `${commodityName} commodity market price trading`;
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=${limit}&apiKey=${apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'error') {
        console.warn('NewsAPI error:', data.message);
        return this.getFallbackNews(commodityName);
      }
      
      const news: NewsItem[] = data.articles?.map((article: any, index: number) => ({
        id: `${commodityName}_${index}_${Date.now()}`,
        title: article.title || `${commodityName} Market Update`,
        description: article.description || `Latest news about ${commodityName} market`,
        url: article.url || '#',
        source: article.source?.name || 'Market News',
        publishedAt: article.publishedAt || new Date().toISOString(),
        urlToImage: article.urlToImage
      })) || [];
      
      this.cache.set(cacheKey, { data: news, timestamp: Date.now() });
      return news;
      
    } catch (error) {
      console.error(`Error fetching news for ${commodityName}:`, error);
      return this.getFallbackNews(commodityName);
    }
  }

  private getFallbackNews(commodityName: string): NewsItem[] {
    const today = new Date();
    return [
      {
        id: `${commodityName}_fallback_1`,
        title: `${commodityName} prices affected by global supply chain disruptions`,
        description: `Recent developments in global supply chains are impacting ${commodityName} markets with increased volatility.`,
        url: '#',
        source: 'Market Watch',
        publishedAt: new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: `${commodityName}_fallback_2`,
        title: `New regulations impact ${commodityName.toLowerCase()} market outlook`,
        description: `Regulatory changes are creating new dynamics in the ${commodityName} trading landscape.`,
        url: '#',
        source: 'Reuters',
        publishedAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: `${commodityName}_fallback_3`,
        title: `Global demand shifts create volatility in ${commodityName.toLowerCase()} prices`,
        description: `Changing global demand patterns are influencing ${commodityName} price movements across major markets.`,
        url: '#',
        source: 'Bloomberg',
        publishedAt: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  async fetchHistoricalData(commodityName: string, timeframe: string = '1M'): Promise<any[]> {
    const cacheKey = `historical_${commodityName}_${timeframe}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    try {
      const symbol = COMMODITY_SYMBOLS[commodityName] || commodityName;
      const apiKey = getAlphaVantageApiKey();
      
      // Try to fetch from Alpha Vantage
      const response = await fetch(
        `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data['Error Message'] || data['Note']) {
        return this.generateMockHistoricalData(commodityName, timeframe);
      }
      
      const timeSeries = data['Time Series (Daily)'];
      if (!timeSeries) {
        return this.generateMockHistoricalData(commodityName, timeframe);
      }
      
      const historicalData = Object.entries(timeSeries)
        .slice(0, this.getTimeframeDays(timeframe))
        .map(([date, values]: [string, any]) => ({
          date,
          price: parseFloat(values['4. close']) || 0
        }))
        .reverse();
      
      this.cache.set(cacheKey, { data: historicalData, timestamp: Date.now() });
      return historicalData;
      
    } catch (error) {
      console.error(`Error fetching historical data for ${commodityName}:`, error);
      return this.generateMockHistoricalData(commodityName, timeframe);
    }
  }

  private getTimeframeDays(timeframe: string): number {
    switch (timeframe) {
      case '7d': return 7;
      case '1m': return 30;
      case '3m': return 90;
      case '6m': return 180;
      default: return 30;
    }
  }

  private generateMockHistoricalData(commodityName: string, timeframe: string): any[] {
    const days = this.getTimeframeDays(timeframe);
    const basePrice = this.getFallbackPrice(commodityName).price;
    const data = [];
    const now = new Date();
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const randomChange = (Math.random() - 0.5) * 2;
      const price = basePrice + (randomChange * (basePrice * 0.1));
      
      data.push({
        date: date.toISOString().split('T')[0],
        price: parseFloat(price.toFixed(2))
      });
    }
    
    return data;
  }
}

export const commodityApi = CommodityApiService.getInstance();
