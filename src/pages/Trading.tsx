import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useIBKRTrading } from '@/hooks/useIBKRTrading';
import { useIBKRCredentials } from '@/hooks/useIBKRCredentials';
import { IBKRCredentialsForm } from '@/components/IBKRCredentialsForm';
import { TradingDashboard } from '@/components/trading/TradingDashboard';
import { TSPDisclaimer } from '@/components/TSPDisclaimer';
import SEOHead from '@/components/SEOHead';
import { AlertTriangle, CheckCircle, Settings, Activity, Shield, RefreshCw } from 'lucide-react';
import { IBKRLogo } from '@/components/IBKRLogo';

const Trading: React.FC = () => {
  const { isPremium } = useAuth();
  const { isConnected, isConnecting, connect, disconnect, session } = useIBKRTrading();
  const { hasActiveCredentials } = useIBKRCredentials();
  const [showCredentialsForm, setShowCredentialsForm] = useState(false);

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

  // If connected, show the full trading dashboard
  if (isConnected) {
    return (
      <>
        <SEOHead 
          title="Trading Dashboard - IBKR Integration"
          description="Professional trading dashboard with Interactive Brokers integration. Live market data, advanced order types, risk management, and comprehensive trading history."
          keywords={["IBKR trading", "Interactive Brokers", "commodity trading", "futures trading", "live market data", "trading dashboard"]}
        />
        <TradingDashboard />
      </>
    );
  }

  // Main connection interface
  return (
    <>
      <SEOHead 
        title="Trading Dashboard - IBKR Integration"
        description="Professional trading dashboard with Interactive Brokers integration. Live market data, advanced order types, risk management, and comprehensive trading history."
        keywords={["IBKR trading", "Interactive Brokers", "commodity trading", "futures trading", "live market data", "trading dashboard"]}
      />
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Professional Trading</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect your Interactive Brokers account to start trading commodities
            </p>
          </div>

          {/* Main Connect Section */}
          <Card className="border-2">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <IBKRLogo className="h-12 w-auto" />
              </div>
              <CardTitle className="text-2xl">Connect to Interactive Brokers</CardTitle>
              <CardDescription className="text-base">
                Access live trading, real-time data, and professional order management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!hasActiveCredentials() ? (
                <div className="space-y-4">
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      Enter your IBKR credentials to get started
                    </AlertDescription>
                  </Alert>
                  
                  {!showCredentialsForm ? (
                    <div className="text-center">
                      <Button 
                        onClick={() => setShowCredentialsForm(true)}
                        size="lg"
                        className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <Settings className="w-5 h-5 mr-2" />
                        Add IBKR Account
                      </Button>
                    </div>
                  ) : (
                    <IBKRCredentialsForm />
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                      <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                        Ready to connect
                      </span>
                    </div>
                    
                    <Button 
                      onClick={connect} 
                      disabled={isConnecting}
                      size="lg"
                      className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-12 py-6 text-lg h-auto shadow-lg hover:shadow-xl transition-all duration-200 border-0"
                    >
                      <div className="flex items-center gap-3">
                        <IBKRLogo className="h-6 w-auto" />
                        {isConnecting ? (
                          <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            Connecting to IBKR...
                          </>
                        ) : (
                          <>
                            <Activity className="w-5 h-5" />
                            Connect to IBKR
                          </>
                        )}
                      </div>
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <Activity className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <h3 className="font-semibold">Live Trading</h3>
                      <p className="text-sm text-muted-foreground">Real-time order execution</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-emerald-600" />
                      <h3 className="font-semibold">Market Data</h3>
                      <p className="text-sm text-muted-foreground">Professional-grade feeds</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <Shield className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <h3 className="font-semibold">Risk Management</h3>
                      <p className="text-sm text-muted-foreground">Advanced portfolio tools</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Connection Status */}
          {session && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  Connection Active
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Account ID:</span> {session.accountId}
                  </div>
                  <div>
                    <span className="font-medium">Session:</span> {session.sessionId.substring(0, 8)}...
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default Trading;