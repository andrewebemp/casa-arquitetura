import { SubscriptionTier } from '../types/subscription';

export interface TierLimits {
  renders_limit: number;
  priority: number;
}

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  free: { renders_limit: 3, priority: 0 },
  pro: { renders_limit: 100, priority: 1 },
  business: { renders_limit: 500, priority: 2 },
};
