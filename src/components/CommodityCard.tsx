
import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';
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
        <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 border-0 bg-gradient-to-r from-card to-card/80 backdrop-blur-sm">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 text-left">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {name}
                  </h3>
                  <span className="px-2 py-1 text-xs font-medium bg-muted rounded-full text-muted-foreground">
                    {symbol}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-2xl font-bold text-foreground">${price.toFixed(2)}</p>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${
                    isPositive ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 
                    'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>{Math.abs(change).toFixed(2)}%</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">24h Volume</p>
                  <p className="text-sm font-medium">$2.4M</p>
                </div>
                <div className="flex items-center">
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
        <div className="mt-2 space-y-4 animate-accordion-down">
          <CommodityChart name={name} basePrice={price} />
          <CommodityNews commodity={name} />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default CommodityCard;
