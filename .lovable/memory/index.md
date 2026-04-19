# Memory: index.md
Updated: just now

# Project Memory

## Core
- **Monetization:** Freemium. Free tier = 34 commodities; Premium unlocks 16 quota-heavy energy items (regional crude, refined products, marine fuels). No ads.
- **Styling:** Dark theme with dark purple and teal branding.
- **Navigation:** Hub-and-spoke pattern. Every sub-page requires a '← Dashboard' back button.
- **Data Sourcing:** Energy from OilPriceAPI exclusively. Non-energy from CommodityPriceAPI v2 (Lite plan, batched + 1h cache). FX from Frankfurter.app. FMP fully removed.
- **Trading:** Crypto live via BloFin API. Commodity mocked/pending IBKR.
- **Security:** Strict RLS (`id = auth.uid()`). 3rd-party API keys in encrypted localStorage (AES-256-GCM).
- **Edge Functions:** Enforce JWT auth and strict Zod validation. Generic errors returned to clients.
- **Supabase:** Project ID `kcxhsmlqqyarhlmcapmj`. OAuth used for Google/GitHub.

## Memories
- [Monetization Strategy](mem://monetization/strategy) — Paid App model details, removal of ads/subscriptions
- [Trading Status](mem://features/trading-status) — BloFin crypto trading live, commodity (IBKR) pending/mocked
- [IBKR Partnership](mem://integrations/ibkr-partnership-details) — TSP positioning, manual connection flow
- [Marketing Infrastructure](mem://features/marketing-infrastructure) — Phased growth strategy, landing page, blog
- [Production Readiness](mem://launch/production-readiness) — Monitoring, Supabase health checks, security config
- [News System](mem://features/news-system) — Edge function aggregation from Marketaux + News API (FMP removed)
- [GitHub Integration](mem://auth/github-integration) — OAuth configuration for Supabase
- [Android Signing](mem://launch/android-signing) — Build instructions for signed AAB in Android Studio
- [Google Config](mem://auth/google-config) — Google Auth via Supabase OAuth
- [Play Store Listing](mem://launch/play-store-listing) — Category, Data Safety, 18+ target audience details
- [Database Hardening](mem://security/database-hardening) — RLS policies, credential encryption logic
- [Edge Function Security](mem://security/edge-function-security) — JWT, Zod validation, error response rules
- [Client-Side Storage](mem://security/client-side-storage) — API key encryption in localStorage via AES-256-GCM
- [Account Deletion](mem://features/account-deletion) — Multi-step flow purging 13 tables for Play Store compliance
- [Branding](mem://style/branding) — Dark theme, dark purple and teal aesthetic
- [Store Assets](mem://launch/store-assets) — Google Play Store graphics locations and resolutions
- [Navigation Pattern](mem://ui/navigation-pattern) — Hub-and-spoke with back buttons
- [BloFin API](mem://integrations/blofin-api) — Order placement, WS market data, credential encryption
- [Multi-Currency](mem://features/multi-currency) — EUR/CNY/INR, Edge Function, local storage sync
- [Energy Data](mem://integrations/energy-data-sourcing) — Exclusively OilPriceAPI, specific units
- [CommodityPriceAPI Config](mem://integrations/commoditypriceapi-config) — CPA v2 Lite plan, FX via Frankfurter, FMP fully removed
- [Commodity Catalog](mem://project/commodity-catalog-scope) — 46 items, limited to live data availability
- [Economic Calendar](mem://features/economic-calendar-integration) — FMP integration with dashboard deep linking
- [EU Compliance](mem://compliance/eu-positioning) — Synthetic = paper-only, MiCA/MiFID outside scope, first-trade acceptance gate via user_legal_acceptance
