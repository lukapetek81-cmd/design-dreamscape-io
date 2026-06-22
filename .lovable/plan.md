## Problem

Two related bugs in native Google sign-in:

1. **Wrong Android package name in the OAuth bridge.** `src/utils/nativeOAuth.ts` hardcodes `ANDROID_PACKAGE_NAME = 'com.commodityhub.app'`, but the actual installed app id (from `capacitor.config.ts` and `AndroidManifest.xml`) is `app.lovable.c8fabd7a96c74aff8d7b001690ec23c7`. The `intent://...;package=com.commodityhub.app;...` URL therefore can't resolve the installed app, so Android falls back to the browser and the session lands there instead of in the app.

2. **The bridge depends on the published web build being current.** Native sign-in redirects to `https://commodity-hub.lovable.app/?native=1`, which runs `redirectNativeOAuthCallbackFromWeb` to bounce the `?code=...` back into the app. If that hosted build is stale (older than what's installed on the device), users perceive sign-in as "out of sync." A direct `commodityhub://auth-callback` redirect from Supabase removes the dependency entirely — Chrome Custom Tabs honor it via the existing `commodityhub` intent filter in `AndroidManifest.xml`, and `useCapacitorAuthDeepLink` already handles both PKCE and implicit payloads.

## Plan

1. **Fix the package name** in `src/utils/nativeOAuth.ts`:
   - `ANDROID_PACKAGE_NAME = 'app.lovable.c8fabd7a96c74aff8d7b001690ec23c7'`
   - Keeps the web bridge working as a fallback for users whose Supabase project still has only the hosted URL whitelisted.

2. **Prefer the direct app-scheme redirect on native** in `src/contexts/AuthContext.tsx`:
   - Change `redirectTo` for native from `NATIVE_OAUTH_WEB_BRIDGE_URL` to `NATIVE_AUTH_CALLBACK_URL` (`commodityhub://auth-callback`).
   - Leaves `skipBrowserRedirect: true` and the `Browser.open(...)` Custom-Tabs flow untouched, so the existing deep-link listener picks the callback up and completes the session in-app.

3. **Supabase dashboard step (user action, documented in the response):**
   - Add `commodityhub://auth-callback` to **Authentication → URL Configuration → Redirect URLs** so Supabase will accept the native redirect. The hosted bridge URL stays whitelisted as fallback.

4. **Verification after rebuild + `npx cap sync android`:**
   - Tap "Continue with Google" → Custom Tabs opens → after consent the browser closes and the user lands back inside the app, signed in.
   - Confirm via `adb logcat` that `[OAuth] Session established via PKCE` fires.

## Files touched

- `src/utils/nativeOAuth.ts` — package id constant
- `src/contexts/AuthContext.tsx` — `redirectTo` on native

No backend or schema changes.
