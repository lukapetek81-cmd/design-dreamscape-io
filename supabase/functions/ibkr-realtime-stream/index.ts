import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MarketDataSubscription {
  symbols: string[];
  userId: string;
  sessionId: string;
}

// Active WebSocket connections
const activeConnections = new Map<string, WebSocket>();
const marketSubscriptions = new Map<string, MarketDataSubscription>();

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Handle WebSocket upgrade for real-time data streaming
    const upgrade = req.headers.get("upgrade") || "";
    if (upgrade.toLowerCase() !== "websocket") {
      return new Response("Expected WebSocket upgrade", { status: 426 });
    }

    const { socket, response } = Deno.upgradeWebSocket(req);
    
    socket.onopen = () => {
      console.log('[REALTIME-STREAM] WebSocket connection opened');
    };

    socket.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('[REALTIME-STREAM] Received message:', message);

        switch (message.type) {
          case 'authenticate':
            await handleAuthentication(socket, message, supabase);
            break;
          case 'subscribe':
            await handleSubscription(socket, message, supabase);
            break;
          case 'unsubscribe':
            await handleUnsubscription(socket, message);
            break;
          default:
            socket.send(JSON.stringify({
              type: 'error',
              message: 'Unknown message type'
            }));
        }
      } catch (error) {
        console.error('[REALTIME-STREAM] Message processing error:', error);
        socket.send(JSON.stringify({
          type: 'error',
          message: error.message
        }));
      }
    };

    socket.onclose = () => {
      console.log('[REALTIME-STREAM] WebSocket connection closed');
      // Clean up subscriptions
      for (const [key, conn] of activeConnections.entries()) {
        if (conn === socket) {
          activeConnections.delete(key);
          marketSubscriptions.delete(key);
          break;
        }
      }
    };

    socket.onerror = (error) => {
      console.error('[REALTIME-STREAM] WebSocket error:', error);
    };

    return response;

  } catch (error) {
    console.error('[REALTIME-STREAM] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function handleAuthentication(socket: WebSocket, message: any, supabase: any) {
  try {
    const { token, sessionId } = message;
    
    // Verify user token
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      throw new Error('Invalid authentication token');
    }

    // Verify IBKR session exists
    const { data: session } = await supabase
      .from('trading_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!session) {
      throw new Error('Invalid or expired trading session');
    }

    const connectionId = `${user.id}_${sessionId}`;
    activeConnections.set(connectionId, socket);

    socket.send(JSON.stringify({
      type: 'authenticated',
      connectionId: connectionId,
      message: 'Successfully authenticated'
    }));

    console.log(`[REALTIME-STREAM] User ${user.id} authenticated with session ${sessionId}`);
  } catch (error) {
    console.error('[REALTIME-STREAM] Authentication error:', error);
    socket.send(JSON.stringify({
      type: 'auth_error',
      message: error.message
    }));
  }
}

async function handleSubscription(socket: WebSocket, message: any, supabase: any) {
  try {
    const { symbols, connectionId } = message;
    
    if (!activeConnections.has(connectionId)) {
      throw new Error('Connection not authenticated');
    }

    // Store subscription
    marketSubscriptions.set(connectionId, {
      symbols: symbols,
      userId: connectionId.split('_')[0],
      sessionId: connectionId.split('_')[1]
    });

    // Start real-time data stream for symbols
    await startMarketDataStream(connectionId, symbols);

    socket.send(JSON.stringify({
      type: 'subscribed',
      symbols: symbols,
      message: 'Successfully subscribed to market data'
    }));

    console.log(`[REALTIME-STREAM] Subscribed to symbols: ${symbols.join(', ')}`);
  } catch (error) {
    console.error('[REALTIME-STREAM] Subscription error:', error);
    socket.send(JSON.stringify({
      type: 'subscription_error',
      message: error.message
    }));
  }
}

async function handleUnsubscription(socket: WebSocket, message: any) {
  try {
    const { connectionId } = message;
    
    if (marketSubscriptions.has(connectionId)) {
      marketSubscriptions.delete(connectionId);
      socket.send(JSON.stringify({
        type: 'unsubscribed',
        message: 'Successfully unsubscribed from market data'
      }));
    }
  } catch (error) {
    console.error('[REALTIME-STREAM] Unsubscription error:', error);
    socket.send(JSON.stringify({
      type: 'unsubscription_error',
      message: error.message
    }));
  }
}

async function startMarketDataStream(connectionId: string, symbols: string[]) {
  // Simulate real-time market data updates
  // In a real implementation, this would connect to IBKR's WebSocket API
  const interval = setInterval(() => {
    const socket = activeConnections.get(connectionId);
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      clearInterval(interval);
      return;
    }

    // Generate mock real-time data for each symbol
    const marketData = symbols.map(symbol => ({
      symbol: symbol,
      bid: Math.random() * 100 + 50,
      ask: Math.random() * 100 + 51,
      last: Math.random() * 100 + 50.5,
      volume: Math.floor(Math.random() * 100000),
      change: (Math.random() - 0.5) * 5,
      changePercent: (Math.random() - 0.5) * 10,
      timestamp: new Date().toISOString()
    }));

    socket.send(JSON.stringify({
      type: 'market_data',
      data: marketData,
      timestamp: new Date().toISOString()
    }));
  }, 1000); // Update every second

  // Store interval for cleanup
  setTimeout(() => {
    clearInterval(interval);
  }, 300000); // Clean up after 5 minutes if connection still exists
}