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
