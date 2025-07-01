
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
import { Zap, Coins, Wheat } from "lucide-react";

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
    <Sidebar className="border-r bg-gradient-to-b from-background to-muted/20">
      <SidebarHeader className="border-b bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 px-2 py-4">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Coins className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">Markets</h2>
            <p className="text-xs text-muted-foreground">Trading Hub</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-2 py-2">
            Commodity Groups
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {COMMODITY_GROUPS.map((group) => {
                const Icon = group.icon;
                const isActive = activeGroup === group.id;
                
                return (
                  <SidebarMenuItem key={group.id}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => onGroupSelect(group.id)}
                      className={`relative group transition-all duration-200 ${
                        isActive 
                          ? 'bg-primary/10 text-primary border-r-2 border-primary' 
                          : 'hover:bg-muted/50 hover:translate-x-1'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : group.color}`} />
                      <span className={`font-medium ${isActive ? 'text-primary' : ''}`}>
                        {group.label}
                      </span>
                      {isActive && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-l-full" />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-2 py-2">
            Market Stats
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-2 py-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Total Volume</span>
                <span className="text-xs font-medium">$45.2B</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Active Markets</span>
                <span className="text-xs font-medium text-green-600">142</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Last Update</span>
                <span className="text-xs font-medium">2 sec ago</span>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default CommoditySidebar;
