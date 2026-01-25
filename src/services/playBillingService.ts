import { Capacitor } from '@capacitor/core';
import { CapacitorPurchases } from '@capgo/capacitor-purchases';
import type { Package, CustomerInfo, Offerings } from '@capgo/capacitor-purchases';

// Re-export types for use in hooks
export type { Package, CustomerInfo, Offerings };

// Product IDs - must match your Google Play Console setup
export const PREMIUM_PRODUCT_ID = 'premium_monthly';
export const PREMIUM_YEARLY_PRODUCT_ID = 'premium_yearly';

let isInitialized = false;

/**
 * Initialize RevenueCat/Purchases SDK
 * Call this once when the app starts on native platforms
 */
export const initializePlayBilling = async (): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) {
    console.log('[PlayBilling] Skipping initialization on non-native platform');
    return false;
  }

  if (isInitialized) {
    console.log('[PlayBilling] Already initialized');
    return true;
  }

  try {
    // Note: You'll need to set up RevenueCat and add your API key
    // For now, we'll use a placeholder - replace with your actual key
    const apiKey = import.meta.env.VITE_REVENUECAT_API_KEY || '';
    
    if (!apiKey) {
      console.warn('[PlayBilling] No RevenueCat API key configured. Using direct Google Play Billing.');
      // Fall back to checking subscription status via backend
      isInitialized = true;
      return true;
    }

    await CapacitorPurchases.setDebugLogsEnabled({ enabled: import.meta.env.DEV });
    
    await CapacitorPurchases.setup({
      apiKey,
    });

    isInitialized = true;
    console.log('[PlayBilling] Initialized successfully');
    return true;
  } catch (error) {
    console.error('[PlayBilling] Initialization failed:', error);
    // Still mark as initialized to allow fallback to backend checks
    isInitialized = true;
    return false;
  }
};

/**
 * Get available subscription packages
 */
export const getSubscriptionPackages = async (): Promise<Package[]> => {
  if (!Capacitor.isNativePlatform() || !isInitialized) {
    return [];
  }

  try {
    const result = await CapacitorPurchases.getOfferings();
    const offerings: Offerings = result.offerings;
    return offerings.current?.availablePackages || [];
  } catch (error) {
    console.error('[PlayBilling] Failed to get offerings:', error);
    return [];
  }
};

/**
 * Purchase a subscription package
 */
export const purchaseSubscription = async (packageToPurchase: Package): Promise<{ success: boolean; customerInfo?: CustomerInfo; error?: string }> => {
  if (!Capacitor.isNativePlatform()) {
    return { success: false, error: 'Not on native platform' };
  }

  try {
    const result = await CapacitorPurchases.purchasePackage({ 
      identifier: packageToPurchase.identifier,
      offeringIdentifier: packageToPurchase.offeringIdentifier,
    });
    console.log('[PlayBilling] Purchase successful:', result.customerInfo);
    return { success: true, customerInfo: result.customerInfo };
  } catch (error: any) {
    console.error('[PlayBilling] Purchase failed:', error);
    
    // Check if user cancelled
    if (error.code === 1 || error.message?.includes('cancelled')) {
      return { success: false, error: 'Purchase cancelled' };
    }
    
    return { success: false, error: error.message || 'Purchase failed' };
  }
};

/**
 * Restore previous purchases
 */
export const restorePurchases = async (): Promise<{ success: boolean; customerInfo?: CustomerInfo; error?: string }> => {
  if (!Capacitor.isNativePlatform()) {
    return { success: false, error: 'Not on native platform' };
  }

  try {
    const result = await CapacitorPurchases.restorePurchases();
    console.log('[PlayBilling] Purchases restored:', result.customerInfo);
    return { success: true, customerInfo: result.customerInfo };
  } catch (error: any) {
    console.error('[PlayBilling] Restore failed:', error);
    return { success: false, error: error.message || 'Restore failed' };
  }
};

/**
 * Get current customer subscription info
 */
export const getCustomerInfo = async (): Promise<CustomerInfo | null> => {
  if (!Capacitor.isNativePlatform()) {
    return null;
  }

  try {
    const result = await CapacitorPurchases.getCustomerInfo();
    return result.customerInfo;
  } catch (error) {
    console.error('[PlayBilling] Failed to get customer info:', error);
    return null;
  }
};

/**
 * Check if user has active premium subscription
 */
export const checkPremiumStatus = async (): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) {
    return false;
  }

  try {
    const customerInfo = await getCustomerInfo();
    if (!customerInfo) return false;

    // Check if user has active entitlement to "premium"
    const premiumEntitlement = customerInfo.entitlements.active['premium'];
    return !!premiumEntitlement;
  } catch (error) {
    console.error('[PlayBilling] Failed to check premium status:', error);
    return false;
  }
};

/**
 * Link RevenueCat user to your backend user ID
 */
export const setUserId = async (userId: string): Promise<void> => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    await CapacitorPurchases.logIn({ appUserID: userId });
    console.log('[PlayBilling] User ID set:', userId);
  } catch (error) {
    console.error('[PlayBilling] Failed to set user ID:', error);
  }
};

/**
 * Check if billing is initialized
 */
export const isPlayBillingInitialized = (): boolean => isInitialized;
