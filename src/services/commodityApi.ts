// Commodity price API service
import { 
  fetchNewsFromFMP, 
  fetchNewsFromMarketaux,
  removeDuplicateNews,
  sortNewsByRelevance,
  getFallbackNews
} from './newsHelpers';

const getFmpApiKey = () => localStorage.getItem('fmpApiKey') || 'demo';

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

// Updated commodity symbol mappings using exact names from FMP API
const COMMODITY_SYMBOLS: Record<string, {
  fmp: string;
  yahoo: string;
  alphaVantage: string;
  quandl?: string;
}> = {
  // Metals
  'Gold Futures': { fmp: 'GCUSD', yahoo: 'GC=F', alphaVantage: 'GOLD', quandl: 'LBMA/GOLD' },
  'Micro Gold Futures': { fmp: 'MGCUSD', yahoo: 'MGC=F', alphaVantage: 'GOLD' },
  'Silver Futures': { fmp: 'SIUSD', yahoo: 'SI=F', alphaVantage: 'SILVER', quandl: 'LBMA/SILVER' },
  'Micro Silver Futures': { fmp: 'MSIUSD', yahoo: 'SIL=F', alphaVantage: 'SILVER' },
  'Copper': { fmp: 'HGUSD', yahoo: 'HG=F', alphaVantage: 'COPPER' },
  'Platinum': { fmp: 'PLUSD', yahoo: 'PL=F', alphaVantage: 'PLATINUM' },
  'Palladium': { fmp: 'PAUSD', yahoo: 'PA=F', alphaVantage: 'PALLADIUM' },
  
  // Energy
  'Brent Crude Oil': { fmp: 'BZUSD', yahoo: 'BZ=F', alphaVantage: 'BRENT' },
  'Crude Oil': { fmp: 'CLUSD', yahoo: 'CL=F', alphaVantage: 'WTI' },
  'Natural Gas': { fmp: 'NGUSD', yahoo: 'NG=F', alphaVantage: 'NATURAL_GAS' },
  'Heating Oil': { fmp: 'HOUSD', yahoo: 'HO=F', alphaVantage: 'HEATING_OIL' },
  'Gasoline RBOB': { fmp: 'RBUSD', yahoo: 'RB=F', alphaVantage: 'GASOLINE' },
  
  // Grains
  'Corn Futures': { fmp: 'ZCUSX', yahoo: 'ZC=F', alphaVantage: 'CORN' },
  'Wheat Futures': { fmp: 'ZWUSX', yahoo: 'ZW=F', alphaVantage: 'WHEAT' },
  'Soybean Futures': { fmp: 'ZSUSX', yahoo: 'ZS=F', alphaVantage: 'SOYBEANS' },
  'Soybean Meal Futures': { fmp: 'ZMUSD', yahoo: 'ZM=F', alphaVantage: 'SOYBEAN_MEAL' },
  'Soybean Oil Futures': { fmp: 'ZLUSX', yahoo: 'ZL=F', alphaVantage: 'SOYBEAN_OIL' },
  
  // Livestock
  'Live Cattle Futures': { fmp: 'LEUSX', yahoo: 'LE=F', alphaVantage: 'LIVE_CATTLE' },
  'Feeder Cattle Futures': { fmp: 'FCUSX', yahoo: 'GF=F', alphaVantage: 'FEEDER_CATTLE' },
  'Lean Hogs Futures': { fmp: 'HEUSX', yahoo: 'HE=F', alphaVantage: 'LEAN_HOGS' },
  'Class III Milk Futures': { fmp: 'DCUSD', yahoo: 'DC=F', alphaVantage: 'MILK' },
  
  // Softs
  'Cocoa Futures': { fmp: 'CCUSD', yahoo: 'CC=F', alphaVantage: 'COCOA' },
  'Coffee Futures': { fmp: 'KCUSD', yahoo: 'KC=F', alphaVantage: 'COFFEE' },
  'Cotton Futures': { fmp: 'CTUSD', yahoo: 'CT=F', alphaVantage: 'COTTON' },
  'Lumber Futures': { fmp: 'LBUSD', yahoo: 'LBS=F', alphaVantage: 'LUMBER' },
  'Orange Juice Futures': { fmp: 'OJUSD', yahoo: 'OJ=F', alphaVantage: 'ORANGE_JUICE' },
  'Sugar Futures': { fmp: 'SBUSD', yahoo: 'SB=F', alphaVantage: 'SUGAR' },
  
  // Other/Financial
  'US Dollar': { fmp: 'DXUSD', yahoo: 'DX-Y.NYB', alphaVantage: 'USD' },
  'Micro E-mini Russell 2000 Index Futures': { fmp: 'RTYUSD', yahoo: 'RTY=F', alphaVantage: 'RTY' },
  'Mini Dow Jones Industrial Average Index': { fmp: 'YMUSD', yahoo: 'YM=F', alphaVantage: 'YM' },
  '30 Day Fed Fund Futures': { fmp: 'ZQUSD', yahoo: 'ZQ=F', alphaVantage: 'FF' },
  'Five-Year US Treasury Note': { fmp: 'ZFUSD', yahoo: 'ZF=F', alphaVantage: 'FVX' },
  '2-Year T-Note Futures': { fmp: 'ZTUSD', yahoo: 'ZT=F', alphaVantage: 'TNX' }
};

