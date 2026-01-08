import type { Database } from '@/lib/database.types'

type SubscriptionTier = Database['public']['Enums']['subscription_tier']

export const TIERS = {
  FREE: 'free' as SubscriptionTier,
  PRO: 'pro' as SubscriptionTier,
  ENTERPRISE: 'enterprise' as SubscriptionTier,
}

export const TIER_HIERARCHY = {
  [TIERS.FREE]: 1,
  [TIERS.PRO]: 2,
  [TIERS.ENTERPRISE]: 3,
}

export const hasAccess = (userTier: SubscriptionTier | null | undefined, requiredTier: SubscriptionTier): boolean => {
  if (!userTier) return requiredTier === TIERS.FREE
  return TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[requiredTier]
}

export const getUpgradeMessage = (requiredTier: SubscriptionTier): string => {
  switch (requiredTier) {
    case TIERS.PRO:
      return 'Upgrade to Pro to unlock this feature'
    case TIERS.ENTERPRISE:
      return 'Upgrade to Enterprise to access institutional-grade tools'
    default:
      return 'Upgrade to access this feature'
  }
}
