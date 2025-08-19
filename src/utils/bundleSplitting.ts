import React from 'react';

// Route-based code splitting
export const LazyRoutes = {
  Dashboard: React.lazy(() => import('@/pages/Dashboard')),
  Portfolio: React.lazy(() => import('@/pages/Portfolio')),
  MarketScreener: React.lazy(() => import('@/pages/MarketScreener')),
  MarketSentiment: React.lazy(() => import('@/pages/MarketSentiment')),
  MarketCorrelation: React.lazy(() => import('@/pages/MarketCorrelation')),
  PriceComparison: React.lazy(() => import('@/pages/PriceComparison')),
  EconomicCalendar: React.lazy(() => import('@/pages/EconomicCalendar')),
  ExpertInsights: React.lazy(() => import('@/pages/ExpertInsights')),
  LearningHub: React.lazy(() => import('@/pages/LearningHub')),
  TradingCommunity: React.lazy(() => import('@/pages/TradingCommunity')),
  RiskCalculator: React.lazy(() => import('@/pages/RiskCalculator')),
  Watchlists: React.lazy(() => import('@/pages/Watchlists')),
  Favorites: React.lazy(() => import('@/pages/Favorites')),
  MarketStatus: React.lazy(() => import('@/pages/MarketStatus')),
  RecentActivity: React.lazy(() => import('@/pages/RecentActivity')),
  APIComparison: React.lazy(() => import('@/pages/APIComparison')),
  Billing: React.lazy(() => import('@/pages/Billing')),
  Auth: React.lazy(() => import('@/pages/Auth')),
  ResetPassword: React.lazy(() => import('@/pages/ResetPassword')),
  NotFound: React.lazy(() => import('@/pages/NotFound')),
  NewsSettings: React.lazy(() => import('@/pages/NewsSettings')),
};

// Component-based code splitting for heavy components
export const LazyComponents = {
  CandlestickChart: React.lazy(() => import('@/components/CandlestickChart')),
  CommodityChart: React.lazy(() => import('@/components/CommodityChart')),
  CommodityNews: React.lazy(() => import('@/components/CommodityNews')),
  VirtualizedCommodityList: React.lazy(() => import('@/components/VirtualizedCommodityList')),
  CustomerPortal: React.lazy(() => import('@/components/CustomerPortal')),
  UserProfile: React.lazy(() => import('@/components/UserProfile')),
  ApiSettings: React.lazy(() => import('@/components/ApiSettings')),
};

// Feature-based splitting for specific functionality
export const LazyFeatures = {
  LazyChart: React.lazy(() => import('@/components/LazyChart')),
  LazyNews: React.lazy(() => import('@/components/LazyNews')),
};

// Utility function for dynamic imports with error handling
export const dynamicImport = async <T>(
  importFn: () => Promise<{ default: T }>,
  fallback?: T
): Promise<T> => {
  try {
    const module = await importFn();
    return module.default;
  } catch (error) {
    console.error('Dynamic import failed:', error);
    if (fallback) {
      return fallback;
    }
    throw error;
  }
};

// Import functions for preloading
const importFunctions = {
  Dashboard: () => import('@/pages/Dashboard'),
  Portfolio: () => import('@/pages/Portfolio'),
  MarketScreener: () => import('@/pages/MarketScreener'),
  MarketSentiment: () => import('@/pages/MarketSentiment'),
  MarketCorrelation: () => import('@/pages/MarketCorrelation'),
  PriceComparison: () => import('@/pages/PriceComparison'),
  EconomicCalendar: () => import('@/pages/EconomicCalendar'),
  ExpertInsights: () => import('@/pages/ExpertInsights'),
  LearningHub: () => import('@/pages/LearningHub'),
  TradingCommunity: () => import('@/pages/TradingCommunity'),
  RiskCalculator: () => import('@/pages/RiskCalculator'),
  Watchlists: () => import('@/pages/Watchlists'),
  Favorites: () => import('@/pages/Favorites'),
  MarketStatus: () => import('@/pages/MarketStatus'),
  RecentActivity: () => import('@/pages/RecentActivity'),
  APIComparison: () => import('@/pages/APIComparison'),
  Billing: () => import('@/pages/Billing'),
  Auth: () => import('@/pages/Auth'),
  ResetPassword: () => import('@/pages/ResetPassword'),
  NotFound: () => import('@/pages/NotFound'),
  NewsSettings: () => import('@/pages/NewsSettings'),
};

// Preload important chunks
export const preloadChunks = {
  dashboard: importFunctions.Dashboard,
  portfolio: importFunctions.Portfolio,
  charts: () => import('@/components/CandlestickChart'),
  
  // Preload on user interaction
  preloadOnHover: (componentName: keyof typeof LazyRoutes) => {
    return () => {
      // Preload by calling the import function directly
      const importFn = importFunctions[componentName];
      if (importFn) {
        importFn().catch(console.error);
      }
    };
  },
  
  // Preload based on route prediction
  preloadNextLikelyRoute: (currentRoute: string) => {
    const routePredictions: Record<string, (keyof typeof LazyRoutes)[]> = {
      '/': ['Dashboard', 'Portfolio'],
      '/dashboard': ['Portfolio', 'MarketScreener'],
      '/portfolio': ['MarketScreener', 'Watchlists'],
      '/market-screener': ['PriceComparison', 'MarketSentiment'],
    };
    
    const nextRoutes = routePredictions[currentRoute] || [];
    nextRoutes.forEach(componentName => {
      const importFn = importFunctions[componentName];
      if (importFn) {
        importFn().catch(console.error);
      }
    });
  }
};

// Resource hints for better loading performance
export const addResourceHints = () => {
  const head = document.head;
  
  // Preload critical fonts
  const fontPreload = document.createElement('link');
  fontPreload.rel = 'preload';
  fontPreload.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
  fontPreload.as = 'style';
  head.appendChild(fontPreload);
  
  // DNS prefetch for external resources
  const dnsPrefetch = [
    'https://api.commodityprice.com',
    'https://www.alphavantage.co',
    'https://financialmodelingprep.com'
  ];
  
  dnsPrefetch.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = url;
    head.appendChild(link);
  });
  
  // Preconnect to critical external domains
  const preconnect = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
  ];
  
  preconnect.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = url;
    link.crossOrigin = 'anonymous';
    head.appendChild(link);
  });
};