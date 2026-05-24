import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ForwardCurvePoint {
  symbol: string;
  expiry: string;
  monthIdx: number;
  price: number | null;
}

export interface ForwardCurveResponse {
  commodity: string;
  spot: number;
  curve: ForwardCurvePoint[];
  structure: 'contango' | 'backwardation' | 'flat' | 'unknown';
  rollYield: number | null;
  m1: number | null;
  m2: number | null;
  source: 'model' | 'market';
  model?: { type: string; riskFree: number; storage: number; convenience: number; seasonal: boolean };
}

export const useForwardCurve = (commodity: string | null, enabled = true) => {
  return useQuery({
    queryKey: ['forward-curve', commodity],
    enabled: Boolean(commodity) && enabled,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<ForwardCurveResponse> => {
      const { data, error } = await supabase.functions.invoke('fetch-forward-curve', {
        body: { commodity, monthsAhead: 12 },
      });
      if (error) throw error;
      return data as ForwardCurveResponse;
    },
  });
};