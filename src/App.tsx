import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/contexts/AuthContext';
import { RealtimeDataProvider } from '@/contexts/RealtimeDataContext';
import { createOptimizedQueryClient } from '@/lib/queryClient';
import { useCapacitorAuthDeepLink } from '@/hooks/useCapacitorAuthDeepLink';
import SEOHead from '@/components/SEOHead';
import Dashboard from '@/pages/Dashboard';
import Auth from '@/pages/Auth';

// Lazy-load every non-critical route so initial Dashboard paint stays fast
// and route transitions only fetch what they need.
const NotFound = lazy(() => import('@/pages/NotFound'));
const Portfolio = lazy(() => import('@/pages/Portfolio'));
const MarketStatus = lazy(() => import('@/pages/MarketStatus'));
const APIComparison = lazy(() => import('@/pages/APIComparison'));
const EconomicCalendar = lazy(() => import('@/pages/EconomicCalendar'));
const ExpertInsights = lazy(() => import('@/pages/ExpertInsights'));
const LearningHub = lazy(() => import('@/pages/LearningHub'));
const MarketCorrelation = lazy(() => import('@/pages/MarketCorrelation'));
const MarketScreener = lazy(() => import('@/pages/MarketScreener'));
const MarketSentiment = lazy(() => import('@/pages/MarketSentiment'));
const NewsSettings = lazy(() => import('@/pages/NewsSettings'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('@/pages/TermsOfService'));
const Watchlists = lazy(() => import('@/pages/Watchlists'));
const DeleteAccount = lazy(() => import('@/pages/DeleteAccount'));
const VersionInfo = lazy(() => import('@/pages/VersionInfo'));
const CatalogAudit = lazy(() => import('@/pages/CatalogAudit'));
const Legal = lazy(() => import('@/pages/Legal'));

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
  </div>
);

const NativeAuthBridge = () => {
  useCapacitorAuthDeepLink();
  return null;
};

const App = () => {
  // Create QueryClient directly without useMemo to avoid React hooks issues
  const queryClient = createOptimizedQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NativeAuthBridge />
          <BrowserRouter>
          <TooltipProvider>
            <RealtimeDataProvider>
              <SEOHead />
              <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                
                
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
                <Route path="/calendar" element={<EconomicCalendar />} />
                <Route path="/news-settings" element={<NewsSettings />} />
                
                <Route path="/portfolio" element={<Portfolio />} />
                
                <Route path="/watchlists" element={<Watchlists />} />
                <Route path="/delete-account" element={<DeleteAccount />} />
                <Route path="/version" element={<VersionInfo />} />
                <Route path="/about" element={<VersionInfo />} />
                <Route path="/legal" element={<Legal />} />
                <Route path="/imprint" element={<Legal />} />
                <Route path="/admin/catalog-audit" element={<CatalogAudit />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              </Suspense>
              <Toaster />
            </RealtimeDataProvider>
          </TooltipProvider>
        </BrowserRouter>
        </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;