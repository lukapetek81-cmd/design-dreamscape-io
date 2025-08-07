import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const useAndroidBackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleBackButton = async () => {
      console.log('Android back button pressed, current path:', location.pathname);
      
      // Only works in Capacitor environment
      if (typeof window !== 'undefined' && (window as any).Capacitor) {
        try {
          const { App } = await import('@capacitor/app');
          
          // If we're not on the main page, navigate to main page (like the in-app back button)
          if (location.pathname !== '/') {
            console.log('Navigating back to main dashboard');
            navigate('/', { replace: true });
            return;
          }
          
          // If we're already on the main page, let the app exit
          console.log('On main page, exiting app');
          App.exitApp();
        } catch (error) {
          console.log('Capacitor App plugin not available:', error);
        }
      }
    };

    // Only add listener in Capacitor environment
    if (typeof window !== 'undefined' && (window as any).Capacitor) {
      import('@capacitor/app').then(({ App }) => {
        console.log('Setting up Android back button listener');
        App.addListener('backButton', handleBackButton);
        
        // Return cleanup function
        return () => {
          console.log('Cleaning up Android back button listener');
          App.removeAllListeners();
        };
      }).catch((error) => {
        console.log('Capacitor App plugin not available during setup:', error);
      });
    }
  }, [navigate, location.pathname]);
};