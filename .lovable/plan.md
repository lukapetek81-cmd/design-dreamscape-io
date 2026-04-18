

## Goal
Set Premium pricing and catalog size so a single subscriber's API usage stays profitably below their monthly revenue contribution. Right now Premium unlocks ~55 extra commodities — most of which are quota-heavy OilPriceAPI calls — at $11.99/mo. Need to either raise price, cut catalog, or both.

## The economics problem

**Current state** (from memory + edge code):
- **OilPriceAPI**: paid plan, but quota-bound. Premium adds 20+ energy items that each burn calls on every refresh.
- **CommodityPriceAPI**: 10K calls/month plan, ~50% headroom currently.
- **Cache**: 1h TTL.
- **Price**: $11.99/mo or $89/yr.

**Cost per Premium user per month** (rough):
- Energy refresh: 20 premium energy items, cached 1h → 20 × 24 × 30 = **14,400 OilPriceAPI calls/user/mo** (worst case, single instance, no shared cache benefit at scale).
- Non-energy premium: 23 items via CPA, batched 5/req → ~3,300 CPA calls/user/mo.
- Charts (on-demand): ~50-200 calls/user/mo.

At even modest conversion (50 premium users), that's **720K OilPriceAPI calls/month** — well past any reasonable paid tier. The cache is per-instance, so it doesn't scale linearly.

**Conclusion**: Catalog + price both need adjustment. Cache TTL also.

## Recommended changes

### 1. Trim Premium catalog from ~55 → ~25 high-value items
Keep only the items traders actually quote. Remove duplicates (spot vs futures of same metal), niche regional crude, and exotic marine fuel sub-grades.

**Premium tier becomes** (~25 items):
- **Crude (4)**: WTI Midland, Mars, LLS, Western Canadian Select *(drop ANS, Indian Basket, Tapis, Urals — niche)*
- **Refined (6)**: Gasoline RBOB, Heating Oil, Jet Fuel, ULSD, Gasoil, Naphtha *(drop Propane, Ethanol — low retail demand)*
- **Marine fuels (3)**: VLSFO Global, HFO Rotterdam, MGO Singapore *(drop 5+ regional sub-grades — keep one per fuel type)*
- **Metals (8)**: Lead, Nickel, Tin, Steel, HRC Steel, Lithium, Cobalt, Titanium *(drop Magnesium, duplicate spot/futures pairs — keep futures only)*
- **Grains (2)**: Canola, Sunflower Oil *(drop Wheat Spot/Soybeans Spot/Oats Spot/Rough Rice Spot — already have futures equivalents in free tier; drop Rapeseed Oil — duplicate of Canola)*
- **Softs (2)**: Palm Oil, UK Sugar No 5 *(drop Tea, Wool — extremely niche)*
- **Livestock (0)**: Move all 8 to a separate "coming soon" or drop entirely *(dairy/eggs/poultry have ~zero retail trader demand — they're consumer commodities, not derivatives)*

**Net Premium catalog**: ~25 items (was ~55). Cuts API burn by ~55%.

### 2. Raise pricing
Current $11.99/mo undervalues premium given API costs. Recommended:
- **Monthly**: $19.99/mo *(was $11.99)*
- **Annual**: $149/yr *(was $89, saves ~38%)*
- Optional **founders/launch discount**: $14.99/mo for first 100 subscribers, marketed as limited.

Rationale: TradingView Pro is $14.95, Barchart Premier is $33.95/mo. $19.99 sits in the middle for a niche commodity-only tool, and gives ~$15 net per user after Stripe/store fees — comfortably above per-user API cost at the trimmed catalog.

### 3. Extend cache TTL: 1h → 2h
Energy + non-energy. Halves call burn instantly. Commodity spot prices don't move enough in 1h to justify the cost. Already noted as the escape valve in `commoditypriceapi-config.md`.

### 4. Update upsell card copy
- Headlines: "Unlock 25 Professional-Grade Commodities" (was "60+")
- Sublines: drop "60+" reference, replace with concrete "$19.99/mo or $149/yr"
- Per-group counts: recompute (Metals: 8, Grains: 2, Softs: 2, Livestock: 0 → remove livestock upsell card entirely)

## Files to change

| File | Change |
|------|--------|
| `supabase/functions/_shared/commodity-mappings.ts` | Trim `PREMIUM_COMMODITIES` set from ~55 → ~25 items per spec above |
| `supabase/functions/oil-price-api/index.ts` | Mirror trimmed `PREMIUM_ENERGY` set |
| `supabase/functions/_shared/commodity-service.ts` | `CACHE_TTL_MS`: 1h → 2h |
| `supabase/functions/_shared/api-clients.ts` | Cache TTL: 1h → 2h |
| `src/components/PremiumUpsellCard.tsx` | New copy + counts + price ($19.99/$149); remove `livestock` variant |
| `src/pages/Dashboard.tsx` | Remove `livestock` upsell render block |
| `mem://monetization/strategy` | Update price + trimmed catalog + new economics rationale |
| `mem://project/commodity-catalog-scope` | Update Premium count (~25) |
| `mem://integrations/commoditypriceapi-config` | Note 2h cache |

## What I will NOT touch
- Free tier: stays at ~30 items. Not affected.
- Stripe/RevenueCat product config: requires user to update price IDs in their billing dashboard separately. I'll flag this in the implementation message.
- Edge function premium gating logic: already correct, just consumes the trimmed set.

## Verification after build
1. Free user → sees same 30 commodities, same upsell cards (now showing "$19.99/mo").
2. Premium user → sees 30 free + ~25 premium = ~55 total (was ~85).
3. Dashboard Livestock group → no upsell card for free users (since 0 premium items there now).
4. OilPriceAPI dashboard → call volume should drop ~50-60% within 24h of cache change.

## Open question for user
Livestock currently has 8 premium items (cheese, eggs, salmon, butter, etc.). My recommendation is to **drop them entirely** — they have near-zero retail trader demand and just inflate the catalog. Alternative: keep them but mark as "experimental" with no upsell promotion. Plan above assumes drop.

