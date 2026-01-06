export interface UserSubscription {
  id?: string;
  user_id: string;
  subscription_tier: "free" | "professional" | "enterprise";
  expires_at?: string;
  api_credits: number;
  created_at?: string;
  updated_at?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
}

export interface ApiUsage {
  id?: string;
  user_id: string;
  api_name: string;
  credits_used: number;
  created_at?: string;
}

export interface FeatureAccess {
  hasAccess: boolean;
  tier: string;
  feature: string;
  remainingCredits?: number;
}
