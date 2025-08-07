import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const useAndroidBackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleBackButton = async () => {
      // Only works in Capacitor environment
      if (typeof window !== 'undefined' && (window as any).Capacitor) {
        try {
          const { App } = await import('@capacitor/app');
          
          // If we're not on the main page, go back to main page (like the in-app back button)
          if (location.pathname !== '/') {
            navigate('/', { replace: true });
            return;
          }
          
          // If we're already on the main page, let the app exit
          App.exitApp();
        } catch (error) {
          console.log('Capacitor App plugin not available');
        }
      }
    };

    // Only add listener in Capacitor environment
    if (typeof window !== 'undefined' && (window as any).Capacitor) {
      import('@capacitor/app').then(({ App }) => {
        const removeListener = App.addListener('backButton', handleBackButton);
        
        return () => {
          removeListener.then(remove => remove.remove());
        };
      }).catch(() => {
        console.log('Capacitor App plugin not available');
      });
    }
  }, [navigate, location.pathname]);
};