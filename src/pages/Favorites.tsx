import React, { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import CommoditySidebar from "@/components/CommoditySidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Star, Search, Trash2, Plus, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Favorite {
  id: string;
  commodity_name: string;
  commodity_symbol: string;
  commodity_group: string;
  added_at: string;
}

const POPULAR_COMMODITIES = [
  { name: "Crude Oil", symbol: "CL", group: "energy" },
  { name: "Gold", symbol: "GC", group: "metals" },
  { name: "Silver", symbol: "SI", group: "metals" },
  { name: "Natural Gas", symbol: "NG", group: "energy" },
  { name: "Copper", symbol: "HG", group: "metals" },
  { name: "Wheat", symbol: "ZW", group: "grains" },
  { name: "Corn", symbol: "ZC", group: "grains" },
  { name: "Soybeans", symbol: "ZS", group: "grains" },
  { name: "Coffee", symbol: "KC", group: "softs" },
  { name: "Sugar", symbol: "SB", group: "softs" },
];

const Favorites = () => {
  const [activeGroup, setActiveGroup] = useState("energy");
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const commodityCounts = {
    energy: 0, metals: 0, grains: 0, livestock: 0, softs: 0, other: 0
  };

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });
      
      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load favorites",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (commodity: any) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add favorites",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: user.id,
          commodity_name: commodity.name,
          commodity_symbol: commodity.symbol,
          commodity_group: commodity.group
        });

      if (error) throw error;

      await fetchFavorites();
      toast({
        title: "Added to Favorites",
        description: `${commodity.name} has been added to your favorites`,
      });
    } catch (error: any) {
      if (error.code === '23505') {
        toast({
          title: "Already in Favorites",
          description: "This commodity is already in your favorites",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add to favorites",
          variant: "destructive",
        });
      }
    }
  };

  const removeFromFavorites = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;

      setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
      toast({
        title: "Removed from Favorites",
        description: "Commodity has been removed from your favorites",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove from favorites",
        variant: "destructive",
      });
    }
  };

  const filteredFavorites = favorites.filter(favorite =>
    favorite.commodity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    favorite.commodity_symbol?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getGroupColor = (group: string) => {
    const colors: Record<string, string> = {
      energy: 'bg-orange-100 text-orange-800 border-orange-200',
      metals: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      grains: 'bg-green-100 text-green-800 border-green-200',
      livestock: 'bg-red-100 text-red-800 border-red-200',
      softs: 'bg-amber-100 text-amber-800 border-amber-200',
      other: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[group] || colors.other;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <CommoditySidebar 
          activeGroup={activeGroup}
          onGroupSelect={setActiveGroup}
          commodityCounts={commodityCounts}
        />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center border-b px-4">
            <SidebarTrigger className="p-2 min-h-[48px] min-w-[48px]" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Star className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold">Favorites</h1>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Your Favorite Commodities
                </h2>
                <p className="text-muted-foreground">
                  Quick access to the commodities you track most
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search your favorites..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5" />
                        My Favorites ({favorites.length})
                      </CardTitle>
                      <CardDescription>
                        Commodities you've starred for quick access
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      ) : filteredFavorites.length === 0 ? (
                        <div className="text-center py-8">
                          <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">
                            {favorites.length === 0 ? "No favorites yet" : "No matching favorites"}
                          </h3>
                          <p className="text-muted-foreground">
                            {favorites.length === 0 
                              ? "Add commodities to your favorites for quick access"
                              : "Try adjusting your search terms"
                            }
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {filteredFavorites.map((favorite) => (
                            <div key={favorite.id} 
                                 className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                              <div className="flex items-center gap-3">
                                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold">{favorite.commodity_name}</h3>
                                    {favorite.commodity_symbol && (
                                      <Badge variant="secondary" className="text-xs">
                                        {favorite.commodity_symbol}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs ${getGroupColor(favorite.commodity_group)}`}
                                    >
                                      {favorite.commodity_group}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                      Added {formatDate(favorite.added_at)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFromFavorites(favorite.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Add to Favorites
                      </CardTitle>
                      <CardDescription>
                        Popular commodities to add
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {POPULAR_COMMODITIES.map((commodity) => {
                        const isAlreadyFavorite = favorites.some(
                          fav => fav.commodity_name === commodity.name
                        );
                        
                        return (
                          <div key={commodity.name} 
                               className="flex items-center justify-between p-2 border rounded">
                            <div>
                              <div className="font-medium text-sm">{commodity.name}</div>
                              <div className="text-xs text-muted-foreground">{commodity.symbol}</div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => addToFavorites(commodity)}
                              disabled={isAlreadyFavorite}
                            >
                              <Star className={`h-4 w-4 ${
                                isAlreadyFavorite 
                                  ? 'text-yellow-500 fill-yellow-500' 
                                  : 'text-gray-400'
                              }`} />
                            </Button>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Favorites;