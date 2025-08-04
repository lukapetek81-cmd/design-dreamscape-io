import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface IBKRContract {
  symbol: string;
  exchange: string;
  currency: string;
  secType: string;
  localSymbol: string;
  tradingClass: string;
  expiry: string;
  multiplier: string;
  primaryExchange: string;
  conId: number;
  description: string;
  underlyingSymbol?: string;
}

interface FuturesContract {
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  category: string;
  contractSize: string;
  venue: string;
  supportedByFMP: boolean;
  expirationDate?: string;
  underlyingSymbol?: string;
  conId?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { commodity } = await req.json()
    
    console.log(`Fetching IBKR futures contracts for: ${commodity}`)

    // Map commodity names to IBKR underlying symbols
    const commodityToSymbolMap: Record<string, string[]> = {
      'Crude Oil': ['CL', 'WTI'],
      'Brent Crude Oil': ['BZ', 'COIL'],
      'Natural Gas': ['NG'],
      'Heating Oil': ['HO'],
      'Gasoline RBOB': ['RB'],
      'Gold': ['GC'],
      'Silver': ['SI'],
      'Copper': ['HG'],
      'Platinum': ['PL'],
      'Palladium': ['PA'],
      'Corn': ['ZC'],
      'Wheat': ['ZW'],
      'Soybeans': ['ZS'],
      'Soybean Oil': ['ZL'],
      'Soybean Meal': ['ZM'],
      'Cotton': ['CT'],
      'Sugar': ['SB'],
      'Coffee': ['KC'],
      'Cocoa': ['CC'],
      'Orange Juice': ['OJ'],
      'Live Cattle': ['LE'],
      'Lean Hogs': ['HE'],
      'Lumber': ['LBS'],
      'Aluminum': ['ALI'],
    }

    const symbols = commodityToSymbolMap[commodity] || [commodity]
    
    // Mock IBKR data structure - in production, this would connect to IBKR API
    const mockIBKRContracts: IBKRContract[] = []
    
    for (const symbol of symbols) {
      // Generate mock contract months (typically front 12 months)
      const contractMonths = ['F', 'G', 'H', 'J', 'K', 'M', 'N', 'Q', 'U', 'V', 'X', 'Z']
      const currentDate = new Date()
      const currentYear = currentDate.getFullYear()
      
      for (let i = 0; i < 12; i++) {
        const monthIndex = (currentDate.getMonth() + i) % 12
        const year = currentYear + Math.floor((currentDate.getMonth() + i) / 12)
        const yearSuffix = year.toString().slice(-1)
        const contractSymbol = `${symbol}${contractMonths[monthIndex]}${yearSuffix}`
        
        // Calculate expiry date (third Friday of the month)
        const expiryDate = new Date(year, monthIndex, 1)
        const firstFriday = (5 - expiryDate.getDay() + 7) % 7 + 1
        const thirdFriday = firstFriday + 14
        expiryDate.setDate(thirdFriday)
        
        mockIBKRContracts.push({
          symbol: contractSymbol,
          exchange: getExchangeForSymbol(symbol),
          currency: 'USD',
          secType: 'FUT',
          localSymbol: contractSymbol,
          tradingClass: symbol,
          expiry: expiryDate.toISOString().split('T')[0].replace(/-/g, ''),
          multiplier: getMultiplierForSymbol(symbol),
          primaryExchange: getExchangeForSymbol(symbol),
          conId: Math.floor(Math.random() * 1000000) + 100000,
          description: `${commodity} ${contractMonths[monthIndex]}${year}`,
          underlyingSymbol: symbol
        })
      }
    }

    // Convert IBKR contracts to our standard format
    const futuresContracts: FuturesContract[] = mockIBKRContracts.map(contract => ({
      name: contract.description,
      symbol: contract.localSymbol,
      price: generateMockPrice(contract.underlyingSymbol || ''),
      change: (Math.random() - 0.5) * 10, // Random change between -5 and +5
      changePercent: (Math.random() - 0.5) * 10, // Random % change
      volume: Math.floor(Math.random() * 100000) + 1000,
      category: getCategoryForSymbol(contract.underlyingSymbol || ''),
      contractSize: getContractSizeForSymbol(contract.underlyingSymbol || ''),
      venue: contract.exchange,
      supportedByFMP: false, // IBKR data
      expirationDate: formatExpiryDate(contract.expiry),
      underlyingSymbol: contract.underlyingSymbol,
      conId: contract.conId
    }))

    console.log(`Found ${futuresContracts.length} IBKR futures contracts for ${commodity}`)

