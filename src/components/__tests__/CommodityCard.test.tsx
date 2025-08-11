import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, createMockCommodity } from '@/test/utils'
import { screen, waitFor } from '@testing-library/react'
import CommodityCard from '@/components/CommodityCard'

// Mock the hooks and services
vi.mock('@/hooks/useCommodityData', () => ({
  useCommodityData: () => ({
    data: createMockCommodity(),
    isLoading: false,
    error: null,
  }),
}))

describe('CommodityCard Component', () => {
  const mockCommodity = createMockCommodity({
    symbol: 'GOLD',
    name: 'Gold',
    price: 2000.50,
    change: 15.25,
    changePercent: 0.77,
  })

  it('should render commodity information correctly', () => {
    renderWithProviders(<CommodityCard commodity={mockCommodity} />)
    
    expect(screen.getByText('Gold')).toBeInTheDocument()
    expect(screen.getByText('GOLD')).toBeInTheDocument()
    expect(screen.getByText('$2,000.50')).toBeInTheDocument()
  })

  it('should display positive price change with correct styling', () => {
    renderWithProviders(<CommodityCard commodity={mockCommodity} />)
    
    const changeElement = screen.getByText('+$15.25')
    expect(changeElement).toBeInTheDocument()
    expect(changeElement).toHaveClass('text-green-600')
  })

  it('should display negative price change correctly', () => {
    const negativeCommodity = createMockCommodity({
      change: -15.25,
      changePercent: -0.77,
    })
    
    renderWithProviders(<CommodityCard commodity={negativeCommodity} />)
    
    const changeElement = screen.getByText('-$15.25')
    expect(changeElement).toBeInTheDocument()
    expect(changeElement).toHaveClass('text-red-600')
  })

  it('should be accessible', async () => {
    const { container } = renderWithProviders(<CommodityCard commodity={mockCommodity} />)
    
    // Check for proper ARIA labels
    expect(screen.getByRole('article')).toBeInTheDocument()
    
    // Check for keyboard navigation
    const card = screen.getByRole('article')
    expect(card).toHaveAttribute('tabIndex', '0')
  })

  it('should handle click events', async () => {
    const handleClick = vi.fn()
    const { user } = renderWithProviders(
      <CommodityCard commodity={mockCommodity} onClick={handleClick} />
    )
    
    const card = screen.getByRole('article')
    await user.click(card)
    
    expect(handleClick).toHaveBeenCalledWith(mockCommodity)
  })

  it('should show loading state', () => {
    renderWithProviders(<CommodityCard commodity={mockCommodity} isLoading={true} />)
    
    expect(screen.getByTestId('commodity-card-skeleton')).toBeInTheDocument()
  })
})