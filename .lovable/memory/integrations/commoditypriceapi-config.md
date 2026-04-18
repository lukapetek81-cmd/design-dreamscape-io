---
name: CommodityPriceAPI Configuration
description: Non-energy commodity quotes via CommodityPriceAPI v2 (Lite plan); FX rates via Frankfurter.app; FMP fully removed
type: integration
---
**Provider**: CommodityPriceAPI v2 (https://api.commoditypriceapi.com/v2)
**Auth**: `x-api-key` header. Secret: `COMMODITYPRICE_API_KEY`.
**Plan**: Lite — 5 symbols/request, 10 req/min, **2,000 calls/month**.

**What CPA serves**: All non-energy commodities (25 items) — metals, grains, softs, lumber.
**What OilPriceAPI serves**: All energy commodities (26 items) — crude, gas, refined, marine fuels.
**FX**: `currency-rates` edge fn → Frankfurter.app (free, ECB-sourced, no key).

**CPA symbol map** (`supabase/functions/_shared/commodity-mappings.ts → COMMODITY_PRICE_API_SYMBOLS`):
XAU, XAG, PL, PA, HG-SPOT, AL-SPOT, ZINC, CORN, ZW-SPOT, SOYBEAN-FUT, ZL, ZM, OAT-SPOT, RR-FUT, CA, LS, CT, CC, OJ, LB-FUT.
**Cents-quoted (÷100)**: CORN, SOYBEAN-FUT, ZL.

**Quota strategy**: All edge functions cache CPA results for **1 hour** (per-instance Map). Estimated burn: ~25 sym ÷ 5/req × 24 refresh/day ≈ 3.6K/month. Tighten cache or upgrade tier if exceeded.

**Removed commodities** (no provider equivalent): Feeder Cattle Futures, Lean Hogs Futures, Milk Class III. Catalog dropped 49→46.

**Disabled**: `realtime-commodity-stream` returns 410 Gone (5s WebSocket polling would burn quota in <7 min). Frontend should poll cached `/fetch-all-commodities` (1h cache).

**Reused**: `direct-exchange-feeds` now reads from cached `/fetch-all-commodities` snapshot — no per-commodity API calls.

**Charts**: `fetch-commodity-data` uses OilPriceAPI for energy history, CPA `/rates/time-series` for non-energy, Alpha Vantage as last resort.

**Fully removed**: `FMP_API_KEY` references in code (the secret still exists but is unused).
