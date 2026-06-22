export const NATIVE_AUTH_CALLBACK_URL = 'commodityhub://auth-callback';
export const NATIVE_OAUTH_REDIRECT_URL = NATIVE_AUTH_CALLBACK_URL;

/**
 * Hosted web URL Supabase should redirect to after Google OAuth on native.
 * The page at this URL detects `native=1` and bridges the `?code=...` payload
 * back into the installed app via an Android intent (see
 * `redirectNativeOAuthCallbackFromWeb`). This is far more reliable than asking
 * Chrome Custom Tabs to follow a `commodityhub://` redirect directly, which
 * many Android/Chrome versions silently drop.
 */
export const NATIVE_OAUTH_WEB_BRIDGE_URL =
  'https://commodity-hub.lovable.app/?native=1';

const ANDROID_PACKAGE_NAME = 'app.lovable.c8fabd7a96c74aff8d7b001690ec23c7';

const OAUTH_SEARCH_KEYS = ['code', 'error', 'error_description', 'error_code'];
const OAUTH_HASH_KEYS = [
  'access_token',
  'refresh_token',
  'provider_token',
  'provider_refresh_token',
  'error',
  'error_description',
  'error_code',
];

const hasAnyParam = (params: URLSearchParams, keys: string[]) =>
  keys.some((key) => params.has(key));

export const buildNativeAuthCallbackUrl = (callbackHref: string) => {
  const callbackUrl = new URL(callbackHref);
  const searchParams = new URLSearchParams(callbackUrl.search);
  searchParams.delete('native');

  const search = searchParams.toString();
  return `${NATIVE_AUTH_CALLBACK_URL}${search ? `?${search}` : ''}${callbackUrl.hash}`;
};

export const buildAndroidIntentCallbackUrl = (callbackHref: string) => {
  const appCallbackUrl = buildNativeAuthCallbackUrl(callbackHref);
  const parsedCallback = new URL(appCallbackUrl);
  const fallbackUrl = encodeURIComponent(window.location.origin);

  return `intent://${parsedCallback.host}${parsedCallback.pathname}${parsedCallback.search}${parsedCallback.hash}` +
    `#Intent;scheme=${parsedCallback.protocol.replace(':', '')};package=${ANDROID_PACKAGE_NAME};` +
    `S.browser_fallback_url=${fallbackUrl};end`;
};

export const redirectNativeOAuthCallbackFromWeb = () => {
  if (typeof window === 'undefined') return false;

  const callbackUrl = new URL(window.location.href);
  if (callbackUrl.searchParams.get('native') !== '1') return false;

  const hashParams = new URLSearchParams(callbackUrl.hash.replace(/^#/, ''));
  const hasOAuthPayload =
    hasAnyParam(callbackUrl.searchParams, OAUTH_SEARCH_KEYS) ||
    hasAnyParam(hashParams, OAUTH_HASH_KEYS);

  if (!hasOAuthPayload) return false;

  const appCallbackUrl = buildNativeAuthCallbackUrl(callbackUrl.href);
  const androidIntentUrl = buildAndroidIntentCallbackUrl(callbackUrl.href);

  const openInstalledApp = () => {
    window.location.href = androidIntentUrl;
  };

  window.setTimeout(() => {
    document.body.innerHTML = `
      <main style="min-height:100vh;display:grid;place-items:center;background:#0f172a;color:#f8fafc;font-family:system-ui,sans-serif;padding:24px;text-align:center">
        <div>
          <h1 style="font-size:22px;margin:0 0 8px">Opening Commodity Hub</h1>
          <p style="margin:0 0 20px;color:#cbd5e1">If the app did not open, return to your installed Commodity Hub app.</p>
          <button id="open-app" type="button" style="appearance:none;border:0;border-radius:8px;background:#2dd4bf;color:#042f2e;font-weight:700;padding:12px 18px">Open app</button>
        </div>
      </main>
    `;
    document.getElementById('open-app')?.addEventListener('click', openInstalledApp);
  }, 1200);

  openInstalledApp();
  return true;
};