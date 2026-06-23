
## What's already integrated (no work needed)

- **JKM spot** — `Japan/Korea LNG` → `JKM_LNG_USD` is live in `oil-price-api`, `warm-energy-prices`, `fetch-commodity-data`, and the premium catalog.
- **Dutch TTF / UK Natural Gas spot** — already mapped (`DUTCH_TTF_EUR`, `NATURAL_GAS_GBP`).
- **WTI / Brent / Henry Hub (Natural Gas) / RBOB Gasoline / ULSD Diesel spot** — already pulled from OilPriceAPI by name; today they use the generic feed, not the EIA-sourced variants Karl mentions.
- **Forward curves UI** — `ForwardCurves` page + `useForwardCurve` hook + `fetch-forward-curve` edge function already exist, but currently sourced from **FMP futures** (CL/BZ/NG/GC/SI/HG/ZC/ZS/ZW). JKM/UKA/EUA are not in `CURVE_COMMODITIES`.

## What's missing

1. **JKM forward curve** (M1…M12) — only spot today.
2. **UKA carbon futures** — no mapping, no catalog entry.
3. **EUA carbon futures** — no mapping, no catalog entry.
4. **EIA-sourced variants** for WTI, Brent, Henry Hub, US diesel, US gasoline — Karl says the API now exposes deeper EIA-sourced feeds that should replace the generic feeds "where it counts".

## Recommended integration

### A. Spot prices (carbon + EIA upgrades) — smallest change, biggest payoff

Add to `OIL_BLEND_CODES` in **three** files (`oil-price-api`, `warm-energy-prices`, `fetch-commodity-data`) and to `commodity-mappings.ts` + `PREMIUM_COMMODITIES`:

| Display name | OilPriceAPI code (to confirm with Karl) | Category | Premium? |
|---|---|---|---|
| UK Carbon (UKA) | `UKA_CARBON_GBP` | emissions | ✅ |
| EU Carbon (EUA) | `EUA_CARBON_EUR` | emissions | ✅ |

For EIA-sourced benchmarks, **swap the existing code** for the EIA variant on the same display name (WTI, Brent, Natural Gas, ULSD Diesel, Gasoline RBOB). One row per benchmark, no UI clutter — users just get better data. A short comment + commit message documents the swap.

New `emissions` category needs:
- Icon + color in `CommodityGroupSection` / sidebar `constants.ts`
- Unit label (`$/tCO₂e` or `£/tCO₂e`) in `_shared/commodity-units.ts`

### B. JKM forward curve

JKM contracts don't fit the FMP root-code pattern, so the cleanest path is a **second source** inside `fetch-forward-curve`:

- Extend `CURVE_COMMODITIES` (`src/utils/forwardCurveSymbols.ts`) with `{ id: 'jkm', label: 'Japan/Korea LNG', source: 'oilpriceapi' }`.
- In `fetch-forward-curve/index.ts`, branch on `source`: FMP path unchanged; OilPriceAPI path fetches `JKM_LNG_M1_USD … JKM_LNG_M12_USD` (codes to confirm), normalises into the same `{ symbol, expiry, price, monthIdx }` shape the UI already consumes.
- Add UKA + EUA curves the same way once we confirm OilPriceAPI exposes forward contracts for them (compliance-year futures, typically Dec-YY). If only spot is available, ship spot-only and skip the curve.
- Gate the JKM/UKA/EUA curves behind `isPremium` in the hook (same pattern as the existing premium-only commodities).

### C. Premium gating + paywall

All new SKUs go into `PREMIUM_COMMODITIES`. Free users see the row in the catalog with the existing "Premium" lock badge; tapping deep-links to the upgrade CTA (Play Store on Android, per the monetisation memory).

### D. Warmer + freshness audit

- Add new codes to `warm-energy-prices` so pg_cron keeps them fresh.
- `audit-premium-freshness` picks them up automatically once they're in `PREMIUM_COMMODITIES`.

## Open questions for Karl (we'll proceed with reasonable defaults if unanswered)

1. Exact OilPriceAPI codes for: JKM M1–M12, UKA, EUA, and the EIA-sourced WTI/Brent/Henry Hub/diesel/gasoline.
2. Whether UKA/EUA expose a forward curve or spot only.
3. How many JKM forward months to show (default: 12).

## Suggested rollout order

1. Spot UKA + EUA (1 edge fn change × 3 + catalog + units + icon).
2. Swap to EIA-sourced codes for the 5 benchmarks (single-line code swaps).
3. JKM forward curve (extend `fetch-forward-curve` with OilPriceAPI branch).
4. UKA/EUA forward curves if available.

No DB migration required — `commodity_price_snapshots` is keyed by `commodity_name` and will absorb the new rows automatically.
