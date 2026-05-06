## Goal

Close the security gap on `public.subscribers` so that Stripe customer IDs, emails, and subscription status cannot be read by unauthenticated users or via NULL `user_id` rows.

## Current state

- `subscribers.user_id` is **nullable**, so any row inserted without a user_id is effectively orphaned and ambiguous under RLS.
- Existing RLS policies (`subscribers_select_own`, `_insert_own`, `_update_own`, `_delete_own`) target only the `authenticated` role with `user_id = auth.uid()`.
- The `anon` role has no explicit deny — by default it inherits no policies, but table-level `GRANT`s could still leak access. We need an explicit lockdown.

## Changes (single migration)

1. **Backfill / clean NULL rows**
   - Delete any rows where `user_id IS NULL` (orphaned, cannot be safely owned). These are leftover from earlier Stripe webhook flows that inserted by email only.

2. **Enforce NOT NULL on `user_id`**
   - `ALTER TABLE public.subscribers ALTER COLUMN user_id SET NOT NULL;`

3. **Revoke any direct grants to `anon` and `public`**
   - `REVOKE ALL ON public.subscribers FROM anon, public;`
   - Re-grant only what `authenticated` needs: `GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscribers TO authenticated;`

4. **Add a restrictive deny-anon RLS policy** (defense in depth)
   - `CREATE POLICY subscribers_deny_anon ON public.subscribers AS RESTRICTIVE FOR ALL TO anon USING (false) WITH CHECK (false);`

5. **Tighten the existing SELECT policy** to also assert non-null:
   - Drop `subscribers_select_own` and recreate with `USING ((user_id = auth.uid()) AND (auth.uid() IS NOT NULL))` — matches the pattern already used on `portfolio_positions_select_own_verified`.

6. **Mark the security finding as fixed** via the security tool after the migration runs.

## Edge function impact

The `revenuecat-webhook` and any Stripe webhook code use `SUPABASE_SERVICE_ROLE_KEY`, which bypasses RLS — they continue to work. They must, however, always supply a real `user_id` on insert (no more email-only rows). I'll grep the edge functions for any insert into `subscribers` that omits `user_id` and patch them to look up the user by email first and skip the row if no match.

## Files touched

- New SQL migration under `supabase/migrations/`
- Possibly `supabase/functions/revenuecat-webhook/index.ts` if it inserts without `user_id`

## Out of scope

- No frontend changes. The client already only reads/writes its own row via the anon key + RLS.
