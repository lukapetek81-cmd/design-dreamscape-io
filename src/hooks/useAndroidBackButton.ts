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
            
            // Always navigate to main dashboard instead of exiting
            // This ensures users can navigate back to home from any page
            if (location.pathname !== '/') {
              console.log('Navigating back to main dashboard from:', location.pathname);
              navigate('/', { replace: true });
              return;
            }
            
            // Only exit if user presses back again quickly on main dashboard
            console.log('Already on main dashboard - navigating to dashboard again to prevent exit');
            navigate('/', { replace: true });
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