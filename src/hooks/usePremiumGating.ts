import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const usePremiumGating = () => {
  const { user, profile, isGuest, isPremium } = useAuth();
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