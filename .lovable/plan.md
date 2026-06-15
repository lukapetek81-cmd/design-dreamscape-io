## Premium v2 sprint — Phase 2 (non-push)

The push-alerts plumbing (device_tokens table, secrets) is waiting on you to grab `FCM_SERVICE_ACCOUNT_JSON` + `ALERT_EVALUATOR_SECRET`. While you do that, ship the other two paywalled features.

### 1. Multi-portfolio polish
`Portfolio.tsx` + `usePortfolios.ts` already cover create / select / delete. Adding the missing UX:

- **Rename portfolio** — inline edit (pencil icon next to selector) → `useRenamePortfolio` mutation (`UPDATE portfolios SET name`).
- **Set as default** — "Make default" button on non-default portfolios → mutation that flips `is_default` (clear old default in same call).
- **Move position between portfolios** — add "Move to…" item on `PositionCard` action menu → updates `portfolio_id`. Reuses existing `ensure_default_portfolio` validation trigger.
- **Empty-portfolio guard** — confirm dialog before deleting a portfolio with positions ("Delete N positions too?").
- **Tier badge** — show "Premium: 3 / Pro: ∞" next to the lock icon when at limit so users know what upgrade unlocks.

No schema changes needed.

### 2. CSV export expansion
`downloadCsv` already exists and is wired into Portfolio. Extending the same gated helper to:

- **Watchlists** (`Watchlists.tsx`) — export current watchlist's items with latest price, day change %, day range.
- **Price Alerts** (`PriceAlerts.tsx`) — export all alerts: commodity, type, condition, target, status, last triggered.
- **COT Reports** (`COTReports.tsx`) — export the visible table (commodity, date, long/short/net positions, week-over-week change).
- **Market Screener** (`MarketScreener.tsx`) — export current filtered result set.

Each button uses the same pattern as Portfolio: `Download` icon when `limits.csvExport`, `Lock` icon otherwise → opens `PremiumPaywall`. No backend changes; data already lives in the page's React state.

### Out of scope this phase
- Push delivery (FCM send + cron evaluator) — resumes once both secrets are in.
- Position editing dialog (the "coming soon" placeholder stays for now).

### Technical notes
- New hook `useUpdatePortfolio({ id, name?, is_default? })` in `usePortfolios.ts`; when `is_default: true`, run two updates in a transaction-ish sequence (clear others, then set this one) — RLS already restricts to `user_id = auth.uid()`.
- Move-position uses existing `usePortfolio` mutation surface; add `useMovePosition(positionId, toPortfolioId)`.
- All CSV buttons accept `disabled` when the data array is empty, same as Portfolio.
- Premium gating stays purely client-side (data is the user's own) — consistent with current `csvExport.ts` comment.
