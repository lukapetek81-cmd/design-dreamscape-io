// Commodity price API service
const getFmpApiKey = () => localStorage.getItem('fmpApiKey') || 'demo';
const getNewsApiKey = () => localStorage.getItem('newsApiKey') || '';
const getAlphaVantageApiKey = () => localStorage.getItem('alphaVantageApiKey') || '';

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

// Updated commodity symbol mappings for Financial Modeling Prep API
const COMMODITY_SYMBOLS: Record<string, string> = {
  'Gold': 'GCUSD',
  'Silver': 'SIUSD', 
  'Copper': 'HGUSD',
  'Platinum': 'PLUSD',
  'Palladium': 'PAUSD',
  'WTI Crude': 'CLUSD',
  'Brent Crude': 'BZUSD',
  'Natural Gas': 'NGUSD',
  'RBOB Gasoline': 'RBUSD',
  'Heating Oil': 'HOUSD',
  'Corn': 'CORNUSD',
  'Wheat': 'WHEATUSD',
  'Soybeans': 'SOYBNUSD',
  'Soybean Meal': 'SOYBNUSD',
  'Soybean Oil': 'SOYBNUSD',
  'Oats': 'CORNUSD',
  'Rough Rice': 'WHEATUSD',
  'Feeder Cattle': 'LCUSD',
  'Live Cattle': 'LCUSD',
  'Lean Hogs': 'LHUSD',
  'Cocoa': 'CCUSD',
  'Coffee': 'KCUSD',
  'Cotton': 'CTUSD',
  'Lumber': 'LBUSD',
  'Orange Juice': 'OJUSD',
  'Sugar': 'SBUSD'
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
      const apiKey = getFmpApiKey();
      
      // Use Financial Modeling Prep API for commodity quotes
      const response = await fetch(
        `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error || !Array.isArray(data) || data.length === 0) {
        console.warn('Financial Modeling Prep API error or no data:', data);
        return this.getFallbackPrice(commodityName);
      }
      
      const quote = data[0];
      if (!quote) {
        return this.getFallbackPrice(commodityName);
      }
      
      const price: CommodityPrice = {
        symbol: symbol,
        price: parseFloat(quote.price) || 0,
        change: parseFloat(quote.change) || 0,
        changePercent: parseFloat(quote.changesPercentage) || 0,
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
      'Rough Rice': { price: 15.85, change: 0.32 },
      'Feeder Cattle': { price: 245.50, change: 0.85 },
      'Live Cattle': { price: 152.75, change: -0.25 },
      'Lean Hogs': { price: 72.40, change: 1.15 },
      'Cocoa': { price: 3125.00, change: 2.15 },
      'Coffee': { price: 165.40, change: -1.25 },
      'Cotton': { price: 68.75, change: 0.45 },
      'Lumber': { price: 445.20, change: -2.35 },
      'Orange Juice': { price: 385.50, change: 1.85 },
      'Sugar': { price: 19.65, change: 0.75 }
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
      // Fetch news from multiple sources in parallel
      const newsPromises = [
        this.fetchNewsFromFMP(commodityName),
        this.fetchNewsFromNewsAPI(commodityName),
        this.fetchNewsFromAlphaVantage(commodityName)
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
      const uniqueNews = this.removeDuplicateNews(allNews);
      
      // Sort by relevance and recency
      const sortedNews = this.sortNewsByRelevance(uniqueNews, commodityName);
      
      // Take the most relevant articles up to the limit
      const finalNews = sortedNews.slice(0, limit);
      
      // If we don't have enough relevant news, add fallback news
      const result = finalNews.length > 0 ? finalNews : this.getFallbackNews(commodityName).slice(0, limit);
      
      this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
      
    } catch (error) {
      console.error(`Error fetching news for ${commodityName}:`, error);
      return this.getFallbackNews(commodityName);
    }
  }

  private async fetchNewsFromFMP(commodityName: string): Promise<NewsItem[]> {
    const apiKey = getFmpApiKey();
    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/general_news?page=0&apikey=${apiKey}`
    );
    
    if (!response.ok) throw new Error(`FMP API error: ${response.status}`);
    
    const data = await response.json();
    if (!Array.isArray(data)) return [];
    
    return data
      .filter(article => this.isRelevantTocommodity(article.title, article.text, commodityName))
      .slice(0, 3)
      .map((article: any, index: number) => ({
        id: `fmp_${commodityName}_${index}_${Date.now()}`,
        title: article.title || `${commodityName} Market Update`,
        description: article.text ? article.text.substring(0, 200) + '...' : `Latest market news about ${commodityName}`,
        url: article.url || '#',
        source: article.site || 'Financial News',
        publishedAt: article.publishedDate || new Date().toISOString(),
        urlToImage: article.image
      }));
  }

  private async fetchNewsFromNewsAPI(commodityName: string): Promise<NewsItem[]> {
    const apiKey = getNewsApiKey();
    if (!apiKey) return [];

    const query = this.buildNewsQuery(commodityName);
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&language=en&apiKey=${apiKey}`
    );
    
    if (!response.ok) throw new Error(`NewsAPI error: ${response.status}`);
    
    const data = await response.json();
    if (!data.articles || !Array.isArray(data.articles)) return [];
    
    return data.articles
      .slice(0, 3)
      .map((article: any, index: number) => ({
        id: `newsapi_${commodityName}_${index}_${Date.now()}`,
        title: article.title || `${commodityName} News`,
        description: article.description || `Latest ${commodityName} market developments`,
        url: article.url || '#',
        source: article.source?.name || 'News API',
        publishedAt: article.publishedAt || new Date().toISOString(),
        urlToImage: article.urlToImage
      }));
  }

  private async fetchNewsFromAlphaVantage(commodityName: string): Promise<NewsItem[]> {
    const apiKey = getAlphaVantageApiKey();
    if (!apiKey) return [];

    const topics = this.getCommodityTopics(commodityName);
    const response = await fetch(
      `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=${topics}&apikey=${apiKey}`
    );
    
    if (!response.ok) throw new Error(`Alpha Vantage error: ${response.status}`);
    
    const data = await response.json();
    if (!data.feed || !Array.isArray(data.feed)) return [];
    
    return data.feed
      .filter((article: any) => this.isRelevantTocommodity(article.title, article.summary, commodityName))
      .slice(0, 3)
      .map((article: any, index: number) => ({
        id: `av_${commodityName}_${index}_${Date.now()}`,
        title: article.title || `${commodityName} Analysis`,
        description: article.summary ? article.summary.substring(0, 200) + '...' : `Market analysis for ${commodityName}`,
        url: article.url || '#',
        source: article.source || 'Alpha Vantage',
        publishedAt: article.time_published || new Date().toISOString(),
        urlToImage: article.banner_image
      }));
  }

  private buildNewsQuery(commodityName: string): string {
    const baseQuery = commodityName.toLowerCase();
    const additionalTerms = {
      'Gold': 'gold price precious metals',
      'Silver': 'silver price precious metals',
      'Copper': 'copper price industrial metals',
      'WTI Crude': 'crude oil WTI petroleum',
      'Brent Crude': 'brent crude oil petroleum',
      'Natural Gas': 'natural gas energy',
      'Corn': 'corn agriculture grain',
      'Wheat': 'wheat agriculture grain',
      'Soybeans': 'soybeans agriculture grain'
    };
    
    return additionalTerms[commodityName as keyof typeof additionalTerms] || `${baseQuery} commodity market`;
  }

  private getCommodityTopics(commodityName: string): string {
    const topicMap: Record<string, string> = {
      'Gold': 'economy_macro,energy_transportation',
      'Silver': 'economy_macro,manufacturing',
      'Copper': 'manufacturing,economy_macro',
      'WTI Crude': 'energy_transportation,economy_macro',
      'Brent Crude': 'energy_transportation,economy_macro',
      'Natural Gas': 'energy_transportation,economy_macro',
      'Corn': 'economy_macro',
      'Wheat': 'economy_macro',
      'Soybeans': 'economy_macro'
    };
    
    return topicMap[commodityName] || 'economy_macro';
  }

  private isRelevantTocommodity(title: string, content: string, commodityName: string): boolean {
    const text = `${title} ${content}`.toLowerCase();
    const commodity = commodityName.toLowerCase();
    
    // Direct commodity name match
    if (text.includes(commodity)) return true;
    
    // Related terms for different commodities
    const relatedTerms: Record<string, string[]> = {
      'gold': ['precious metal', 'bullion', 'xau'],
      'silver': ['precious metal', 'bullion', 'xag'],
      'copper': ['industrial metal', 'mining'],
      'wti crude': ['oil', 'petroleum', 'crude', 'wti'],
      'brent crude': ['oil', 'petroleum', 'crude', 'brent'],
      'natural gas': ['lng', 'gas price', 'energy'],
      'corn': ['grain', 'agriculture', 'crop'],
      'wheat': ['grain', 'agriculture', 'crop'],
      'soybeans': ['grain', 'agriculture', 'crop', 'soy']
    };
    
    const terms = relatedTerms[commodity] || [];
    return terms.some(term => text.includes(term)) || 
           text.includes('commodity') || 
           text.includes('market') || 
           text.includes('trading');
  }

  private removeDuplicateNews(news: NewsItem[]): NewsItem[] {
    const seen = new Set<string>();
    return news.filter(item => {
      const key = item.title.toLowerCase().substring(0, 50);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private sortNewsByRelevance(news: NewsItem[], commodityName: string): NewsItem[] {
    return news.sort((a, b) => {
      const aRelevance = this.calculateRelevanceScore(a, commodityName);
      const bRelevance = this.calculateRelevanceScore(b, commodityName);
      
      if (aRelevance !== bRelevance) {
        return bRelevance - aRelevance; // Higher relevance first
      }
      
      // If relevance is equal, sort by date (newer first)
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
  }

  private calculateRelevanceScore(newsItem: NewsItem, commodityName: string): number {
    let score = 0;
    const text = `${newsItem.title} ${newsItem.description}`.toLowerCase();
    const commodity = commodityName.toLowerCase();
    
    // Direct mention in title gets highest score
    if (newsItem.title.toLowerCase().includes(commodity)) score += 10;
    
    // Direct mention in description
    if (newsItem.description.toLowerCase().includes(commodity)) score += 5;
    
    // Related terms
    if (text.includes('price')) score += 3;
    if (text.includes('market')) score += 2;
    if (text.includes('trading')) score += 2;
    if (text.includes('commodity')) score += 3;
    
    // Recency bonus (articles from last 7 days get bonus)
    const daysSincePublished = (Date.now() - new Date(newsItem.publishedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSincePublished <= 7) score += 2;
    
    return score;
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
      const apiKey = getFmpApiKey();
      
      console.log(`Fetching historical data for ${commodityName} (${symbol}) with timeframe ${timeframe}`);
      
      // Use different FMP endpoints based on timeframe for better accuracy
      let endpoint = '';
      let dataLimit = this.getTimeframeDays(timeframe);
      
      if (timeframe === '7d' || timeframe === '1m') {
        // Use daily historical data for short timeframes
        endpoint = `https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?apikey=${apiKey}&timeseries=${dataLimit}`;
      } else {
        // Use daily historical data for longer timeframes
        endpoint = `https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?apikey=${apiKey}&timeseries=${dataLimit}`;
      }
      
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        console.error(`FMP API error: ${response.status} ${response.statusText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`FMP API response for ${commodityName}:`, data);
      
      if (data.error) {
        console.error('FMP API returned error:', data.error);
        throw new Error(data.error);
      }
      
      if (!data.historical || !Array.isArray(data.historical)) {
        console.warn('No historical data found, using fallback');
        return this.generateMockHistoricalData(commodityName, timeframe);
      }
      
      // Process the historical data
      const historicalData = data.historical
        .slice(0, dataLimit)
        .map((item: any) => ({
          date: item.date,
          price: parseFloat(item.close) || parseFloat(item.price) || 0
        }))
        .reverse() // FMP returns newest first, we want oldest first for chart
        .filter((item: any) => item.price > 0); // Filter out invalid prices
      
      console.log(`Processed ${historicalData.length} data points for ${commodityName}`);
      
      if (historicalData.length === 0) {
        console.warn('No valid historical data after processing, using fallback');
        return this.generateMockHistoricalData(commodityName, timeframe);
      }
      
      this.cache.set(cacheKey, { data: historicalData, timestamp: Date.now() });
      return historicalData;
      
    } catch (error) {
      console.error(`Error fetching historical data for ${commodityName}:`, error);
      return this.generateMockHistoricalData(commodityName, timeframe);
    }
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

  private generateMockHistoricalData(commodityName: string, timeframe: string): any[] {
    console.log(`Generating mock data for ${commodityName} with timeframe ${timeframe}`);
    const days = this.getTimeframeDays(timeframe);
    const basePrice = this.getFallbackPrice(commodityName).price;
    const data = [];
    const now = new Date();
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Create more realistic price movements
      const trend = Math.sin(i / 10) * 0.02; // Small trend component
      const randomChange = (Math.random() - 0.5) * 0.05; // Random component
      const volatility = 1 + trend + randomChange;
      const price = basePrice * volatility;
      
      // Ensure price is positive and realistic
      const finalPrice = Math.max(price, basePrice * 0.8);
      
      data.push({
        date: date.toISOString().split('T')[0],
        price: parseFloat(finalPrice.toFixed(2))
      });
    }
    
    return data;
  }
}

export const commodityApi = CommodityApiService.getInstance();
