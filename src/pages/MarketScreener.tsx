import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, Filter, Search, TrendingUp, TrendingDown, BarChart3, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAvailableCommodities } from '@/hooks/useCommodityData';
import { useAuth } from '@/contexts/AuthContext';

interface ScreenerFilters {
  category: string;
  priceRange: [number, number];
  changeRange: [number, number];
  volumeRange: [number, number];
  marketCap: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const MarketScreener = () => {
  const navigate = useNavigate();
  const { commodities } = useAvailableCommodities();
  const { profile } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ScreenerFilters>({
    category: 'all',
    priceRange: [0, 5000],
    changeRange: [-10, 10],
    volumeRange: [0, 100],
    marketCap: 'all',
    sortBy: 'change',
    sortOrder: 'desc'
  });

  // Enhanced commodity data with mock additional fields
  const enhancedCommodities = useMemo(() => {
    return commodities.map(commodity => ({
      ...commodity,
      volume: Math.floor(Math.random() * 100) + 'M',
      marketCap: Math.floor(Math.random() * 1000) + 'B',
      weekHigh: commodity.price * (1 + Math.random() * 0.2),
      weekLow: commodity.price * (1 - Math.random() * 0.2),
      volatility: Math.floor(Math.random() * 50) + 10,
      beta: (Math.random() * 2).toFixed(2),
      dividend: Math.random() > 0.5 ? (Math.random() * 5).toFixed(2) + '%' : 'N/A'
    }));
  }, [commodities]);

  const filteredCommodities = useMemo(() => {
    let result = enhancedCommodities;

    // Search filter
    if (searchTerm) {
      result = result.filter(commodity => 
        commodity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        commodity.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      result = result.filter(commodity => commodity.category === filters.category);
    }

    // Price range filter
    result = result.filter(commodity => 
      commodity.price >= filters.priceRange[0] && 
      commodity.price <= filters.priceRange[1]
    );

    // Change range filter
    result = result.filter(commodity => 
      commodity.changePercent >= filters.changeRange[0] && 
      commodity.changePercent <= filters.changeRange[1]
    );

    // Sort
    result = result.sort((a, b) => {
      let valueA: number, valueB: number;
      
      switch (filters.sortBy) {
        case 'name':
          return filters.sortOrder === 'asc' 
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        case 'price':
          valueA = a.price;
          valueB = b.price;
          break;
        case 'change':
          valueA = a.changePercent;
          valueB = b.changePercent;
          break;
        case 'volume':
          valueA = parseFloat(a.volume);
          valueB = parseFloat(b.volume);
          break;
        default:
          valueA = a.changePercent;
          valueB = b.changePercent;
      }

      return filters.sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
    });

    return result;
  }, [enhancedCommodities, searchTerm, filters]);

  const resetFilters = () => {
    setFilters({
      category: 'all',
      priceRange: [0, 5000],
      changeRange: [-10, 10],
      volumeRange: [0, 100],
      marketCap: 'all',
      sortBy: 'change',
      sortOrder: 'desc'
    });
    setSearchTerm('');
  };

  const categories = ['all', ...Array.from(new Set(commodities.map(c => c.category)))];

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Filter className="w-8 h-8 text-primary" />
            Market Screener
          </h1>
          <p className="text-muted-foreground mt-2">
            Filter and analyze commodities by performance, volume, and other key metrics
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Filters</CardTitle>
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search */}
              <div>
                <label className="text-sm font-medium mb-2 block">Search</label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search commodities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
                </label>
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) => setFilters({...filters, priceRange: value as [number, number]})}
                  max={5000}
                  min={0}
                  step={50}
                  className="w-full"
                />
              </div>

              {/* Change Range */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Change Range: {filters.changeRange[0]}% - {filters.changeRange[1]}%
                </label>
                <Slider
                  value={filters.changeRange}
                  onValueChange={(value) => setFilters({...filters, changeRange: value as [number, number]})}
                  max={10}
                  min={-10}
                  step={0.5}
                  className="w-full"
                />
              </div>

              {/* Sort Options */}
              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <Select value={filters.sortBy} onValueChange={(value) => setFilters({...filters, sortBy: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="change">Change %</SelectItem>
                    <SelectItem value="volume">Volume</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="text-sm font-medium mb-2 block">Sort Order</label>
                <Select value={filters.sortOrder} onValueChange={(value) => setFilters({...filters, sortOrder: value as 'asc' | 'desc'})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Descending</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Screening Results</CardTitle>
                  <CardDescription>
                    {filteredCommodities.length} commodities match your criteria
                  </CardDescription>
                </div>
                <Badge variant="secondary">
                  {filteredCommodities.length} / {commodities.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {filteredCommodities.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold">Name</th>
                        <th className="text-right p-3 font-semibold">Price</th>
                        <th className="text-right p-3 font-semibold">Change</th>
                        <th className="text-right p-3 font-semibold">Volume</th>
                        <th className="text-right p-3 font-semibold">52W High</th>
                        <th className="text-right p-3 font-semibold">52W Low</th>
                        <th className="text-right p-3 font-semibold">Volatility</th>
                        <th className="text-center p-3 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCommodities.map((commodity, index) => (
                        <tr key={commodity.symbol} className="border-b hover:bg-muted/50">
                          <td className="p-3">
                            <div>
                              <p className="font-semibold">{commodity.name}</p>
                              <p className="text-sm text-muted-foreground">{commodity.symbol}</p>
                            </div>
                          </td>
                          <td className="p-3 text-right font-bold">
                            ${commodity.price.toFixed(2)}
                          </td>
                          <td className="p-3 text-right">
                            <div className={`flex items-center justify-end gap-1 ${
                              commodity.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {commodity.changePercent >= 0 ? 
                                <TrendingUp className="w-4 h-4" /> : 
                                <TrendingDown className="w-4 h-4" />
                              }
                              <span className="font-bold">
                                {commodity.changePercent.toFixed(2)}%
                              </span>
                            </div>
                          </td>
                          <td className="p-3 text-right font-medium">{commodity.volume}</td>
                          <td className="p-3 text-right">${commodity.weekHigh.toFixed(2)}</td>
                          <td className="p-3 text-right">${commodity.weekLow.toFixed(2)}</td>
                          <td className="p-3 text-right">{commodity.volatility}%</td>
                          <td className="p-3 text-center">
                            <Button variant="ghost" size="sm">
                              <BarChart3 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No Results Found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your filters to see more commodities
                  </p>
                  <Button onClick={resetFilters}>Reset Filters</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {!profile?.subscription_active && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Upgrade for Advanced Screening</h3>
                <p className="text-muted-foreground">Get access to 50+ technical indicators, custom alerts, and export features.</p>
              </div>
              <Button className="ml-4">
                Upgrade Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MarketScreener;