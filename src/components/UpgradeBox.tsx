import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Zap, Clock, CheckCircle, Loader2, Star, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { usePlayBilling } from '@/hooks/usePlayBilling';
import { Capacitor } from '@capacitor/core';

const UpgradeBox = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const { isLoading, packages, purchase, isPremium: playBillingPremium } = usePlayBilling();
  
  const user = auth?.user;
  const profile = auth?.profile;
  const isGuest = auth?.isGuest ?? true;
  
  const isPremium = profile?.subscription_active && profile?.subscription_tier === 'premium';
  const isNative = Capacitor.isNativePlatform();

  const handleUpgrade = async () => {
    if (!user) {
      // If guest, redirect to auth page first
      navigate('/auth');
      return;
    }

    // On native, try to purchase directly if packages available
    if (isNative && packages.length > 0) {
      await purchase(packages[0]);
    } else {
      // Navigate to billing page for subscription management
      navigate('/billing');
    }
  };

  // Show for guests and non-premium users - always show unless premium
  if (!isGuest && user && profile && isPremium) {
    return (
      <Card className="mx-2 mb-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200 dark:border-yellow-800 shadow-soft">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <Badge variant="secondary" className="bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-200">
              Premium Active
            </Badge>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
              Ad-Free + Real-Time Data
            </p>
            <div className="flex items-center gap-2 text-xs text-yellow-700 dark:text-yellow-300">
              <Zap className="w-3 h-3" />
              <span>No ads</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-yellow-700 dark:text-yellow-300">
              <CheckCircle className="w-3 h-3" />
              <span>Live market data</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-yellow-700 dark:text-yellow-300">
              <CheckCircle className="w-3 h-3" />
              <span>IBKR futures</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/billing')}
            className="text-xs border-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/20"
          >
            Manage Subscription
          </Button>
        </div>
      </Card>
    );
  }

  // Show upgrade box for guests, non-authenticated users, and free users
  const isGuestUser = isGuest || !user;
  
  // Get price from packages if available
  const monthlyPackage = packages.find(pkg => 
    pkg.product.subscriptionPeriod?.unit === 2 // month
  ) || packages[0];
  
  const priceString = monthlyPackage?.product.priceString || '$9.99';
  
  return (
    <Card className="mx-2 mb-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-800 shadow-soft hover:shadow-medium transition-all duration-300 hover:scale-[1.02]">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          <Badge variant="outline" className="text-orange-700 border-orange-300 bg-orange-50">
            {isGuestUser ? 'Limited Access' : 'Free Tier'}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-orange-900 dark:text-orange-100">
            Go Premium - Remove All Ads
          </h3>
          <p className="text-xs text-orange-700 dark:text-orange-300">
            {isGuestUser 
              ? 'Sign up and upgrade for an ad-free experience'
              : 'Upgrade to remove ads and unlock premium features!'
            }
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400">
            <Zap className="w-3 h-3" />
            <span>No advertisements</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400">
            <CheckCircle className="w-3 h-3" />
            <span>Real-time price updates</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400">
            <CheckCircle className="w-3 h-3" />
            <span>IBKR futures contracts</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400">
            <Star className="w-3 h-3" />
            <span>Professional trading edge</span>
          </div>
        </div>

        <div className="pt-2 border-t border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-lg font-bold text-orange-900 dark:text-orange-100">{priceString}</p>
              <p className="text-xs text-orange-600 dark:text-orange-400">per month</p>
            </div>
          </div>
          
          <Button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-soft hover:shadow-medium transition-all duration-200"
            size="sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin mr-2" />
                Loading...
              </>
            ) : (
              <>
                {isGuestUser ? 'Sign Up & Upgrade' : 'Upgrade Now'}
                <ArrowRight className="w-3 h-3 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default UpgradeBox;
