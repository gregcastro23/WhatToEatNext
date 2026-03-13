/**
 * Subscription & Premium Tier Types
 *
 * Two tiers: Free (default) and Premium.
 *
 * @file src/types/subscription.ts
 */

export type SubscriptionTier = "free" | "premium";

export type SubscriptionStatus =
  | "active"
  | "past_due"
  | "canceled"
  | "trialing"
  | "incomplete"
  | "unpaid";

export interface UserSubscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UsageRecord {
  userId: string;
  feature: string;
  count: number;
  periodStart: string;
  periodEnd: string;
}

/** Feature limits per tier */
export const TIER_LIMITS: Record<
  SubscriptionTier,
  {
    label: string;
    monthlyRecipeGenerations: number;
    cosmicRecipeAccess: boolean;
    restaurantCreator: boolean;
    advancedPlanetaryCharts: boolean;
    foodLabBook: boolean;
    diningCompanions: boolean;
    price: number;
    stripePriceId: string | null;
  }
> = {
  free: {
    label: "Free",
    monthlyRecipeGenerations: 10,
    cosmicRecipeAccess: false,
    restaurantCreator: false,
    advancedPlanetaryCharts: false,
    foodLabBook: true,
    diningCompanions: false,
    price: 0,
    stripePriceId: null,
  },
  premium: {
    label: "Premium",
    monthlyRecipeGenerations: Infinity,
    cosmicRecipeAccess: true,
    restaurantCreator: true,
    advancedPlanetaryCharts: true,
    foodLabBook: true,
    diningCompanions: true,
    price: 9.99,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID || null,
  },
};

/** Feature metadata for display in comparison tables */
export const FEATURE_LIST = [
  {
    key: "monthlyRecipeGenerations",
    label: "Monthly Recipe Generations",
    free: "10",
    premium: "Unlimited",
  },
  {
    key: "cosmicRecipeAccess",
    label: "AI Cosmic Recipe Generator",
    free: false,
    premium: true,
  },
  {
    key: "restaurantCreator",
    label: "Cosmic Restaurant Creator",
    free: false,
    premium: true,
  },
  {
    key: "advancedPlanetaryCharts",
    label: "Advanced Planetary Charts",
    free: false,
    premium: true,
  },
  {
    key: "foodLabBook",
    label: "Food Lab Book",
    free: true,
    premium: true,
  },
  {
    key: "diningCompanions",
    label: "Dining Companions",
    free: false,
    premium: true,
  },
] as const;
