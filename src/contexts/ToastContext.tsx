import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { EnhancedToast, type ToastType } from '@/components/ui/enhanced-toast';

interface ToastProviderProps {
  children: React.ReactNode;
}

interface ToastState {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  isVisible: boolean;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = React.useState<ToastState[]>([]);

  const showToast = React.useCallback((
    type: ToastType,
    title: string,
    description?: string
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastState = {
      id,
      type,
      title,
      description,
      isVisible: true,
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  }, []);

  const hideToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Global toast context value
  const contextValue = React.useMemo(() => ({
    showToast,
    hideToast,
  }), [showToast, hideToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      
      {/* Render toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <EnhancedToast
            key={toast.id}
            type={toast.type}
            title={toast.title}
            description={toast.description}
            isVisible={toast.isVisible}
            onClose={() => hideToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastContext = React.createContext<{
  showToast: (type: ToastType, title: string, description?: string) => void;
  hideToast: (id: string) => void;
} | null>(null);

export const useEnhancedToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useEnhancedToast must be used within ToastProvider');
  }
  return context;
};