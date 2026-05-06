## Goal

Make the "Upgrade to Premium" button actually work, on both Android (RevenueCat IAP) and web (Stripe Checkout), and keep `profiles.subscription_active` / `subscription_tier` as the single source of truth that the existing `isPremium` gating already reads.

## Current state (verified)

- `AuthContext` already exposes `isPremium = profile.subscription_active && subscription_tier !== 'free'`. Gating in hooks (`useDelayedData`, `useRealtimeData`, `useCommodityData`, `usePortfolio`, etc.) is in place — no changes needed there.
- `PremiumPaywall.tsx` already implements the RevenueCat purchase flow correctly for native. On web it just shows: *"In-app purchases are only available in the Android app."* — that branch is what we replace with Stripe.
- `PremiumUpsellCard` already opens `PremiumPaywall`. The Dashboard "Upgrade" CTA goes through it. So the wiring on the UI side is already correct — the web branch just doesn't do anything.
- `profiles` table has `subscription_tier`, `subscription_active`, `subscription_end` but **no** `stripe_customer_id` / `stripe_subscription_id`.
- Secrets present: `STRIPE_SECRET_KEY`, `REVENUECAT_WEBHOOK_AUTH`, plus all Supabase keys.

## Pricing tiers (confirm or override)

- Monthly: **€9.99**
- Annual: **€79.99** (~33% off, matches the "Save ~38%" copy already in the paywall — close enough)
- Single entitlement key: `premium` (already used by RevenueCat code)

If you want different prices, tell me before we run the Stripe product creation.

## Plan

### 1. Database

Add to `profiles`:
- `stripe_customer_id text`
- `stripe_subscription_id text`
- `subscription_provider text` (`'stripe' | 'revenuecat' | null`) — useful for the customer portal/cancel flow

No RLS changes; existing self-only policies cover the new columns.

### 2. Stripe products

Create in Stripe (test mode first):
- Product: *Commodity Hub Premium*
- Price 1: €9.99 / month recurring
- Price 2: €79.99 / year recurring

Store the two price IDs as Supabase secrets: `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_ANNUAL`.

### 3. Edge functions (3 new)

All deploy with `verify_jwt = false` and validate the JWT in code (per project standard).

- **`create-stripe-checkout`** — auth required. Body: `{ plan: 'monthly' | 'annual' }`. Looks up/creates a Stripe customer (stores `stripe_customer_id` on profile), creates a Checkout Session in subscription mode with success/cancel URLs back to the app. Returns `{ url }`.
- **`stripe-webhook`** — public (Stripe-signed). Verifies signature with `STRIPE_WEBHOOK_SECRET` (new secret you'll add after creating the webhook endpoint in Stripe). Handles:
  - `checkout.session.completed` and `customer.subscription.updated` → set `subscription_tier='premium'`, `subscription_active=true`, `subscription_end=current_period_end`, store `stripe_subscription_id`, `subscription_provider='stripe'`.
  - `customer.subscription.deleted` / `payment_failed` → set `subscription_active=false`, tier back to `'free'`.
- **`create-stripe-portal`** — auth required. Returns Stripe Billing Portal URL so users can cancel / change plan / update card.

### 4. Frontend changes

- `src/services/stripe.ts` (new) — thin wrapper that calls the three edge functions via `supabase.functions.invoke`.
- `src/components/PremiumPaywall.tsx` — replace the "only available in Android app" web branch with two real buttons (Monthly / Annual) that call `create-stripe-checkout` and redirect to the returned `url`. The native branch stays exactly as it is.
- `src/components/SubscriptionManagement.tsx` (new, small) — shown in Profile/Settings when `isPremium` is true: shows current plan + "Manage subscription" button → opens portal (web) or deep-links to Play Store subscriptions (native).
- Profile page: surface the manage-subscription entry point. (Quick check + add if missing.)

### 5. RevenueCat → Supabase sync

The existing `revenueCat.ts` purchase flow only updates RevenueCat. To keep `profiles.subscription_active` in sync on mobile, point the existing **RevenueCat webhook** at a new edge function:

- **`revenuecat-webhook`** (or reuse if one already exists — will check during build) — verifies `Authorization` header against `REVENUECAT_WEBHOOK_AUTH` (already a secret), then upserts the same fields on `profiles` based on event type (`INITIAL_PURCHASE`, `RENEWAL`, `CANCELLATION`, `EXPIRATION`).

### 6. Memory update

Update `mem://monetization/strategy` and the index Core line from "Paid App model only" to:

> Freemium: free baseline, premium tier unlocks 20 extra energy markets + priority refresh. RevenueCat for mobile IAP, Stripe for web. Single entitlement key `premium`. Source of truth: `profiles.subscription_active` + `subscription_tier`.

## What you need to do (manual)

1. In Stripe Dashboard (test mode):
   - Create the product + 2 prices above; give me the price IDs (or I can create them via API once the function exists).
   - Add a webhook endpoint pointing to the deployed `stripe-webhook` URL (I'll give it to you after deploy). Copy the signing secret.
2. Add two Supabase secrets when prompted: `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_ANNUAL`.
3. In RevenueCat dashboard, point the webhook at the new `revenuecat-webhook` URL (auth header value = your existing `REVENUECAT_WEBHOOK_AUTH` secret).

## Out of scope for this pass

- Apple IAP (no iOS build yet).
- Proration / plan switching UI beyond what Stripe Billing Portal provides.
- Trial periods (can add later via Stripe price config — no code change).

Approve and I'll implement, starting with the migration + edge functions, then the paywall web branch, then memory updates.