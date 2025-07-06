import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RealtimeDataProvider } from "@/contexts/RealtimeDataContext";
import Landing from "./pages/Landing";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <RealtimeDataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
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
              <Route path="/market-status" element={<MarketStatus />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </RealtimeDataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;