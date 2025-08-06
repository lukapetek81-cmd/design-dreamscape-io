import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  threshold?: number;
  enabled?: boolean;
  className?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  threshold = 80,
  enabled = true,
  className = '',
}) => {
  const isMobile = useIsMobile();
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [pullDistance, setPullDistance] = React.useState(0);
  const [startY, setStartY] = React.useState<number | null>(null);
  const [isPulling, setIsPulling] = React.useState(false);

  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
    if (!enabled || !isMobile || isRefreshing) return;
    
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) return;

    setStartY(e.touches[0].clientY);
    setIsPulling(false);
  }, [enabled, isMobile, isRefreshing]);

  const handleTouchMove = React.useCallback((e: React.TouchEvent) => {
    if (!enabled || !isMobile || isRefreshing || startY === null) return;
    
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - startY;

    if (distance > 0) {
      e.preventDefault();
      setIsPulling(true);
      setPullDistance(Math.min(distance, threshold * 1.5));
    }
  }, [enabled, isMobile, isRefreshing, startY, threshold]);

  const handleTouchEnd = React.useCallback(async () => {
    if (!enabled || !isMobile || isRefreshing || !isPulling) return;

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    }

    setStartY(null);
    setIsPulling(false);
    setPullDistance(0);
  }, [enabled, isMobile, isRefreshing, isPulling, pullDistance, threshold, onRefresh]);

  const pullProgress = Math.min(pullDistance / threshold, 1);
  const showRefreshIndicator = isPulling || isRefreshing;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-y-auto custom-scrollbar ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: isPulling ? `translateY(${Math.min(pullDistance * 0.5, 40)}px)` : 'translateY(0)',
        transition: isPulling ? 'none' : 'transform 0.3s ease-out',
      }}
    >
      {/* Pull to refresh indicator */}
      {showRefreshIndicator && (
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-center py-4 bg-background/90 backdrop-blur-sm border-b border-border/50 z-10"
          style={{
            transform: `translateY(${isPulling ? -60 + (pullDistance * 0.8) : 0}px)`,
            transition: isPulling ? 'none' : 'transform 0.3s ease-out',
          }}
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <div
              className={`w-5 h-5 border-2 border-primary border-t-transparent rounded-full ${
                isRefreshing ? 'animate-spin' : ''
              }`}
              style={{
                transform: `rotate(${pullProgress * 180}deg)`,
                transition: isRefreshing ? 'none' : 'transform 0.1s ease-out',
              }}
            />
            <span className="text-sm font-medium">
              {isRefreshing ? 'Refreshing...' : pullProgress >= 1 ? 'Release to refresh' : 'Pull to refresh'}
            </span>
          </div>
        </div>
      )}

      {children}
    </div>
  );
};