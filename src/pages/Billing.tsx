import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Calendar, Crown, Loader2, RefreshCw, Zap, CheckCircle, Star } from 'lucide-react';
import { usePlayBilling } from '@/hooks/usePlayBilling';
import { Capacitor } from '@capacitor/core';

/**
 * Account settings page with Google Play subscription management.
 */
const Billing = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { 
    isNative, 
    isLoading, 
    isPremium: playBillingPremium, 
    packages, 
    purchase, 
    restore, 
    refreshStatus 
  } = usePlayBilling();
  
  // Check premium from profile (synced with backend) or Play Billing
  const isPremium = profile?.subscription_active && profile?.subscription_tier === 'premium';

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <Card className="p-6 sm:p-8 text-center mobile-card">
            <div className="mb-4">
              <h1 className="text-xl sm:text-2xl font-bold">Account Settings</h1>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">Please sign in to view your account.</p>
            <Button 
              onClick={() => navigate('/auth')}
              className="mobile-button w-full sm:w-auto"
            >
              Sign In
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const handlePurchase = async (pkg: typeof packages[0]) => {
    await purchase(pkg);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-2xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Account Settings</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage your account and subscription
          </p>
        </div>
        
        {/* Profile Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Your account details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{profile?.email || user?.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <User className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Name</p>
                <p className="text-sm text-muted-foreground">{profile?.full_name || 'Not set'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Member since</p>
                <p className="text-sm text-muted-foreground">
                  {profile?.created_at 
                    ? new Date(profile.created_at).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Status */}
        <Card className={isPremium ? 'border-yellow-500/50 bg-gradient-to-br from-yellow-50/50 to-orange-50/50 dark:from-yellow-950/20 dark:to-orange-950/20' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className={`w-5 h-5 ${isPremium ? 'text-yellow-600' : 'text-muted-foreground'}`} />
              Subscription
              {isPremium && (
                <Badge className="ml-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                  Premium Active
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {isPremium 
                ? 'You have an active premium subscription' 
                : 'Upgrade to remove ads and get premium features'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isPremium ? (
              <>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>Ad-free experience</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>Real-time market data</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>IBKR futures contracts</span>
                  </div>
                  {profile?.subscription_end && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Renews: {new Date(profile.subscription_end).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  onClick={refreshStatus}
                  disabled={isLoading}
                  className="w-full sm:w-auto"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Refresh Status
                </Button>
              </>
            ) : (
              <>
                {/* Benefits */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="w-4 h-4 text-orange-500" />
                    <span>Remove all ads</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="w-4 h-4 text-orange-500" />
                    <span>Real-time price updates (no 15-min delay)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="w-4 h-4 text-orange-500" />
                    <span>IBKR futures contracts</span>
                  </div>
                </div>

                {/* Subscription Options - Native only */}
                {isNative && packages.length > 0 ? (
                  <div className="space-y-3">
                    {packages.map((pkg) => (
                      <Button
                        key={pkg.identifier}
                        onClick={() => handlePurchase(pkg)}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : null}
                        Subscribe - {pkg.product.priceString}/{pkg.product.subscriptionPeriod?.unit === 0 ? 'day' : pkg.product.subscriptionPeriod?.unit === 1 ? 'week' : pkg.product.subscriptionPeriod?.unit === 2 ? 'month' : 'year'}
                      </Button>
                    ))}
                    
                    <Button
                      variant="ghost"
                      onClick={restore}
                      disabled={isLoading}
                      className="w-full"
                    >
                      Restore Purchases
                    </Button>
                  </div>
                ) : isNative ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">
                      {isLoading ? 'Loading subscription options...' : 'Subscription options not available'}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-4 space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Premium subscriptions are available in the mobile app.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Download from Google Play to subscribe and remove ads.
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Billing;
