import React from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import CommoditySidebar from '@/components/CommoditySidebar';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { APIPriceComparison } from '@/components/APIPriceComparison';
import UserProfile from '@/components/UserProfile';

const APIComparison = () => {
  const [activeGroup, setActiveGroup] = React.useState("energy");
  const isMobile = useIsMobile();
  const { profile } = useAuth();

  const commodityCounts = {
    energy: 0,
    metals: 0,
    grains: 0,
    livestock: 0,
    softs: 0,
    other: 0
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-muted/20">
        <CommoditySidebar 
          activeGroup={activeGroup} 
          onGroupSelect={setActiveGroup}
          commodityCounts={commodityCounts}
        />
        
        <SidebarTrigger className="fixed left-4 bottom-20 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl active:scale-95 touch-manipulation transition-all duration-200 flex items-center justify-center md:hidden">
          <Menu className="w-6 h-6" />
        </SidebarTrigger>
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-soft">
            <div className="container flex h-16 sm:h-20 items-center justify-between px-3 sm:px-4 md:px-6">
              <div className="flex items-center gap-4">
                <h1 className="text-xl sm:text-2xl font-bold">Data Sources & Exchange Feeds</h1>
              </div>
              <UserProfile />
            </div>
          </header>
          
          {/* Main Content */}
          <main className="flex-1 container px-3 sm:px-4 md:px-6 py-6 space-y-8">
            <div className="max-w-6xl mx-auto space-y-8">
              <APIPriceComparison />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default APIComparison;