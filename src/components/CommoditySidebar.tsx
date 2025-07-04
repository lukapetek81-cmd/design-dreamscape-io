
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
import { Zap, Coins, Wheat, TrendingUp, Activity, BarChart3, Beef, Coffee, Package, Newspaper, ChevronRight, Grid } from "lucide-react";
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

  const totalCommodities = Object.values(commodityCounts).reduce((sum, count) => sum + count, 0);

  // Add keyboard shortcuts for quick group switching
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger if no input is focused and Alt key is pressed
      if (e.altKey && !e.ctrlKey && !e.metaKey && document.activeElement?.tagName !== 'INPUT') {
        const shortcut = e.key;
        const group = COMMODITY_GROUPS.find(g => g.shortcut === shortcut);
        if (group && group.id !== activeGroup) {
          e.preventDefault();
          onGroupSelect(group.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [activeGroup, onGroupSelect]);

  return (
    <Sidebar className="border-r bg-gradient-to-b from-background to-muted/10 shadow-soft transition-all duration-300">
      <SidebarHeader className="border-b bg-gradient-to-r from-card/80 to-muted/20 backdrop-blur-sm">
        <div className={`flex items-center gap-3 px-3 sm:px-4 py-4 sm:py-6 transition-all duration-300 ${
          collapsed ? 'justify-center' : ''
        }`}>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-medium hover:scale-110 transition-transform duration-300">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h2 className="font-bold text-sm sm:text-base text-gradient">Markets Hub</h2>
              <p className="text-2xs sm:text-xs text-muted-foreground font-medium tracking-wide">Trading Platform</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-1 sm:p-2">
        <SidebarGroup>
          <SidebarGroupLabel className={`text-2xs sm:text-xs font-bold text-muted-foreground px-3 sm:px-4 py-2 sm:py-3 uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${
            collapsed ? 'justify-center' : ''
          }`}>
            <Grid className="w-3 h-3" />
            {collapsed ? 'Groups' : 'Commodity Groups'}
            {!collapsed && (
              <span className="text-xs font-normal normal-case text-muted-foreground/70">
                (Alt + 1-6)
              </span>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 sm:space-y-2"
              aria-label="Navigate between commodity groups using Alt + number keys"
            >
              {COMMODITY_GROUPS.map((group) => {
                const Icon = group.icon;
                const isActive = activeGroup === group.id;
                const count = getGroupCount(group.id);
                
                return (
                  <SidebarMenuItem key={group.id}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => {
                        onGroupSelect(group.id);
                        // Close mobile sidebar after selection for better UX
                        if (isMobile) {
                          setOpenMobile(false);
                        }
                      }}
                      className={`relative group transition-all duration-300 rounded-xl mx-1 sm:mx-2 touch-manipulation active:scale-95 min-h-[52px] flex items-center overflow-hidden ${
                        isActive 
                          ? 'bg-gradient-to-r from-primary/20 to-accent/15 text-primary border-2 border-primary/30 shadow-lg scale-105 ring-2 ring-primary/20' 
                          : 'hover:bg-gradient-to-r hover:from-muted/60 hover:to-muted/40 hover:translate-x-1 hover:shadow-lg hover:scale-105 border-2 border-transparent hover:border-border/50'
                      } ${collapsed ? 'justify-center px-2' : 'px-3'}`}
                      title={`${group.label} - ${group.description} (Alt+${group.shortcut})`}
                      aria-label={`Switch to ${group.label} commodities. Keyboard shortcut: Alt+${group.shortcut}`}
                    >
                      <div className={`flex items-center gap-2 sm:gap-3 w-full ${collapsed ? 'flex-col' : ''}`}>
                        <div className={`relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg transition-all duration-300 ${
                          isActive 
                            ? 'bg-primary/20 text-primary shadow-inner' 
                            : `bg-gradient-to-br from-muted/40 to-muted/60 ${group.color} group-hover:scale-110`
                        }`}>
                          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 ${
                            isActive ? 'text-primary drop-shadow-sm' : 'group-hover:scale-110'
                          }`} />
                          {!collapsed && !isActive && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-muted/80 text-muted-foreground rounded-full flex items-center justify-center text-xs font-bold">
                              {group.shortcut}
                            </div>
                          )}
                        </div>
                        {!collapsed && (
                          <>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`font-bold text-sm sm:text-base transition-colors truncate ${
                                  isActive ? 'text-primary' : 'text-foreground'
                                }`}>
                                  {group.label}
                                </span>
                                {isActive && (
                                  <ChevronRight className="w-3 h-3 text-primary/70 animate-pulse" />
                                )}
                              </div>
                              <p className={`text-xs transition-colors truncate ${
                                isActive ? 'text-primary/70' : 'text-muted-foreground'
                              }`}>
                                {group.description}
                              </p>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                              <span className={`text-xs sm:text-sm px-2 py-1 rounded-full font-bold transition-all duration-300 ${
                                isActive 
                                  ? 'bg-primary/30 text-primary shadow-inner' 
                                  : 'bg-muted/60 text-muted-foreground group-hover:bg-muted/80'
                              }`}>
                                {count}
                              </span>
                              <span className="text-xs text-muted-foreground/60 font-mono">
                                Alt+{group.shortcut}
                              </span>
                            </div>
                          </>
                        )}
                        {collapsed && (
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xs text-muted-foreground font-bold">{count}</span>
                            <span className="text-xs text-muted-foreground/60 font-mono">{group.shortcut}</span>
                          </div>
                        )}
                      </div>
                      {isActive && !collapsed && (
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl" />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup className="mt-6 sm:mt-8">
          <SidebarGroupLabel className={`text-2xs sm:text-xs font-bold text-muted-foreground px-3 sm:px-4 py-2 sm:py-3 uppercase tracking-widest ${
            collapsed ? 'text-center' : ''
          }`}>
            {collapsed ? 'Stats' : 'Market Statistics'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className={`px-2 sm:px-4 py-3 sm:py-4 space-y-3 sm:space-y-4 ${collapsed ? 'px-1' : ''}`}>
              <div 
                className={`p-2 sm:p-3 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/20 border border-blue-200 dark:border-blue-800 hover:scale-105 transition-transform duration-200 cursor-pointer ${
                  collapsed ? 'text-center' : ''
                }`}
                onClick={() => {
                  navigate('/live-feed');
                  if (isMobile) {
                    setOpenMobile(false);
                  }
                }}
              >
                <div className={`flex ${collapsed ? 'flex-col items-center space-y-1' : 'justify-between items-center'}`}>
                  {collapsed ? (
                    <>
                      <Newspaper className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-bold text-blue-900 dark:text-blue-100 number-display">Live</span>
                    </>
                  ) : (
                    <>
                      <span className="text-2xs sm:text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Market News</span>
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-xs sm:text-sm font-bold text-blue-900 dark:text-blue-100 number-display">Live Feed</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {!isPremiumUser && (
                <div className={`p-2 sm:p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-100/50 dark:from-green-950/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 hover:scale-105 transition-transform duration-200 cursor-pointer ${
                  collapsed ? 'text-center' : ''
                }`}>
                  <div className={`flex ${collapsed ? 'flex-col items-center space-y-1' : 'justify-between items-center'}`}>
                    {collapsed ? (
                      <>
                        <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-bold text-green-900 dark:text-green-100 number-display">15m</span>
                      </>
                    ) : (
                      <>
                        <span className="text-2xs sm:text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">Update Interval</span>
                        <div className="flex items-center gap-1">
                          <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs sm:text-sm font-bold text-green-900 dark:text-green-100 number-display">15 min</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Upgrade Box - positioned after stats section */}
        <div className="mt-6 sm:mt-8">
          <UpgradeBox />
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

export default CommoditySidebar;
