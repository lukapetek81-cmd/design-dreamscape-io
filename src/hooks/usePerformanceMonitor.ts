import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  fps: number;
  isLowPerformance: boolean;
}

export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    fps: 60,
    isLowPerformance: false
  });
  
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const renderStartTime = useRef(0);

  useEffect(() => {
    let animationId: number;
    
    const measureFPS = () => {
      frameCount.current++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime.current >= 1000) {
        const fps = Math.round((frameCount.current * 1000) / (currentTime - lastTime.current));
        
        // Get memory usage if available
        const memoryInfo = (performance as any).memory;
        const memoryUsage = memoryInfo ? memoryInfo.usedJSHeapSize / 1024 / 1024 : 0;
        
        setMetrics(prev => ({
          ...prev,
          fps,
          memoryUsage,
          isLowPerformance: fps < 30 || memoryUsage > 100
        }));
        
        frameCount.current = 0;
        lastTime.current = currentTime;
      }
      
      animationId = requestAnimationFrame(measureFPS);
    };
    
    measureFPS();
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  const startRenderMeasure = () => {
    renderStartTime.current = performance.now();
  };

  const endRenderMeasure = () => {
    const renderTime = performance.now() - renderStartTime.current;
    setMetrics(prev => ({ ...prev, renderTime }));
  };

  return {
    metrics,
    startRenderMeasure,
    endRenderMeasure
  };
};