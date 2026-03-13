/**
 * Premium Context Provider
 *
 * Provides subscription state, feature gating, and usage tracking
 * to the entire application. Replaces any localStorage-based mocks
 * with real API-backed subscription checks.
 *
 * @file src/contexts/PremiumContext.tsx
 */

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import type {
  SubscriptionTier,
  UserSubscription,
} from "@/types/subscription";
import { TIER_LIMITS } from "@/types/subscription";

interface PremiumContextValue {
  /** Current subscription (null while loading) */
  subscription: UserSubscription | null;
  /** Current tier (defaults to "starter") */
  tier: SubscriptionTier;
  /** Whether the subscription data is still loading */
  isLoading: boolean;
  /** Number of recipe generations used this month */
  recipeUsage: number;
  /** Max recipe generations for current tier */
  recipeLimit: number;
  /** Check if user has access to a premium feature */
  hasFeature: (feature: string) => boolean;
  /** Track a recipe generation and return updated count */
  trackRecipeGeneration: () => Promise<number>;
  /** Open Stripe checkout for an upgrade */
  openCheckout: (tier: SubscriptionTier) => Promise<void>;
  /** Open Stripe customer portal for managing subscription */
  openPortal: () => Promise<void>;
  /** Refresh subscription state from API */
  refresh: () => Promise<void>;
}

const PremiumContext = createContext<PremiumContextValue>({
  subscription: null,
  tier: "starter",
  isLoading: true,
  recipeUsage: 0,
  recipeLimit: 10,
  hasFeature: () => false,
  trackRecipeGeneration: async () => 0,
  openCheckout: async () => {},
  openPortal: async () => {},
  refresh: async () => {},
});

export function PremiumProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [subscription, setSubscription] = useState<UserSubscription | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [recipeUsage, setRecipeUsage] = useState(0);

  const tier: SubscriptionTier = subscription?.tier || "starter";
  const limits = TIER_LIMITS[tier];
  const recipeLimit = limits.monthlyRecipeGenerations;

  const fetchSubscription = useCallback(async () => {
    if (status !== "authenticated" || !session?.user) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/subscription");
      if (res.ok) {
        const data = await res.json();
        setSubscription(data.subscription);
        setRecipeUsage(data.recipeUsage || 0);
      }
    } catch (error) {
      console.error("[PremiumContext] Failed to fetch subscription:", error);
    } finally {
      setIsLoading(false);
    }
  }, [status, session?.user]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const hasFeature = useCallback(
    (feature: string): boolean => {
      const tierLimits = TIER_LIMITS[tier];
      if (feature === "monthlyRecipeGenerations") {
        return recipeUsage < tierLimits.monthlyRecipeGenerations;
      }
      return !!(tierLimits as Record<string, unknown>)[feature];
    },
    [tier, recipeUsage],
  );

  const trackRecipeGeneration = useCallback(async (): Promise<number> => {
    try {
      const res = await fetch("/api/subscription/usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feature: "recipe_generation" }),
      });
      if (res.ok) {
        const data = await res.json();
        setRecipeUsage(data.count);
        return data.count;
      }
    } catch (error) {
      console.error("[PremiumContext] Usage tracking failed:", error);
    }
    // Optimistic fallback
    const newCount = recipeUsage + 1;
    setRecipeUsage(newCount);
    return newCount;
  }, [recipeUsage]);

  const openCheckout = useCallback(
    async (targetTier: SubscriptionTier) => {
      try {
        const res = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tier: targetTier }),
        });
        if (res.ok) {
          const { url } = await res.json();
          if (url) window.location.href = url;
        }
      } catch (error) {
        console.error("[PremiumContext] Checkout failed:", error);
      }
    },
    [],
  );

  const openPortal = useCallback(async () => {
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      if (res.ok) {
        const { url } = await res.json();
        if (url) window.location.href = url;
      }
    } catch (error) {
      console.error("[PremiumContext] Portal failed:", error);
    }
  }, []);

  return (
    <PremiumContext.Provider
      value={{
        subscription,
        tier,
        isLoading,
        recipeUsage,
        recipeLimit,
        hasFeature,
        trackRecipeGeneration,
        openCheckout,
        openPortal,
        refresh: fetchSubscription,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium(): PremiumContextValue {
  return useContext(PremiumContext);
}

export default PremiumContext;
