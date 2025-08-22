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

// Lazy load hooks for non-critical functionality
const useAndroidBackButton = () => {
  React.useEffect(() => {
    import("@/hooks/useAndroidBackButton").then(m => m.useAndroidBackButton());
  }, []);
};

const useServiceWorker = () => {
  const [isOnline, setIsOnline] = React.useState(true);
  
  React.useEffect(() => {
    import("@/hooks/useServiceWorker").then(m => {
      const { useServiceWorker } = m;
      // Initialize service worker hook
    });
  }, []);
  
  return { isOnline };
};

const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = React.useState(false);
  
  React.useEffect(() => {
    import("@/hooks/useOnboarding").then(m => {
      // Initialize onboarding hook
    });
  }, []);
  
  return {
    showOnboarding,
    completeOnboarding: () => setShowOnboarding(false),
    skipOnboarding: () => setShowOnboarding(false)
  };
};

const useKeyboardShortcuts = () => {
  const [showHelp, setShowHelp] = React.useState(false);
  
  React.useEffect(() => {
    import("@/hooks/useKeyboardShortcuts").then(m => {
      // Initialize keyboard shortcuts hook
    });
  }, []);
  
  return {
    showHelp,
    closeHelp: () => setShowHelp(false),
    getShortcutsByCategory: () => ({})
  };
};

const useAnalytics = () => {
  React.useEffect(() => {
    import("@/hooks/useAnalytics").then(m => {
      // Initialize analytics hook
    });
  }, []);
  
  return {
    trackCustomEvent: (_event: string, _data?: any) => {}
  };
};

// Create optimized query client with mobile-aware configuration
const getQueryClient = () => {
  const isMobileDevice = typeof window !== 'undefined' && window.innerWidth < 768;
  
  // Use mobile-optimized config for mobile devices
  const config = isMobileDevice ? queryClientConfigs.mobile : queryClientConfigs.standard;
  
  return createOptimizedQueryClient(config);
};

const queryClient = getQueryClient();

const AppRoutes = () => {
  useAndroidBackButton();
  const [showSplash, setShowSplash] = React.useState(true);
  const isMobile = useIsMobile();
  const { showOnboarding, completeOnboarding, skipOnboarding } = useOnboarding();
  const { showHelp, closeHelp, getShortcutsByCategory } = useKeyboardShortcuts();
  const analytics = useAnalytics();
  const { isOnline } = useServiceWorker();
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

  // Initialize monitoring service with user data when available
  React.useEffect(() => {
    if (shouldLoadProviders) {
      import("@/services/monitoringService").then(m => {
        // Initialize monitoring service
      });
      
      // Track app start
      analytics.trackCustomEvent('app_start', {
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        platform: navigator.platform
      });
    }
  }, [analytics, shouldLoadProviders]);

  React.useEffect(() => {
    // Show splash screen only on mobile and only on first load
    if (!isMobile) {
      setShowSplash(false);
      return;
    }

    // Auto-hide splash after 2 seconds for faster perceived performance
    const fallbackTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(fallbackTimer);
  }, [isMobile]);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };
  
  return (
    <>
      <SEOHead />
      
      {shouldLoadProviders && showOnboarding && (
        <React.Suspense fallback={null}>
          <OnboardingFlow
            onComplete={completeOnboarding}
            onSkip={skipOnboarding}
          />
        </React.Suspense>
      )}
      
      {shouldLoadProviders && (
        <React.Suspense fallback={null}>
          <KeyboardShortcutsHelp
            isOpen={showHelp}
            onClose={closeHelp}
            shortcuts={getShortcutsByCategory()}
          />
        </React.Suspense>
      )}
      
      {shouldLoadProviders && (
        <React.Suspense fallback={null}>
          <SplashScreen 
            isVisible={showSplash} 
            onComplete={handleSplashComplete} 
          />
        </React.Suspense>
      )}
      
      {shouldLoadProviders && !isOnline && (
        <React.Suspense fallback={null}>
          <OfflineIndicator />
        </React.Suspense>
      )}
      
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
                {shouldLoadProviders ? (
                  <React.Suspense fallback={<DashboardSkeleton />}>
                    <LoadingProvider>
                      <SecurityProvider>
                        <RealtimeDataProvider>
                          <AppToastProvider position="top">
                            <TooltipProvider>
                              <Toaster />
                              <Sonner />
                              <AccessibilityProvider>
                                <AppRoutes />
                                <PWAInstallPrompt />
                              </AccessibilityProvider>
                            </TooltipProvider>
                          </AppToastProvider>
                        </RealtimeDataProvider>
                      </SecurityProvider>
                    </LoadingProvider>
                  </React.Suspense>
                ) : (
                  <AppRoutes />
                )}
              </ErrorBoundary>
            </BrowserRouter>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </AppShell>
  );
};

export default App;