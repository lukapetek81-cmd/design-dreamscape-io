import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Download, Filter, TrendingUp, TrendingDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TradeOrder {
  id: string;
  ibkr_order_id: number;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  order_type: string;
  price?: number;
  stop_price?: number;
  tif: string;
  status: string;
  filled_quantity: number;
  avg_fill_price?: number;
  commission?: number;
  created_at: string;
  submitted_at?: string;
  filled_at?: string;
  error_message?: string;
}

interface TradeExecution {
  id: string;
  order_id: string;
  execution_id: string;
  symbol: string;
  side: string;
  quantity: number;
  price: number;
  commission: number;
  executed_at: string;
}

export const TradeHistory: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<TradeOrder[]>([]);
  const [executions, setExecutions] = useState<TradeExecution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'filled' | 'cancelled' | 'pending'>('all');
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('week');

  useEffect(() => {
    if (user) {
      loadTradeHistory();
    }
  }, [user, filter, timeRange]);

  const loadTradeHistory = async () => {
    try {
      setIsLoading(true);
      
      // Build date filter
      let dateFilter = '';
      const now = new Date();
      if (timeRange === 'today') {
        dateFilter = now.toISOString().split('T')[0];
      } else if (timeRange === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFilter = weekAgo.toISOString();
      } else if (timeRange === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        dateFilter = monthAgo.toISOString();
      }

      // Build orders query
      let ordersQuery = supabase
        .from('trading_orders')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (dateFilter) {
        if (timeRange === 'today') {
          ordersQuery = ordersQuery.gte('created_at', dateFilter);
        } else {
          ordersQuery = ordersQuery.gte('created_at', dateFilter);
        }
      }

      if (filter !== 'all') {
        switch (filter) {
          case 'filled':
            ordersQuery = ordersQuery.eq('status', 'Filled');
            break;
          case 'cancelled':
            ordersQuery = ordersQuery.eq('status', 'Cancelled');
            break;
          case 'pending':
            ordersQuery = ordersQuery.in('status', ['PendingSubmit', 'Submitted']);
            break;
        }
      }

      const { data: ordersData, error: ordersError } = await ordersQuery;
      if (ordersError) throw ordersError;

      // Load executions for filled orders
      const filledOrderIds = ordersData?.filter(o => o.status === 'Filled').map(o => o.id) || [];
      let executionsData: TradeExecution[] = [];
      
      if (filledOrderIds.length > 0) {
        const { data: execData, error: execError } = await supabase
          .from('trade_executions')
          .select('*')
          .in('order_id', filledOrderIds)
          .order('executed_at', { ascending: false });
        
        if (execError) throw execError;
        executionsData = execData || [];
      }

      setOrders((ordersData || []).map(order => ({
        ...order,
        side: order.side as 'BUY' | 'SELL'
      })));
      setExecutions(executionsData);

    } catch (error) {
      console.error('Error loading trade history:', error);
      toast({
        title: "Error Loading Trade History",
        description: error instanceof Error ? error.message : 'Failed to load trade history',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Filled': return 'default';
      case 'Cancelled': return 'secondary';
      case 'Rejected': return 'destructive';
      case 'Submitted': return 'outline';
      case 'PendingSubmit': return 'outline';
      default: return 'outline';
    }
  };

  const getSideIcon = (side: string) => {
    return side === 'BUY' ? (
      <TrendingUp className="h-4 w-4 text-success" />
    ) : (
      <TrendingDown className="h-4 w-4 text-destructive" />
    );
  };

  const exportToCsv = () => {
    if (orders.length === 0) return;

    const csvContent = [
      ['Date', 'Symbol', 'Side', 'Quantity', 'Order Type', 'Price', 'Status', 'Filled Qty', 'Avg Fill Price', 'Commission'].join(','),
      ...orders.map(order => [
        new Date(order.created_at).toLocaleDateString(),
        order.symbol,
        order.side,
        order.quantity,
        order.order_type,
        order.price || '',
        order.status,
        order.filled_quantity || '',
        order.avg_fill_price || '',
        order.commission || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trade_history_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalPnL = executions.reduce((sum, exec) => {
    const pnl = exec.side === 'SELL' 
      ? exec.quantity * exec.price - exec.commission
      : -(exec.quantity * exec.price + exec.commission);
    return sum + pnl;
  }, 0);

  const totalCommissions = orders.reduce((sum, order) => sum + (order.commission || 0), 0);

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Orders</span>
              <span className="text-2xl font-bold">{orders.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Filled Orders</span>
              <span className="text-2xl font-bold text-success">
                {orders.filter(o => o.status === 'Filled').length}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total P&L</span>
              <span className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatCurrency(totalPnL)}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Commissions</span>
              <span className="text-2xl font-bold text-muted-foreground">
                {formatCurrency(totalCommissions)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trade History Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Trade History</CardTitle>
              <CardDescription>Your complete trading history and order status</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
                <SelectTrigger className="w-32">
                  <Calendar className="h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger className="w-32">
                  <Filter className="h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="filled">Filled</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" onClick={exportToCsv}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading trade history...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No trades found for the selected criteria
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date/Time</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Side</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Order Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Filled</TableHead>
                    <TableHead>Avg Fill</TableHead>
                    <TableHead>Commission</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">
                        {formatDateTime(order.created_at)}
                      </TableCell>
                      <TableCell className="font-medium">{order.symbol}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getSideIcon(order.side)}
                          <span className={order.side === 'BUY' ? 'text-success' : 'text-destructive'}>
                            {order.side}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{order.quantity.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{order.order_type}</Badge>
                      </TableCell>
                      <TableCell>
                        {order.price ? formatCurrency(order.price) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {order.filled_quantity || 0} / {order.quantity}
                      </TableCell>
                      <TableCell>
                        {order.avg_fill_price ? formatCurrency(order.avg_fill_price) : '-'}
                      </TableCell>
                      <TableCell>
                        {order.commission ? formatCurrency(order.commission) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};