    return new Response(
      JSON.stringify({ 
        contracts: futuresContracts,
        source: 'IBKR',
        commodity,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error fetching IBKR futures:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function getExchangeForSymbol(symbol: string): string {
  const exchangeMap: Record<string, string> = {
    'CL': 'NYMEX',
    'BZ': 'ICE',
    'NG': 'NYMEX',
    'HO': 'NYMEX',
    'RB': 'NYMEX',
    'GC': 'COMEX',
    'SI': 'COMEX',
    'HG': 'COMEX',
    'PL': 'NYMEX',
    'PA': 'NYMEX',
    'ZC': 'CBOT',
    'ZW': 'CBOT',
    'ZS': 'CBOT',
    'ZL': 'CBOT',
    'ZM': 'CBOT',
    'CT': 'ICE',
    'SB': 'ICE',
    'KC': 'ICE',
    'CC': 'ICE',
    'OJ': 'ICE',
    'LE': 'CME',
    'HE': 'CME',
    'LBS': 'CME',
    'ALI': 'LME'
  }
  return exchangeMap[symbol] || 'UNKNOWN'
}

function getMultiplierForSymbol(symbol: string): string {
  const multiplierMap: Record<string, string> = {
    'CL': '1000',
    'BZ': '1000',
    'NG': '10000',
    'HO': '42000',
    'RB': '42000',
    'GC': '100',
    'SI': '5000',
    'HG': '25000',
    'PL': '50',
    'PA': '100',
    'ZC': '5000',
    'ZW': '5000',
    'ZS': '5000',
    'ZL': '60000',
    'ZM': '100',
    'CT': '50000',
    'SB': '112000',
    'KC': '37500',
    'CC': '10',
    'OJ': '15000',
    'LE': '40000',
    'HE': '40000',
    'LBS': '110000',
    'ALI': '25000'
  }
  return multiplierMap[symbol] || '1'
}

function getCategoryForSymbol(symbol: string): string {
  const categoryMap: Record<string, string> = {
    'CL': 'energy',
    'BZ': 'energy',
    'NG': 'energy',
    'HO': 'energy',
    'RB': 'energy',
    'GC': 'metals',
    'SI': 'metals',
    'HG': 'metals',
    'PL': 'metals',
    'PA': 'metals',
    'ZC': 'grains',
    'ZW': 'grains',
    'ZS': 'grains',
    'ZL': 'grains',
    'ZM': 'grains',
    'CT': 'softs',
    'SB': 'softs',
    'KC': 'softs',
    'CC': 'softs',
    'OJ': 'softs',
    'LE': 'livestock',
    'HE': 'livestock',
    'LBS': 'forest',
    'ALI': 'metals'
  }
  return categoryMap[symbol] || 'other'
}

function getContractSizeForSymbol(symbol: string): string {
  const sizeMap: Record<string, string> = {
    'CL': '1,000 bbl',
    'BZ': '1,000 bbl',
    'NG': '10,000 MMBtu',
    'HO': '42,000 gal',
    'RB': '42,000 gal',
    'GC': '100 oz',
    'SI': '5,000 oz',
    'HG': '25,000 lbs',
    'PL': '50 oz',
    'PA': '100 oz',
    'ZC': '5,000 bu',
    'ZW': '5,000 bu',
    'ZS': '5,000 bu',
    'ZL': '60,000 lbs',
    'ZM': '100 tons',
    'CT': '50,000 lbs',
    'SB': '112,000 lbs',
    'KC': '37,500 lbs',
    'CC': '10 MT',
    'OJ': '15,000 lbs',
    'LE': '40,000 lbs',
    'HE': '40,000 lbs',
    'LBS': '110,000 bd ft',
    'ALI': '25 MT'
  }
  return sizeMap[symbol] || 'N/A'
}

function generateMockPrice(symbol: string): number {
  const basePrices: Record<string, number> = {
    'CL': 75.50,
    'BZ': 78.20,
    'NG': 2.85,
    'HO': 2.45,
    'RB': 2.15,
    'GC': 2050.00,
    'SI': 24.50,
    'HG': 4.20,
    'PL': 980.00,
    'PA': 1520.00,
    'ZC': 450.25,
    'ZW': 650.50,
    'ZS': 1250.75,
    'ZL': 45.25,
    'ZM': 380.50,
    'CT': 72.50,
    'SB': 18.25,
    'KC': 185.50,
    'CC': 2850.00,
    'OJ': 420.00,
    'LE': 185.50,
    'HE': 78.25,
    'LBS': 580.00,
    'ALI': 2250.00
  }
  
  const basePrice = basePrices[symbol] || 100
  // Add some random variation (±5%)
  return Number((basePrice * (0.95 + Math.random() * 0.1)).toFixed(2))
}

function formatExpiryDate(expiry: string): string {
  // Convert YYYYMMDD to ISO string
  const year = expiry.substring(0, 4)
  const month = expiry.substring(4, 6)
  const day = expiry.substring(6, 8)
  return `${year}-${month}-${day}T00:00:00.000Z`
}