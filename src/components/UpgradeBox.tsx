import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Zap, Clock, CheckCircle, Loader2, Star, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const UpgradeBox = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const isPremium = profile?.subscription_active && profile?.subscription_tier === 'premium';

  const handleUpgrade = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Get the current session and token
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.access_token) {
        throw new Error("No valid session found. Please log in again.");
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
        
        toast({
          title: "Redirecting to Stripe",
          description: "Complete your subscription in the new tab.",
        });
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Error",
        description: "Failed to start checkout process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = () => {
    // Navigate to the billing page instead of opening customer portal directly
    navigate('/billing');
  };

  const checkSubscriptionStatus = async () => {
    if (!user) return;

    try {
      // Get the current session and token
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.access_token) {
        throw new Error("No valid session found. Please log in again.");
      }

      const { error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      });

      if (error) throw error;

      // Refresh profile to get updated subscription status
      await refreshProfile();
      
      toast({
        title: "Subscription Updated",
        description: "Your subscription status has been refreshed.",
      });
    } catch (error) {
      console.error('Check subscription error:', error);
      toast({
        title: "Update Error",
        description: "Failed to check subscription status.",
        variant: "destructive",
      });
    }
  };

  // Don't show anything if user is not authenticated
  if (!user || !profile) return null;

  if (isPremium) {
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
              Real-Time Data Access
            </p>
            <div className="flex items-center gap-2 text-xs text-yellow-700 dark:text-yellow-300">
              <Zap className="w-3 h-3" />
              <span>Live market data</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-yellow-700 dark:text-yellow-300">
              <CheckCircle className="w-3 h-3" />
              <span>No delays</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleManageSubscription}
              className="text-xs border-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/20"
            >
              Manage
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={checkSubscriptionStatus}
              className="text-xs text-yellow-700 hover:bg-yellow-100 dark:hover:bg-yellow-900/20"
            >
              Refresh
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mx-2 mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800 shadow-soft hover:shadow-medium transition-all duration-300 hover:scale-[1.02]">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <Badge variant="outline" className="text-blue-700 border-blue-300">
            Upgrade Available
          </Badge>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-blue-900 dark:text-blue-100">
            Real-Time Data Access
          </h3>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Get live market data instead of 15-minute delays
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
            <Zap className="w-3 h-3" />
            <span>Instant price updates</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
            <Clock className="w-3 h-3" />
            <span>No 15-minute delays</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
            <CheckCircle className="w-3 h-3" />
            <span>Professional trading data</span>
          </div>
        </div>

        <div className="pt-2 border-t border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-lg font-bold text-blue-900 dark:text-blue-100">$5</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">per month</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground line-through">$25/mo</p>
              <p className="text-xs text-green-600 font-semibold">80% off launch</p>
            </div>
          </div>
          
          <Button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-soft hover:shadow-medium transition-all duration-200"
            size="sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin mr-2" />
                Starting...
              </>
            ) : (
              <>
                Upgrade Now
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