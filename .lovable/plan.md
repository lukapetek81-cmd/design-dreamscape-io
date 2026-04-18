

The user is asking a strategic/advisory question about payment integrations for a standalone Android app, not requesting code changes. Per memory: this app is distributed via Google Play Store as a Paid App. Let me give a clear recommendation.

## Recommendation: Neither Stripe nor Paddle — use Google Play Billing

### The Play Store rule that overrides everything

Google Play Policy requires that **any digital goods or subscriptions sold inside an app distributed through the Play Store MUST use Google Play Billing**. Using Stripe/Paddle/PayPal for in-app subscription purchases violates policy and gets the app suspended.

This applies to:
- Premium tier unlocks (your "Premium Energy Markets")
- Monthly/annual subscriptions
- Any feature unlocked by payment inside the APK

This does NOT apply to:
- Physical goods (not your case)
- "Outside the app" purchases the user makes on a website (allowed if you don't link to it from the app — strict)

### What this means for Commodity Hub

Since the app is already live on Google Play as a Paid App (per `mem://launch/play-store-listing` and `mem://monetization/strategy`), introducing a premium tier means **two valid paths**:

| Path | How it works | Fee | Effort |
|---|---|---|---|
| **A. Google Play Billing (recommended)** | Use Capacitor plugin `@capacitor-community/in-app-purchases` or RevenueCat. User pays via their Google account. | 15% (first $1M/yr), then 30% | Medium — requires Play Console product setup + native plugin + receipt validation edge function |
| **B. Web-only checkout (Stripe/Paddle)** | Sell subscriptions only on the website (`commodity-hub.lovable.app`). Android app reads `subscription_tier` from Supabase but cannot mention/link to the web purchase. | 2.9% + $0.30 (Stripe) | Low — but conversion is terrible because Android users can't discover or buy from inside the app |

### My recommendation: **Path A — Google Play Billing via RevenueCat**

Why RevenueCat over raw Play Billing:
- Free up to $2.5K MTR (monthly tracked revenue) — covers you well past 100 MAU
- Handles receipt validation, renewals, refunds, grace periods automatically
- Webhook delivers subscription state to a Supabase edge function → updates `profiles.subscription_tier`
- Same SDK works if you later ship iOS (App Store Billing has the same 15/30% rule)
- Saves weeks of edge-case handling (proration, upgrades, refunds, grace periods)

### Architecture

```text
Android App (Capacitor)
  └─ @revenuecat/purchases-capacitor SDK
       └─ purchases premium product ($9.99/mo or $79/yr)
            └─ Google Play Billing (handles payment)
                 └─ RevenueCat receives receipt
                      └─ Webhook → Supabase edge function
                           └─ UPDATE profiles SET subscription_tier='premium'
                                └─ Frontend reads tier → unlocks Premium Energy Markets
```

### Pricing implication

The 15% Play fee changes break-even math from earlier:
- $9.99 → you net $8.49
- At 100 MAU with 12% conversion (12 users) → $101.88/mo net
- Still covers OilPriceAPI Pro ($99) — break-even, no margin
- Recommend bumping to **$11.99/mo or $89/yr** to absorb the Play fee and keep ~50% margin

### Action items if you approve

1. Create premium subscription product in Google Play Console ($11.99/mo, $89/yr)
2. Install `@revenuecat/purchases-capacitor`, configure SDK with RevenueCat API key
3. Build `PremiumPaywall` component triggered from `PremiumUpsellCard` CTA
4. Create RevenueCat account, configure Play Store integration
5. Add Supabase edge function `revenuecat-webhook` that updates `profiles.subscription_tier` and `subscription_active`
6. Update `PremiumUpsellCard` copy: "$11.99/mo or $89/yr — 38% off annual"
7. Test purchase flow with Play Console test account before release

### Short answer for the chat

**Use Google Play Billing (via RevenueCat), not Stripe or Paddle.** Selling subscriptions inside a Play Store app with Stripe violates Google's policy and risks suspension. Stripe/Paddle is only viable if you sell on the website and never mention it inside the app — which kills conversion for an Android-first product.

