import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  mobileClassName?: string;
  tabletClassName?: string;
  desktopClassName?: string;
  enableAnimations?: boolean;
}

interface ScreenSize {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  orientation: 'portrait' | 'landscape';
}

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = '',
  mobileClassName = '',
  tabletClassName = '',
  desktopClassName = '',
  enableAnimations = true,
}) => {
  const [screenSize, setScreenSize] = useState<ScreenSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    orientation: 'landscape',
  });

  const isMobile = useIsMobile();
  const controls = useAnimation();

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isMobileSize = width < 768;
      const isTabletSize = width >= 768 && width < 1024;
      const isDesktopSize = width >= 1024;
      const orientation = width > height ? 'landscape' : 'portrait';

      setScreenSize({
        width,
        height,
        isMobile: isMobileSize,
        isTablet: isTabletSize,
        isDesktop: isDesktopSize,
        orientation,
      });

      // Trigger animation on screen size change
      if (enableAnimations) {
        controls.start({
          scale: [0.98, 1],
          opacity: [0.8, 1],
          transition: { duration: 0.3, ease: "easeOut" }
        });
      }
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    window.addEventListener('orientationchange', updateScreenSize);

    return () => {
      window.removeEventListener('resize', updateScreenSize);
      window.removeEventListener('orientationchange', updateScreenSize);
    };
  }, [controls, enableAnimations]);

  // Determine which additional className to apply
  const getResponsiveClassName = () => {
    if (screenSize.isMobile && mobileClassName) return mobileClassName;
    if (screenSize.isTablet && tabletClassName) return tabletClassName;
    if (screenSize.isDesktop && desktopClassName) return desktopClassName;
    return '';
  };

  const containerVariants = {
    mobile: {
      padding: '1rem',
      gap: '0.75rem',
    },
    tablet: {
      padding: '1.5rem',
      gap: '1rem',
    },
    desktop: {
      padding: '2rem',
      gap: '1.5rem',
    },
  };

  const getCurrentVariant = () => {
    if (screenSize.isMobile) return 'mobile';
    if (screenSize.isTablet) return 'tablet';
    return 'desktop';
  };

  return (
    <motion.div
      className={`
        ${className}
        ${getResponsiveClassName()}
        transition-all duration-300 ease-in-out
        ${screenSize.orientation === 'landscape' && screenSize.isMobile ? 'landscape-mobile' : ''}
      `}
      animate={controls}
      variants={enableAnimations ? containerVariants : undefined}
      initial={getCurrentVariant()}
      style={{
        '--screen-width': `${screenSize.width}px`,
        '--screen-height': `${screenSize.height}px`,
      } as React.CSSProperties}
    >
      {children}
    </motion.div>
  );
};

// Hook to get current screen information
export const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState<ScreenSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    orientation: 'landscape',
  });

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({
        width,
        height,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        orientation: width > height ? 'landscape' : 'portrait',
      });
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    window.addEventListener('orientationchange', updateScreenSize);

    return () => {
      window.removeEventListener('resize', updateScreenSize);
      window.removeEventListener('orientationchange', updateScreenSize);
    };
  }, []);

  return screenSize;
};

export default ResponsiveContainer;