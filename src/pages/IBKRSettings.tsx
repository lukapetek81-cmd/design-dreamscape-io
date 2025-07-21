import React from 'react';
import { IBKRCredentialsManager } from '@/components/IBKRCredentialsManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useIBKR } from '@/contexts/IBKRContext';
import { Shield, Wifi, Clock } from 'lucide-react';

const IBKRSettings = () => {
  const { connected, authenticated, error, lastUpdate, prices } = useIBKR();

  const connectedCommodities = Object.keys(prices).length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">IBKR Live Data Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure your Interactive Brokers connection for real-time commodity data
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <IBKRCredentialsManager />
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="w-5 h-5" />
              Connection Status
            </CardTitle>
            <CardDescription>
              Current status of your IBKR live data connection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Connection</span>
                <Badge variant={connected ? "default" : "secondary"} className={connected ? "bg-green-500" : ""}>
                  {connected ? "Connected" : "Disconnected"}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Authentication</span>
                <Badge variant={authenticated ? "default" : "secondary"} className={authenticated ? "bg-green-500" : ""}>
                  {authenticated ? "Authenticated" : "Not Authenticated"}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Active Commodities</span>
                <Badge variant="outline">
                  {connectedCommodities}
                </Badge>
              </div>
              {lastUpdate && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Last Update</span>
                  <span className="text-sm text-muted-foreground">
                    {lastUpdate.toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Information
          </CardTitle>
          <CardDescription>
            How your IBKR credentials are protected
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div>
              <p className="text-sm font-medium">Encrypted Storage</p>
              <p className="text-sm text-muted-foreground">
                Your credentials are encrypted before being stored in our secure database
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div>
              <p className="text-sm font-medium">User-Specific Access</p>
              <p className="text-sm text-muted-foreground">
                Only you can access your stored credentials with Row-Level Security
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div>
              <p className="text-sm font-medium">Automatic Connection</p>
              <p className="text-sm text-muted-foreground">
                Premium users automatically connect to IBKR when credentials are saved
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IBKRSettings;