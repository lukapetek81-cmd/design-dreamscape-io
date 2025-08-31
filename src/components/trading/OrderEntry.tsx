import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, ShoppingCart, TrendingDown, DollarSign } from 'lucide-react';
import { useIBKRTrading } from '@/hooks/useIBKRTrading';
import { useToast } from '@/hooks/use-toast';

const COMMODITY_SYMBOLS = [
  { value: 'CL', label: 'Crude Oil (CL)', exchange: 'NYMEX' },
  { value: 'NG', label: 'Natural Gas (NG)', exchange: 'NYMEX' },
  { value: 'GC', label: 'Gold (GC)', exchange: 'COMEX' },
  { value: 'SI', label: 'Silver (SI)', exchange: 'COMEX' },
  { value: 'HG', label: 'Copper (HG)', exchange: 'COMEX' },
  { value: 'ZC', label: 'Corn (ZC)', exchange: 'CBOT' },
  { value: 'ZW', label: 'Wheat (ZW)', exchange: 'CBOT' },
  { value: 'ZS', label: 'Soybeans (ZS)', exchange: 'CBOT' },
];

export const OrderEntry: React.FC = () => {
  const { placeOrder, isConnected, getMarketData } = useIBKRTrading();
  const { toast } = useToast();
  
  const [orderForm, setOrderForm] = useState({
    symbol: '',
    side: 'BUY' as 'BUY' | 'SELL',
    quantity: '',
    orderType: 'MKT' as 'MKT' | 'LMT' | 'STP',
    price: '',
    stopPrice: '',
    tif: 'DAY' as 'GTC' | 'DAY' | 'IOC' | 'FOK'
  });
  
  const [isPlacing, setIsPlacing] = useState(false);
  const [marketPrice, setMarketPrice] = useState<number | null>(null);

  const handleSymbolChange = async (symbol: string) => {
    setOrderForm(prev => ({ ...prev, symbol }));
    
    // Get market data for the symbol
    if (symbol && isConnected) {
      try {
        const data = await getMarketData([symbol]);
        if (data[symbol]) {
          setMarketPrice(data[symbol].last);
        }
      } catch (error) {
        console.error('Failed to get market data:', error);
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

    if (!orderForm.symbol || !orderForm.quantity) {
      toast({
        title: "Invalid Order",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (orderForm.orderType === 'LMT' && !orderForm.price) {
      toast({
        title: "Price Required",
        description: "Limit orders require a price",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsPlacing(true);
      
      const order = {
        symbol: orderForm.symbol,
        side: orderForm.side,
        quantity: parseInt(orderForm.quantity),
        orderType: orderForm.orderType,
        price: orderForm.price ? parseFloat(orderForm.price) : undefined,
        stopPrice: orderForm.stopPrice ? parseFloat(orderForm.stopPrice) : undefined,
        tif: orderForm.tif
      };

      await placeOrder(order);
      
      // Reset form after successful order
      setOrderForm({
        symbol: '',
        side: 'BUY',
        quantity: '',
        orderType: 'MKT',
        price: '',
        stopPrice: '',
        tif: 'DAY'
      });
      setMarketPrice(null);

    } catch (error) {
      console.error('Order placement failed:', error);
    } finally {
      setIsPlacing(false);
    }
  };

  const calculateOrderValue = () => {
    if (!orderForm.quantity) return 0;
    
    const qty = parseInt(orderForm.quantity);
    let price = 0;
    
    if (orderForm.orderType === 'LMT' && orderForm.price) {
      price = parseFloat(orderForm.price);
    } else if (marketPrice) {
      price = marketPrice;
    }
    
    return qty * price;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Place Order
        </CardTitle>
        <CardDescription>
          Enter order details for commodity futures
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Symbol Selection */}
        <div className="space-y-2">
          <Label>Symbol</Label>
          <Select 
            value={orderForm.symbol} 
            onValueChange={handleSymbolChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select commodity" />
            </SelectTrigger>
            <SelectContent>
              {COMMODITY_SYMBOLS.map((symbol) => (
                <SelectItem key={symbol.value} value={symbol.value}>
                  <div className="flex items-center justify-between w-full">
                    <span>{symbol.label}</span>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {symbol.exchange}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {marketPrice && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="w-4 h-4" />
              <span>Market Price: ${marketPrice.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Side and Quantity */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Side</Label>
            <Select 
              value={orderForm.side} 
              onValueChange={(value: 'BUY' | 'SELL') => 
                setOrderForm(prev => ({ ...prev, side: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BUY">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    BUY
                  </div>
                </SelectItem>
                <SelectItem value="SELL">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    SELL
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Quantity</Label>
            <Input
              type="number"
              placeholder="0"
              value={orderForm.quantity}
              onChange={(e) => setOrderForm(prev => ({ ...prev, quantity: e.target.value }))}
            />
          </div>
        </div>

        {/* Order Type */}
        <div className="space-y-2">
          <Label>Order Type</Label>
          <Select 
            value={orderForm.orderType} 
            onValueChange={(value: 'MKT' | 'LMT' | 'STP') => 
              setOrderForm(prev => ({ ...prev, orderType: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MKT">Market Order</SelectItem>
              <SelectItem value="LMT">Limit Order</SelectItem>
              <SelectItem value="STP">Stop Order</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Price Fields */}
        {orderForm.orderType === 'LMT' && (
          <div className="space-y-2">
            <Label>Limit Price</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={orderForm.price}
              onChange={(e) => setOrderForm(prev => ({ ...prev, price: e.target.value }))}
            />
          </div>
        )}

        {orderForm.orderType === 'STP' && (
          <div className="space-y-2">
            <Label>Stop Price</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={orderForm.stopPrice}
              onChange={(e) => setOrderForm(prev => ({ ...prev, stopPrice: e.target.value }))}
            />
          </div>
        )}

        {/* Time in Force */}
        <div className="space-y-2">
          <Label>Time in Force</Label>
          <Select 
            value={orderForm.tif} 
            onValueChange={(value: 'GTC' | 'DAY' | 'IOC' | 'FOK') => 
              setOrderForm(prev => ({ ...prev, tif: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DAY">Day Order</SelectItem>
              <SelectItem value="GTC">Good Till Canceled</SelectItem>
              <SelectItem value="IOC">Immediate or Cancel</SelectItem>
              <SelectItem value="FOK">Fill or Kill</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Order Summary */}
        {orderForm.quantity && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimated Value:</span>
              <span className="font-medium">${calculateOrderValue().toFixed(2)}</span>
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
            `${orderForm.side} ${orderForm.quantity || '0'} ${orderForm.symbol || 'Contracts'}`
          )}
        </Button>

        {!isConnected && (
          <div className="flex items-center gap-2 text-sm text-amber-600">
            <AlertTriangle className="w-4 h-4" />
            <span>Connect to IBKR to place orders</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};