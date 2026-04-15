import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// FMP symbols for historical chart data — only supported commodities
const COMMODITY_SYMBOLS: Record<string, string> = {
  // Energy (FMP symbols for fallback historical)
  'WTI Crude Oil': 'CL=F',
  'Brent Crude Oil': 'BZ=F',
  'Natural Gas': 'NG=F',
  'Gasoline RBOB': 'RB=F',
  'Heating Oil': 'HO=F',
  'Crude Oil Dubai': 'CL=F',
  'DME Oman Crude': 'CL=F',
  'Murban Crude': 'CL=F',
  'OPEC Basket': 'CL=F',
  'Indian Basket': 'CL=F',
  'Tapis Crude Oil': 'CL=F',
  'Western Canadian Select': 'CL=F',
  'Urals Crude Oil': 'CL=F',
  'WTI Midland': 'CL=F',
  'Alaska North Slope': 'CL=F',
  'Mars Blend': 'CL=F',
  'Louisiana Light Sweet': 'CL=F',
  'Jet Fuel': 'HO=F',
  'ULSD Diesel': 'HO=F',
  'Gasoil': 'HO=F',
  'Naphtha': 'CL=F',
  'Propane': 'NG=F',
  'Ethanol': 'ZC=F',
  'Natural Gas UK': 'NG=F',
  'Dutch TTF Gas': 'NG=F',
  'Japan/Korea LNG': 'NG=F',
  'US Gas Storage': 'NG=F',
  'VLSFO Global': 'CL=F',
  'HFO 380 Global': 'CL=F',
  'MGO 0.5%S Global': 'CL=F',
  'HFO 380 Rotterdam': 'CL=F',
  'VLSFO Singapore': 'CL=F',
  'MGO Houston': 'CL=F',
  'VLSFO Fujairah': 'CL=F',
  
  // Metals
  'Gold Futures': 'GC=F',
  'Silver Futures': 'SI=F',
  'Platinum': 'PL=F',
  'Palladium': 'PA=F',
  'Copper': 'HG=F',
  'Aluminum': 'HG=F',
  'Zinc': 'HG=F',
  
  // Grains
  'Corn Futures': 'ZC=F',
  'Soybean Futures': 'ZS=F',
  'Soybean Oil': 'ZL=F',
  'Soybean Meal': 'ZM=F',
  'Oat Futures': 'ZO=F',
  'Rough Rice': 'ZR=F',
  
  // Livestock
  'Live Cattle Futures': 'LE=F',
  'Feeder Cattle Futures': 'GF=F',
  'Lean Hogs Futures': 'HE=F',
  'Milk Class III': 'HE=F',
  
  // Softs
  'Coffee Arabica': 'KC=F',
  'Sugar #11': 'SB=F',
  'Cotton': 'CT=F',
  'Cocoa': 'CC=F',
  'Orange Juice': 'OJ=F',
  
  // Other
  'Lumber Futures': 'LBS=F',
  'Random Length Lumber': 'LBS=F',
};

// OilPriceAPI codes for ALL energy commodities — historical data
const OIL_API_BLEND_CODES: Record<string, string> = {
  // Crude Oil Benchmarks
  'WTI Crude Oil': 'WTI_USD',
  'Brent Crude Oil': 'BRENT_CRUDE_USD',
  'Crude Oil Dubai': 'DUBAI_CRUDE_USD',
  'DME Oman Crude': 'DME_OMAN_USD',
  'Murban Crude': 'MURBAN_CRUDE_USD',
  'OPEC Basket': 'OPEC_BASKET_USD',
  'Indian Basket': 'INDIAN_BASKET_USD',
  'Tapis Crude Oil': 'TAPIS_CRUDE_USD',
  'Urals Crude Oil': 'URALS_CRUDE_USD',
  'Western Canadian Select': 'WCS_CRUDE_USD',
  // Regional Crude Benchmarks
  'WTI Midland': 'WTI_MIDLAND_USD',
  'Alaska North Slope': 'ANS_WEST_COAST_USD',
  'Mars Blend': 'MARS_USD',
  'Louisiana Light Sweet': 'LOUISIANA_LIGHT_USD',
  // Refined Products
  'Gasoline RBOB': 'GASOLINE_RBOB_USD',
  'Heating Oil': 'HEATING_OIL_USD',
  'Jet Fuel': 'JET_FUEL_USD',
  'ULSD Diesel': 'ULSD_DIESEL_USD',
  'Gasoil': 'GASOIL_USD',
  'Naphtha': 'NAPHTHA_USD',
  'Propane': 'PROPANE_MONT_BELVIEU_USD',
  'Ethanol': 'ETHANOL_USD',
  // Natural Gas & LNG
  'Natural Gas': 'NATURAL_GAS_USD',
  'Natural Gas UK': 'NATURAL_GAS_GBP',
  'Dutch TTF Gas': 'DUTCH_TTF_EUR',
  'Japan/Korea LNG': 'JKM_LNG_USD',
  'US Gas Storage': 'NATURAL_GAS_STORAGE',
  // Marine Fuels
  'VLSFO Global': 'VLSFO_USD',
  'HFO 380 Global': 'HFO_380_USD',
  'MGO 0.5%S Global': 'MGO_05S_USD',
  'HFO 380 Rotterdam': 'HFO_380_NLRTM_USD',
  'VLSFO Singapore': 'VLSFO_SGSIN_USD',
  'MGO Houston': 'MGO_05S_USHOU_USD',
  'VLSFO Fujairah': 'VLSFO_AEFUJ_USD',
};

