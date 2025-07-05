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
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Zap, Coins, Wheat, TrendingUp, Beef, Coffee, Package, Newspaper, Moon, Sun, Monitor, Briefcase, Settings, BarChart3, Star, Filter, Calendar, Calculator, MessageSquare, Lightbulb, GraduationCap, Users } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import UpgradeBox from "./UpgradeBox";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

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
  const { state, setOpenMobile } = useSidebar();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const collapsed = state === "collapsed";
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  // Check if user has premium subscription (real-time access)
  const isPremiumUser = profile?.subscription_active && 
    (profile?.subscription_tier === 'premium' || profile?.subscription_tier === 'pro');

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Default to system preference
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      applyTheme('system');
    }
  }, []);

  const applyTheme = (newTheme: 'light' | 'dark' | 'system') => {
    const root = window.document.documentElement;
    
    if (newTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.remove('light', 'dark');
      root.classList.add(systemTheme);
    } else {
      root.classList.remove('light', 'dark');
      root.classList.add(newTheme);
    }
    
    localStorage.setItem('theme', newTheme);
  };

  const toggleTheme = () => {
    const themes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    
    setTheme(nextTheme);
    applyTheme(nextTheme);
    
    // Auto-close mobile sidebar after theme change
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return Sun;
      case 'dark':
        return Moon;
      default:
        return Monitor;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      default:
        return 'System';
    }
  };

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

  return (
    <Sidebar className="border-r bg-background">
      <SidebarHeader className="border-b bg-background">
        <div className={`flex items-center gap-3 ${isMobile ? 'p-6' : 'p-4'}`}>
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-bold text-base">Commodity Hub</h2>
              <p className="text-xs text-muted-foreground">Trading Platform</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent className={`${isMobile ? 'p-4 bg-background' : 'p-2'}`}>
        <SidebarGroup>
          <SidebarGroupLabel className={`font-bold text-muted-foreground uppercase tracking-wider ${isMobile ? 'text-sm px-6 py-4' : 'text-xs px-4 py-3'}`}>
            Commodity Groups
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className={`space-y-2 ${isMobile ? 'px-2' : ''}`}>
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
                          ? 'px-6 py-6 min-h-[72px] active:scale-95 touch-manipulation text-base' 
                          : 'px-3 py-2'
                      }`}
                    >
                       <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${group.color}`}>
                         <Icon className="w-4 h-4" />
                       </div>
                           {!collapsed && (
                             <>
                               <div className="flex-1 min-w-0">
                                 <span className="font-bold text-foreground">{group.label}</span>
                               </div>
                               <span className="text-xs bg-muted px-2 py-1 rounded-full font-semibold">
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
          <SidebarGroupLabel className={`font-bold text-muted-foreground uppercase tracking-wider ${isMobile ? 'text-sm px-6 py-4' : 'text-xs px-4 py-3'}`}>
            Market Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className={`space-y-4 ${isMobile ? 'px-6 py-3' : 'px-4 py-3'}`}>
              <div 
                className={`rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 cursor-pointer transition-all duration-200 ${
                  isMobile 
                    ? 'p-6 min-h-[72px] active:scale-95 touch-manipulation mx-2' 
                    : 'p-3'
                }`}
                onClick={() => handleNavigate('/portfolio')}
              >
                <div className="flex justify-between items-center">
                  <span className={`font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider ${isMobile ? 'text-sm' : 'text-xs'}`}>Portfolio</span>
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4 text-green-500" />
                  </div>
                </div>
              </div>
              
              <div 
                className={`rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 cursor-pointer transition-all duration-200 ${
                  isMobile 
                    ? 'p-6 min-h-[72px] active:scale-95 touch-manipulation mx-2' 
                    : 'p-4'
                }`}
                onClick={() => handleNavigate('/correlation')}
              >
                <div className="flex justify-between items-center w-full">
                  <span className={`font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider ${isMobile ? 'text-sm' : 'text-xs'}`}>Correlation</span>
                  <div className="flex items-center gap-2 ml-4">
                    <BarChart3 className="w-4 h-4 text-blue-500" />
                  </div>
                </div>
              </div>

              <div 
                className={`rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 cursor-pointer transition-all duration-200 ${
                  isMobile 
                    ? 'p-6 min-h-[72px] active:scale-95 touch-manipulation mx-2' 
                    : 'p-4'
                }`}
                onClick={() => handleNavigate('/watchlists')}
              >
                <div className="flex justify-between items-center w-full">
                  <span className={`font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider ${isMobile ? 'text-sm' : 'text-xs'}`}>Watchlists</span>
                  <div className="flex items-center gap-2 ml-4">
                    <Star className="w-4 h-4 text-purple-500" />
                  </div>
                </div>
              </div>

              <div 
                className={`rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 cursor-pointer transition-all duration-200 ${
                  isMobile 
                    ? 'p-6 min-h-[72px] active:scale-95 touch-manipulation mx-2' 
                    : 'p-4'
                }`}
                onClick={() => handleNavigate('/screener')}
              >
                <div className="flex justify-between items-center w-full">
                  <span className={`font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider ${isMobile ? 'text-sm' : 'text-xs'}`}>Screener</span>
                  <div className="flex items-center gap-2 ml-4">
                    <Filter className="w-4 h-4 text-orange-500" />
                  </div>
                </div>
              </div>

              <div 
                className={`rounded-lg bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800 cursor-pointer transition-all duration-200 ${
                  isMobile 
                    ? 'p-6 min-h-[72px] active:scale-95 touch-manipulation mx-2' 
                    : 'p-4'
                }`}
                onClick={() => handleNavigate('/calendar')}
              >
                <div className="flex justify-between items-center w-full">
                  <span className={`font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider ${isMobile ? 'text-sm' : 'text-xs'}`}>Calendar</span>
                  <div className="flex items-center gap-2 ml-4">
                    <Calendar className="w-4 h-4 text-cyan-500" />
                  </div>
                </div>
              </div>

              <div 
                className={`rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 cursor-pointer transition-all duration-200 ${
                  isMobile 
                    ? 'p-6 min-h-[72px] active:scale-95 touch-manipulation mx-2' 
                    : 'p-4'
                }`}
                onClick={() => handleNavigate('/risk-calculator')}
              >
                <div className="flex justify-between items-center w-full">
                  <span className={`font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider ${isMobile ? 'text-sm' : 'text-xs'}`}>Risk Calculator</span>
                  <div className="flex items-center gap-2 ml-4">
                    <Calculator className="w-4 h-4 text-red-500" />
                  </div>
                </div>
              </div>
              
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className={`font-bold text-muted-foreground uppercase tracking-wider ${isMobile ? 'text-sm px-6 py-4' : 'text-xs px-4 py-3'}`}>
            Community & Learning
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className={`space-y-4 ${isMobile ? 'px-6 py-3' : 'px-4 py-3'}`}>
              <div 
                className={`rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 cursor-pointer transition-all duration-200 ${
                  isMobile 
                    ? 'p-6 min-h-[72px] active:scale-95 touch-manipulation mx-2' 
                    : 'p-4'
                }`}
                onClick={() => handleNavigate('/community')}
              >
                <div className="flex justify-between items-center w-full">
                  <span className={`font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider ${isMobile ? 'text-sm' : 'text-xs'}`}>Community</span>
                  <div className="flex items-center gap-2 ml-4">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                  </div>
                </div>
              </div>

              <div 
                className={`rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 cursor-pointer transition-all duration-200 ${
                  isMobile 
                    ? 'p-6 min-h-[72px] active:scale-95 touch-manipulation mx-2' 
                    : 'p-4'
                }`}
                onClick={() => handleNavigate('/insights')}
              >
                <div className="flex justify-between items-center w-full">
                  <span className={`font-semibold text-yellow-600 dark:text-yellow-400 uppercase tracking-wider ${isMobile ? 'text-sm' : 'text-xs'}`}>Expert Insights</span>
                  <div className="flex items-center gap-2 ml-4">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                  </div>
                </div>
              </div>

              <div 
                className={`rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 cursor-pointer transition-all duration-200 ${
                  isMobile 
                    ? 'p-6 min-h-[72px] active:scale-95 touch-manipulation mx-2' 
                    : 'p-4'
                }`}
                onClick={() => handleNavigate('/learning')}
              >
                <div className="flex justify-between items-center w-full">
                  <span className={`font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider ${isMobile ? 'text-sm' : 'text-xs'}`}>Learning Hub</span>
                  <div className="flex items-center gap-2 ml-4">
                    <GraduationCap className="w-4 h-4 text-emerald-500" />
                  </div>
                </div>
              </div>

              <div 
                className={`rounded-lg bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800 cursor-pointer transition-all duration-200 ${
                  isMobile 
                    ? 'p-6 min-h-[72px] active:scale-95 touch-manipulation mx-2' 
                    : 'p-4'
                }`}
                onClick={() => handleNavigate('/sentiment')}
              >
                <div className="flex justify-between items-center w-full">
                  <span className={`font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider ${isMobile ? 'text-sm' : 'text-xs'}`}>Market Sentiment</span>
                  <div className="flex items-center gap-2 ml-4">
                    <Users className="w-4 h-4 text-violet-500" />
                  </div>
                </div>
              </div>
              
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <div className="mt-8">
          <UpgradeBox />
        </div>
      </SidebarContent>

      <SidebarFooter className={`${isMobile ? 'p-4 bg-background' : 'p-2'}`}>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={toggleTheme}
                  className={`flex items-center gap-3 rounded-lg transition-all duration-200 ${
                    isMobile 
                      ? 'px-6 py-6 min-h-[72px] active:scale-95 touch-manipulation text-base' 
                      : 'px-3 py-2'
                  }`}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted/50 text-muted-foreground">
                    {(() => {
                      const ThemeIcon = getThemeIcon();
                      return <ThemeIcon className="w-4 h-4" />;
                    })()}
                  </div>
                  {!collapsed && (
                    <div className="flex-1 min-w-0">
                      <span className="font-medium">Theme: {getThemeLabel()}</span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Tap to cycle themes
                      </p>
                    </div>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
};

export default CommoditySidebar;