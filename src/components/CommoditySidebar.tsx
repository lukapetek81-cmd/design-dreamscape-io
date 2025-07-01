
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
import { Zap, Coins, Wheat, TrendingUp, Activity, BarChart3, Beef, Coffee, Package } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
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
  { id: "energy", label: "Energy", icon: Zap, color: "text-orange-500" },
  { id: "metals", label: "Metals", icon: Coins, color: "text-yellow-500" },
  { id: "grains", label: "Grains", icon: Wheat, color: "text-green-500" },
  { id: "livestock", label: "Livestock", icon: Beef, color: "text-red-500" },
  { id: "softs", label: "Softs", icon: Coffee, color: "text-brown-500" },
  { id: "other", label: "Other", icon: Package, color: "text-gray-500" },
];

interface CommoditySidebarProps {
  activeGroup: string;
  onGroupSelect: (group: string) => void;
  commodityCounts: CommodityCounts;
}

const CommoditySidebar = ({ activeGroup, onGroupSelect, commodityCounts }: CommoditySidebarProps) => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const getGroupCount = (groupId: string) => {
    return commodityCounts[groupId as keyof CommodityCounts] || 0;
  };

  const totalCommodities = Object.values(commodityCounts).reduce((sum, count) => sum + count, 0);

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
          <SidebarGroupLabel className={`text-2xs sm:text-xs font-bold text-muted-foreground px-3 sm:px-4 py-2 sm:py-3 uppercase tracking-widest transition-all duration-300 ${
            collapsed ? 'text-center' : ''
          }`}>
            {collapsed ? 'Groups' : 'Commodity Groups'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 sm:space-y-2">
              {COMMODITY_GROUPS.map((group) => {
                const Icon = group.icon;
                const isActive = activeGroup === group.id;
                const count = getGroupCount(group.id);
                
                return (
                  <SidebarMenuItem key={group.id}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => onGroupSelect(group.id)}
                      className={`relative group transition-all duration-300 rounded-xl mx-1 sm:mx-2 touch-manipulation active:scale-95 ${
                        isActive 
                          ? 'bg-gradient-to-r from-primary/15 to-accent/10 text-primary border-l-4 border-primary shadow-soft scale-105' 
                          : 'hover:bg-gradient-to-r hover:from-muted/50 hover:to-muted/30 hover:translate-x-1 hover:shadow-soft hover:scale-105'
                      } ${collapsed ? 'justify-center px-2' : ''}`}
                    >
                      <div className={`flex items-center gap-2 sm:gap-3 ${collapsed ? 'flex-col' : ''}`}>
                        <Icon className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 ${
                          isActive ? 'text-primary' : group.color
                        } ${isActive ? 'animate-pulse' : ''}`} />
                        {!collapsed && (
                          <>
                            <span className={`font-semibold text-xs sm:text-sm transition-colors ${
                              isActive ? 'text-primary' : 'text-foreground'
                            }`}>
                              {group.label}
                            </span>
                            <span className={`ml-auto text-2xs sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full transition-colors ${
                              isActive 
                                ? 'bg-primary/20 text-primary' 
                                : 'bg-muted/50 text-muted-foreground'
                            }`}>
                              {count}
                            </span>
                          </>
                        )}
                        {collapsed && (
                          <span className="text-2xs text-muted-foreground">{count}</span>
                        )}
                      </div>
                      {isActive && !collapsed && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-pulse" />
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
              <div className={`p-2 sm:p-3 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/20 border border-purple-200 dark:border-purple-800 hover:scale-105 transition-transform duration-200 cursor-pointer ${
                collapsed ? 'text-center' : ''
              }`}>
                <div className={`flex ${collapsed ? 'flex-col items-center space-y-1' : 'justify-between items-center'}`}>
                  {collapsed ? (
                    <>
                      <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-xs font-bold text-purple-900 dark:text-purple-100 number-display">{totalCommodities}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-2xs sm:text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Total Markets</span>
                      <span className="text-xs sm:text-sm font-bold text-purple-900 dark:text-purple-100 number-display">{totalCommodities}</span>
                    </>
                  )}
                </div>
              </div>
              
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
