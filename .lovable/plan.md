# RevenueCat Integration — Close Remaining Gaps

Four independent changes, all additive. No schema breakage. One small migration to track billing state.

## 1. Automated test for the RevenueCat webhook handler

Add a Deno test at `supabase/functions/revenuecat-webhook/index_test.ts` that exercises the handler end-to-end against the deployed function via the existing `curl_edge_functions` pattern, plus a unit-style test that imports the handler logic.

Coverage:
- Rejects requests without `Authorization: Bearer <REVENUECAT_WEBHOOK_AUTH>` → 401.
- Rejects non-POST → 405; invalid JSON → 400; missing `event.type` / `app_user_id` → 400.
- Ignores events whose `entitlement_ids` don't include `premium` → 200 `{ignored:true}`.
- `INITIAL_PURCHASE` / `RENEWAL` → profile updated: `subscription_active=true`, `tier='premium'`, `subscription_end` set.
- `CANCELLATION` / `EXPIRATION` → `subscription_active=false`, `tier='free'`.
- `BILLING_ISSUE` → enters grace period (see section 3), does NOT immediately deactivate.
- Unknown event type → 200 `{ignored:true}`.

Uses a throwaway test profile row (insert via service-role in test setup, delete in teardown). Loaded via `dotenv/load.ts` per project convention.

## 2. "Manage subscription" deep link

Add a `ManageSubscriptionButton` component used in:
- `UserProfile.tsx` (Account section) — visible to any user with `subscription_active`.
- `PremiumPaywall.tsx` — shown instead of purchase buttons when user is already premium.

Behavior:
- **Android native** (Capacitor): open `https://play.google.com/store/account/subscriptions?sku=<productId>&package=<appId>` via `@capacitor/browser` (already a transitive dep; install if missing). `productId` comes from the user's last active package; fallback to the generic `…/account/subscriptions` URL.
- **iOS native** (future-proof): `itms-apps://apps.apple.com/account/subscriptions`.
- **Web**: opens the Play Store subscription URL in a new tab (matches the existing "Get the Android app" CTA pattern).

Also adds a small `getActiveProductId()` helper in `src/services/revenueCat.ts` that reads `customerInfo.entitlements.active.premium.productIdentifier`.

## 3. Grace-period / billing-retry UX

**Schema** (migration):
- Add `profiles.billing_state text` with values `active | grace | on_hold | canceled | none` (default `none`, not null).
- Add `profiles.grace_period_expires_at timestamptz null`.

**Webhook update** (`revenuecat-webhook/index.ts`):
- `BILLING_ISSUE` → set `billing_state='grace'`, keep `subscription_active=true`, set `grace_period_expires_at = expiration_at_ms` (Google grace is typically 3–7 days; RC forwards the real expiration).
- `SUBSCRIPTION_PAUSED` → `billing_state='on_hold'`, `subscription_active=false`.
- `UNCANCELLATION` / `RENEWAL` after grace → `billing_state='active'`, clear `grace_period_expires_at`.
- `EXPIRATION` after grace exhausted → `billing_state='canceled'`, deactivate.

**Frontend**:
- `AuthContext` exposes `billingState` and `gracePeriodExpiresAt` from the profile.
- New `BillingStatusBanner` component shown app-wide (mount in `App.tsx` above routes) when `billing_state ∈ {grace, on_hold}`:
  - Grace: amber banner — "Payment issue with your subscription. Please update your payment method by {date} to keep Premium access." CTA = Manage Subscription button (section 2).
  - On-hold: red banner — "Your subscription is paused. Update payment to restore Premium." CTA = Manage Subscription.
- Banner dismissible per-session (sessionStorage), reappears next session until resolved.

## 4. Purchase analytics

Use the existing `useAnalytics` hook (or `monitoringService` — pick whichever already wires to the analytics backend; will confirm during implementation by reading both).

Events emitted from `PremiumPaywall.tsx` and `revenueCat.ts`:
- `paywall_viewed` — when `PremiumPaywall` opens (props: `trigger_source`).
- `purchase_started` — on `handlePurchase` click (props: `package_id`, `price`, `currency`, `period`).
- `purchase_succeeded` — on successful `purchasePackage` (props: `package_id`, `price`, `currency`, `period`, `is_trial`).
- `purchase_failed` — on error (props: `package_id`, `error_code`, `error_message`).
- `purchase_cancelled` — on user cancellation (props: `package_id`).
- `restore_attempted` / `restore_succeeded` / `restore_failed`.

All events fire client-side. No PII beyond what's already tracked (user_id via existing analytics identity).

## Technical Details

**Files created**
- `supabase/functions/revenuecat-webhook/index_test.ts`
- `supabase/migrations/<ts>_profiles_billing_state.sql`
- `src/components/ManageSubscriptionButton.tsx`
- `src/components/BillingStatusBanner.tsx`

**Files modified**
- `supabase/functions/revenuecat-webhook/index.ts` — add BILLING_ISSUE / SUBSCRIPTION_PAUSED / UNCANCELLATION branches with billing_state writes.
- `src/services/revenueCat.ts` — add `getActiveProductId()`; emit analytics events.
- `src/components/PremiumPaywall.tsx` — analytics events; render `ManageSubscriptionButton` when already premium.
- `src/components/UserProfile.tsx` — render `ManageSubscriptionButton` for premium users.
- `src/contexts/AuthContext.tsx` — surface `billingState`, `gracePeriodExpiresAt` from profile.
- `src/App.tsx` — mount `BillingStatusBanner`.

**Out of scope**
- iOS handling beyond the URL stub (no iOS build yet — memory confirms Android-only).
- Server-side analytics ingestion (uses existing client analytics pipeline).
- Changing RC dashboard configuration (manual user step, already documented).

## Order of work
1. Migration (billing_state columns) → wait for approval.
2. Webhook code update + Deno tests.
3. `ManageSubscriptionButton` + `getActiveProductId()`.
4. `BillingStatusBanner` + `AuthContext` plumbing + mount in `App.tsx`.
5. Analytics events in paywall + revenueCat service.
6. Verify: run Deno tests, smoke-test paywall in preview.