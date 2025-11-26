// Re-export membership tiers configuration for easy import in React components
// This file serves as a bridge between the service module and React components

export { MEMBERSHIP_TIERS, FEATURE_COMPARISON, UPGRADE_PATHS } from './membership-tiers';

// Type definitions for TypeScript
export interface MembershipTier {
  id: string;
  name: string;
  displayName: string;
  price: number;
  billingPeriod: string | null;
  annualPrice?: number;
  annualSavings?: number;
  features: {
    [key: string]: any;
  };
  landingPage: string;
  ctaText: string;
  highlights: string[];
  popular?: boolean;
  badge?: string;
}

export type TierLevel = 'FREE' | 'PREMIUM' | 'ELITE';

export interface MembershipTiers {
  FREE: MembershipTier;
  PREMIUM: MembershipTier;
  ELITE: MembershipTier;
}
