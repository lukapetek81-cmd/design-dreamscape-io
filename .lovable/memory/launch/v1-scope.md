---
name: v1 launch scope
description: Play Store v1 is a price-tracking app only — no trading, no compliance pages
type: feature
---
v1 = price tracker + premium subscription. Trading was fully removed.
- Pages: Dashboard, Watchlists, Auth, NewsSettings, Privacy, Terms, ResetPassword, DeleteAccount, NotFound.
- Free tier: 6 commodities — WTI, Brent, Natural Gas, Gold Futures, Copper, Corn Futures (FREE_COMMODITIES in supabase/functions/_shared/commodity-mappings.ts).
- Premium: everything else (40+ markets) + ad-free. RevenueCat Android IAP. Pricing TBD in Play Console.
- Trading/compliance DB tables KEPT (safe to drop later). All code touching them was deleted.
- Deleted edge functions: blofin-trading, ibkr-* (4), fetch-ibkr-futures, api-docs, economic-calendar, research-alpha-vantage-futures, direct-exchange-feeds.
