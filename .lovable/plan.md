# Forward Curve → Massive Futures Basic

Replace the broken FMP per-contract path with real CME/CBOT/COMEX/NYMEX settlement data from Massive's free tier. Restore the multi-month strip + Bloomberg chart, labelled as "EOD settlement".

## Scope

In:
- 9 commodity roots: CL, BZ, NG (energy), GC, SI, HG (metals), ZC, ZS, ZW (grains)
- 12-month forward strip, end-of-day settlement prices
- Server-side cache so we stay far under 5 req/min
- Restore Bloomberg-style chart + contract table from earlier work

Out:
- Intraday refresh (requires $29 Starter)
- Spot-only commodities not on US futures exchanges (stay on FMP/OilPriceAPI)
- Any change to dashboard, news, or trading pages

## Prerequisites

User actions, in order:
1. Sign up at https://massive.com/dashboard for the free Futures Basic plan
2. Copy the API key
3. Paste it into Lovable when prompted for `MASSIVE_API_KEY`

After the key lands I can deploy and test.

## Implementation

### 1. New shared client — `supabase/functions/_shared/massive-client.ts`

Two thin wrappers over Massive REST v1:

- `listActiveContracts(productCode, asOfDate)` → `GET /futures/v1/contracts?product_code={CL}&active=true&date={YYYY-MM-DD}&limit=24&sort=last_trade_date.asc`
  Returns array of `{ ticker, last_trade_date, days_to_maturity, expiry_month }`.
- `fetchContractDailyClose(ticker, date)` → `GET /futures/v1/aggs/{ticker}/range/1/day/{date}/{date}` returning settlement close.
  Batched per root: 1 contracts call + N aggregate calls = N+1 calls per curve refresh.

Auth via `Authorization: Bearer ${MASSIVE_API_KEY}`. All errors swallowed → null, never throw.

### 2. Rewrite `supabase/functions/fetch-forward-curve/index.ts`

- Drop the single-point logic added last round.
- Per request: list active contracts for the root → take next 12 by `last_trade_date` → fetch yesterday's close for each.
- Build the curve, compute m1, m2, structure (contango/backwardation/flat), roll yield.
- Server-side response cache: `Cache-Control: public, max-age=21600` (6h) plus an in-memory `Map` keyed by commodity to hold the result inside the worker.
- Returns:
  ```
  { commodity, label, source: 'market', provider: 'Massive Futures Basic',
    asOf: 'YYYY-MM-DD' (settlement date),
    spot, curve: [{symbol, expiry, monthIdx, price}], m1, m2, structure, rollYield }
  ```
- If <3 contracts return prices → `502 curve_unavailable` (no model fallback, per earlier decision).

### 3. Frontend — restore the Bloomberg chart

- `src/hooks/useForwardCurve.ts`: expand response interface back to `curve / m1 / m2 / structure / rollYield`, plus `asOf`.
- `src/pages/ForwardCurves.tsx`: bring back the ComposedChart + contract table from the earlier iteration (currently a single-point view). Status strip shows `EOD · settlement {asOf}` instead of the live UTC clock. Amber notice text updated to:
  > "End-of-day settlement curve from CME/NYMEX/COMEX/CBOT via Massive. Refreshes after each US futures settlement (~17:00 CT)."

### 4. Rate-budget math

- 9 roots × (1 contracts + 12 aggregates) = **117 calls per full refresh of every commodity**
- 6h cache → at most 4 refreshes/day → **~470 calls/day**, easily within "5/min" if a single user triggers them sequentially. Concurrent triggers serialised by the in-memory cache.
- One user clicking through all 9 commodities cold = 9 sequential refreshes spaced over ~2 min → well inside the budget.

### 5. Cleanup

- Leave `fmp-client.ts → fetchFmpFuturesCurve` in place (still imported by tests/types) but stop calling it from forward-curve. No deletions to avoid touching unrelated files.
- Add memory note: `mem://integrations/massive-futures` — "Forward curve uses Massive Futures Basic (free, EOD, 5 req/min). Server cache TTL 6h."

## Out of scope / deferred

- Switching to Starter ($29) for 10-min delayed intraday — flagged in code comment for later.
- Per-user API keys — using one shared `MASSIVE_API_KEY` secret.
- Historical curve archive / snapshots — only "latest settlement" stored.

## Validation steps after deploy

1. Hit `/functions/v1/fetch-forward-curve` with `{commodity:'gold'}` via curl-edge-functions → expect 12 prices, source=market.
2. Repeat for `wti`, `corn`. Confirm `structure` matches the visual curve.
3. Open `/forward-curves` in preview, cycle the 9 commodities, confirm chart + table populate, settlement date shows yesterday.
4. Check edge-function-logs for any `[fetch-forward-curve] WARN` lines.

---

**One question before I touch code:** do you also want me to wire **Massive Futures Basic** as the source for the dashboard's commodity *front-month* prices (replacing the FMP `=F` continuous symbols for the 9 covered roots)? Or keep that flow on FMP for now and limit this change to the forward-curve page only?