# Professional Redesign — Linear-style, full polish

A complete visual overhaul in the spirit of Linear / modern SaaS: refined dark neutrals, a single restrained purple accent, crisp Space Grotesk + DM Sans typography, and consistent spacing/hierarchy across every page. No teal, no purple gradients, no "vibe coded" tells.

## Design language

**Palette (tokens in `src/index.css`)**
- `--background` `#08090a` (near-black, slight warm bias)
- `--card` / `--popover` `#0e0f12`
- `--muted` `#1c1d22`
- `--border` `#23252b` (1px, never heavier)
- `--foreground` `#e6e7eb`
- `--muted-foreground` `#8a8f98`
- `--primary` `#5e6ad2` (Linear-style indigo — the only saturated color, used sparingly)
- `--accent` `#3d4ba8` (hover/pressed only)
- `--success` `#4cb782`, `--destructive` `#eb5757`, `--warning` `#f2c94c` (data-only, never decorative)
- Remove all teal references and purple gradients. No `bg-gradient-to-*` on chrome.

**Typography**
- Install `@fontsource/space-grotesk` + `@fontsource/dm-sans`, import in `src/main.tsx`, wire into `tailwind.config.ts`.
- Headings: Space Grotesk, tight tracking (`-0.02em`), weight 500–600 (not 700+).
- Body/UI: DM Sans, 14px base on desktop, 15px mobile. Drop the current giant responsive H1 scale.
- Numbers: keep JetBrains Mono, tabular-nums everywhere prices/changes render.

**Surfaces & depth**
- Flat. One elevation level (subtle 1px border + `rgba(0,0,0,0.4)` shadow on popovers only).
- Remove `shadow-soft/medium/strong` overuse, `backdrop-blur`, glass effects, `hover:scale`, `animate-float`, `animate-pulse-soft`, shimmer text.
- Radii: `--radius: 0.5rem` (down from 0.75). Buttons `rounded-md`, cards `rounded-lg`.

**Motion**
- 120–150ms ease-out only. No bounces, no float, no shine. Hover = subtle bg shift, not scale.

## Scope — every page

**Chrome**
- Rebuild `CommoditySidebar` in Linear style: 240px, single-column, no group cards, subtle section labels in `--muted-foreground` uppercase 11px, active row = `bg-muted` + left 2px primary bar.
- New top bar: 48px, left-aligned breadcrumb, right-aligned search + currency + profile. Remove decorative elements.
- Consistent page header component: H1 (24px), one-line description, action buttons right-aligned.

**Pages (full pass)**
- Dashboard, Portfolio, Watchlists, Price Alerts, COT Reports, Economic Calendar, Forward Curves, Term Structure, Vol Cone, Roll Scanner, Spread/Position Calculators, Market Screener, Market Correlation, Market Sentiment, Market Status, News Settings, Expert Insights, Learning Hub, Copilot, Auth, Settings.
- Each gets: standardized page header, consistent card grid, real empty states, skeleton loaders matching final layout (no spinners), proper error states.

**Components**
- `CommodityCard`: denser, mono price, single-line change with arrow glyph (no colored pills), sparkline inline.
- Charts: remove drop shadows, thin 1px gridlines `--border`, axis labels `--muted-foreground` 11px, single series color = `--primary`, comparison series = neutral whites/grays not rainbow.
- Tables: zebra removed, row hover only, sticky header, right-aligned numerics.
- Buttons: ghost = default for secondary actions, primary reserved for one CTA per view.
- Toasts/dialogs: flat, single border, no blur.

**Micro-interactions**
- Tab/route transitions: 100ms opacity only.
- Focus rings: 2px `--primary` at 40% opacity, no offset glow.
- Keyboard shortcuts visible in menus (⌘K palette already exists — surface it).

## Technical changes

```text
src/index.css            → rewrite :root + .dark tokens, delete shimmer/shine/float/glass utilities
tailwind.config.ts       → fontFamily.sans = Space Grotesk fallback chain irrelevant; body = DM Sans;
                           remove soft/medium/strong shadows, add single `shadow-popover`
src/main.tsx             → import '@fontsource/space-grotesk/500.css' etc.
src/App.css              → delete (legacy Vite template leftovers leaking #root max-width)
src/components/CommoditySidebar.tsx + sidebar/*  → rebuild Linear-style
src/components/sidebar/ThemeSwitcher.tsx         → simplify
src/components/CommodityCard.tsx                 → denser layout, mono numerics
src/components/charts/*                          → strip shadows, neutral palette, thin gridlines
src/components/ui/{card,button,input,dialog,
  popover,toast,tabs,table,badge}.tsx            → variant cleanup, remove gradient/glass variants
src/components/mobile/*                          → remove scale/bounce, keep haptics
src/components/loading/LoadingSkeletons.tsx      → rebuild skeletons matching new layouts
src/pages/*.tsx (all 25+)                        → apply PageHeader component, fix spacing,
                                                   replace ad-hoc styling with tokens
```

Install:
```text
bun add @fontsource/space-grotesk @fontsource/dm-sans
```

No backend, RLS, edge function, or data-layer changes. No new routes. Capacitor config untouched.

## Out of scope
- Light theme polish (dark is primary; light gets token updates only, not page-by-page review).
- New features or content changes.
- Marketing/landing page (separate concern).

## Risks
- Large surface area — I'll work page-by-page so the preview stays usable between edits.
- Some custom one-off styling in pages may need judgment calls; I'll default to tokens over preserving quirks.
