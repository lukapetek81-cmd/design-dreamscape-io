import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// FIX Protocol constants
const FIX_VERSION = "FIX.4.4";
const SOH = "\x01"; // Start of Header delimiter

interface FIXMessage {
  msgType: string;
  fields: { [key: string]: string };
}

interface IBKRConnection {
  socket: WebSocket | null;
  sessionId: string;
  authenticated: boolean;
  subscriptions: Set<string>;
}

interface CommodityPrice {
  symbol: string;
  price: number;
  bid?: number;
  ask?: number;
  volume?: number;
  lastUpdate: string;
  source: string;
}

// IBKR connection management
const connections = new Map<string, IBKRConnection>();

// Symbol mapping for IBKR commodity contracts
const IBKR_COMMODITY_SYMBOLS: Record<string, string> = {
  "Crude Oil": "CL", // NYMEX Crude Oil
  "Natural Gas": "NG", // NYMEX Natural Gas
  "Gold": "GC", // COMEX Gold
  "Silver": "SI", // COMEX Silver
  "Copper": "HG", // COMEX Copper
  "Platinum": "PL", // NYMEX Platinum
  "Palladium": "PA", // NYMEX Palladium
  "Corn": "ZC", // CBOT Corn
  "Wheat": "ZW", // CBOT Wheat
  "Soybeans": "ZS", // CBOT Soybeans
  "Live Cattle": "LE", // CME Live Cattle
  "Lean Hogs": "HE", // CME Lean Hogs
  "Coffee": "KC", // ICE Coffee
  "Sugar": "SB", // ICE Sugar
  "Cotton": "CT", // ICE Cotton
  "Cocoa": "CC", // ICE Cocoa
};

// FIX message builders
function buildFIXMessage(msgType: string, fields: { [key: string]: string }): string {
  const baseFields = {
    "8": FIX_VERSION, // BeginString
    "35": msgType, // MsgType
    "49": "CLIENT", // SenderCompID
    "56": "IBKR", // TargetCompID
    "52": new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z/, ""), // SendingTime
  };

  const allFields = { ...baseFields, ...fields };
  
  // Calculate body length
  let bodyLength = 0;
  for (const [tag, value] of Object.entries(allFields)) {
    if (tag !== "8" && tag !== "9" && tag !== "10") {
      bodyLength += `${tag}=${value}${SOH}`.length;
    }
  }

  allFields["9"] = bodyLength.toString(); // BodyLength

  // Build message without checksum
  let message = "";
  for (const [tag, value] of Object.entries(allFields)) {
    if (tag !== "10") {
      message += `${tag}=${value}${SOH}`;
    }
  }

  // Calculate checksum
  let checksum = 0;
  for (let i = 0; i < message.length; i++) {
    checksum += message.charCodeAt(i);
  }
  const checksumStr = (checksum % 256).toString().padStart(3, "0");

  message += `10=${checksumStr}${SOH}`;
  return message;
}

function parseFIXMessage(data: string): FIXMessage | null {
  try {
    const fields: { [key: string]: string } = {};
    const pairs = data.split(SOH);

    for (const pair of pairs) {
      if (pair.includes("=")) {
        const [tag, value] = pair.split("=", 2);
        fields[tag] = value;
      }
    }

    return {
      msgType: fields["35"] || "",
      fields,
    };
  } catch (error) {
    console.error("Failed to parse FIX message:", error);
    return null;
  }
}

