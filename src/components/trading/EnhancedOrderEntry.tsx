import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useIBKRTrading } from '@/hooks/useIBKRTrading';
import { useRealTimeMarketData } from '@/hooks/useRealTimeMarketData';
import { useToast } from '@/hooks/use-toast';

const COMMODITY_SYMBOLS = [
  { symbol: 'CL', label: 'Crude Oil', exchange: 'NYMEX' },
  { symbol: 'GC', label: 'Gold', exchange: 'COMEX' },
  { symbol: 'SI', label: 'Silver', exchange: 'COMEX' },
  { symbol: 'NG', label: 'Natural Gas', exchange: 'NYMEX' },
  { symbol: 'HG', label: 'Copper', exchange: 'COMEX' },
  { symbol: 'ZC', label: 'Corn', exchange: 'CBOT' },
  { symbol: 'ZS', label: 'Soybeans', exchange: 'CBOT' },
  { symbol: 'ZW', label: 'Wheat', exchange: 'CBOT' },
  { symbol: 'KC', label: 'Coffee', exchange: 'ICE' },
  { symbol: 'SB', label: 'Sugar', exchange: 'ICE' }
];

interface OrderForm {
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  orderType: 'MKT' | 'LMT' | 'STP' | 'STP_LMT' | 'TRAIL';
  price?: number;
  stopPrice?: number;
  trailAmount?: number;
  tif: 'GTC' | 'DAY' | 'IOC' | 'FOK';
  orderRef?: string;
}

