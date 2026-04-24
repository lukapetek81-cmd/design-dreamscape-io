# Memory: index.md
Updated: just now

# Project Memory

## Core
- **Product:** Commodity price-tracking app (Google Play Store launch). NO trading features. Read-only price data + news + analytics.
- **Monetization:** Freemium via RevenueCat (Google Play IAP). Free tier = 17 household commodities. Premium unlocks ~60 specialty commodities. Pricing TBD in Play Console.
- **Styling:** Dark theme with dark purple and teal branding.
- **Navigation:** Hub-and-spoke pattern. Every sub-page requires a '← Dashboard' back button.
- **Data Sourcing:** Energy from OilPriceAPI exclusively. Non-energy from CommodityPriceAPI v2 (Lite plan, 2h cache). FX from Frankfurter.app.
- **Security:** Strict RLS (`id = auth.uid()`). Edge functions enforce JWT auth + Zod validation.
- **Supabase:** Project ID `kcxhsmlqqyarhlmcapmj`. OAuth used for Google/GitHub.

## Memories
- [Monetization Strategy](mem://monetization/strategy) — Freemium with RevenueCat, premium unlocks specialty commodities
- [Marketing Infrastructure](mem://features/marketing-infrastructure) — Phased growth strategy, landing page, blog
- [Production Readiness](mem://launch/production-readiness) — Monitoring, Supabase health checks, security config
- [News System](mem://features/news-system) — Edge function aggregation from Marketaux + News API
- [GitHub Integration](mem://auth/github-integration) — OAuth configuration for Supabase
- [Android Signing](mem://launch/android-signing) — Build instructions for signed AAB in Android Studio
- [Google Config](mem://auth/google-config) — Google Auth via Supabase OAuth
- [Play Store Listing](mem://launch/play-store-listing) — Category, Data Safety, 18+ target audience details
- [Database Hardening](mem://security/database-hardening) — RLS policies, credential encryption logic
- [Edge Function Security](mem://security/edge-function-security) — JWT, Zod validation, error response rules
- [Client-Side Storage](mem://security/client-side-storage) — API key encryption in localStorage via AES-256-GCM
- [Account Deletion](mem://features/account-deletion) — Multi-step flow purging user data for Play Store compliance
- [Branding](mem://style/branding) — Dark theme, dark purple and teal aesthetic
- [Store Assets](mem://launch/store-assets) — Google Play Store graphics locations and resolutions
- [Navigation Pattern](mem://ui/navigation-pattern) — Hub-and-spoke with back buttons
- [Multi-Currency](mem://features/multi-currency) — EUR/CNY/INR, Edge Function, local storage sync
- [Energy Data](mem://integrations/energy-data-sourcing) — Exclusively OilPriceAPI, specific units
- [CommodityPriceAPI Config](mem://integrations/commoditypriceapi-config) — CPA v2 Lite plan, FX via Frankfurter
- [Commodity Catalog](mem://project/commodity-catalog-scope) — Free 17 / Premium ~60 split
- [Economic Calendar](mem://features/economic-calendar-integration) — FMP integration with dashboard deep linking
