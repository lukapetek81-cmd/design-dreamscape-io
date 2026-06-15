## Scope

The premium tools with a selectable-commodity dropdown are:

- **Forward Curves** — already has WTI + Brent. No change.
- **Volatility Cone** (Pro) — driven by `MASSIVE_ANALYTICS_PRODUCTS`.
- **Term Structure** (Pro) — driven by `MASSIVE_ANALYTICS_PRODUCTS`.
- **Roll Scanner** (Pro) — scans its own `PRODUCTS` list server-side.

WTI and Brent need to appear in the three Massive-backed tools. Adding two rows to the shared dropdown + four backend product maps covers it.

## Note on data sourcing

The project rule "Energy from OilPriceAPI exclusively" applies to **live spot prices** shown on the dashboard. The premium analytics tools (vol cone, term structure, roll scanner) use Massive Futures **historical settlement bars** for futures contracts — a different data product. Adding `CL` (WTI) and `BZ` (Brent) here uses Massive's futures history; the live energy feeds on the dashboard stay on OilPriceAPI. No conflict.

## Changes

### 1. Frontend dropdown — `src/hooks/useMassiveAnalytics.ts`

Add two entries at the top of `MASSIVE_ANALYTICS_PRODUCTS`:

```ts
{ id: 'wti',   label: 'WTI Crude' },
{ id: 'brent', label: 'Brent Crude' },
```

Both Vol Cone and Term Structure pages render from this list, so no changes there.

### 2. Edge function product maps

Add the same two rows to:

- `supabase/functions/massive-vol-cone/index.ts` → `PRODUCTS`
- `supabase/functions/massive-term-structure/index.ts` → `PRODUCTS`
- `supabase/functions/warm-vol-cones/index.ts` → `PRODUCTS`
- `supabase/functions/massive-roll-scanner/index.ts` → `PRODUCTS` (with `category: 'energy'`)

Using Massive codes: `wti → CL`, `brent → BZ` (same as fetch-forward-curve).

All four functions derive their Zod enum from `Object.keys(PRODUCTS)`, so validation updates automatically. Roll Scanner's cache key (`'all'`) covers the new products on the next refresh.

### 3. Seed the snapshots

After deploy, kick `warm-vol-cones` once so WTI/Brent Vol Cone returns instantly instead of blocking on the first user request. Roll Scanner uses an in-memory cache that auto-refreshes on the next miss — no seed needed. Term Structure fetches on demand and is fast enough not to need warming.

SQL snippet (same shape as the existing cron call, embeds `ALERT_EVALUATOR_SECRET`) will be provided in chat for you to paste once.

## Files

- `src/hooks/useMassiveAnalytics.ts`
- `supabase/functions/massive-vol-cone/index.ts`
- `supabase/functions/massive-term-structure/index.ts`
- `supabase/functions/warm-vol-cones/index.ts`
- `supabase/functions/massive-roll-scanner/index.ts`

## Out of scope

- Live energy spot feeds (stay on OilPriceAPI per project rule).
- Position Calculator / Price Alerts (already cover crude via `CRUDE` and `brent_wti` spread).
- Sentiment / Correlation pages (they already include Crude Oil in their own lists).