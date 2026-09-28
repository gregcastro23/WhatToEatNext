/**
 * Stripe subscription record types.
 *
 * The premium tier is retired (owner ruling 2026-09-28): the ESMS token economy
 * is the only way to unlock features, and operators are the one exemption, by
 * role (`isOperatorAccount`). `user_subscriptions.tier` stays in the database as
 * inert history; no code reads or writes it.
 *
 * @file src/types/subscription.ts
 */

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
  status: SubscriptionStatus;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
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
