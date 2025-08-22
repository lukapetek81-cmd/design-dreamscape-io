import { Suspense } from 'react';
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { createOptimizedQueryClient, queryClientConfigs } from "@/lib/queryClient";
import { LazyRoutes } from "@/utils/bundleSplitting";
import { DashboardSkeleton } from "@/components/loading/LoadingSkeletons";
import AppShell from "@/components/AppShell";
import SEOHead from "@/components/SEOHead";
import { RealtimeDataProvider } from "@/contexts/RealtimeDataContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";

// Create optimized query client
const queryClient = createOptimizedQueryClient(queryClientConfigs.standard);

const App = () => {
  return (
    <AppShell>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <BrowserRouter>
              <ErrorBoundary fallback={
                <div role="alert" className="min-h-screen flex items-center justify-center p-4">
                  <div className="text-center">
                    <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
                    <p className="text-muted-foreground">Please refresh the page to continue.</p>
                  </div>
                </div>
              }>
                <RealtimeDataProvider>
                  <TooltipProvider>
                    <SEOHead />
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
                    <Toaster />
                  </TooltipProvider>
                </RealtimeDataProvider>
              </ErrorBoundary>
            </BrowserRouter>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </AppShell>
  );
};

export default App;