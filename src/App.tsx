import React from 'react';
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { createOptimizedQueryClient, queryClientConfigs } from "@/lib/queryClient";
import { useIsMobile } from "@/hooks/use-mobile";
import { LazyRoutes, addResourceHints } from "@/utils/bundleSplitting";
import { DashboardSkeleton } from "@/components/loading/LoadingSkeletons";
import { useDeferredProviders } from "@/hooks/useDeferredProviders";
import AppShell from "@/components/AppShell";
import SEOHead from "@/components/SEOHead";

// Lazy load non-critical components for better initial bundle size
const Toaster = React.lazy(() => import("@/components/ui/toaster").then(m => ({ default: m.Toaster })));
const Sonner = React.lazy(() => import("@/components/ui/sonner").then(m => ({ default: m.Toaster })));
const TooltipProvider = React.lazy(() => import("@/components/ui/tooltip").then(m => ({ default: m.TooltipProvider })));
const RealtimeDataProvider = React.lazy(() => import("@/contexts/RealtimeDataContext").then(m => ({ default: m.RealtimeDataProvider })));
const AppToastProvider = React.lazy(() => import("@/components/mobile/AppToast").then(m => ({ default: m.AppToastProvider })));
const LoadingProvider = React.lazy(() => import("@/components/loading/LoadingProvider").then(m => ({ default: m.LoadingProvider })));
const SecurityProvider = React.lazy(() => import("@/components/security/SecurityProvider").then(m => ({ default: m.SecurityProvider })));
const AccessibilityProvider = React.lazy(() => import("@/components/AccessibilityProvider").then(m => ({ default: m.AccessibilityProvider })));
const SplashScreen = React.lazy(() => import("@/components/mobile/SplashScreen"));
const OfflineIndicator = React.lazy(() => import("@/components/OfflineIndicator").then(m => ({ default: m.OfflineIndicator })));
const OnboardingFlow = React.lazy(() => import("@/components/onboarding/OnboardingFlow"));
const KeyboardShortcutsHelp = React.lazy(() => import("@/components/ui/keyboard-shortcuts-help"));
const PWAInstallPrompt = React.lazy(() => import("@/components/mobile/PWAComponents").then(m => ({ default: m.PWAInstallPrompt })));

// Simplified hooks for MVP
const useSimpleAnalytics = () => ({
  trackCustomEvent: (_event: string, _data?: any) => {
    console.log('Analytics event:', _event, _data);
  }
});

// Create optimized query client with mobile-aware configuration
const getQueryClient = () => {
  const isMobileDevice = typeof window !== 'undefined' && window.innerWidth < 768;
  
  // Use mobile-optimized config for mobile devices
  const config = isMobileDevice ? queryClientConfigs.mobile : queryClientConfigs.standard;
  
  return createOptimizedQueryClient(config);
};

const queryClient = getQueryClient();

const AppRoutes = () => {
  const [showSplash, setShowSplash] = React.useState(false); // Disabled for MVP
  const isMobile = useIsMobile();
  const analytics = useSimpleAnalytics();
  const navigate = useNavigate();
  const shouldLoadProviders = useDeferredProviders();

  // Listen for custom navigation events from ErrorBoundary
  React.useEffect(() => {
    const handleNavigateHome = () => {
      navigate('/', { replace: true });
    };

    window.addEventListener('navigate-home', handleNavigateHome);
    return () => {
      window.removeEventListener('navigate-home', handleNavigateHome);
    };
  }, [navigate]);

  // Track app start
  React.useEffect(() => {
    analytics.trackCustomEvent('app_start', {
      timestamp: Date.now()
    });
  }, [analytics]);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };
  
  return (
    <>
      <SEOHead />
      
      <main id="main-content" role="main" tabIndex={-1}>
        <React.Suspense fallback={<DashboardSkeleton />}>
          <Routes>
            <Route path="/" element={<LazyRoutes.Dashboard />} />
            <Route path="/dashboard" element={<LazyRoutes.Dashboard />} />
            <Route path="/auth" element={<LazyRoutes.Auth />} />
            <Route path="/reset-password" element={<LazyRoutes.ResetPassword />} />
            <Route path="/portfolio" element={<LazyRoutes.Portfolio />} />
            <Route path="/news-settings" element={<LazyRoutes.NewsSettings />} />
            <Route path="/billing" element={<LazyRoutes.Billing />} />
            <Route path="/correlation" element={<LazyRoutes.MarketCorrelation />} />
            <Route path="/watchlists" element={<LazyRoutes.Watchlists />} />
            <Route path="/screener" element={<LazyRoutes.MarketScreener />} />
            <Route path="/calendar" element={<LazyRoutes.EconomicCalendar />} />
            <Route path="/risk-calculator" element={<LazyRoutes.RiskCalculator />} />
            <Route path="/community" element={<LazyRoutes.TradingCommunity />} />
            <Route path="/insights" element={<LazyRoutes.ExpertInsights />} />
            <Route path="/learning" element={<LazyRoutes.LearningHub />} />
            <Route path="/sentiment" element={<LazyRoutes.MarketSentiment />} />
            <Route path="/recent-activity" element={<LazyRoutes.RecentActivity />} />
            <Route path="/favorites" element={<LazyRoutes.Favorites />} />
            <Route path="/price-comparison" element={<LazyRoutes.PriceComparison />} />
            <Route path="/api-comparison" element={<LazyRoutes.APIComparison />} />
            <Route path="/market-status" element={<LazyRoutes.MarketStatus />} />
            <Route path="*" element={<LazyRoutes.NotFound />} />
          </Routes>
        </React.Suspense>
      </main>
    </>
  );
};

const App = () => {
  const shouldLoadProviders = useDeferredProviders();

  React.useEffect(() => {
    // Add resource hints for better performance
    addResourceHints();
  }, []);

  return (
    <AppShell>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <BrowserRouter>
              <ErrorBoundary fallback={<div role="alert" className="min-h-screen flex items-center justify-center p-4"><div className="text-center"><h2 className="text-xl font-semibold mb-2">Navigation Error</h2><p className="text-muted-foreground">Something went wrong with page navigation. Please try refreshing the page.</p></div></div>}>
                <React.Suspense fallback={<DashboardSkeleton />}>
                  <RealtimeDataProvider>
                    <TooltipProvider>
                      <AppRoutes />
                    </TooltipProvider>
                  </RealtimeDataProvider>
                </React.Suspense>
              </ErrorBoundary>
            </BrowserRouter>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </AppShell>
  );
};

export default App;