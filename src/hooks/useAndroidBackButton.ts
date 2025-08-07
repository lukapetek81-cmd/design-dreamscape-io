import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const useAndroidBackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let removeListener: (() => void) | null = null;

    const setupBackButtonListener = async () => {
      // Only works in Capacitor environment
      if (typeof window !== 'undefined' && (window as any).Capacitor) {
        try {
          const { App } = await import('@capacitor/app');
          
          const handleBackButton = () => {
            console.log('Android back button pressed, current path:', location.pathname);
            
            // If we're not on the main dashboard, go back to main dashboard
            if (location.pathname !== '/') {
              console.log('Navigating back to main dashboard');
              navigate('/', { replace: true });
            } else {
              // If we're already on the main dashboard, exit the app
              console.log('On main dashboard, exiting app');
              App.exitApp();
            }
          };

          // Add the back button listener
          const listener = await App.addListener('backButton', handleBackButton);
          removeListener = () => listener.remove();
          
          console.log('Android back button listener set up successfully');
        } catch (error) {
          console.log('Failed to set up Android back button listener:', error);
        }
      }
    };

    setupBackButtonListener();

    // Cleanup function
    return () => {
      if (removeListener) {
        removeListener();
        console.log('Android back button listener removed');
      }
    };
  }, [navigate, location.pathname]);
};