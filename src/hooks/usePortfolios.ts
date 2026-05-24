import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { limitsFor } from '@/utils/tiers';

export interface Portfolio {
  id: string;
  user_id: string;
  name: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export const usePortfolios = () => {
  const auth = useAuth();
  const userId = auth?.user?.id;
  return useQuery({
    queryKey: ['portfolios', userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<Portfolio[]> => {
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data ?? []) as Portfolio[];
    },
  });
};

export const useCreatePortfolio = () => {
  const qc = useQueryClient();
  const auth = useAuth();
  const { toast } = useToast();
  const tier = auth?.tier ?? 'free';
  const limit = limitsFor(tier).portfolios;

  return useMutation({
    mutationFn: async (name: string) => {
      if (!auth?.user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('portfolios')
        .insert({ user_id: auth.user.id, name, is_default: false })
        .select()
        .single();
      if (error) throw error;
      return data as Portfolio;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portfolios'] });
      toast({ title: 'Portfolio created' });
    },
    onError: (err: Error) => {
      toast({
        title: 'Could not create portfolio',
        description:
          err.message?.includes('limit') || err.message?.includes('check_violation')
            ? `You're at your ${limit === Infinity ? 'unlimited' : limit}-portfolio limit. Upgrade for more.`
            : err.message,
        variant: 'destructive',
      });
    },
  });
};

export const useDeletePortfolio = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('portfolios').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portfolios'] });
      qc.invalidateQueries({ queryKey: ['portfolio-positions'] });
      toast({ title: 'Portfolio deleted' });
    },
  });
};