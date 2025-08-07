import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Zap, BarChart3, Coins } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
  isVisible: boolean;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, isVisible }) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    { icon: TrendingUp, text: "Loading Markets", color: "text-blue-500" },
    { icon: BarChart3, text: "Preparing Charts", color: "text-green-500" },
    { icon: Coins, text: "Fetching Prices", color: "text-yellow-500" },
    { icon: Zap, text: "Ready to Trade", color: "text-purple-500" },
  ];

  useEffect(() => {
    if (!isVisible) return;

    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) {
          clearInterval(timer);
          setTimeout(onComplete, 800);
          return prev;
        }
        return prev + 1;
      });
    }, 600);

    return () => clearInterval(timer);
  }, [isVisible, onComplete, steps.length]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-primary/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.5 }}
        >
          {/* App Logo */}
          <motion.div
            className="mb-8"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/30">
              <TrendingUp className="w-10 h-10 text-white" />
            </div>
          </motion.div>

          {/* App Name */}
          <motion.h1
            className="text-3xl font-bold text-white mb-12 text-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Commodity Hub
          </motion.h1>

          {/* Loading Steps */}
          <div className="flex flex-col items-center space-y-6">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <motion.div
                  key={index}
                  className="flex items-center space-x-4"
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ 
                    x: 0, 
                    opacity: isActive || isCompleted ? 1 : 0.3,
                    scale: isActive ? 1.1 : 1 
                  }}
                  transition={{ 
                    delay: index * 0.1,
                    duration: 0.3 
                  }}
                >
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    ${isCompleted ? 'bg-green-500' : isActive ? 'bg-white/20' : 'bg-white/10'}
                    transition-all duration-300
                  `}>
                    <StepIcon className={`
                      w-4 h-4 
                      ${isCompleted ? 'text-white' : isActive ? step.color : 'text-white/50'}
                      ${isActive ? 'animate-pulse' : ''}
                    `} />
                  </div>
                  <span className={`
                    text-sm font-medium
                    ${isActive ? 'text-white' : 'text-white/70'}
                    transition-colors duration-300
                  `}>
                    {step.text}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <motion.div
            className="mt-8 w-48 h-1 bg-white/20 rounded-full overflow-hidden"
            initial={{ width: 0 }}
            animate={{ width: "12rem" }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>

          {/* Loading Text */}
          <motion.p
            className="mt-4 text-white/70 text-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.3 }}
          >
            Powered by real-time market data
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;