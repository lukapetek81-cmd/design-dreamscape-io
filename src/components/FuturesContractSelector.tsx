import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, TrendingUp, TrendingDown, Volume2, Building2, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

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
}

interface FuturesContractSelectorProps {
  onContractSelect?: (contract: FuturesContract) => void;
  selectedContracts?: string[];
  multiSelect?: boolean;
}

export const FuturesContractSelector = ({ 
  onContractSelect, 
  selectedContracts = [], 
  multiSelect = false 
}: FuturesContractSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedVenue, setSelectedVenue] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('volume');

  const { data: contractsData, isLoading, error } = useQuery({
    queryKey: ['futures-contracts'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-commodity-symbols', {
        body: { dataDelay: 'realtime' }
      });
      
      if (error) throw new Error(error.message);
      return data.commodities as FuturesContract[];
    }
  });

  const categories = useMemo(() => {
    if (!contractsData) return [];
    const uniqueCategories = [...new Set(contractsData.map(c => c.category))];
    return uniqueCategories.sort();
  }, [contractsData]);

  const venues = useMemo(() => {
    if (!contractsData) return [];
    const uniqueVenues = [...new Set(contractsData.map(c => c.venue))];
    return uniqueVenues.sort();
  }, [contractsData]);

  const filteredAndSortedContracts = useMemo(() => {
    if (!contractsData) return [];

    let filtered = contractsData.filter(contract => {
      const matchesSearch = contract.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           contract.symbol.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || contract.category === selectedCategory;
      const matchesVenue = selectedVenue === 'all' || contract.venue === selectedVenue;
      
      return matchesSearch && matchesCategory && matchesVenue;
    });

    // Sort contracts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'volume':
          return b.volume - a.volume;
        case 'price':
          return b.price - a.price;
        case 'change':
          return b.changePercent - a.changePercent;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [contractsData, searchTerm, selectedCategory, selectedVenue, sortBy]);

  const groupedContracts = useMemo(() => {
    const grouped: Record<string, FuturesContract[]> = {};
    filteredAndSortedContracts.forEach(contract => {
      if (!grouped[contract.category]) {
        grouped[contract.category] = [];
      }
      grouped[contract.category].push(contract);
    });
    return grouped;
  }, [filteredAndSortedContracts]);

  const handleContractSelect = (contract: FuturesContract) => {
    onContractSelect?.(contract);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(price);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`;
    return volume.toString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Futures Contracts...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Contracts</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Failed to load futures contracts. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Futures Contract Selector</CardTitle>
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search contracts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedVenue} onValueChange={setSelectedVenue}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Venue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Venues</SelectItem>
                {venues.map(venue => (
                  <SelectItem key={venue} value={venue}>
                    {venue}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="volume">Volume</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="change">Change %</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="grouped" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="grouped">By Category</TabsTrigger>
          <TabsTrigger value="list">All Contracts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="grouped" className="space-y-4">
          {Object.entries(groupedContracts).map(([category, contracts]) => (
            <Card key={category}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg capitalize flex items-center gap-2">
                  {category}
                  <Badge variant="secondary">{contracts.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {contracts.map(contract => (
                    <ContractCard
                      key={contract.symbol}
                      contract={contract}
                      isSelected={selectedContracts.includes(contract.symbol)}
                      onSelect={() => handleContractSelect(contract)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="list" className="space-y-4">
          <div className="grid gap-3">
            {filteredAndSortedContracts.map(contract => (
              <ContractCard
                key={contract.symbol}
                contract={contract}
                isSelected={selectedContracts.includes(contract.symbol)}
                onSelect={() => handleContractSelect(contract)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface ContractCardProps {
  contract: FuturesContract;
  isSelected: boolean;
  onSelect: () => void;
}

const ContractCard = ({ contract, isSelected, onSelect }: ContractCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(price);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`;
    return volume.toString();
  };

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-sm">{contract.name}</h3>
              <Badge variant="outline" className="text-xs">{contract.symbol}</Badge>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                <span>{contract.venue}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{contract.contractSize}</span>
              </div>
              <div className="flex items-center gap-1">
                <Volume2 className="h-3 w-3" />
                <span>{formatVolume(contract.volume)}</span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="font-semibold">${formatPrice(contract.price)}</div>
            <div className={`flex items-center gap-1 text-sm ${
              contract.change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {contract.change >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{contract.changePercent.toFixed(2)}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};