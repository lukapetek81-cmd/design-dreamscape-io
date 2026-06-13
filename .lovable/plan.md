## Goal
Display every commodity price with its **correct unit suffix** so users immediately see what the number means (e.g. `$6.63/lb` for Copper, `$1,749.40/oz` for Platinum, `$84.88/bbl` for WTI, `454.75¢/bu` for Corn). Copper stays in **$/lb** (current quoting).

## What changes

### 1. New unit map in `src/lib/commodityUtils.ts`
Add a `getPriceUnit(commodityName: string): string` returning the suffix string:

| Group | Examples | Suffix |
|---|---|---|
| Precious / Platinum-group metals | Gold, Silver, Platinum, Palladium | `/oz` (troy oz) |
| Industrial metals | Copper | `/lb` |
| Crude oils | WTI, Brent | `/bbl` |
| Natural Gas | Natural Gas | `/MMBtu` |
| Refined products | Gasoline RBOB, Heating Oil | `/gal` |
| Grains | Corn, Wheat, Soybean, Oat, Rough Rice | `/bu` |
| Soy products | Soybean Oil | `/lb`, Soybean Meal | `/ton` |
| Softs (cent-priced) | Coffee, Sugar, Cotton, Orange Juice | `/lb` |
| Cocoa | Cocoa | `/mt` |
| Livestock | Live/Feeder Cattle, Lean Hogs | `/lb` |
| Lumber | Lumber Futures | `/bd ft` |
| Dairy/Eggs | Eggs | `/doz`, Cheese/Butter | `/lb`, Milk | `/cwt` |
| Unknown | fallback | `` (empty) |

### 2. Update `formatPrice(price, commodityName, decimals?)`
Append `getPriceUnit(commodityName)` to the returned string. Existing cent vs. dollar logic is preserved — Copper continues to render as `$6.63`, just becomes `$6.63/lb`; Corn becomes `454.75¢/bu`.

Add an optional `withUnit = true` flag so callers that need a bare number (chart axis labels, CSV exports) can opt out.

### 3. Audit call sites
Files using `formatPrice` already (keep suffix on — that's the point):
- `src/components/CommodityCard.tsx`
- `src/components/CandlestickChart.tsx` (header + OHLC tooltip)
- `src/components/DirectExchangeFeeds.tsx`

Opt out (`withUnit: false`) where the unit would clutter dense numeric layouts:
- Chart **Y-axis tick labels** in `CandlestickChart.tsx` and any line chart formatter — show numbers only, since the chart title already names the commodity.

Places that format prices manually (bypassing `formatPrice`) need the same treatment — quick sweep:
- `src/components/CommoditySidebar.tsx`
- `src/components/VirtualizedCommodityList.tsx`
- `src/pages/MarketScreener.tsx`
- `src/pages/Portfolio.tsx`, `src/components/PositionCard.tsx`
- `src/pages/ForwardCurves.tsx`, `TermStructure.tsx`, `RollScanner.tsx`, `VolatilityCone.tsx`, `SpreadCalculator.tsx`, `PositionCalculator.tsx`
- `src/components/charts/ChartHeader.tsx`

For these, replace manual `` `$${price.toFixed(2)}` `` patterns with `formatPrice(price, name)`.

### 4. No backend changes
All edge-function unit conversion in `supabase/functions/_shared/commodity-units.ts` is already correct (Copper → `usd_per_lb`, Platinum → `usd_per_troy_oz`). This is purely a presentation-layer change.

### 5. QA
- Dashboard cards: confirm Gold `/oz`, Copper `/lb`, WTI `/bbl`, Natural Gas `/MMBtu`, Corn `¢/bu`.
- Chart header shows `$1,749.40/oz`; chart Y-axis ticks stay bare numbers.
- Market Screener table rows render suffix without breaking column width.
- Copilot responses that quote prices via the same helper inherit the suffix automatically.

## Out of scope
- Changing Copper to cents/lb (user chose to keep $/lb).
- Localized unit conversion (no kg/mt toggle for industrial metals).
- Backend unit-conversion edits.
