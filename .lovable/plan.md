# Restrict candlestick mode to real OHLC

## Goal
Only allow the candlestick chart toggle when the underlying provider returns true daily OHLC. Everywhere else (energy commodities, intraday `1d`, mock fallback, CPA close-only responses), hide the toggle and force the line chart, with a brief tooltip explaining why.

## What counts as "real OHLC" today
After auditing `supabase/functions/fetch-commodity-data/index.ts`:

| Source | Category | OHLC quality |
|---|---|---|
| OilPriceAPI | All 26 energy commodities | Close-only — code fabricates O/H/L from `price ± 0.5% * Math.random()` |
| CommodityPriceAPI `/rates/time-series` | Non-energy (metals, grains, softs, lumber) | True daily OHLC **when** the response includes `open/high/low/close` fields; otherwise falls back to flat candles |
| Mock fallback | Anything when both APIs fail | Random-walk synthetic |
| Any provider, `1d` timeframe | All | No intraday OHLC available — always synthetic |

So "real" candlesticks today = **non-energy commodities, daily timeframes (`7d`/`1m`/`3m`/`6m`), and only when CPA actually returns OHLC fields**.

## Plan

### 1. Backend: stop fabricating OHLC; tag responses with provenance
In `supabase/functions/fetch-commodity-data/index.ts`:

- **OilPriceAPI branch (lines ~368-393)**: stop synthesizing `open/high/low` from random noise. Always return `{date, price}` regardless of `chartType`. Set a new response flag `ohlcAvailable: false`.
- **CPA branch (lines ~461-484)**: only emit candle rows when `dayData.open && dayData.high && dayData.low && dayData.close` are all distinct numbers. If CPA returns close-only for a symbol, return line points and `ohlcAvailable: false`.
- **Mock fallback (lines ~198-213)**: never emit fake OHLC. Always return `{date, price}` and `ohlcAvailable: false`.
- **Intraday (`timeframe === '1d'`)**: hard-code `ohlcAvailable: false` regardless of source.
- Response shape becomes `{ data, source, ohlcAvailable: boolean }`.

### 2. Frontend: surface `ohlcAvailable` through the hook
In `src/hooks/useCommodityData.ts → useCommodityHistoricalData`:
- Extend the return type to include `ohlcAvailable: boolean`.
- Pass it through alongside `data`.

### 3. UI: hide/disable candlestick toggle when unavailable
In the chart container/header (`src/components/charts/ChartHeader.tsx` + `ChartContainer.tsx` + `CommodityChart.tsx`):
- Read `ohlcAvailable` from the hook.
- If `false` (or while loading), **disable** the candlestick button with a tooltip: *"Candlesticks unavailable for this commodity/timeframe — provider returns close-only data."*
- If the user is currently in `candlestick` mode and the new data has `ohlcAvailable: false`, auto-switch back to `line` mode.
- For energy commodities, the toggle will essentially always be disabled — that's intentional and honest.

### 4. Add a lightweight capability map (optional cache)
Maintain a small constant in `_shared/commodity-mappings.ts`:
```ts
export const OHLC_CAPABLE_SYMBOLS = new Set([
  // Filled from CPA after we confirm which symbols actually return OHLC
]);
```
The edge function uses this as a hint to short-circuit and respond with `ohlcAvailable: false` for known close-only symbols, but the per-response check (step 1) remains the source of truth.

### 5. Verification
- Test 3 representative commodities via `supabase--curl_edge_functions`:
  - `WTI Crude Oil` (energy) → expect `ohlcAvailable: false`
  - `Gold Futures` `3m` (CPA, likely OHLC) → expect `ohlcAvailable: true`
  - `Gold Futures` `1d` (intraday) → expect `ohlcAvailable: false`
- Visually confirm the toggle is disabled for energy and enabled for gold daily.

## Out of scope
- Adding a new paid OHLC provider (Polygon/Twelve Data/etc.). Can be a follow-up if you want true candlesticks for energy.
- Changing the candlestick rendering itself (the earlier mobile review of `CandlestickChart.tsx`).

## Files to touch
- `supabase/functions/fetch-commodity-data/index.ts` (remove synthesis, add `ohlcAvailable`)
- `supabase/functions/_shared/commodity-service.ts` (mirror logic, used by other endpoints)
- `supabase/functions/_shared/commodity-mappings.ts` (capability set)
- `src/hooks/useCommodityData.ts` (propagate flag)
- `src/components/CommodityChart.tsx` / `src/components/charts/ChartHeader.tsx` / `ChartContainer.tsx` (disable toggle, auto-revert)
