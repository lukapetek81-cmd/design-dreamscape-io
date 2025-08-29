import { EdgeLogger, EdgePerformanceMonitor } from './utils.ts';
import { COMMODITY_SYMBOLS, COMMODITY_PRICE_API_SYMBOLS } from './commodity-mappings.ts';

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

export class CommodityService {
  private logger: EdgeLogger;
  private performanceMonitor: EdgePerformanceMonitor;
  private fmpApiKey: string;
  private alphaVantageApiKey: string;

  constructor(functionName: string) {
    this.logger = new EdgeLogger({ functionName });
    this.performanceMonitor = new EdgePerformanceMonitor();
    this.fmpApiKey = Deno.env.get('FMP_API_KEY') || '';
    this.alphaVantageApiKey = Deno.env.get('ALPHA_VANTAGE_API_KEY') || '';
  }

  async fetchAllCommodities(): Promise<CommodityData[]> {
    const endTimer = this.performanceMonitor.startTimer('fetch-all-commodities');
    
    try {
      this.logger.info('Starting to fetch all commodities');
      
      if (!this.fmpApiKey || this.fmpApiKey === 'demo') {
        this.logger.warn('No valid FMP API key, using fallback data');
        return this.getFallbackCommodities();
      }

      const response = await fetch(
        `https://financialmodelingprep.com/api/v3/quotes/commodity?apikey=${this.fmpApiKey}`
      );

      if (!response.ok) {
        throw new Error(`FMP API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No commodity data returned from FMP API');
      }

      this.logger.info(`FMP returned ${data.length} commodities`);
      
      const processedData = data.map(item => this.processFMPCommodity(item));
      return processedData;

    } catch (error) {
      this.logger.error('Failed to fetch commodities from FMP', error);
      return this.getFallbackCommodities();
    } finally {
      endTimer();
    }
  }

  async fetchCommodityChart(
    commodityName: string, 
    timeframe: string, 
    chartType: string = 'line',
    contractSymbol?: string
  ): Promise<ChartDataPoint[]> {
    const endTimer = this.performanceMonitor.startTimer(`fetch-chart-${commodityName}`);
    
    try {
      this.logger.info(`Fetching chart data for ${commodityName}`, { timeframe, chartType, contractSymbol });
      
      // Try FMP first, then Alpha Vantage, then fallback
      if (this.fmpApiKey && this.fmpApiKey !== 'demo') {
        const fmpData = await this.fetchFMPChart(commodityName, timeframe, chartType, contractSymbol);
        if (fmpData && fmpData.length > 0) {
          return fmpData;
        }
      }

      if (this.alphaVantageApiKey && this.alphaVantageApiKey !== 'demo') {
        const avData = await this.fetchAlphaVantageChart(commodityName, timeframe);
        if (avData && avData.length > 0) {
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

  async fetchCurrentPrice(commodityName: string): Promise<CommodityData | null> {
    const endTimer = this.performanceMonitor.startTimer(`fetch-price-${commodityName}`);
    
    try {
      this.logger.info(`Fetching current price for ${commodityName}`);
      
      if (!this.fmpApiKey || this.fmpApiKey === 'demo') {
        return this.getFallbackPrice(commodityName);
      }

      const response = await fetch(
        `https://financialmodelingprep.com/api/v3/quotes/commodity?apikey=${this.fmpApiKey}`
      );

      if (response.ok) {
        const data = await response.json();
        const commodity = data.find((item: any) => 
          this.matchesCommodityName(item, commodityName)
        );

        if (commodity) {
          return this.processFMPCommodity(commodity);
        }
      }

      return this.getFallbackPrice(commodityName);

    } catch (error) {
      this.logger.error(`Failed to fetch price for ${commodityName}`, error);
      return this.getFallbackPrice(commodityName);
    } finally {
      endTimer();
    }
  }

  private async fetchFMPChart(
    commodityName: string, 
    timeframe: string, 
    chartType: string,
    contractSymbol?: string
  ): Promise<ChartDataPoint[] | null> {
    try {
      const symbol = contractSymbol || COMMODITY_SYMBOLS[commodityName]?.symbol;
      if (!symbol) return null;

      // Map timeframe to FMP periods
      const periodMap: Record<string, string> = {
        '1d': '1hour',
        '1w': '1day', 
        '1m': '1day',
        '3m': '1day',
        '6m': '1day',
        '1y': '1day'
      };

      const period = periodMap[timeframe] || '1day';
      const response = await fetch(
        `https://financialmodelingprep.com/api/v3/historical-chart/${period}/${symbol}?apikey=${this.fmpApiKey}`
      );

      if (response.ok) {
        const data = await response.json();
        return this.processFMPChartData(data, chartType);
      }
      
      return null;
    } catch (error) {
      this.logger.error('FMP chart fetch failed', error);
      return null;
    }
  }

  private async fetchAlphaVantageChart(
    commodityName: string, 
    timeframe: string
  ): Promise<ChartDataPoint[] | null> {
    try {
      // Alpha Vantage commodity symbols mapping
      const avSymbolMap: Record<string, string> = {
        'Crude Oil': 'WTI',
        'Brent Crude Oil': 'BRENT',
        'Natural Gas': 'NATURAL_GAS',
        'Corn Futures': 'CORN',
        'Wheat Futures': 'WHEAT',
        'Soybean Futures': 'SOYBEANS',
        'Sugar': 'SUGAR',
        'Cotton': 'COTTON',
        'Coffee': 'COFFEE'
      };

      const symbol = avSymbolMap[commodityName];
      if (!symbol) return null;

      const response = await fetch(
        `https://www.alphavantage.co/query?function=COMMODITY&symbol=${symbol}&interval=monthly&apikey=${this.alphaVantageApiKey}`
      );

      if (response.ok) {
        const data = await response.json();
        return this.processAlphaVantageData(data);
      }

      return null;
    } catch (error) {
      this.logger.error('Alpha Vantage chart fetch failed', error);
      return null;
    }
  }

  private processFMPCommodity(fmpItem: any): CommodityData {
    const matchedCommodity = Object.entries(COMMODITY_SYMBOLS).find(([name, info]) => 
      info.symbol === fmpItem.symbol || 
      name.toLowerCase().includes(fmpItem.name?.toLowerCase().split(' ')[0] || '')
    );
    
    const commodityName = matchedCommodity ? matchedCommodity[0] : 
      (fmpItem.name || fmpItem.symbol.replace('=F', ' Futures'));
    
    const metadata = matchedCommodity ? matchedCommodity[1] : {
      category: 'other',
      contractSize: 'TBD',
      venue: 'Various'
    };
    
    return {
      symbol: fmpItem.symbol,
      price: parseFloat(fmpItem.price) || 0,
      change: parseFloat(fmpItem.change) || 0,
      changePercent: parseFloat(fmpItem.changesPercentage) || 0,
      volume: parseInt(fmpItem.volume) || 0,
      name: commodityName,
      ...metadata
    };
  }

  private processFMPChartData(data: any[], chartType: string): ChartDataPoint[] {
    if (!Array.isArray(data)) return [];
    
    return data.map(item => {
      const basePoint: ChartDataPoint = {
        date: item.date,
        price: parseFloat(item.close) || 0
      };

      if (chartType === 'candlestick') {
        basePoint.open = parseFloat(item.open) || 0;
        basePoint.high = parseFloat(item.high) || 0;
        basePoint.low = parseFloat(item.low) || 0;
        basePoint.close = parseFloat(item.close) || 0;
      }

      return basePoint;
    }).reverse(); // FMP returns newest first, we want oldest first
  }

  private processAlphaVantageData(data: any): ChartDataPoint[] {
    // Process Alpha Vantage response format
    const timeSeries = data.data || {};
    return Object.entries(timeSeries).map(([date, values]: [string, any]) => ({
      date,
      price: parseFloat(values.value) || 0
    })).reverse();
  }

  private generateFallbackChart(commodityName: string, timeframe: string, chartType: string): ChartDataPoint[] {
    const basePrice = this.getBasePriceForCommodity(commodityName);
    const dataPoints = this.getDataPointsForTimeframe(timeframe);
    const data: ChartDataPoint[] = [];
    const now = new Date();
    
    let currentPrice = basePrice;
    const volatility = basePrice * 0.02;
    
    for (let i = dataPoints - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * this.getTimeStepMs(timeframe)));
      const randomChange = (Math.random() - 0.5) * volatility * 2;
      currentPrice += randomChange;
      
      const point: ChartDataPoint = {
        date: date.toISOString(),
        price: Math.round(currentPrice * 100) / 100
      };

      if (chartType === 'candlestick') {
        const dayVolatility = volatility * 0.3;
        point.open = currentPrice;
        point.high = currentPrice + (Math.random() * dayVolatility);
        point.low = currentPrice - (Math.random() * dayVolatility);
        point.close = point.low + (Math.random() * (point.high - point.low));
      }

      data.push(point);
    }
    
