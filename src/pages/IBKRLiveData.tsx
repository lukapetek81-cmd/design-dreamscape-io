import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { SidebarProvider } from "@/components/ui/sidebar";
import CommoditySidebar from '@/components/CommoditySidebar';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Menu, Activity, Loader, Wifi, WifiOff, Settings, TrendingUp, Eye, EyeOff } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { useAvailableCommodities } from '@/hooks/useCommodityData';
import { useIBKR } from '@/contexts/IBKRContext';
import UserProfile from '@/components/UserProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface IBKRCredentials {
  username: string;
  password: string;
  gateway: string;
}

const IBKRLiveData = () => {
  const [activeGroup, setActiveGroup] = React.useState("energy");
  const isMobile = useIsMobile();
  const { isGuest, profile, loading: authLoading } = useAuth();
  const { data: commodities, isLoading: commoditiesLoading } = useAvailableCommodities();
  const { 
    prices: ibkrPrices, 
    connected, 
    authenticated, 
    error, 
    lastUpdate, 
    connect, 
    disconnect, 
    subscribe, 
    isConnecting, 
    isPremium 
  } = useIBKR();

  const [credentials, setCredentials] = useState<IBKRCredentials>({
    username: '',
    password: '',
    gateway: 'paper'
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleConnect = async () => {
    if (!credentials.username || !credentials.password) {
      return;
    }

    try {
      await connect(credentials);
    } catch (error) {
      console.error('Failed to connect to IBKR:', error);
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const handleSubscribe = async () => {
    const allCommodityNames = commodities?.map(c => c.name) || [];
    if (allCommodityNames.length === 0) return;
    
    try {
      await subscribe(allCommodityNames);
    } catch (error) {
      console.error('Failed to subscribe to commodities:', error);
    }
  };

  // Show loading screen while auth is checking
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center space-y-4">
          <Loader className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const getCommodityCount = (category: string) => {
    return commodities?.filter(commodity => commodity.category === category).length || 0;
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-muted/20">
        <CommoditySidebar 
          activeGroup={activeGroup} 
          onGroupSelect={setActiveGroup}
          commodityCounts={{
            energy: getCommodityCount('energy'),
            metals: getCommodityCount('metals'),
            grains: getCommodityCount('grains'),
            livestock: getCommodityCount('livestock'),
            softs: getCommodityCount('softs'),
            other: getCommodityCount('other')
          }}
        />
        
        {/* Floating Sidebar Trigger Button */}
        <SidebarTrigger className="fixed left-4 bottom-20 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl active:scale-95 touch-manipulation transition-all duration-200 flex items-center justify-center md:hidden">
          <Menu className="w-6 h-6" />
        </SidebarTrigger>
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-soft">
            <div className="container flex h-16 sm:h-20 items-center justify-between px-3 sm:px-4 md:px-6">
              <div className="flex items-center gap-3">
                <Activity className="w-6 h-6 text-primary" />
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground">IBKR Live Data</h1>
                  <p className="text-sm text-muted-foreground">Real-time commodity data from Interactive Brokers</p>
                </div>
              </div>
              <UserProfile />
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 overflow-x-hidden">
            <div className="max-w-4xl mx-auto space-y-6">
              
              {/* IBKR Connection Card */}
              {!isPremium ? (
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
              ) : (
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
                              Subscribe to All Commodities
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>• Requires active IBKR account with market data subscriptions</p>
                      <p>• CBOT and COMEX L1/L2 data available with proper permissions</p>
                      <p>• Paper trading gateway recommended for testing</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Live Prices Display */}
              {Object.keys(ibkrPrices).length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-foreground">Live Price Feed</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(ibkrPrices).map(([symbol, data]) => (
                      <div key={symbol} className="p-4 bg-card rounded-lg border shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-foreground">{symbol}</h3>
                          <span className="text-xs bg-purple-100 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 px-2 py-1 rounded">
                            IBKR Live
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Price:</span>
                            <span className="font-mono text-sm">${data.price}</span>
                          </div>
                          {data.bid && data.ask && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Bid:</span>
                                <span className="font-mono text-sm text-green-600">${data.bid}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Ask:</span>
                                <span className="font-mono text-sm text-red-600">${data.ask}</span>
                              </div>
                            </>
                          )}
                          {data.volume && (
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Volume:</span>
                              <span className="font-mono text-sm">{data.volume.toLocaleString()}</span>
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            Updated: {new Date(data.lastUpdate).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default IBKRLiveData;