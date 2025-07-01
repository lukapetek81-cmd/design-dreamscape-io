
import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp, DollarSign } from 'lucide-react';
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
  const isPositive = change >= 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full">
        <Card className="group relative overflow-hidden card-hover-effect border-0 bg-gradient-to-r from-card via-card to-card/80 backdrop-blur-sm shadow-soft">
          {/* Enhanced Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-accent/2 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <div className="relative p-8">
            <div className="flex items-center justify-between">
              <div className="flex-1 text-left space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors tracking-tight">
                        {name}
                      </h3>
                      <span className="px-3 py-1 text-xs font-bold bg-muted/60 rounded-full text-muted-foreground uppercase tracking-wider">
                        {symbol}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Current Price</p>
                    <p className="text-3xl font-bold text-foreground number-display group-hover:text-primary transition-colors">
                      ${price.toFixed(2)}
                    </p>
                  </div>
                  
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold shadow-soft transition-all duration-300 ${
                    isPositive 
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200 dark:from-green-950/20 dark:to-emerald-950/20 dark:text-green-400 dark:border-green-800' 
                      : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-200 dark:from-red-950/20 dark:to-rose-950/20 dark:text-red-400 dark:border-red-800'
                  }`}>
                    {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span className="number-display">{Math.abs(change).toFixed(2)}%</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right space-y-3">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">24h Volume</p>
                    <p className="text-lg font-bold number-display">$2.4M</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Market Cap</p>
                    <p className="text-sm font-semibold text-muted-foreground number-display">$45.2B</p>
                  </div>
                </div>
                
                <div className="flex items-center p-2 rounded-full bg-muted/50 group-hover:bg-primary/10 transition-colors">
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="overflow-hidden">
        <div className="mt-4 space-y-6 animate-accordion-down">
          <CommodityChart name={name} basePrice={price} />
          <CommodityNews commodity={name} />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default CommodityCard;