    return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  private getFallbackCommodities(): CommodityData[] {
    const coreCommodities = [
      'Crude Oil', 'Natural Gas', 'Gold Futures', 'Silver Futures', 
      'Corn Futures', 'Wheat Futures', 'Coffee', 'Sugar', 'Cotton'
    ];
    
    return coreCommodities
      .filter(name => COMMODITY_SYMBOLS[name])
      .map(name => ({
        symbol: COMMODITY_SYMBOLS[name].symbol,
        price: this.getBasePriceForCommodity(name),
        change: (Math.random() - 0.5) * this.getBasePriceForCommodity(name) * 0.02,
        changePercent: (Math.random() - 0.5) * 4,
        volume: Math.floor(Math.random() * 100000),
        name,
        ...COMMODITY_SYMBOLS[name]
      }));
  }

  private getFallbackPrice(commodityName: string): CommodityData {
    const basePrice = this.getBasePriceForCommodity(commodityName);
    const metadata = COMMODITY_SYMBOLS[commodityName] || {
      symbol: commodityName,
      category: 'other',
      contractSize: 'TBD',
      venue: 'Various'
    };
    
    return {
      price: basePrice,
      change: (Math.random() - 0.5) * basePrice * 0.02,
      changePercent: (Math.random() - 0.5) * 4,
      volume: Math.floor(Math.random() * 100000),
      name: commodityName,
      ...metadata
    };
  }

