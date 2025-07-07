import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { App } from '@capacitor/app';

export const useAndroidBackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleBackButton = () => {
      // If we're not on the main page, navigate to main page
      if (location.pathname !== '/') {
        navigate('/', { replace: true });
        return;
      }
      
      // If we're already on the main page, let the app exit
      App.exitApp();
    };

    // Listen for the back button event
    const removeListener = App.addListener('backButton', handleBackButton);

    return () => {
      removeListener.then(remove => remove.remove());
    };
  }, [navigate, location.pathname]);
};