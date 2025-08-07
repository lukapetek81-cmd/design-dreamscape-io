import React, { useMemo, useState, useEffect } from 'react';
import CommodityCard from './CommodityCard';
import { Commodity } from '@/hooks/useCommodityData';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SkeletonCard } from '@/components/ui/enhanced-skeleton';
import { FadeInAnimation, StaggeredAnimation } from '@/components/animations/Animations';

interface FuturesContract {
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  expirationDate: string;
  contractSize?: string;
  venue?: string;
}

interface VirtualizedCommodityListProps {
  commodities: Commodity[];
  loading?: boolean;
}

const VirtualizedCommodityList: React.FC<VirtualizedCommodityListProps> = ({ 
  commodities, 
  loading = false 
}) => {
  const isMobile = useIsMobile();
  const { isPremium } = useAuth();
  const [visibleItems, setVisibleItems] = useState(10); // Start with 10 items
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Fetch IBKR futures contracts for premium users
  const useFuturesContracts = (commodityName: string) => {
    return useQuery({
      queryKey: ['ibkr-futures', commodityName],
      queryFn: async () => {
        const { data, error } = await supabase.functions.invoke('fetch-ibkr-futures', {
          body: { commodity: commodityName }
        });
        
        if (error) throw new Error(error.message);
        return data.contracts as FuturesContract[];
      },
      enabled: !!commodityName && isPremium,
      staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });
  };

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
          <FadeInAnimation key={index} delay={index * 0.1}>
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

  return (
    <div className="space-y-4">
      <StaggeredAnimation staggerDelay={0.05} className="grid gap-3 sm:gap-4 lg:gap-6">
        {visibleCommodities.map((commodity, index) => {
          // Only fetch futures contracts for premium users and supported commodities
          const contractsQuery = useFuturesContracts(commodity.name);
          const availableContracts = isPremium ? contractsQuery.data : undefined;

          return (
            <div key={`${commodity.symbol}-${index}`}>
              <CommodityCard
                name={commodity.name}
                price={commodity.price}
                change={commodity.change || 0}
                changePercent={commodity.changePercent}
                symbol={commodity.symbol}
                venue={commodity.venue}
                contractSize={commodity.contractSize}
                availableContracts={availableContracts}
              />
            </div>
          );
        })}
      </StaggeredAnimation>
      
      {/* Enhanced Loading indicator for additional items */}
      {isLoadingMore && (
        <FadeInAnimation>
          <div className="flex justify-center py-6">
            <div className="flex items-center gap-3 px-4 py-2 bg-muted/50 rounded-full">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
              <span className="text-sm text-muted-foreground font-medium">Loading more commodities...</span>
            </div>
          </div>
        </FadeInAnimation>
      )}
      
      {/* Enhanced Load more indicator */}
      {visibleItems < commodities.length && !isLoadingMore && (
        <FadeInAnimation>
          <div className="text-center py-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border/50 rounded-full shadow-sm">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <p className="text-sm text-muted-foreground font-medium">
                Showing {visibleItems} of {commodities.length} commodities
              </p>
              <div className="text-xs text-primary font-semibold">
                Scroll for more
              </div>
            </div>
          </div>
        </FadeInAnimation>
      )}
    </div>
  );
};

export default React.memo(VirtualizedCommodityList);