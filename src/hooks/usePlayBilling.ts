import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import type { Package, CustomerInfo } from '@/services/playBillingService';
import {
  initializePlayBilling,
  getSubscriptionPackages,
  purchaseSubscription,
  restorePurchases,
  getCustomerInfo,
  checkPremiumStatus,
  setUserId,
} from '@/services/playBillingService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const usePlayBilling = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [packages, setPackages] = useState<Package[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const auth = useAuth();
  const { toast } = useToast();
  
  const isNative = Capacitor.isNativePlatform();

  // Initialize billing on mount
  useEffect(() => {
    const init = async () => {
      if (!isNative) {
        setIsLoading(false);
        return;
      }

      try {
        const success = await initializePlayBilling();
        setIsInitialized(success);
        
        if (success) {
          // Set user ID if authenticated
          if (auth?.user?.id) {
            await setUserId(auth.user.id);
          }
          
          // Get packages and subscription status
          const [availablePackages, premium, info] = await Promise.all([
            getSubscriptionPackages(),
            checkPremiumStatus(),
            getCustomerInfo(),
          ]);
          
          setPackages(availablePackages);
          setIsPremium(premium);
          setCustomerInfo(info);
        }
      } catch (error) {
        console.error('[usePlayBilling] Initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [isNative, auth?.user?.id]);

  // Sync subscription status with backend (Supabase)
  const syncSubscriptionWithBackend = useCallback(async (info: CustomerInfo) => {
    if (!auth?.user?.id) return;

    try {
      const premiumEntitlement = info.entitlements.active['premium'];
      
      if (premiumEntitlement) {
        // Update profile in Supabase
        const { supabase } = await import('@/integrations/supabase/client');
        
        await supabase
          .from('profiles')
          .update({
            subscription_active: true,
            subscription_tier: 'premium',
            subscription_end: premiumEntitlement.expirationDate || null,
          })
          .eq('id', auth.user.id);
        
        // Refresh profile
        await auth.refreshProfile?.();
      }
    } catch (error) {
      console.error('[usePlayBilling] Backend sync error:', error);
    }
  }, [auth?.user?.id, auth?.refreshProfile]);

  // Purchase subscription
  const purchase = useCallback(async (packageToPurchase: Package) => {
    if (!isNative || !isInitialized) {
      toast({
        title: 'Not Available',
        description: 'In-app purchases are only available in the mobile app.',
        variant: 'destructive',
      });
      return false;
    }

    setIsLoading(true);
    try {
      const result = await purchaseSubscription(packageToPurchase);
      
      if (result.success && result.customerInfo) {
        setCustomerInfo(result.customerInfo);
        
        // Check if now premium
        const premiumEntitlement = result.customerInfo.entitlements.active['premium'];
        const nowPremium = !!premiumEntitlement;
        setIsPremium(nowPremium);
        
        if (nowPremium) {
          // Sync with backend
          await syncSubscriptionWithBackend(result.customerInfo);
          
          toast({
            title: 'Welcome to Premium! 🎉',
            description: 'Ads have been removed. Enjoy your ad-free experience!',
          });
        }
        
        return true;
      } else {
        if (result.error !== 'Purchase cancelled') {
          toast({
            title: 'Purchase Failed',
            description: result.error || 'Unable to complete purchase',
            variant: 'destructive',
          });
        }
        return false;
      }
    } catch (error) {
      console.error('[usePlayBilling] Purchase error:', error);
      toast({
        title: 'Purchase Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isNative, isInitialized, toast, syncSubscriptionWithBackend]);

  // Restore purchases
  const restore = useCallback(async () => {
    if (!isNative) {
      toast({
        title: 'Not Available',
        description: 'Purchase restoration is only available in the mobile app.',
        variant: 'destructive',
      });
      return false;
    }

    setIsLoading(true);
    try {
      const result = await restorePurchases();
      
      if (result.success && result.customerInfo) {
        setCustomerInfo(result.customerInfo);
        
        const premiumEntitlement = result.customerInfo.entitlements.active['premium'];
        const nowPremium = !!premiumEntitlement;
        setIsPremium(nowPremium);
        
        if (nowPremium) {
          await syncSubscriptionWithBackend(result.customerInfo);
          toast({
            title: 'Purchases Restored',
            description: 'Your premium subscription has been restored!',
          });
        } else {
          toast({
            title: 'No Purchases Found',
            description: 'No previous purchases were found to restore.',
          });
        }
        
        return nowPremium;
      } else {
        toast({
          title: 'Restore Failed',
          description: result.error || 'Unable to restore purchases',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      console.error('[usePlayBilling] Restore error:', error);
      toast({
        title: 'Restore Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isNative, toast, syncSubscriptionWithBackend]);

  // Refresh subscription status
  const refreshStatus = useCallback(async () => {
    if (!isNative || !isInitialized) return;

    setIsLoading(true);
    try {
      const [premium, info] = await Promise.all([
        checkPremiumStatus(),
        getCustomerInfo(),
      ]);
      
      setIsPremium(premium);
      setCustomerInfo(info);
      
      if (info) {
        await syncSubscriptionWithBackend(info);
      }
    } catch (error) {
      console.error('[usePlayBilling] Refresh error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isNative, isInitialized, syncSubscriptionWithBackend]);

  return {
    isNative,
    isInitialized,
    isLoading,
    isPremium,
    packages,
    customerInfo,
    purchase,
    restore,
    refreshStatus,
  };
};
