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
  { id: "softs", label: "Softs", icon: Coffee, color: "text-amber-600" },
  { id: "other", label: "Other", icon: Package, color: "text-gray-500" },
];

interface CommoditySidebarProps {
  activeGroup: string;
  onGroupSelect: (group: string) => void;
  commodityCounts: CommodityCounts;
}

const CommoditySidebar = ({ activeGroup, onGroupSelect, commodityCounts }: CommoditySidebarProps) => {
  const { state } = useSidebar();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const collapsed = state === "collapsed";

  // Check if user has premium subscription (real-time access)
  const isPremiumUser = profile?.subscription_active && 
    (profile?.subscription_tier === 'premium' || profile?.subscription_tier === 'pro');

  const getGroupCount = (groupId: string) => {
    return commodityCounts[groupId as keyof CommodityCounts] || 0;
  };

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
          <SidebarGroupLabel className="text-xs font-bold text-muted-foreground px-4 py-3 uppercase tracking-wider">
            Commodity Groups
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
                      onClick={() => onGroupSelect(group.id)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg"
                    >
                      <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${group.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      {!collapsed && (
                        <>
                          <span className="font-medium">{group.label}</span>
                          <span className="ml-auto text-xs bg-muted px-2 py-1 rounded-full">
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
                className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 cursor-pointer"
                onClick={() => navigate('/live-feed')}
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