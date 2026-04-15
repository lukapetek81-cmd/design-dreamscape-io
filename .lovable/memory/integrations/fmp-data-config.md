---
name: FMP Data Config
description: FMP basic plan only supports Gold (GCUSD) and Silver (SIUSD) on stable API. All other commodity symbols return 402.
type: feature
---
Non-energy commodity data sources status (as of April 2026):
- **FMP stable API** (`/stable/quote`): Only GCUSD (Gold) and SIUSD (Silver) work on the basic plan. All other commodity symbols (HGUSD, ZCUSX, CCUSD, etc.) return 402 "Premium Query Parameter".
- **CommodityPriceAPI v2** (`/v2/rates/latest`): Subscription expired — returns 402 "PAYMENT_REQUIRED". Code updated to use v2 endpoint with `apiKey` query param.
- **Legacy FMP `/v3/quote/`**: Fully deprecated, returns 403. Code migrated to `/stable/quote`.

**Result**: Only Gold and Silver show real FMP prices. All other non-energy commodities (22 items) fall back to static $0 prices.

**Fix options**:
1. Renew CommodityPriceAPI subscription (covers all 22 non-energy commodities in one batch call)
2. Upgrade FMP plan to access all commodity symbols
3. Find alternative free commodity data API
