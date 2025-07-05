
import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp, DollarSign, Activity, BarChart3 } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { formatPrice } from '@/lib/commodityUtils';
import CommodityChart from './CommodityChart';
import CommodityNews from './CommodityNews';
import { useCommodityPrice } from '@/hooks/useCommodityData';
import { useRealtimeDataContext } from '@/contexts/RealtimeDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { getMarketStatus } from '@/lib/marketHours';

interface CommodityCardProps {
  name: string;
  price: number;
  change: number;
  symbol: string;
  venue: string;
  contractSize?: string;
}

const CommodityCard = ({ name, price: fallbackPrice, change: fallbackChange, symbol, venue, contractSize }: CommodityCardProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const { data: apiPrice, isLoading: priceLoading } = useCommodityPrice(name);
  const { profile } = useAuth();
  
  // Get market status for this commodity
  const marketStatus = getMarketStatus(name);
  
  // Check if user has premium subscription for real-time data
  const isPremium = profile?.subscription_active && 
    (profile?.subscription_tier === 'premium' || profile?.subscription_tier === 'pro');
  
  // Use real-time data context
  const { getPriceForCommodity, isLiveData, connected: realtimeConnected } = useRealtimeDataContext();
  
  // Determine data source priority: real-time > API > fallback
  const realtimePrice = getPriceForCommodity(name);
  const currentPrice = realtimePrice?.price ?? apiPrice?.price ?? fallbackPrice;
  const currentChange = realtimePrice?.changePercent ?? apiPrice?.changePercent ?? fallbackChange;
  const isPositive = currentChange >= 0;
  const isRealTime = isPremium && isLiveData(name);

  // Function to get the appropriate price units based on commodity name
  const getPriceUnits = (commodityName: string) => {
    const name = commodityName.toLowerCase();
    
    // Energy commodities
    if (name.includes('crude') || (name.includes('oil') && !name.includes('heating'))) return 'USD/bbl';
    if (name.includes('natural gas')) return 'USD/MMBtu';
    if (name.includes('gasoline') || name.includes('rbob')) return 'USD/gal';
    if (name.includes('heating oil')) return 'USD/gal';
    if (name.includes('brent')) return 'USD/bbl';
    
    // Metals
    if (name.includes('gold')) return 'USD/oz';
    if (name.includes('silver')) return 'USD/oz';
    if (name.includes('platinum')) return 'USD/oz';
    if (name.includes('palladium')) return 'USD/oz';
    if (name.includes('copper')) return 'USD/lb';
    
    // Grains and Agricultural (priced in cents)
    if (name.includes('corn')) return 'cents/bu';
    if (name.includes('wheat')) return 'cents/bu';
    if (name.includes('oat')) return 'cents/bu';
    if (name.includes('soybean') && !name.includes('meal') && !name.includes('oil')) return 'cents/bu';
    if (name.includes('rice')) return 'cents/cwt';
    if (name.includes('soybean meal')) return 'USD/ton';
    if (name.includes('soybean oil')) return 'cents/lb';
    
    // Livestock (priced in cents)
    if (name.includes('cattle')) return 'cents/lb';
    if (name.includes('hog')) return 'cents/lb';
    
    // Softs
    if (name.includes('cocoa')) return 'USD/MT';
    if (name.includes('coffee')) return 'cents/lb';
    if (name.includes('cotton')) return 'cents/lb';
    if (name.includes('lumber')) return 'USD/1000 bd ft';
    if (name.includes('orange juice')) return 'cents/lb';
    if (name.includes('sugar')) return 'cents/lb';
    
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
                        <span className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 text-2xs sm:text-xs font-medium bg-primary/10 text-primary rounded-full uppercase tracking-wider">
                          {venue}
                        </span>
                        {contractSize && (
                          <span className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 text-2xs sm:text-xs font-medium bg-secondary/10 text-secondary-foreground rounded-full tracking-wider">
                            {contractSize}
                          </span>
                        )}
                        {priceLoading && !isRealTime && (
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                        )}
                        {isRealTime && (
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        )}
                        {!isRealTime && apiPrice && (
                          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                            marketStatus.isOpen ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
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
                        {formatPrice(currentPrice, name)}
                      </p>
                      <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                        {getPriceUnits(name)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-2xs sm:text-xs font-medium px-1.5 py-0.5 rounded ${
                        isRealTime 
                          ? 'bg-blue-100 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400' 
                          : isPremium 
                            ? 'bg-green-100 dark:bg-green-950/20 text-green-700 dark:text-green-400' 
                            : 'bg-muted/50 text-muted-foreground'
                      }`}>
                        {isRealTime ? 'Live' : isPremium ? 'Real-time' : '15min delayed'}
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
