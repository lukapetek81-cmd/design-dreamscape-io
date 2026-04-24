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
import NotFound from '@/pages/NotFound';
import NewsSettings from '@/pages/NewsSettings';
import ResetPassword from '@/pages/ResetPassword';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfService from '@/pages/TermsOfService';
import Watchlists from '@/pages/Watchlists';
import DeleteAccount from '@/pages/DeleteAccount';

const App = () => {
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
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/watchlists" element={<Watchlists />} />
                <Route path="/news-settings" element={<NewsSettings />} />
                <Route path="/delete-account" element={<DeleteAccount />} />
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
