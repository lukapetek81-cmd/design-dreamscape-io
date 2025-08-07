import React from 'react';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Activity } from 'lucide-react';

interface PerformanceMonitorProps {
  enabled?: boolean;
  showDetails?: boolean;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ 
  enabled = process.env.NODE_ENV === 'development',
  showDetails = false 
}) => {
  const { metrics } = usePerformanceMonitor();

  if (!enabled) return null;

  const getPerformanceStatus = () => {
    if (metrics.isLowPerformance) {
      return {
        icon: <AlertTriangle className="w-4 h-4" />,
        text: 'Low Performance',
        variant: 'destructive' as const,
        color: 'text-red-600'
      };
    }
    
    if (metrics.fps < 45) {
      return {
        icon: <Activity className="w-4 h-4" />,
        text: 'Fair Performance',
        variant: 'secondary' as const,
        color: 'text-yellow-600'
      };
    }
    
    return {
      icon: <CheckCircle className="w-4 h-4" />,
      text: 'Good Performance',
      variant: 'default' as const,
      color: 'text-green-600'
    };
  };

  const status = getPerformanceStatus();

  if (!showDetails) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Badge variant={status.variant} className="flex items-center gap-2">
          {status.icon}
          <span className="text-xs">{Math.round(metrics.fps)} FPS</span>
        </Badge>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="p-3 bg-background/95 backdrop-blur-sm border shadow-lg min-w-[200px]">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Performance</span>
            <Badge variant={status.variant} className="flex items-center gap-1">
              {status.icon}
              <span className="text-xs">{status.text}</span>
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">FPS:</span>
              <span className={`ml-1 font-mono ${status.color}`}>
                {Math.round(metrics.fps)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Memory:</span>
              <span className="ml-1 font-mono">
                {Math.round(metrics.memoryUsage)}MB
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">Render:</span>
              <span className="ml-1 font-mono">
                {metrics.renderTime.toFixed(1)}ms
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default React.memo(PerformanceMonitor);