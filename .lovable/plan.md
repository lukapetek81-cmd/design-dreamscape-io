## Problem

Clicking "Sign in with Google" returns a 403. The flow:

1. Browser hits Supabase `/authorize?provider=google&redirect_to=<preview-origin>/` → succeeds (302 in auth logs).
2. Google completes OAuth and redirects back to Supabase.
3. Supabase validates the original `redirect_to` against the allowlist (Site URL + Additional Redirect URLs). The current preview/published origins are **not** on the list → Supabase rejects → 403.

### Current allowlist (`supabase/config.toml`)
- Site URL: `https://commodity-hub.lovableproject.com` (stale Lovable subdomain format)
- Additional: an old preview ID `c8fabd7a-...lovableproject.com`, `commodity-hub.vercel.app`, `yourdomain.com`

### Actual origins in use
- Live preview: `https://id-preview--0cea242b-6aba-4f5a-9e49-91997ef3b761.lovable.app`
- Alt preview: `https://0cea242b-6aba-4f5a-9e49-91997ef3b761.lovableproject.com`
- Published: `https://commodity-hub.lovable.app`

None of these match the allowlist, which is why Google sign-in fails for everyone hitting the new domains.

## Fix

### 1. Update `supabase/config.toml`

```toml
[auth]
site_url = "https://commodity-hub.lovable.app"
additional_redirect_urls = [
  "https://id-preview--0cea242b-6aba-4f5a-9e49-91997ef3b761.lovable.app",
  "https://0cea242b-6aba-4f5a-9e49-91997ef3b761.lovableproject.com",
  "https://commodity-hub.lovableproject.com",
  "https://commodity-hub.vercel.app",
  "http://localhost:5173"
]
```

Removes the dead `c8fabd7a-...` preview and `yourdomain.com` placeholder, adds the actual preview + published URLs.

### 2. Update Supabase Dashboard (manual, required)

`config.toml` is the source of truth in local dev, but the **hosted Supabase project** reads its allowlist from the Dashboard. The user must mirror the same values at:

Authentication → URL Configuration:
- **Site URL**: `https://commodity-hub.lovable.app`
- **Redirect URLs** (add each):
  - `https://id-preview--0cea242b-6aba-4f5a-9e49-91997ef3b761.lovable.app/**`
  - `https://0cea242b-6aba-4f5a-9e49-91997ef3b761.lovableproject.com/**`
  - `https://commodity-hub.lovable.app/**`
  - `https://commodity-hub.vercel.app/**`

### 3. Verify Google Cloud Console (manual, only if step 2 doesn't fix it)

In Google Cloud Console → Credentials → OAuth 2.0 Client → Authorized redirect URIs must include the Supabase callback:
`https://kcxhsmlqqyarhlmcapmj.supabase.co/auth/v1/callback`

(This is usually already set since the OAuth `/authorize` 302 succeeded — listed only as a fallback check.)

## What I won't change

- `AuthContext.signInWithGoogle()` — code is correct, no change needed.
- The `bad_jwt` 403s in the auth log are stale-session noise from the Vercel deployment and unrelated to this issue.
