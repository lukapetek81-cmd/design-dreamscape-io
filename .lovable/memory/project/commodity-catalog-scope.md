---
name: Commodity Catalog Scope
description: ~86 catalog items — 30 free + ~56 premium-gated (tightened 2026-04-18 v2 to control API burn)
type: feature
---
**Total catalog**: ~86 commodities defined in `supabase/functions/_shared/commodity-mappings.ts → COMMODITY_SYMBOLS`.

**Free tier (exactly 30, household-name only)**:
- Energy (6): WTI, Brent, Crude Oil Dubai, Murban, OPEC Basket, Natural Gas
- Metals (8): Gold, Silver, Copper, Platinum, Palladium, Aluminum, Zinc, Iron Ore
- Grains (5): Corn, Wheat, Soybean, Soybean Oil, Soybean Meal
- Softs (5): Coffee Arabica, Sugar #11, Cotton, Cocoa, Orange Juice
- Livestock (3): Live Cattle, Lean Hogs, Milk
- Industrials (2): Rubber, Industrial Ethanol
- Other (1): Lumber Futures

**Premium-gated (~56)**: Everything else. Per-group counts:
- Energy: 20 (regional crudes, gas hubs, refined, marine fuels)
- Metals: 12 (Lead/Nickel spot+futures, Tin, Steel, HRC, Titanium, Magnesium, Lithium, Copper/Aluminium futures)
- Grains: 7 (Oats, Rough Rice, spot variants, Canola, Sunflower/Rapeseed Oil)
- Softs: 4 (UK Sugar No 5, Palm Oil, Tea, Wool)
- Livestock: 8 (Feeder Cattle, Cheese, Eggs CH/US, Salmon, Poultry, Butter, Potato)
- Industrials: 16 (Cobalt, Rhodium, plastics, fertilizers, rare elements)

**Pricing**: $19.99/mo or $149/yr.

**Premium gating**: Enforced at edge function layer via `PREMIUM_COMMODITIES` set + JWT-based `isPremium` flag. Defence-in-depth filter in `fetch-commodity-symbols`.

**Data sources**: Energy → OilPriceAPI exclusively. Non-energy → CommodityPriceAPI v2 Lite. See mem://integrations/commoditypriceapi-config.

**Cache**: 2h TTL across CPA + OilPriceAPI.
