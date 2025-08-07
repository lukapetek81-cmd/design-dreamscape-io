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
}

const SwipeNavigation: React.FC<SwipeNavigationProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  className = '',
  enableHaptics = true,
  threshold = 50,
}) => {
  const { vibrateSelection } = useHaptics();
  const isMobile = useIsMobile();

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
    threshold,
    enabled: isMobile,
  });

  return (
    <div className={className} {...swipeHandlers}>
      {children}
    </div>
  );
};

export default SwipeNavigation;