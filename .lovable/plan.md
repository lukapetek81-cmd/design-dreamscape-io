# Tier 1 Pro Features — Implementation Plan

Goal: ship 5 high-value, low-effort features that justify the $19.99 Pro tier and lift conversion. All five gated by `tier === 'pro'` (forward curves & COT) or `tier !== 'free'` (spreads, smart alerts, persisted watchlists) so Premium gets some upgrade fuel too.

## Tier gating decisions

| Feature | Free | Premium ($6.99) | Pro ($19.99) |
|---|---|---|---|
| Forward curves | locked | locked | ✅ |
| Spread calculator | 1 preset spread | 5 presets, no custom | unlimited + custom |
| COT report | locked | locked | ✅ |
| Smart alerts (% move, vol, spread, news) | basic price only | + % move | + vol band, spread, news keyword |
| Persisted watchlists | 1 watchlist, 5 symbols | 5 watchlists, 20 symbols | unlimited |

Update `src/utils/tiers.ts` with these caps.

---

## 1. Forward curves & contango/backwardation

**New edge function** `fetch-forward-curve` (Pro-only, JWT-verified):
- Input: `{ commodity: 'WTI' | 'BRENT' | 'NATGAS' | 'GOLD' | 'COPPER' | ... }` (Zod-validated)
- Calls FMP `/v3/quote/CLM25,CLN25,CLQ25,...` for the next 12 monthly contracts using a symbol-map per commodity
- Returns `[{ contract, expiry, price, daysToExpiry }]`
- 5-min Supabase Edge cache via `Cache-Control`

**New page** `src/pages/ForwardCurves.tsx`:
- Commodity selector (those with monthly futures strips)
- Recharts line: x = expiry month, y = price
- Auto-detect contango (upward slope) / backwardation (downward) — color the area fill + show badge
- Roll yield calc: `(M1 - M2) / M1 * 100` displayed prominently
- "Coming soon: alert on curve flip" CTA → links to smart alerts

**New file** `src/utils/forwardCurveSymbols.ts` — maps commodity to FMP futures month-code roots (CL, BZ, NG, GC, HG, etc.).

---

## 2. Spread / crack / crush calculator

**New page** `src/pages/SpreadCalculator.tsx` (no DB):
- Reuses existing `useCommodityData` hook for live prices
- Built-in presets: WTI-Brent, 3:2:1 crack, Soybean crush, Gold/Silver ratio, Nat Gas / WTI ratio
- Each preset shows: current spread, 30/90-day chart (via existing price history), historical mean ± 1σ band, "extreme" badge if outside band
- Pro-only: "+ Custom spread" builder — pick 2-3 commodities + weights + formula (sum, ratio, weighted)
- Custom spreads persisted in new `user_spreads` table

**Migration**: `user_spreads(id, user_id, name, formula jsonb, created_at)` + RLS owner-only.

---

## 3. COT report integration

**New edge function** `fetch-cot-report` (Pro-only):
- Pulls CFTC's free public JSON feed weekly (https://publicreporting.cftc.gov/resource/yw9f-hn96.json)
- Filters to commodities in our catalog (energy, metals, ags, softs)
- Caches in new table `cot_reports(commodity, report_date, managed_money_long, managed_money_short, commercials_long, commercials_short, net_position, created_at)` — public-read RLS since this is public CFTC data
- Scheduled via pg_cron every Friday 5pm ET (when CFTC publishes)

**New page** `src/pages/COTReports.tsx`:
- Commodity selector (energy/metals/ags)
- Stacked bar: managed money long vs short over last 52 weeks
- Net position line overlay
- "Sentiment extreme" badge when net position > 90th or < 10th percentile of last 3 years
- Last 5 weekly snapshots table

---

## 4. Smart alerts (extend existing system)

**Migration** — extend `price_alerts`:
- Add `alert_type TEXT` enum-style: `'price'` (default, existing) | `'pct_move'` | `'volatility_band'` | `'spread'` | `'news_keyword'`
- Add `config JSONB` for type-specific params (e.g. `{ window: '1d', threshold_pct: 3 }` for pct_move; `{ keyword: 'OPEC' }` for news)
- Existing `condition` + `target_price` columns become null-allowed (used only by `price` type)

