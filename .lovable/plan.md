Plan to fix Google sign-in not showing the user as signed in:

1. Repair the OAuth callback/session handoff
   - Make the Supabase client explicitly enable OAuth callback detection for PKCE (`detectSessionInUrl: true`).
   - Add a small callback finalization path in the auth context so when the app returns with `?code=...`, it exchanges the code for a session before the app decides the user is signed out.
   - Clean the URL after a successful exchange so refresh/back navigation does not reuse the same OAuth code.

2. Stop valid OAuth sessions from being treated as bad tokens
   - Narrow the malformed-token cleanup so it only removes real broken session values, not temporary PKCE verifier entries or other Supabase auth helper storage.
   - Avoid calling cleanup during normal `SIGNED_IN` / `TOKEN_REFRESHED` events unless the inspected session is actually invalid.

3. Make the header use the auth user immediately
   - Update the signed-in UI so it displays the avatar/account menu as soon as `auth.user` exists, even if the `profiles` row is still loading or missing.
   - Use Google metadata (`user_metadata.full_name`, `avatar_url`, email) as a fallback while the profile fetch completes.

4. Make profile loading resilient
   - If a Google-authenticated user has no `profiles` row, create or upsert a minimal profile from the Supabase user metadata.
   - This prevents the app from looking signed out just because profile creation/fetching failed.

5. Add targeted diagnostics only if needed
   - Keep concise auth logs around OAuth callback exchange/session state, without logging tokens or secrets.

After approval, I’ll implement only these auth-related changes and leave the rest of the app untouched.