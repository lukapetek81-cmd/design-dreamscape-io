import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const useAndroidBackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('🚀 Setting up Android back button listener...');
    
    const setupListener = async () => {
      // Only setup in Capacitor environment
      if (typeof window === 'undefined' || !(window as any).Capacitor) {
        console.log('❌ Not in Capacitor environment');
        return null;
      }

      try {
        const { App } = await import('@capacitor/app');
        console.log('✅ Capacitor App imported');

        const handleBackButton = () => {
          console.log('🔴 Android back button pressed!');
          console.log('📍 Current path:', location.pathname);
          
          // If not on home page, navigate to home
          if (location.pathname !== '/') {
            console.log('🏠 Navigating to home page');
            navigate('/', { replace: true });
          } else {
            console.log('🏠 Already on home - doing nothing to prevent app exit');
            // Don't call App.exitApp() - just do nothing
            // This prevents the app from closing
          }
        };

        const listener = await App.addListener('backButton', handleBackButton);
        console.log('✅ Back button listener registered');
        
        return () => {
          console.log('🧹 Removing back button listener');
          listener.remove();
        };
      } catch (error) {
        console.error('❌ Failed to setup back button listener:', error);
        return null;
      }
    };

    let cleanup: (() => void) | null = null;
    
    setupListener().then((cleanupFn) => {
      cleanup = cleanupFn;
    });

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [navigate, location.pathname]);
};