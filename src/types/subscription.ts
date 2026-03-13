/**
 * Subscription & Premium Tier Types
 *
 * Defines the subscription tiers, feature gates, and usage tracking
 * for the Alchm.kitchen premium system.
 *
 * @file src/types/subscription.ts
 */

export type SubscriptionTier = "starter" | "premium" | "cosmic";

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
    prioritySupport: boolean;
    price: number;
    stripePriceId: string | null;
  }
> = {
  starter: {
    label: "Starter",
    monthlyRecipeGenerations: 10,
    cosmicRecipeAccess: false,
    restaurantCreator: false,
    advancedPlanetaryCharts: false,
    foodLabBook: true,
    diningCompanions: false,
    prioritySupport: false,
    price: 0,
    stripePriceId: null,
  },
  premium: {
    label: "Premium",
    monthlyRecipeGenerations: 100,
    cosmicRecipeAccess: true,
    restaurantCreator: true,
    advancedPlanetaryCharts: true,
    foodLabBook: true,
    diningCompanions: true,
    prioritySupport: false,
    price: 9.99,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID || null,
  },
  cosmic: {
    label: "Cosmic",
    monthlyRecipeGenerations: Infinity,
    cosmicRecipeAccess: true,
    restaurantCreator: true,
    advancedPlanetaryCharts: true,
    foodLabBook: true,
    diningCompanions: true,
    prioritySupport: true,
    price: 19.99,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_COSMIC_PRICE_ID || null,
  },
};

/** Feature metadata for display in comparison tables */
export const FEATURE_LIST = [
  {
    key: "monthlyRecipeGenerations",
    label: "Monthly Recipe Generations",
    starter: "10",
    premium: "100",
    cosmic: "Unlimited",
  },
  {
    key: "cosmicRecipeAccess",
    label: "AI Cosmic Recipe Generator",
    starter: false,
    premium: true,
    cosmic: true,
  },
  {
    key: "restaurantCreator",
    label: "Cosmic Restaurant Creator",
    starter: false,
    premium: true,
    cosmic: true,
  },
  {
    key: "advancedPlanetaryCharts",
    label: "Advanced Planetary Charts",
    starter: false,
    premium: true,
    cosmic: true,
  },
  {
    key: "foodLabBook",
    label: "Food Lab Book",
    starter: true,
    premium: true,
    cosmic: true,
  },
  {
    key: "diningCompanions",
    label: "Dining Companions",
    starter: false,
    premium: true,
    cosmic: true,
  },
  {
    key: "prioritySupport",
    label: "Priority Support",
    starter: false,
    premium: false,
    cosmic: true,
  },
] as const;
