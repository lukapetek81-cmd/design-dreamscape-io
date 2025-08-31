import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useIBKRTrading } from '@/hooks/useIBKRTrading';
import { useIBKRCredentials } from '@/hooks/useIBKRCredentials';
import { IBKRCredentialsForm } from '@/components/IBKRCredentialsForm';
import { IBKRSetupGuide } from '@/components/IBKRSetupGuide';
import { TradingDashboard } from '@/components/trading/TradingDashboard';
import SEOHead from '@/components/SEOHead';
import { AlertTriangle, CheckCircle, Settings, Activity } from 'lucide-react';

const Trading: React.FC = () => {
  const { isPremium } = useAuth();
  const { isConnected, isConnecting, connect, disconnect, session } = useIBKRTrading();
  const { hasActiveCredentials } = useIBKRCredentials();

  if (!isPremium) {
    return (
      <>
        <SEOHead 
          title="Trading Dashboard - Premium Feature"
          description="Professional trading dashboard with Interactive Brokers integration. Upgrade to premium for live market data and advanced trading features."
          keywords={["IBKR trading", "Interactive Brokers", "commodity trading", "premium features"]}
        />
        <div className="min-h-screen bg-background p-6">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Premium Feature</CardTitle>
              <CardDescription>
                IBKR trading integration is available for premium subscribers only
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Upgrade to premium to access professional trading features with Interactive Brokers integration.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead 
        title="Trading Dashboard - IBKR Integration"
        description="Professional trading dashboard with Interactive Brokers integration. Live market data, advanced order types, risk management, and comprehensive trading history."
        keywords={["IBKR trading", "Interactive Brokers", "commodity trading", "futures trading", "live market data", "trading dashboard"]}
      />
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Commodity Trading Platform</h1>
              <p className="text-muted-foreground">
                Technology Service Provider platform delivering professional trading services through Interactive Brokers
              </p>
            </div>
            <div className="flex items-center gap-4">
              {isConnected && (
                <Badge variant="default" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Connected
                </Badge>
              )}
            </div>
          </div>

          <Tabs defaultValue={isConnected ? "trading" : "setup"} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="setup">Setup Guide</TabsTrigger>
              <TabsTrigger value="credentials">Credentials</TabsTrigger>
              <TabsTrigger value="connect">Connect</TabsTrigger>
              <TabsTrigger value="trading" disabled={!isConnected}>
                Trading
              </TabsTrigger>
            </TabsList>

            <TabsContent value="setup" className="space-y-4">
              <IBKRSetupGuide />
            </TabsContent>

            <TabsContent value="credentials" className="space-y-4">
              <IBKRCredentialsForm />
            </TabsContent>

            <TabsContent value="connect" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    IBKR Connection
                  </CardTitle>
                  <CardDescription>
                    Connect to Interactive Brokers for live trading
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!hasActiveCredentials() && (
                    <Alert>
                      <Settings className="h-4 w-4" />
                      <AlertDescription>
                        Please configure your IBKR credentials first in the Credentials tab.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex items-center gap-4">
                    {!isConnected ? (
                      <Button 
                        onClick={connect} 
                        disabled={isConnecting || !hasActiveCredentials()}
                        size="lg"
                      >
                        {isConnecting ? 'Connecting...' : 'Connect to IBKR'}
                      </Button>
                    ) : (
                      <Button onClick={disconnect} variant="outline" size="lg">
                        Disconnect
                      </Button>
                    )}
                  </div>

                  {isConnected && session && (
                    <div className="bg-muted/50 p-4 rounded-md">
                      <h4 className="font-semibold mb-2">Connection Details</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Account ID:</span> {session.accountId}</p>
                        <p><span className="font-medium">Session ID:</span> {session.sessionId}</p>
                        <p><span className="font-medium">Status:</span> 
                          <Badge variant="default" className="ml-2">Connected</Badge>
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trading" className="space-y-4">
              {isConnected ? (
                <TradingDashboard />
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Please connect to IBKR first to access the trading dashboard.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default Trading;