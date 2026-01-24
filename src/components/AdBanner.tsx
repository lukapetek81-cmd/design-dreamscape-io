import React, { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { showBannerAd, hideBannerAd, isAdMobInitialized } from '@/services/admobService';

// AdSense Publisher ID from environment
const ADSENSE_PUBLISHER_ID = import.meta.env.VITE_ADSENSE_PUBLISHER_ID || '';

interface AdBannerProps {
  variant?: 'sidebar' | 'banner' | 'inline' | 'article';
  className?: string;
  /** Ad slot ID from your AdSense account */
  slot?: string;
  /** Position for native banner ads (top or bottom) */
  nativePosition?: 'top' | 'bottom';
}

// Extend window type for adsbygoogle
declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

/**
 * Unified ad component that uses:
 * - Google AdMob (native SDK) on Android/iOS
 * - Google AdSense (web script) on web/PWA
 */
const AdBanner: React.FC<AdBannerProps> = ({ 
  variant = 'sidebar', 
  className = '',
  slot = '',
  nativePosition = 'bottom'
}) => {
  const adRef = useRef<HTMLModElement>(null);
  const isAdPushed = useRef(false);
  const isNative = Capacitor.isNativePlatform();

  // Get responsive ad dimensions based on variant (for web/AdSense)
  const getAdConfig = () => {
    switch (variant) {
      case 'banner':
        return {
          style: { display: 'block', width: '100%', height: '90px' },
          format: 'horizontal',
          responsive: 'true'
        };
      case 'inline':
        return {
          style: { display: 'block', width: '100%', height: '250px' },
          format: 'rectangle',
          responsive: 'true'
        };
      case 'article':
        return {
          style: { display: 'block', textAlign: 'center' as const },
          format: 'fluid',
          layout: 'in-article',
          responsive: 'true'
        };
      case 'sidebar':
      default:
        return {
          style: { display: 'block', width: '100%', height: '280px' },
          format: 'vertical',
          responsive: 'true'
        };
    }
  };

  useEffect(() => {
    // Native platform: Use AdMob
    if (isNative) {
      if (isAdMobInitialized()) {
        showBannerAd(nativePosition);
      }
      
      // Cleanup: hide banner when component unmounts
      return () => {
        hideBannerAd();
      };
    }
    
    // Web platform: Use AdSense
    if (!isAdPushed.current && ADSENSE_PUBLISHER_ID && adRef.current) {
      try {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
        isAdPushed.current = true;
      } catch (error) {
        console.error('AdSense error:', error);
      }
    }
  }, [isNative, nativePosition]);

  const config = getAdConfig();

  // Native platform: AdMob handles ads natively, just show placeholder space
  if (isNative) {
    return (
      <div 
        className={`${className} mx-2 mb-4 flex items-center justify-center bg-muted/20 rounded-lg`}
        style={{ minHeight: variant === 'banner' ? '50px' : '90px' }}
      >
        <p className="text-xs text-muted-foreground/40">Ad space (native)</p>
      </div>
    );
  }

  // Web platform: Show placeholder if no publisher ID configured
  if (!ADSENSE_PUBLISHER_ID) {
    return (
      <div 
        className={`${className} mx-2 mb-4 flex items-center justify-center bg-muted/30 border-dashed border-2 border-muted-foreground/20 rounded-lg`}
        style={config.style}
      >
        <div className="text-center p-4">
          <p className="text-xs text-muted-foreground/60 font-medium">Advertisement</p>
          <p className="text-[10px] text-muted-foreground/40 mt-1">Configure VITE_ADSENSE_PUBLISHER_ID</p>
        </div>
      </div>
    );
  }

  // Web platform: Render AdSense ad
  return (
    <div className={`${className} mx-2 mb-4`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={config.style}
        data-ad-client={`ca-${ADSENSE_PUBLISHER_ID}`}
        data-ad-slot={slot}
        data-ad-format={config.format}
        data-full-width-responsive={config.responsive}
        {...(variant === 'article' && { 'data-ad-layout': 'in-article' })}
      />
    </div>
  );
};

export default AdBanner;
