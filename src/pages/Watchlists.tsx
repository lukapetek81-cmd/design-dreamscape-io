import React from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Star, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Favorite {
  id: string;
  commodity_name: string;
  commodity_symbol: string | null;
  commodity_group: string | null;
  added_at: string;
}

const Watchlists = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: favorites, isLoading } = useQuery({
    queryKey: ['user-favorites', user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Favorite[]> => {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('*')
        .order('added_at', { ascending: false });
      if (error) throw error;
      return data as Favorite[];
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('user_favorites').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-favorites'] });
      toast({ title: 'Removed from watchlist' });
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <Star className="h-6 w-6 text-amber-500" />
          <h1 className="text-2xl font-bold">My Watchlist</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : !favorites || favorites.length === 0 ? (
          <Card className="p-8 text-center">
            <Star className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="font-medium mb-1">No favorites yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Tap the star on any commodity to add it to your watchlist.
            </p>
            <Button asChild><Link to="/">Browse commodities</Link></Button>
          </Card>
        ) : (
          <div className="space-y-2">
            {favorites.map(fav => (
              <Card key={fav.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{fav.commodity_name}</p>
                  {fav.commodity_symbol && (
                    <p className="text-xs text-muted-foreground">{fav.commodity_symbol}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link to={`/?commodity=${encodeURIComponent(fav.commodity_name)}`}>View</Link>
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeMutation.mutate(fav.id)}
                    disabled={removeMutation.isPending}
                    aria-label="Remove from watchlist"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Watchlists;
