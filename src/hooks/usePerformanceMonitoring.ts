import React from 'react';
import { monitoringService } from '@/services/monitoringService';

interface PerformanceMonitoringOptions {
  trackRenders?: boolean;
  trackMounts?: boolean;
  trackUpdates?: boolean;
  componentName?: string;
}

export function usePerformanceMonitoring(options: PerformanceMonitoringOptions = {}) {
  const {
    trackRenders = true,
    trackMounts = true,
    trackUpdates = true,
    componentName = 'UnnamedComponent'
  } = options;

  const mountStartTime = useRef<number>();
  const renderStartTime = useRef<number>();
  const updateCount = useRef(0);
  const renderCount = useRef(0);

  // Track component mount time
  useEffect(() => {
    if (trackMounts) {
      const mountTime = Date.now() - (mountStartTime.current || Date.now());
      monitoringService.reportPerformance(`component_mount_${componentName}`, mountTime, 'ms');
      
      monitoringService.trackUserEvent('component_mounted', {
        componentName,
        mountTime
      });
    }

    return () => {
      // Track component unmount
      monitoringService.trackUserEvent('component_unmounted', {
        componentName,
        renderCount: renderCount.current,
        updateCount: updateCount.current
      });
    };
  }, [trackMounts, componentName]);

  // Track renders
  useEffect(() => {
    if (trackRenders) {
      renderCount.current += 1;
      
      if (renderStartTime.current) {
        const renderTime = performance.now() - renderStartTime.current;
        monitoringService.trackComponentRender(componentName, renderTime);
      }
    }
  });

  // Track updates
  useEffect(() => {
    if (trackUpdates && renderCount.current > 1) {
      updateCount.current += 1;
      
      monitoringService.trackUserEvent('component_updated', {
        componentName,
        updateCount: updateCount.current
      });
    }
  });

  // Start render timing
  const startRenderTiming = useCallback(() => {
    if (trackRenders) {
      renderStartTime.current = performance.now();
    }
  }, [trackRenders]);

  // Mark mount start
  useEffect(() => {
    mountStartTime.current = Date.now();
  }, []);

  // Call this at the start of render
  startRenderTiming();

  return {
    trackEvent: (event: string, properties?: Record<string, any>) => {
      monitoringService.trackUserEvent(event, {
        componentName,
        ...properties
      });
    },
    reportError: (error: Error, context?: Record<string, any>) => {
      monitoringService.reportError({
        message: error.message,
        stack: error.stack,
        context: {
          componentName,
          ...context
        },
        severity: 'medium'
      });
    },
    measureFunction: <T extends (...args: any[]) => any>(fn: T, functionName: string) => {
      return monitoringService.measureFunction(fn, `${componentName}_${functionName}`);
    }
  };
}

// HOC placeholder - implementation simplified for compatibility  
export const withPerformanceMonitoring = (Component: any, componentName?: string) => Component;