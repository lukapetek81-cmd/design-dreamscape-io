import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useBloFinTrading, BloFinOrder } from '@/hooks/useBloFinTrading';
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, Activity, X } from 'lucide-react';

export const BloFinDashboard: React.FC = () => {
  const {
    isLoading, isConnected, balances, positions, openOrders, tickers,
    testConnection, fetchBalances, fetchPositions, fetchOpenOrders, fetchTickers,
    placeOrder, cancelOrder, refreshAll,
  } = useBloFinTrading();

  const [orderForm, setOrderForm] = useState<BloFinOrder>({
    instId: 'BTC-USDT',
    side: 'buy',
    orderType: 'market',
    size: '0.01',
    price: '',
  });

  useEffect(() => {
    testConnection().then(connected => {
      if (connected) refreshAll();
    });
  }, []);

  const handlePlaceOrder = async () => {
    try {
      await placeOrder(orderForm);
      setOrderForm(prev => ({ ...prev, size: '0.01', price: '' }));
    } catch {
      // Error handled in hook
    }
  };

  const formatNum = (val: string | number, decimals = 2) => {
    const n = typeof val === 'string' ? parseFloat(val) : val;
    return isNaN(n) ? '0.00' : n.toFixed(decimals);
  };

  if (!isConnected && !isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>BloFin Trading</CardTitle>
          <CardDescription>Save your API credentials above, then test the connection.</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Activity className="h-4 w-4" />
            <AlertDescription>
              Not connected. Please add and save your BloFin API credentials first, then click "Test Connection".
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Account Balance */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Account Balance
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-emerald-600">Connected</Badge>
              <Button variant="ghost" size="sm" onClick={refreshAll} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {balances.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {balances.slice(0, 4).map((b, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">{b.currency || 'USDT'}</p>
                  <p className="text-lg font-bold">${formatNum(b.balance)}</p>
                  <p className="text-xs text-muted-foreground">Available: ${formatNum(b.available)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No balance data available</p>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="positions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="positions">Positions ({positions.length})</TabsTrigger>
          <TabsTrigger value="orders">Open Orders ({openOrders.length})</TabsTrigger>
          <TabsTrigger value="trade">New Order</TabsTrigger>
        </TabsList>

        {/* Positions Tab */}
        <TabsContent value="positions">
          <Card>
            <CardContent className="pt-4">
              {positions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Instrument</TableHead>
                      <TableHead>Side</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Avg Price</TableHead>
                      <TableHead>PnL</TableHead>
                      <TableHead>Leverage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {positions.map((pos, i) => {
                      const pnl = parseFloat(pos.unrealizedPnl || '0');
                      return (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{pos.instId}</TableCell>
                          <TableCell>
                            <Badge variant={pos.positionSide === 'long' ? 'default' : 'destructive'}>
                              {pos.positionSide}
                            </Badge>
                          </TableCell>
                          <TableCell>{pos.availablePosition}</TableCell>
                          <TableCell>${formatNum(pos.averagePrice)}</TableCell>
                          <TableCell className={pnl >= 0 ? 'text-emerald-600' : 'text-red-500'}>
                            {pnl >= 0 ? '+' : ''}{formatNum(pos.unrealizedPnl)}
                          </TableCell>
                          <TableCell>{pos.leverage}x</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">No open positions</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Open Orders Tab */}
        <TabsContent value="orders">
          <Card>
            <CardContent className="pt-4">
              {openOrders.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Instrument</TableHead>
                      <TableHead>Side</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {openOrders.map((order, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{order.instId}</TableCell>
                        <TableCell>
                          <Badge variant={order.side === 'buy' ? 'default' : 'destructive'}>
                            {order.side}
                          </Badge>
                        </TableCell>
                        <TableCell>{order.orderType}</TableCell>
                        <TableCell>{order.size}</TableCell>
                        <TableCell>${order.price || 'Market'}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => cancelOrder(order.orderId, order.instId)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">No open orders</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* New Order Tab */}
        <TabsContent value="trade">
          <Card>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Instrument</Label>
                  <Input
                    value={orderForm.instId}
                    onChange={e => setOrderForm(prev => ({ ...prev, instId: e.target.value }))}
                    placeholder="BTC-USDT"
                  />
                </div>
                <div>
                  <Label>Size</Label>
                  <Input
                    type="number"
                    value={orderForm.size}
                    onChange={e => setOrderForm(prev => ({ ...prev, size: e.target.value }))}
                    placeholder="0.01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Order Type</Label>
                  <select
                    value={orderForm.orderType}
                    onChange={e => setOrderForm(prev => ({ ...prev, orderType: e.target.value as any }))}
                    className="w-full p-2 border border-input rounded-md bg-background"
                  >
                    <option value="market">Market</option>
                    <option value="limit">Limit</option>
                    <option value="post_only">Post Only</option>
                  </select>
                </div>
                {orderForm.orderType !== 'market' && (
                  <div>
                    <Label>Price</Label>
                    <Input
                      type="number"
                      value={orderForm.price}
                      onChange={e => setOrderForm(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="Price"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => { setOrderForm(prev => ({ ...prev, side: 'buy' })); handlePlaceOrder(); }}
                  disabled={isLoading}
                >
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Buy / Long
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => { setOrderForm(prev => ({ ...prev, side: 'sell' })); handlePlaceOrder(); }}
                  disabled={isLoading}
                >
                  <TrendingDown className="h-4 w-4 mr-1" />
                  Sell / Short
                </Button>
              </div>

              <Alert>
                <AlertDescription className="text-xs">
                  ⚠️ Trading involves significant risk. Ensure you understand crypto futures before placing orders.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
