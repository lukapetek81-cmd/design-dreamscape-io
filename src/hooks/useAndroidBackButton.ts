import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const useAndroidBackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('Setting up Android back button listener...');
    
    const setupListener = async () => {
      // Check if we're in a Capacitor environment
      if (typeof window === 'undefined' || !(window as any).Capacitor) {
        console.log('Not in Capacitor environment, skipping Android back button setup');
        return null;
      }

      try {
        const { App } = await import('@capacitor/app');
        console.log('Capacitor App imported successfully');

        const handleBackButton = (event: any) => {
          console.log('🔴 ANDROID BACK BUTTON PRESSED! Current path:', location.pathname);
          
          // Prevent the default behavior (app exit)
          if (event && event.preventDefault) {
            event.preventDefault();
          }
          
          // Always navigate to home instead of exiting
          if (location.pathname !== '/') {
            console.log('➡️ Navigating to home from:', location.pathname);
            navigate('/', { replace: true });
          } else {
            console.log('➡️ Already on home, staying on home page');
            // We're already on home, just prevent the app from closing
          }
          
          // Return false to prevent default behavior
          return false;
        };

        console.log('Adding back button listener...');
        const listener = await App.addListener('backButton', handleBackButton);
        console.log('✅ Android back button listener added successfully');
        
        return listener;
      } catch (error) {
        console.error('❌ Failed to setup Android back button:', error);
        return null;
      }
    };

    let cleanup: (() => void) | null = null;
    
    setupListener().then((listener) => {
      if (listener) {
        cleanup = () => {
          console.log('🧹 Removing Android back button listener');
          listener.remove();
        };
      }
    });

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [navigate, location.pathname]);
};