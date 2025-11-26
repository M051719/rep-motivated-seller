import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import SubscriptionService from '../services/SubscriptionService';
import { UserSubscription, FeatureAccess } from '../types/subscription';
import { SubscriptionTier } from '../config/subscriptionPlans';

export function useSubscription() {
  const { user } = useAuthStore();
  const [subscription, setSubscription] = useState<(UserSubscription & { tier: SubscriptionTier; plan: any }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchSubscription();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const sub = await SubscriptionService.getUserSubscription(user!.id);
      setSubscription(sub);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription');
    } finally {
      setLoading(false);
    }
  };

  const checkFeatureAccess = async (feature: string): Promise<FeatureAccess> => {
    if (!user?.id) {
      return { hasAccess: false, tier: 'free', feature };
    }
    return await SubscriptionService.checkFeatureAccess(user.id, feature);
  };

  const trackApiUsage = async (apiName: string, credits: number = 1): Promise<number> => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }
    const remainingCredits = await SubscriptionService.trackApiUsage(user.id, apiName, credits);
    // Refresh subscription data
    await fetchSubscription();
    return remainingCredits;
  };

  const upgradeSubscription = async (newTier: SubscriptionTier, stripeSubscriptionId?: string) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }
    await SubscriptionService.upgradeSubscription(user.id, newTier, stripeSubscriptionId);
    await fetchSubscription();
  };

  return {
    subscription,
    loading,
    error,
    checkFeatureAccess,
    trackApiUsage,
    upgradeSubscription,
    refreshSubscription: fetchSubscription
  };
}