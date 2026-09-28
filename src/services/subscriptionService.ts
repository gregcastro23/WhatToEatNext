/**
 * Subscription Service
 *
 * Keeps each user's Stripe customer / subscription record. It grants nothing:
 * the premium tier is retired (owner ruling 2026-09-28), so no method reads or
 * writes `user_subscriptions.tier`, which stays in the table as inert history.
 * Uses PostgreSQL for persistent storage with in-memory fallback.
 *
 * @file src/services/subscriptionService.ts
 */

import { randomUUID } from "crypto";
import { _logger } from "@/lib/logger";
import type { UserSubscription } from "@/types/subscription";

const isServerWithDB = (): boolean => typeof window === "undefined" && !!process.env.DATABASE_URL;

let dbModule: typeof import("@/lib/database") | null = null;
const getDbModule = async (): Promise<typeof import("@/lib/database") | null> => {
  if (!dbModule && isServerWithDB()) {
    try {
      dbModule = await import("@/lib/database");
    } catch {
      _logger.error("[subscriptionService] DB not available, using in-memory");
    }
  }
  return dbModule;
};

// In-memory fallback
const memorySubscriptions = new Map<string, UserSubscription>();

function getCurrentPeriod(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return { start: start.toISOString(), end: end.toISOString() };
}

class SubscriptionService {
  async getUserSubscription(
    userId: string,
  ): Promise<UserSubscription | null> {
    let sub: UserSubscription | null = null;
    const db = await getDbModule();
    if (db) {
      try {
        const result = await db.executeQuery<UserSubscription>(
          `SELECT id, user_id as "userId", status,
                  stripe_customer_id as "stripeCustomerId",
                  stripe_subscription_id as "stripeSubscriptionId",
                  current_period_start as "currentPeriodStart",
                  current_period_end as "currentPeriodEnd",
                  cancel_at_period_end as "cancelAtPeriodEnd",
                  created_at as "createdAt",
                  updated_at as "updatedAt"
           FROM user_subscriptions WHERE user_id = $1`,
          [userId],
        );
        sub = result.rows[0] ?? null;
      } catch (error) {
        _logger.error("[subscriptionService] DB query failed:", error);
      }
    }
    sub ??= memorySubscriptions.get(userId) ?? null;
    if (sub) {
      return {
        ...sub,
        status: "active",
      };
    }
    return this.createDefaultSubscription(userId);
  }

  async getOrCreateSubscription(userId: string): Promise<UserSubscription> {
    const existing = await this.getUserSubscription(userId);
    if (existing) return existing;
    return this.createDefaultSubscription(userId);
  }

  private async createDefaultSubscription(
    userId: string,
  ): Promise<UserSubscription> {
    const period = getCurrentPeriod();
    const now = new Date().toISOString();
    const sub: UserSubscription = {
      id: randomUUID(),
      userId,
      status: "active",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      currentPeriodStart: period.start,
      currentPeriodEnd: period.end,
      cancelAtPeriodEnd: false,
      createdAt: now,
      updatedAt: now,
    };

    const db = await getDbModule();
    if (db) {
      try {
        await db.executeQuery(
          `INSERT INTO user_subscriptions (
            id, user_id, status,
            current_period_start, current_period_end,
            cancel_at_period_end, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (user_id) DO NOTHING`,
          [
            sub.id,
            sub.userId,
            sub.status,
            sub.currentPeriodStart,
            sub.currentPeriodEnd,
            sub.cancelAtPeriodEnd,
            sub.createdAt,
            sub.updatedAt,
          ],
        );
      } catch (error) {
        _logger.error("[subscriptionService] Insert failed:", error);
      }
    }
    memorySubscriptions.set(userId, sub);
    return sub;
  }

  async updateSubscription(
    userId: string,
    updates: Partial<
      Pick<
        UserSubscription,
        | "status"
        | "stripeCustomerId"
        | "stripeSubscriptionId"
        | "currentPeriodStart"
        | "currentPeriodEnd"
        | "cancelAtPeriodEnd"
      >
    >,
  ): Promise<UserSubscription | null> {
    const db = await getDbModule();
    if (db) {
      try {
        const setClauses: string[] = ["updated_at = NOW()"];
        const values: unknown[] = [];
        let idx = 1;

        if (updates.status !== undefined) {
          setClauses.push(`status = $${idx++}`);
          values.push(updates.status);
        }
        if (updates.stripeCustomerId !== undefined) {
          setClauses.push(`stripe_customer_id = $${idx++}`);
          values.push(updates.stripeCustomerId);
        }
        if (updates.stripeSubscriptionId !== undefined) {
          setClauses.push(`stripe_subscription_id = $${idx++}`);
          values.push(updates.stripeSubscriptionId);
        }
        if (updates.currentPeriodStart !== undefined) {
          setClauses.push(`current_period_start = $${idx++}`);
          values.push(updates.currentPeriodStart);
        }
        if (updates.currentPeriodEnd !== undefined) {
          setClauses.push(`current_period_end = $${idx++}`);
          values.push(updates.currentPeriodEnd);
        }
        if (updates.cancelAtPeriodEnd !== undefined) {
          setClauses.push(`cancel_at_period_end = $${idx++}`);
          values.push(updates.cancelAtPeriodEnd);
        }

        values.push(userId);
        const result = await db.executeQuery<UserSubscription>(
          `UPDATE user_subscriptions SET ${setClauses.join(", ")}
           WHERE user_id = $${idx}
           RETURNING id, user_id as "userId", status,
                     stripe_customer_id as "stripeCustomerId",
                     stripe_subscription_id as "stripeSubscriptionId",
                     current_period_start as "currentPeriodStart",
                     current_period_end as "currentPeriodEnd",
                     cancel_at_period_end as "cancelAtPeriodEnd",
                     created_at as "createdAt",
                     updated_at as "updatedAt"`,
          values,
        );
        return result.rows[0] ?? null;
      } catch (error) {
        _logger.error("[subscriptionService] Update failed:", error);
      }
    }

    // In-memory fallback
    const existing = memorySubscriptions.get(userId);
    if (existing) {
      const updated = {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      memorySubscriptions.set(userId, updated);
      return updated;
    }
    return null;
  }

  async getSubscriptionByStripeCustomerId(
    stripeCustomerId: string,
  ): Promise<UserSubscription | null> {
    const db = await getDbModule();
    if (db) {
      try {
        const result = await db.executeQuery<UserSubscription>(
          `SELECT id, user_id as "userId", status,
                  stripe_customer_id as "stripeCustomerId",
                  stripe_subscription_id as "stripeSubscriptionId",
                  current_period_start as "currentPeriodStart",
                  current_period_end as "currentPeriodEnd",
                  cancel_at_period_end as "cancelAtPeriodEnd",
                  created_at as "createdAt",
                  updated_at as "updatedAt"
           FROM user_subscriptions WHERE stripe_customer_id = $1`,
          [stripeCustomerId],
        );
        return result.rows[0] ?? null;
      } catch (error) {
        _logger.error("[subscriptionService] Stripe lookup failed:", error);
      }
    }
    return null;
  }
}

export const subscriptionService = new SubscriptionService();
