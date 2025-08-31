import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MarketData {
  symbol: string;
  bid: number;
  ask: number;
  last: number;
  volume: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

interface UseRealTimeMarketDataProps {
  symbols: string[];
  sessionId?: string;
  enabled?: boolean;
}

export const useRealTimeMarketData = ({ 
  symbols, 
  sessionId,
  enabled = true 
}: UseRealTimeMarketDataProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [marketData, setMarketData] = useState<Record<string, MarketData>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const connectionIdRef = useRef<string | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(async () => {
    if (!user || !sessionId || !enabled || symbols.length === 0) {
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const wsUrl = `wss://kcxhsmlqqyarhlmcapmj.functions.supabase.co/ibkr-realtime-stream`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('[MARKET-DATA] WebSocket connected');
        setIsConnected(true);
        setIsConnecting(false);
        reconnectAttempts.current = 0;

        // Get auth token from supabase client
        const getToken = async () => {
          const { data: { session } } = await supabase.auth.getSession();
          return session?.access_token;
        };

        // Authenticate first
        getToken().then(token => {
          if (wsRef.current && token) {
            wsRef.current.send(JSON.stringify({
              type: 'authenticate',
              token: token,
              sessionId: sessionId
            }));
          }
        });
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('[MARKET-DATA] Received:', message);

          switch (message.type) {
            case 'authenticated':
              connectionIdRef.current = message.connectionId;
              // Subscribe to market data after authentication
              if (wsRef.current) {
                wsRef.current.send(JSON.stringify({
                  type: 'subscribe',
                  symbols: symbols,
                  connectionId: message.connectionId
                }));
              }
              break;

            case 'subscribed':
              console.log('[MARKET-DATA] Subscribed to symbols:', message.symbols);
              break;

            case 'market_data':
              // Update market data state
              const dataMap: Record<string, MarketData> = {};
              message.data.forEach((data: MarketData) => {
                dataMap[data.symbol] = data;
              });
              setMarketData(prev => ({ ...prev, ...dataMap }));
              break;

            case 'error':
            case 'auth_error':
            case 'subscription_error':
              console.error('[MARKET-DATA] Error:', message.message);
              setError(message.message);
              toast({
                title: "Market Data Error",
                description: message.message,
                variant: "destructive"
              });
              break;
          }
        } catch (err) {
          console.error('[MARKET-DATA] Message parsing error:', err);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('[MARKET-DATA] WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        setIsConnecting(false);
        connectionIdRef.current = null;

        // Attempt to reconnect if not manually closed
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000; // Exponential backoff
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            console.log(`[MARKET-DATA] Reconnecting (attempt ${reconnectAttempts.current})`);
            connect();
          }, delay);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('[MARKET-DATA] WebSocket error:', error);
        setError('WebSocket connection error');
        setIsConnecting(false);
      };

    } catch (err) {
      console.error('[MARKET-DATA] Connection error:', err);
      setError(err instanceof Error ? err.message : 'Connection failed');
      setIsConnecting(false);
    }
  }, [user, sessionId, enabled, symbols, toast]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
    setError(null);
    connectionIdRef.current = null;
    reconnectAttempts.current = 0;
  }, []);

  const updateSymbols = useCallback((newSymbols: string[]) => {
    if (isConnected && connectionIdRef.current && wsRef.current) {
      // Unsubscribe from current symbols
      wsRef.current.send(JSON.stringify({
        type: 'unsubscribe',
        connectionId: connectionIdRef.current
      }));

      // Subscribe to new symbols
      if (newSymbols.length > 0) {
        wsRef.current.send(JSON.stringify({
          type: 'subscribe',
          symbols: newSymbols,
          connectionId: connectionIdRef.current
        }));
      }
    }
  }, [isConnected]);

  // Connect when enabled and dependencies change
  useEffect(() => {
    if (enabled && user && sessionId && symbols.length > 0) {
      connect();
    } else {
      disconnect();
    }

    return disconnect;
  }, [enabled, user, sessionId, symbols.length, connect, disconnect]);

  // Update symbols when they change
  useEffect(() => {
    if (symbols.length > 0 && isConnected) {
      updateSymbols(symbols);
    }
  }, [symbols, isConnected, updateSymbols]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    marketData,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    updateSymbols
  };
};