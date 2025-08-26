import { CommodityData } from './types.ts';
import { EdgeLogger, retryWithBackoff, getCachedData, setCachedData } from './utils.ts';
import { COMMODITY_PRICE_API_SYMBOLS, getCommodityByApiSymbol } from './commodity-mappings.ts';

// API client interfaces
export interface ApiClient {
  fetchCommodities(): Promise<CommodityData[]>;
  fetchCommodityPrice(symbol: string): Promise<CommodityData | null>;
}

// Financial Modeling Prep API Client
export class FMPApiClient implements ApiClient {
  private apiKey: string;
  private baseUrl = 'https://financialmodelingprep.com/api/v3';
  private logger: EdgeLogger;

  constructor(apiKey: string, logger: EdgeLogger) {
    this.apiKey = apiKey;
    this.logger = logger;
  }

  async fetchCommodities(): Promise<CommodityData[]> {
    const cacheKey = 'fmp-commodities';
    const cached = getCachedData<CommodityData[]>(cacheKey);
    
    if (cached) {
      this.logger.info('Returning cached FMP data');
      return cached;
    }

    try {
      const response = await retryWithBackoff(async () => {
        const url = `${this.baseUrl}/quotes/commodity?apikey=${this.apiKey}`;
        const res = await fetch(url);
        
        if (!res.ok) {
          throw new Error(`FMP API error: ${res.status} ${res.statusText}`);
        }
        
        return res.json();
      });

      const commodities = this.transformFMPData(response);
      setCachedData(cacheKey, commodities, 300000); // 5 minutes
      
      this.logger.info(`Fetched ${commodities.length} commodities from FMP`);
      return commodities;
    } catch (error) {
      this.logger.error('Failed to fetch from FMP API', error);
      throw error;
    }
  }

  async fetchCommodityPrice(symbol: string): Promise<CommodityData | null> {
    try {
      const response = await retryWithBackoff(async () => {
        const url = `${this.baseUrl}/quote/${symbol}?apikey=${this.apiKey}`;
        const res = await fetch(url);
        
        if (!res.ok) {
          throw new Error(`FMP API error: ${res.status} ${res.statusText}`);
        }
        
        return res.json();
      });

      if (!response || response.length === 0) {
        return null;
      }

      return this.transformFMPSingleData(response[0]);
    } catch (error) {
      this.logger.error(`Failed to fetch ${symbol} from FMP API`, error);
      return null;
    }
  }

  private transformFMPData(data: any[]): CommodityData[] {
    if (!Array.isArray(data)) return [];

    return data
      .map(item => this.transformFMPSingleData(item))
      .filter(Boolean) as CommodityData[];
  }

  private transformFMPSingleData(item: any): CommodityData | null {
    if (!item || typeof item !== 'object') return null;

    try {
      return {
        name: item.name || item.symbol,
        symbol: item.symbol,
        price: parseFloat(item.price) || 0,
        change: parseFloat(item.change) || 0,
        changePercent: parseFloat(item.changesPercentage) || 0,
        volume: item.volume ? parseInt(item.volume) : undefined,
        lastUpdate: new Date().toISOString(),
        category: this.inferCategory(item.name || item.symbol),
      };
    } catch (error) {
      this.logger.warn('Failed to transform FMP data item', { item, error });
      return null;
    }
  }

  private inferCategory(name: string): string {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('oil') || nameLower.includes('gas') || nameLower.includes('energy')) {
      return 'energy';
    }
    if (nameLower.includes('gold') || nameLower.includes('silver') || nameLower.includes('metal')) {
      return 'metals';
    }
    if (nameLower.includes('corn') || nameLower.includes('wheat') || nameLower.includes('grain')) {
      return 'grains';
    }
    if (nameLower.includes('cattle') || nameLower.includes('hog')) {
      return 'livestock';
    }
    if (nameLower.includes('coffee') || nameLower.includes('sugar') || nameLower.includes('cotton')) {
      return 'softs';
    }
    return 'other';
  }
}

// CommodityPriceAPI Client
export class CommodityPriceApiClient implements ApiClient {
  private apiKey: string;
  private baseUrl = 'https://api.commodityprice.com/api/v1';
  private logger: EdgeLogger;

  constructor(apiKey: string, logger: EdgeLogger) {
    this.apiKey = apiKey;
    this.logger = logger;
  }

  async fetchCommodities(): Promise<CommodityData[]> {
    const cacheKey = 'commodity-price-api-data';
    const cached = getCachedData<CommodityData[]>(cacheKey);
    
    if (cached) {
      this.logger.info('Returning cached CommodityPriceAPI data');
      return cached;
    }

    try {
      const allCommodities: CommodityData[] = [];
      const symbols = Object.keys(COMMODITY_PRICE_API_SYMBOLS);
      
      // Fetch in batches to avoid rate limits
      const batchSize = 10;
      for (let i = 0; i < symbols.length; i += batchSize) {
        const batch = symbols.slice(i, i + batchSize);
        const batchPromises = batch.map(symbol => this.fetchSingleCommodity(symbol));
        const batchResults = await Promise.allSettled(batchPromises);
        
        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value) {
            allCommodities.push(result.value);
          } else if (result.status === 'rejected') {
            this.logger.warn(`Failed to fetch ${batch[index]}`, result.reason);
          }
        });

