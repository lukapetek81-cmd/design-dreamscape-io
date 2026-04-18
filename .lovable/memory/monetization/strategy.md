---
name: Monetization Strategy
description: Freemium model — free tier (34 commodities) + premium tier unlocks 16 quota-heavy energy items
type: feature
---
**Model**: Freemium (changed from Paid App on 2026-04-18 due to OilPriceAPI quota constraints).

**Free tier** (34 commodities):
- Crude majors: WTI, Brent, Dubai, Oman, Murban, OPEC, Indian, Tapis, Urals, WCS
- Natural gas: NG, UK Gas, Dutch TTF, JKM LNG
- All metals (7), grains (7), softs (5), lumber (1)

**Premium tier** adds 16 quota-heavy energy items:
- Regional crude: WTI Midland, ANS, Mars, Louisiana Light Sweet
- Refined: Gasoline RBOB, Heating Oil, Jet Fuel, ULSD, Gasoil, Naphtha, Propane, Ethanol
- Marine fuels: VLSFO/HFO/MGO (global + Rotterdam, Singapore, Houston, Fujairah)

**Source of truth**: `PREMIUM_COMMODITIES` set in `supabase/functions/_shared/commodity-mappings.ts` (and mirrored as `PREMIUM_ENERGY` in `oil-price-api/index.ts`).

**Enforcement**:
- `fetch-all-commodities` reads JWT → checks `profiles.subscription_active && subscription_tier !== 'free'` → passes `includePremium` to `CommodityService.fetchAllCommodities()`.
- `oil-price-api` filters batch requests against `PREMIUM_ENERGY` unless `includePremium: true` in body.
- Cache keyed per-flag (`all-commodities:free` vs `all-commodities:premium`) — no cross-tier leakage.
- Free users never trigger OilPriceAPI calls for premium items → protects monthly quota.

**Why**: OilPriceAPI free-tier quota was exhausted by aggressive batch calls across all 26 energy items. Gating non-essential energy behind premium reduces baseline burn by ~60%.

**Frontend**: `useAuth().isPremium` is the canonical client-side check. Edge functions re-verify via JWT — never trust client claims.
