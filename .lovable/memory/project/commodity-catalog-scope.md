---
name: Commodity Catalog Scope
description: 46 total commodities — 34 free tier + 16 premium-gated (quota-heavy energy)
type: feature
---
**Total catalog**: 46 commodities defined in `supabase/functions/_shared/commodity-mappings.ts → COMMODITY_SYMBOLS`.

**Free tier (34)**: All metals (7), grains (7), softs (5), lumber (1), plus 14 energy items — crude majors (WTI, Brent, Dubai, Oman, Murban, OPEC, Indian, Tapis, Urals, WCS) and gas (NG, UK Gas, Dutch TTF, JKM LNG).

**Premium tier (+12 in catalog, +7 oil-only)**: Regional crude (WTI Midland, ANS, Mars, LLS), refined products (Gasoline RBOB, Heating Oil, Jet, ULSD, Gasoil, Naphtha, Propane, Ethanol), marine fuels (VLSFO/HFO/MGO variants — currently in `OIL_BLEND_CODES` only).

**Removed earlier** (no provider data): Feeder Cattle, Lean Hogs, Milk Class III.

**Premium gating**: See mem://monetization/strategy. Enforcement is at the edge function layer — `PREMIUM_COMMODITIES` set + JWT-based `includePremium` flag.

**Data sources**: Energy → OilPriceAPI exclusively. Non-energy → CommodityPriceAPI v2 Lite. See mem://integrations/commoditypriceapi-config.
