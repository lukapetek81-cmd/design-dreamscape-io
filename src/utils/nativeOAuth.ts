export const NATIVE_AUTH_CALLBACK_URL = 'commodityhub://auth-callback';
export const NATIVE_OAUTH_REDIRECT_URL = NATIVE_AUTH_CALLBACK_URL;

const ANDROID_PACKAGE_NAME = 'com.commodityhub.app';

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

  window.setTimeout(() => {
    document.body.innerHTML = `
      <main style="min-height:100vh;display:grid;place-items:center;background:#0f172a;color:#f8fafc;font-family:system-ui,sans-serif;padding:24px;text-align:center">
        <div>
          <h1 style="font-size:22px;margin:0 0 8px">Opening Commodity Hub</h1>
          <p style="margin:0 0 20px;color:#cbd5e1">If the app did not open, return to your installed Commodity Hub app.</p>
          <a href="${androidIntentUrl}" style="color:#2dd4bf">Open app</a>
        </div>
      </main>
    `;
    window.setTimeout(() => window.location.assign(appCallbackUrl), 900);
  }, 900);

  window.location.replace(androidIntentUrl);
  return true;
};