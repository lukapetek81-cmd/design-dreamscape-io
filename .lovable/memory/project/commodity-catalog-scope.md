---
name: Commodity Catalog Scope
description: ~85 catalog items — ~30 free + ~21 premium-gated (trimmed 2026-04-18) + remainder unmapped/legacy
type: feature
---
**Total catalog**: ~85 commodities defined in `supabase/functions/_shared/commodity-mappings.ts → COMMODITY_SYMBOLS`.

**Premium-gated (~21)**: See mem://monetization/strategy for the full list. Trimmed from ~55 on 2026-04-18 to keep API burn sustainable.

**Free tier (~30)**: Crude majors (WTI, Brent, Dubai, Oman, Murban, OPEC), gas (NG, UK Gas, Dutch TTF, JKM LNG), all base metals (Gold, Silver, Copper, Platinum, Palladium, Aluminum, Zinc, Iron Ore), grain futures (Corn, Wheat, Soybean, Soybean Oil/Meal, Oat, Rough Rice), classic softs (Coffee, Sugar #11, Cotton, Cocoa, OJ), base livestock (Live Cattle, Lean Hogs, Milk), Industrial Ethanol/Rubber, Lumber.

**Items still in catalog but not premium-promoted** (legacy — kept for free-tier display only): Indian Basket, Tapis, Urals, ANS, Propane, Ethanol, marine fuel sub-grades, livestock premium items, niche industrials. These render but no upsell card promotes them.

**Premium gating**: See mem://monetization/strategy. Enforcement is at the edge function layer — `PREMIUM_COMMODITIES` set + JWT-based `includePremium` flag.

**Data sources**: Energy → OilPriceAPI exclusively. Non-energy → CommodityPriceAPI v2 Lite. See mem://integrations/commoditypriceapi-config.

**Cache**: 2h TTL across CPA + OilPriceAPI (raised from 1h on 2026-04-18).
