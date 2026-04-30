import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { NATIVE_AUTH_CALLBACK_URL } from '@/utils/nativeOAuth';

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

        const handleOAuthUrl = async (url?: string) => {
          if (!url || !url.startsWith(NATIVE_AUTH_CALLBACK_URL)) return;

          try {
            // PKCE flow — ?code=...
            const callbackUrl = new URL(url);
            const code = callbackUrl.searchParams.get('code');

            if (code) {
              const { error } = await supabase.auth.exchangeCodeForSession(code);
              if (error) console.error('exchangeCodeForSession failed:', error);
            }

            // Implicit flow — #access_token=...&refresh_token=...
            if (callbackUrl.hash) {
              const params = new URLSearchParams(callbackUrl.hash.slice(1));
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

            window.history.replaceState({}, document.title, '/');
          } catch (err) {
            console.error('OAuth deep-link handling failed:', err);
          } finally {
            try {
              await Browser.close();
            } catch {
              /* no-op — browser may already be closed */
            }
          }
        };

        const launchUrl = await App.getLaunchUrl();
        await handleOAuthUrl(launchUrl?.url);

        const handle = await App.addListener('appUrlOpen', async ({ url }) => {
          await handleOAuthUrl(url);
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