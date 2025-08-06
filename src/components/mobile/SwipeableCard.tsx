import React from 'react';
import { motion, PanInfo } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: {
    icon: React.ReactNode;
    color: string;
    label: string;
  };
  rightAction?: {
    icon: React.ReactNode;
    color: string;
    label: string;
  };
  threshold?: number;
  className?: string;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  threshold = 100,
  className = '',
}) => {
  const isMobile = useIsMobile();
  const [dragX, setDragX] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setDragX(info.offset.x);
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    setDragX(0);

    if (Math.abs(info.offset.x) > threshold) {
      if (info.offset.x > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (info.offset.x < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }
  };

  if (!isMobile) {
    return <div className={className}>{children}</div>;
  }

  const showLeftAction = dragX > 20 && rightAction;
  const showRightAction = dragX < -20 && leftAction;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Left Action */}
      {showLeftAction && (
        <motion.div
          className={`absolute inset-y-0 left-0 flex items-center justify-center px-6 ${rightAction?.color}`}
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
        >
          <div className="flex flex-col items-center gap-1">
            {rightAction?.icon}
            <span className="text-xs font-medium text-white">
              {rightAction?.label}
            </span>
          </div>
        </motion.div>
      )}

      {/* Right Action */}
      {showRightAction && (
        <motion.div
          className={`absolute inset-y-0 right-0 flex items-center justify-center px-6 ${leftAction?.color}`}
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
        >
          <div className="flex flex-col items-center gap-1">
            {leftAction?.icon}
            <span className="text-xs font-medium text-white">
              {leftAction?.label}
            </span>
          </div>
        </motion.div>
      )}

      {/* Card Content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -threshold * 1.5, right: threshold * 1.5 }}
        dragElastic={0.2}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        className={`
          relative z-10 bg-background transition-transform duration-200
          ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
          ${showLeftAction || showRightAction ? 'shadow-lg' : ''}
        `}
        style={{
          x: dragX,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};