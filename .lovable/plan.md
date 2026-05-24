# RevenueCat IAP End-to-End Verification

The code path is already in place (`src/services/revenueCat.ts`, `revenuecat-webhook` edge function, `profiles.subscription_*` fields, `ManageSubscriptionButton`, `PremiumPaywall`). What's left is **configuration + live testing** — most of which happens outside the codebase.

## Stage 1 — Config sanity check (in code / dashboards)

1. **API keys present**
   - Confirm `VITE_REVENUECAT_ANDROID_KEY` (or legacy `VITE_REVENUECAT_API_KEY`) exists in the production `.env` used for the AAB build.
   - iOS key is optional for now (Android-only launch).

2. **Webhook secret**
   - `REVENUECAT_WEBHOOK_AUTH` already exists in Supabase secrets — verify the **same value** is pasted into RevenueCat dashboard → Project Settings → Integrations → Webhooks → Authorization header as `Bearer <value>`.
   - Webhook URL: `https://kcxhsmlqqyarhlmcapmj.supabase.co/functions/v1/revenuecat-webhook`

3. **RevenueCat dashboard objects**
   - Entitlement ID is exactly `premium` (matches code constant).
   - Offering marked **Current** with at least one package attached.
   - Product SKU(s) match the Play Console subscription product IDs.

## Stage 2 — Play Console wiring

4. **Subscription product created** in Play Console (Monetize → Subscriptions) with same product ID used in RevenueCat.
5. **Service account JSON** uploaded to RevenueCat for Play Store server notifications + receipt validation.
6. **License testers** added in Play Console (Setup → License testing) — your tester Google accounts.
7. **Internal testing track** has the signed AAB uploaded and the testers opted in via the opt-in URL.

## Stage 3 — Live purchase test (on a real Android device)

8. Install build via internal-testing link, sign in with a **license tester** Google account.
9. Trigger paywall → buy the subscription (shows "test card, no charge").
10. Verify in the app:
    - `hasActivePremium()` returns true (premium content unlocks immediately).
    - "Manage Subscription" button appears and deep-links to Play subscription page.

## Stage 4 — Webhook → DB verification

11. In Supabase, check `profiles` row for the test user:
    - `subscription_active = true`
    - `subscription_tier = 'premium'`
    - `subscription_end` populated
    - `billing_state = 'active'`
12. Check `revenuecat-webhook` edge function logs for an `INITIAL_PURCHASE` event with `matched: 1`.

## Stage 5 — Lifecycle states

13. **Cancel** the test subscription from Play Store → expect `CANCELLATION` webhook → `subscription_active=false`, `billing_state='canceled'`.
14. **Restore purchases** flow on a fresh install of the same account → premium re-unlocks.
15. **Grace / billing-issue** simulation (optional, hard to force) — confirm `BillingStatusBanner` renders when `billing_state='grace'`.

## Stage 6 — Edge-case safety net

16. Run the existing `revenuecat-webhook/index_test.ts` Deno test to confirm payload parsing didn't drift.
17. Confirm unauthenticated POSTs to the webhook return 401 (auth header check).

## Deliverable
A short pass/fail checklist in `mem://launch/production-readiness` recording: keys present, webhook secret matched, purchase succeeded, profile row updated, cancellation handled, restore works.

## What I'll do once you approve
- Run the Deno webhook test (`supabase--test_edge_functions`) to confirm code-side is green.
- Curl the deployed webhook with a forged `INITIAL_PURCHASE` payload using a real test `app_user_id` to confirm the production endpoint + secret + DB write all work — without needing a real device yet.
- Report back with concrete findings and the remaining manual steps (3, 4, 5) that only you can do (device, Play Console, RevenueCat dashboard).