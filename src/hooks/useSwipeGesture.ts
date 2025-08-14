import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeProgress?: (progress: number, direction: 'left' | 'right' | 'up' | 'down' | null) => void;
  threshold?: number;
  enabled?: boolean;
  progressThreshold?: number; // When to start showing progress feedback
}

export const useSwipeGesture = (options: SwipeGestureOptions) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onSwipeProgress,
    threshold = 50,
    progressThreshold = 20,
    enabled = true,
  } = options;

  const isMobile = useIsMobile();
  const [touchStart, setTouchStart] = React.useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = React.useState<{ x: number; y: number } | null>(null);
  const [isGesturing, setIsGesturing] = React.useState(false);

  const onTouchStart = React.useCallback((e: React.TouchEvent) => {
    if (!enabled || !isMobile) return;
    
    setTouchEnd(null);
    setIsGesturing(true);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  }, [enabled, isMobile]);

  const onTouchMove = React.useCallback((e: React.TouchEvent) => {
    if (!enabled || !isMobile || !touchStart) return;
    
    const currentTouch = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
    
    setTouchEnd(currentTouch);

    // Calculate progress for visual feedback
    if (onSwipeProgress) {
      const distanceX = touchStart.x - currentTouch.x;
      const distanceY = touchStart.y - currentTouch.y;
      
      const isHorizontal = Math.abs(distanceX) > Math.abs(distanceY);
      
      if (isHorizontal && Math.abs(distanceX) > progressThreshold) {
        const maxDistance = 200; // Maximum distance for 100% progress
        const progress = Math.min(Math.abs(distanceX) / maxDistance, 1);
        const direction = distanceX > 0 ? 'left' : 'right';
        onSwipeProgress(progress, direction);
      } else if (!isHorizontal && Math.abs(distanceY) > progressThreshold) {
        const maxDistance = 200;
        const progress = Math.min(Math.abs(distanceY) / maxDistance, 1);
        const direction = distanceY > 0 ? 'up' : 'down';
        onSwipeProgress(progress, direction);
      } else {
        onSwipeProgress(0, null);
      }
    }
  }, [enabled, isMobile, touchStart, onSwipeProgress, progressThreshold]);

  const onTouchEnd = React.useCallback(() => {
    if (!enabled || !isMobile || !touchStart || !touchEnd) {
      setIsGesturing(false);
      if (onSwipeProgress) onSwipeProgress(0, null);
      return;
    }

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    
    const isLeftSwipe = distanceX > threshold;
    const isRightSwipe = distanceX < -threshold;
    const isUpSwipe = distanceY > threshold;
    const isDownSwipe = distanceY < -threshold;

    // Determine if horizontal or vertical swipe is dominant
    const isHorizontal = Math.abs(distanceX) > Math.abs(distanceY);

    if (isHorizontal) {
      if (isLeftSwipe && onSwipeLeft) {
        onSwipeLeft();
      } else if (isRightSwipe && onSwipeRight) {
        onSwipeRight();
      }
    } else {
      if (isUpSwipe && onSwipeUp) {
        onSwipeUp();
      } else if (isDownSwipe && onSwipeDown) {
        onSwipeDown();
      }
    }

    setIsGesturing(false);
    if (onSwipeProgress) onSwipeProgress(0, null);
  }, [enabled, isMobile, touchStart, touchEnd, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onSwipeProgress]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    isGesturing,
  };
};