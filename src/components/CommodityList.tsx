import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Commodity {
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  group: string;
  contractSymbol?: string;
}

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

interface CommodityListProps {
  commodities: Commodity[];
  onAddCommodity: (commodity: Commodity, contractSymbol?: string) => void;
  showContracts: Record<string, boolean>;
  onToggleContracts: (commodityName: string) => void;
  isPremium: boolean;
  isMobile: boolean;
}

// Hook for IBKR contracts
const useIBKRContracts = (commodityName: string, enabled: boolean) => {
  return useQuery({
    queryKey: ['ibkr-contracts', commodityName],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-ibkr-futures', {
        body: { commodity: commodityName }
      });
      
      if (error) throw new Error(error.message);
      return data.contracts as FuturesContract[];
    },
    enabled: !!commodityName && enabled,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};

export const CommodityList: React.FC<CommodityListProps> = ({
  commodities,
  onAddCommodity,
  showContracts,
  onToggleContracts,
  isPremium,
  isMobile
}) => {
  const getPriceChangeIcon = (change: number) => {
    if (change > 0) return <span className="text-green-600">↑</span>;
    if (change < 0) return <span className="text-red-600">↓</span>;
    return <span className="text-gray-500">-</span>;
  };

  return (
    <>
      {commodities.map((commodity) => {
        const contractsQuery = useIBKRContracts(commodity.name, showContracts[commodity.name] && isPremium);
        const hasContracts = contractsQuery.data && contractsQuery.data.length > 0;
        const showingContracts = showContracts[commodity.name];
        
        return (
          <div key={commodity.symbol} className="space-y-2">
            {/* Base Commodity */}
            <div className={`flex items-center justify-between ${isMobile ? 'p-3' : 'p-2'} border rounded hover:bg-muted/50`}>
              <div className="flex-1 min-w-0">
                <div className={`font-medium ${isMobile ? 'text-sm' : 'text-sm'} truncate`}>{commodity.name}</div>
                <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground`}>
                  {commodity.symbol} - ${commodity.price.toFixed(2)}
                </div>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <div className={`flex items-center ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  {getPriceChangeIcon(commodity.change)}
                  <span className={commodity.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {commodity.changePercent.toFixed(2)}%
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => onAddCommodity(commodity)}
                    className={`${isMobile ? 'h-8 w-8 touch-target mobile-button' : 'h-8 w-8'} p-0`}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  {isPremium && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onToggleContracts(commodity.name)}
                      className={`${isMobile ? 'h-8 w-8 touch-target mobile-button' : 'h-8 w-8'} p-0`}
                    >
                      {showingContracts ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Futures Contracts (Premium Only) */}
            {isPremium && showingContracts && (
              <div className="ml-4 space-y-1">
                {contractsQuery.isLoading ? (
                  <div className="text-xs text-muted-foreground p-2">Loading contracts...</div>
                ) : contractsQuery.error ? (
                  <div className="text-xs text-red-500 p-2">Failed to load contracts</div>
                ) : hasContracts ? (
                  contractsQuery.data?.map((contract) => (
                    <div
                      key={contract.symbol}
                      className={`flex items-center justify-between ${isMobile ? 'p-2' : 'p-1'} border border-dashed rounded text-xs`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{contract.name}</div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            <Calendar className="w-3 h-3 mr-1" />
                            {contract.symbol}
                          </Badge>
                          <span>${contract.price.toFixed(2)}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onAddCommodity(commodity, contract.symbol)}
                        className={`${isMobile ? 'h-7 w-7 touch-target mobile-button' : 'h-7 w-7'} p-0 ml-2`}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-muted-foreground p-2">No contracts available</div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};