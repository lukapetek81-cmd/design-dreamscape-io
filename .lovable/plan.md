## Goal

Make every "Upgrade to Premium" button actually start a purchase flow instead of showing the "coming soon" toast.

## What's broken today

1. **`Dashboard.tsx` short-circuits the paywall.** It passes a `handleUpgrade` callback to every `PremiumUpsellCard` that just fires a toast saying *"Premium subscriptions coming soon — Stripe checkout will be enabled shortly."* This overrides the card's built-in behavior, which already knows how to:
   - open the `PremiumPaywall` dialog on native (Android), and
   - open the Play Store listing on web.
2. **RevenueCat env var name mismatch.** `.env` defines `VITE_REVENUECAT_API_KEY`, but `src/services/revenueCat.ts` reads `VITE_REVENUECAT_ANDROID_KEY` / `VITE_REVENUECAT_IOS_KEY`. Result: `isRevenueCatAvailable()` returns `false` even inside the Android app, so the paywall renders *"Subscriptions are not available right now"* and no purchase can ever start.
3. **No global "Upgrade" entry point** outside the per-group upsell cards (e.g. profile menu, sidebar). Optional but worth fixing while we're here.

## Plan

### 1. Remove the override in Dashboard
- In `src/pages/Dashboard.tsx`, drop `handleUpgrade` and the `onUpgrade={handleUpgrade}` prop on all 6 `PremiumUpsellCard` instances. Letting `PremiumUpsellCard` use its own default handler is what we want — it already does the right thing per platform (paywall on native, Play Store deep link on web), and on web it uses the canonical `PLAY_STORE_URL` constant.
- Remove the now-unused `useToast` import if nothing else uses it.

### 2. Fix the RevenueCat key wiring
- Update `src/services/revenueCat.ts` to read `VITE_REVENUECAT_API_KEY` as the Android key (matching the `.env` value `goog_…`, which is an Android SDK key). Keep optional `VITE_REVENUECAT_IOS_KEY` for the future iOS build.
- Keep `isRevenueCatAvailable()` semantics unchanged (only true on native + key present).
- No `.env` change needed; the existing Android key stays.

### 3. Verify the purchase path end-to-end (no code, just confirm)
- `PremiumPaywall` already calls `configureRevenueCat → getOfferings → purchasePackage → auth.refreshProfile`.
- Backend webhook `supabase/functions/revenuecat-webhook/index.ts` already exists and updates `profiles.subscription_active` / `subscription_tier` on `INITIAL_PURCHASE` / `RENEWAL` / `CANCELLATION`. Nothing to add server-side.
- After a successful purchase, `auth.refreshProfile()` re-reads the profile so `isPremium` flips to `true` and the upsell cards disappear.

### 4. Add a global "Upgrade to Premium" entry (small, optional)
- Add an "Upgrade to Premium" item to the user profile dropdown / sidebar footer that opens `PremiumPaywall` (native) or the Play Store (web), only shown when `!isPremium`. This gives users a way to upgrade without first navigating to a premium-gated group.

## Out of scope
- Web (Stripe) checkout — per memory, web subs are deferred and CTAs deep-link to Play Store.
- Pricing/offering setup in the RevenueCat dashboard — must be done by you in the RevenueCat console (Offering → "default" → monthly + annual packages tied to Play Console SKUs). Without that, `getOfferings()` returns `null` and the paywall shows the "not available" state. I'll flag this in the final message.
- iOS support (no key, no build target yet).

## Files touched
- `src/pages/Dashboard.tsx` — remove `handleUpgrade` + the 6 `onUpgrade` props.
- `src/services/revenueCat.ts` — read `VITE_REVENUECAT_API_KEY` as Android key.
- (Optional, step 4) `src/components/UserProfile.tsx` or sidebar footer — add "Upgrade to Premium" entry.

## Verification
- Web preview: clicking "Get the Android app" on any upsell card opens the Play Store URL (current behavior, just no longer suppressed by the toast).
- Android build: `isRevenueCatAvailable()` returns `true`, paywall lists Monthly/Annual packages from RevenueCat, tapping triggers the Google Play purchase sheet, webhook flips `subscription_active`, UI rerenders without upsell cards.