// Generate fallback historical data with realistic price movements
const generateFallbackHistoricalData = (commodityName: string, timeframe: string, basePrice: number): any[] => {
  const dataPoints = timeframe === '1d' ? 24 : timeframe === '7d' ? 7 : timeframe === '1m' ? 30 : timeframe === '3m' ? 90 : 180;
  const data: any[] = [];
  const now = new Date();
  
  // Generate realistic price movements with trending behavior
  let currentPrice = basePrice;
  const volatility = basePrice * (timeframe === '1d' ? 0.015 : timeframe === '1m' ? 0.03 : 0.05); // Higher volatility for longer timeframes
  
  // Add a subtle trend component (random walk with drift)
  const trendDirection = Math.random() > 0.5 ? 1 : -1;
  const trendStrength = 0.0005; // Very subtle trend per data point
  
  for (let i = dataPoints - 1; i >= 0; i--) {
    let date: Date;
    
    if (timeframe === '1d') {
      // For daily chart, generate hourly data
      date = new Date(now.getTime() - (i * 60 * 60 * 1000));
    } else {
      // For other timeframes, generate daily data
      date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
    }
    
    // Generate more realistic price movement with trend and mean reversion
    const randomChange = (Math.random() - 0.5) * volatility * 2;
    const trendComponent = trendDirection * trendStrength * basePrice * (dataPoints - i);
    const meanReversionComponent = (basePrice - currentPrice) * 0.01; // 1% pull back to base price
    
    currentPrice += randomChange + trendComponent + meanReversionComponent;
    
    // Ensure price doesn't deviate too much from base price (within ±30%)
    const minPrice = basePrice * 0.7;
    const maxPrice = basePrice * 1.3;
    currentPrice = Math.max(minPrice, Math.min(maxPrice, currentPrice));
    
    data.push({
      date: date.toISOString(),
      price: Math.round(currentPrice * 100) / 100
    });
  }
  
  return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

// Get base price for fallback data - updated to match FMP commodity names
const getBasePriceForCommodity = (commodityName: string): number => {
  const basePrices: Record<string, number> = {
    // Metals
    'Gold Futures': 2000,
    'Micro Gold Futures': 2000,
    'Silver Futures': 25,
    'Micro Silver Futures': 25,
    'Copper': 4.2,
    'Platinum': 950,
    'Palladium': 1800,
    
    // Energy
    'Crude Oil': 65,
    'Brent Crude Oil': 67,
    'Natural Gas': 2.85,
    'Gasoline RBOB': 2.1,
    'Heating Oil': 2.3,
    
    // Grains
    'Corn Futures': 430,
    'Wheat Futures': 550,
    'Soybean Futures': 1150,
    'Soybean Meal Futures': 350,
    'Soybean Oil Futures': 45,
    
    // Livestock
    'Live Cattle Futures': 170,
    'Feeder Cattle Futures': 240,
    'Lean Hogs Futures': 75,
    
    // Softs
    'Cocoa Futures': 2800,
    'Coffee Futures': 180,
    'Cotton Futures': 75,
    'Lumber Futures': 450,
    'Orange Juice Futures': 120,
    'Sugar Futures': 19,
    
    // Other commodities from FMP API
    'Class III Milk Futures': 18,
    'Micro E-mini Russell 2000 Index Futures': 2200,
    'US Dollar': 96,
    '30 Day Fed Fund Futures': 95,
    'Five-Year US Treasury Note': 109,
    '2-Year T-Note Futures': 104,
    'Mini Dow Jones Industrial Average Index': 44000
  };
  
  return basePrices[commodityName] || 100;
};

// Category mappings for FMP commodities
const categorizeCommodity = (symbol: string, name: string): string => {
  const upperSymbol = symbol.toUpperCase();
  const upperName = name.toUpperCase();
  
  // Energy commodities
  if (upperSymbol.includes('OIL') || upperSymbol.includes('WTI') || upperSymbol.includes('BRENT') || 
      upperSymbol.includes('GAS') || upperSymbol.includes('GASOLINE') || upperSymbol.includes('HEATING') ||
      upperName.includes('CRUDE') || upperName.includes('GAS') || upperName.includes('OIL')) {
    return 'energy';
  }
  
  // Metals
  if (upperSymbol.includes('XAU') || upperSymbol.includes('XAG') || upperSymbol.includes('XCU') || 
      upperSymbol.includes('XPT') || upperSymbol.includes('XPD') || upperSymbol.includes('GOLD') || 
      upperSymbol.includes('SILVER') || upperSymbol.includes('COPPER') || upperSymbol.includes('PLATINUM') ||
      upperName.includes('GOLD') || upperName.includes('SILVER') || upperName.includes('COPPER') || 
      upperName.includes('PLATINUM') || upperName.includes('PALLADIUM')) {
    return 'metals';
  }
  
  // Grains/Agricultural
  if (upperSymbol.includes('CORN') || upperSymbol.includes('WHEAT') || upperSymbol.includes('SOYBEAN') ||
      upperSymbol.includes('RICE') || upperSymbol.includes('OATS') ||
      upperName.includes('CORN') || upperName.includes('WHEAT') || upperName.includes('SOYBEAN') ||
      upperName.includes('RICE') || upperName.includes('OATS')) {
    return 'grains';
  }
  
  // Livestock
  if (upperSymbol.includes('CATTLE') || upperSymbol.includes('HOGS') || upperSymbol.includes('PORK') ||
      upperName.includes('CATTLE') || upperName.includes('HOGS') || upperName.includes('PORK')) {
    return 'livestock';
  }
  
  // Softs
  if (upperSymbol.includes('COCOA') || upperSymbol.includes('COFFEE') || upperSymbol.includes('COTTON') ||
      upperSymbol.includes('SUGAR') || upperSymbol.includes('LUMBER') || upperSymbol.includes('ORANGE') ||
      upperName.includes('COCOA') || upperName.includes('COFFEE') || upperName.includes('COTTON') ||
      upperName.includes('SUGAR') || upperName.includes('LUMBER') || upperName.includes('ORANGE')) {
    return 'softs';
  }
  
  return 'other';
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

  async fetchAvailableCommodities(): Promise<CommodityInfo[]> {
    const cacheKey = 'available_commodities';
    const cached = this.cache.get(cacheKey);
    
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    console.log('Fetching available commodities from FMP API');
    
    try {
      const apiKey = getFmpApiKey();
      const response = await fetch(
        `https://financialmodelingprep.com/api/v3/quotes/commodity?apikey=${apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`FMP API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format from FMP API');
      }
      
      const commodities: CommodityInfo[] = data.map((item: any) => ({
        symbol: item.symbol || '',
        name: item.name || item.symbol || '',
        price: parseFloat(item.price) || 0,
        change: parseFloat(item.change) || 0,
        changePercent: parseFloat(item.changesPercentage) || 0,
        category: categorizeCommodity(item.symbol || '', item.name || '')
      })).filter(item => item.symbol && item.name);
      
      console.log(`Found ${commodities.length} commodities from FMP API`);
      
      this.cache.set(cacheKey, { data: commodities, timestamp: Date.now() });
      return commodities;
      
    } catch (error) {
      console.error('Error fetching commodities from FMP:', error);
      
      // Return fallback data based on our existing mappings
      const fallbackCommodities: CommodityInfo[] = Object.entries(COMMODITY_SYMBOLS).map(([name, symbols]) => ({
        symbol: symbols.fmp,
        name,
        price: getBasePriceForCommodity(name),
        change: (Math.random() - 0.5) * 10,
        changePercent: (Math.random() - 0.5) * 4,
        category: categorizeCommodity(symbols.fmp, name)
      }));
      
      this.cache.set(cacheKey, { data: fallbackCommodities, timestamp: Date.now() });
      return fallbackCommodities;
    }
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
      () => this.fetchPriceFromYahoo(commodityName)
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

  async fetchCommodityNews(commodityName: string, limit: number = 5): Promise<NewsItem[]> {
    const cacheKey = `news_${commodityName}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    try {
      // Fetch news from 2 primary sources in parallel
      const newsPromises = [
        fetchNewsFromFMP(commodityName),
        fetchNewsFromMarketaux(commodityName)
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
      () => this.fetchHistoricalFromYahoo(commodityName, timeframe)
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
    const dataLimit = this.getTimeframeDays(timeframe);
    
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
