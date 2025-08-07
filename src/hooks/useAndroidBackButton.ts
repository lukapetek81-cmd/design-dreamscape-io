import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const useAndroidBackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('🚀 Setting up Android hardware back button listener...');
    console.log('📍 Current location:', location.pathname);
    
    const handleHardwareBackButton = (event: CustomEvent) => {
      console.log('🔥 ANDROID HARDWARE BACK BUTTON PRESSED!');
      console.log('📍 Current path:', location.pathname);
      console.log('🎯 Event details:', event);
      
      // Always navigate to home page instead of exiting app
      if (location.pathname !== '/') {
        console.log('🏠 Navigating to home from:', location.pathname);
        navigate('/', { replace: true });
      } else {
        console.log('🏠 Already on home page');
        // On home page, we could show an exit confirmation or just stay
        // For now, just prevent the default app exit
      }
      
      // Prevent the default behavior (app exit)
      event.preventDefault();
      event.stopPropagation();
    };

    // Listen for the ionBackButton event (Ionic/Capacitor specific)
    document.addEventListener('ionBackButton', handleHardwareBackButton as EventListener);
    console.log('✅ ionBackButton listener added');

    // Also try the Capacitor approach as backup
    let capacitorCleanup: (() => void) | null = null;
    
    const setupCapacitorListener = async () => {
      if (typeof window !== 'undefined' && (window as any).Capacitor) {
        try {
          const { App } = await import('@capacitor/app');
          console.log('✅ Setting up Capacitor App listener as backup');
          
          const listener = await App.addListener('backButton', (data) => {
            console.log('🔥 Capacitor back button triggered');
            console.log('📍 Current path:', location.pathname);
            
            if (location.pathname !== '/') {
              console.log('🏠 Navigating to home via Capacitor listener');
              navigate('/', { replace: true });
            }
          });
          
          capacitorCleanup = () => listener.remove();
          console.log('✅ Capacitor backup listener added');
        } catch (error) {
          console.log('❌ Capacitor listener setup failed:', error);
        }
      }
    };

    setupCapacitorListener();

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up back button listeners');
      document.removeEventListener('ionBackButton', handleHardwareBackButton as EventListener);
      if (capacitorCleanup) {
        capacitorCleanup();
      }
    };
  }, [navigate, location.pathname]);
};