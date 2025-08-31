import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/contexts/AuthContext';
import { RealtimeDataProvider } from '@/contexts/RealtimeDataContext';
import { createOptimizedQueryClient } from '@/lib/queryClient';
import SEOHead from '@/components/SEOHead';
import Dashboard from '@/pages/Dashboard';
import Auth from '@/pages/Auth';
import Billing from '@/pages/Billing';
import NotFound from '@/pages/NotFound';
import Portfolio from '@/pages/Portfolio';
import MarketStatus from '@/pages/MarketStatus';
import APIComparison from '@/pages/APIComparison';
import EconomicCalendar from '@/pages/EconomicCalendar';
import ExpertInsights from '@/pages/ExpertInsights';
import LearningHub from '@/pages/LearningHub';
import MarketCorrelation from '@/pages/MarketCorrelation';
import MarketScreener from '@/pages/MarketScreener';
import MarketSentiment from '@/pages/MarketSentiment';
import NewsSettings from '@/pages/NewsSettings';
import PriceComparison from '@/pages/PriceComparison';
import ResetPassword from '@/pages/ResetPassword';
import RiskCalculator from '@/pages/RiskCalculator';
import TradingCommunity from '@/pages/TradingCommunity';
import Watchlists from '@/pages/Watchlists';
import { TradingDashboard } from '@/components/trading/TradingDashboard';

const App = () => {
  // Create QueryClient directly without useMemo to avoid React hooks issues
  const queryClient = createOptimizedQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <TooltipProvider>
            <RealtimeDataProvider>
              <SEOHead />
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/auth" element={<Auth />} />
                
                <Route path="/billing" element={<Billing />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/market-status" element={<MarketStatus />} />
                <Route path="/api-comparison" element={<APIComparison />} />
                <Route path="/economic-calendar" element={<EconomicCalendar />} />
                <Route path="/expert-insights" element={<ExpertInsights />} />
                <Route path="/learning-hub" element={<LearningHub />} />
                <Route path="/market-correlation" element={<MarketCorrelation />} />
                <Route path="/correlation" element={<MarketCorrelation />} />
                <Route path="/market-screener" element={<MarketScreener />} />
                <Route path="/screener" element={<MarketScreener />} />
                <Route path="/market-sentiment" element={<MarketSentiment />} />
                <Route path="/sentiment" element={<MarketSentiment />} />
                <Route path="/insights" element={<ExpertInsights />} />
                <Route path="/learning" element={<LearningHub />} />
                <Route path="/community" element={<TradingCommunity />} />
                <Route path="/calendar" element={<EconomicCalendar />} />
                <Route path="/news-settings" element={<NewsSettings />} />
                <Route path="/price-comparison" element={<PriceComparison />} />
                
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/risk-calculator" element={<RiskCalculator />} />
                <Route path="/trading-community" element={<TradingCommunity />} />
                <Route path="/watchlists" element={<Watchlists />} />
                <Route path="/trading" element={<TradingDashboard />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </RealtimeDataProvider>
          </TooltipProvider>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;