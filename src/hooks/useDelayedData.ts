import { useAuth } from '@/contexts/AuthContext';

/**
 * Freemium model: All data is real-time for everyone.
 * This hook is kept for future premium tier implementation.
 */
export const useDelayedData = () => {
  const auth = useAuth();
  
  // Add null check to prevent errors during initial render
  if (!auth) {
    return {
      isPremium: false,
      shouldDelayData: false, // No delay in freemium model
      getDelayedTimestamp: (timestamp?: number) => timestamp,
      getDataDelay: () => 'realtime',
      getDelayStatus: () => ({ isDelayed: false, delayText: 'Real-time', statusText: 'Live market data' })
    };
  }
  
  const { profile, isGuest } = auth;
  
  // Freemium model: Everyone gets real-time data
  const isPremium = profile?.subscription_active && profile?.subscription_tier !== 'free';
  const shouldDelayData = false; // No delays for anyone in freemium model
  
  // No delay - return timestamp as-is
  const getDelayedTimestamp = (timestamp?: number) => timestamp;
  
  // Always return realtime for freemium model
  const getDataDelay = () => 'realtime';
  
  // Get delay status for UI display - always show as real-time
  const getDelayStatus = () => {
    return { isDelayed: false, delayText: 'Real-time', statusText: 'Live market data' };
  };
  
  return {
    isPremium,
    shouldDelayData,
    getDelayedTimestamp,
    getDataDelay,
    getDelayStatus
  };
};