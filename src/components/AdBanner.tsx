import React from 'react';
import { Card } from '@/components/ui/card';

interface AdBannerProps {
  variant?: 'sidebar' | 'banner' | 'inline';
  className?: string;
}

/**
 * Ad placeholder component for freemium monetization.
 * Replace with actual ad network integration (e.g., Google AdSense) before production.
 */
const AdBanner: React.FC<AdBannerProps> = ({ variant = 'sidebar', className = '' }) => {
  const getAdStyles = () => {
    switch (variant) {
      case 'banner':
        return 'w-full h-24 md:h-20';
      case 'inline':
        return 'w-full h-32';
      case 'sidebar':
      default:
        return 'w-full h-48';
    }
  };

  return (
    <Card 
      className={`${getAdStyles()} ${className} mx-2 mb-4 flex items-center justify-center bg-muted/30 border-dashed border-2 border-muted-foreground/20`}
    >
      <div className="text-center p-4">
        <p className="text-xs text-muted-foreground/60 font-medium">Advertisement</p>
        <p className="text-[10px] text-muted-foreground/40 mt-1">Ad space placeholder</p>
      </div>
    </Card>
  );
};

export default AdBanner;
