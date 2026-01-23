import React, { useEffect, useRef } from 'react';

// AdSense Publisher ID from environment
const ADSENSE_PUBLISHER_ID = import.meta.env.VITE_ADSENSE_PUBLISHER_ID || '';

interface AdBannerProps {
  variant?: 'sidebar' | 'banner' | 'inline' | 'article';
  className?: string;
  /** Ad slot ID from your AdSense account */
  slot?: string;
}

// Extend window type for adsbygoogle
declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

/**
 * Google AdSense ad component with multiple placement variants.
 * Requires VITE_ADSENSE_PUBLISHER_ID environment variable.
 */
const AdBanner: React.FC<AdBannerProps> = ({ 
  variant = 'sidebar', 
  className = '',
  slot = ''
}) => {
  const adRef = useRef<HTMLModElement>(null);
  const isAdPushed = useRef(false);

  // Get responsive ad dimensions based on variant
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
    // Only push ad once and only if publisher ID exists
    if (!isAdPushed.current && ADSENSE_PUBLISHER_ID && adRef.current) {
      try {
        // Initialize adsbygoogle array if not exists
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
        isAdPushed.current = true;
      } catch (error) {
        console.error('AdSense error:', error);
      }
    }
  }, []);

  const config = getAdConfig();

  // Show placeholder if no publisher ID configured
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
