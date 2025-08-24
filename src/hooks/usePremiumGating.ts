import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const usePremiumGating = () => {
  const auth = useAuth();
  
  // Handle case where auth is not yet available
  if (!auth) {
    return {
      isPremium: false,
      isGuest: true,
      canAccessFeature: () => false,
      requiresPremiumUpgrade: () => true,
      showUpgradePrompt: () => {}
    };
  }
  
  const { user, profile, isGuest, isPremium } = auth;
  const navigate = useNavigate();

  const requireLogin = (redirectToAuth = true) => {
    if (isGuest) {
      if (redirectToAuth) {
        navigate('/auth');
      }
      return false;
    }
    return true;
  };

  const requirePremium = (redirectToAuth = true) => {
    if (isGuest) {
      if (redirectToAuth) {
        navigate('/auth');
      }
      return false;
    }
    
    if (!isPremium) {
      if (redirectToAuth) {
        navigate('/billing');
      }
      return false;
    }
    
    return true;
  };

  return {
    isGuest,
    isPremium,
    requireLogin,
    requirePremium,
    canAccessFeature: (requiresPremium: boolean = false) => {
      if (requiresPremium) {
        return !isGuest && isPremium;
      }
      return !isGuest;
    }
  };
};