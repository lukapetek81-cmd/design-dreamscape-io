import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface CommodityPrice {
  symbol: string;
  price: number;
  bid?: number;
  ask?: number;
  volume?: number;
  lastUpdate: string;
  source: string;
}

interface IBKRCredentials {
  username: string;
  password: string;
  gateway?: string; // 'live' or 'paper'
}

interface UseIBKRRealtimeDataProps {
  commodities: string[];
  enabled?: boolean;
  credentials?: IBKRCredentials;
}

interface IBKRRealtimeDataHook {
  prices: Record<string, CommodityPrice>;
  connected: boolean;
  authenticated: boolean;
  error: string | null;
  lastUpdate: Date | null;
  connect: (credentials: IBKRCredentials) => Promise<void>;
  disconnect: () => void;
  subscribe: (symbols: string[]) => Promise<void>;
}

export const useIBKRRealtimeData = ({ 
  commodities, 
  enabled = true,
  credentials 
}: UseIBKRRealtimeDataProps): IBKRRealtimeDataHook => {
  const { user, profile } = useAuth();
  const [prices, setPrices] = useState<Record<string, CommodityPrice>>({});
  const [connected, setConnected] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  const websocketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const isPremium = profile?.subscription_active && profile?.subscription_tier === 'premium';

  const cleanup = useCallback(() => {
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    
    setConnected(false);
    setAuthenticated(false);
  }, []);

  const connect = useCallback(async (ibkrCredentials: IBKRCredentials): Promise<void> => {
    if (!isPremium) {
      setError('IBKR real-time data requires premium subscription');
      return;
    }

    const session = await supabase.auth.getSession();
    if (!session.data.session?.access_token) {
      setError('Authentication required');
      return;
    }

    setError(null);
    
    try {
      // First, authenticate with IBKR via our edge function
      const authResponse = await fetch('https://kcxhsmlqqyarhlmcapmj.supabase.co/functions/v1/ibkr-fix-bridge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`,
        },
        body: JSON.stringify({
          action: 'connect',
          credentials: ibkrCredentials
        })
      });

      const authResult = await authResponse.json();
      
      if (!authResult.success) {
        throw new Error(authResult.error || 'IBKR authentication failed');
      }

      sessionIdRef.current = authResult.sessionId;
      setAuthenticated(true);
      console.log('[IBKR-DATA] IBKR session established:', authResult.sessionId);

      // Now establish WebSocket connection
      const wsUrl = 'wss://kcxhsmlqqyarhlmcapmj.supabase.co/functions/v1/ibkr-fix-bridge';
      websocketRef.current = new WebSocket(wsUrl);

      websocketRef.current.onopen = () => {
        console.log('[IBKR-DATA] WebSocket connected');
        setConnected(true);
        setError(null);
        reconnectAttempts.current = 0;

        // Send initial subscription if commodities are provided
        if (commodities.length > 0) {
          websocketRef.current?.send(JSON.stringify({
            type: 'subscribe',
            commodities,
            userId: user.id,
            sessionId: sessionIdRef.current
          }));
        }

        // Set up ping interval
        pingIntervalRef.current = setInterval(() => {
          if (websocketRef.current?.readyState === WebSocket.OPEN) {
            websocketRef.current.send(JSON.stringify({ 
              type: 'ping', 
              timestamp: Date.now() 
            }));
          }
        }, 30000); // Ping every 30 seconds
      };

      websocketRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('[IBKR-DATA] Received message:', message);

          switch (message.type) {
            case 'connection_status':
              setConnected(message.connected);
              break;
              
            case 'price_update':
              const priceData = message.data;
              setPrices(prev => ({
                ...prev,
                [priceData.symbol]: priceData
              }));
              setLastUpdate(new Date());
              break;
              
            case 'pong':
              // Keep-alive response
              break;
              
            case 'error':
              console.error('[IBKR-DATA] Server error:', message.error);
              setError(message.error);
              break;
              
            default:
              console.log('[IBKR-DATA] Unknown message type:', message.type);
          }
        } catch (error) {
          console.error('[IBKR-DATA] Error parsing message:', error);
        }
      };

      websocketRef.current.onclose = (event) => {
        console.log('[IBKR-DATA] WebSocket disconnected:', event.code, event.reason);
        setConnected(false);
        
        // Attempt to reconnect if not a manual disconnect
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          console.log(`[IBKR-DATA] Reconnecting in ${delay}ms...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect(ibkrCredentials);
          }, delay);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          setError('Max reconnection attempts reached. Please refresh the page.');
        }
      };

      websocketRef.current.onerror = (error) => {
        console.error('[IBKR-DATA] WebSocket error:', error);
        setError('WebSocket connection error');
      };

    } catch (error) {
      console.error('[IBKR-DATA] Connection error:', error);
      setError(error instanceof Error ? error.message : 'Connection failed');
      setAuthenticated(false);
    }
  }, [user, isPremium, commodities]);

  const disconnect = useCallback(() => {
    cleanup();
    setError(null);
    reconnectAttempts.current = 0;
    sessionIdRef.current = null;
  }, [cleanup]);

  const subscribe = useCallback(async (symbols: string[]): Promise<void> => {
    if (!connected || !websocketRef.current) {
      throw new Error('Not connected to IBKR');
    }

    try {
      // Subscribe via REST API first
      const session = await supabase.auth.getSession();
      const response = await fetch('https://kcxhsmlqqyarhlmcapmj.supabase.co/functions/v1/ibkr-fix-bridge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session?.access_token}`,
        },
        body: JSON.stringify({
          action: 'subscribe',
          symbols
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Subscription failed');
      }

      // Also notify WebSocket
      websocketRef.current.send(JSON.stringify({
        type: 'subscribe',
        commodities: symbols,
        userId: user?.id,
        sessionId: sessionIdRef.current
      }));

      console.log('[IBKR-DATA] Subscribed to symbols:', symbols);
    } catch (error) {
      console.error('[IBKR-DATA] Subscription error:', error);
      throw error;
    }
  }, [connected, user]);

  // Auto-connect if credentials are provided and enabled
  useEffect(() => {
    if (enabled && credentials && isPremium && user) {
      connect(credentials);
    }
    
    return cleanup;
  }, [enabled, credentials, isPremium, user, connect, cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    prices,
    connected,
    authenticated,
    error,
    lastUpdate,
    connect,
    disconnect,
    subscribe
  };
};
