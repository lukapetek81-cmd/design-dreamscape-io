## Goal

Two pre-launch fixes:

1. **Capacitor OAuth redirect** — Google sign-in currently redirects to `window.location.origin/`, which inside the Android WebView resolves to `https://localhost` (Capacitor's serve origin). Supabase will reject that. We need a deep link back into the installed app and an in-app handler that completes the session.
2. **CORS standardization** — every edge function defines its own `corsHeaders` inline, several with an incomplete `Access-Control-Allow-Headers` list. The shared `_shared/utils.ts` already exports the canonical `corsHeaders`, but only one function imports it. Migrate all functions and broaden the allowed-headers list to match what the Supabase JS client actually sends.

---

## Part 1 — Capacitor Google OAuth deep link

### a. Capacitor config
Add a custom URL scheme so OAuth callbacks open the app:

```ts
// capacitor.config.ts
android: { …, scheme: 'commodityhub' },
ios:     { …, scheme: 'commodityhub' },
```

### b. Android manifest deep link
Add an intent-filter to `MainActivity` in `android/app/src/main/AndroidManifest.xml`:

```xml
<intent-filter android:autoVerify="false">
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="commodityhub" android:host="auth-callback" />
</intent-filter>
```

### c. Detect platform and pick redirect URL
In `src/contexts/AuthContext.tsx`, change `signInWithGoogle` to:

```ts
const isNative = Capacitor.isNativePlatform();
const redirectTo = isNative
  ? 'commodityhub://auth-callback'
  : `${window.location.origin}/`;

const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo,
    skipBrowserRedirect: isNative,
    queryParams: { access_type: 'offline', prompt: 'consent' },
  },
});

if (isNative && data?.url) {
  const { Browser } = await import('@capacitor/browser');
  await Browser.open({ url: data.url, presentationStyle: 'popover' });
}
```

### d. Handle the callback in-app
Add `@capacitor/browser` and `@capacitor/app` listener in `src/main.tsx` (or a dedicated `useCapacitorDeepLinks` hook called from `App.tsx`):

```ts
App.addListener('appUrlOpen', async ({ url }) => {
  if (!url.startsWith('commodityhub://auth-callback')) return;
  const hash = url.split('#')[1] ?? url.split('?')[1] ?? '';
  const params = new URLSearchParams(hash);
  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');
  if (access_token && refresh_token) {
    await supabase.auth.setSession({ access_token, refresh_token });
  }
  await Browser.close();
});
```

### e. New dependency
`bun add @capacitor/browser`

### f. Supabase dashboard step (user action)
Add `commodityhub://auth-callback` to **Authentication → URL Configuration → Redirect URLs**. I will surface a link to that page in the response.

---

## Part 2 — CORS standardization

### a. Broaden shared headers
Update `supabase/functions/_shared/utils.ts`:

```ts
export const corsHeaders: CorsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};
```

### b. Migrate all functions to import the shared headers
For each of the following, delete the inline `corsHeaders` const and `import { corsHeaders } from '../_shared/utils.ts'`:

- `revenuecat-webhook`
- `research-alpha-vantage-futures`
- `realtime-commodity-stream`
- `oil-price-api`
- `health-check`
- `fetch-commodity-symbols`
- `fetch-commodity-prices`
- `fetch-all-commodities-v2`
- `fetch-all-commodities`
- `fetch-commodity-data`
- `fetch-commodity-news`
- `enhanced-commodity-news`
- `economic-calendar`
- `direct-exchange-feeds`
- `currency-rates`
- `api-docs`

Each file keeps its existing OPTIONS handler and response spreading (`{ ...corsHeaders, 'Content-Type': 'application/json' }`); only the source of `corsHeaders` changes.

### c. Verify
Deploy all touched functions and call `health-check` and `fetch-commodity-symbols` with a smoke test to confirm preflight succeeds.

---

## Out of scope / not changed

- Email/password auth flows
- Edge function business logic
- iOS deep-link plist entry (Android-only launch target per the memory)
- AuthHealthPanel UI (already wired)

## Risk notes

- Custom scheme `commodityhub` is unregistered globally — safe choice. If you later want Universal Links, that's a follow-up.
- The Supabase implicit-flow callback returns tokens in the URL hash; PKCE flow returns a `code` param. If your Supabase project uses PKCE (default for newer projects), the deep-link handler will instead call `supabase.auth.exchangeCodeForSession(url)`. I'll detect this at runtime and handle both.
