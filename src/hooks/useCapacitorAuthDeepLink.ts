import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';

/**
 * Listens for OAuth deep links (commodityhub://auth-callback) on native
 * platforms and completes the Supabase session. Supports both implicit
 * (#access_token=...) and PKCE (?code=...) callback shapes.
 */
export function useCapacitorAuthDeepLink() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let removeListener: (() => void) | undefined;

    (async () => {
      try {
        const { App } = await import('@capacitor/app');
        const { Browser } = await import('@capacitor/browser');

        const handle = await App.addListener('appUrlOpen', async ({ url }) => {
          if (!url || !url.startsWith('commodityhub://auth-callback')) return;

          try {
            // PKCE flow — ?code=...
            const queryIdx = url.indexOf('?');
            const hashIdx = url.indexOf('#');

            if (queryIdx !== -1) {
              const query = url.slice(queryIdx + 1, hashIdx === -1 ? undefined : hashIdx);
              const params = new URLSearchParams(query);
              const code = params.get('code');
              if (code) {
                const { error } = await supabase.auth.exchangeCodeForSession(url);
                if (error) console.error('exchangeCodeForSession failed:', error);
              }
            }

            // Implicit flow — #access_token=...&refresh_token=...
            if (hashIdx !== -1) {
              const hash = url.slice(hashIdx + 1);
              const params = new URLSearchParams(hash);
              const access_token = params.get('access_token');
              const refresh_token = params.get('refresh_token');
              if (access_token && refresh_token) {
                const { error } = await supabase.auth.setSession({
                  access_token,
                  refresh_token,
                });
                if (error) console.error('setSession failed:', error);
              }
            }
          } catch (err) {
            console.error('OAuth deep-link handling failed:', err);
          } finally {
            try {
              await Browser.close();
            } catch {
              /* no-op — browser may already be closed */
            }
          }
        });

        removeListener = () => handle.remove();
      } catch (err) {
        console.warn('Capacitor deep-link listener not registered:', err);
      }
    })();

    return () => {
      removeListener?.();
    };
  }, []);
}