**Update edge function** `evaluate-price-alerts`:
- Switch on `alert_type`:
  - `pct_move`: compare current price to price N hours ago (use `commodity_price_snapshots`)
  - `volatility_band`: compute 20-period Bollinger band, fire if outside
  - `spread`: evaluate user's custom or preset spread formula vs target
  - `news_keyword`: scan `enhanced-commodity-news` results for keyword + commodity match in last hour
- Reuse existing cooldown + trigger insertion logic

**Update UI** `src/pages/PriceAlerts.tsx`:
- "Alert type" dropdown in create dialog
- Type-specific form panels (conditional render)
- Lock badges for types not available to current tier

---

## 5. Persisted watchlists with deltas

**Migration**:
```
watchlists(id, user_id, name, is_default, sort_order)
watchlist_items(id, watchlist_id, commodity_name, position)
```
Both owner-only RLS. Limit enforcement trigger using tier from `get_user_tier`.

**Replace** `src/pages/Watchlists.tsx` mock state with `useWatchlists` + `useWatchlistItems` hooks (React Query, same pattern as `usePortfolios`).

**Add per-row columns**:
- Sparkline (7-day, from existing price snapshots)
- 1D / 1W / 1M / YTD delta % columns
- Drag-to-reorder via `@dnd-kit/sortable` (already installed? check; if not, fall back to up/down buttons)

**Bonus**: small "watchlist heatmap" card on Dashboard showing all symbols in default watchlist as color-coded tiles.

---

## File-level checklist

```text
DB migrations (3 separate files):
  + portfolios already exists — these are new:
  - user_spreads + RLS + tier limit trigger
  - cot_reports + public-read RLS
  - watchlists + watchlist_items + RLS + tier limit trigger
  - alter price_alerts: add alert_type, config (nullable cols)

Edge functions:
  - supabase/functions/fetch-forward-curve/index.ts          NEW
  - supabase/functions/fetch-cot-report/index.ts             NEW (scheduled)
  - supabase/functions/evaluate-price-alerts/index.ts        EXTEND

Pages:
  - src/pages/ForwardCurves.tsx                              NEW
  - src/pages/SpreadCalculator.tsx                           NEW
  - src/pages/COTReports.tsx                                 NEW
  - src/pages/Watchlists.tsx                                 REWRITE (drop mock)
  - src/pages/PriceAlerts.tsx                                EXTEND (alert types)

Hooks/utils:
  - src/hooks/useForwardCurve.ts                             NEW
  - src/hooks/useSpreads.ts                                  NEW
  - src/hooks/useCOT.ts                                      NEW
  - src/hooks/useWatchlists.ts                               NEW
  - src/utils/forwardCurveSymbols.ts                         NEW
  - src/utils/spreadFormulas.ts                              NEW
  - src/utils/tiers.ts                                       EXTEND (new caps)

Routing & nav:
  - src/App.tsx                                              add 4 routes
  - src/components/sidebar/constants.ts                      add 4 nav entries
                                                              (group under "Pro Tools")
```

## Out of scope (deferred)

- Native push for smart alerts (in-app bell still works via existing polling)
- Watchlist drag-reorder on mobile (use up/down arrows on touch)
- Spread backtesting (Tier 3 feature)
- Custom spread alert formulas beyond presets (Pro-only stretch)

## Risks

- **FMP rate limits** on forward curves — 12 contract quotes × N users. Mitigation: cache aggressively (5-min), use bulk `/v3/quote/SYM1,SYM2,...` endpoint.
- **CFTC JSON schema changes** — wrap in try/catch, log to Edge logs, degrade gracefully if a week's report is malformed.
- **price_alerts schema change** is backward-compatible (new cols nullable, default `'price'`) so existing alerts keep working.

## Manual steps after merge

1. RevenueCat: no product changes needed (tier matrix unchanged at product level).
2. Run pg_cron schedule for `fetch-cot-report` weekly (Friday 22:00 UTC). I'll output the SQL.
3. First COT pull will backfill last 52 weeks of data.
