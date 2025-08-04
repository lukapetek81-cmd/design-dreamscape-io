import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'

export const useFuturesResearch = () => {
  return useQuery({
    queryKey: ['futures-research'],
    queryFn: async () => {
      console.log('Researching FMP futures capabilities...')
      
      const { data, error } = await supabase.functions.invoke('research-fmp-futures')
      
      if (error) {
        console.error('Futures research error:', error)
        throw new Error(error.message || 'Failed to research futures capabilities')
      }
      
      return data
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    retry: 1
  })
}