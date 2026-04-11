/**
 * Streak Service
 *
 * Tracks daily login/activity streaks for the ESMS token economy.
 * Handles streak freezes and milestone detection.
 *
 * @file src/services/StreakService.ts
 */

import { _logger } from "@/lib/logger";
import type { UserStreak } from "@/types/economy";

// ─── DB Bootstrapping ─────────────────────────────────────────────────

const isServerWithDB = (): boolean =>
  typeof window === "undefined" && !!process.env.DATABASE_URL;

let dbModule: typeof import("@/lib/database") | null = null;
const getDbModule = async () => {
  if (!dbModule && isServerWithDB()) {
    try {
      dbModule = await import("@/lib/database");
    } catch {
      _logger.warn("[StreakService] Database module not available");
    }
  }
  return dbModule;
};

// ─── In-Memory Fallback ───────────────────────────────────────────────

const memoryStreaks = new Map<string, UserStreak>();

// ─── Helpers ──────────────────────────────────────────────────────────

function rowToStreak(row: any): UserStreak {
  return {
    currentStreak: row.current_streak || 0,
    longestStreak: row.longest_streak || 0,
    lastActivityDate: row.last_activity_date || null,
    streakFrozenUntil: row.streak_frozen_until || null,
    updatedAt: row.updated_at?.toISOString?.() || row.updated_at || new Date().toISOString(),
  };
}

function getUTCDateString(date?: Date): string {
  const d = date || new Date();
  return d.toISOString().slice(0, 10);
}

function daysBetween(dateStr1: string, dateStr2: string): number {
  const d1 = new Date(`${dateStr1  }T00:00:00Z`);
  const d2 = new Date(`${dateStr2  }T00:00:00Z`);
  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

// ─── Service Class ────────────────────────────────────────────────────

class StreakService {

  /**
   * Get user's current streak data. Creates a default row if none exists.
   */
  async getStreak(userId: string): Promise<UserStreak> {
    const db = await getDbModule();

    if (db) {
      try {
        await db.executeQuery(
          `INSERT INTO user_streaks (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`,
          [userId],
        );
        const result = await db.executeQuery(
          `SELECT * FROM user_streaks WHERE user_id = $1`,
          [userId],
        );
        if (result.rows.length > 0) {
          return rowToStreak(result.rows[0]);
        }
      } catch (error) {
        _logger.error("[StreakService] getStreak failed:", error as any);
      }
    }

    // In-memory fallback
    if (!memoryStreaks.has(userId)) {
      memoryStreaks.set(userId, {
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        streakFrozenUntil: null,
        updatedAt: new Date().toISOString(),
      });
    }
    return memoryStreaks.get(userId)!;
  }

  /**
   * Record a daily activity and update the streak.
   *
   * Logic:
   *   - Same day: no change
   *   - Next day (or frozen grace): increment streak
   *   - Gap > 1 day (no freeze): reset to 1
   */
  async recordActivity(userId: string): Promise<UserStreak> {
    const streak = await this.getStreak(userId);
    const today = getUTCDateString();

    // Already recorded today
    if (streak.lastActivityDate === today) {
      return streak;
    }

    let newCurrentStreak: number;

    if (streak.lastActivityDate === null) {
      // First activity ever
      newCurrentStreak = 1;
    } else {
      const gap = daysBetween(streak.lastActivityDate, today);

      if (gap === 1) {
        // Consecutive day → increment
        newCurrentStreak = streak.currentStreak + 1;
      } else if (gap === 2 && streak.streakFrozenUntil && streak.streakFrozenUntil >= today) {
        // Missed one day but had a streak freeze active → preserve
        newCurrentStreak = streak.currentStreak + 1;
      } else {
        // Gap too large → reset
        newCurrentStreak = 1;
      }
    }

    const newLongestStreak = Math.max(streak.longestStreak, newCurrentStreak);

    const db = await getDbModule();
    if (db) {
      try {
        await db.executeQuery(
          `UPDATE user_streaks
           SET current_streak = $2,
               longest_streak = $3,
               last_activity_date = $4,
               streak_frozen_until = CASE
                 WHEN streak_frozen_until IS NOT NULL AND streak_frozen_until < $4
                 THEN NULL  -- expired freeze
                 ELSE streak_frozen_until
               END,
               updated_at = now()
           WHERE user_id = $1`,
          [userId, newCurrentStreak, newLongestStreak, today],
        );
      } catch (error) {
        _logger.error("[StreakService] recordActivity DB update failed:", error as any);
      }
    }

    // Update in-memory
    const updated: UserStreak = {
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      lastActivityDate: today,
      streakFrozenUntil: streak.streakFrozenUntil,
      updatedAt: new Date().toISOString(),
    };
    memoryStreaks.set(userId, updated);

    return updated;
  }

  /**
   * Apply a streak freeze (purchased from the shop).
   * Protects the streak for 1 missed day (the next day only).
   */
  async applyStreakFreeze(userId: string): Promise<UserStreak> {
    const streak = await this.getStreak(userId);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 2); // +2 gives a 1-day grace window
    const freezeUntil = getUTCDateString(tomorrow);

    const db = await getDbModule();
    if (db) {
      try {
        await db.executeQuery(
          `UPDATE user_streaks SET streak_frozen_until = $2, updated_at = now() WHERE user_id = $1`,
          [userId, freezeUntil],
        );
      } catch (error) {
        _logger.error("[StreakService] applyStreakFreeze failed:", error as any);
      }
    }

    streak.streakFrozenUntil = freezeUntil;
    memoryStreaks.set(userId, streak);
    return streak;
  }

  /**
   * Check if the user's streak is still alive (or protected by a freeze).
   */
  async isStreakAlive(userId: string): Promise<boolean> {
    const streak = await this.getStreak(userId);
    if (!streak.lastActivityDate) return false;

    const gap = daysBetween(streak.lastActivityDate, getUTCDateString());

    if (gap <= 1) return true; // Same day or next day
    if (gap === 2 && streak.streakFrozenUntil) {
      return streak.streakFrozenUntil >= getUTCDateString();
    }
    return false;
  }
}

export const streakService = new StreakService();