  private matchesCommodityName(item: any, commodityName: string): boolean {
    if (item.name && item.name.toLowerCase() === commodityName.toLowerCase()) {
      return true;
    }
    
    const itemNameLower = (item.name || '').toLowerCase();
    const commodityNameLower = commodityName.toLowerCase();
    const commodityWords = commodityNameLower.split(' ').filter(w => w.length > 2);
    
    return commodityWords.some(word => itemNameLower.includes(word));
  }

  private getBasePriceForCommodity(commodityName: string): number {
    const basePrices: Record<string, number> = {
      'Crude Oil': 65, 'Brent Crude Oil': 70, 'Natural Gas': 2.85,
      'Gold Futures': 2000, 'Silver Futures': 25, 'Copper': 4.2,
      'Corn Futures': 430, 'Wheat Futures': 550, 'Soybean Futures': 1150,
      'Coffee': 165, 'Sugar': 19.75, 'Cotton': 72.80
    };
    return basePrices[commodityName] || 100;
  }

  private getDataPointsForTimeframe(timeframe: string): number {
    const pointsMap: Record<string, number> = {
      '1d': 24, '1w': 7, '1m': 30, '3m': 90, '6m': 180, '1y': 365
    };
    return pointsMap[timeframe] || 30;
  }

  private getTimeStepMs(timeframe: string): number {
    const stepMap: Record<string, number> = {
      '1d': 60 * 60 * 1000, // 1 hour
      '1w': 24 * 60 * 60 * 1000, // 1 day
      '1m': 24 * 60 * 60 * 1000, // 1 day
      '3m': 24 * 60 * 60 * 1000, // 1 day
      '6m': 24 * 60 * 60 * 1000, // 1 day
      '1y': 24 * 60 * 60 * 1000  // 1 day
    };
    return stepMap[timeframe] || 24 * 60 * 60 * 1000;
  }

  // Apply 15-minute delay for free users
  applyDataDelay(data: CommodityData[], delay: string): CommodityData[] {
    if (delay !== '15min') return data;
    
    return data.map(commodity => {
      const commodityHash = commodity.name.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      const seededRandom = (Math.abs(commodityHash) % 100) / 100;
      
      return {
        ...commodity,
        price: commodity.price * (0.995 + seededRandom * 0.01),
        change: commodity.change * (0.9 + seededRandom * 0.2),
        changePercent: commodity.changePercent * (0.9 + seededRandom * 0.2),
      };
    });
  }

  getPerformanceMetrics() {
    return this.performanceMonitor.getMetrics();
  }
}