
import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp, DollarSign, Activity } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import CommodityChart from './CommodityChart';
import CommodityNews from './CommodityNews';

interface CommodityCardProps {
  name: string;
  price: number;
  change: number;
  symbol: string;
}

const CommodityCard = ({ name, price, change, symbol }: CommodityCardProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const isPositive = change >= 0;

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
                      <span className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 text-2xs sm:text-xs font-bold bg-muted/60 rounded-full text-muted-foreground uppercase tracking-wider">
                        {symbol}
                      </span>
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
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Current Price</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground number-display transition-colors group-hover:text-primary">
                      ${price.toFixed(2)}
                    </p>
                  </div>
                  
                  <div className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-soft transition-all duration-300 w-fit ${
                    isPositive 
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200 dark:from-green-950/20 dark:to-emerald-950/20 dark:text-green-400 dark:border-green-800' 
                      : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-200 dark:from-red-950/20 dark:to-rose-950/20 dark:text-red-400 dark:border-red-800'
                  } ${isHovered ? 'scale-105' : ''}`}>
                    {isPositive ? <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" /> : <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />}
                    <span className="number-display">{Math.abs(change).toFixed(2)}%</span>
                  </div>
                </div>
              </div>
              
              {/* Stats Section - Hidden on Mobile, Responsive on Desktop */}
              <div className="hidden sm:flex sm:items-center sm:gap-4 lg:gap-6">
                <div className="text-right space-y-2 lg:space-y-3">
                  <div className="space-y-1">
                    <p className="text-2xs lg:text-xs font-semibold text-muted-foreground uppercase tracking-wider">24h Volume</p>
                    <p className="text-sm lg:text-lg font-bold number-display">$2.4M</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xs lg:text-xs font-semibold text-muted-foreground uppercase tracking-wider">Market Cap</p>
                    <p className="text-xs lg:text-sm font-semibold text-muted-foreground number-display">$45.2B</p>
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
                  <p className="text-2xs font-semibold text-muted-foreground uppercase tracking-wider">Volume</p>
                  <p className="text-sm font-bold number-display">$2.4M</p>
                </div>
                <div className="text-center">
                  <p className="text-2xs font-semibold text-muted-foreground uppercase tracking-wider">Market Cap</p>
                  <p className="text-sm font-bold number-display">$45.2B</p>
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
          <CommodityChart name={name} basePrice={price} />
          <CommodityNews commodity={name} />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default CommodityCard;
