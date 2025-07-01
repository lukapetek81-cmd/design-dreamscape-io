// Commodity price API service
import { 
  fetchNewsFromFMP, 
  fetchNewsFromNewsAPI, 
  fetchNewsFromAlphaVantage,
  removeDuplicateNews,
  sortNewsByRelevance,
  getFallbackNews
} from './newsHelpers';

const getFmpApiKey = () => localStorage.getItem('fmpApiKey') || 'demo';
const getNewsApiKey = () => localStorage.getItem('newsApiKey') || '';
const getAlphaVantageApiKey = () => localStorage.getItem('alphaVantageApiKey') || 'demo';

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

// Updated commodity symbol mappings for multiple APIs
const COMMODITY_SYMBOLS: Record<string, {
  fmp: string;
  yahoo: string;
  alphaVantage: string;
  quandl?: string;
}> = {
  'Gold': { fmp: 'GCUSD', yahoo: 'GC=F', alphaVantage: 'GOLD', quandl: 'LBMA/GOLD' },
  'Silver': { fmp: 'SIUSD', yahoo: 'SI=F', alphaVantage: 'SILVER', quandl: 'LBMA/SILVER' },
  'Copper': { fmp: 'HGUSD', yahoo: 'HG=F', alphaVantage: 'COPPER' },
  'Platinum': { fmp: 'PLUSD', yahoo: 'PL=F', alphaVantage: 'PLATINUM' },
  'Palladium': { fmp: 'PAUSD', yahoo: 'PA=F', alphaVantage: 'PALLADIUM' },
  'WTI Crude': { fmp: 'CLUSD', yahoo: 'CL=F', alphaVantage: 'WTI' },
  'Brent Crude': { fmp: 'BZUSD', yahoo: 'BZ=F', alphaVantage: 'BRENT' },
  'Natural Gas': { fmp: 'NGUSD', yahoo: 'NG=F', alphaVantage: 'NATURAL_GAS' },
  'RBOB Gasoline': { fmp: 'RBUSD', yahoo: 'RB=F', alphaVantage: 'GASOLINE' },
  'Heating Oil': { fmp: 'HOUSD', yahoo: 'HO=F', alphaVantage: 'HEATING_OIL' },
  'Corn': { fmp: 'CORNUSD', yahoo: 'ZC=F', alphaVantage: 'CORN' },
  'Wheat': { fmp: 'WHEATUSD', yahoo: 'ZW=F', alphaVantage: 'WHEAT' },
  'Soybeans': { fmp: 'SOYBNUSD', yahoo: 'ZS=F', alphaVantage: 'SOYBEANS' },
  'Soybean Meal': { fmp: 'SOYBNUSD', yahoo: 'ZM=F', alphaVantage: 'SOYBEAN_MEAL' },
  'Soybean Oil': { fmp: 'SOYBNUSD', yahoo: 'ZL=F', alphaVantage: 'SOYBEAN_OIL' },
  'Oats': { fmp: 'CORNUSD', yahoo: 'ZO=F', alphaVantage: 'OATS' },
  'Rough Rice': { fmp: 'WHEATUSD', yahoo: 'ZR=F', alphaVantage: 'RICE' },
  'Feeder Cattle': { fmp: 'LCUSD', yahoo: 'GF=F', alphaVantage: 'FEEDER_CATTLE' },
  'Live Cattle': { fmp: 'LCUSD', yahoo: 'LE=F', alphaVantage: 'LIVE_CATTLE' },
  'Lean Hogs': { fmp: 'LHUSD', yahoo: 'HE=F', alphaVantage: 'LEAN_HOGS' },
  'Cocoa': { fmp: 'CCUSD', yahoo: 'CC=F', alphaVantage: 'COCOA' },
  'Coffee': { fmp: 'KCUSD', yahoo: 'KC=F', alphaVantage: 'COFFEE' },
  'Cotton': { fmp: 'CTUSD', yahoo: 'CT=F', alphaVantage: 'COTTON' },
  'Lumber': { fmp: 'LBUSD', yahoo: 'LBS=F', alphaVantage: 'LUMBER' },
  'Orange Juice': { fmp: 'OJUSD', yahoo: 'OJ=F', alphaVantage: 'ORANGE_JUICE' },
  'Sugar': { fmp: 'SBUSD', yahoo: 'SB=F', alphaVantage: 'SUGAR' }
};

