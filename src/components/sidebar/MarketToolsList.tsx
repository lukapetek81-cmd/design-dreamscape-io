import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { MARKET_TOOLS, COMMUNITY_TOOLS, ACTIVITY_TOOLS } from "./constants";

const MarketToolsList = () => {
  const { setOpenMobile } = useSidebar();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleNavigate = (path: string) => {
    navigate(path);
    // Auto-close mobile sidebar after navigation
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const renderToolButton = (tool: any) => {
    const Icon = tool.icon;
    
    return (
      <div 
        key={tool.id}
        className={`rounded-lg ${tool.color} border cursor-pointer transition-all duration-200 ${
          isMobile 
            ? 'p-6 min-h-[72px] active:scale-95 touch-manipulation mx-2' 
            : 'p-3'
        }`}
        onClick={() => handleNavigate(tool.path)}
      >
        <div className="flex justify-between items-center">
          <span className={`font-semibold uppercase tracking-wider ${isMobile ? 'text-sm' : 'text-xs'}`}>
            {tool.label}
          </span>
          <div className="flex items-center gap-1">
            <Icon className="w-4 h-4" style={{ color: tool.color.includes('text-') ? undefined : 'currentColor' }} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <SidebarGroup className="mt-8">
        <SidebarGroupLabel className={`font-bold text-muted-foreground uppercase tracking-wider ${isMobile ? 'text-sm px-6 py-4' : 'text-xs px-4 py-3'}`}>
          Market Tools
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <div className={`space-y-4 ${isMobile ? 'px-6 py-3' : 'px-4 py-3'}`}>
            {MARKET_TOOLS.map(renderToolButton)}
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
      
      <SidebarGroup className="mt-8">
        <SidebarGroupLabel className={`font-bold text-muted-foreground uppercase tracking-wider ${isMobile ? 'text-sm px-6 py-4' : 'text-xs px-4 py-3'}`}>
          Community & Learning
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <div className={`space-y-4 ${isMobile ? 'px-6 py-3' : 'px-4 py-3'}`}>
            {COMMUNITY_TOOLS.map(renderToolButton)}
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarGroup className="mt-8">
        <SidebarGroupLabel className={`font-bold text-muted-foreground uppercase tracking-wider ${isMobile ? 'text-sm px-6 py-4' : 'text-xs px-4 py-3'}`}>
          Activity & Tracking
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <div className={`space-y-4 ${isMobile ? 'px-6 py-3' : 'px-4 py-3'}`}>
            {ACTIVITY_TOOLS.map(renderToolButton)}
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
};

export default MarketToolsList;