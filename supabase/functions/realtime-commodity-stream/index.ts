import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client for user verification
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const COMMODITY_SYMBOLS: Record<string, string> = {
  'Gold Futures': 'GCUSD',
  'Micro Gold Futures': 'MGCUSD',
  'Silver Futures': 'SIUSD',
  'Micro Silver Futures': 'MSIUSD',
  'Copper': 'HGUSD',
  'Aluminum': 'ALI=F',
  'Platinum': 'PLUSD',
  'Palladium': 'PAUSD',
  'Crude Oil': 'CLUSD',
  'Brent Crude Oil': 'BZUSD',
  'Natural Gas': 'NGUSD',
  'Heating Oil': 'HOUSD',
  'Gasoline RBOB': 'RBUSD',
  'Corn Futures': 'ZCUSX',
  'Wheat Futures': 'ZWUSX',
  'Soybean Futures': 'ZSUSX',
  'Live Cattle Futures': 'LEUSX',
  'Feeder Cattle Futures': 'FCUSX',
  'Lean Hogs Futures': 'HEUSX',
  'Class III Milk Futures': 'DCUSD',
  'Oat Futures': 'ZOUSX',
  'Sugar': 'SBUSD',
  'Cotton': 'CTUSD',
  'Lumber Futures': 'LBSUSD',
  'Orange Juice': 'OJUSD',
  'Coffee': 'KCUSD',
  'Rough Rice': 'ZRUSX',
  'Cocoa': 'CCUSD'
};

interface CommodityPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  lastUpdate: string;
  volume?: number;
  high?: number;
  low?: number;
}

async function verifyPremiumUser(authToken: string): Promise<boolean> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser(authToken);
    
    if (error || !user) {
      console.log('Auth verification failed:', error);
      return false;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_active, subscription_tier')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.log('Profile fetch failed:', profileError);
      return false;
    }

    return profile.subscription_active && 
           (profile.subscription_tier === 'premium' || profile.subscription_tier === 'pro');
  } catch (error) {
    console.error('Premium verification error:', error);
    return false;
  }
}

async function fetchRealTimePrice(symbol: string, fmpApiKey: string): Promise<CommodityPrice | null> {
  try {
    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${fmpApiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`FMP API error: ${response.status}`);
    }
    
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    
    const quote = data[0];
    return {
      symbol: symbol,
      price: parseFloat(quote.price) || 0,
      change: parseFloat(quote.change) || 0,
      changePercent: parseFloat(quote.changesPercentage) || 0,
      volume: parseFloat(quote.volume) || 0,
      high: parseFloat(quote.dayHigh) || 0,
      low: parseFloat(quote.dayLow) || 0,
      lastUpdate: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error);
    return null;
  }
}

async function streamCommodityPrices(socket: WebSocket, commodities: string[], fmpApiKey: string) {
  const activeStream = new Set<string>(commodities);
  
  while (socket.readyState === WebSocket.OPEN && activeStream.size > 0) {
    const priceUpdates: Record<string, CommodityPrice> = {};
    
    // Fetch all commodity prices in parallel
    const promises = Array.from(activeStream).map(async (commodity) => {
      const symbol = COMMODITY_SYMBOLS[commodity];
      if (symbol) {
        const price = await fetchRealTimePrice(symbol, fmpApiKey);
        if (price) {
          priceUpdates[commodity] = price;
        }
      }
    });
    
    await Promise.all(promises);
    
    // Send price updates if we have any
    if (Object.keys(priceUpdates).length > 0) {
      try {
        socket.send(JSON.stringify({
          type: 'price_update',
          data: priceUpdates,
          timestamp: new Date().toISOString()
        }));
      } catch (error) {
        console.error('Error sending price update:', error);
        break;
      }
    }
    
    // Wait 5 seconds before next update (real-time for premium users)
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
}

serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { 
      status: 400, 
      headers: corsHeaders 
    });
  }

  const url = new URL(req.url);
  const authToken = url.searchParams.get("token");
  const commoditiesParam = url.searchParams.get("commodities");

  if (!authToken) {
    return new Response("Missing auth token", { 
      status: 401, 
      headers: corsHeaders 
    });
  }

  // Verify premium user
  const isPremium = await verifyPremiumUser(authToken);
  if (!isPremium) {
    return new Response("Premium subscription required", { 
      status: 403, 
      headers: corsHeaders 
    });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  const fmpApiKey = Deno.env.get('FMP_API_KEY');

  if (!fmpApiKey || fmpApiKey === 'demo') {
    socket.close(1008, "Real-time data unavailable");
    return response;
  }

  socket.onopen = () => {
    console.log("Premium WebSocket connection established");
    
    socket.send(JSON.stringify({
      type: 'connection_status',
      status: 'connected',
      message: 'Real-time commodity data stream active',
      updateInterval: '5 seconds'
    }));

    // Start streaming if commodities specified
    if (commoditiesParam) {
      const commodities = commoditiesParam.split(',').filter(c => COMMODITY_SYMBOLS[c]);
      if (commodities.length > 0) {
        streamCommodityPrices(socket, commodities, fmpApiKey);
      }
    }
  };

  socket.onmessage = async (event) => {
    try {
      const message = JSON.parse(event.data);
      
      if (message.type === 'subscribe') {
        const commodities = message.commodities?.filter((c: string) => COMMODITY_SYMBOLS[c]) || [];
        if (commodities.length > 0) {
          console.log(`Starting real-time stream for: ${commodities.join(', ')}`);
          streamCommodityPrices(socket, commodities, fmpApiKey);
        }
      } else if (message.type === 'ping') {
        socket.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  };

  socket.onclose = () => {
    console.log("Premium WebSocket connection closed");
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  return response;
});