// Generate fallback historical data when APIs fail
const generateFallbackHistoricalData = (commodityName: string, timeframe: string, basePrice: number): any[] => {
  const dataPoints = timeframe === '1d' ? 24 : timeframe === '7d' ? 7 : timeframe === '1m' ? 30 : timeframe === '3m' ? 90 : 180;
  const data: any[] = [];
  const now = new Date();
  
  // Generate realistic price movements
  let currentPrice = basePrice;
  const volatility = basePrice * 0.02; // 2% volatility
  
  for (let i = dataPoints - 1; i >= 0; i--) {
    let date: Date;
    
    if (timeframe === '1d') {
      // For daily chart, generate hourly data
      date = new Date(now.getTime() - (i * 60 * 60 * 1000));
    } else {
      // For other timeframes, generate daily data
      date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
    }
    
    // Add some realistic price movement
    const change = (Math.random() - 0.5) * volatility;
    currentPrice += change;
    
    // Ensure price doesn't go negative
    if (currentPrice < basePrice * 0.5) {
      currentPrice = basePrice * 0.5;
    }
    
    data.push({
      date: date.toISOString(),
      price: Math.round(currentPrice * 100) / 100
    });
  }
  
  return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

// Get base price for fallback data
const getBasePriceForCommodity = (commodityName: string): number => {
  const basePrices: Record<string, number> = {
    'Gold': 2000,
    'Silver': 25,
    'Copper': 4.2,
    'Platinum': 950,
    'Palladium': 1800,
    'WTI Crude': 75,
    'Brent Crude': 80,
    'Natural Gas': 2.85,
    'RBOB Gasoline': 2.1,
    'Heating Oil': 2.3,
    'Corn': 430,
    'Wheat': 550,
    'Soybeans': 1150,
    'Soybean Meal': 350,
    'Soybean Oil': 45,
    'Oats': 350,
    'Rough Rice': 16,
    'Feeder Cattle': 240,
    'Live Cattle': 170,
    'Lean Hogs': 75,
    'Cocoa': 2800,
    'Coffee': 180,
    'Cotton': 75,
    'Lumber': 450,
    'Orange Juice': 120,
    'Sugar': 19
  };
  
  return basePrices[commodityName] || 100;
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

    console.log(`Fetching real price data for ${commodityName}`);
    
    // Try multiple APIs in sequence
    const apis = [
      () => this.fetchPriceFromFMP(commodityName),
      () => this.fetchPriceFromYahoo(commodityName),
      () => this.fetchPriceFromAlphaVantage(commodityName)
    ];

    for (const fetchApi of apis) {
      try {
        const price = await fetchApi();
        if (price) {
          console.log(`Successfully fetched price for ${commodityName}:`, price);
          this.cache.set(cacheKey, { data: price, timestamp: Date.now() });
          return price;
        }
      } catch (error) {
        console.warn(`API failed for ${commodityName}:`, error);
        continue;
      }
    }

    console.warn(`All APIs failed for ${commodityName}, using fallback price data`);
    
    // Generate fallback price data
    const basePrice = getBasePriceForCommodity(commodityName);
    const symbols = COMMODITY_SYMBOLS[commodityName];
    const fallbackPrice: CommodityPrice = {
      symbol: symbols?.fmp || commodityName,
      price: basePrice,
      change: (Math.random() - 0.5) * basePrice * 0.02, // Random change up to 2%
      changePercent: (Math.random() - 0.5) * 4, // Random percentage change up to 4%
      lastUpdate: new Date().toISOString()
    };
    
    this.cache.set(cacheKey, { data: fallbackPrice, timestamp: Date.now() });
    return fallbackPrice;
  }

  private async fetchPriceFromFMP(commodityName: string): Promise<CommodityPrice | null> {
    const symbols = COMMODITY_SYMBOLS[commodityName];
    if (!symbols) return null;

    const apiKey = getFmpApiKey();
    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/quote/${symbols.fmp}?apikey=${apiKey}`
    );
    
    if (!response.ok) throw new Error(`FMP API error: ${response.status}`);
    
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    
    const quote = data[0];
    return {
      symbol: symbols.fmp,
      price: parseFloat(quote.price) || 0,
      change: parseFloat(quote.change) || 0,
      changePercent: parseFloat(quote.changesPercentage) || 0,
      lastUpdate: new Date().toISOString()
    };
  }

  private async fetchPriceFromYahoo(commodityName: string): Promise<CommodityPrice | null> {
    const symbols = COMMODITY_SYMBOLS[commodityName];
    if (!symbols) return null;

    // Using Yahoo Finance API proxy
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbols.yahoo}?range=1d&interval=1d`
    );
    
    if (!response.ok) throw new Error(`Yahoo API error: ${response.status}`);
    
    const data = await response.json();
    if (!data.chart?.result?.[0]?.meta) return null;
    
    const meta = data.chart.result[0].meta;
    const currentPrice = meta.regularMarketPrice;
    const previousClose = meta.previousClose;
    
    if (!currentPrice || !previousClose) return null;
    
    const change = currentPrice - previousClose;
    const changePercent = (change / previousClose) * 100;
    
    return {
      symbol: symbols.yahoo,
      price: currentPrice,
      change: change,
      changePercent: changePercent,
      lastUpdate: new Date().toISOString()
    };
  }

  private async fetchPriceFromAlphaVantage(commodityName: string): Promise<CommodityPrice | null> {
    const symbols = COMMODITY_SYMBOLS[commodityName];
    if (!symbols) return null;

    const apiKey = getAlphaVantageApiKey();
    
    // For commodities, use COMMODITY_INTRADAY function
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbols.alphaVantage}&apikey=${apiKey}`
    );
    
    if (!response.ok) throw new Error(`Alpha Vantage API error: ${response.status}`);
    
    const data = await response.json();
    if (!data['Global Quote']) return null;
    
    const quote = data['Global Quote'];
    const price = parseFloat(quote['05. price']);
    const change = parseFloat(quote['09. change']);
    const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));
    
    if (isNaN(price)) return null;
    
    return {
      symbol: symbols.alphaVantage,
      price: price,
      change: change || 0,
      changePercent: changePercent || 0,
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
      // Fetch news from multiple sources in parallel
      const newsPromises = [
        fetchNewsFromFMP(commodityName),
        fetchNewsFromNewsAPI(commodityName),
        fetchNewsFromAlphaVantage(commodityName)
      ];

      const newsResults = await Promise.allSettled(newsPromises);
      
      // Combine all successful results
      let allNews: NewsItem[] = [];
      newsResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && Array.isArray(result.value)) {
          allNews = [...allNews, ...result.value];
        } else {
          console.warn(`News source ${index + 1} failed:`, result.status === 'rejected' ? result.reason : 'Unknown error');
        }
      });

      // Remove duplicates based on title similarity
      const uniqueNews = removeDuplicateNews(allNews);
      
      // Sort by relevance and recency
      const sortedNews = sortNewsByRelevance(uniqueNews, commodityName);
      
      // Take the most relevant articles up to the limit
      const finalNews = sortedNews.slice(0, limit);
      
      // If we don't have enough relevant news, add fallback news
      const result = finalNews.length > 0 ? finalNews : getFallbackNews(commodityName).slice(0, limit);
      
      this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
      
    } catch (error) {
      console.error(`Error fetching news for ${commodityName}:`, error);
      return getFallbackNews(commodityName);
    }
  }

  async fetchHistoricalData(commodityName: string, timeframe: string = '1M'): Promise<any[]> {
    const cacheKey = `historical_${commodityName}_${timeframe}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    console.log(`Fetching real historical data for ${commodityName} (${timeframe})`);
    
    // Try multiple APIs in sequence for historical data
    const apis = [
      () => this.fetchHistoricalFromFMP(commodityName, timeframe),
      () => this.fetchHistoricalFromYahoo(commodityName, timeframe),
      () => this.fetchHistoricalFromAlphaVantage(commodityName, timeframe)
    ];

    for (const fetchApi of apis) {
      try {
        const data = await fetchApi();
        if (data && data.length > 0) {
          console.log(`Successfully fetched ${data.length} historical data points for ${commodityName}`);
          this.cache.set(cacheKey, { data: data, timestamp: Date.now() });
          return data;
        }
      } catch (error) {
        console.warn(`Historical API failed for ${commodityName}:`, error);
        continue;
      }
    }

    console.warn(`All historical APIs failed for ${commodityName}, generating fallback data`);
    
    // Generate fallback historical data
    const basePrice = getBasePriceForCommodity(commodityName);
    const fallbackData = generateFallbackHistoricalData(commodityName, timeframe, basePrice);
    
    this.cache.set(cacheKey, { data: fallbackData, timestamp: Date.now() });
    return fallbackData;
  }

  private async fetchHistoricalFromFMP(commodityName: string, timeframe: string): Promise<any[]> {
    const symbols = COMMODITY_SYMBOLS[commodityName];
    if (!symbols) return [];

    const apiKey = getFmpApiKey();
    let endpoint = '';
    let dataLimit = this.getTimeframeDays(timeframe);
    
    if (timeframe === '1d') {
      endpoint = `https://financialmodelingprep.com/api/v3/historical-chart/15min/${symbols.fmp}?apikey=${apiKey}`;
    } else {
      endpoint = `https://financialmodelingprep.com/api/v3/historical-price-full/${symbols.fmp}?apikey=${apiKey}&timeseries=${dataLimit}`;
    }
    
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error(`FMP API error: ${response.status}`);
    
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    
    let historicalData: any[] = [];
    
    if (timeframe === '1d') {
      if (!Array.isArray(data) || data.length === 0) return [];
      
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      historicalData = data
        .filter((item: any) => {
          const itemDate = new Date(item.date);
          return itemDate >= oneDayAgo;
        })
        .slice(0, 96)
        .map((item: any) => ({
          date: item.date,
          price: parseFloat(item.close) || parseFloat(item.price) || 0
        }))
        .reverse()
        .filter((item: any) => item.price > 0);
    } else {
      if (!data.historical || !Array.isArray(data.historical)) return [];
      
      historicalData = data.historical
        .slice(0, dataLimit)
        .map((item: any) => ({
          date: item.date,
          price: parseFloat(item.close) || parseFloat(item.price) || 0
        }))
        .reverse()
        .filter((item: any) => item.price > 0);
    }
    
    return historicalData;
  }

  private async fetchHistoricalFromYahoo(commodityName: string, timeframe: string): Promise<any[]> {
    const symbols = COMMODITY_SYMBOLS[commodityName];
    if (!symbols) return [];

    let period = '1mo';
    let interval = '1d';
    
    if (timeframe === '1d') {
      period = '1d';
      interval = '15m';
    } else if (timeframe === '7d') {
      period = '7d';
      interval = '1d';
    } else if (timeframe === '1m') {
      period = '1mo';
      interval = '1d';
    } else if (timeframe === '3m') {
      period = '3mo';
      interval = '1d';
    } else if (timeframe === '6m') {
      period = '6mo';
      interval = '1d';
    }
    
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbols.yahoo}?range=${period}&interval=${interval}`
    );
    
    if (!response.ok) throw new Error(`Yahoo API error: ${response.status}`);
    
    const data = await response.json();
    if (!data.chart?.result?.[0]) return [];
    
    const result = data.chart.result[0];
    const timestamps = result.timestamp;
    const prices = result.indicators.quote[0].close;
    
    if (!timestamps || !prices) return [];
    
    const historicalData = timestamps.map((timestamp: number, index: number) => ({
      date: new Date(timestamp * 1000).toISOString(),
      price: prices[index] || 0
    })).filter((item: any) => item.price > 0);
    
    return historicalData;
  }

  private async fetchHistoricalFromAlphaVantage(commodityName: string, timeframe: string): Promise<any[]> {
    const symbols = COMMODITY_SYMBOLS[commodityName];
    if (!symbols) return [];

    const apiKey = getAlphaVantageApiKey();
    let functionName = 'TIME_SERIES_DAILY';
    let seriesKey = 'Time Series (Daily)';
    
    if (timeframe === '1d') {
      functionName = 'TIME_SERIES_INTRADAY';
      seriesKey = 'Time Series (15min)';
    }
    
    let url = `https://www.alphavantage.co/query?function=${functionName}&symbol=${symbols.alphaVantage}&apikey=${apiKey}`;
    
    if (timeframe === '1d') {
      url += '&interval=15min';
    }
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Alpha Vantage API error: ${response.status}`);
    
    const data = await response.json();
    if (!data[seriesKey]) return [];
    
    const timeSeries = data[seriesKey];
    const historicalData = Object.entries(timeSeries)
      .map(([date, values]: [string, any]) => ({
        date: timeframe === '1d' ? new Date(date).toISOString() : date,
        price: parseFloat(values['4. close']) || 0
      }))
      .filter((item: any) => item.price > 0)
      .reverse();
    
    return historicalData;
  }

  private getTimeframeDays(timeframe: string): number {
    switch (timeframe) {
      case '1d': return 1;
      case '7d': return 7;
      case '1m': return 30;
      case '3m': return 90;
      case '6m': return 180;
      default: return 30;
    }
  }
}

export const commodityApi = CommodityApiService.getInstance();
