import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onClose?: () => void;
  rightAction?: React.ReactNode;
  sticky?: boolean;
  transparent?: boolean;
  className?: string;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  subtitle,
  onBack,
  onClose,
  rightAction,
  sticky = true,
  transparent = false,
  className = '',
}) => {
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`
        ${sticky ? 'sticky top-0 z-40' : ''}
        ${transparent ? 'bg-transparent' : 'bg-background/95 backdrop-blur-md border-b border-border/50'}
        px-4 py-3 flex items-center justify-between
        ${className}
      `}
    >
      {/* Left side - Back/Close button */}
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-muted/50 active:bg-muted transition-colors touch-manipulation focus-ring"
            aria-label="Go back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 -ml-2 rounded-full hover:bg-muted/50 active:bg-muted transition-colors touch-manipulation focus-ring"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Center - Title */}
      <div className="flex-1 text-center px-4">
        <h1 className="text-lg font-bold text-foreground truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-muted-foreground truncate">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right side - Action */}
      <div className="flex items-center">
        {rightAction || <div className="w-9" />} {/* Spacer for centering */}
      </div>
    </motion.header>
  );
};

interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  height?: 'half' | 'full' | 'auto';
  className?: string;
}

export const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  height = 'auto',
  className = '',
}) => {
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  const heightClasses = {
    half: 'max-h-[50vh]',
    full: 'max-h-[90vh]',
    auto: 'max-h-[80vh]',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`
              fixed bottom-0 left-0 right-0 z-50
              bg-background rounded-t-2xl border-t border-border/50
              ${heightClasses[height]} overflow-hidden
              ${className}
            `}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-muted rounded-full" />
            </div>

            {/* Header */}
            {title && (
              <div className="px-4 py-2 border-b border-border/50">
                <h2 className="text-lg font-semibold text-center">{title}</h2>
              </div>
            )}

            {/* Content */}
            <div className="overflow-y-auto custom-scrollbar">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

interface MobileFabProps {
  onClick: () => void;
  icon: React.ReactNode;
  label?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'accent';
  className?: string;
}

export const MobileFab: React.FC<MobileFabProps> = ({
  onClick,
  icon,
  label,
  position = 'bottom-right',
  size = 'md',
  variant = 'primary',
  className = '',
}) => {
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'bottom-center': 'bottom-6 left-1/2 transform -translate-x-1/2',
  };

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16',
  };

  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
    accent: 'bg-accent text-accent-foreground hover:bg-accent/90',
  };

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        fixed z-40 rounded-full shadow-lg
        flex items-center justify-center
        transition-all duration-200
        active:scale-95 focus-ring
        ${positionClasses[position]}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      aria-label={label}
    >
      {icon}
    </motion.button>
  );
};