const generateFallbackData = (commodityName: string, timeframe: string, basePrice: number, isPremium: boolean = false, chartType: string = 'line') => {
  const dataPoints = isPremium 
    ? (timeframe === '1d' ? 48 : timeframe === '1m' ? 60 : timeframe === '3m' ? 180 : 365) 
    : (timeframe === '1d' ? 24 : timeframe === '1m' ? 30 : timeframe === '3m' ? 90 : 180);
  const data: any[] = [];
  const now = new Date();
  
  let currentPrice = basePrice;
  
  const isEnergy = commodityName.includes('Oil') || commodityName.includes('Gas') || 
    commodityName.includes('Fuel') || commodityName.includes('Diesel') || 
    commodityName.includes('VLSFO') || commodityName.includes('HFO') || commodityName.includes('MGO');
  const isAgri = commodityName.includes('Futures') || commodityName.includes('Corn') || commodityName.includes('Soybean');
  
  let volatility: number;
  if (isEnergy) {
    volatility = basePrice * (timeframe === '1d' ? 0.03 : timeframe === '1m' ? 0.05 : timeframe === '3m' ? 0.08 : 0.15);
  } else if (isAgri) {
    volatility = basePrice * (timeframe === '1d' ? 0.02 : timeframe === '1m' ? 0.04 : timeframe === '3m' ? 0.07 : 0.12);
  } else {
    volatility = basePrice * (timeframe === '1d' ? 0.015 : timeframe === '1m' ? 0.03 : timeframe === '3m' ? 0.05 : 0.1);
  }
  
  const trendDirection = Math.random() > 0.5 ? 1 : -1;
  const trendStrength = 0.0007;
  
  for (let i = dataPoints - 1; i >= 0; i--) {
    let date: Date;
    if (timeframe === '1d') {
      date = new Date(now.getTime() - (i * 60 * 60 * 1000));
    } else {
      date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
    }
    
    const randomChange = (Math.random() - 0.5) * volatility * 2;
    const trendComponent = trendDirection * trendStrength * basePrice * (dataPoints - i);
    const meanReversionComponent = (basePrice - currentPrice) * 0.01;
    
    // Add cyclical patterns for longer timeframes
    let cycleFactor = 0;
    if (timeframe === '3m' || timeframe === '6m') {
      cycleFactor = Math.sin((i / dataPoints) * Math.PI * 4) * 0.02 * basePrice;
    }
    
    currentPrice += randomChange + trendComponent + meanReversionComponent + cycleFactor;
    currentPrice = Math.max(basePrice * 0.7, Math.min(basePrice * 1.3, currentPrice));
    
    let decimals = 2;
    if (basePrice >= 1000) decimals = 0;
    else if (basePrice >= 100) decimals = 1;
    
    if (chartType === 'candlestick') {
      const dayVolatility = volatility * 0.3;
      const open = currentPrice;
      const high = open + (Math.random() * dayVolatility);
      const low = open - (Math.random() * dayVolatility);
      const close = low + (Math.random() * (high - low));
      
      data.push({
        date: date.toISOString(),
        open: Math.round(open * Math.pow(10, decimals)) / Math.pow(10, decimals),
        high: Math.round(high * Math.pow(10, decimals)) / Math.pow(10, decimals),
        low: Math.round(low * Math.pow(10, decimals)) / Math.pow(10, decimals),
        close: Math.round(close * Math.pow(10, decimals)) / Math.pow(10, decimals),
        price: Math.round(close * Math.pow(10, decimals)) / Math.pow(10, decimals),
      });
      currentPrice = close;
    } else {
      data.push({
        date: date.toISOString(),
        price: Math.round(currentPrice * Math.pow(10, decimals)) / Math.pow(10, decimals),
      });
    }
  }
  
  return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

const getBasePriceForCommodity = (commodityName: string): number => {
  const basePrices: Record<string, number> = {
    'WTI Crude Oil': 65, 'Brent Crude Oil': 70, 'Natural Gas': 2.85,
    'Gasoline RBOB': 2.1, 'Heating Oil': 2.3, 'Natural Gas UK': 90,
    'Crude Oil Dubai': 64, 'Tapis Crude Oil': 68, 'Urals Crude Oil': 62,
    'Western Canadian Select': 55, 'Jet Fuel': 2.5, 'ULSD Diesel': 2.4,
    'Dutch TTF Gas': 28, 'Japan/Korea LNG': 15.50, 'US Gas Storage': 2.85,
    'VLSFO Global': 550, 'HFO 380 Global': 400, 'MGO 0.5%S Global': 700,
    'HFO 380 Rotterdam': 410, 'VLSFO Singapore': 560, 'MGO Houston': 720,
    'VLSFO Fujairah': 570,
    'Gold Futures': 2000, 'Silver Futures': 25, 'Platinum': 1050,
    'Palladium': 1200, 'Copper': 4.2, 'Aluminum': 2200, 'Zinc': 2800,
    'Corn Futures': 430, 'Soybean Futures': 1150,
    'Soybean Oil': 45, 'Soybean Meal': 315, 'Oat Futures': 385, 'Rough Rice': 16.25,
    'Live Cattle Futures': 170, 'Feeder Cattle Futures': 240,
    'Lean Hogs Futures': 75, 'Milk Class III': 20.85,
    'Coffee Arabica': 165, 'Sugar #11': 19.75, 'Cotton': 72.80,
    'Cocoa': 2850, 'Orange Juice': 315,
    'Lumber Futures': 485, 'Random Length Lumber': 485,
  };
  return basePrices[commodityName] || 100;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  let commodityName = 'WTI Crude Oil';
  try {
    const body = await req.json();
    commodityName = body.commodityName;
    const { timeframe, isPremium, chartType, dataDelay = 'realtime', contractSymbol } = body;
    
    if (!commodityName || !timeframe) {
      return new Response(
        JSON.stringify({ error: 'Missing commodityName or timeframe' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Fetching data for ${commodityName}, timeframe: ${timeframe}, chartType: ${chartType || 'line'}`)

    const fmpApiKey = Deno.env.get('FMP_API_KEY')
    let symbol = contractSymbol || COMMODITY_SYMBOLS[commodityName]
    let isIBKRContract = false
    
    if (contractSymbol) {
      const baseFmpSymbol = COMMODITY_SYMBOLS[commodityName]
      if (baseFmpSymbol && contractSymbol !== baseFmpSymbol) {
        symbol = baseFmpSymbol
        isIBKRContract = true
      }
    }
    
    if (!symbol) {
      throw new Error(`Commodity ${commodityName} not found`)
    }

    let historicalData = null
    let dataSourceUsed = 'fallback';

    // Step 1: Try OilPriceAPI for energy commodities
    const oilApiCode = OIL_API_BLEND_CODES[commodityName];
    const oilApiKey = Deno.env.get('OIL_PRICE_API_KEY');

    if (oilApiCode && oilApiKey) {
      try {
        let endpoint: string;
        let interval: string;
        if (timeframe === '1d') {
          endpoint = 'past_day';
          interval = '1h';
        } else if (timeframe === '1m') {
          endpoint = 'past_month';
          interval = '1d';
        } else if (timeframe === '3m' || timeframe === '6m') {
          endpoint = 'past_year';
          interval = '1w';
        } else {
          endpoint = 'past_week';
          interval = '1d';
        }

        console.log(`Trying OilPriceAPI historical: ${endpoint} for ${commodityName} (${oilApiCode})`);

        const oilResp = await fetch(
          `https://api.oilpriceapi.com/v1/prices/${endpoint}?by_code=${oilApiCode}&interval=${interval}`,
          { headers: { 'Authorization': `Token ${oilApiKey}` } }
        );

        if (oilResp.ok) {
          const oilResult = await oilResp.json();
          const prices = oilResult.data?.prices || oilResult.data || [];

          if (Array.isArray(prices) && prices.length > 0) {
            console.log(`OilPriceAPI returned ${prices.length} historical points for ${commodityName}`);

            const safeDate = (item: any): string => {
              const raw = item.created_at || item.date || item.timestamp || '';
              if (!raw) return '';
              const d = new Date(raw);
              return isNaN(d.getTime()) ? '' : d.toISOString();
            };

            if (chartType === 'candlestick') {
              historicalData = prices
                .map((item: any) => {
                  const dateStr = safeDate(item);
                  if (!dateStr) return null;
                  const price = item.price || item.value || 0;
                  const vol = price * 0.005;
                  return {
                    date: dateStr,
                    open: price - vol * (Math.random() - 0.3),
                    high: price + vol * Math.random(),
                    low: price - vol * Math.random(),
                    close: price,
                    price,
                  };
                })
                .filter(Boolean);
            } else {
              historicalData = prices
                .map((item: any) => {
                  const dateStr = safeDate(item);
                  if (!dateStr) return null;
                  return { date: dateStr, price: item.price || item.value || 0 };
                })
                .filter(Boolean);
            }

            historicalData.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

            if (timeframe === '3m') historicalData = historicalData.slice(-90);
            else if (timeframe === '6m') historicalData = historicalData.slice(-180);

            if (historicalData.length < 2) {
              console.warn(`OilPriceAPI returned only ${historicalData.length} valid points, will try FMP`);
              historicalData = null;
            } else {
              dataSourceUsed = 'oilpriceapi';
              console.log(`OilPriceAPI historical: ${historicalData.length} data points for ${commodityName}`);
            }
          } else {
            console.warn(`OilPriceAPI returned empty data for ${commodityName}`);
          }
        } else {
          const errText = await oilResp.text();
          console.warn(`OilPriceAPI historical error for ${oilApiCode}: ${oilResp.status} - ${errText.substring(0, 200)}`);
        }
      } catch (err) {
        console.warn(`OilPriceAPI historical fetch failed for ${commodityName}:`, err);
      }
    }

    // Step 2: Try FMP API if OilPriceAPI didn't provide data
    if (!historicalData && fmpApiKey && fmpApiKey !== 'demo') {
      try {
        const dataPoints = isPremium 
          ? (timeframe === '1d' ? 48 : timeframe === '1m' ? 60 : timeframe === '3m' ? 180 : 365) 
          : (timeframe === '1d' ? 24 : timeframe === '1m' ? 30 : timeframe === '3m' ? 90 : 180);
        
        const response = await fetch(
          `https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?apikey=${fmpApiKey}&timeseries=${dataPoints}`
        );
        
        if (!response.ok) {
          throw new Error(`FMP API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.historical && Array.isArray(data.historical) && data.historical.length > 0) {
          const maxDataPoints = isPremium 
            ? (timeframe === '1d' ? 48 : timeframe === '1m' ? 60 : timeframe === '3m' ? 180 : 365)
            : (timeframe === '1d' ? 24 : timeframe === '1m' ? 30 : timeframe === '3m' ? 90 : 180);
          
          if (chartType === 'candlestick') {
            historicalData = data.historical.slice(0, maxDataPoints)
              .filter((item: any) => item.date && !isNaN(new Date(item.date).getTime()))
              .map((item: any) => ({
                date: item.date,
                open: parseFloat(item.open),
                high: parseFloat(item.high),
                low: parseFloat(item.low),
                close: parseFloat(item.close),
                price: parseFloat(item.close),
              })).reverse();
          } else {
            historicalData = data.historical.slice(0, maxDataPoints)
              .filter((item: any) => item.date && !isNaN(new Date(item.date).getTime()))
              .map((item: any) => ({
                date: item.date,
                price: parseFloat(item.close),
              })).reverse();
          }
          
          dataSourceUsed = 'fmp';
          console.log(`FMP historical: ${historicalData.length} data points for ${commodityName}`);
        } else {
          throw new Error('No historical data from FMP');
        }
      } catch (error) {
        console.warn(`FMP API failed for ${commodityName}:`, error);
        historicalData = null;
      }
    }

    // Step 3: Use fallback data if both APIs failed
    if (!historicalData) {
      console.log(`Using fallback data for ${commodityName}`)
      const basePrice = getBasePriceForCommodity(commodityName)
      historicalData = generateFallbackData(commodityName, timeframe, basePrice, isPremium, chartType)
      dataSourceUsed = 'fallback';
    }

    // Apply contract-specific price adjustments for IBKR contracts
    if (isIBKRContract && contractSymbol && historicalData) {
      const contractMonth = contractSymbol.slice(-2, -1);
      const contractYearStr = contractSymbol.slice(-1);
      const contractYearNum = parseInt(contractYearStr);
      
      const monthMap: Record<string, number> = {
        'F': 1, 'G': 2, 'H': 3, 'J': 4, 'K': 5, 'M': 6,
        'N': 7, 'Q': 8, 'U': 9, 'V': 10, 'X': 11, 'Z': 12
      };
      
      const expMonth = monthMap[contractMonth] || 0;
      const hasValidExpiry = expMonth > 0 && !isNaN(contractYearNum);
      
      let priceAdjustment = 1.0;
      let volatilityMultiplier = 1.0;
      
      if (hasValidExpiry) {
        const expYear = 2020 + contractYearNum;
        const now = new Date();
        const expDate = new Date(expYear, expMonth - 1, 15);
        const timeToExpiry = (expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      
        if (commodityName.includes('Oil') || commodityName.includes('Gas')) {
          priceAdjustment = 1.0 + (timeToExpiry / 365) * 0.12;
          volatilityMultiplier = 1.0 + Math.abs(timeToExpiry / 365) * 0.4;
        } else {
          priceAdjustment = 1.0 + (timeToExpiry / 365) * 0.06;
          volatilityMultiplier = 1.0 + Math.abs(timeToExpiry / 365) * 0.25;
        }
      }
      
      historicalData = historicalData.map((item: any) => {
        const additionalVolatility = (Math.random() - 0.5) * 0.03 * volatilityMultiplier;
        const finalAdjustment = priceAdjustment * (1 + additionalVolatility);
        
        if (chartType === 'candlestick') {
          return {
            ...item,
            open: item.open * finalAdjustment,
            high: item.high * finalAdjustment,
            low: item.low * finalAdjustment,
            close: item.close * finalAdjustment,
            price: item.price * finalAdjustment,
          };
        } else {
          return { ...item, price: item.price * finalAdjustment };
        }
      });
    }

    // Apply data delay for free users
    if (dataDelay === '15min' && historicalData) {
      historicalData = historicalData.map((item: any) => {
        const parsed = new Date(item.date);
        if (isNaN(parsed.getTime())) return item;
        const delayedDate = new Date(parsed.getTime() - 15 * 60 * 1000);
        const adjustment = 0.995 + Math.random() * 0.01;
        
        if (chartType === 'candlestick') {
          return {
            ...item, date: delayedDate.toISOString(),
            open: item.open * adjustment, high: item.high * adjustment,
            low: item.low * adjustment, close: item.close * adjustment,
            price: item.price * adjustment,
          };
        } else {
          return { ...item, date: delayedDate.toISOString(), price: item.price * adjustment };
        }
      });
    }

    return new Response(
      JSON.stringify({ 
        data: historicalData,
        source: dataSourceUsed,
        commodity: commodityName,
        symbol: symbol,
        realTime: isPremium || false,
        dataPoints: historicalData?.length || 0,
        chartType: chartType || 'line',
        dataDelay: dataDelay,
        isDelayed: dataDelay === '15min'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in fetch-commodity-data function:', error)
    const basePrice = getBasePriceForCommodity(commodityName || 'WTI Crude Oil');
    const fallbackData = generateFallbackData(commodityName || 'WTI Crude Oil', '1m', basePrice, false, 'line');
    return new Response(
      JSON.stringify({ 
        data: fallbackData, 
        source: 'fallback',
        error: 'Recovered from error with fallback data'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
