import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const usePremiumGating = () => {
  const navigate = useNavigate();
  const auth = useAuth();

  // Derive safe fallbacks when auth is not yet available
  const isGuest = auth?.isGuest ?? true;
  const isPremium = auth?.isPremium ?? false;

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
    canAccessFeature: (requiresPremium: boolean = false) =>
      requiresPremium ? !isGuest && isPremium : !isGuest,
  };
};