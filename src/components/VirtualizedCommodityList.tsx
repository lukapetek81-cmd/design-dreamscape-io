import React from 'react';
import CommodityCard from './CommodityCard';
import { Commodity } from '@/hooks/useCommodityData';
import { useIsMobile } from '@/hooks/use-mobile';
import { SkeletonCard } from '@/components/ui/enhanced-skeleton';
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
  // Render every commodity — cards are lightweight and chart/news inside
  // only mount when the card is expanded (LazyChart / LazyNews).

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
    const items = commodities;
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
  }, [commodities]);

  if (loading) {
    return (
      <div className="grid gap-3 sm:gap-4 lg:gap-6">
        {Array.from({ length: isMobile ? 3 : 6 }).map((_, index) => (
          <div key={index}>
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
                  className={isHighlighted ? 'ring-2 ring-primary/50 rounded-2xl' : ''}
                  ref={isHighlighted ? (el) => {
                    if (el && !el.dataset.scrolled) {
                      el.dataset.scrolled = '1';
                      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  } : undefined}
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
    </div>
  );
};

export default React.memo(VirtualizedCommodityList);