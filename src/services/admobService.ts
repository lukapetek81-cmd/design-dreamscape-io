import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition, AdmobConsentStatus } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

// AdMob App ID and Ad Unit IDs
// These should be replaced with actual IDs from your AdMob console
const ADMOB_BANNER_ID = import.meta.env.VITE_ADMOB_BANNER_ID || 'ca-app-pub-3940256099942544/6300978111'; // Test ID fallback
const ADMOB_INTERSTITIAL_ID = import.meta.env.VITE_ADMOB_INTERSTITIAL_ID || 'ca-app-pub-3940256099942544/1033173712'; // Test ID fallback

// Track initialization state
let isInitialized = false;
let isBannerVisible = false;

/**
 * Initialize AdMob SDK
 * Should be called once when the app starts on native platforms
 */
export const initializeAdMob = async (): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) {
    console.log('[AdMob] Skipping initialization on non-native platform');
    return false;
  }

  if (isInitialized) {
    console.log('[AdMob] Already initialized');
    return true;
  }

  try {
    // Request consent info (required for GDPR compliance)
    const consentInfo = await AdMob.requestConsentInfo();
    
    if (consentInfo.isConsentFormAvailable && consentInfo.status === AdmobConsentStatus.REQUIRED) {
      await AdMob.showConsentForm();
    }

    // Initialize AdMob
    await AdMob.initialize({
      initializeForTesting: import.meta.env.DEV, // Use test ads in development
    });

    isInitialized = true;
    console.log('[AdMob] Initialized successfully');
    return true;
  } catch (error) {
    console.error('[AdMob] Initialization failed:', error);
    return false;
  }
};

/**
 * Show a banner ad at the specified position
 */
export const showBannerAd = async (position: 'top' | 'bottom' = 'bottom'): Promise<boolean> => {
  if (!Capacitor.isNativePlatform() || !isInitialized) {
    return false;
  }

  if (isBannerVisible) {
    console.log('[AdMob] Banner already visible');
    return true;
  }

  try {
    const options: BannerAdOptions = {
      adId: ADMOB_BANNER_ID,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: position === 'top' ? BannerAdPosition.TOP_CENTER : BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: import.meta.env.DEV,
    };

    await AdMob.showBanner(options);
    isBannerVisible = true;
    console.log('[AdMob] Banner shown successfully');
    return true;
  } catch (error) {
    console.error('[AdMob] Failed to show banner:', error);
    return false;
  }
};

/**
 * Hide the banner ad
 */
export const hideBannerAd = async (): Promise<boolean> => {
  if (!Capacitor.isNativePlatform() || !isBannerVisible) {
    return false;
  }

  try {
    await AdMob.hideBanner();
    isBannerVisible = false;
    console.log('[AdMob] Banner hidden');
    return true;
  } catch (error) {
    console.error('[AdMob] Failed to hide banner:', error);
    return false;
  }
};

/**
 * Remove the banner ad completely
 */
export const removeBannerAd = async (): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) {
    return false;
  }

  try {
    await AdMob.removeBanner();
    isBannerVisible = false;
    console.log('[AdMob] Banner removed');
    return true;
  } catch (error) {
    console.error('[AdMob] Failed to remove banner:', error);
    return false;
  }
};

/**
 * Prepare an interstitial ad for later display
 */
export const prepareInterstitialAd = async (): Promise<boolean> => {
  if (!Capacitor.isNativePlatform() || !isInitialized) {
    return false;
  }

  try {
    await AdMob.prepareInterstitial({
      adId: ADMOB_INTERSTITIAL_ID,
      isTesting: import.meta.env.DEV,
    });
    console.log('[AdMob] Interstitial prepared');
    return true;
  } catch (error) {
    console.error('[AdMob] Failed to prepare interstitial:', error);
    return false;
  }
};

/**
 * Show a prepared interstitial ad
 */
export const showInterstitialAd = async (): Promise<boolean> => {
  if (!Capacitor.isNativePlatform() || !isInitialized) {
    return false;
  }

  try {
    await AdMob.showInterstitial();
    console.log('[AdMob] Interstitial shown');
    return true;
  } catch (error) {
    console.error('[AdMob] Failed to show interstitial:', error);
    return false;
  }
};

/**
 * Check if AdMob is initialized
 */
export const isAdMobInitialized = (): boolean => isInitialized;

/**
 * Check if banner is currently visible
 */
export const isBannerAdVisible = (): boolean => isBannerVisible;
