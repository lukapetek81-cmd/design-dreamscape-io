
## Scope

Expand the commodity catalog from **46 → ~85** items, sourcing all non-energy quotes via CommodityPriceAPI (CPA). All new symbols update ≤10 min. Free tier stays curated (household names); everything niche becomes premium.

## Decisions confirmed
- **Groups**: Energy, Metals, Grains, Softs, **Livestock**, **Industrials** (new), Other
- **Tiering**: Free = household-name commodities only; Premium = niche, regional, exotic
- **Spot vs Futures**: Free user gets one variant (futures preferred); the other variant is Premium

---

## 1. Sidebar — add Industrials group
**File**: `src/components/sidebar/constants.ts`
- Add `{ id: "industrials", label: "Industrials", icon: Factory, color: "text-cyan-500" }` between Softs and Other.

## 2. Catalog mappings
**File**: `supabase/functions/_shared/commodity-mappings.ts`

Add the following entries to `COMMODITY_SYMBOLS`, `COMMODITY_PRICE_API_SYMBOLS`, `CATEGORY_MAPPINGS`, and (for niche items) `PREMIUM_COMMODITIES`.

### Free tier non-energy (household names)
| Display | CPA | Group |
|---|---|---|
| Gold Futures | XAU | metals |
| Silver Futures | XAG | metals |
| Platinum | PL | metals |
| Palladium | PA | metals |
| Copper | HG-SPOT | metals |
| Aluminum | AL-SPOT | metals |
| Zinc | ZINC | metals |
| Iron Ore | TIOC | metals (NEW — 10min interval) |
| Corn Futures | CORN | grains |
| Wheat Futures | ZW-SPOT | grains |
| Soybean Futures | SOYBEAN-FUT | grains |
| Soybean Oil | ZL | grains |
| Soybean Meal | ZM | grains |
| Oat Futures | OAT-SPOT | grains |
| Rough Rice | RR-FUT | grains |
| Coffee Arabica | CA | softs |
| Sugar #11 | LS11 | softs (switched from LS) |
| Cotton | CT | softs |
| Cocoa | CC | softs |
| Orange Juice | OJ | softs |
| Lumber Futures | LB-FUT | other |
| Live Cattle | LC1 | livestock (NEW) |
| Lean Hogs | LHOGS | livestock (NEW) |
| Milk | MILK | livestock (NEW) |

### Premium tier non-energy (niche / regional / exotic)
**Metals (premium)**: Lead Spot (LEAD-SPOT), Nickel Futures (NICKEL-FUT), Tin (TIN), Steel (STEEL), Hot-Rolled Coil Steel (HRC-STEEL), Titanium (TITAN), Magnesium (MG), Lithium (LC), Copper Futures (HG-FUT — spot variant), Aluminium Futures (AL-FUT), Lead Futures (LEAD-FUT), Nickel Spot (NICKEL-SPOT)

**Grains (premium)**: Wheat Futures (ZW-FUT — spot variant), Soybeans Spot (SOYBEAN-SPOT), Oats Future (OAT-FUT), Rough Rice Spot (RR-SPOT), Canola (CANOLA), Sunflower Oil (SUNF), Rapeseed Oil (RSO)

**Softs (premium)**: UK Sugar No 5 (LS), Tea (TEA), Wool (WOOL), Palm Oil (PO)

**Livestock (premium)**: Feeder Cattle (FC1), Cheese (CHE), Eggs CH (EGGS-CH), Eggs US (EGGS-US), Salmon (SALMON), Poultry (POUL), Butter (BUTTER), Potato (POTATO)

**Industrials (NEW group, mostly premium)**: Ethanol (ETHANOL), Rubber (RUBBER), Bitumen (BIT), Cobalt (COB), Rhodium (XRH), Polyethylene (POL), Polyvinyl Chloride (PVC), Polypropylene (PYL), Soda Ash (SODASH), Neodymium (NDYM), Tellurium (TEL), Diammonium Phosphate (DIAPH), Urea (UREA), Urea Ammonium Nitrate (UANEU), Gallium (GA), Indium (INDIUM), Kraft Pulp (K-PULP), Naphtha (NAPHTHA — note: existing `Naphtha` energy entry stays in OilPriceAPI; this is a separate industrial-grade)

**Energy duplicates skipped**: I will NOT add CPA's energy symbols (NG-FUT, WTIOIL-FUT, BRENTOIL-SPOT, RB-SPOT, HO-SPOT, NG-SPOT, COAL, UXA, METH, URAL-OIL, PROP, TTF-GAS, UK-GAS, LB-SPOT, BRENTOIL-FUT, RB-FUT, WTIOIL-SPOT, HO-FUT) because energy is exclusively served by OilPriceAPI per the existing rule (mem://integrations/energy-data-sourcing). Adding them would double-bill quota and conflict with the energy memory.

### CENT_QUOTED_SYMBOLS additions
Add `LS11`, `SOYBEAN-SPOT`, `RUBBER` (¢-quoted per the spec).

### isPremiumCommodity stays as-is
`PREMIUM_COMMODITIES` Set just gets the new niche names appended.

## 3. Cache + quota
**File**: `supabase/functions/_shared/commodity-service.ts`
- Bump `CACHE_TTL_MS` from 1h → **2h** to absorb the larger catalog.
- New burn estimate: ~60 CPA symbols (free+premium) ÷ 5/req × 12 refreshes/day × 30 ≈ **4.3K calls/month** + ~1.5K for charts ≈ **5.8K/month** → comfortably under 10K cap.

## 4. No frontend changes needed
- `CommodityGroupSection`, `CommoditySidebar`, screener etc. all read groups from `CATEGORY_MAPPINGS` + `COMMODITY_GROUPS`, so they pick up Industrials + new items automatically.
- Premium gating already flows through `PREMIUM_COMMODITIES` → `fetchAllCommodities(isPremium)`.

## 5. Memory update
Update `mem://integrations/commoditypriceapi-config` and `mem://project/commodity-catalog-scope` to reflect the new ~85-item catalog and the 2h cache.

## What I will NOT touch
- Edge function endpoints (`fetch-all-commodities`, `fetch-commodity-prices`, etc.) — schema unchanged
- DB schema — no migration needed (commodity catalog is purely code-level)
- Energy commodities — sourced exclusively via OilPriceAPI, untouched
- Frontend components — they already iterate `CATEGORY_MAPPINGS`

## Verification after build
1. Hit `/fetch-all-commodities` for a free user → expect ~14 energy + ~24 non-energy = ~38 items
2. Hit `/fetch-all-commodities` for a premium user → expect ~85 items
3. Open dashboard → confirm new "Industrials" sidebar group appears with locked-state cards for free users
4. Spot-check Iron Ore, Cattle, Lithium, Rhodium prices populate

Ready to implement?
