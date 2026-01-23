import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar";
import { TrendingUp } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import AdBanner from "./AdBanner";
import CommodityGroupsList from "./sidebar/CommodityGroupsList";
import MarketToolsList from "./sidebar/MarketToolsList";
import ThemeSwitcher from "./sidebar/ThemeSwitcher";
import { CommodityCounts } from "./sidebar/types";

interface CommoditySidebarProps {
  activeGroup: string;
  onGroupSelect: (group: string) => void;
  commodityCounts: CommodityCounts;
}

const CommoditySidebar = React.memo(({ activeGroup, onGroupSelect, commodityCounts }: CommoditySidebarProps) => {
  const { state, openMobile } = useSidebar();
  const isMobile = useIsMobile();
  const collapsed = state === "collapsed";
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Reset scroll position when sidebar opens
  React.useEffect(() => {
    if (openMobile && contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [openMobile]);

  return (
    <Sidebar className="border-r bg-background">
      <SidebarHeader className="border-b bg-background">
        <div className={`flex items-center gap-3 ${isMobile ? 'p-6' : 'p-4'}`}>
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-bold text-base">Commodity Hub</h2>
              <p className="text-xs text-muted-foreground">Trading Platform</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent 
        ref={contentRef}
        className={`${isMobile ? 'bg-background' : ''} overflow-y-auto custom-scrollbar flex-1 min-h-0`}
        style={{ 
          maxHeight: isMobile ? 'calc(100vh - 160px)' : 'calc(100vh - 120px)',
          scrollBehavior: 'smooth'
        }}
      >
        {/* Commodity Groups Section - Always at top */}
        <CommodityGroupsList 
          activeGroup={activeGroup}
          onGroupSelect={onGroupSelect}
          commodityCounts={commodityCounts}
        />
        
        {/* Market Tools Section - Always in middle */}
        <MarketToolsList />
        
        {/* Ad Banner Section - Freemium monetization */}
        <div className={`mt-8 mb-4 ${isMobile ? 'px-4' : 'px-2'}`}>
          <AdBanner variant="sidebar" />
        </div>
      </SidebarContent>

      {/* Theme Switcher - Always at bottom */}
      <SidebarFooter className={`${isMobile ? 'px-4 py-2 bg-background' : 'p-2'} border-t flex-shrink-0`}>
        <ThemeSwitcher />
      </SidebarFooter>
    </Sidebar>
  );
});

export default CommoditySidebar;