import React from 'react';
import { useToast } from '@/hooks/use-toast';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isOnline: boolean;
  needsUpdate: boolean;
  isUpdating: boolean;
}

interface ServiceWorkerActions {
  register: () => Promise<void>;
  update: () => Promise<void>;
  unregister: () => Promise<void>;
  skipWaiting: () => void;
  clearCache: () => Promise<void>;
}

// Simple service worker hook that doesn't use React hooks initially
export const useServiceWorker = () => {
  // Just initialize without state for now to avoid React context issues
  React.useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
  }, []);
};

// Cache management utilities
export const cacheManager = {
  // Preload critical resources
  preloadCritical: async () => {
    if ('caches' in window) {
      const cache = await caches.open('critical-v1');
      const criticalResources = [
        '/',
        '/dashboard',
        '/portfolio',
        // Add critical API endpoints
      ];
      
      await cache.addAll(criticalResources);
    }
  },

  // Clear specific cache
  clearSpecificCache: async (cacheName: string) => {
    if ('caches' in window) {
      await caches.delete(cacheName);
    }
  },

  // Get cache size
  getCacheSize: async (): Promise<number> => {
    if (!('storage' in navigator) || !('estimate' in navigator.storage)) {
      return 0;
    }

    const estimate = await navigator.storage.estimate();
    return estimate.usage || 0;
  },

  // Check if resource is cached
  isCached: async (url: string): Promise<boolean> => {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const response = await cache.match(url);
        if (response) return true;
      }
    }
    return false;
  },
};