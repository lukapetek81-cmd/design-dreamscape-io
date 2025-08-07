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
import SplashScreen from "@/components/mobile/SplashScreen";
import { AppToastProvider } from "@/components/mobile/AppToast";
import React, { useState, useEffect } from 'react';
import { useAndroidBackButton } from "@/hooks/useAndroidBackButton";
import { PWAInstallPrompt } from "@/components/mobile/PWAComponents";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import RecentActivity from "./pages/RecentActivity";
import Favorites from "./pages/Favorites";
import PriceComparison from "./pages/PriceComparison";
import MarketStatus from "./pages/MarketStatus";

import Portfolio from "./pages/Portfolio";
import NewsSettingsPage from "./pages/NewsSettings";
import Billing from "./pages/Billing";
import Watchlists from "./pages/Watchlists";
import MarketScreener from "./pages/MarketScreener";
import EconomicCalendar from "./pages/EconomicCalendar";
import RiskCalculator from "./pages/RiskCalculator";
import MarketCorrelation from "./pages/MarketCorrelation";
import TradingCommunity from "./pages/TradingCommunity";
import ExpertInsights from "./pages/ExpertInsights";
import LearningHub from "./pages/LearningHub";
import MarketSentiment from "./pages/MarketSentiment";

import APIComparison from "./pages/APIComparison";
import NotFound from "./pages/NotFound";

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
      <SplashScreen 
        isVisible={showSplash} 
        onComplete={handleSplashComplete} 
      />
      
      <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      <Route path="/portfolio" element={<Portfolio />} />
      
      <Route path="/news-settings" element={<NewsSettingsPage />} />
      <Route path="/billing" element={<Billing />} />
      <Route path="/correlation" element={<MarketCorrelation />} />
      <Route path="/watchlists" element={<Watchlists />} />
      <Route path="/screener" element={<MarketScreener />} />
      <Route path="/calendar" element={<EconomicCalendar />} />
      <Route path="/risk-calculator" element={<RiskCalculator />} />
      <Route path="/community" element={<TradingCommunity />} />
      <Route path="/insights" element={<ExpertInsights />} />
      <Route path="/learning" element={<LearningHub />} />
      <Route path="/sentiment" element={<MarketSentiment />} />
      <Route path="/recent-activity" element={<RecentActivity />} />
      <Route path="/favorites" element={<Favorites />} />
      <Route path="/price-comparison" element={<PriceComparison />} />
      <Route path="/api-comparison" element={<APIComparison />} />
      <Route path="/market-status" element={<MarketStatus />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RealtimeDataProvider>
          <AppToastProvider position="top">
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <ErrorBoundary fallback={<div>Something went wrong with routing</div>}>
                  <AppRoutes />
                  <PWAInstallPrompt />
                </ErrorBoundary>
              </BrowserRouter>
            </TooltipProvider>
          </AppToastProvider>
        </RealtimeDataProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;