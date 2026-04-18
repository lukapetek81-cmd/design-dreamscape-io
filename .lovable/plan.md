

The user is asking a pricing/business question, not a code change. I'll answer directly based on what I know from the codebase memory.

## Pricing analysis for Premium Energy Markets (100 MAU)

### OilPriceAPI quota math

**Premium-only commodities**: 20 items (4 crude benchmarks + 4 regional crude + 8 refined + 7 marine — per `PREMIUM_ENERGY` set in `oil-price-api/index.ts`).

**Cache TTL**: 30 minutes (per `SINGLE_CACHE_TTL` / `BATCH_CACHE_TTL`).
→ Max **2 calls/hour per commodity**, regardless of user count, because cache is server-side and shared.

**Per premium user, per month** (assuming 12h/day active window, ~30 days):
- 20 commodities × 2 calls/hr × 12 hr × 30 days = **14,400 API calls/month** at the upstream
- But this is **shared across all premium users** (server cache), so it's a fixed ceiling, not per-user.

**Realistic ceiling** (24/7 cache refresh): 20 × 2 × 24 × 30 = **28,800 calls/month** total for premium tier, no matter if you have 1 or 1,000 premium users.

### OilPriceAPI plan costs (public pricing, approx.)
- Free: 10K calls/mo — exhausted (current state)
- Starter: ~$39/mo — 50K calls
- Pro: ~$99/mo — 200K calls
- Business: ~$299/mo — 1M calls

For premium tier alone at 28,800 calls/mo ceiling → **Starter ($39/mo) is sufficient**.
Add free-tier energy (10 items × 2/hr × 24 × 30 = 14,400) → total **~43K/mo** → still fits Starter, tight margin. Pro ($99) gives comfortable headroom.

### Pricing recommendation for 100 MAU

Assume realistic conversion: **5–10% of MAU convert to premium** = 5–10 paying users at 100 MAU.

**Cost to cover** (monthly):
- OilPriceAPI Pro: $99 (safe headroom for growth)
- Supabase/edge compute: ~$25 (Cloud free tier likely covers it)
- Buffer for FMP / news APIs: ~$20
- **Total infra: ~$120–150/mo**

**Break-even pricing**:
| Premium users | Price needed to cover $120 | Price for 50% margin |
|---|---|---|
| 5 | $24/mo | $36/mo |
| 10 | $12/mo | $18/mo |
| 20 | $6/mo | $9/mo |

**Recommendation: $9.99/mo or $79/yr**
- Covers infra at ~12 paying users (12% of MAU — achievable)
- Comparable to Trading View Pro ($14.95), Investing.com Pro ($9.99)
- Annual plan locks in cash flow and reduces churn risk
- Add a **$19.99/mo "Pro" tier** later with alerts, exports, API access for power users

### Key insight
Because OilPriceAPI cost is **fixed (server-side cache)**, not per-user, your unit economics improve dramatically with scale. At 100 MAU the math is tight; at 1,000 MAU the same $99 OilPriceAPI bill is amortized across 50–100 paying users → 80%+ gross margin.

### Action items if you want me to implement
1. Enable Lovable Payments (Stripe recommended for SaaS subscriptions) and create a $9.99/mo + $79/yr product.
2. Wire `subscription_active` + `subscription_tier='premium'` in `profiles` from Stripe webhook.
3. Update `PremiumUpsellCard` CTA to launch Stripe Checkout.

