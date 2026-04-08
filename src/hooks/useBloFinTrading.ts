import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface BloFinPosition {
  instId: string;
  positionSide: string;
  availablePosition: string;
  averagePrice: string;
  unrealizedPnl: string;
  leverage: string;
  marginMode: string;
}

export interface BloFinBalance {
  currency: string;
  balance: string;
  available: string;
  frozen: string;
  unrealizedPnl: string;
}

export interface BloFinOrder {
  instId: string;
  side: 'buy' | 'sell';
  orderType: 'market' | 'limit' | 'post_only';
  size: string;
  price?: string;
}

export interface BloFinTicker {
  instId: string;
  last: string;
  askPrice: string;
  bidPrice: string;
  high24h: string;
  low24h: string;
  volume24h: string;
  changePercent24h: string;
}

export const useBloFinTrading = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [balances, setBalances] = useState<BloFinBalance[]>([]);
  const [positions, setPositions] = useState<BloFinPosition[]>([]);
  const [openOrders, setOpenOrders] = useState<any[]>([]);
  const [tickers, setTickers] = useState<BloFinTicker[]>([]);

  const invokeBlofin = useCallback(async (action: string, extra: Record<string, any> = {}) => {
    const { data, error } = await supabase.functions.invoke('blofin-trading', {
      body: { action, ...extra },
    });
    if (error) throw new Error(error.message);
    return data;
  }, []);

  const testConnection = useCallback(async () => {
    if (!user) return false;
    try {
      setIsLoading(true);
      const result = await invokeBlofin('test-connection');
      const connected = result.success === true;
      setIsConnected(connected);
      toast({
        title: connected ? 'Connected to BloFin' : 'Connection Failed',
        description: connected ? `Environment: ${result.environment}` : result.message,
        variant: connected ? 'default' : 'destructive',
      });
      return connected;
    } catch (err) {
      setIsConnected(false);
      toast({
        title: 'Connection Error',
        description: err instanceof Error ? err.message : 'Failed to connect',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, invokeBlofin, toast]);

  const fetchBalances = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await invokeBlofin('account-balance');
      if (result.code === '0' && result.data) {
        setBalances(result.data);
        setIsConnected(true);
      }
      return result.data || [];
    } catch (err) {
      console.error('Failed to fetch balances:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [invokeBlofin]);

  const fetchPositions = useCallback(async () => {
    try {
      const result = await invokeBlofin('positions');
      if (result.code === '0' && result.data) {
        setPositions(result.data);
      }
      return result.data || [];
    } catch (err) {
      console.error('Failed to fetch positions:', err);
      return [];
    }
  }, [invokeBlofin]);

  const fetchOpenOrders = useCallback(async () => {
    try {
      const result = await invokeBlofin('open-orders');
      if (result.code === '0' && result.data) {
        setOpenOrders(result.data);
      }
      return result.data || [];
    } catch (err) {
      console.error('Failed to fetch open orders:', err);
      return [];
    }
  }, [invokeBlofin]);

  const fetchTickers = useCallback(async () => {
    try {
      const result = await invokeBlofin('tickers');
      if (result.code === '0' && result.data) {
        setTickers(result.data);
      }
      return result.data || [];
    } catch (err) {
      console.error('Failed to fetch tickers:', err);
      return [];
    }
  }, [invokeBlofin]);

  const placeOrder = useCallback(async (order: BloFinOrder) => {
    try {
      setIsLoading(true);
      const result = await invokeBlofin('place-order', {
        instId: order.instId,
        side: order.side,
        orderType: order.orderType,
        size: order.size,
        price: order.price,
      });

      if (result.code === '0') {
        toast({ title: 'Order Placed', description: `${order.side.toUpperCase()} ${order.size} ${order.instId}` });
        await fetchPositions();
        await fetchOpenOrders();
        return result.data;
      } else {
        throw new Error(result.msg || 'Order failed');
      }
    } catch (err) {
      toast({
        title: 'Order Error',
        description: err instanceof Error ? err.message : 'Failed to place order',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [invokeBlofin, toast, fetchPositions, fetchOpenOrders]);

  const cancelOrder = useCallback(async (orderId: string, instId: string) => {
    try {
      const result = await invokeBlofin('cancel-order', { orderId, instId });
      if (result.code === '0') {
        toast({ title: 'Order Cancelled' });
        await fetchOpenOrders();
      } else {
        throw new Error(result.msg || 'Cancel failed');
      }
    } catch (err) {
      toast({
        title: 'Cancel Error',
        description: err instanceof Error ? err.message : 'Failed to cancel order',
        variant: 'destructive',
      });
    }
  }, [invokeBlofin, toast, fetchOpenOrders]);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchBalances(), fetchPositions(), fetchOpenOrders()]);
  }, [fetchBalances, fetchPositions, fetchOpenOrders]);

  return {
    isLoading,
    isConnected,
    balances,
    positions,
    openOrders,
    tickers,
    testConnection,
    fetchBalances,
    fetchPositions,
    fetchOpenOrders,
    fetchTickers,
    placeOrder,
    cancelOrder,
    refreshAll,
  };
};
