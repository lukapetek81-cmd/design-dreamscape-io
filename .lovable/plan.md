## Fix: subscribers INSERT privilege escalation

The `subscribers_insert_own` policy currently lets authenticated users insert their own row with any `subscription_tier` value (e.g. `'premium'`). We'll tighten the `WITH CHECK` clause so client inserts can only seed a free, unsubscribed baseline row — all upgrades must go through the RevenueCat webhook (service role).

### Migration

```sql
DROP POLICY IF EXISTS subscribers_insert_own ON public.subscribers;

CREATE POLICY subscribers_insert_own_free_only
ON public.subscribers
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND subscribed = false
  AND (subscription_tier IS NULL OR subscription_tier = 'free')
  AND subscription_end IS NULL
  AND stripe_customer_id IS NULL
);
```

### Why this is safe

- `user_id = auth.uid()` — can only insert own row.
- `subscribed = false` + `subscription_tier` restricted to `null`/`'free'` — no privilege escalation to premium.
- `subscription_end`/`stripe_customer_id` forced null — can't fake billing metadata.
- UPDATE is already blocked for authenticated (`subscribers_deny_authenticated_update`), so the row cannot be elevated client-side after insert.
- DELETE was already removed in a previous migration.
- The RevenueCat webhook uses the service role, which bypasses RLS, so legitimate premium upgrades still work.

### Follow-up

- Mark the `subscribers_insert_own_privilege_escalation` finding as fixed.
- Re-run the security scan to confirm.
