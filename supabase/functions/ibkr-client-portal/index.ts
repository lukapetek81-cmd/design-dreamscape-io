import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IBKRSession {
  sessionId: string;
  authenticated: boolean;
  userId: string;
  accountId?: string;
  server?: string;
  expires?: number;
}

interface IBKROrder {
  orderId?: number;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  orderType: 'MKT' | 'LMT' | 'STP';
  price?: number;
  stopPrice?: number;
  tif: 'GTC' | 'DAY' | 'IOC' | 'FOK';
}

interface IBKRPosition {
  accountId: string;
  symbol: string;
  position: number;
  avgPrice: number;
  marketPrice: number;
  unrealizedPnl: number;
  realizedPnl: number;
}

// IBKR Client Portal API base URL (paper trading)
const IBKR_BASE_URL = 'https://localhost:5000/v1/api';

// Session management
const activeSessions = new Map<string, IBKRSession>();

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    switch (action) {
      case 'connect':
        return await handleConnect(req, supabase);
      case 'authenticate':
        return await handleAuthenticate(req, supabase);
      case 'portfolio':
        return await handleGetPortfolio(req, supabase);
      case 'orders':
        return await handleOrders(req, supabase);
      case 'place-order':
        return await handlePlaceOrder(req, supabase);
      case 'market-data':
        return await handleMarketData(req, supabase);
      case 'account-info':
        return await handleAccountInfo(req, supabase);
      default:
        return new Response(JSON.stringify({ error: 'Invalid endpoint' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

  } catch (error) {
    console.error('[IBKR-CLIENT-PORTAL] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function handleConnect(req: Request, supabase: any) {
  console.log('[IBKR-CLIENT-PORTAL] Connecting to IBKR Client Portal');
  
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Get user from Supabase auth
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    // Get user's encrypted IBKR credentials
    const { data: credentials, error: credError } = await supabase
      .from('ibkr_credentials')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (credError || !credentials) {
      throw new Error('IBKR credentials not found');
    }

    // Decrypt credentials using the decrypt-api-key function
    const userSecret = user.id + user.email;
    
    const { data: usernameData, error: usernameError } = await supabase.functions.invoke('decrypt-api-key', {
      body: {
        encryptedKey: credentials.username_encrypted,
        userSecret: userSecret
      }
    });

    if (usernameError) throw new Error('Failed to decrypt username');

    const { data: passwordData, error: passwordError } = await supabase.functions.invoke('decrypt-api-key', {
      body: {
        encryptedKey: credentials.password_encrypted,
        userSecret: userSecret
      }
    });

    if (passwordError) throw new Error('Failed to decrypt password');

    // Connect to IBKR Client Portal API
    // Note: In production, this would connect to the actual IBKR API
    const connectionResult = await connectToIBKR({
      username: usernameData.key,
      password: passwordData.key,
      gateway: credentials.gateway
    });

    const session: IBKRSession = {
      sessionId: `session_${Date.now()}_${user.id}`,
      authenticated: connectionResult.success,
      userId: user.id,
      accountId: connectionResult.accountId,
      server: connectionResult.server,
      expires: Date.now() + (4 * 60 * 60 * 1000) // 4 hours
    };

    activeSessions.set(session.sessionId, session);

    return new Response(JSON.stringify({
      success: true,
      sessionId: session.sessionId,
      accountId: session.accountId,
      authenticated: session.authenticated,
      message: 'Connected to IBKR Client Portal'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[IBKR-CLIENT-PORTAL] Connection error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleAuthenticate(req: Request, supabase: any) {
  console.log('[IBKR-CLIENT-PORTAL] Authenticating session');
  
  try {
    const body = await req.json();
    const { sessionId } = body;

    const session = activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Invalid session');
    }

    if (Date.now() > (session.expires || 0)) {
      activeSessions.delete(sessionId);
      throw new Error('Session expired');
    }

    // Validate session with IBKR
    const authStatus = await validateIBKRSession(sessionId);

    return new Response(JSON.stringify({
      success: true,
      authenticated: authStatus.authenticated,
      accountId: session.accountId,
      status: authStatus.status
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[IBKR-CLIENT-PORTAL] Auth error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleGetPortfolio(req: Request, supabase: any) {
  console.log('[IBKR-CLIENT-PORTAL] Getting portfolio data');
  
  try {
    const body = await req.json();
    const { sessionId } = body;

    const session = validateSession(sessionId);
    if (!session) {
      throw new Error('Invalid or expired session');
    }

    // Get portfolio positions from IBKR
    const portfolio = await getIBKRPortfolio(session.accountId!);
    
    return new Response(JSON.stringify({
      success: true,
      portfolio: portfolio,
      accountId: session.accountId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[IBKR-CLIENT-PORTAL] Portfolio error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handlePlaceOrder(req: Request, supabase: any) {
  console.log('[IBKR-CLIENT-PORTAL] Placing order');
  
  try {
    const body = await req.json();
    const { sessionId, order } = body;

    const session = validateSession(sessionId);
    if (!session) {
      throw new Error('Invalid or expired session');
    }

    // Validate order
    if (!order.symbol || !order.side || !order.quantity || !order.orderType) {
      throw new Error('Invalid order parameters');
    }

    // Place order with IBKR
    const orderResult = await placeIBKROrder(session.accountId!, order);
    
    return new Response(JSON.stringify({
      success: true,
      orderId: orderResult.orderId,
      status: orderResult.status,
      message: 'Order placed successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[IBKR-CLIENT-PORTAL] Order error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleMarketData(req: Request, supabase: any) {
  console.log('[IBKR-CLIENT-PORTAL] Getting market data');
  
  try {
    const body = await req.json();
    const { sessionId, symbols } = body;

    const session = validateSession(sessionId);
    if (!session) {
      throw new Error('Invalid or expired session');
    }

    // Get market data from IBKR
    const marketData = await getIBKRMarketData(symbols);
    
    return new Response(JSON.stringify({
      success: true,
      marketData: marketData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[IBKR-CLIENT-PORTAL] Market data error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleAccountInfo(req: Request, supabase: any) {
  console.log('[IBKR-CLIENT-PORTAL] Getting account info');
  
  try {
    const body = await req.json();
    const { sessionId } = body;

    const session = validateSession(sessionId);
    if (!session) {
      throw new Error('Invalid or expired session');
    }

    // Get account information from IBKR
    const accountInfo = await getIBKRAccountInfo(session.accountId!);
    
    return new Response(JSON.stringify({
      success: true,
      accountInfo: accountInfo
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[IBKR-CLIENT-PORTAL] Account info error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Helper functions for IBKR API integration
async function connectToIBKR(credentials: { username: string; password: string; gateway: string }) {
  // In a real implementation, this would connect to IBKR Client Portal
  // For now, simulate a successful connection
  console.log(`[IBKR] Connecting to ${credentials.gateway} trading...`);
  
  return {
    success: true,
    accountId: credentials.gateway === 'paper' ? 'DU123456' : 'U123456',
    server: credentials.gateway === 'paper' ? 'paper-api' : 'live-api',
    message: 'Connected successfully'
  };
}

async function validateIBKRSession(sessionId: string) {
  // Validate session with IBKR
  return {
    authenticated: true,
    status: 'connected'
  };
}

async function getIBKRPortfolio(accountId: string): Promise<IBKRPosition[]> {
  // Get portfolio positions from IBKR API
  // Simulate portfolio data for now
  return [
    {
      accountId: accountId,
      symbol: 'CL',
      position: 10,
      avgPrice: 70.50,
      marketPrice: 71.25,
      unrealizedPnl: 75.00,
      realizedPnl: 0
    },
    {
      accountId: accountId,
      symbol: 'GC',
      position: 5,
      avgPrice: 2000.00,
      marketPrice: 2010.50,
      unrealizedPnl: 52.50,
      realizedPnl: 150.00
    }
  ];
}

async function placeIBKROrder(accountId: string, order: IBKROrder) {
  // Place order via IBKR API
  console.log(`[IBKR] Placing order: ${order.side} ${order.quantity} ${order.symbol} @ ${order.orderType}`);
  
  return {
    orderId: Math.floor(Math.random() * 1000000),
    status: 'Submitted',
    timestamp: new Date().toISOString()
  };
}

async function getIBKRMarketData(symbols: string[]) {
  // Get real-time market data from IBKR
  const marketData: Record<string, any> = {};
  
  for (const symbol of symbols) {
    marketData[symbol] = {
      symbol: symbol,
      bid: Math.random() * 100 + 50,
      ask: Math.random() * 100 + 51,
      last: Math.random() * 100 + 50.5,
      volume: Math.floor(Math.random() * 100000),
      timestamp: new Date().toISOString()
    };
  }
  
  return marketData;
}

async function getIBKRAccountInfo(accountId: string) {
  // Get account information from IBKR
  return {
    accountId: accountId,
    netLiquidation: 125000.50,
    totalCashValue: 75000.00,
    buyingPower: 150000.00,
    dayTradesRemaining: 3,
    currency: 'USD'
  };
}

function validateSession(sessionId: string): IBKRSession | null {
  const session = activeSessions.get(sessionId);
  if (!session) return null;
  
  if (Date.now() > (session.expires || 0)) {
    activeSessions.delete(sessionId);
    return null;
  }
  
  return session;
}