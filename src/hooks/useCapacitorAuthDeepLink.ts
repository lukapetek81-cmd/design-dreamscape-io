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

        const closeBrowserAndRefreshSession = async () => {
          try {
            await Browser.close();
          } catch {
            /* no-op — browser may already be closed */
          }

          const { data, error } = await supabase.auth.getSession();
          if (error) console.error('[OAuth] Session refresh after browser close failed:', error);
          else if (data.session) console.log('[OAuth] Session available after native return');
        };

        const handleOAuthUrl = async (url?: string) => {
          if (!url) return false;
          // Match any commodityhub:// deep-link that carries an OAuth payload,
          // tolerating trailing slashes, host casing, or alternate paths.
          if (!url.toLowerCase().startsWith('commodityhub://')) return false;
          console.log('[OAuth] Received native deep link');

          try {
            const callbackUrl = new URL(url);
            const searchParams = callbackUrl.searchParams;
            const hashParams = new URLSearchParams(callbackUrl.hash.slice(1));

            const oauthError =
              searchParams.get('error_description') ||
              searchParams.get('error') ||
              hashParams.get('error_description') ||
              hashParams.get('error');
            if (oauthError) {
              console.error('[OAuth] Native callback returned an error:', oauthError);
              return true;
            }

            // PKCE flow — ?code=...
            const code = callbackUrl.searchParams.get('code');

            if (code) {
              console.log('[OAuth] Exchanging PKCE code for session');
              const { error } = await supabase.auth.exchangeCodeForSession(code);
              if (error) console.error('exchangeCodeForSession failed:', error);
              else console.log('[OAuth] Session established via PKCE');
            }

            // Implicit flow. The web bridge moves fragment tokens into the
            // query string for Android intents because `#Intent` consumes the
            // URL fragment before Capacitor can receive it.
            const access_token = searchParams.get('access_token') || hashParams.get('access_token');
            const refresh_token = searchParams.get('refresh_token') || hashParams.get('refresh_token');
            if (access_token && refresh_token) {
              console.log('[OAuth] Setting session via implicit tokens');
              const { error } = await supabase.auth.setSession({
                access_token,
                refresh_token,
              });
              if (error) console.error('setSession failed:', error);
            }

            window.history.replaceState({}, document.title, '/');
          } catch (err) {
            console.error('OAuth deep-link handling failed:', err);
          } finally {
            await closeBrowserAndRefreshSession();
          }

          return true;
        };

        const launchUrl = await App.getLaunchUrl();
        await handleOAuthUrl(launchUrl?.url);

        const handle = await App.addListener('appUrlOpen', async ({ url }) => {
          await handleOAuthUrl(url);
        });

        const browserHandle = await Browser.addListener('browserFinished', async () => {
          await closeBrowserAndRefreshSession();
        });

        removeListener = () => {
          handle.remove();
          browserHandle.remove();
        };
      } catch (err) {
        console.warn('Capacitor deep-link listener not registered:', err);
      }
    })();

    return () => {
      removeListener?.();
    };
  }, []);
}