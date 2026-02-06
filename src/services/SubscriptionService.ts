import { supabase } from "../lib/supabase";
import {
  SUBSCRIPTION_PLANS,
  SubscriptionTier,
} from "../config/subscriptionPlans";
import {
  UserSubscription,
  ApiUsage,
  FeatureAccess,
} from "../types/subscription";

class SubscriptionService {
  async getUserSubscription(
    userId: string,
  ): Promise<UserSubscription & { tier: SubscriptionTier; plan: any }> {
    try {
      const { data, error } = await supabase
        .from("professional_members")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error || !data) {
        // Return default free tier
        return {
          user_id: userId,
          tier: "free",
          api_credits: SUBSCRIPTION_PLANS.free.apiCredits,
          subscription_tier: "free",
          plan: SUBSCRIPTION_PLANS.free,
        };
      }

      const tier = data.subscription_tier as SubscriptionTier;
      return {
        ...data,
        tier,
        plan: SUBSCRIPTION_PLANS[tier],
      };
    } catch (error) {
      console.error("Error fetching user subscription:", error);
      throw new Error("Failed to fetch subscription data");
    }
  }

  async checkFeatureAccess(
    userId: string,
    feature: string,
  ): Promise<FeatureAccess> {
    try {
      const subscription = await this.getUserSubscription(userId);

      // Check if subscription is active (if expires_at exists)
      if (
        subscription.expires_at &&
        new Date(subscription.expires_at) < new Date()
      ) {
        return {
          hasAccess: false,
          tier: subscription.tier,
          feature,
          remainingCredits: 0,
        };
      }

      // Feature access hierarchy
      const tierHierarchy: Record<SubscriptionTier, number> = {
        free: 0,
        entrepreneur: 1,
        professional: 1,
        enterprise: 2,
      };

      const featureRequirements: Record<string, number> = {
        education: 0,
        "basic-search": 0,
        "call-center": 1,
        "direct-mail": 1,
        "property-research": 1,
        "deal-analyzer": 1,
        "api-access": 1,
        "white-label": 2,
        "unlimited-api": 2,
        "priority-support": 2,
      };

      const userTierLevel = tierHierarchy[subscription.tier] || 0;
      const requiredLevel = featureRequirements[feature] || 0;
      const hasAccess = userTierLevel >= requiredLevel;

      return {
        hasAccess,
        tier: subscription.tier,
        feature,
        remainingCredits: subscription.api_credits,
      };
    } catch (error) {
      console.error("Error checking feature access:", error);
      return {
        hasAccess: false,
        tier: "free",
        feature,
        remainingCredits: 0,
      };
    }
  }

  async trackApiUsage(
    userId: string,
    apiName: string,
    credits: number = 1,
  ): Promise<number> {
    try {
      // Get current subscription
      const subscription = await this.getUserSubscription(userId);

      // Check if user has unlimited credits (enterprise)
      if (subscription.api_credits === -1) {
        // Track usage but don't deduct credits
        await supabase.from("api_usage").insert({
          user_id: userId,
          api_name: apiName,
          credits_used: credits,
        });
        return -1; // Unlimited
      }

      // Check if user has enough credits
      if (subscription.api_credits < credits) {
        throw new Error("Insufficient API credits");
      }

      // Track API usage
      const { error: usageError } = await supabase.from("api_usage").insert({
        user_id: userId,
        api_name: apiName,
        credits_used: credits,
      });

      if (usageError) {
        console.error("Error tracking API usage:", usageError);
      }

      // Update remaining credits
      const newCredits = subscription.api_credits - credits;
      const { error: updateError } = await supabase
        .from("professional_members")
        .update({
          api_credits: newCredits,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (updateError) {
        console.error("Error updating credits:", updateError);
        throw new Error("Failed to update API credits");
      }

      return newCredits;
    } catch (error) {
      console.error("Error tracking API usage:", error);
      throw error;
    }
  }

  async upgradeSubscription(
    userId: string,
    newTier: SubscriptionTier,
    stripeSubscriptionId?: string,
  ) {
    try {
      const plan = SUBSCRIPTION_PLANS[newTier];
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 month from now

      const { data, error } = await supabase
        .from("professional_members")
        .upsert({
          user_id: userId,
          subscription_tier: newTier,
          api_credits: plan.apiCredits,
          expires_at: expiresAt.toISOString(),
          stripe_subscription_id: stripeSubscriptionId,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error upgrading subscription:", error);
        throw new Error("Failed to upgrade subscription");
      }

      return data;
    } catch (error) {
      console.error("Error in upgradeSubscription:", error);
      throw error;
    }
  }

  async cancelSubscription(userId: string) {
    try {
      const { data, error } = await supabase
        .from("professional_members")
        .update({
          subscription_tier: "free",
          api_credits: SUBSCRIPTION_PLANS.free.apiCredits,
          expires_at: null,
          stripe_subscription_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        console.error("Error canceling subscription:", error);
        throw new Error("Failed to cancel subscription");
      }

      return data;
    } catch (error) {
      console.error("Error in cancelSubscription:", error);
      throw error;
    }
  }

  async getApiUsageStats(userId: string, days: number = 30) {
    try {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);

      const { data, error } = await supabase
        .from("api_usage")
        .select("api_name, credits_used, created_at")
        .eq("user_id", userId)
        .gte("created_at", fromDate.toISOString())
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching API usage stats:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error in getApiUsageStats:", error);
      return [];
    }
  }
}

export default new SubscriptionService();
