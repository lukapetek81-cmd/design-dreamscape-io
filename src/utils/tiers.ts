/**
 * Three-tier monetization matrix.
 * Free (default) → Premium ($6.99/mo) → Pro ($19.99/mo)
 *
 * Server-side enforcement lives in DB triggers (`enforce_price_alert_limit`,
 * `enforce_portfolio_limit`). These constants are mirrored here for client UX.
 */

export type Tier = 'free' | 'premium' | 'pro';

export interface TierLimits {
  activeAlerts: number;
  portfolios: number;
  csvExport: boolean;
  /** Full energy/metals catalog incl. 20 extra markets, regional blends, etc. */
  extendedCatalog: boolean;
  /** Priority data refresh & EOD-vs-LIVE elevation. */
  priorityRefresh: boolean;
}

export const TIER_LIMITS: Record<Tier, TierLimits> = {
  free: {
    activeAlerts: 1,
    portfolios: 1,
    csvExport: false,
    extendedCatalog: false,
    priorityRefresh: false,
  },
  premium: {
    activeAlerts: 10,
    portfolios: 3,
    csvExport: true,
    extendedCatalog: false,
    priorityRefresh: false,
  },
  pro: {
    activeAlerts: 50,
    portfolios: Number.POSITIVE_INFINITY,
    csvExport: true,
    extendedCatalog: true,
    priorityRefresh: true,
  },
};

export const TIER_PRICING = {
  premium: { monthly: 6.99, productId: 'premium_lite_monthly', label: 'Premium' },
  pro: { monthly: 19.99, productId: 'premium_monthly', label: 'Pro' },
} as const;

export const tierFromProfile = (
  subscription_active?: boolean | null,
  subscription_tier?: string | null,
): Tier => {
  if (!subscription_active) return 'free';
  if (subscription_tier === 'pro') return 'pro';
  if (subscription_tier === 'premium') return 'premium';
  return 'free';
};

export const tierAtLeast = (tier: Tier, min: Tier): boolean => {
  const order: Record<Tier, number> = { free: 0, premium: 1, pro: 2 };
  return order[tier] >= order[min];
};

export const limitsFor = (tier: Tier): TierLimits => TIER_LIMITS[tier];