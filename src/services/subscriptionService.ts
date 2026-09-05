/**
 * Subscription Service
 *
 * Manages user subscription state, usage tracking, and feature gating.
 * Uses PostgreSQL for persistent storage with in-memory fallback.
 *
 * @file src/services/subscriptionService.ts
 */

import { randomUUID } from "crypto";
import { _logger } from "@/lib/logger";
import type {
  SubscriptionTier as _SubscriptionTier,
  SubscriptionStatus as _SubscriptionStatus,
  UserSubscription,
  UsageRecord,
} from "@/types/subscription";

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
const memoryUsage = new Map<string, UsageRecord>();

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
          `SELECT id, user_id as "userId", tier, status,
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
    // In ESMS Token Economy, default active status with free/standard tier
    if (sub) {
      return {
        ...sub,
        status: "active",
      };
    }
    // Auto-provision standard free tier for new users
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
      tier: "free",
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
            id, user_id, tier, status,
            current_period_start, current_period_end,
            cancel_at_period_end, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (user_id) DO NOTHING`,
          [
            sub.id,
            sub.userId,
            sub.tier,
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
        | "tier"
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

        if (updates.tier !== undefined) {
          setClauses.push(`tier = $${idx++}`);
          values.push(updates.tier);
        }
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
           RETURNING id, user_id as "userId", tier, status,
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

  async getUsage(
    userId: string,
    feature: string,
  ): Promise<number> {
    const period = getCurrentPeriod();
    const db = await getDbModule();

    if (db) {
      try {
        const result = await db.executeQuery<{ count: number }>(
          `SELECT count FROM usage_records
           WHERE user_id = $1 AND feature = $2 AND period_start = $3`,
          [userId, feature, period.start],
        );
        return result.rows[0]?.count ?? 0;
      } catch (error) {
        _logger.error("[subscriptionService] Usage query failed:", error);
      }
    }

    const key = `${userId}:${feature}:${period.start}`;
    return memoryUsage.get(key)?.count ?? 0;
  }

  async incrementUsage(
    userId: string,
    feature: string,
  ): Promise<number> {
    const period = getCurrentPeriod();
    const db = await getDbModule();

    if (db) {
      try {
        const result = await db.executeQuery<{ count: number }>(
          `INSERT INTO usage_records (user_id, feature, count, period_start, period_end)
           VALUES ($1, $2, 1, $3, $4)
           ON CONFLICT (user_id, feature, period_start)
           DO UPDATE SET count = usage_records.count + 1, updated_at = NOW()
           RETURNING count`,
          [userId, feature, period.start, period.end],
        );
        return result.rows[0]?.count ?? 1;
      } catch (error) {
        _logger.error("[subscriptionService] Increment failed:", error);
      }
    }

    const key = `${userId}:${feature}:${period.start}`;
    const existing = memoryUsage.get(key);
    const newCount = (existing?.count ?? 0) + 1;
    memoryUsage.set(key, {
      userId,
      feature,
      count: newCount,
      periodStart: period.start,
      periodEnd: period.end,
    });
    return newCount;
  }

  /**
   * Boolean feature-flag check: does the user's tier unlock this feature?
   *
   * NOTE: this is a feature-ACCESS gate, not a usage-rate cap. Usage rates
   * (recipe generation etc.) are throttled by the token economy. Don't
   * re-add a `monthlyRecipeGenerations` branch — see feedback_throttling_model.
   */
  canUseFeature(
    userId: string,
    _feature: string,
  ): Promise<{ allowed: boolean; reason?: string }> {
    if (!userId) {
      return Promise.resolve({
        allowed: false,
        reason: "Authentication required — please sign in to use Alchm tools.",
      });
    }
    // All tools are accessible via ESMS tokens in the token economy
    return Promise.resolve({ allowed: true });
  }

  async getSubscriptionByStripeCustomerId(
    stripeCustomerId: string,
  ): Promise<UserSubscription | null> {
    const db = await getDbModule();
    if (db) {
      try {
        const result = await db.executeQuery<UserSubscription>(
          `SELECT id, user_id as "userId", tier, status,
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
