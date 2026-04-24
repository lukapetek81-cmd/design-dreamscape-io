import React from 'react';
import CommodityCard from './CommodityCard';
import { Commodity } from '@/hooks/useCommodityData';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { SkeletonCard } from '@/components/ui/enhanced-skeleton';
import { usePerformanceOptimizer } from '@/hooks/usePerformanceOptimizer';
import { Anchor, Droplets, Flame, BarChart3 } from 'lucide-react';

interface VirtualizedCommodityListProps {
  commodities: Commodity[];
  loading?: boolean;
  highlightCommodity?: string | null;
}

const VirtualizedCommodityList: React.FC<VirtualizedCommodityListProps> = ({ 
  commodities, 
  loading = false,
  highlightCommodity
}) => {
  const isMobile = useIsMobile();
  const { isPremium } = useAuth();
  const [visibleItems, setVisibleItems] = React.useState(10); // Start with 10 items
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);

  // Increase visible items when scrolling near bottom
  React.useEffect(() => {
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

  // Reset visible items when commodities change, ensure highlighted item is visible
  React.useEffect(() => {
    const defaultVisible = isMobile ? 5 : 10;
    if (highlightCommodity) {
      const idx = commodities.findIndex(c => c.name === highlightCommodity);
      setVisibleItems(Math.max(defaultVisible, idx + 2));
    } else {
      setVisibleItems(defaultVisible);
    }
  }, [commodities, isMobile, highlightCommodity]);

  // Define energy subsections for Marine Fuels separation
  const MARINE_FUEL_NAMES = new Set([
    'VLSFO Global', 'HFO 380 Global', 'MGO 0.5%S Global',
    'HFO 380 Rotterdam', 'VLSFO Singapore', 'MGO Houston', 'VLSFO Fujairah',
  ]);

  const REFINED_PRODUCT_NAMES = new Set([
    'Gasoline RBOB', 'Heating Oil', 'Jet Fuel', 'ULSD Diesel',
    'Gasoil', 'Naphtha', 'Propane', 'Ethanol',
  ]);

  const NATURAL_GAS_NAMES = new Set([
    'Natural Gas', 'Natural Gas UK', 'Dutch TTF Gas', 'Japan/Korea LNG', 'US Gas Storage',
  ]);

  const groupedVisible = React.useMemo(() => {
    const items = commodities.slice(0, visibleItems);
    // Only apply subsections for energy category
    const isEnergy = items.length > 0 && items[0]?.category === 'energy';
    if (!isEnergy) return { sections: [{ label: null, icon: null, items }] };

    const crudeOils: Commodity[] = [];
    const naturalGas: Commodity[] = [];
    const refinedProducts: Commodity[] = [];
    const marineFuels: Commodity[] = [];

    for (const c of items) {
      if (MARINE_FUEL_NAMES.has(c.name)) marineFuels.push(c);
      else if (REFINED_PRODUCT_NAMES.has(c.name)) refinedProducts.push(c);
      else if (NATURAL_GAS_NAMES.has(c.name)) naturalGas.push(c);
      else crudeOils.push(c);
    }

    const sections: { label: string | null; icon: React.ReactNode | null; items: Commodity[] }[] = [];
    if (crudeOils.length > 0) sections.push({ label: 'Crude Oil Benchmarks', icon: <Droplets className="w-4 h-4" />, items: crudeOils });
    if (naturalGas.length > 0) sections.push({ label: 'Natural Gas & LNG', icon: <Flame className="w-4 h-4" />, items: naturalGas });
    if (refinedProducts.length > 0) sections.push({ label: 'Refined Products', icon: <BarChart3 className="w-4 h-4" />, items: refinedProducts });
    if (marineFuels.length > 0) sections.push({ label: 'Marine Fuels', icon: <Anchor className="w-4 h-4" />, items: marineFuels });

    return { sections };
  }, [commodities, visibleItems]);

  const visibleCommodities = React.useMemo(() => 
    commodities.slice(0, visibleItems), 
    [commodities, visibleItems]
  );

  if (loading) {
    return (
      <div className="grid gap-3 sm:gap-4 lg:gap-6">
        {Array.from({ length: isMobile ? 3 : 6 }).map((_, index) => (
          <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <SkeletonCard 
              showImage={false}
              showTitle={true}
              showDescription={true}
              showActions={false}
              lines={3}
            />
          </div>
        ))}
      </div>
    );
  }

  let globalIndex = 0;

  return (
    <div className="space-y-4 pb-8">
      {groupedVisible.sections.map((section, sIdx) => (
        <div key={section.label || sIdx}>
          {section.label && (
            <div className="flex items-center gap-2 mb-3 mt-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/60 border border-border/40">
                <span className="text-muted-foreground">{section.icon}</span>
                <span className="text-sm font-semibold text-muted-foreground">{section.label}</span>
                <span className="text-xs text-muted-foreground/70">({section.items.length})</span>
              </div>
              <div className="flex-1 h-px bg-border/30" />
            </div>
          )}
          <div className="grid gap-3 sm:gap-4 lg:gap-6">
            {section.items.map((commodity) => {
              const idx = globalIndex++;
              const availableContracts = undefined;
              const isHighlighted = commodity.name === highlightCommodity;
              return (
                <div 
                  key={`${commodity.symbol}-${idx}`}
                  className={`animate-fade-in ${isHighlighted ? 'ring-2 ring-primary/50 rounded-2xl' : ''}`}
                  style={{ animationDelay: `${idx * 0.05}s` }}
                  ref={isHighlighted ? (el) => { el?.scrollIntoView({ behavior: 'smooth', block: 'center' }); } : undefined}
                >
                  <CommodityCard
                    name={commodity.name}
                    price={commodity.price}
                    change={commodity.change || 0}
                    changePercent={commodity.changePercent}
                    symbol={commodity.symbol}
                    venue={commodity.venue}
                    contractSize={commodity.contractSize}
                    availableContracts={availableContracts}
                    defaultOpen={commodity.name === highlightCommodity}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
      
      {/* Loading indicator for additional items */}
      {isLoadingMore && (
        <div className="animate-fade-in">
          <div className="flex justify-center py-6">
            <div className="flex items-center gap-3 px-4 py-2 bg-muted/50 rounded-full">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
              <span className="text-sm text-muted-foreground font-medium">Loading more commodities...</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Load more indicator */}
      {visibleItems < commodities.length && !isLoadingMore && (
        <div className="animate-fade-in">
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
        </div>
      )}
    </div>
  );
};

export default React.memo(VirtualizedCommodityList);