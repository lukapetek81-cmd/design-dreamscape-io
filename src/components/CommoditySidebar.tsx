
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LayoutGrid } from "lucide-react";

const COMMODITY_GROUPS = [
  { id: "energy", label: "Energy" },
  { id: "metals", label: "Metals" },
  { id: "grains", label: "Grains" },
];

interface CommoditySidebarProps {
  activeGroup: string;
  onGroupSelect: (group: string) => void;
}

const CommoditySidebar = ({ activeGroup, onGroupSelect }: CommoditySidebarProps) => {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Commodity Groups</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {COMMODITY_GROUPS.map((group) => (
                <SidebarMenuItem key={group.id}>
                  <SidebarMenuButton
                    isActive={activeGroup === group.id}
                    onClick={() => onGroupSelect(group.id)}
                  >
                    <LayoutGrid />
                    <span>{group.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
};

export default CommoditySidebar;
