import React, { Suspense, useEffect, useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RealtimeDataProvider } from "@/contexts/RealtimeDataContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { createOptimizedQueryClient, queryClientConfigs } from "@/lib/queryClient";
import { useIsMobile } from "@/hooks/use-mobile";
import { AppToastProvider } from "@/components/mobile/AppToast";
import { useAndroidBackButton } from "@/hooks/useAndroidBackButton";
import { PWAInstallPrompt } from "@/components/mobile/PWAComponents";
import { LoadingProvider } from "@/components/loading/LoadingProvider";
import { SecurityProvider } from "@/components/security/SecurityProvider";
import { LazyRoutes, addResourceHints } from "@/utils/bundleSplitting";
import { useServiceWorker } from "@/hooks/useServiceWorker";
import { DashboardSkeleton } from "@/components/loading/LoadingSkeletons";
import SplashScreen from "@/components/mobile/SplashScreen";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import KeyboardShortcutsHelp from "@/components/ui/keyboard-shortcuts-help";
import { useAnalytics } from "@/hooks/useAnalytics";
import { monitoringService } from "@/services/monitoringService";
import { AccessibilityProvider } from "@/components/AccessibilityProvider";
import SEOHead from "@/components/SEOHead";

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
  const [showSplash, setShowSplash] = useState(true);
  const isMobile = useIsMobile();
  const { showOnboarding, completeOnboarding, skipOnboarding } = useOnboarding();
  const { showHelp, closeHelp, getShortcutsByCategory } = useKeyboardShortcuts();
  const analytics = useAnalytics();
  const { isOnline } = useServiceWorker(); // Move the useServiceWorker hook here

  // Initialize monitoring service with user data when available
  useEffect(() => {
    // You can set user ID here when authentication is available
    // monitoringService.setUserId(user?.id);
    
    // Track app start
    analytics.trackCustomEvent('app_start', {
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      platform: navigator.platform
    });
  }, [analytics]);

  useEffect(() => {
    // Show splash screen only on mobile and only on first load
    if (!isMobile) {
      setShowSplash(false);
      return;
    }

    // Auto-hide splash after 3 seconds as fallback
    const fallbackTimer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(fallbackTimer);
  }, [isMobile]);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };
  
  return (
    <>
      <SEOHead />
      
      {showOnboarding && (
        <OnboardingFlow
          onComplete={completeOnboarding}
          onSkip={skipOnboarding}
        />
      )}
      
      <KeyboardShortcutsHelp
        isOpen={showHelp}
        onClose={closeHelp}
        shortcuts={getShortcutsByCategory()}
      />
      
      <SplashScreen 
        isVisible={showSplash} 
        onComplete={handleSplashComplete} 
      />
      
      {!isOnline && <OfflineIndicator />}
      
      <main id="main-content" role="main" tabIndex={-1}>
        <Suspense fallback={<DashboardSkeleton />}>
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
        </Suspense>
      </main>
    </>
  );
};

const App = () => {
  useEffect(() => {
    // Add resource hints for better performance
    addResourceHints();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LoadingProvider>
          <SecurityProvider>
            <AuthProvider>
              <RealtimeDataProvider>
                <AppToastProvider position="top">
                  <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <BrowserRouter>
                      <AccessibilityProvider>
                        <ErrorBoundary fallback={<div role="alert">Something went wrong with routing</div>}>
                          <AppRoutes />
                          <PWAInstallPrompt />
                        </ErrorBoundary>
                      </AccessibilityProvider>
                    </BrowserRouter>
                  </TooltipProvider>
                </AppToastProvider>
              </RealtimeDataProvider>
            </AuthProvider>
          </SecurityProvider>
        </LoadingProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;