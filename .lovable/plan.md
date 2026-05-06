## Goal

Switch the app to a **Freemium with subscription** model. Free install gets baseline features; "Premium" unlocks the gated extras already wired in code (extra energy markets, real-time WS data, extended history, etc.). Make the **Upgrade to Premium** button actually purchase, on both mobile (RevenueCat / Play Billing) and web (Stripe Checkout).

## Current state (audit)

Good news — most of the plumbing already exists, just disconnected:

- `profiles.subscription_active`, `subscription_tier`, `subscription_end` columns ✅
- `AuthContext` exposes `isPremium` derived from those columns ✅
- Hooks/components already gate on `isPremium`: `useDelayedData`, `useCommodityData`, `useRealtimeData`, `usePortfolio`, `CommodityChart`, `DirectExchangeFeeds`, `ChartFooter`, `Dashboard` upsell cards ✅
- `src/services/revenueCat.ts` (configure, getOfferings, purchasePackage, restore) ✅
- `supabase/functions/revenuecat-webhook` writes back to `profiles` ✅
- `PremiumPaywall` dialog component exists and calls into RevenueCat ✅

What's broken / missing:
- `Dashboard.handleUpgrade` just shows a "coming soon" toast → never opens the paywall
- `PremiumPaywall` only handles native (RevenueCat); on web it shows nothing actionable
- No Stripe Checkout edge function, no Stripe webhook
- No env vars for `VITE_REVENUECAT_ANDROID_KEY` / `VITE_REVENUECAT_IOS_KEY` (build secrets, user-side)
- Memory says "Paid App, no subscriptions" — contradicts the new direction

## Plan

### 1. Update monetization memory
Rewrite `mem://monetization/strategy` and the Core line in `mem://index.md` to: **Freemium model. Free tier = baseline. Premium tier unlocks gated features. Billing: RevenueCat on mobile (Play/App Store IAP), Stripe Checkout on web.** Remove the "no subscriptions" wording.

### 2. Fix the Upgrade button
In `Dashboard.tsx`, replace the toast in `handleUpgrade` with opening `PremiumPaywall` (lift the dialog state up, or render a single shared `<PremiumPaywall>` controlled at Dashboard level and pass `setPaywallOpen` to `PremiumUpsellCard`). Same for any other Upgrade entry points (Profile/Settings — to be added if missing).

### 3. Make `PremiumPaywall` web-aware
Currently RevenueCat-only. Branch on `usePlatform().isNative`:
- **Native** → existing RevenueCat flow.
- **Web** → call new `create-stripe-checkout` edge function, then redirect to the returned Stripe Checkout URL. Show price tiers fetched from a small static config (or from Stripe via the function).
- Add a "Restore purchases" button (native) and a "Manage subscription" link (web → Stripe billing portal).

### 4. Add Stripe billing (web)
New edge functions (JWT-validated, Zod-validated, generic errors per project security rules):

- `create-stripe-checkout` — input `{ priceId }`. Creates/looks-up a Stripe customer keyed to `auth.uid()`, creates a Checkout Session in `subscription` mode with `success_url` / `cancel_url` back to the app, returns `{ url }`.
- `stripe-webhook` — verifies Stripe signature, handles `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`. Updates `profiles.subscription_active`, `subscription_tier='premium'`, `subscription_end`. Mirrors what `revenuecat-webhook` already does.
- `create-stripe-portal` — returns a Stripe Customer Portal URL for managing/cancelling.

DB migration: add `profiles.stripe_customer_id text` (nullable, unique) so we can map auth users → Stripe customers without hitting Stripe each time. RLS unchanged (user reads own profile).

Secrets: `STRIPE_SECRET_KEY` already exists ✅. We'll need to add `STRIPE_WEBHOOK_SECRET` and `STRIPE_PRICE_PREMIUM_MONTHLY` / `STRIPE_PRICE_PREMIUM_YEARLY` after the user creates the product in Stripe.

### 5. RevenueCat mobile finalization
- Document required build secrets (`VITE_REVENUECAT_ANDROID_KEY`, `VITE_REVENUECAT_IOS_KEY`) — user must add these in Workspace Settings → Build Secrets.
- Confirm `REVENUECAT_WEBHOOK_AUTH` already set ✅.
- After purchase succeeds in `PremiumPaywall`, force-refetch the profile so `isPremium` flips immediately (don't rely solely on the webhook race).

### 6. Pricing tiers (proposed — confirm before building)
- **Free** — current baseline (delayed data, base commodity set, manual refresh)
- **Premium Monthly** — e.g. €9.99/mo
- **Premium Yearly** — e.g. €79.99/yr (save ~33%)

One single `premium` entitlement matches the existing code (`isPremium` boolean). No multi-tier yet.

### 7. UX polish on Auth/Settings
- Add a "Manage subscription / Upgrade" row in Profile/Settings that opens the paywall or portal depending on current state.
- Show current plan + renewal date when `isPremium`.

## Out of scope (call out, don't build)

- Trial periods, promo codes, family sharing — can be added later in RevenueCat/Stripe dashboard.
- Migrating any existing "paid app" purchasers — there shouldn't be any on production yet; if there are, we can grant lifetime entitlement manually.
- Reinstating ads — explicitly not doing this.

## Technical details

```text
                      ┌────────────────────┐
   Upgrade button ───▶│  PremiumPaywall    │
                      │  (isNative?)       │
                      └─────┬──────────┬───┘
                  native    │          │   web
                            ▼          ▼
                  RevenueCat IAP    create-stripe-checkout (edge)
                            │              │
                            ▼              ▼
                  revenuecat-webhook   stripe-webhook (edge)
                            └──────┬───────┘
                                   ▼
                       profiles.subscription_active=true
                       profiles.subscription_tier='premium'
                       profiles.subscription_end=…
                                   │
                                   ▼
                       AuthContext.isPremium = true
                       (unlocks all already-gated features)
```

Files to touch:
- `mem://monetization/strategy`, `mem://index.md` (Core line)
- `src/pages/Dashboard.tsx` (real handleUpgrade, host the paywall)
- `src/components/PremiumPaywall.tsx` (web branch + Stripe flow)
- `src/components/PremiumUpsellCard.tsx` (use shared paywall state)
- `src/services/stripeCheckout.ts` (new — thin client)
- `supabase/functions/create-stripe-checkout/index.ts` (new)
- `supabase/functions/stripe-webhook/index.ts` (new)
- `supabase/functions/create-stripe-portal/index.ts` (new)
- DB migration: `profiles.stripe_customer_id`
- `src/pages/Profile.tsx` or Settings (Manage subscription row)

## What I need from you after approval

1. Confirm or change the proposed price points (€9.99/mo, €79.99/yr).
2. After I scaffold Stripe, you'll need to: create the Product + 2 Prices in Stripe Dashboard, then provide `STRIPE_PRICE_PREMIUM_MONTHLY`, `STRIPE_PRICE_PREMIUM_YEARLY`, and `STRIPE_WEBHOOK_SECRET` (I'll prompt with `add_secret`).
3. For mobile: add `VITE_REVENUECAT_ANDROID_KEY` (and iOS if you ship iOS) in Workspace Settings → Build Secrets, and create the matching product + `premium` entitlement in RevenueCat.