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
import Favorites from '@/pages/Favorites';
import Billing from '@/pages/Billing';
import NotFound from '@/pages/NotFound';

const queryClient = createOptimizedQueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <RealtimeDataProvider>
            <TooltipProvider>
              <SEOHead />
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/billing" element={<Billing />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </TooltipProvider>
          </RealtimeDataProvider>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;