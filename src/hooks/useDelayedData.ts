import { useAuth } from '@/contexts/AuthContext';

export const useDelayedData = () => {
  const auth = useAuth();
  
  // Add null check to prevent errors during initial render
  if (!auth) {
    return {
      isPremium: false,
      shouldDelayData: true,
      getDelayedTimestamp: (timestamp?: number) => timestamp,
      getDataDelay: () => '15min',
      getDelayStatus: () => ({ isDelayed: true, delayText: '15-min delayed', statusText: 'Loading...' })
    };
  }
  
  const { profile, isGuest } = auth;
  
  const isPremium = profile?.subscription_active && profile?.subscription_tier !== 'free';
  const shouldDelayData = isGuest || !isPremium;
  
  // For free users, add 15 minutes (900000ms) delay to timestamps
  const getDelayedTimestamp = (timestamp?: number) => {
    if (!shouldDelayData) return timestamp;
    
    const now = Date.now();
    const fifteenMinutesAgo = now - (15 * 60 * 1000); // 15 minutes in milliseconds
    
    return timestamp ? Math.min(timestamp, fifteenMinutesAgo) : fifteenMinutesAgo;
  };
  
  // Get the appropriate data source URL parameter
  const getDataDelay = () => {
    return shouldDelayData ? '15min' : 'realtime';
  };
  
  // Get delay status for UI display
  const getDelayStatus = () => {
    if (isGuest) return { isDelayed: true, delayText: '15-min delayed', statusText: 'Sign in for real-time data' };
    if (!isPremium) return { isDelayed: true, delayText: '15-min delayed', statusText: 'Upgrade for real-time data' };
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