export const EnhancedOrderEntry: React.FC = () => {
  const { toast } = useToast();
  const {
    session,
    isConnected,
    placeOrder,
    getMarketData
  } = useIBKRTrading();

  const [orderForm, setOrderForm] = useState<OrderForm>({
    symbol: '',
    side: 'BUY',
    quantity: 1,
    orderType: 'MKT',
    tif: 'DAY'
  });

  const [isPlacing, setIsPlacing] = useState(false);
  const [marketPrice, setMarketPrice] = useState<number | null>(null);

  // Real-time market data for selected symbol
  const {
    marketData,
    isConnected: marketDataConnected
  } = useRealTimeMarketData({
    symbols: orderForm.symbol ? [orderForm.symbol] : [],
    sessionId: session?.sessionId,
    enabled: isConnected && !!orderForm.symbol
  });

  // Update market price when data changes
  useEffect(() => {
    if (orderForm.symbol && marketData[orderForm.symbol]) {
      setMarketPrice(marketData[orderForm.symbol].last);
    }
  }, [orderForm.symbol, marketData]);

  const handleSymbolChange = async (symbol: string) => {
    setOrderForm(prev => ({ ...prev, symbol }));
    
    // Fetch initial market data
    if (symbol && isConnected) {
      try {
        const data = await getMarketData([symbol]);
        if (data[symbol]) {
          setMarketPrice(data[symbol].last);
        }
      } catch (error) {
        console.error('Error fetching market data:', error);
      }
    }
  };

  const handlePlaceOrder = async () => {
    if (!isConnected) {
      toast({
        title: "Not Connected",
        description: "Please connect to IBKR first",
        variant: "destructive"
      });
      return;
    }

    // Validation
    if (!orderForm.symbol || !orderForm.quantity) {
      toast({
        title: "Invalid Order",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if ((orderForm.orderType === 'LMT' || orderForm.orderType === 'STP_LMT') && !orderForm.price) {
      toast({
        title: "Price Required",
        description: "Limit orders require a price",
        variant: "destructive"
      });
      return;
    }

    if ((orderForm.orderType === 'STP' || orderForm.orderType === 'STP_LMT') && !orderForm.stopPrice) {
      toast({
        title: "Stop Price Required",
        description: "Stop orders require a stop price",
        variant: "destructive"
      });
      return;
    }

    setIsPlacing(true);
    
    try {
      const success = await placeOrder(orderForm);
      
      if (success) {
        toast({
          title: "Order Placed Successfully",
          description: `${orderForm.side} ${orderForm.quantity} ${orderForm.symbol} order submitted`,
        });
        
        // Reset form
        setOrderForm({
          symbol: '',
          side: 'BUY',
          quantity: 1,
          orderType: 'MKT',
          tif: 'DAY'
        });
        setMarketPrice(null);
      }
    } catch (error) {
      console.error('Order placement error:', error);
      // Error handling is done in the hook
    } finally {
      setIsPlacing(false);
    }
  };

  const calculateOrderValue = () => {
    if (!orderForm.quantity) return 0;
    
    let price = 0;
    if (orderForm.orderType === 'MKT' || orderForm.orderType === 'STP') {
      price = marketPrice || 0;
    } else {
      price = orderForm.price || 0;
    }
    
    return orderForm.quantity * price;
  };

  const getCurrentSpread = () => {
    if (!orderForm.symbol || !marketData[orderForm.symbol]) return null;
    
    const data = marketData[orderForm.symbol];
    return {
      bid: data.bid,
      ask: data.ask,
      spread: data.ask - data.bid,
      spreadPercent: ((data.ask - data.bid) / data.last) * 100
    };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Enhanced Order Entry
        </CardTitle>
        <CardDescription>
          Place orders with real-time market data and advanced order types
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-950 dark:border-amber-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span className="text-sm text-amber-700 dark:text-amber-300">
                Connect to IBKR to place orders
              </span>
            </div>
          </div>
        )}

        {/* Symbol Selection */}
        <div className="space-y-2">
          <Label htmlFor="symbol">Symbol</Label>
          <Select value={orderForm.symbol} onValueChange={handleSymbolChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a commodity" />
            </SelectTrigger>
            <SelectContent>
              {COMMODITY_SYMBOLS.map((commodity) => (
                <SelectItem key={commodity.symbol} value={commodity.symbol}>
                  <div className="flex items-center justify-between w-full">
                    <span>{commodity.symbol} - {commodity.label}</span>
                    <Badge variant="outline" className="ml-2">
                      {commodity.exchange}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Real-time Market Data */}
        {orderForm.symbol && marketDataConnected && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Live Market Data</span>
              <Badge variant={marketDataConnected ? 'default' : 'secondary'}>
                {marketDataConnected ? 'Live' : 'Delayed'}
              </Badge>
            </div>
            
            {marketData[orderForm.symbol] && (
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Bid</div>
                  <div className="font-mono">
                    ${marketData[orderForm.symbol].bid.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Last</div>
                  <div className="font-mono font-medium">
                    ${marketData[orderForm.symbol].last.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Ask</div>
                  <div className="font-mono">
                    ${marketData[orderForm.symbol].ask.toFixed(2)}
                  </div>
                </div>
              </div>
            )}
            
            {getCurrentSpread() && (
              <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                Spread: ${getCurrentSpread()!.spread.toFixed(2)} ({getCurrentSpread()!.spreadPercent.toFixed(2)}%)
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {/* Side */}
          <div className="space-y-2">
            <Label>Side</Label>
            <Select value={orderForm.side} onValueChange={(value: 'BUY' | 'SELL') => 
              setOrderForm(prev => ({ ...prev, side: value }))
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BUY">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                    BUY
                  </div>
                </SelectItem>
                <SelectItem value="SELL">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    SELL
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={orderForm.quantity}
              onChange={(e) => setOrderForm(prev => ({ 
                ...prev, 
                quantity: parseInt(e.target.value) || 1 
              }))}
            />
          </div>
        </div>

        {/* Order Type */}
        <div className="space-y-2">
          <Label>Order Type</Label>
          <Select value={orderForm.orderType} onValueChange={(value: OrderForm['orderType']) => 
            setOrderForm(prev => ({ ...prev, orderType: value }))
          }>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MKT">Market</SelectItem>
              <SelectItem value="LMT">Limit</SelectItem>
              <SelectItem value="STP">Stop</SelectItem>
              <SelectItem value="STP_LMT">Stop Limit</SelectItem>
              <SelectItem value="TRAIL">Trailing Stop</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Conditional Price Fields */}
        {(orderForm.orderType === 'LMT' || orderForm.orderType === 'STP_LMT') && (
          <div className="space-y-2">
            <Label htmlFor="price">Limit Price</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              placeholder="Enter limit price"
              value={orderForm.price || ''}
              onChange={(e) => setOrderForm(prev => ({ 
                ...prev, 
                price: parseFloat(e.target.value) || undefined 
              }))}
            />
          </div>
        )}

        {(orderForm.orderType === 'STP' || orderForm.orderType === 'STP_LMT') && (
          <div className="space-y-2">
            <Label htmlFor="stopPrice">Stop Price</Label>
            <Input
              id="stopPrice"
              type="number"
              step="0.01"
              placeholder="Enter stop price"
              value={orderForm.stopPrice || ''}
              onChange={(e) => setOrderForm(prev => ({ 
                ...prev, 
                stopPrice: parseFloat(e.target.value) || undefined 
              }))}
            />
          </div>
        )}

        {orderForm.orderType === 'TRAIL' && (
          <div className="space-y-2">
            <Label htmlFor="trailAmount">Trail Amount ($)</Label>
            <Input
              id="trailAmount"
              type="number"
              step="0.01"
              placeholder="Enter trail amount"
              value={orderForm.trailAmount || ''}
              onChange={(e) => setOrderForm(prev => ({ 
                ...prev, 
                trailAmount: parseFloat(e.target.value) || undefined 
              }))}
            />
          </div>
        )}

        {/* Time in Force */}
        <div className="space-y-2">
          <Label>Time in Force</Label>
          <Select value={orderForm.tif} onValueChange={(value: OrderForm['tif']) => 
            setOrderForm(prev => ({ ...prev, tif: value }))
          }>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DAY">Day</SelectItem>
              <SelectItem value="GTC">Good Till Cancelled</SelectItem>
              <SelectItem value="IOC">Immediate or Cancel</SelectItem>
              <SelectItem value="FOK">Fill or Kill</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Order Summary */}
        {orderForm.symbol && orderForm.quantity && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm font-medium mb-2">Order Summary</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Symbol:</span>
                <span className="font-medium">{orderForm.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span>Side:</span>
                <span className={`font-medium ${
                  orderForm.side === 'BUY' ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {orderForm.side}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Quantity:</span>
                <span className="font-medium">{orderForm.quantity.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Est. Value:</span>
                <span className="font-medium">${calculateOrderValue().toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Place Order Button */}
        <Button
          onClick={handlePlaceOrder}
          disabled={!isConnected || isPlacing || !orderForm.symbol || !orderForm.quantity}
          className={`w-full ${
            orderForm.side === 'BUY' 
              ? 'bg-emerald-600 hover:bg-emerald-700' 
              : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {isPlacing ? (
            'Placing Order...'
          ) : (
            `${orderForm.side} ${orderForm.quantity} ${orderForm.symbol || 'Contracts'}`
          )}
        </Button>
      </CardContent>
    </Card>
  );
};