## Plan

1. **Make native OAuth completion update UI immediately**
   - After the installed app receives the `commodityhub://` callback and calls `setSession()`, explicitly broadcast a local app event with the new session instead of waiting for the normal Supabase auth listener timing.
   - Close the browser only after session handling is attempted, so the app returns to the foreground with auth state already available.

2. **Harden AuthProvider session readiness**
   - Add a small `applySession()` helper that sets `session`, `user`, `profile` fallback data, and `loading` consistently.
   - Listen for the native OAuth completion event and call `applySession()` immediately.
   - Keep profile/subscription loading asynchronous so the top-right avatar can appear as soon as Supabase has a user.

3. **Improve visible feedback during Google sign-in**
   - On native, show a short “Finishing sign in…” state while the callback is being processed.
   - Ensure the auth page redirects to the dashboard as soon as `user` exists, not after profile data loads.

4. **Validate the likely failure mode**
   - Confirm web auth still initializes correctly.
   - Confirm the code path no longer depends on the slower profile fetch to show the signed-in top-right UI.

## Technical details

- Files to update:
  - `src/hooks/useCapacitorAuthDeepLink.ts`
  - `src/contexts/AuthContext.tsx`
  - possibly `src/pages/Auth.tsx` if the loading message needs to distinguish native OAuth completion
- No database changes are needed.
- The Supabase logs already show Google login succeeds, so the fix focuses on local session handoff and UI state timing rather than provider configuration.