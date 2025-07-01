
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
import { Zap, Coins, Wheat, TrendingUp } from "lucide-react";

const COMMODITY_GROUPS = [
  { id: "energy", label: "Energy", icon: Zap, color: "text-orange-500" },
  { id: "metals", label: "Metals", icon: Coins, color: "text-yellow-500" },
  { id: "grains", label: "Grains", icon: Wheat, color: "text-green-500" },
];

interface CommoditySidebarProps {
  activeGroup: string;
  onGroupSelect: (group: string) => void;
}

const CommoditySidebar = ({ activeGroup, onGroupSelect }: CommoditySidebarProps) => {
  return (
    <Sidebar className="border-r bg-gradient-to-b from-background to-muted/10 shadow-soft">
      <SidebarHeader className="border-b bg-gradient-to-r from-card/80 to-muted/20 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-4 py-6">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-medium">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-base text-gradient">Markets Hub</h2>
            <p className="text-xs text-muted-foreground font-medium tracking-wide">Trading Platform</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-bold text-muted-foreground px-4 py-3 uppercase tracking-widest">
            Commodity Groups
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {COMMODITY_GROUPS.map((group) => {
                const Icon = group.icon;
                const isActive = activeGroup === group.id;
                
                return (
                  <SidebarMenuItem key={group.id}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => onGroupSelect(group.id)}
                      className={`relative group transition-all duration-300 rounded-xl mx-2 ${
                        isActive 
                          ? 'bg-gradient-to-r from-primary/15 to-accent/10 text-primary border-l-4 border-primary shadow-soft' 
                          : 'hover:bg-gradient-to-r hover:from-muted/50 hover:to-muted/30 hover:translate-x-1 hover:shadow-soft'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : group.color} transition-colors`} />
                      <span className={`font-semibold ${isActive ? 'text-primary' : 'text-foreground'} transition-colors`}>
                        {group.label}
                      </span>
                      {isActive && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full animate-pulse" />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className="text-xs font-bold text-muted-foreground px-4 py-3 uppercase tracking-widest">
            Market Statistics
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-4 py-4 space-y-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Total Volume</span>
                  <span className="text-sm font-bold text-blue-900 dark:text-blue-100 number-display">$45.2B</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-100/50 dark:from-green-950/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">Active Markets</span>
                  <span className="text-sm font-bold text-green-900 dark:text-green-100 number-display">142</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/20 border border-purple-200 dark:border-purple-800">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Last Update</span>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-bold text-purple-900 dark:text-purple-100 number-display">2s ago</span>
                  </div>
                </div>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default CommoditySidebar;
