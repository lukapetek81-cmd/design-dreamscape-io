import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
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

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(result.current.portfolioSummary.totalValue).toBeGreaterThan(0)
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

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(result.current.portfolioSummary.totalReturn).toBeGreaterThan(-1000)
  })

  it('should add position correctly', async () => {
    const newPosition = {
      commodity_name: 'Gold',
      quantity: 10,
      entry_price: 1950.00,
      entry_date: '2024-01-01',
      notes: 'Test position'
    }
    
    const { result } = renderHook(() => usePortfolio(), { wrapper })

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(result.current.addPosition).toBeDefined()

    // Test add position function
    await result.current.addPosition(newPosition)

    const supabaseMock = require('@/integrations/supabase/client')
    expect(supabaseMock.supabase.from).toHaveBeenCalledWith('portfolio_positions')
  })

  it('should handle errors gracefully', async () => {
    const supabaseMock = require('@/integrations/supabase/client')
    vi.mocked(supabaseMock.supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } }),
    })

    const { result } = renderHook(() => usePortfolio(), { wrapper })

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(result.current.error).toBeTruthy()
  })
})