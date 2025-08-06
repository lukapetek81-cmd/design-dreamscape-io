import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, GripVertical, Star, Trash2, Edit, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAvailableCommodities } from '@/hooks/useCommodityData';
import { useAuth } from '@/contexts/AuthContext';

interface Watchlist {
  id: string;
  name: string;
  description: string;
  commodities: string[];
  color: string;
  isDefault?: boolean;
}

interface WatchlistItem {
  id: string;
  commodityName: string;
  symbol: string;
  price: number;
  change: number;
  volume?: string;
}

const Watchlists = () => {
  const navigate = useNavigate();
  const { data: commodities } = useAvailableCommodities();
  const { profile } = useAuth();
  const [selectedWatchlist, setSelectedWatchlist] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [newWatchlistDescription, setNewWatchlistDescription] = useState('');
  const [newWatchlistColor, setNewWatchlistColor] = useState('blue');

  // Mock watchlists data
  const [watchlists, setWatchlists] = useState<Watchlist[]>([
    {
      id: '1',
      name: 'Energy Focus',
      description: 'Key energy commodities for trading',
      commodities: ['Crude Oil', 'Natural Gas', 'Gasoline RBOB'],
      color: 'orange',
      isDefault: true
    },
    {
      id: '2',
      name: 'Precious Metals',
      description: 'Safe haven assets and precious metals',
      commodities: ['Gold Futures', 'Silver Futures', 'Platinum'],
      color: 'yellow'
    },
    {
      id: '3',
      name: 'Agricultural Basics',
      description: 'Core agricultural commodities',
      commodities: ['Corn Futures', 'Wheat Futures', 'Soybean Futures'],
      color: 'green'
    }
  ]);

  const colorOptions = [
    { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
    { value: 'green', label: 'Green', class: 'bg-green-500' },
    { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
    { value: 'red', label: 'Red', class: 'bg-red-500' },
    { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
    { value: 'yellow', label: 'Yellow', class: 'bg-yellow-500' }
  ];

  const getWatchlistItems = (watchlist: Watchlist): WatchlistItem[] => {
    return watchlist.commodities.map(commodityName => {
      const commodity = commodities.find(c => c.name === commodityName);
      return {
        id: commodityName,
        commodityName,
        symbol: commodity?.symbol || 'N/A',
        price: commodity?.price || 0,
        change: commodity?.changePercent || 0,
        volume: '1.2M' // Mock volume data
      };
    });
  };

  const createWatchlist = () => {
    if (!newWatchlistName.trim()) return;
    
    const newWatchlist: Watchlist = {
      id: Date.now().toString(),
      name: newWatchlistName,
      description: newWatchlistDescription,
      commodities: [],
      color: newWatchlistColor
    };

    setWatchlists([...watchlists, newWatchlist]);
    setNewWatchlistName('');
    setNewWatchlistDescription('');
    setNewWatchlistColor('blue');
    setIsCreateDialogOpen(false);
  };

  const deleteWatchlist = (id: string) => {
    setWatchlists(watchlists.filter(w => w.id !== id));
    if (selectedWatchlist === id) {
      setSelectedWatchlist(null);
    }
  };

  const getColorClass = (color: string) => {
    const colorMap: { [key: string]: string } = {
      blue: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20',
      green: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20',
      orange: 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20',
      red: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20',
      purple: 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/20',
      yellow: 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20'
    };
    return colorMap[color] || colorMap.blue;
  };

  const selectedWatchlistData = watchlists.find(w => w.id === selectedWatchlist);

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              console.log('Back button clicked - navigating to dashboard');
              navigate('/');
            }}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Star className="w-8 h-8 text-primary" />
              Watchlists
            </h1>
            <p className="text-muted-foreground mt-2">
              Create and manage custom commodity watchlists with drag-and-drop sorting
            </p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Watchlist
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Watchlist</DialogTitle>
                <DialogDescription>
                  Create a custom watchlist to track your favorite commodities
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    placeholder="Enter watchlist name"
                    value={newWatchlistName}
                    onChange={(e) => setNewWatchlistName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    placeholder="Enter description (optional)"
                    value={newWatchlistDescription}
                    onChange={(e) => setNewWatchlistDescription(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Color</label>
                  <Select value={newWatchlistColor} onValueChange={setNewWatchlistColor}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map(color => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full ${color.class}`}></div>
                            {color.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createWatchlist}>Create Watchlist</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Watchlists Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">My Watchlists</CardTitle>
              <CardDescription>Select a watchlist to view and edit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {watchlists.map(watchlist => (
                <div
                  key={watchlist.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                    selectedWatchlist === watchlist.id 
                      ? getColorClass(watchlist.color) + ' ring-2 ring-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedWatchlist(watchlist.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full bg-${watchlist.color}-500`}></div>
                      <div>
                        <h4 className="font-semibold text-sm">
                          {watchlist.name}
                          {watchlist.isDefault && (
                            <Badge variant="secondary" className="ml-2 text-xs">Default</Badge>
                          )}
                        </h4>
                        <p className="text-xs text-muted-foreground">{watchlist.commodities.length} items</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Edit functionality
                        }}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      {!watchlist.isDefault && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-8 h-8 p-0 text-red-500 hover:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteWatchlist(watchlist.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {watchlist.description && (
                    <p className="text-xs text-muted-foreground mt-2">{watchlist.description}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Watchlist Content */}
        <div className="lg:col-span-2">
          {selectedWatchlistData ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full bg-${selectedWatchlistData.color}-500`}></div>
                      {selectedWatchlistData.name}
                    </CardTitle>
                    <CardDescription>{selectedWatchlistData.description}</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Commodity
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {getWatchlistItems(selectedWatchlistData).length > 0 ? (
                  <div className="space-y-3">
                    {getWatchlistItems(selectedWatchlistData).map((item, index) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="font-semibold text-sm">{item.commodityName}</p>
                            <p className="text-xs text-muted-foreground">{item.symbol}</p>
                          </div>
                          <div>
                            <p className="font-bold">${item.price.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">Price</p>
                          </div>
                          <div>
                            <p className={`font-bold ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                            </p>
                            <p className="text-xs text-muted-foreground">Change</p>
                          </div>
                          <div>
                            <p className="font-medium">{item.volume}</p>
                            <p className="text-xs text-muted-foreground">Volume</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">Empty Watchlist</h3>
                    <p className="text-muted-foreground mb-4">Add commodities to start tracking their performance</p>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Commodity
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Select a Watchlist</h3>
                <p className="text-muted-foreground">Choose a watchlist from the sidebar to view and manage your tracked commodities</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {!profile?.subscription_active && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Upgrade for Premium Watchlists</h3>
                <p className="text-muted-foreground">Get unlimited watchlists, advanced sorting, and real-time alerts.</p>
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

export default Watchlists;