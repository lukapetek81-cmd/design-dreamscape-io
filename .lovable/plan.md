

## Problem
Premium gating *exists* in Metals, Grains, Softs, and Livestock — but free users get no visual signal that locked items exist. They just silently see the free subset. Only Energy and Industrials currently show the "Unlock Premium" upsell card.

## Premium counts per group (already in `PREMIUM_COMMODITIES`)
- Metals: 12 premium (Lead Spot/Futures, Nickel Spot/Futures, Tin, Steel, HRC Steel, Titanium, Magnesium, Lithium, Copper Futures, Aluminium Futures)
- Grains: 7 premium (Wheat Spot, Soybeans Spot, Oats Spot, Rough Rice Spot, Canola, Sunflower Oil, Rapeseed Oil)
- Softs: 4 premium (UK Sugar No 5, Tea, Wool, Palm Oil)
- Livestock: 8 premium (Feeder Cattle, Cheese, Eggs CH, Eggs US, Salmon, Poultry, Butter, Potato)

## Plan

### 1. Extend `PremiumUpsellCard` variants
**File**: `src/components/PremiumUpsellCard.tsx`

Add 4 new variants to `UpsellVariant` and `COPY`:
- `metals` — "Unlock 12 More Industrial & Specialty Metals" — Lead, Nickel, Tin, Steel, Lithium, Titanium. Icon: `Gem` or `Coins`.
- `grains` — "Unlock 7 More Grain & Oil Markets" — Canola, Sunflower Oil, Rapeseed Oil, plus spot variants. Icon: `Wheat`.
- `softs` — "Unlock 4 More Soft Commodities" — UK Sugar No 5, Tea, Wool, Palm Oil. Icon: `Coffee`.
- `livestock` — "Unlock 8 More Livestock & Dairy Markets" — Feeder Cattle, Cheese, Eggs (CH/US), Salmon, Poultry, Butter, Potato. Icon: `Beef` or `Milk`.

### 2. Render upsell on Dashboard for free users
**File**: `src/pages/Dashboard.tsx` (around lines 252-260)

Add 4 conditional blocks mirroring the existing `industrials` pattern:
```tsx
{!loading && !error && activeGroup === 'metals' && !isPremium && (
  <PremiumUpsellCard onUpgrade={handleUpgrade} variant="metals" />
)}
{/* …same for grains, softs, livestock */}
```

### 3. No catalog changes
The `PREMIUM_COMMODITIES` set is already correct — free users already get the curated subset, premium users get everything. This change is purely UX: surface the upgrade prompt on every group that has hidden premium items.

## What I will NOT touch
- `commodity-mappings.ts` — premium splits stay as-is
- Edge functions — already premium-aware
- Sidebar — counts already correct

## Verification
After build, as a free user, click each of Metals / Grains / Softs / Livestock and confirm the matching "Unlock N More" banner appears above the commodity grid, with correct copy and icon.

