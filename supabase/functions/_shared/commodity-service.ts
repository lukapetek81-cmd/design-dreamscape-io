import { EdgeLogger, EdgePerformanceMonitor } from './utils.ts';
import {
  COMMODITY_SYMBOLS,
  COMMODITY_PRICE_API_SYMBOLS,
  CENT_QUOTED_SYMBOLS,
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
   */
  async fetchAllCommodities(): Promise<CommodityData[]> {
    const endTimer = this.performanceMonitor.startTimer('fetch-all-commodities');
    try {
      const cached = getCache<CommodityData[]>('all-commodities');
      if (cached) {
        this.logger.info('Returning cached all-commodities snapshot');
        return cached;
      }

      const [cpaResults, oilResults] = await Promise.all([
        this.fetchAllFromCPA(),
        this.fetchAllFromOilPriceApi(),
      ]);

      const merged = [...oilResults, ...cpaResults];
      // Fill in any missing commodities with zero-price stubs so the catalog stays stable.
      const seen = new Set(merged.map((c) => c.name));
      for (const [name, info] of Object.entries(COMMODITY_SYMBOLS)) {
        if (!seen.has(name)) {
          merged.push({
            name,
            symbol: info.symbol,
            price: 0,
            change: 0,
            changePercent: 0,
            category: info.category,
            contractSize: info.contractSize,
            venue: info.venue,
          });
        }
      }

      // Only cache if we got real data from BOTH providers — otherwise we'd lock in zeros
      // for an hour after a transient OilPriceAPI rate-limit.
      if (cpaResults.length > 0 && oilResults.length > 0) {
        setCache('all-commodities', merged);
      } else {
        this.logger.warn(`Skipping cache: cpa=${cpaResults.length}, oil=${oilResults.length}`);
      }
      this.logger.info(`Fetched ${merged.length} commodities (cpa=${cpaResults.length}, oil=${oilResults.length})`);
      return merged;
    } catch (error) {
      this.logger.error('Failed to fetch commodities', error);
      return this.getFallbackCommodities();
    } finally {
      endTimer();
    }
  }

  /** Batch-fetches non-energy commodities from CommodityPriceAPI v2. */
  private async fetchAllFromCPA(): Promise<CommodityData[]> {
    if (!this.cpaApiKey) {
      this.logger.warn('No COMMODITYPRICE_API_KEY configured');
      return [];
    }

    const out: CommodityData[] = [];
    const cpaSymbols = Object.values(COMMODITY_PRICE_API_SYMBOLS);
    const batchSize = 5; // Lite plan cap

    for (let i = 0; i < cpaSymbols.length; i += batchSize) {
      const batch = cpaSymbols.slice(i, i + batchSize);
      try {
        const url = `https://api.commoditypriceapi.com/v2/rates/latest?symbols=${encodeURIComponent(batch.join(','))}`;
        const res = await fetch(url, { headers: { 'x-api-key': this.cpaApiKey } });
        if (!res.ok) {
          this.logger.warn(`CPA batch failed ${res.status}: ${(await res.text()).slice(0, 150)}`);
          continue;
        }
        const data = await res.json();
        if (!data?.success || !data.rates) continue;

        for (const cpaSymbol of batch) {
          let rawPrice = data.rates[cpaSymbol];
          if (typeof rawPrice !== 'number') continue;
          if (CENT_QUOTED_SYMBOLS.has(cpaSymbol)) rawPrice = rawPrice / 100;
          const name = getCommodityByApiSymbol(cpaSymbol);
          if (!name) continue;
          const meta = COMMODITY_SYMBOLS[name];
          out.push({
            name,
            symbol: meta?.symbol || cpaSymbol,
            price: rawPrice,
            change: 0,
            changePercent: 0,
            category: meta?.category || 'other',
            contractSize: meta?.contractSize || 'TBD',
            venue: meta?.venue || 'Various',
          });
        }
      } catch (err) {
        this.logger.warn(`CPA batch ${i}-${i + batch.length} threw`, err);
      }
      // Throttle: ≥6s between batches → stay under 10 req/min on Lite.
      if (i + batchSize < cpaSymbols.length) {
        await new Promise((resolve) => setTimeout(resolve, 6500));
      }
    }
    return out;
  }

  /** Calls our own oil-price-api edge function for ALL energy commodities. */
  private async fetchAllFromOilPriceApi(): Promise<CommodityData[]> {
    if (!this.oilApiKey || !this.supabaseUrl) return [];

    try {
      const energyNames = Object.entries(COMMODITY_SYMBOLS)
        .filter(([, info]) => info.category === 'energy')
        .map(([name]) => name);

      const res = await fetch(`${this.supabaseUrl}/functions/v1/oil-price-api`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.supabaseAnonKey}`,
        },
        body: JSON.stringify({ commodities: energyNames }),
      });
      if (!res.ok) {
        this.logger.warn(`oil-price-api proxy failed ${res.status}`);
        return [];
      }
      const json = await res.json();
      // oil-price-api batch returns `{ data: { "<commodityName>": { price, ... } } }`.
      // Older callers used arrays — handle both shapes.
      const out: CommodityData[] = [];
      const payload = json?.data ?? json?.commodities ?? {};
      const entries: Array<[string, any]> = Array.isArray(payload)
        ? payload.map((p) => [p.commodityName || p.name, p])
        : Object.entries(payload);

      for (const [name, item] of entries) {
        const meta = COMMODITY_SYMBOLS[name];
        if (!meta || !item) continue;
        const price = parseFloat(item.price) || 0;
        if (price <= 0) continue; // Skip zero-prices so we don't poison the cache
        out.push({
          name,
          symbol: meta.symbol,
          price,
          change: parseFloat(item.change) || 0,
          changePercent: parseFloat(item.changePercent || item.changesPercentage) || 0,
          category: meta.category,
          contractSize: meta.contractSize,
          venue: meta.venue,
        });
      }
      return out;
    } catch (err) {
      this.logger.warn('OilPriceAPI proxy threw', err);
      return [];
    }
  }

  async fetchCurrentPrice(commodityName: string): Promise<CommodityData | null> {
    const all = await this.fetchAllCommodities();
    return all.find((c) => c.name === commodityName) || null;
  }

  /**
   * Fetches historical OHLC chart data.
   * - Energy: OilPriceAPI (handled in fetch-commodity-data edge function directly)
   * - Non-energy: CommodityPriceAPI v2 /rates/time-series
   * - Fallback: Alpha Vantage (limited symbol coverage)
   */
  async fetchCommodityChart(
    commodityName: string,
    timeframe: string,
    chartType: string = 'line'
  ): Promise<ChartDataPoint[]> {
    const endTimer = this.performanceMonitor.startTimer(`fetch-chart-${commodityName}`);
    try {
      const cacheKey = `chart:${commodityName}:${timeframe}:${chartType}`;
      const cached = getCache<ChartDataPoint[]>(cacheKey);
      if (cached) return cached;

      const cpaSymbol = COMMODITY_PRICE_API_SYMBOLS[commodityName];
      if (cpaSymbol && this.cpaApiKey) {
        const data = await this.fetchCpaTimeseries(cpaSymbol, timeframe, chartType);
        if (data.length > 0) {
          setCache(cacheKey, data);
          return data;
        }
      }

      if (this.alphaVantageApiKey) {
        const avData = await this.fetchAlphaVantageChart(commodityName);
        if (avData.length > 0) {
          setCache(cacheKey, avData);
          return avData;
        }
      }

      this.logger.warn(`Using fallback chart data for ${commodityName}`);
      return this.generateFallbackChart(commodityName, timeframe, chartType);
    } catch (error) {
      this.logger.error(`Failed to fetch chart data for ${commodityName}`, error);
      return this.generateFallbackChart(commodityName, timeframe, chartType);
    } finally {
      endTimer();
    }
  }

  private async fetchCpaTimeseries(
    cpaSymbol: string,
    timeframe: string,
    chartType: string
  ): Promise<ChartDataPoint[]> {
    const daysMap: Record<string, number> = {
      '1d': 2,
      '1w': 7,
      '1m': 30,
      '3m': 90,
      '6m': 180,
      '1y': 365,
    };
    const days = daysMap[timeframe] || 30;
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 86400000);
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    const url = `https://api.commoditypriceapi.com/v2/rates/time-series?symbols=${encodeURIComponent(cpaSymbol)}&startDate=${startStr}&endDate=${endStr}`;
    const res = await fetch(url, { headers: { 'x-api-key': this.cpaApiKey } });
    if (!res.ok) {
      this.logger.warn(`CPA timeseries failed ${res.status}`);
      return [];
    }
    const data = await res.json();
    if (!data?.success || !data.rates) return [];

    const isCent = CENT_QUOTED_SYMBOLS.has(cpaSymbol);
    const points: ChartDataPoint[] = [];
    for (const dateStr of Object.keys(data.rates).sort()) {
      const day = data.rates[dateStr]?.[cpaSymbol];
      if (!day) continue;
      const norm = (n: unknown): number => {
        const v = typeof n === 'number' ? n : parseFloat(String(n));
        return Number.isFinite(v) ? (isCent ? v / 100 : v) : 0;
      };
      const close = norm(day.close ?? day);
      const point: ChartDataPoint = { date: dateStr, price: close };
      if (chartType === 'candlestick') {
        point.open = norm(day.open ?? close);
        point.high = norm(day.high ?? close);
        point.low = norm(day.low ?? close);
        point.close = close;
      }
      points.push(point);
    }
    return points;
  }

  private async fetchAlphaVantageChart(commodityName: string): Promise<ChartDataPoint[]> {
    try {
      const avSymbolMap: Record<string, string> = {
        'WTI Crude Oil': 'WTI',
        'Brent Crude Oil': 'BRENT',
        'Natural Gas': 'NATURAL_GAS',
        'Corn Futures': 'CORN',
        'Wheat Futures': 'WHEAT',
        'Soybean Futures': 'SOYBEANS',
        'Sugar #11': 'SUGAR',
        Cotton: 'COTTON',
        'Coffee Arabica': 'COFFEE',
      };
      const symbol = avSymbolMap[commodityName];
      if (!symbol) return [];

      const response = await fetch(
        `https://www.alphavantage.co/query?function=${symbol}&interval=monthly&apikey=${this.alphaVantageApiKey}`
      );
      if (!response.ok) return [];
      const data = await response.json();
      const series = (data?.data || []) as Array<{ date: string; value: string }>;
      return series
        .map((it) => ({ date: it.date, price: parseFloat(it.value) || 0 }))
        .reverse();
    } catch (err) {
      this.logger.warn('Alpha Vantage fetch failed', err);
      return [];
    }
  }

  private generateFallbackChart(commodityName: string, timeframe: string, chartType: string): ChartDataPoint[] {
    const basePrice = this.getBasePriceForCommodity(commodityName);
    const dataPoints = this.getDataPointsForTimeframe(timeframe);
    const data: ChartDataPoint[] = [];
    const now = new Date();
    let currentPrice = basePrice;
    const volatility = basePrice * 0.02;

    for (let i = dataPoints - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * this.getTimeStepMs(timeframe));
      currentPrice += (Math.random() - 0.5) * volatility * 2;
      const point: ChartDataPoint = {
        date: date.toISOString(),
        price: Math.round(currentPrice * 100) / 100,
      };
      if (chartType === 'candlestick') {
        const dv = volatility * 0.3;
        point.open = currentPrice;
        point.high = currentPrice + Math.random() * dv;
        point.low = currentPrice - Math.random() * dv;
        point.close = point.low + Math.random() * (point.high - point.low);
      }
      data.push(point);
    }
    return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

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
      .map((name) => ({
        symbol: COMMODITY_SYMBOLS[name].symbol,
        price: this.getBasePriceForCommodity(name),
        change: (Math.random() - 0.5) * this.getBasePriceForCommodity(name) * 0.02,
        changePercent: (Math.random() - 0.5) * 4,
        volume: Math.floor(Math.random() * 100000),
        name,
        ...COMMODITY_SYMBOLS[name],
      }));
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
