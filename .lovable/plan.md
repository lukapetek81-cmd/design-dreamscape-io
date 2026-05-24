# Growth & Revenue Deep-Dive

Three parallel workstreams, delivered as one markdown memo saved to `docs/GROWTH_PLAN.md` (plus updates to `mem://monetization/strategy` with the conclusions). No app code changes — this is research + strategy.

## 1. ASO / Keyword Research (Semrush)

Pull real search data for the commodity-tracker space so we know what to target in the Play Store listing and the marketing site.

Keywords to research:
- `commodity prices`, `oil price tracker`, `WTI price`, `Brent crude price`
- `natural gas price app`, `gold silver tracker`, `commodity portfolio`
- `commodity news app`, `energy markets app`

For each: volume, difficulty, CPC, top-ranking competitors. Then run `competitive_analysis` on the 2–3 closest competitors that surface to find keyword gaps.

**Deliverable:** Ranked target keyword list with recommended Play Store title/short-description/long-description rewrites and 3–5 marketing-site landing-page topics.

## 2. Premium Feature Plan to Lift Conversion

Today's premium tier (20 extra energy markets + priority refresh) is thin and likely caps conversion near 1%. Audit the current free/paid split, then propose a re-bundled tier targeting 3–5% conversion.

Steps:
- Read `PremiumPaywall.tsx`, `PremiumUpsellCard.tsx`, `revenueCat.ts` and the entitlement-gated code paths to map exactly what's behind the paywall today.
- Draft a prioritized backlog of premium features ranked by `(impact on conversion) / (build effort)`. Likely candidates: price alerts (push notifications), CSV/PDF export, multi-portfolio, historical data >1y, custom watchlists, ad-free guarantee statement, API access for power users.
- Propose 2 SKUs: **Premium** ($6.99/mo) and **Pro** ($19.99/mo for B2B / API access) — with a clear feature matrix.
- Identify the smallest 1–2 features to ship first for the biggest conversion lift.

**Deliverable:** Feature matrix table + ranked build backlog + price/positioning recommendation.

## 3. iOS Expansion Economics

Model whether/when to add iOS given Capacitor already supports it.

Inputs to estimate:
- One-time cost: Apple Developer Program ($99/yr), ~1–2 weeks of work to handle iOS-specific paywall, deep links, native OAuth, RevenueCat iOS key, App Store assets, review process.
- Ongoing: App Store 15% cut (same as Play for small publishers), iOS ARPU typically ~1.8–2.2x Android for finance apps.
- Risk: App Store review is stricter — financial data apps need clear disclaimers, no "investment advice" language.

Model 3 scenarios (pessimistic / base / optimistic) with payback period in months, assuming the Android baseline established in Section 1.

**Deliverable:** Side-by-side table of Android-only vs Android+iOS revenue over 12 and 24 months, with a go/no-go recommendation and trigger threshold (e.g. "launch iOS once Android MRR > $500").

## Technical notes

- Semrush calls are read-only and cheap; I'll batch them in parallel where possible.
- The memo lives at `docs/GROWTH_PLAN.md` so it's versioned with the code.
- I'll also add a one-line summary to `mem://monetization/strategy` so future sessions pick up the new pricing/feature decisions.
- No database changes, no edge function changes, no UI changes in this plan. If you later approve a specific premium feature from Section 2, that becomes a separate build task.

## Out of scope

- Actually building any new premium features (separate plan once you pick from the backlog).
- Paid user acquisition modeling (Google Ads CPI math) — can be a follow-up if relevant.
- Localization / non-English markets.
