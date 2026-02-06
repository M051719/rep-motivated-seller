// src/components/ProtectedRoute.tsx
import React, { useEffect, useState, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import SubscriptionService from "../services/SubscriptionService";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredTier?: "free" | "professional" | "enterprise";
  feature?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredTier = "free",
  feature,
}) => {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAccess = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setHasAccess(false);
      setLoading(false);
      return;
    }

    if (feature) {
      const canAccess = await SubscriptionService.checkFeatureAccess(
        user.id,
        feature,
      );
      setHasAccess(canAccess);
    } else {
      const subscription = await SubscriptionService.getUserSubscription(
        user.id,
      );
      const tierLevels = { free: 0, professional: 1, enterprise: 2 };
      setHasAccess(tierLevels[subscription.tier] >= tierLevels[requiredTier]);
    }

    setLoading(false);
  }, [feature, requiredTier]);

  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return <Navigate to="/pricing" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
