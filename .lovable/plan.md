# Revised: FMP → Massive swap, FMP retained only for ICE/LME

## Final provider split

| Category | Provider | Items |
|---|---|---|
| Energy (20) | OilPriceAPI | unchanged |
| CME/CBOT/COMEX/NYMEX non-energy (15) | **Massive Futures Basic** | Gold, Silver, Copper, Platinum, Palladium, Corn, Wheat, Soybeans, SoyOil, SoyMeal, Oats, Rough Rice, Live Cattle, Lean Hogs, Lumber |
| ICE/LME (11) | **FMP free tier** | Coffee, Sugar, Cotton, Cocoa, OJ, Canola, Aluminum, Zinc, Lead, Nickel, Tin |

FMP load drops from ~26 quotes → 11 quotes per refresh (≈58% reduction). With the existing 6h cache that's well under FMP free's 250 req/day cap.

Catalog stays at 46 items. No UI/UX loss.

## Implementation

### 1. `_shared/commodity-mappings.ts`
- Keep `COMMODITY_SYMBOLS` as-is (all 46).
- Split symbol maps:
  - `MASSIVE_PRODUCT_CODES` — commodity name → Massive product_code, only for CME/CBOT/COMEX/NYMEX non-energy (15 entries).
  - `FMP_SYMBOLS` — slimmed down to ICE/LME items only (11 entries). Drop everything Massive will cover.
- Remove `FMP_FUTURES_ROOTS` (forward curve already on Massive).

### 2. `_shared/massive-client.ts`
Add to existing file:
- `fetchMassiveFrontMonth(productCode)` — `GET /futures/v1/snapshot?product_code=X&order=last_trade_date.asc&limit=1`. Returns `{ticker, price, change, changePercent, volume, asOf}`. **1 API call per commodity**, no separate contracts call.
- `fetchMassiveDailyBars(ticker, from, to)` — `GET /futures/v1/aggs/{ticker}/range/1/day/{from}/{to}` for chart history.

### 3. `_shared/commodity-service.ts`
- Replace `fetchAllFromFmp` with two methods:
  - `fetchAllFromMassive(includePremium)` — iterates 15-entry map with **5-req/12s throttle** to respect Basic plan limit; uses `EdgeRuntime.waitUntil` on cold cache so users never block.
  - `fetchAllFromFmp(includePremium)` — keeps the existing batched `/v3/quote/` call but only with the 11 ICE/LME symbols.
- Merge order: oil + massive + fmp.
- Cache key + DB snapshot fallback (existing day-over-day logic) unchanged.
- Rewrite `fetchFmpTimeseries` → `fetchChartHistory`: routes through Massive aggs for CME-side names, falls back to FMP historical for ICE/LME, then Alpha Vantage, then synthetic.

### 4. `fetch-commodity-prices/index.ts` & `fetch-commodity-data/index.ts`
- Route quote/history through the new service methods. FMP code path kept only for symbols in the slimmed `FMP_SYMBOLS` set.

### 5. Frontend
- No changes. Service output shape stays identical.

### 6. Cold-cache UX safety
- First request after a worker boot triggers Massive throttled fetch in the background (`EdgeRuntime.waitUntil`).
- Foreground response returns: OilPriceAPI live + FMP live (1 batched call) + last snapshot from DB for Massive items.
- Subsequent requests within 6h hit the populated cache.

### 7. Memory updates
- Core data-sourcing line: `Energy: OilPriceAPI. CME/CBOT/COMEX/NYMEX: Massive Futures Basic. ICE/LME: FMP free.`
- New `mem://integrations/massive-config` documenting product codes, throttle, plan limits.
- Update `mem://integrations/fmp-data-config`: scope reduced to 11 ICE/LME symbols.
- `mem://project/commodity-catalog-scope`: still 46.

## Files touched
- `supabase/functions/_shared/commodity-mappings.ts`
- `supabase/functions/_shared/commodity-service.ts`
- `supabase/functions/_shared/massive-client.ts`
- `supabase/functions/fetch-commodity-prices/index.ts`
- `supabase/functions/fetch-commodity-data/index.ts`
- `.lovable/memory/index.md` + the two memory files above

## Out of scope
- Forward curve (already on Massive).
- `_shared/fmp-client.ts` kept (still used for the 11 ICE/LME items).
- Legal page / marketing copy.

Approve and I'll execute.
