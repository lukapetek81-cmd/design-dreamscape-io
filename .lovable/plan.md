

## Recommendation: Single unified upgrade

Stick with **one Premium tier that unlocks everything**. Do not split into per-group upgrades.

### Why single tier wins

**1. Matches your stated monetization model**
Your memory (`mem://monetization/strategy`) defines a single Paid App / Premium model at $11.99/mo or $89/yr. Per-group SKUs would contradict that and require Stripe/RevenueCat product restructuring.

**2. Higher revenue per user**
- Single tier: user pays $11.99 to unlock everything they might ever want.
- Per-group: user pays $2-3 for just "Metals" and never upgrades further. You cap your own ARPU.
- Industry data (Spotify, NYT, TradingView): bundled all-access consistently outperforms à la carte.

**3. Lower decision friction**
A trader looking at Lithium doesn't want to evaluate "is the Industrials pack worth it vs the Metals pack?" One button = one decision = higher conversion.

**4. Simpler engineering & support**
- One `isPremium` flag (already built).
- One Stripe product, one webhook path, one entitlement check.
- Per-group means 6 SKUs, 6 entitlement flags, partial-access edge cases in every query, and "I paid for Metals but Lithium is in Industrials?" support tickets.

**5. Your upsell cards already do the right thing**
The 6 variant cards (`energy`, `metals`, `grains`, `softs`, `livestock`, `industrials`) are *contextual marketing* for a *single* product. The user sees "Unlock 12 More Metals" while browsing Metals — but the CTA unlocks all 85 commodities. This is the best of both worlds: targeted messaging, unified product.

### When per-group *would* make sense (not your case)
- If groups had wildly different data costs (e.g., Metals required a $500/mo exchange feed). They don't — CPA covers everything on one plan.
- If you had a B2B audience buying single-desk access. You're consumer/retail.

### Suggested small refinement (optional)
Keep the contextual cards but make sure every CTA copy reinforces the **all-access** value:

> "Unlock 12 More Metals — **plus 60+ other premium commodities** across all groups"

This converts group-specific curiosity into full-tier intent. One-line copy tweak in `PremiumUpsellCard.tsx`, no architectural change.

### Verdict
Keep the single Premium tier. Optionally add the "plus 60+ others" subline to each upsell card to lift conversion.

