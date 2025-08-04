import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'

export const useAlphaVantageResearch = () => {
  return useQuery({
    queryKey: ['alpha-vantage-research'],
    queryFn: async () => {
      console.log('Researching Alpha Vantage futures capabilities...')
      
      const { data, error } = await supabase.functions.invoke('research-alpha-vantage-futures')
      
      if (error) {
        console.error('Alpha Vantage research error:', error)
        throw new Error(error.message || 'Failed to research Alpha Vantage capabilities')
      }
      
      return data
    },
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
    retry: 1
  })
}