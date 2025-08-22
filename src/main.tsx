import React from 'react';
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/smooth-scroll.css'

// Initialize critical resource preloading immediately
import { initializeResourceHints } from '@/utils/preloadCriticalResources';
initializeResourceHints();

// Preload critical modules for faster startup
const preloadModules = () => {
  // Preload the App component
  import('./App.tsx');
  
  // Preload most critical UI components
  import('@/components/ui/toaster');
  import('@/components/ui/tooltip');
  
  // Preload auth context early since it's needed for most pages
  import('@/contexts/AuthContext');
  
  // Preload query client for data fetching
  import('@/lib/queryClient');
};

// Start preloading immediately - don't wait for user interaction
if (typeof window !== 'undefined') {
  // Use requestIdleCallback if available, otherwise setTimeout
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(preloadModules);
  } else {
    setTimeout(preloadModules, 0);
  }
}

// Lazy load the App component for better initial bundle size
const App = React.lazy(() => import('./App.tsx'));

const LoadingFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
      <div className="text-sm text-muted-foreground">Loading Commodity Hub...</div>
    </div>
  </div>
);

const Root = () => (
  <React.Suspense fallback={<LoadingFallback />}>
    <App />
  </React.Suspense>
);

// Use concurrent features for better performance
const root = createRoot(document.getElementById("root")!);
root.render(<Root />);
