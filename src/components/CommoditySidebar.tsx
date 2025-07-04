import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Zap, Coins, Wheat, TrendingUp, Beef, Coffee, Package, Newspaper } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect } from "react";
import UpgradeBox from "./UpgradeBox";

interface CommodityCounts {
  energy: number;
  metals: number;
  grains: number;
  livestock: number;
  softs: number;
  other: number;
}

const COMMODITY_GROUPS = [
  { id: "energy", label: "Energy", icon: Zap, color: "text-orange-500", shortcut: "1", description: "Oil, Gas & Power" },
  { id: "metals", label: "Metals", icon: Coins, color: "text-yellow-500", shortcut: "2", description: "Gold, Silver & More" },
  { id: "grains", label: "Grains", icon: Wheat, color: "text-green-500", shortcut: "3", description: "Wheat, Corn & Rice" },
  { id: "livestock", label: "Livestock", icon: Beef, color: "text-red-500", shortcut: "4", description: "Cattle & Pork" },
  { id: "softs", label: "Softs", icon: Coffee, color: "text-amber-600", shortcut: "5", description: "Coffee, Sugar & Cotton" },
  { id: "other", label: "Other", icon: Package, color: "text-gray-500", shortcut: "6", description: "Misc Commodities" },
];

interface CommoditySidebarProps {
  activeGroup: string;
  onGroupSelect: (group: string) => void;
  commodityCounts: CommodityCounts;
}

const CommoditySidebar = ({ activeGroup, onGroupSelect, commodityCounts }: CommoditySidebarProps) => {
  const { state, setOpenMobile } = useSidebar();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const collapsed = state === "collapsed";

  // Check if user has premium subscription (real-time access)
  const isPremiumUser = profile?.subscription_active && 
    (profile?.subscription_tier === 'premium' || profile?.subscription_tier === 'pro');

  const getGroupCount = (groupId: string) => {
    return commodityCounts[groupId as keyof CommodityCounts] || 0;
  };

  const handleGroupSelect = (groupId: string) => {
    onGroupSelect(groupId);
    // Auto-close mobile sidebar after selection for better UX
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    // Auto-close mobile sidebar after navigation
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  // Add keyboard shortcuts for mobile users to quickly switch between groups
  useEffect(() => {
    if (!isMobile) return; // Only enable shortcuts on mobile
    
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger if Alt key is pressed and no input is focused
      if (e.altKey && !e.ctrlKey && !e.metaKey && document.activeElement?.tagName !== 'INPUT') {
        const shortcut = e.key;
        const group = COMMODITY_GROUPS.find(g => g.shortcut === shortcut);
        if (group && group.id !== activeGroup) {
          e.preventDefault();
          handleGroupSelect(group.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [activeGroup, isMobile, handleGroupSelect]);

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-3 p-4">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-bold text-base">Markets Hub</h2>
              <p className="text-xs text-muted-foreground">Trading Platform</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className={`text-xs font-bold text-muted-foreground px-4 py-3 uppercase tracking-wider ${
            isMobile ? 'flex items-center justify-between' : ''
          }`}>
            Commodity Groups
            {isMobile && !collapsed && (
              <span className="text-xs font-normal normal-case text-muted-foreground/70">
                Alt + 1-6
              </span>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {COMMODITY_GROUPS.map((group) => {
                const Icon = group.icon;
                const isActive = activeGroup === group.id;
                const count = getGroupCount(group.id);
                
                return (
                  <SidebarMenuItem key={group.id}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => handleGroupSelect(group.id)}
                      className={`flex items-center gap-3 rounded-lg transition-all duration-200 ${
                        isMobile 
                          ? 'px-4 py-4 min-h-[56px] active:scale-95 touch-manipulation' 
                          : 'px-3 py-2'
                      }`}
                    >
                       <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${group.color}`}>
                         <Icon className="w-4 h-4" />
                       </div>
                       {!collapsed && (
                         <>
                           <div className="flex-1 min-w-0">
                             <div className="flex items-center gap-2">
                               <span className="font-medium">{group.label}</span>
                               {isMobile && (
                                 <span className="text-xs text-muted-foreground/60 font-mono bg-muted/30 px-1 py-0.5 rounded">
                                   Alt+{group.shortcut}
                                 </span>
                               )}
                             </div>
                             {isMobile && (
                               <p className="text-xs text-muted-foreground truncate">
                                 {group.description}
                               </p>
                             )}
                           </div>
                           <span className="text-xs bg-muted px-2 py-1 rounded-full">
                             {count}
                           </span>
                         </>
                       )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className="text-xs font-bold text-muted-foreground px-4 py-3 uppercase tracking-wider">
            Market Statistics
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-4 py-3 space-y-4">
              <div 
                className={`rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 cursor-pointer transition-all duration-200 ${
                  isMobile 
                    ? 'p-4 min-h-[56px] active:scale-95 touch-manipulation' 
                    : 'p-3'
                }`}
                onClick={() => handleNavigate('/live-feed')}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Market News</span>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-bold text-blue-900 dark:text-blue-100">Live Feed</span>
                  </div>
                </div>
              </div>
              
              {!isPremiumUser && (
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">Update Interval</span>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-bold text-green-900 dark:text-green-100">15 min</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <div className="mt-8">
          <UpgradeBox />
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

export default CommoditySidebar;