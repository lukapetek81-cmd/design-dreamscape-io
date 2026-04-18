import { Capacitor } from '@capacitor/core';
import {
  Purchases,
  LOG_LEVEL,
  type PurchasesOffering,
  type CustomerInfo,
} from '@revenuecat/purchases-capacitor';
import { logger } from '@/utils/logger';

// Public Android SDK key from RevenueCat dashboard. Safe to ship in client.
const REVENUECAT_ANDROID_KEY = import.meta.env.VITE_REVENUECAT_ANDROID_KEY as string | undefined;
const REVENUECAT_IOS_KEY = import.meta.env.VITE_REVENUECAT_IOS_KEY as string | undefined;

// RevenueCat entitlement identifier configured in dashboard.
export const PREMIUM_ENTITLEMENT = 'premium';

let configured = false;

export const isRevenueCatAvailable = (): boolean => {
  if (!Capacitor.isNativePlatform()) return false;
  const platform = Capacitor.getPlatform();
  if (platform === 'android') return Boolean(REVENUECAT_ANDROID_KEY);
  if (platform === 'ios') return Boolean(REVENUECAT_IOS_KEY);
  return false;
};

export const configureRevenueCat = async (appUserId: string | null): Promise<void> => {
  if (!isRevenueCatAvailable() || configured) return;

  const platform = Capacitor.getPlatform();
  const apiKey = platform === 'ios' ? REVENUECAT_IOS_KEY! : REVENUECAT_ANDROID_KEY!;

  try {
    await Purchases.setLogLevel({ level: LOG_LEVEL.WARN });
    await Purchases.configure({ apiKey, appUserID: appUserId ?? undefined });
    configured = true;
  } catch (err) {
    logger.error('RevenueCat configure failed', err);
  }
};

export const identifyRevenueCatUser = async (userId: string): Promise<void> => {
  if (!configured) return;
  try {
    await Purchases.logIn({ appUserID: userId });
  } catch (err) {
    logger.error('RevenueCat logIn failed', err);
  }
};

export const logoutRevenueCatUser = async (): Promise<void> => {
  if (!configured) return;
  try {
    await Purchases.logOut();
  } catch (err) {
    logger.warn('RevenueCat logOut failed', err);
  }
};

export const getOfferings = async (): Promise<PurchasesOffering | null> => {
  if (!configured) return null;
  try {
    const { current } = await Purchases.getOfferings();
    return current ?? null;
  } catch (err) {
    logger.error('RevenueCat getOfferings failed', err);
    return null;
  }
};

export const purchasePackage = async (
  pkg: PurchasesOffering['availablePackages'][number],
): Promise<{ success: boolean; customerInfo?: CustomerInfo; error?: string }> => {
  try {
    const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
    const isPremium = Boolean(customerInfo.entitlements.active[PREMIUM_ENTITLEMENT]);
    return { success: isPremium, customerInfo };
  } catch (err: any) {
    if (err?.userCancelled) return { success: false, error: 'cancelled' };
    logger.error('RevenueCat purchase failed', err);
    return { success: false, error: err?.message ?? 'Purchase failed' };
  }
};

export const restorePurchases = async (): Promise<boolean> => {
  if (!configured) return false;
  try {
    const { customerInfo } = await Purchases.restorePurchases();
    return Boolean(customerInfo.entitlements.active[PREMIUM_ENTITLEMENT]);
  } catch (err) {
    logger.error('RevenueCat restore failed', err);
    return false;
  }
};

export const hasActivePremium = async (): Promise<boolean> => {
  if (!configured) return false;
  try {
    const { customerInfo } = await Purchases.getCustomerInfo();
    return Boolean(customerInfo.entitlements.active[PREMIUM_ENTITLEMENT]);
  } catch {
    return false;
  }
};
