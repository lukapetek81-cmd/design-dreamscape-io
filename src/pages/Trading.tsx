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
  const { isGuest } = useAuth();
  const { isConnected, isConnecting, connect, disconnect, session } = useIBKRTrading();
  const { hasActiveCredentials } = useIBKRCredentials();
  const [showCredentialsForm, setShowCredentialsForm] = useState(false);

  // Require login for trading features
  if (isGuest) {
    return (
      <>
        <SEOHead 
          title="Trading Dashboard - Sign In Required"
          description="Professional trading dashboard with Interactive Brokers integration. Sign in to access trading features."
          keywords={["IBKR trading", "Interactive Brokers", "commodity trading"]}
        />
        <div className="min-h-screen bg-background p-6">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Sign In Required</CardTitle>
              <CardDescription>
                Please sign in to access the trading dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Sign in to access professional trading features with Interactive Brokers integration.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Coming soon for premium users
  return (
    <>
      <SEOHead 
        title="Trading Dashboard - Coming Soon"
        description="Professional trading dashboard with Interactive Brokers integration. Coming soon for premium subscribers."
        keywords={["IBKR trading", "Interactive Brokers", "commodity trading", "premium features"]}
      />
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Professional Trading</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Interactive Brokers integration coming soon
            </p>
          </div>

          {/* Coming Soon Section */}
          <Card className="border-2">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <IBKRLogo className="h-12 w-auto" />
              </div>
              <CardTitle className="text-2xl">Coming Soon</CardTitle>
              <CardDescription className="text-base">
                We're working on bringing you professional trading capabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  IBKR trading integration is currently under development. We're finalizing our official partnership with Interactive Brokers to bring you the best trading experience possible.
                </AlertDescription>
              </Alert>

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

              <div className="text-center p-6 bg-muted/30 rounded-lg">
                <h4 className="font-semibold mb-2">What to expect:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Direct connection to Interactive Brokers</li>
                  <li>• Real-time commodity futures trading</li>
                  <li>• Professional order management tools</li>
                  <li>• Advanced risk management features</li>
                  <li>• Comprehensive portfolio analytics</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Trading;