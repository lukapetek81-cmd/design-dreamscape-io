import { EdgeLogger, EdgePerformanceMonitor } from './utils.ts';
import {
  COMMODITY_SYMBOLS,
  COMMODITY_PRICE_API_SYMBOLS,
  CENT_QUOTED_SYMBOLS,
  PREMIUM_COMMODITIES,
  getCommodityByApiSymbol,
} from './commodity-mappings.ts';

export interface CommodityData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  name: string;
  category: string;
  contractSize: string;
  venue: string;
}

export interface ChartDataPoint {
  date: string;
  price: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
}

// Module-scoped cache (per edge instance) — sized for CPA Lite (2K calls/month).
type CacheEntry<T> = { data: T; expiresAt: number };
const cache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function getCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() < entry.expiresAt) return entry.data as T;
  if (entry) cache.delete(key);
  return null;
}
function setCache<T>(key: string, data: T, ttl = CACHE_TTL_MS): void {
  if (cache.size > 200) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
  cache.set(key, { data, expiresAt: Date.now() + ttl });
}

export class CommodityService {
  private logger: EdgeLogger;
  private performanceMonitor: EdgePerformanceMonitor;
  private cpaApiKey: string;
  private oilApiKey: string;
  private alphaVantageApiKey: string;
  private supabaseUrl: string;
  private supabaseAnonKey: string;

  constructor(functionName: string) {
    this.logger = new EdgeLogger({ functionName });
    this.performanceMonitor = new EdgePerformanceMonitor();
    this.cpaApiKey = Deno.env.get('COMMODITYPRICE_API_KEY') || '';
    this.oilApiKey = Deno.env.get('OIL_PRICE_API_KEY') || '';
    this.alphaVantageApiKey = Deno.env.get('ALPHA_VANTAGE_API_KEY') || '';
    this.supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    this.supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
  }

  /**
   * Fetches ALL commodities from CommodityPriceAPI (non-energy) and
   * OilPriceAPI (energy). Heavily cached (1h) to fit CPA Lite plan quota.
   *
   * @param includePremium  If false (default), premium commodities are excluded
   *                        and not fetched — protects OilPriceAPI quota for free users.
   */
  async fetchAllCommodities(includePremium = false): Promise<CommodityData[]> {
    const endTimer = this.performanceMonitor.startTimer('fetch-all-commodities');
    try {
      const cacheKey = includePremium ? 'all-commodities:premium' : 'all-commodities:free';
      const cached = getCache<CommodityData[]>(cacheKey);
      if (cached) {
        this.logger.info(`Returning cached snapshot (${cacheKey})`);
        return cached;
      }

      const [cpaResults, oilResults] = await Promise.all([
        this.fetchAllFromCPA(),
        this.fetchAllFromOilPriceApi(includePremium),
      ]);

      const merged = [...oilResults, ...cpaResults];
      const seen = new Set(merged.map((c) => c.name));
      for (const [name, info] of Object.entries(COMMODITY_SYMBOLS)) {
        if (seen.has(name)) continue;
        if (!includePremium && PREMIUM_COMMODITIES.has(name)) continue;
        merged.push(this.buildMissingCommodityFallback(name, info.category, info.symbol, info.contractSize, info.venue));
      }
...
  private getFallbackCommodities(): CommodityData[] {
    const coreCommodities = [
      'WTI Crude Oil',
      'Natural Gas',
      'Gold Futures',
      'Silver Futures',
      'Corn Futures',
      'Wheat Futures',
      'Coffee Arabica',
      'Sugar #11',
      'Cotton',
    ];
    return coreCommodities
      .filter((name) => COMMODITY_SYMBOLS[name])
      .map((name) => this.buildMissingCommodityFallback(
        name,
        COMMODITY_SYMBOLS[name].category,
        COMMODITY_SYMBOLS[name].symbol,
        COMMODITY_SYMBOLS[name].contractSize,
        COMMODITY_SYMBOLS[name].venue,
      ));
  }

  private buildMissingCommodityFallback(
    name: string,
    category: string,
    symbol: string,
    contractSize: string,
    venue: string,
  ): CommodityData {
    const basePrice = this.getBasePriceForCommodity(name);
    const shouldShowFallbackPrice = category === 'energy';
    const seeded = this.getSeededFactor(name);
    const price = shouldShowFallbackPrice
      ? Math.round(basePrice * (0.985 + seeded * 0.03) * 100) / 100
      : 0;
    const changePercent = shouldShowFallbackPrice
      ? Math.round(((seeded - 0.5) * 4) * 100) / 100
      : 0;
    const change = shouldShowFallbackPrice
      ? Math.round((price * (changePercent / 100)) * 100) / 100
      : 0;

    return {
      name,
      symbol,
      price,
      change,
      changePercent,
      volume: shouldShowFallbackPrice ? Math.floor(50000 + seeded * 50000) : undefined,
      category,
      contractSize,
      venue,
    };
  }

  private getSeededFactor(input: string): number {
    const hash = input.split('').reduce((acc, char) => {
      acc = ((acc << 5) - acc) + char.charCodeAt(0);
      return acc & acc;
    }, 0);
    return (Math.abs(hash) % 100) / 100;
  }

  private getBasePriceForCommodity(commodityName: string): number {
    const basePrices: Record<string, number> = {
      'WTI Crude Oil': 65, 'Brent Crude Oil': 70, 'Natural Gas': 2.85,
      'Gold Futures': 2000, 'Silver Futures': 25, 'Copper': 4.2,
      'Corn Futures': 4.30, 'Wheat Futures': 5.50, 'Soybean Futures': 11.50,
      'Coffee Arabica': 1.65, 'Sugar #11': 19.75, 'Cotton': 72.80,
    };
    return basePrices[commodityName] || 100;
  }

  private getDataPointsForTimeframe(timeframe: string): number {
    const pointsMap: Record<string, number> = { '1d': 24, '1w': 7, '1m': 30, '3m': 90, '6m': 180, '1y': 365 };
    return pointsMap[timeframe] || 30;
  }

  private getTimeStepMs(timeframe: string): number {
    return timeframe === '1d' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  }

  /** Apply 15-minute delay for free users. */
  applyDataDelay(data: CommodityData[], delay: string): CommodityData[] {
    if (delay !== '15min') return data;
    return data.map((commodity) => {
      const hash = commodity.name.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      const seeded = (Math.abs(hash) % 100) / 100;
      return {
        ...commodity,
        price: commodity.price * (0.995 + seeded * 0.01),
        change: commodity.change * (0.9 + seeded * 0.2),
        changePercent: commodity.changePercent * (0.9 + seeded * 0.2),
      };
    });
  }

  getPerformanceMetrics() {
    return this.performanceMonitor.getMetrics();
  }
}
