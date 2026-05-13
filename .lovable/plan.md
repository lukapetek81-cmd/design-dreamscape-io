# Premium Catalog: Audit-Then-Decide

You picked **Audit-then-decide** with **industry analysts / procurement** as the primary buyer. That combo means: keep breadth (regional crudes, refined products, marine fuels, HRC/Steel, Palm Oil, Canola are exactly what procurement wants) — but only for symbols where the upstream API actually returns fresh quotes. Anything stale gets cut, no sentiment.

## Decision rule

For each of the ~41 premium symbols, classify by last-tick age over a 7-day sample:

| Age of last quote | Action |
|---|---|
| < 4h on a trading day | **Keep** — live |
| 4–24h | **Keep, flag** as "End-of-day" in UI |
| 24h–7d | **Demote to reference-only** badge, no chart |
| > 7d or 404/null | **Cut** from catalog |

Procurement users tolerate EOD pricing (they're used to Platts/Argus dailies). They do not tolerate dead tickers.

## Plan

### 1. Build a freshness audit script
New edge function `audit-premium-freshness` (admin-only, JWT-gated, no cache):
- Iterates every symbol in `PREMIUM_COMMODITIES`.
- For CPA symbols: hits `/rates/latest?symbols=...` and reads each entry's `timestamp`.
- For OilPriceAPI symbols: hits the existing batch endpoint and reads `created_at`.
- Returns JSON `{ name, source, lastTickAge_h, price, status: 'live'|'eod'|'stale'|'dead' }[]`.
- Logs to `system_metrics` table so we have a 7-day rolling history, not just one snapshot.

### 2. Run it for 7 days (cheap — once/day cron via existing scheduler, ~44 API calls/day).

### 3. Decision dashboard
Add `/admin/catalog-audit` page (gated by your existing admin check) that renders the latest snapshot as a sortable table with the four action buckets color-coded. One-click export to CSV so you can review with the data in front of you.

### 4. Cull + reclassify based on results
After the 7-day window, apply the decision rule to `PREMIUM_COMMODITIES`, `COMMODITY_SYMBOLS`, and `CATEGORY_MAPPINGS`. Add a new `dataFreshness: 'live' | 'eod' | 'reference'` field to `CommoditySymbol` so the UI can render the appropriate badge.

### 5. UI honesty layer (procurement-friendly)
On `CommodityCard`, render a small badge next to price:
- **LIVE** (teal) — < 4h
- **EOD** (muted) — daily settlement
- **REF** (amber) — reference price, weekly

This is what procurement expects from Platts-style data. It also kills churn risk: nobody can claim "fake data" when the staleness is disclosed up front.

### 6. Update copy
- `PremiumUpsellCard.tsx` and `PremiumPaywall.tsx`: lead with "Regional crude blends, refined products, marine fuels and base-metal benchmarks used by procurement teams" — drop the "20 markets!" headline number, replace with "Live + EOD pricing across X benchmarks."
- Update `mem://monetization/strategy` and `mem://project/commodity-catalog-scope` with final culled list.

## Technical notes

- Audit function reuses `_shared/api-clients.ts` so we don't duplicate auth headers.
- Snapshot row schema: `system_metrics(metric_name='premium_freshness', metadata jsonb)` — no schema change needed.
- The new `dataFreshness` field is additive; defaults to `'live'` so nothing breaks.
- Admin gate: reuse existing `has_role(auth.uid(), 'admin')` if present, else add a simple `ADMIN_USER_IDS` env check on the edge function.
- Cost: one audit cron tick = ~44 CPA calls + 1 OilPriceAPI batch ≈ negligible vs the 2h-cache user traffic.

## What this gets you

- **Empirical** answer to "scope vs quality" — no more guessing.
- Catalog will probably end up around **25–32 premium items** (my prior: Titanium, Lithium, Sunflower Oil, Cobalt OTC, Magnesium-style symbols will fall out; HRC Steel, Canola, Palm Oil, RBOB, marine fuels, regional crudes survive).
- Procurement-credible UX via the LIVE/EOD/REF badges — turns a weakness (some EOD data) into a feature (transparent sourcing).
- Lower churn + lower API burn as a side effect.

Want me to proceed?