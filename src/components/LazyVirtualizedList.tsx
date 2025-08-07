import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import CommodityCard from './CommodityCard';
import { Commodity } from '@/hooks/useCommodityData';
import { useIsMobile } from '@/hooks/use-mobile';
import { SkeletonCard } from '@/components/ui/enhanced-skeleton';
import { FadeInAnimation, StaggeredAnimation } from '@/components/animations/Animations';

interface LazyVirtualizedListProps {
  commodities: Commodity[];
  loading?: boolean;
  itemHeight?: number;
  bufferSize?: number;
}

const LazyVirtualizedList: React.FC<LazyVirtualizedListProps> = ({ 
  commodities, 
  loading = false,
  itemHeight = 120,
  bufferSize = 3
}) => {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);
  
  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize);
    const endIndex = Math.min(
      commodities.length - 1,
      Math.floor((scrollTop + containerHeight) / itemHeight) + bufferSize
    );
    return { startIndex, endIndex };
  }, [scrollTop, containerHeight, itemHeight, bufferSize, commodities.length]);

  // Get visible items
  const visibleItems = useMemo(() => 
    commodities.slice(visibleRange.startIndex, visibleRange.endIndex + 1),
    [commodities, visibleRange]
  );

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Update container height on resize
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: isMobile ? 3 : 6 }).map((_, index) => (
          <FadeInAnimation key={index} delay={index * 0.05}>
            <SkeletonCard 
              showImage={false}
              showTitle={true}
              showDescription={true}
              showActions={false}
              lines={3}
            />
          </FadeInAnimation>
        ))}
      </div>
    );
  }

  const totalHeight = commodities.length * itemHeight;

  return (
    <div 
      ref={containerRef}
      className="relative overflow-auto custom-scrollbar"
      style={{ height: Math.min(totalHeight, 800) }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div 
          style={{ 
            transform: `translateY(${visibleRange.startIndex * itemHeight}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          <StaggeredAnimation staggerDelay={0.02} className="space-y-3">
            {visibleItems.map((commodity, index) => {
              const actualIndex = visibleRange.startIndex + index;
              return (
                <div 
                  key={`${commodity.symbol}-${actualIndex}`}
                  style={{ height: itemHeight }}
                  className="flex items-center"
                >
                  <CommodityCard
                    name={commodity.name}
                    price={commodity.price}
                    change={commodity.change || 0}
                    changePercent={commodity.changePercent}
                    symbol={commodity.symbol}
                    venue={commodity.venue}
                    contractSize={commodity.contractSize}
                  />
                </div>
              );
            })}
          </StaggeredAnimation>
        </div>
      </div>
    </div>
  );
};

export default React.memo(LazyVirtualizedList);