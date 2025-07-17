import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Wifi, WifiOff, Settings, TrendingUp } from 'lucide-react';
import { useIBKRRealtimeData } from '@/hooks/useIBKRRealtimeData';
import { useAuth } from '@/contexts/AuthContext';

interface IBKRCredentials {
  username: string;
  password: string;
  gateway: string;
}

interface IBKRConnectionManagerProps {
  commodities: string[];
  onPricesUpdate?: (prices: Record<string, any>) => void;
}

export const IBKRConnectionManager: React.FC<IBKRConnectionManagerProps> = ({ 
  commodities, 
  onPricesUpdate 
}) => {
  const { profile } = useAuth();
  const [credentials, setCredentials] = useState<IBKRCredentials>({
    username: '',
    password: '',
    gateway: 'paper'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const {
    prices,
    connected,
    authenticated,
    error,
    lastUpdate,
    connect,
    disconnect,
    subscribe
  } = useIBKRRealtimeData({
    commodities,
    enabled: true
  });

  const isPremium = profile?.subscription_active && profile?.subscription_tier === 'premium';

  // Notify parent component of price updates
  React.useEffect(() => {
    if (onPricesUpdate) {
      onPricesUpdate(prices);
    }
  }, [prices, onPricesUpdate]);

  const handleConnect = async () => {
    if (!credentials.username || !credentials.password) {
      return;
    }

    setIsConnecting(true);
    try {
      await connect(credentials);
    } catch (error) {
      console.error('Failed to connect to IBKR:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const handleSubscribe = async () => {
    if (commodities.length === 0) return;
    
    try {
      await subscribe(commodities);
    } catch (error) {
      console.error('Failed to subscribe to commodities:', error);
    }
  };

  if (!isPremium) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            IBKR Live Data
          </CardTitle>
          <CardDescription>
            Real-time commodity data from Interactive Brokers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>
              IBKR real-time data streaming requires a Premium subscription. 
              Upgrade to access live market data with Level 1 and Level 2 quotes.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          IBKR Live Data Connection
          <Badge variant={connected ? "default" : "secondary"}>
            {connected ? (
              <><Wifi className="h-3 w-3 mr-1" /> Connected</>
            ) : (
              <><WifiOff className="h-3 w-3 mr-1" /> Disconnected</>
            )}
          </Badge>
        </CardTitle>
        <CardDescription>
          Connect to Interactive Brokers for real-time CBOT and COMEX L1/L2 quotes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!connected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">IBKR Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Your IBKR username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={credentials.password}
                    onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Your IBKR password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gateway">Trading Gateway</Label>
              <Select
                value={credentials.gateway}
                onValueChange={(value) => setCredentials(prev => ({ ...prev, gateway: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gateway" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paper">Paper Trading</SelectItem>
                  <SelectItem value="live">Live Trading</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleConnect} 
              disabled={isConnecting || !credentials.username || !credentials.password}
              className="w-full"
            >
              {isConnecting ? 'Connecting...' : 'Connect to IBKR'}
            </Button>
          </div>
        )}

        {connected && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Connection Status</p>
                <div className="flex items-center gap-2">
                  <Badge variant={authenticated ? "default" : "secondary"}>
                    {authenticated ? 'Authenticated' : 'Not Authenticated'}
                  </Badge>
                  <Badge variant={connected ? "default" : "secondary"}>
                    {connected ? 'Connected' : 'Disconnected'}
                  </Badge>
                </div>
              </div>
              <Button variant="outline" onClick={handleDisconnect}>
                Disconnect
              </Button>
            </div>

            {lastUpdate && (
              <p className="text-xs text-muted-foreground">
                Last update: {lastUpdate.toLocaleTimeString()}
              </p>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Market Data Subscriptions</p>
                <Button size="sm" onClick={handleSubscribe}>
                  Subscribe to Commodities
                </Button>
              </div>
              
              {Object.keys(prices).length > 0 && (
                <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                  {Object.entries(prices).map(([symbol, data]) => (
                    <div key={symbol} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm font-medium">{symbol}</span>
                      <div className="text-right">
                        <div className="text-sm">${data.price}</div>
                        {data.bid && data.ask && (
                          <div className="text-xs text-muted-foreground">
                            Bid: ${data.bid} Ask: ${data.ask}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {commodities.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Monitoring Commodities:</p>
                <div className="flex flex-wrap gap-1">
                  {commodities.map((commodity) => (
                    <Badge key={commodity} variant="outline" className="text-xs">
                      {commodity}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Requires active IBKR account with market data subscriptions</p>
          <p>• CBOT and COMEX L1/L2 data available with proper permissions</p>
          <p>• Paper trading gateway recommended for testing</p>
        </div>
      </CardContent>
    </Card>
  );
};