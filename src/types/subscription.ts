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

/**
 * Feature flags per tier.
 *
 * NOTE: there is intentionally no `monthlyRecipeGenerations` cap. Recipe
 * generation is throttled purely by the token economy (Spirit/Essence cost
 * per call, personalised to the user's chart × current sky). Free vs Premium
 * is a feature-access distinction (cosmic recipes, dining companions, etc.),
 * not a usage quota.
 */
export const TIER_LIMITS: Record<
  SubscriptionTier,
  {
    label: string;
    cosmicRecipeAccess: boolean;
    restaurantCreator: boolean;
    advancedPlanetaryCharts: boolean;
    foodLabBook: boolean;
    diningCompanions: boolean;
    sauceRecommender: boolean;
    price: number;
    stripePriceId: string | null;
  }
> = {
  free: {
    label: "Free",
    cosmicRecipeAccess: false,
    restaurantCreator: false,
    advancedPlanetaryCharts: false,
    foodLabBook: true,
    diningCompanions: false,
    sauceRecommender: false,
    price: 0,
    stripePriceId: null,
  },
  premium: {
    label: "Premium",
    cosmicRecipeAccess: true,
    restaurantCreator: true,
    advancedPlanetaryCharts: true,
    foodLabBook: true,
    diningCompanions: true,
    sauceRecommender: true,
    price: 5.00,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID || null,
  },
};

/** Feature metadata for display in comparison tables */
export const FEATURE_LIST = [
  {
    key: "recipeGeneration",
    label: "Recipe Generation",
    free: "Pay-as-you-go with cosmic tokens",
    premium: "Pay-as-you-go with cosmic tokens",
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
