import React, { useMemo, useState, useEffect } from 'react';
import CommodityCard from './CommodityCard';
import { Commodity } from '@/hooks/useCommodityData';
import { useIsMobile } from '@/hooks/use-mobile';

interface VirtualizedCommodityListProps {
  commodities: Commodity[];
  loading?: boolean;
}

const VirtualizedCommodityList: React.FC<VirtualizedCommodityListProps> = ({ 
  commodities, 
  loading = false 
}) => {
  const isMobile = useIsMobile();
  const [visibleItems, setVisibleItems] = useState(10); // Start with 10 items
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Increase visible items when scrolling near bottom
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // If user scrolled to 80% of the page, load more items
      if (scrollTop + windowHeight >= documentHeight * 0.8 && !isLoadingMore && visibleItems < commodities.length) {
        setIsLoadingMore(true);
        
        // Simulate loading delay for better UX
        setTimeout(() => {
          setVisibleItems(prev => Math.min(prev + (isMobile ? 5 : 10), commodities.length));
          setIsLoadingMore(false);
        }, 300);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [commodities.length, visibleItems, isLoadingMore, isMobile]);

  // Reset visible items when commodities change
  useEffect(() => {
    setVisibleItems(isMobile ? 5 : 10);
  }, [commodities, isMobile]);

  const visibleCommodities = useMemo(() => 
    commodities.slice(0, visibleItems), 
    [commodities, visibleItems]
  );

  if (loading) {
    return (
      <div className="grid gap-3 sm:gap-4 lg:gap-6">
        {Array.from({ length: isMobile ? 3 : 6 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="h-32 bg-muted rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:gap-4 lg:gap-6">
        {visibleCommodities.map((commodity, index) => (
          <div key={`${commodity.symbol}-${index}`}>
            <CommodityCard
              name={commodity.name}
              price={commodity.price}
              change={commodity.changePercent}
              symbol={commodity.symbol}
              venue={commodity.venue}
              contractSize={commodity.contractSize}
            />
          </div>
        ))}
      </div>
      
      {/* Loading indicator for additional items */}
      {isLoadingMore && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      )}
      
      {/* Load more indicator */}
      {visibleItems < commodities.length && !isLoadingMore && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            Showing {visibleItems} of {commodities.length} commodities
          </p>
        </div>
      )}
    </div>
  );
};

export default React.memo(VirtualizedCommodityList);