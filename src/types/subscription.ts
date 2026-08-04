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
 * ESMS Token Costs per Feature (Pay-as-You-Go)
 *
 * All features on Alchm.kitchen are available to registered users by spending
 * a sensible amount of claimed ESMS tokens (Spirit, Essence, Matter, Substance).
 */
export const FEATURE_TOKEN_COSTS: Record<
  string,
  { cost: number; label: string; description: string }
> = {
  cosmicRecipeAccess: {
    cost: 5,
    label: "5 ESMS",
    description: "Generate an AI cosmic recipe tuned to planetary transits",
  },
  tiltSkilletPlanner: {
    cost: 5,
    label: "5 ESMS",
    description: "Plan a large-batch recipe-as-a-circuit",
  },
  restaurantCreator: {
    cost: 10,
    label: "10 ESMS",
    description: "Generate a concept restaurant menu & branding",
  },
  diningCompanions: {
    cost: 5,
    label: "5 ESMS",
    description: "Calculate guest synastry and dinner party harmonization",
  },
  sauceRecommender: {
    cost: 3,
    label: "3 ESMS",
    description: "Get AI mother sauce recommendations tuned to current sky",
  },
  advancedPlanetaryCharts: {
    cost: 3,
    label: "3 ESMS",
    description: "Interactive transit analysis and agent synastry",
  },
  foodLabBook: {
    cost: 0,
    label: "Free",
    description: "Access your personal lab notebook",
  },
};

/**
 * Backward compatibility: Formerly minimum holdings gate.
 * Now set to 0 as all tools use ESMS token pay-as-you-go.
 */
export const MINIMUM_HOLDINGS_FOR_PREMIUM = 0;

/**
 * Feature flags per tier.
 * In the ESMS Token Economy, all features are accessible via ESMS tokens.
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
    tiltSkilletPlanner: boolean;
    price: number;
    stripePriceId: string | null;
  }
> = {
  free: {
    label: "Standard",
    cosmicRecipeAccess: true,
    restaurantCreator: true,
    advancedPlanetaryCharts: true,
    foodLabBook: true,
    diningCompanions: true,
    sauceRecommender: true,
    tiltSkilletPlanner: true,
    price: 0,
    stripePriceId: null,
  },
  premium: {
    label: "Alchemist",
    cosmicRecipeAccess: true,
    restaurantCreator: true,
    advancedPlanetaryCharts: true,
    foodLabBook: true,
    diningCompanions: true,
    sauceRecommender: true,
    tiltSkilletPlanner: true,
    price: 0,
    stripePriceId: null,
  },
};

/** Feature metadata for display in ESMS economy surfaces */
export const FEATURE_LIST = [
  {
    key: "recipeGeneration",
    label: "Recipe Generation",
    free: "5 ESMS tokens / gen",
    premium: "5 ESMS tokens / gen",
  },
  {
    key: "cosmicRecipeAccess",
    label: "AI Cosmic Recipe Generator",
    free: "5 ESMS tokens",
    premium: "5 ESMS tokens",
  },
  {
    key: "restaurantCreator",
    label: "Cosmic Restaurant Creator",
    free: "10 ESMS tokens",
    premium: "10 ESMS tokens",
  },
  {
    key: "advancedPlanetaryCharts",
    label: "Advanced Planetary Charts",
    free: "3 ESMS tokens",
    premium: "3 ESMS tokens",
  },
  {
    key: "foodLabBook",
    label: "Food Lab Book",
    free: "Free",
    premium: "Free",
  },
  {
    key: "diningCompanions",
    label: "Dining Companions",
    free: "5 ESMS tokens",
    premium: "5 ESMS tokens",
  },
  {
    key: "tiltSkilletPlanner",
    label: "Tilt Skillet Batch Planner",
    free: "5 ESMS tokens",
    premium: "5 ESMS tokens",
  },
] as const;

