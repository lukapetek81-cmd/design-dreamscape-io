import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface UsdcBalance {
  balance: number;
  frozen_balance: number;
}

export interface SyntheticPosition {
  id: string;
  commodity_name: string;
  direction: 'long' | 'short';
  entry_price: number;
  quantity: number;
  margin_used: number;
  status: 'open' | 'closed';
  unrealized_pnl: number;
  realized_pnl: number | null;
  opened_at: string;
  closed_at: string | null;
}

export interface TradeHistoryItem {
  id: string;
  commodity_name: string;
  direction: 'long' | 'short';
  entry_price: number;
  exit_price: number;
  quantity: number;
  realized_pnl: number;
  closed_at: string;
}

const DEFAULT_STARTING_BALANCE = 10000;

export const useSyntheticTrading = () => {
  const [balance, setBalance] = useState<UsdcBalance>({ balance: 0, frozen_balance: 0 });
  const [positions, setPositions] = useState<SyntheticPosition[]>([]);
  const [tradeHistory, setTradeHistory] = useState<TradeHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchBalance = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('usdc_balances')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching balance:', error);
      return;
    }

    if (!data) {
      // Create initial balance
      const { data: newBalance, error: insertError } = await supabase
        .from('usdc_balances')
        .insert({ user_id: user.id, balance: DEFAULT_STARTING_BALANCE, frozen_balance: 0 })
        .select()
        .single();

      if (!insertError && newBalance) {
        setBalance({ balance: newBalance.balance, frozen_balance: newBalance.frozen_balance });
      }
    } else {
      setBalance({ balance: Number(data.balance), frozen_balance: Number(data.frozen_balance) });
    }
  }, [user]);

  const fetchPositions = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('synthetic_positions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'open')
      .order('opened_at', { ascending: false });

    if (!error && data) {
      setPositions(data.map(p => ({
        ...p,
        entry_price: Number(p.entry_price),
        quantity: Number(p.quantity),
        margin_used: Number(p.margin_used),
        unrealized_pnl: Number(p.unrealized_pnl),
        realized_pnl: p.realized_pnl ? Number(p.realized_pnl) : null,
        direction: p.direction as 'long' | 'short',
        status: p.status as 'open' | 'closed',
      })));
    }
  }, [user]);

  const fetchTradeHistory = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('synthetic_trade_history')
      .select('*')
      .eq('user_id', user.id)
      .order('closed_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      setTradeHistory(data.map(t => ({
        ...t,
        entry_price: Number(t.entry_price),
        exit_price: Number(t.exit_price),
        quantity: Number(t.quantity),
        realized_pnl: Number(t.realized_pnl),
        direction: t.direction as 'long' | 'short',
      })));
    }
  }, [user]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchBalance(), fetchPositions(), fetchTradeHistory()]);
    setLoading(false);
  }, [fetchBalance, fetchPositions, fetchTradeHistory]);

  useEffect(() => {
    if (user) loadAll();
  }, [user, loadAll]);

  const openPosition = async (
    commodityName: string,
    direction: 'long' | 'short',
    amountUsdc: number,
    currentPrice: number
  ) => {
    if (!user) {
      toast({ title: 'Sign in required', description: 'Please sign in to trade.', variant: 'destructive' });
      return false;
    }

    if (amountUsdc <= 0 || amountUsdc > balance.balance) {
      toast({ title: 'Insufficient balance', description: `You need ${amountUsdc} USDC but have ${balance.balance.toFixed(2)} available.`, variant: 'destructive' });
      return false;
    }

    const quantity = amountUsdc / currentPrice;

    // Deduct from balance, add to frozen
    const { error: balError } = await supabase
      .from('usdc_balances')
      .update({
        balance: balance.balance - amountUsdc,
        frozen_balance: balance.frozen_balance + amountUsdc,
      })
      .eq('user_id', user.id);

    if (balError) {
      toast({ title: 'Error', description: 'Failed to update balance.', variant: 'destructive' });
      return false;
    }

    const { error: posError } = await supabase
      .from('synthetic_positions')
      .insert({
        user_id: user.id,
        commodity_name: commodityName,
        direction,
        entry_price: currentPrice,
        quantity,
        margin_used: amountUsdc,
        status: 'open',
        unrealized_pnl: 0,
      });

    if (posError) {
      // Rollback balance
      await supabase.from('usdc_balances').update({
        balance: balance.balance,
        frozen_balance: balance.frozen_balance,
      }).eq('user_id', user.id);
      toast({ title: 'Error', description: 'Failed to open position.', variant: 'destructive' });
      return false;
    }

    toast({ title: 'Position Opened', description: `${direction.toUpperCase()} ${commodityName} — ${amountUsdc.toFixed(2)} USDC` });
    await loadAll();
    return true;
  };

  const closePosition = async (positionId: string, currentPrice: number) => {
    if (!user) return false;

    const position = positions.find(p => p.id === positionId);
    if (!position) return false;

    const priceDiff = currentPrice - position.entry_price;
    const pnl = position.direction === 'long'
      ? priceDiff * position.quantity
      : -priceDiff * position.quantity;

    const returnAmount = position.margin_used + pnl;

    // Update balance: unfreeze margin + add PnL
    const { error: balError } = await supabase
      .from('usdc_balances')
      .update({
        balance: balance.balance + Math.max(0, returnAmount),
        frozen_balance: Math.max(0, balance.frozen_balance - position.margin_used),
      })
      .eq('user_id', user.id);

    if (balError) {
      toast({ title: 'Error', description: 'Failed to update balance.', variant: 'destructive' });
      return false;
    }

    // Close the position
    await supabase
      .from('synthetic_positions')
      .update({ status: 'closed', exit_price: currentPrice, realized_pnl: pnl, closed_at: new Date().toISOString() })
      .eq('id', positionId);

    // Log to trade history
    await supabase
      .from('synthetic_trade_history')
      .insert({
        user_id: user.id,
        commodity_name: position.commodity_name,
        direction: position.direction,
        entry_price: position.entry_price,
        exit_price: currentPrice,
        quantity: position.quantity,
        realized_pnl: pnl,
      });

    const pnlStr = pnl >= 0 ? `+${pnl.toFixed(2)}` : pnl.toFixed(2);
    toast({ title: 'Position Closed', description: `${position.commodity_name} — P&L: ${pnlStr} USDC` });
    await loadAll();
    return true;
  };

  // Calculate unrealized PnL for a position given current price
  const calcUnrealizedPnl = (position: SyntheticPosition, currentPrice: number): number => {
    const priceDiff = currentPrice - position.entry_price;
    return position.direction === 'long'
      ? priceDiff * position.quantity
      : -priceDiff * position.quantity;
  };

  // Stats
  const totalRealizedPnl = tradeHistory.reduce((sum, t) => sum + t.realized_pnl, 0);
  const winRate = tradeHistory.length > 0
    ? (tradeHistory.filter(t => t.realized_pnl > 0).length / tradeHistory.length) * 100
    : 0;

  return {
    balance,
    positions,
    tradeHistory,
    loading,
    openPosition,
    closePosition,
    calcUnrealizedPnl,
    totalRealizedPnl,
    winRate,
    refreshData: loadAll,
  };
};
