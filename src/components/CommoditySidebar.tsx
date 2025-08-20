import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar";
import { TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import UpgradeBox from "./UpgradeBox";
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
  const { profile } = useAuth();
  const isMobile = useIsMobile();
  const collapsed = state === "collapsed";
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Reset scroll position when sidebar opens
  React.useEffect(() => {
    if (openMobile && contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [openMobile]);

  // Memoize premium status check
  const isPremiumUser = React.useMemo(() => 
    profile?.subscription_active && 
    (profile?.subscription_tier === 'premium' || profile?.subscription_tier === 'pro'),
    [profile?.subscription_active, profile?.subscription_tier]
  );

  return (
    <Sidebar className="border-r bg-background">
      <SidebarHeader className="border-b bg-background">
        <div className={`flex items-center gap-3 ${isMobile ? 'p-6' : 'p-4'}`}>
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center overflow-hidden">
            <img 
              src="/lovable-uploads/9c1e04f7-a6bb-4b14-bb88-3b5fdc39b16a" 
              alt="Commodity Hub Logo" 
              className="w-6 h-6 object-contain"
              onError={(e) => {
                // Fallback to TrendingUp icon if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextSibling && ((target.nextSibling as HTMLElement).style.display = 'block');
              }}
            />
            <TrendingUp className="w-4 h-4 text-white hidden" />
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
        
        {/* Upgrade Box Section - Always before footer */}
        <div className={`mt-8 mb-4 ${isMobile ? 'px-4' : 'px-2'}`}>
          <UpgradeBox />
        </div>
      </SidebarContent>

      {/* Theme Switcher - Always at bottom */}
      <SidebarFooter className={`${isMobile ? 'px-4 py-4 bg-background' : 'p-2'} border-t`}>
        <ThemeSwitcher />
      </SidebarFooter>
    </Sidebar>
  );
});

export default CommoditySidebar;