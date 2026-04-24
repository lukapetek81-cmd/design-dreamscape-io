---
name: Commodity Catalog Scope
description: ~86 catalog items — 17 free + ~69 premium-gated (price-app launch split, 2026-04-24)
---
**Total catalog**: ~86 commodities defined in `supabase/functions/_shared/commodity-mappings.ts → COMMODITY_SYMBOLS`.

**Free tier (17, household-name only)**:
- Energy (3): WTI, Brent, Natural Gas
- Metals (4): Gold Futures, Silver Futures, Copper, Platinum
- Grains (3): Corn Futures, Wheat Futures, Soybean Futures
- Softs (4): Coffee Arabica, Sugar #11, Cotton, Cocoa
- Livestock (2): Live Cattle, Lean Hogs
- Industrials (1): Lumber Futures

**Premium-gated (~69)**: Everything else. Per-group counts:
- Energy: 23 (regional crudes, gas hubs, refined, marine fuels)
- Metals: 14 (Palladium, Aluminum, Zinc, Iron Ore, Lead/Nickel/Tin, Steel, Lithium, etc.)
- Grains: 9 (Soybean Oil/Meal, Oats, Rice, Canola, Sunflower/Rapeseed Oil)
- Softs: 5 (Orange Juice, UK Sugar No 5, Palm Oil, Tea, Wool)
- Livestock: 9 (Milk, Feeder Cattle, Cheese, Eggs, Salmon, Poultry, Butter, Potato)
- Industrials: 18 (Industrial Ethanol, Rubber, Cobalt, Rhodium, plastics, fertilizers, rare elements)

**Pricing**: TBD — set in Play Console / RevenueCat dashboard. Code remains generic.

**Premium gating**: Enforced at edge function layer via `PREMIUM_COMMODITIES` set + JWT-based `isPremium` flag.

**Data sources**: Energy → OilPriceAPI exclusively. Non-energy → CommodityPriceAPI v2 Lite. See mem://integrations/commoditypriceapi-config.

**Cache**: 2h TTL across CPA + OilPriceAPI.
