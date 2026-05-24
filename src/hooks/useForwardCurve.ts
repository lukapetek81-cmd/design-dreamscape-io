import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ForwardCurveResponse {
  commodity: string;
  label: string;
  spot: number;
  source: 'market';
  provider: string;
  asOf: string;
}

export const useForwardCurve = (commodity: string | null, enabled = true) => {
  return useQuery({
    queryKey: ['forward-curve', commodity],
    enabled: Boolean(commodity) && enabled,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<ForwardCurveResponse> => {
      const { data, error } = await supabase.functions.invoke('fetch-forward-curve', {
        body: { commodity },
      });
      if (error) throw error;
      return data as ForwardCurveResponse;
    },
  });
};