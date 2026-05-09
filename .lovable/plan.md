# Premium Metals / Grains / Industrials CPA Sweep

Goal: confirm every premium item in Metals (14), Grains (11), and Industrials (18) returns a real CommodityPriceAPI price (`src=commoditypriceapi`, `price > 0`, not the synthetic `100` fallback) from both endpoints — `fetch-commodity-prices` (per-item detail view) and `fetch-all-commodities` (bulk dashboard).

## Scope (43 names)

Pulled directly from `PREMIUM_COMMODITIES` in `supabase/functions/_shared/commodity-mappings.ts`:

- **Metals (14):** Palladium, Aluminum, Zinc, Iron Ore, Copper Futures, Aluminium Futures, Lead Spot, Lead Futures, Nickel Spot, Nickel Futures, Tin, Steel, Hot-Rolled Coil Steel, Titanium, Magnesium, Lithium *(set has 16 — keeping all)*
- **Grains (11):** Soybean Oil, Soybean Meal, Oat Futures, Rough Rice, Wheat Futures Spot, Soybeans Spot, Oats Spot, Rough Rice Spot, Canola, Sunflower Oil, Rapeseed Oil
- **Industrials (18):** Industrial Ethanol, Rubber, Bitumen, Cobalt, Rhodium, Polyethylene, Polyvinyl Chloride, Polypropylene, Soda Ash, Neodymium, Tellurium, Diammonium Phosphate, Urea, Urea Ammonium Nitrate, Gallium, Indium, Kraft Pulp, Industrial Naphtha

## Steps

1. **Bulk pass:** invoke `fetch-all-commodities` once via `supabase--curl_edge_functions`. Filter the response to the 43 names above and assert each row has `src === 'commoditypriceapi'` and a sane price (> 0, ≠ 100 fallback, and — for the 6 cent-quoted symbols — already divided by 100).
2. **Per-item pass:** loop `fetch-commodity-prices?commodity=<name>` for each of the 43 names. Same assertions, plus confirm the CPA symbol resolves (i.e. it actually hit step-2 CPA branch and didn't fall through to the synthetic fallback).
3. **Aggregate report** grouped by category: `OK` / `MISSING` / `ZERO` / `WRONG_SOURCE` / `LIKELY_FALLBACK ($100)` with the offending CPA symbol shown for each failure.
4. **If any failures:** inspect `supabase--edge_function_logs` for that commodity, identify whether the issue is (a) wrong CPA symbol in the mapping, (b) CPA returning null/error for that symbol, or (c) a code-path bug; fix in `commodity-mappings.ts` and/or `fetch-commodity-prices/index.ts`, redeploy, re-run sweep.
5. **Pass criteria:** all 43 items return real CPA prices on both endpoints, with correct unit scaling for cent-quoted symbols. Report posted back in chat with per-category counts and any remaining caveats.

## Notes

- No DB schema changes. No frontend changes unless the sweep uncovers a UI-side issue.
- This is a verification sweep first; code edits only happen if step 3 surfaces failures.
