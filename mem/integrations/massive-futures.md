---
name: Massive Futures
description: Forward-curve page sources real CME/CBOT/COMEX/NYMEX settlement strips from Massive Futures Basic (free)
type: integration
---
- Provider: Massive (https://massive.com), Futures Basic plan — free, EOD only, 5 req/min, 2y history.
- Secret: `MASSIVE_API_KEY` (Supabase secret, edge-function only).
- Client: `supabase/functions/_shared/massive-client.ts` (listActiveContracts + fetchContractDailyClose + fetchMassiveCurve).
- Edge fn: `fetch-forward-curve` — 1 contracts call + N daily-agg calls per curve, cached 6h in-worker. Falls back across 5 prior business days to skip weekends/holidays. Returns 502 `curve_unavailable` if <3 settlement prices land.
- Roots covered: CL, BZ, NG, GC, SI, HG, ZC, ZS, ZW.
- Upgrade path: switch to Futures Starter ($29/mo) for 10-min delayed intraday — same code path, lower cache TTL.
- No model fallback. Real market data only.
