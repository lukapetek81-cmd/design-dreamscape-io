import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useHaptics } from "@/hooks/useHaptics";
import { COMMODITY_GROUPS } from "./constants";
import { CommodityCounts } from "./types";

interface CommodityGroupsListProps {
  activeGroup: string;
  onGroupSelect: (group: string) => void;
  commodityCounts: CommodityCounts;
}

const CommodityGroupsList = ({ activeGroup, onGroupSelect, commodityCounts }: CommodityGroupsListProps) => {
  const { state, setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();
  const { vibrateSelection } = useHaptics();
  const collapsed = state === "collapsed";

  const getGroupCount = (groupId: string) => {
    return commodityCounts[groupId as keyof CommodityCounts] || 0;
  };

  const handleGroupSelect = (groupId: string) => {
    // Haptic feedback for mobile selection
    if (isMobile) {
      vibrateSelection();
    }
    
    onGroupSelect(groupId);
    // Auto-close mobile sidebar after selection for better UX
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel className={`font-bold text-muted-foreground uppercase tracking-wider ${isMobile ? 'text-sm px-4 py-4' : 'text-xs px-2 py-3'}`}>
        Commodity Groups
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className={`space-y-2 ${isMobile ? 'px-4' : 'px-2'}`}>
          {COMMODITY_GROUPS.map((group) => {
            const Icon = group.icon;
            const isActive = activeGroup === group.id;
            const count = getGroupCount(group.id);
            
            return (
              <SidebarMenuItem key={group.id}>
                <SidebarMenuButton
                  isActive={isActive}
                  onClick={() => handleGroupSelect(group.id)}
                  className={`flex items-center gap-3 rounded-lg transition-all duration-200 focus-ring ${
                    isMobile 
                      ? 'px-6 py-6 min-h-[72px] active:scale-95 touch-manipulation text-base' 
                      : 'px-3 py-2'
                  }`}
                  aria-label={`View ${group.label} commodities (${count} available)`}
                  aria-pressed={isActive}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${group.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {!collapsed && (
                    <>
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-foreground">{group.label}</span>
                      </div>
                      <span 
                        className="text-xs bg-muted px-2 py-1 rounded-full font-semibold"
                        aria-label={`${count} commodities in this category`}
                      >
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
  );
};

export default CommodityGroupsList;