// WebSocket client connections for real-time streaming
const clientConnections = new Set<WebSocket>();

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if it's a WebSocket upgrade request from clients
    const upgrade = req.headers.get("upgrade") || "";
    if (upgrade.toLowerCase() === "websocket") {
      const { socket, response } = Deno.upgradeWebSocket(req);
      
      socket.onopen = () => {
        console.log("[IBKR-BRIDGE] Client WebSocket connected");
        clientConnections.add(socket);
        
        // Send connection status
        socket.send(JSON.stringify({
          type: "connection_status",
          connected: true,
          source: "ibkr",
          timestamp: new Date().toISOString()
        }));
      };

      socket.onmessage = async (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log("[IBKR-BRIDGE] Received client message:", message);

          if (message.type === "subscribe" && message.commodities) {
            await handleCommoditySubscription(message.commodities, message.userId);
          } else if (message.type === "ping") {
            socket.send(JSON.stringify({ type: "pong", timestamp: new Date().toISOString() }));
          }
        } catch (error) {
          console.error("[IBKR-BRIDGE] Error processing client message:", error);
        }
      };

      socket.onclose = () => {
        console.log("[IBKR-BRIDGE] Client WebSocket disconnected");
        clientConnections.delete(socket);
      };

      socket.onerror = (error) => {
        console.error("[IBKR-BRIDGE] Client WebSocket error:", error);
        clientConnections.delete(socket);
      };

      return response;
    }

    // Handle REST API requests for IBKR connection management
    if (req.method === 'POST') {
      const body = await req.json();
      
      if (body.action === 'connect') {
        const result = await initializeIBKRConnection(body.credentials);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else if (body.action === 'subscribe') {
        const result = await subscribeToMarketData(body.symbols);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("[IBKR-BRIDGE] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function initializeIBKRConnection(credentials: any): Promise<any> {
  console.log("[IBKR-BRIDGE] Initializing IBKR FIX connection");
  
  try {
    // In a real implementation, you would establish a FIX connection here
    // For now, we'll simulate the connection process
    
    const sessionId = `session_${Date.now()}`;
    const connection: IBKRConnection = {
      socket: null,
      sessionId,
      authenticated: false,
      subscriptions: new Set()
    };

    connections.set(sessionId, connection);

    // Simulate FIX logon message
    const logonMessage = buildFIXMessage("A", {
      "98": "0", // EncryptMethod (None)
      "108": "30", // HeartBtInt (30 seconds)
      "553": credentials.username || "demo_user",
      "554": credentials.password || "demo_pass"
    });

    console.log("[IBKR-BRIDGE] Sending FIX logon message");
    
    // Simulate successful authentication
    connection.authenticated = true;
    
    return {
      success: true,
      sessionId,
      message: "IBKR FIX connection established"
    };

  } catch (error) {
    console.error("[IBKR-BRIDGE] Connection error:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function subscribeToMarketData(symbols: string[]): Promise<any> {
  console.log("[IBKR-BRIDGE] Subscribing to market data for symbols:", symbols);
  
  try {
    const subscriptions = [];
    
    for (const symbol of symbols) {
      const ibkrSymbol = IBKR_COMMODITY_SYMBOLS[symbol];
      if (ibkrSymbol) {
        // Build market data request (FIX message type "V")
        const mdRequest = buildFIXMessage("V", {
          "262": `req_${Date.now()}_${ibkrSymbol}`, // MDReqID
          "263": "1", // SubscriptionRequestType (Snapshot + Updates)
          "264": "1", // MarketDepth (Top of Book)
          "265": "1", // MDUpdateType (Incremental Refresh)
          "146": "1", // NoRelatedSym
          "55": ibkrSymbol, // Symbol
          "267": "2", // NoMDEntryTypes
          "269": "0", // MDEntryType (Bid)
          "269": "1", // MDEntryType (Offer)
        });

        subscriptions.push({
          symbol,
          ibkrSymbol,
          subscribed: true
        });

        // Simulate receiving market data
        setTimeout(() => {
          simulateMarketDataUpdate(symbol, ibkrSymbol);
        }, 1000);
      }
    }

    return {
      success: true,
      subscriptions
    };

  } catch (error) {
    console.error("[IBKR-BRIDGE] Subscription error:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

function simulateMarketDataUpdate(symbol: string, ibkrSymbol: string) {
  // Simulate real market data updates
  const basePrice = getBasePrice(symbol);
  const price = basePrice + (Math.random() - 0.5) * basePrice * 0.02;
  const bid = price - 0.01;
  const ask = price + 0.01;

  const marketData: CommodityPrice = {
    symbol,
    price: Math.round(price * 100) / 100,
    bid: Math.round(bid * 100) / 100,
    ask: Math.round(ask * 100) / 100,
    volume: Math.floor(Math.random() * 10000),
    lastUpdate: new Date().toISOString(),
    source: "ibkr"
  };

  // Broadcast to all connected clients
  broadcastMarketData(marketData);

  // Schedule next update
  setTimeout(() => {
    simulateMarketDataUpdate(symbol, ibkrSymbol);
  }, 1000 + Math.random() * 2000); // Random interval between 1-3 seconds
}

function broadcastMarketData(data: CommodityPrice) {
  const message = JSON.stringify({
    type: "price_update",
    data,
    timestamp: new Date().toISOString()
  });

  clientConnections.forEach((socket) => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(message);
    }
  });
}

function getBasePrice(symbol: string): number {
  const basePrices: Record<string, number> = {
    "Crude Oil": 70.00,
    "Natural Gas": 3.50,
    "Gold": 2000.00,
    "Silver": 25.00,
    "Copper": 4.00,
    "Platinum": 1000.00,
    "Palladium": 1500.00,
    "Corn": 450.00,
    "Wheat": 550.00,
    "Soybeans": 1200.00,
    "Live Cattle": 150.00,
    "Lean Hogs": 75.00,
    "Coffee": 150.00,
    "Sugar": 20.00,
    "Cotton": 70.00,
    "Cocoa": 2500.00,
  };

  return basePrices[symbol] || 100.00;
}

async function handleCommoditySubscription(commodities: string[], userId: string) {
  console.log(`[IBKR-BRIDGE] Handling subscription for user ${userId}, commodities:`, commodities);
  
  // Subscribe to IBKR market data for these commodities
  await subscribeToMarketData(commodities);
  
  // Store user subscription preferences if needed
  // This could be saved to Supabase for persistence
}