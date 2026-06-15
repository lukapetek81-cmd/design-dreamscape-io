## Problem

`massive-vol-cone` blocks every request on a 5-year Massive Futures fetch + rolling-vol math. When Massive is slow or thin on history, requests hang or return `insufficient_history`. Some products (copper, silver, lumber) have no snapshot yet, so the fallback can't save them.

Recent failures in the console: `copper`, `silver`, `lumber` all returning non-2xx.

## Goal

Make Vol Cones feel instant for every supported product, even when Massive is slow or returns thin history. Background-refresh the data on a schedule so users never wait on the upstream API.

## Plan

### 1. Snapshot-first edge function (`massive-vol-cone`)

Rewrite the request path so it never blocks on Massive when a snapshot exists:

```text
request → auth + tier check
       → read analytics_snapshots row for this commodity
            ├─ fresh (< 6h)  → return payload, stale=false
            ├─ stale (>= 6h) → return stale payload immediately,
            │                  fire-and-forget recompute in background
            └─ missing       → try live fetch once (current behavior),
                               then persist snapshot
```

Concretely:
- Move the existing `fetchMassiveFrontMonthBars` + cone math into a `computeAndStore(commodity)` helper.
- Default path: read snapshot, return it. If older than `CACHE_TTL_MS`, kick off `EdgeRuntime.waitUntil(computeAndStore(commodity))` so the response ships in <200 ms.
- Only do a blocking compute when no snapshot row exists at all.

### 2. Relaxed history threshold

The current `bars.length < 130` cutoff fails the whole request for thinly-traded products (lumber). Change to:
- Require ≥ 30 bars to return anything.
- For each window in `[10, 20, 60, 120]`, only emit cone stats if `bars.length >= window + 21`; otherwise emit that row with `current: null` and `note: 'insufficient_history'`.
- Headline `currentVol` / `percentile1y` falls back from 20-day → 10-day → null with a `headlineWindow` field so the UI knows what it's showing.

### 3. Scheduled warmer

New edge function `warm-vol-cones` (verify_jwt=false, gated by `X-Cron-Secret: ALERT_EVALUATOR_SECRET` — reusing the same secret to avoid adding another).

- Iterates the 11 products sequentially with `await` (one at a time so we never hammer Massive).
- Per-product try/catch; logs failures, continues.
- Updates `analytics_snapshots` rows.
- Scheduled via `pg_cron` every 4 hours (`0 */4 * * *`) using the same `net.http_post` pattern as the price-alert evaluator. SQL provided in chat for you to paste in the SQL editor (it embeds the cron secret).

### 4. Manual seed for the three failing products

After deploy, call `warm-vol-cones` once via curl so copper / silver / lumber get an initial snapshot. If Massive still returns nothing for a product, the snapshot row carries `error: 'no_history'` so the UI can show a clean "Data unavailable" instead of a spinner.

### 5. Frontend polish (`src/pages/VolatilityCone.tsx`)

Light touches only:
- When `stale === true`, show a small badge "Refreshing… (last updated {asOf})" next to the title.
- When a cone row has `note: 'insufficient_history'`, render an em-dash with a tooltip ("Not enough settled bars for this window yet — try a shorter window") instead of an empty cell.
- No paywall/business-logic changes.

## Out of scope

- No new tables, no schema changes (reusing `analytics_snapshots`).
- No changes to the Massive client itself.
- No client-side polling — staleness is communicated via the badge, and the background recompute populates the next request.

## Files

- `supabase/functions/massive-vol-cone/index.ts` — refactor to snapshot-first + relaxed threshold.
- `supabase/functions/warm-vol-cones/index.ts` — new.
- `supabase/config.toml` — register `warm-vol-cones` with `verify_jwt = false`.
- `src/pages/VolatilityCone.tsx` — stale badge + insufficient-window cell.
- Cron SQL — provided in chat for you to run once.