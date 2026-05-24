## Goal

Migrate non-energy commodity sourcing from CommodityPriceAPI (CPA) to FMP Starter (`/v3/quote/`), drop ~12 niche commodities that FMP cannot quote, and switch the forward curve to FMP's individual monthly contract symbols for real term-structure data.

Energy stays on OilPriceAPI per project rule (mem://integrations/energy-data-sourcing).

---

## Step 1 — Trim the catalog (drop 12 FMP-unsupported commodities)

Remove from `supabase/functions/_shared/commodity-mappings.ts`:

- **Metals (5):** Iron Ore, Hot-Rolled Coil Steel, Titanium, Lithium, Cobalt
- **Grains (1):** Sunflower Oil
- **Softs (3):** UK Sugar No 5, Palm Oil, Industrial Ethanol (industrial)
- **Industrials (1):** Rubber
- **Livestock (1):** Milk
- **Misc (1):** Steel (LME)

Result: 46 → 34 commodities. Also remove these entries from `COMMODITY_PRICE_API_SYMBOLS`, `PREMIUM_COMMODITIES`, and `CATEGORY_MAPPINGS`.

## Step 2 — Add FMP symbol map for the remaining 14 non-energy commodities

New constant in `commodity-mappings.ts`: `FMP_SYMBOLS` mapping our commodity name → FMP front-month continuous symbol (already used in catalog: `GC=F`, `SI=F`, `HG=F`, `PL=F`, `PA=F`, `ALI=F`, `ZNC=F`, `PBF=F`, `NIF=F`, `SN=F`, `ZC=F`, `ZW=F`, `ZS=F`, `ZL=F`, `ZM=F`, `ZO=F`, `ZR=F`, `RS=F`, `KC=F`, `SB=F`, `CT=F`, `CC=F`, `OJ=F`, `LE=F`, `HE=F`, `LBS=F`).

Add `FMP_FUTURES_ROOTS` for the 9 forward-curve commodities (e.g. `gold → GC`, `corn → ZC`, `wheat → ZW`, etc.) — needed for monthly contract symbols like `GCZ26`.

## Step 3 — New shared FMP client

`supabase/functions/_shared/fmp-client.ts`:

- `fetchFmpQuote(symbol)` — single quote
- `fetchFmpQuotes(symbols[])` — comma-joined batch via `/v3/quote/{a,b,c}` (one call, all symbols)
- `fetchFmpFuturesCurve(root, monthsAhead)` — generates monthly contract symbols (`GCG26`,`GCH26`,…) and calls one batch endpoint; returns `{symbol, expiry, price}[]`
- Centralised key read (`FMP_API_KEY`), error handling, 6-hour cache, rate-limit aware retry.

## Step 4 — Rewrite `_shared/commodity-service.ts` to use FMP

Replace the CPA branch in `fetchAllCommodities` with a single batched FMP call (`fetchFmpQuotes(remaining 26 non-energy symbols)`). Energy branch (OilPriceAPI) untouched. Drop `cpaApiKey`, `CENT_QUOTED_SYMBOLS`, CPA-specific normalisation logic. Keep the same `CommodityData` output shape so consumers don't change.

## Step 5 — Rewrite `fetch-forward-curve` for real curves

In `supabase/functions/fetch-forward-curve/index.ts`:

- Energy commodities (wti/brent/natgas): keep OilPriceAPI front-month, **still cost-of-carry modelled** (no Business+). Tag `source: 'model'`.
- Non-energy (gold/silver/copper/corn/soybeans/wheat): call `fetchFmpFuturesCurve(root, monthsAhead)`. Tag `source: 'market'`.
- Graceful fallback: if any FMP contract symbol returns null/empty (Starter plan unsupported month), fall back to cost-of-carry for that single commodity and tag `source: 'model'`.
- Response includes `source`, contango/backwardation detection unchanged.

## Step 6 — Frontend badge "Live ICE / Modelled"

In the Forward Curve component (under `src/`), read the response `source` field and render a small pill: `Live` (teal) when `source === 'market'`, `Modelled` (amber) when `source === 'model'`. Keep the existing amber disclaimer for modelled.

## Step 7 — Clean up CPA references

- Delete `COMMODITY_PRICE_API_SYMBOLS`, `CENT_QUOTED_SYMBOLS`, and the CPA exports.
- Search-and-remove CPA usage in: `fetch-commodity-data`, `fetch-commodity-prices`, `realtime-commodity-stream`, `audit-premium-freshness`, `enhanced-commodity-news`, `health-check`, `fetch-all-commodities`, `api-docs`, `direct-exchange-feeds`, `src/services/commodityApi.ts`, `src/components/ApiSettings.tsx`, `src/pages/APIComparison.tsx`, `src/utils/preloadCriticalResources.ts`, `src/utils/security.ts`.
- Keep `COMMODITYPRICE_API_KEY` secret in Supabase but unused (don't delete in code—user can revoke later).

## Step 8 — Update memory

Update `mem://integrations/fmp-data-config` to note: Starter plan, `/v3/quote/` batch for spot + individual contract symbols (e.g. `GCG26`) for full curve. Add new `mem://integrations/cpa-removed` constraint memory listing the 12 dropped commodities and why (FMP doesn't quote them, CPA dropped for cost).

## Step 9 — Cleanup migration (optional, deferred)

No DB schema change needed. Snapshots for dropped commodities can stay (historical record). Add a one-time SQL script later if you want to purge them — not part of this plan.

---

## Technical notes

- **FMP batch endpoint:** `GET https://financialmodelingprep.com/api/v3/quote/SYM1,SYM2,SYM3?apikey=…` returns array. Single call covers all spot quotes per refresh cycle (~1 call/6h with current cache).
- **FMP futures contract symbols:** format `{ROOT}{MONTH_CODE}{YY}` — same MONTH_CODES already in `fetch-forward-curve`. Example: `GCG26` (Gold Feb 2026). Verified available on Starter for energy + metals + grains + softs.
- **Rate budget:** Dashboard refresh ~1 batch call/6h × 30 days = ~120 calls/mo. Forward curve ~9 commodities × ~4 user-triggered loads/day = ~1,100 calls/mo. Total <2% of Starter's 300K monthly budget. Well clear of the old Basic-tier per-minute limit.
- **No DB migration needed.** All changes are code-only.
- **Rollback:** if FMP Starter has unexpected issues, revert to CPA branch by keeping the old code paths in git history (don't physically delete `commodity-service.ts` CPA branch in step 4 until step 7 confirms cutover works).

---

## Out of scope

- Removing the CPA secret from Supabase (user-driven).
- Real energy forward curves (would need OilPriceAPI Business+ — separate decision).
- UI redesign of Forward Curve chart beyond the source badge.
