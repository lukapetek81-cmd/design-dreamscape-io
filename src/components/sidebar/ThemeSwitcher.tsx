import React from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Moon, Sun, Monitor } from "lucide-react";

const ThemeSwitcher = () => {
  const { state, setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();
  const collapsed = state === "collapsed";
  const [theme, setTheme] = React.useState<'light' | 'dark' | 'system'>('system');

  // Initialize theme from localStorage or system preference
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Default to system preference
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

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={toggleTheme}
              data-theme-toggle
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
  );
};

export default ThemeSwitcher;