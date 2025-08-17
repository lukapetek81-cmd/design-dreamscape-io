import React from 'react';
import { Card, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, TrendingUp, TrendingDown, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { TouchRipple } from './mobile/TouchRipple';

import { useIsMobile } from '@/hooks/use-mobile';
import { useHaptics } from '@/hooks/useHaptics';
import { useAuth } from '@/contexts/AuthContext';
import { usePremiumGating } from '@/hooks/usePremiumGating';
import { getMarketStatus } from '@/lib/marketHours';
import LazyChart from './LazyChart';
import LazyNews from './LazyNews';

interface CommodityCardProps {
  name: string;
  symbol: string;
  price: number | null;
  change: number;
  changePercent: number;
  volume?: string;
  lastUpdate?: string;
  venue?: string;
  contractSize?: string;
  category?: string;
  availableContracts?: Array<{
    name: string;
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    volume?: number;
    expirationDate: string;
    contractSize?: string;
    venue?: string;
  }>;
}

const CommodityCard = React.memo<CommodityCardProps>(({ 
  name, 
  symbol, 
  price, 
  change, 
  changePercent, 
  volume, 
  lastUpdate, 
  venue = 'NYMEX',
  contractSize,
  category,
  availableContracts
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedContract, setSelectedContract] = React.useState(symbol);
  const isMobile = useIsMobile();
  const { vibrateTouch } = useHaptics();
  const { profile } = useAuth();
  const { isPremium } = usePremiumGating();
  const marketStatus = getMarketStatus(name);

  // Get current price data for selected contract
  const selectedContractData = React.useMemo(() => {
    if (!availableContracts) return null;
    return availableContracts.find(contract => contract.symbol === selectedContract) || null;
  }, [availableContracts, selectedContract]);

  // Price display logic
  const displayPrice = React.useMemo(() => {
    if (selectedContractData) {
      return selectedContractData.price;
    }
    return price;
  }, [selectedContractData, price]);

  const currentChange = React.useMemo(() => {
    if (selectedContractData) {
      return selectedContractData.changePercent;
    }
    return changePercent;
  }, [selectedContractData, changePercent]);

  const isPositive = currentChange >= 0;

  // Format price for display
  const formatPrice = React.useCallback((priceValue: number): string => {
    if (priceValue >= 1000) {
      return priceValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return priceValue.toFixed(2);
  }, []);

  // Get price units helper
  const getPriceUnits = React.useCallback((commodityName: string): string => {
    if (commodityName.toLowerCase().includes('oil') || commodityName.toLowerCase().includes('gasoline')) {
      return '$/barrel';
    }
    if (commodityName.toLowerCase().includes('gas')) {
      return '$/MMBtu';
    }
    if (commodityName.toLowerCase().includes('gold') || commodityName.toLowerCase().includes('silver')) {
      return '$/oz';
    }
    if (commodityName.toLowerCase().includes('corn') || commodityName.toLowerCase().includes('wheat')) {
      return '¢/bushel';
    }
    return '$/unit';
  }, []);

  // Contract change handler
  const handleContractChange = React.useCallback((value: string) => {
    setSelectedContract(value);
  }, []);

  // Toggle handler
  const handleToggle = React.useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    vibrateTouch();
    setIsOpen(!isOpen);
  }, [vibrateTouch, isOpen]);

  // Generate expiration date helper
  const getExpirationDate = React.useCallback((contractSymbol: string): Date => {
    const now = new Date();
    const futureMonths = Math.floor(Math.random() * 12) + 1;
    return new Date(now.getFullYear(), now.getMonth() + futureMonths, 15);
  }, []);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="w-full">
        <Card className="group relative overflow-hidden card-hover-effect border-0 bg-gradient-to-r from-card via-card to-card/80 backdrop-blur-sm shadow-soft transition-all duration-200 rounded-2xl">
          {/* Enhanced Background Pattern */}
          <div className={`absolute inset-0 bg-gradient-to-r from-primary/3 via-accent/2 to-transparent transition-all duration-500 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`} />
          <div className={`absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-2xl sm:blur-3xl transition-opacity duration-700 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`} />
          
          <CardHeader className="relative p-3 sm:p-4 md:p-6 lg:p-8">
            {/* Header with click handler */}
            <div 
              className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between cursor-pointer touch-manipulation focus-ring"
              onClick={handleToggle}
              role="button"
              tabIndex={0}
              aria-label={`${isOpen ? 'Collapse' : 'Expand'} details for ${name} commodity`}
            >
              {/* Main Content */}
              <div className="flex-1 space-y-3 sm:space-y-4">
                {/* Title and badges */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 text-primary transition-all duration-300">
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
                            {selectedContractData.expirationDate ? new Date(selectedContractData.expirationDate).toLocaleDateString() : 'N/A'}
                          </span>
                        )}
                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                          marketStatus.isOpen ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
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
                
                {/* Price Section */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground number-display tracking-tight">
                      {displayPrice !== null ? (
                        typeof displayPrice === 'string' 
                          ? displayPrice 
                          : `$${formatPrice(displayPrice)}`
                      ) : (
                        <span className="text-muted-foreground text-lg">Loading...</span>
                      )}
                    </span>
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
              
              {/* Desktop Stats Section */}
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

            {/* Contract Selector - Outside click handler */}
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
                  <SelectContent className="z-50 bg-background border-border shadow-lg">
                    {/* Default contract */}
                    <SelectItem value={symbol}>
                      <div className="flex flex-col">
                        <span className="font-medium">{name}</span>
                        <span className="text-xs text-muted-foreground">{symbol} • Main Contract</span>
                      </div>
                    </SelectItem>
                    {availableContracts.map((contract) => (
                      <SelectItem key={contract.symbol} value={contract.symbol}>
                        <div className="flex flex-col">
                          <span className="font-medium">{contract.name}</span>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{contract.symbol}</span>
                            <span>{contract.expirationDate ? new Date(contract.expirationDate).toLocaleDateString() : 'N/A'}</span>
                            {contract.volume && (
                              <>
                                <span>•</span>
                                <span>Vol: {contract.volume.toLocaleString()}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

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
          </CardHeader>
        </Card>
      </div>
      
      <CollapsibleContent className="overflow-hidden">
        <div className="mt-3 sm:mt-4 space-y-4 sm:space-y-6 animate-accordion-down">
          <LazyChart 
            name={name} 
            basePrice={displayPrice || 0} 
            selectedContract={selectedContract}
            contractData={selectedContractData ? { 
              ...selectedContractData, 
              category: 'futures', 
              supportedByFMP: true,
              volume: selectedContractData.volume || 0,
              contractSize: selectedContractData.contractSize || contractSize || 'N/A',
              venue: selectedContractData.venue || venue || 'NYMEX'
            } : undefined}
          />
          <LazyNews commodity={name} />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
});

CommodityCard.displayName = 'CommodityCard';

export default CommodityCard;