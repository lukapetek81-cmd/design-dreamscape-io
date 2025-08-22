import React from 'react';
import { DashboardSkeleton } from "@/components/loading/LoadingSkeletons";

// Lightweight app shell for faster initial render
const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    // Defer hydration slightly to allow critical CSS to load
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardSkeleton />
      </div>
    );
  }

  return <>{children}</>;
};

export default AppShell;