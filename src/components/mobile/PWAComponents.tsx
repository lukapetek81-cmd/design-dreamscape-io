import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { useHaptics } from '@/hooks/useHaptics';

interface AppIconProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

const AppIcon: React.FC<AppIconProps> = ({ 
  size = 64, 
  className = '', 
  animated = false 
}) => {
  return (
    <motion.div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={animated ? { scale: 1.05 } : {}}
      whileTap={animated ? { scale: 0.95 } : {}}
    >
      <div className="w-full h-full bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-3xl flex items-center justify-center shadow-lg">
        <svg
          width={size * 0.6}
          height={size * 0.6}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-white"
        >
          <path
            d="M3 3L21 21M3 12L12 3L21 12M7 17L17 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </motion.div>
  );
};

interface PWAInstallPromptProps {
  onInstall?: () => void;
  onDismiss?: () => void;
}

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ 
  onInstall, 
  onDismiss 
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const isMobile = useIsMobile();
  const { vibrateSelection } = useHaptics();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    vibrateSelection();
    setShowPrompt(false);
    
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    
    if (result.outcome === 'accepted') {
      onInstall?.();
    }
    
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDeferredPrompt(null);
    onDismiss?.();
  };

  if (!showPrompt || !isMobile) return null;

  return (
    <motion.div
      className="fixed bottom-4 left-4 right-4 z-50 p-4 bg-card border rounded-xl shadow-lg backdrop-blur-sm"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
    >
      <div className="flex items-start gap-3">
        <AppIcon size={48} />
        
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">
            Install Commodity Hub
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            Add to your home screen for quick access to market data
          </p>
          
          <div className="flex gap-2">
            <button
              onClick={handleInstall}
              className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg"
            >
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 text-muted-foreground text-xs font-medium"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export { AppIcon, PWAInstallPrompt };