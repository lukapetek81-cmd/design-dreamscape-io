import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const useAndroidBackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('🚀 INITIALIZING Android back button listener...');
    console.log('📍 Current location:', location.pathname);
    console.log('🌐 Window Capacitor exists:', !!(window as any)?.Capacitor);
    
    const setupListener = async () => {
      // Check if we're in a Capacitor environment
      if (typeof window === 'undefined') {
        console.log('❌ Window is undefined');
        return null;
      }
      
      if (!(window as any).Capacitor) {
        console.log('❌ Not in Capacitor environment');
        return null;
      }

      console.log('✅ Capacitor environment detected');

      try {
        const { App } = await import('@capacitor/app');
        console.log('✅ Capacitor App imported successfully');

        // Test if App methods are available
        console.log('🔍 App.addListener available:', typeof App.addListener === 'function');

        const handleBackButton = (data: any) => {
          console.log('🔥🔥🔥 ANDROID BACK BUTTON HANDLER TRIGGERED! 🔥🔥🔥');
          console.log('📍 Current path when back pressed:', location.pathname);
          console.log('📦 Event data:', data);
          
          // Try to prevent default in multiple ways
          try {
            if (data && typeof data.preventDefault === 'function') {
              data.preventDefault();
              console.log('✅ Called preventDefault on event');
            }
          } catch (e) {
            console.log('❌ preventDefault failed:', e);
          }

          // Navigate to home
          if (location.pathname !== '/') {
            console.log('🏠 Navigating to home from:', location.pathname);
            navigate('/', { replace: true });
          } else {
            console.log('🏠 Already on home page, staying here');
          }
          
          // Return false to prevent default behavior
          console.log('🛑 Returning false to prevent default');
          return false;
        };

        console.log('🎯 Adding back button listener...');
        const listener = await App.addListener('backButton', handleBackButton);
        console.log('🎉 Android back button listener added successfully!');
        console.log('🔗 Listener object:', listener);
        
        return listener;
      } catch (error) {
        console.error('💥 CRITICAL ERROR setting up Android back button:', error);
        console.error('📋 Error details:', JSON.stringify(error, null, 2));
        return null;
      }
    };

    let cleanup: (() => void) | null = null;
    
    setupListener().then((listener) => {
      if (listener) {
        console.log('🧹 Setting up cleanup function');
        cleanup = () => {
          console.log('🗑️ Removing Android back button listener');
          listener.remove();
        };
      } else {
        console.log('❌ No listener to clean up');
      }
    });

    return () => {
      console.log('🧽 Cleanup effect triggered');
      if (cleanup) {
        cleanup();
      }
    };
  }, [navigate, location.pathname]);
};