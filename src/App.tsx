import React from 'react';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RealtimeDataProvider } from "@/contexts/RealtimeDataContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import CommoditySidebar from "@/components/CommoditySidebar";
import { AccessibilityProvider } from "@/components/AccessibilityProvider";
import { SecurityProvider } from "@/components/security/SecurityProvider";
import { LoadingProvider } from "@/components/loading/LoadingProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import SEOHead from "@/components/SEOHead";
import { PullToRefresh } from "@/components/mobile/PullToRefresh";
import { useServiceWorker } from "@/hooks/useServiceWorker";
import { useAndroidBackButton } from "@/hooks/useAndroidBackButton";
import { usePerformanceMonitoring } from "@/hooks/usePerformanceMonitoring";
import createOptimizedQueryClient from "@/lib/queryClient";
import { CommodityCounts } from "@/components/sidebar/types";

// Import pages directly for faster initial load
import Dashboard from "@/pages/Dashboard";
import Auth from "@/pages/Auth";
import ResetPassword from "@/pages/ResetPassword";
import Portfolio from "@/pages/Portfolio";
import MarketScreener from "@/pages/MarketScreener";
import EconomicCalendar from "@/pages/EconomicCalendar";
import TradingCommunity from "@/pages/TradingCommunity";
import LearningHub from "@/pages/LearningHub";
import ExpertInsights from "@/pages/ExpertInsights";
import MarketSentiment from "@/pages/MarketSentiment";
import RiskCalculator from "@/pages/RiskCalculator";
import MarketCorrelation from "@/pages/MarketCorrelation";
import PriceComparison from "@/pages/PriceComparison";
import Watchlists from "@/pages/Watchlists";
import Favorites from "@/pages/Favorites";
import RecentActivity from "@/pages/RecentActivity";
import MarketStatus from "@/pages/MarketStatus";
import APIComparison from "@/pages/APIComparison";
import Billing from "@/pages/Billing";
import NewsSettings from "@/pages/NewsSettings";
import NotFound from "@/pages/NotFound";
import "./App.css";

// Create query client instance
const queryClient = createOptimizedQueryClient();

function App() {
  useServiceWorker();
  usePerformanceMonitoring();

  const [activeGroup, setActiveGroup] = React.useState<string>("all");
  const [commodityCounts, setCommodityCounts] = React.useState<CommodityCounts>({} as CommodityCounts);

  return (
    <ErrorBoundary>
      <SEOHead />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppContent 
            activeGroup={activeGroup}
            setActiveGroup={setActiveGroup}
            commodityCounts={commodityCounts}
            setCommodityCounts={setCommodityCounts}
          />
        </BrowserRouter>
      </QueryClientProvider>
      <Toaster />
    </ErrorBoundary>
  );
}

function AppContent({ activeGroup, setActiveGroup, commodityCounts, setCommodityCounts }: {
  activeGroup: string;
  setActiveGroup: (group: string) => void;
  commodityCounts: CommodityCounts;
  setCommodityCounts: (counts: CommodityCounts) => void;
}) {
  // Move useAndroidBackButton here, inside the BrowserRouter context
  useAndroidBackButton();

  const handleRefresh = React.useCallback(async () => {
    // Force refresh of cached data
    await queryClient.refetchQueries();
  }, []);

  return (
    <AuthProvider>
      <SecurityProvider>
        <LoadingProvider>
          <AccessibilityProvider>
            <ToastProvider>
              <RealtimeDataProvider>
                <TooltipProvider>
                  <SidebarProvider>
                    <div className="min-h-screen flex w-full bg-background">
                      <CommoditySidebar 
                        activeGroup={activeGroup}
                        onGroupSelect={setActiveGroup}
                        commodityCounts={commodityCounts}
                      />
                      <main className="flex-1 overflow-hidden">
                        <PullToRefresh onRefresh={handleRefresh}>
                          <Routes>
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/auth" element={<Auth />} />
                            <Route path="/reset-password" element={<ResetPassword />} />
                            <Route path="/portfolio" element={<Portfolio />} />
                            <Route path="/market-screener" element={<MarketScreener />} />
                            <Route path="/economic-calendar" element={<EconomicCalendar />} />
                            <Route path="/trading-community" element={<TradingCommunity />} />
                            <Route path="/learning-hub" element={<LearningHub />} />
                            <Route path="/expert-insights" element={<ExpertInsights />} />
                            <Route path="/market-sentiment" element={<MarketSentiment />} />
                            <Route path="/risk-calculator" element={<RiskCalculator />} />
                            <Route path="/market-correlation" element={<MarketCorrelation />} />
                            <Route path="/price-comparison" element={<PriceComparison />} />
                            <Route path="/watchlists" element={<Watchlists />} />
                            <Route path="/favorites" element={<Favorites />} />
                            <Route path="/recent-activity" element={<RecentActivity />} />
                            <Route path="/market-status" element={<MarketStatus />} />
                            <Route path="/api-comparison" element={<APIComparison />} />
                            <Route path="/billing" element={<Billing />} />
                            <Route path="/news-settings" element={<NewsSettings />} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </PullToRefresh>
                      </main>
                    </div>
                    <OfflineIndicator />
                  </SidebarProvider>
                </TooltipProvider>
              </RealtimeDataProvider>
            </ToastProvider>
          </AccessibilityProvider>
        </LoadingProvider>
      </SecurityProvider>
    </AuthProvider>
  );
}

export default App;