        // Rate limiting delay
        if (i + batchSize < symbols.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      setCachedData(cacheKey, allCommodities, 300000); // 5 minutes
      this.logger.info(`Fetched ${allCommodities.length} commodities from CommodityPriceAPI`);
      return allCommodities;
    } catch (error) {
      this.logger.error('Failed to fetch from CommodityPriceAPI', error);
      throw error;
    }
  }

  async fetchCommodityPrice(symbol: string): Promise<CommodityData | null> {
    return this.fetchSingleCommodity(symbol);
  }

  private async fetchSingleCommodity(apiSymbol: string): Promise<CommodityData | null> {
    try {
      const cacheKey = `commodity-${apiSymbol}`;
      const cached = getCachedData<CommodityData>(cacheKey);
      
      if (cached) {
        return cached;
      }

      const response = await retryWithBackoff(async () => {
        const url = `${this.baseUrl}/commodities/${apiSymbol}?access_key=${this.apiKey}`;
        const res = await fetch(url);
        
        if (!res.ok) {
          if (res.status === 404) {
            return null; // Commodity not found
          }
          throw new Error(`CommodityPriceAPI error: ${res.status} ${res.statusText}`);
        }
        
        return res.json();
      });

      if (!response || !response.data) {
        return null;
      }

      const commodityData = this.transformCommodityPriceData(response.data, apiSymbol);
      if (commodityData) {
        setCachedData(cacheKey, commodityData, 300000); // 5 minutes
      }
      
      return commodityData;
    } catch (error) {
      this.logger.error(`Failed to fetch ${apiSymbol} from CommodityPriceAPI`, error);
      return null;
    }
  }

  private transformCommodityPriceData(data: any, apiSymbol: string): CommodityData | null {
    if (!data || typeof data !== 'object') return null;

    try {
      const commodityName = getCommodityByApiSymbol(apiSymbol);
      if (!commodityName) {
        this.logger.warn(`Unknown commodity for API symbol: ${apiSymbol}`);
        return null;
      }

      const price = parseFloat(data.price || data.value) || 0;
      const previousPrice = parseFloat(data.prev_price || data.previous_close) || price;
      const change = price - previousPrice;
      const changePercent = previousPrice !== 0 ? (change / previousPrice) * 100 : 0;

      return {
        name: commodityName,
        symbol: apiSymbol,
        price,
        change,
        changePercent,
        lastUpdate: data.date || new Date().toISOString(),
        category: this.getCategoryFromSymbol(apiSymbol),
      };
    } catch (error) {
      this.logger.warn('Failed to transform CommodityPriceAPI data', { data, apiSymbol, error });
      return null;
    }
  }

  private getCategoryFromSymbol(apiSymbol: string): string {
    // Energy symbols
    if (['WTIOIL', 'BRENTOIL', 'NG', 'HO', 'RB', 'COAL', 'UXA'].includes(apiSymbol)) {
      return 'energy';
    }
    // Precious metals
    if (['XAU', 'XAG', 'XPT', 'XPD'].includes(apiSymbol)) {
      return 'metals';
    }
    // Base metals
    if (['HG', 'ALU', 'ZNC', 'LEAD', 'NICKEL'].includes(apiSymbol)) {
      return 'metals';
    }
    // Grains
    if (['CORN', 'WHEAT', 'SOYBEAN', 'OATS', 'RICE'].includes(apiSymbol)) {
      return 'grains';
    }
    // Livestock
    if (['CATTLE', 'FCATTLE', 'HOGS'].includes(apiSymbol)) {
      return 'livestock';
    }
    // Softs
    if (['COFFEE', 'SUGAR', 'COTTON', 'COCOA', 'OJ'].includes(apiSymbol)) {
      return 'softs';
    }
    return 'other';
  }
}

// Multi-source data aggregator
export class CommodityDataAggregator {
  private clients: ApiClient[];
  private logger: EdgeLogger;

  constructor(clients: ApiClient[], logger: EdgeLogger) {
    this.clients = clients;
    this.logger = logger;
  }

  async fetchAllCommodities(): Promise<CommodityData[]> {
    const allData: CommodityData[] = [];
    const seenCommodities = new Set<string>();

    for (const client of this.clients) {
      try {
        const data = await client.fetchCommodities();
        
        // Deduplicate by commodity name, preferring newer data
        for (const commodity of data) {
          if (!seenCommodities.has(commodity.name)) {
            allData.push(commodity);
            seenCommodities.add(commodity.name);
          }
        }
      } catch (error) {
        this.logger.warn('Client failed to fetch data', error);
        // Continue with other clients
      }
    }

    this.logger.info(`Aggregated ${allData.length} unique commodities from ${this.clients.length} sources`);
    return allData;
  }

  async fetchCommodityPrice(commodityName: string, symbol: string): Promise<CommodityData | null> {
    for (const client of this.clients) {
      try {
        const data = await client.fetchCommodityPrice(symbol);
        if (data) {
          return data;
        }
      } catch (error) {
        this.logger.warn(`Client failed to fetch ${commodityName}`, error);
        // Continue with next client
      }
    }

    this.logger.warn(`No client could fetch data for ${commodityName}`);
    return null;
  }
}