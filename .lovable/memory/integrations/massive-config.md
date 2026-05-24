---
name: Massive Futures Basic Configuration
description: Massive Futures Basic for CME/CBOT/COMEX/NYMEX non-energy quotes + history + forward curves
type: integration
---
**Provider**: Massive Futures Basic (https://api.massive.com)
**Auth**: `Authorization: Bearer ${MASSIVE_API_KEY}`
**Plan**: Free — 5 req/min, EOD only, 2y history. CME/CBOT/COMEX/NYMEX only (no ICE/LME).

**What Massive serves**: 15 non-energy commodities — Gold, Silver, Copper, Platinum, Palladium, Corn, Wheat, Soybeans (+ Oil/Meal/Oats/Rice), Live Cattle, Lean Hogs, Lumber. Front-month snapshot, daily aggs, and forward curves.

**Product code map**: `MASSIVE_PRODUCT_CODES` in `supabase/functions/_shared/commodity-mappings.ts`.

**Endpoints**:
- `/futures/v1/snapshot?product_code=X&order=last_trade_date.asc&limit=1` — front-month settlement + change.
- `/futures/v1/aggs/{ticker}/range/1/day/{from}/{to}` — daily OHLC bars.
- `/futures/v1/contracts?product_code=X&active=true&date=Y` — forward curve discovery (5-day walkback in `fetchMassiveCurve`).

**Rate-limit strategy**: `fetchAllFromMassive` runs 4 in parallel then sleeps 12s. Cold full snapshot ~40s for 15 items. Shared 6h cache in `commodity-service.ts` means runtime cost is near zero.

**Helpers** (`supabase/functions/_shared/massive-client.ts`):
- `fetchMassiveFrontMonth(productCode)` → `{ ticker, price, change, changePercent, asOf }`
- `fetchMassiveFrontMonthBars(productCode, from, to)` → daily bars
- `fetchMassiveCurve(productCode, monthsAhead)` → forward curve

**ICE/LME items** (Coffee, Sugar, Cotton, Cocoa, OJ, Canola, Aluminum, Zinc, Lead, Nickel, Tin) stay on FMP free tier — see `mem://integrations/fmp-data-config`.
