import React from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp, DollarSign, Activity, BarChart3, Calendar } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { formatPrice } from '@/lib/commodityUtils';
import CommodityChart from './CommodityChart';
import CommodityNews from './CommodityNews';
import { useCommodityPrice } from '@/hooks/useCommodityData';
import { useRealtimeDataContext } from '@/contexts/RealtimeDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { getMarketStatus } from '@/lib/marketHours';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TouchRipple } from '@/components/mobile/TouchRipple';
import { useHaptics } from '@/hooks/useHaptics';


interface FuturesContract {
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  category: string;
  contractSize: string;
  venue: string;
  supportedByFMP: boolean;
  expirationDate?: string;
  source?: string;
}

interface CommodityCardProps {
  name: string;
  price: number;
  change: number;
  symbol: string;
  venue: string;
  contractSize?: string;
}

const CommodityCard = React.memo(({ name, price: fallbackPrice, change: fallbackChange, symbol, venue, contractSize }: CommodityCardProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const [selectedContract, setSelectedContract] = React.useState<string>(symbol);
  const { vibrateTouch } = useHaptics();
  
  const { data: apiPrice, isLoading: priceLoading } = useCommodityPrice(name);
  const { profile } = useAuth();
  
  // Get market status for this commodity - memoized
  const marketStatus = React.useMemo(() => getMarketStatus(name), [name]);
  
  // Check if user has premium subscription for real-time data - memoized
  const isPremium = React.useMemo(() => 
    profile?.subscription_active && 
    (profile?.subscription_tier === 'premium' || profile?.subscription_tier === 'pro'),
    [profile?.subscription_active, profile?.subscription_tier]
  );

  // Fetch IBKR contracts exclusively - only for premium users with improved caching
  const { data: availableContracts, isLoading: contractsLoading } = useQuery({
    queryKey: ['ibkr-contracts', name],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-ibkr-futures', {
        body: { commodity: name }
      });
      
      if (error) throw new Error(error.message);
      
      // Add IBKR source to all contracts and sort by expiration date
      const contracts = (data.contracts as FuturesContract[]).map(contract => ({
        ...contract,
        source: 'IBKR'
      }));
      
      // Sort by expiration date (nearest first)
      return contracts.sort((a, b) => {
        if (!a.expirationDate || !b.expirationDate) return 0;
        return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
      });
    },
    staleTime: 1000 * 60 * 10, // Increased cache to 10 minutes for better performance
    gcTime: 1000 * 60 * 15, // Cache for 15 minutes in memory
    enabled: isPremium, // Only fetch contracts for premium users
  });
  
  // Use real-time data context
  const { getPriceForCommodity, isLiveData, connected: realtimeConnected } = useRealtimeDataContext();
  
  // Don't auto-select IBKR contracts - keep the default symbol that free users see
  // Premium users will have the option to manually select IBKR contracts from the dropdown

  // Get the selected contract data (only for premium users, and only if an IBKR contract is selected) - memoized
  const selectedContractData = React.useMemo(() => 
    isPremium && availableContracts ? availableContracts.find(c => c.symbol === selectedContract) : null,
    [isPremium, availableContracts, selectedContract]
  );
  
  // Use real-time data context
  const realtimePrice = getPriceForCommodity(name);
  
  // For premium users: Use price from selected contract, real-time context, or fall back to API price
  // For free users: Use real-time context or fall back to API price (no contract data) - memoized
  const currentPrice = React.useMemo(() => 
    selectedContractData?.price ?? realtimePrice?.price ?? apiPrice?.price ?? fallbackPrice,
    [selectedContractData?.price, realtimePrice?.price, apiPrice?.price, fallbackPrice]
  );
  
  const currentChange = React.useMemo(() =>
    selectedContractData?.changePercent ?? realtimePrice?.changePercent ?? fallbackChange,
    [selectedContractData?.changePercent, realtimePrice?.changePercent, fallbackChange]
  );
  
  const isPositive = currentChange >= 0;
  const isRealTime = isPremium && isLiveData(name);
  const isAPILive = isPremium && realtimeConnected;

  // Function to get the appropriate price units based on commodity name - memoized
  const getPriceUnits = React.useCallback((commodityName: string) => {
    const name = commodityName.toLowerCase();
    
    // Energy commodities
    if (name.includes('crude') || name.includes('oil')) return 'USD/bbl';
    if (name.includes('natural gas')) return 'USD/MMBtu';
    if (name.includes('gasoline') || name.includes('heating oil')) return 'USD/gal';
    
    // Metals
    if (name.includes('gold') || name.includes('silver') || name.includes('platinum') || name.includes('palladium')) return 'USD/oz';
    if (name.includes('copper')) return 'USD/lb';
    
    // Grains and Agricultural (priced in cents)
    if (name.includes('corn') || name.includes('wheat') || name.includes('soybean') || name.includes('oat')) return 'cents/bu';
    if (name.includes('rice')) return 'USD/cwt';
    if (name.includes('soybean meal')) return 'USD/ton';
    if (name.includes('soybean oil')) return 'cents/lb';
    
    // Livestock (priced in cents)
    if (name.includes('cattle')) return 'cents/lb';
    if (name.includes('hogs')) return 'cents/lb';
    
    // Softs (priced in cents)
    if (name.includes('cocoa')) return 'USD/MT';
    if (name.includes('coffee')) return 'cents/lb';
    if (name.includes('cotton')) return 'cents/lb';
    if (name.includes('lumber')) return 'USD/1000ft';
    if (name.includes('orange juice')) return 'cents/lb';
    if (name.includes('sugar')) return 'cents/lb';
    
    // Default fallback
    return 'USD';
  }, []);

  // Format expiration date - memoized
  const formatExpirationDate = React.useCallback((contract: FuturesContract) => {
    if (!contract.expirationDate) return 'N/A';
    return new Date(contract.expirationDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }, []);

  // Generate mock expiration dates for contracts (in a real app, this would come from the API) - memoized
  const getExpirationDate = React.useCallback((contractSymbol: string) => {
    // Extract month/year from symbol or generate based on current date
    const now = new Date();
    const months = ['F', 'G', 'H', 'J', 'K', 'M', 'N', 'Q', 'U', 'V', 'X', 'Z'];
    const monthIndex = months.indexOf(contractSymbol.slice(-2, -1));
    const year = parseInt(contractSymbol.slice(-1)) + 2020; // Assuming 2025+ contracts
    
    if (monthIndex !== -1 && year) {
      return new Date(year, monthIndex, 15); // 15th of the month
    }
    
    // Fallback: add 1-6 months to current date
    const futureMonths = Math.floor(Math.random() * 6) + 1;
    return new Date(now.getFullYear(), now.getMonth() + futureMonths, 15);
  }, []);

  // Enhanced touch handlers with haptic feedback - removed problematic hover handlers
  const handleContractChange = React.useCallback((value: string) => setSelectedContract(value), []);
  
  const handleToggle = React.useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    vibrateTouch();
    setIsOpen(!isOpen);
  }, [vibrateTouch, isOpen]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger 
        className="w-full touch-manipulation focus-ring"
        onClick={handleToggle}
        aria-label={`${isOpen ? 'Collapse' : 'Expand'} details for ${name} commodity`}
        aria-expanded={isOpen}
      >
        <TouchRipple className="w-full">
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
                <div className="flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1">
                      <div className={`p-1.5 sm:p-2 rounded-lg bg-primary/10 text-primary transition-all duration-300 ${
                        isHovered ? 'bg-primary/20 scale-110' : ''
                      }`}>
                        <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-foreground transition-colors tracking-tight truncate group-hover:text-primary">
                          {name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 text-2xs sm:text-xs font-bold bg-muted/60 rounded-full text-muted-foreground uppercase tracking-wider">
                            {selectedContract}
                          </span>
                          <span className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 text-2xs sm:text-xs font-medium bg-primary/10 text-primary rounded-full uppercase tracking-wider">
                            {selectedContractData?.venue || venue}
                          </span>
                          {(selectedContractData?.contractSize || contractSize) && (
                            <span className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 text-2xs sm:text-xs font-medium bg-secondary/10 text-secondary-foreground rounded-full tracking-wider">
                              {selectedContractData?.contractSize || contractSize}
                            </span>
                          )}
                          {isPremium && selectedContractData && (
                            <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 text-2xs sm:text-xs font-medium bg-amber-100 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 rounded-full tracking-wider">
                              <Calendar className="w-3 h-3" />
                              {formatExpirationDate({ ...selectedContractData, expirationDate: getExpirationDate(selectedContract).toISOString() })}
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
                  
                  {/* Contract Selector - Show for premium users with available contracts */}
                  {isPremium && availableContracts && availableContracts.length > 0 && (
                    <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                      <Select value={selectedContract} onValueChange={handleContractChange}>
                        <SelectTrigger 
                          className="w-full sm:w-[280px] h-8 text-xs focus-ring bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background"
                          aria-label="Select futures contract"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <SelectValue placeholder="Select Contract" />
                        </SelectTrigger>
                        <SelectContent className="z-50 bg-background border-border shadow-lg"
                          onClick={(e) => e.stopPropagation()}>
                          {/* Default contract (same as free users see) */}
                          <SelectItem value={symbol}>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{symbol}</span>
                                <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-950/20 text-gray-700 dark:text-gray-400">
                                  Default
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                Standard commodity data
                              </span>
                            </div>
                          </SelectItem>
                          {/* IBKR Futures Contracts */}
                          {availableContracts.map((contract) => (
                            <SelectItem key={contract.symbol} value={contract.symbol}>
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{contract.symbol}</span>
                                  <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400">
                                    Futures
                                  </span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  ${formatPrice(contract.price, contract.name)} • Vol: {contract.volume.toLocaleString()}
                                  {contract.expirationDate && ` • Exp: ${new Date(contract.expirationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

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
                      <span className={`text-2xs sm:text-xs font-medium px-1.5 py-0.5 rounded ${
                        isAPILive 
                          ? 'bg-purple-100 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400' 
                          : isRealTime 
                            ? 'bg-blue-100 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400' 
                          : isPremium 
                            ? 'bg-green-100 dark:bg-green-950/20 text-green-700 dark:text-green-400' 
                            : 'bg-muted/50 text-muted-foreground'
                        }`}>
                        {isAPILive ? 'API Live' : isRealTime ? 'Live' : isPremium ? 'Real-time' : 'Market Data'}
                      </span>
                    </div>
                  </div>
                </div>
                  
                  <div className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-soft transition-all duration-300 w-fit ${
                    isPositive 
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200 dark:from-green-950/20 dark:to-emerald-950/20 dark:text-green-400 dark:border-green-800' 
                      : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-200 dark:from-red-950/20 dark:to-rose-950/20 dark:text-red-400 dark:border-red-800'
                  } ${isOpen ? 'scale-105' : ''}`}>
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
                  isOpen ? 'bg-primary/20 text-primary' : 'bg-muted/50 text-muted-foreground'
                }`}>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Stats Section - Visible only when expanded on mobile */}
            {isOpen && (
              <div className="mt-4 sm:hidden border-t border-border/50 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Price Units</p>
                    <p className="text-xs font-semibold text-muted-foreground number-display">{getPriceUnits(name)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Market Status</p>
                    <div className="flex items-center justify-center gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        marketStatus.isOpen ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <span className="text-xs font-semibold text-muted-foreground">
                        {marketStatus.isOpen ? 'Open' : 'Closed'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          </Card>
        </TouchRipple>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="overflow-hidden">
        <div className="mt-3 sm:mt-4 space-y-4 sm:space-y-6 animate-accordion-down">
          <CommodityChart 
            name={name} 
            basePrice={currentPrice} 
            selectedContract={selectedContract}
            contractData={selectedContractData}
          />
          <CommodityNews commodity={name} />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
});

CommodityCard.displayName = 'CommodityCard';

export default CommodityCard;
