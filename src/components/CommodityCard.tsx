
import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp, DollarSign, Activity, BarChart3 } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import CommodityChart from './CommodityChart';
import CommodityNews from './CommodityNews';
import { useCommodityPrice } from '@/hooks/useCommodityData';

interface CommodityCardProps {
  name: string;
  price: number;
  change: number;
  symbol: string;
}

const CommodityCard = ({ name, price: fallbackPrice, change: fallbackChange, symbol }: CommodityCardProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const { price: apiPrice, loading: priceLoading } = useCommodityPrice(name);
  
  // Use API data if available, otherwise fallback to props
  const currentPrice = apiPrice?.price ?? fallbackPrice;
  const currentChange = apiPrice?.changePercent ?? fallbackChange;
  const isPositive = currentChange >= 0;

  // Function to get the appropriate price units based on commodity name
  const getPriceUnits = (commodityName: string) => {
    const name = commodityName.toLowerCase();
    
    // Energy commodities
    if (name.includes('crude') || name.includes('oil')) return 'USD/bbl';
    if (name.includes('natural gas')) return 'USD/MMBtu';
    if (name.includes('gasoline') || name.includes('heating oil')) return 'USD/gal';
    
    // Metals
    if (name.includes('gold') || name.includes('silver') || name.includes('platinum') || name.includes('palladium')) return 'USD/oz';
    if (name.includes('copper')) return 'USD/lb';
    
    // Grains and Agricultural
    if (name.includes('corn') || name.includes('wheat') || name.includes('oats') || name.includes('soybeans')) return 'USD/bu';
    if (name.includes('rice')) return 'USD/cwt';
    if (name.includes('soybean meal')) return 'USD/ton';
    if (name.includes('soybean oil')) return 'USD/lb';
    
    // Livestock
    if (name.includes('cattle')) return 'USD/lb';
    if (name.includes('hogs')) return 'USD/lb';
    
    // Softs
    if (name.includes('cocoa')) return 'USD/MT';
    if (name.includes('coffee')) return 'USD/lb';
    if (name.includes('cotton')) return 'USD/lb';
    if (name.includes('lumber')) return 'USD/1000ft';
    if (name.includes('orange juice')) return 'USD/lb';
    if (name.includes('sugar')) return 'USD/lb';
    
    // Default fallback
    return 'USD';
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger 
        className="w-full touch-manipulation"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Card className="group relative overflow-hidden card-hover-effect border-0 bg-gradient-to-r from-card via-card to-card/80 backdrop-blur-sm shadow-soft active:scale-[0.98] transition-all duration-200">
          {/* Enhanced Background Pattern with Responsive Adjustments */}
          <div className={`absolute inset-0 bg-gradient-to-r from-primary/3 via-accent/2 to-transparent transition-all duration-500 ${
            isHovered || isOpen ? 'opacity-100' : 'opacity-0'
          }`} />
          <div className={`absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-2xl sm:blur-3xl transition-opacity duration-700 ${
            isHovered || isOpen ? 'opacity-100' : 'opacity-0'
          }`} />
          
          <div className="relative p-3 sm:p-4 md:p-6 lg:p-8">
            {/* Mobile-First Responsive Layout */}
            <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
              {/* Main Content - Stacked on Mobile */}
              <div className="flex-1 space-y-3 sm:space-y-4">
                {/* Header Section */}
                <div className="flex items-center justify-between sm:justify-start sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={`p-1.5 sm:p-2 rounded-lg bg-primary/10 text-primary transition-all duration-300 ${
                      isHovered ? 'bg-primary/20 scale-110' : ''
                    }`}>
                      <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg lg:text-xl font-bold text-foreground transition-colors tracking-tight truncate group-hover:text-primary">
                        {name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 text-2xs sm:text-xs font-bold bg-muted/60 rounded-full text-muted-foreground uppercase tracking-wider">
                          {symbol}
                        </span>
                        {priceLoading && (
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                        )}
                        {apiPrice && (
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Mobile Expand Icon */}
                  <div className="flex items-center sm:hidden">
                    <div className={`p-2 rounded-full transition-all duration-300 ${
                      isOpen ? 'bg-primary/20 text-primary' : 'bg-muted/50 text-muted-foreground'
                    }`}>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Price and Change - Responsive Layout */}
                <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:gap-4 lg:gap-6">
                <div className="flex flex-col sm:flex-row sm:items-end sm:gap-3">
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Current Price</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground number-display transition-colors group-hover:text-primary">
                        ${currentPrice.toFixed(2)}
                      </p>
                      <span className="text-2xs sm:text-xs text-muted-foreground font-medium bg-muted/50 px-1.5 py-0.5 rounded">
                        15min delayed
                      </span>
                    </div>
                  </div>
                </div>
                  
                  <div className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-soft transition-all duration-300 w-fit ${
                    isPositive 
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200 dark:from-green-950/20 dark:to-emerald-950/20 dark:text-green-400 dark:border-green-800' 
                      : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-200 dark:from-red-950/20 dark:to-rose-950/20 dark:text-red-400 dark:border-red-800'
                  } ${isHovered ? 'scale-105' : ''}`}>
                    {isPositive ? <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" /> : <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />}
                    <span className="number-display">{Math.abs(currentChange).toFixed(2)}%</span>
                  </div>
                </div>
              </div>
              
              {/* Stats Section - Hidden on Mobile, Responsive on Desktop */}
              <div className="hidden sm:flex sm:items-center sm:gap-4 lg:gap-6">
                <div className="text-right space-y-2 lg:space-y-3">
                  <div className="space-y-1">
                    <p className="text-2xs lg:text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price Units</p>
                    <p className="text-xs lg:text-sm font-semibold text-muted-foreground number-display">{getPriceUnits(name)}</p>
                  </div>
                </div>
                
                <div className={`flex items-center p-2 rounded-full transition-all duration-300 ${
                  isOpen ? 'bg-primary/20 text-primary' : 'bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary'
                }`}>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 lg:w-5 lg:h-5" />
                  ) : (
                    <ChevronDown className="w-4 h-4 lg:w-5 lg:h-5" />
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Stats Section - Visible only when expanded on mobile */}
            <div className={`sm:hidden transition-all duration-300 ${
              isOpen ? 'opacity-100 max-h-20 mt-4' : 'opacity-0 max-h-0 overflow-hidden'
            }`}>
              <div className="flex justify-around py-3 border-t border-border/50">
                <div className="text-center">
                  <p className="text-2xs font-semibold text-muted-foreground uppercase tracking-wider">Units</p>
                  <p className="text-sm font-bold number-display">{getPriceUnits(name)}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xs font-semibold text-muted-foreground uppercase tracking-wider">Status</p>
                  <div className="flex items-center justify-center gap-1">
                    <Activity className="w-3 h-3 text-green-500" />
                    <p className="text-xs font-bold text-green-600 dark:text-green-400">Live</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="overflow-hidden">
        <div className="mt-3 sm:mt-4 space-y-4 sm:space-y-6 animate-accordion-down">
          <CommodityChart name={name} basePrice={currentPrice} />
          <CommodityNews commodity={name} />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default CommodityCard;
