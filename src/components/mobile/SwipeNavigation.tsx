import React from 'react';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import { useHaptics } from '@/hooks/useHaptics';
import { useIsMobile } from '@/hooks/use-mobile';

interface SwipeNavigationProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  className?: string;
  enableHaptics?: boolean;
  threshold?: number;
  showVisualFeedback?: boolean;
}

const SwipeNavigation: React.FC<SwipeNavigationProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  className = '',
  enableHaptics = true,
  threshold = 35, // Reduced threshold for more responsiveness
  showVisualFeedback = true,
}) => {
  const { vibrateSelection } = useHaptics();
  const isMobile = useIsMobile();
  const [swipeProgress, setSwipeProgress] = React.useState(0);
  const [swipeDirection, setSwipeDirection] = React.useState<'left' | 'right' | 'up' | 'down' | null>(null);

  const handleSwipeProgress = React.useCallback((progress: number, direction: 'left' | 'right' | 'up' | 'down' | null) => {
    setSwipeProgress(progress);
    setSwipeDirection(direction);
    
    // Provide haptic feedback at key progress points
    if (enableHaptics && progress > 0.3 && progress < 0.35) {
      vibrateSelection();
    }
  }, [enableHaptics, vibrateSelection]);

  const swipeHandlers = useSwipeGesture({
    onSwipeLeft: () => {
      if (enableHaptics) vibrateSelection();
      onSwipeLeft?.();
    },
    onSwipeRight: () => {
      if (enableHaptics) vibrateSelection();
      onSwipeRight?.();
    },
    onSwipeUp: () => {
      if (enableHaptics) vibrateSelection();
      onSwipeUp?.();
    },
    onSwipeDown: () => {
      if (enableHaptics) vibrateSelection();
      onSwipeDown?.();
    },
    onSwipeProgress: handleSwipeProgress,
    threshold,
    progressThreshold: 15, // Start showing feedback early
    enabled: isMobile,
  });

  // Calculate visual feedback styles
  const getVisualFeedbackStyle = () => {
    if (!showVisualFeedback || !swipeDirection || swipeProgress === 0) {
      return {};
    }

    const opacity = Math.min(swipeProgress * 0.6, 0.3);
    
    switch (swipeDirection) {
      case 'right':
        return {
          background: `linear-gradient(to right, hsl(var(--primary) / ${opacity}) 0%, transparent ${Math.min(swipeProgress * 100, 30)}%)`,
        };
      case 'left':
        return {
          background: `linear-gradient(to left, hsl(var(--destructive) / ${opacity}) 0%, transparent ${Math.min(swipeProgress * 100, 30)}%)`,
        };
      default:
        return {};
    }
  };

  return (
    <div 
      className={`relative overflow-hidden ${className}`} 
      {...swipeHandlers}
    >
      {/* Visual feedback overlay */}
      {showVisualFeedback && (
        <div 
          className="absolute inset-0 pointer-events-none transition-all duration-75 ease-out z-10"
          style={getVisualFeedbackStyle()}
        />
      )}
      
      {/* Swipe indicator */}
      {showVisualFeedback && swipeDirection === 'right' && swipeProgress > 0.2 && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
          <div 
            className="w-8 h-8 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center transition-all duration-75"
            style={{
              transform: `scale(${0.5 + swipeProgress * 0.5})`,
              opacity: Math.min(swipeProgress * 2, 1),
            }}
          >
            <div className="w-2 h-2 bg-primary rounded-full" />
          </div>
        </div>
      )}

      {/* Content with smooth transform during gesture */}
      <div 
        className="transition-transform duration-75 ease-out"
        style={{
          transform: swipeDirection === 'right' && swipeProgress > 0 
            ? `translateX(${Math.min(swipeProgress * 20, 10)}px)` 
            : 'translateX(0)',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default SwipeNavigation;