import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
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
        <Card className="p-4 mb-4 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
              <p className="text-sm text-gray-500">{symbol}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold">${price.toFixed(2)}</p>
              <div className={`flex items-center justify-end ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                <span className="text-sm font-medium">{change.toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </Card>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <CommodityChart name={name} basePrice={price} />
        <CommodityNews commodity={name} />
      </CollapsibleContent>
    </Collapsible>
  );
};

export default CommodityCard;
