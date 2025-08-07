import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSidebar } from '@/components/ui/sidebar';

interface MobilePageHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backLabel?: string;
  showSidebarToggle?: boolean;
  children?: React.ReactNode;
}

export const MobilePageHeader: React.FC<MobilePageHeaderProps> = ({
  title,
  subtitle,
  onBack,
  backLabel = "Back",
  showSidebarToggle = false,
  children
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toggleSidebar } = useSidebar();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/');
    }
  };

  return (
    <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4 py-3">
        {/* Navigation Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {/* Mobile-optimized back button */}
            <Button
              variant="ghost"
              size={isMobile ? "default" : "sm"}
              onClick={handleBack}
              className={`
                flex items-center gap-2 text-muted-foreground hover:text-foreground
                ${isMobile ? 'h-11 px-4 min-w-[80px]' : 'h-9 px-3'}
                touch-manipulation focus-ring
              `}
              aria-label={`${backLabel} to main screen`}
            >
              <ArrowLeft className={isMobile ? "w-5 h-5" : "w-4 h-4"} />
              <span className="font-medium">{backLabel}</span>
            </Button>

            {/* Optional sidebar toggle for mobile */}
            {showSidebarToggle && isMobile && (
              <Button
                variant="ghost"
                size="default"
                onClick={toggleSidebar}
                className="h-11 w-11 p-0 touch-manipulation focus-ring"
                aria-label="Toggle sidebar menu"
              >
                <Menu className="w-5 h-5" />
              </Button>
            )}
          </div>

          {/* Right side content */}
          {children && (
            <div className="flex items-center gap-2">
              {children}
            </div>
          )}
        </div>

        {/* Title Row */}
        <div>
          <h1 className={`
            font-bold text-foreground
            ${isMobile ? 'text-2xl' : 'text-3xl'}
          `}>
            {title}
          </h1>
          {subtitle && (
            <p className={`
              text-muted-foreground mt-1
              ${isMobile ? 'text-sm' : 'text-base'}
            `}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};