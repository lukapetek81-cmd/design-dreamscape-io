import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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

interface IBKRAccountInfo {
  accountId: string;
  netLiquidation: number;
  totalCashValue: number;
  buyingPower: number;
  dayTradesRemaining: number;
  currency: string;
}

interface IBKRSession {
  sessionId: string;
  accountId: string;
  authenticated: boolean;
}

export const useIBKRTrading = () => {
  const { user, isPremium } = useAuth();
  const { toast } = useToast();
  
  const [session, setSession] = useState<IBKRSession | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [portfolio, setPortfolio] = useState<IBKRPosition[]>([]);
  const [accountInfo, setAccountInfo] = useState<IBKRAccountInfo | null>(null);
  const [marketData, setMarketData] = useState<Record<string, any>>({});

  const connect = useCallback(async () => {
    if (!user || !isPremium) {
      toast({
        title: "Access Denied",
        description: "Premium subscription required for IBKR trading",
        variant: "destructive"
      });
      return false;
    }

    try {
      setIsConnecting(true);
      
      const { data, error } = await supabase.functions.invoke('ibkr-client-portal/connect', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (error) throw error;

      if (data.success) {
        setSession({
          sessionId: data.sessionId,
          accountId: data.accountId,
          authenticated: data.authenticated
        });

        toast({
          title: "Connected",
          description: "Successfully connected to IBKR",
        });

        return true;
      } else {
        throw new Error(data.error || 'Connection failed');
      }

    } catch (error) {
      console.error('IBKR connection error:', error);
      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : "Failed to connect to IBKR",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [user, isPremium, toast]);

  const disconnect = useCallback(() => {
    setSession(null);
    setPortfolio([]);
    setAccountInfo(null);
    setMarketData({});
    
    toast({
      title: "Disconnected",
      description: "Disconnected from IBKR",
    });
  }, [toast]);

  const refreshPortfolio = useCallback(async () => {
    if (!session) return;

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('ibkr-client-portal/portfolio', {
        body: { sessionId: session.sessionId }
      });

      if (error) throw error;

      if (data.success) {
        setPortfolio(data.portfolio);
      } else {
        throw new Error(data.error || 'Failed to get portfolio');
      }

    } catch (error) {
      console.error('Portfolio error:', error);
      toast({
        title: "Portfolio Error",
        description: error instanceof Error ? error.message : "Failed to load portfolio",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [session, toast]);

  const refreshAccountInfo = useCallback(async () => {
    if (!session) return;

    try {
      const { data, error } = await supabase.functions.invoke('ibkr-client-portal/account-info', {
        body: { sessionId: session.sessionId }
      });

      if (error) throw error;

      if (data.success) {
        setAccountInfo(data.accountInfo);
      } else {
        throw new Error(data.error || 'Failed to get account info');
      }

    } catch (error) {
      console.error('Account info error:', error);
      toast({
        title: "Account Info Error",
        description: error instanceof Error ? error.message : "Failed to load account info",
        variant: "destructive"
      });
    }
  }, [session, toast]);

  const placeOrder = useCallback(async (order: IBKROrder) => {
    if (!session) {
      throw new Error('Not connected to IBKR');
    }

    try {
      const { data, error } = await supabase.functions.invoke('ibkr-client-portal/place-order', {
        body: { 
          sessionId: session.sessionId,
          order: order
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Order Placed",
          description: `Order ${data.orderId} submitted successfully`,
        });
        
        // Refresh portfolio after order
        await refreshPortfolio();
        
        return data.orderId;
      } else {
        throw new Error(data.error || 'Failed to place order');
      }

    } catch (error) {
      console.error('Order error:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to place order";
      
      toast({
        title: "Order Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    }
  }, [session, toast, refreshPortfolio]);

  const getMarketData = useCallback(async (symbols: string[]) => {
    if (!session) return {};

    try {
      const { data, error } = await supabase.functions.invoke('ibkr-client-portal/market-data', {
        body: { 
          sessionId: session.sessionId,
          symbols: symbols
        }
      });

      if (error) throw error;

      if (data.success) {
        setMarketData(prev => ({ ...prev, ...data.marketData }));
        return data.marketData;
      } else {
        throw new Error(data.error || 'Failed to get market data');
      }

    } catch (error) {
      console.error('Market data error:', error);
      return {};
    }
  }, [session]);

  return {
    // Connection state
    session,
    isConnected: !!session?.authenticated,
    isConnecting,
    isLoading,
    
    // Data
    portfolio,
    accountInfo,
    marketData,
    
    // Actions
    connect,
    disconnect,
    refreshPortfolio,
    refreshAccountInfo,
    placeOrder,
    getMarketData,
  };
};