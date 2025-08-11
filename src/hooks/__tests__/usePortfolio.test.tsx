import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { usePortfolio } from '@/hooks/usePortfolio'
import { createTestQueryClient, createMockPortfolioPosition } from '@/test/utils'

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  },
}))

describe('usePortfolio Hook', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = createTestQueryClient()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  it('should calculate total portfolio value correctly', async () => {
    const mockPositions = [
      createMockPortfolioPosition({ quantity: 10, currentPrice: 2000 }),
      createMockPortfolioPosition({ quantity: 5, currentPrice: 1500 }),
    ]

    // Mock the portfolio data
    const supabaseMock = require('@/integrations/supabase/client')
    vi.mocked(supabaseMock.supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: mockPositions, error: null }),
    })

    const { result } = renderHook(() => usePortfolio(), { wrapper })

    await waitFor(() => {
      expect(result.current.totalValue).toBe(27500) // (10 * 2000) + (5 * 1500)
    })
  })

  it('should calculate total PnL correctly', async () => {
    const mockPositions = [
      createMockPortfolioPosition({ 
        quantity: 10, 
        avgPrice: 1900, 
        currentPrice: 2000,
        pnl: 1000 
      }),
      createMockPortfolioPosition({ 
        quantity: 5, 
        avgPrice: 1600, 
        currentPrice: 1500,
        pnl: -500 
      }),
    ]

    const supabaseMock = require('@/integrations/supabase/client')
    vi.mocked(supabaseMock.supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: mockPositions, error: null }),
    })

    const { result } = renderHook(() => usePortfolio(), { wrapper })

    await waitFor(() => {
      expect(result.current.totalPnL).toBe(500) // 1000 + (-500)
    })
  })

  it('should add position correctly', async () => {
    const newPosition = createMockPortfolioPosition()
    
    const { result } = renderHook(() => usePortfolio(), { wrapper })

    await waitFor(() => {
      expect(result.current.addPosition).toBeDefined()
    })

    // Test add position mutation
    await result.current.addPosition.mutateAsync(newPosition)

    expect(supabaseMock.supabase.from).toHaveBeenCalledWith('portfolio_positions')
  })

  it('should handle errors gracefully', async () => {
    const supabaseMock = require('@/integrations/supabase/client')
    vi.mocked(supabaseMock.supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } }),
    })

    const { result } = renderHook(() => usePortfolio(), { wrapper })

    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
    })
  })
})