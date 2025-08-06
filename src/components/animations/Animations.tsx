import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FadeInAnimationProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export const FadeInAnimation: React.FC<FadeInAnimationProps> = ({
  children,
  delay = 0,
  duration = 0.3,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface SlideInAnimationProps {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
  duration?: number;
  className?: string;
}

export const SlideInAnimation: React.FC<SlideInAnimationProps> = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.3,
  className = '',
}) => {
  const directionOffsets = {
    left: { x: -20, y: 0 },
    right: { x: 20, y: 0 },
    up: { x: 0, y: 20 },
    down: { x: 0, y: -20 },
  };

  const offset = directionOffsets[direction];

  return (
    <motion.div
      initial={{ opacity: 0, ...offset }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface ScaleAnimationProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export const ScaleAnimation: React.FC<ScaleAnimationProps> = ({
  children,
  delay = 0,
  duration = 0.2,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface StaggeredAnimationProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  className?: string;
}

export const StaggeredAnimation: React.FC<StaggeredAnimationProps> = ({
  children,
  staggerDelay = 0.1,
  className = '',
}) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <FadeInAnimation key={index} delay={index * staggerDelay}>
          {child}
        </FadeInAnimation>
      ))}
    </div>
  );
};