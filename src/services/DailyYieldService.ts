/**
 * Daily Yield Service
 *
 * Calculates personalized ESMS token yields based on the user's natal chart
 * and current planetary transits. This is the "Cosmic Paycheck" engine.
 *
 * Architecture:
 *   - Today's planetary positions are read from daily_ephemeris_cache (1 fetch/day)
 *   - User's natal positions come from user_profiles (already stored)
 *   - Yield weights are computed via calculateAlchemicalFromPlanets() (pure math)
 *   - Result: a personalized ESMS token distribution unique to each user each day
 *
 * @file src/services/DailyYieldService.ts
 */

import { _logger } from "@/lib/logger";
import { calculateAlchemicalFromPlanets, isSectDiurnal } from "@/utils/planetaryAlchemyMapping";
import type { AlchemicalProperties } from "@/types/celestial";
import type { DailyYieldResult, TokenType } from "@/types/economy";
import {
  BASE_DAILY_TOKENS,
  PREMIUM_YIELD_MULTIPLIER,
  TRANSIT_BONUS_SCALE,
  getStreakMultiplier,
} from "@/types/economy";
import { tokenEconomy } from "./TokenEconomyService";
import { reportQuestEventBestEffort } from "./questEventReporter";
import { streakService } from "./StreakService";

// ─── DB Bootstrapping ─────────────────────────────────────────────────

const isServerWithDB = (): boolean =>
  typeof window === "undefined" && !!process.env.DATABASE_URL;

let dbModule: typeof import("@/lib/database") | null = null;
const getDbModule = async () => {
  if (!dbModule && isServerWithDB()) {
    try {
      dbModule = await import("@/lib/database");
    } catch {
      _logger.warn("[DailyYield] Database module not available");
    }
  }
  return dbModule;
};

// ─── Helpers ──────────────────────────────────────────────────────────

/**
 * Create a SHA-256 hash of natal chart positions for cache invalidation.
 */
async function hashNatalChart(positions: Record<string, string>): Promise<string> {
  const text = JSON.stringify(positions, Object.keys(positions).sort());
  if (typeof globalThis.crypto?.subtle !== "undefined") {
    const msgBuffer = new TextEncoder().encode(text);
    const hashBuffer = await globalThis.crypto.subtle.digest("SHA-256", msgBuffer);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  }
  // Fallback: simple hash for environments without SubtleCrypto
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const chr = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}

/**
 * Normalize an ESMS object to weights summing to 1.0
 */
function normalizeESMS(esms: AlchemicalProperties): {
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
} {
  const total = esms.Spirit + esms.Essence + esms.Matter + esms.Substance;
  if (total === 0) {
    return { spirit: 0.25, essence: 0.25, matter: 0.25, substance: 0.25 };
  }
  return {
    spirit: esms.Spirit / total,
    essence: esms.Essence / total,
    matter: esms.Matter / total,
    substance: esms.Substance / total,
  };
}

// ─── Service Class ────────────────────────────────────────────────────

class DailyYieldService {

  /**
   * Get today's cached planetary positions.
   * Falls back to a balanced default if the cron hasn't run yet.
   */
  async getTodayEphemeris(): Promise<{
    positions: Record<string, string>;
    transitESMS: AlchemicalProperties;
  }> {
    const db = await getDbModule();
    const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    if (db) {
      try {
        const result = await db.executeQuery(
          `SELECT planet_positions, transit_esms FROM daily_ephemeris_cache WHERE cache_date = $1`,
          [todayStr],
        );
        if (result.rows.length > 0) {
          const row = result.rows[0];
          const positions = typeof row.planet_positions === "string"
            ? JSON.parse(row.planet_positions)
            : row.planet_positions;
          const transitESMS = typeof row.transit_esms === "string"
            ? JSON.parse(row.transit_esms)
            : row.transit_esms;
          return { positions, transitESMS };
        }
      } catch (error) {
        _logger.error("[DailyYield] Failed to fetch ephemeris cache:", error as any);
      }
    }

    // Fallback: no transit bonus if ephemeris not cached yet
    _logger.info("[DailyYield] No ephemeris cache for today, using balanced defaults");
    return {
      positions: {},
      transitESMS: { Spirit: 0, Essence: 0, Matter: 0, Substance: 0 },
    };
  }

  /**
   * Cache today's ephemeris (called by the daily cron job).
   */
  async cacheEphemeris(
    positions: Record<string, string>,
    source: "railway" | "astronomy-engine" = "railway",
  ): Promise<void> {
    const todayStr = new Date().toISOString().slice(0, 10);
    const diurnal = isSectDiurnal();
    const transitESMS = calculateAlchemicalFromPlanets(positions, diurnal);

    const db = await getDbModule();
    if (db) {
      try {
        await db.executeQuery(
          `INSERT INTO daily_ephemeris_cache (cache_date, planet_positions, transit_esms, source)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (cache_date) DO UPDATE SET
             planet_positions = EXCLUDED.planet_positions,
             transit_esms = EXCLUDED.transit_esms,
             fetched_at = now(),
             source = EXCLUDED.source`,
          [todayStr, JSON.stringify(positions), JSON.stringify(transitESMS), source],
        );
        _logger.info("[DailyYield] Ephemeris cached for", todayStr);
      } catch (error) {
        _logger.error("[DailyYield] Failed to cache ephemeris:", error as any);
      }
    }
  }

  /**
   * Get or compute a user's ESMS yield weights from their natal chart.
   */
  async getYieldWeights(
    userId: string,
    natalPositions: Record<string, string>,
  ): Promise<{ spirit: number; essence: number; matter: number; substance: number }> {
    const chartHash = await hashNatalChart(natalPositions);
    const db = await getDbModule();

    // Check cached yield profile
    if (db) {
      try {
        const result = await db.executeQuery(
          `SELECT spirit_weight, essence_weight, matter_weight, substance_weight, natal_chart_hash
           FROM user_yield_profiles WHERE user_id = $1`,
          [userId],
        );
        if (result.rows.length > 0 && result.rows[0].natal_chart_hash === chartHash) {
          return {
            spirit: parseFloat(result.rows[0].spirit_weight),
            essence: parseFloat(result.rows[0].essence_weight),
            matter: parseFloat(result.rows[0].matter_weight),
            substance: parseFloat(result.rows[0].substance_weight),
          };
        }
      } catch (error) {
        _logger.warn("[DailyYield] Failed to read yield profile:", error as any);
      }
    }

    // Compute from natal chart via calculateAlchemicalFromPlanets
    const diurnal = isSectDiurnal();
    const natalESMS = calculateAlchemicalFromPlanets(natalPositions, diurnal);
    const weights = normalizeESMS(natalESMS);

    // Cache the weights
    if (db) {
      try {
        await db.executeQuery(
          `INSERT INTO user_yield_profiles (user_id, spirit_weight, essence_weight, matter_weight, substance_weight, natal_chart_hash)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (user_id) DO UPDATE SET
             spirit_weight = EXCLUDED.spirit_weight,
             essence_weight = EXCLUDED.essence_weight,
             matter_weight = EXCLUDED.matter_weight,
             substance_weight = EXCLUDED.substance_weight,
             natal_chart_hash = EXCLUDED.natal_chart_hash,
             calculated_at = now()`,
          [userId, weights.spirit, weights.essence, weights.matter, weights.substance, chartHash],
        );
      } catch (error) {
        _logger.warn("[DailyYield] Failed to cache yield weights:", error as any);
      }
    }

    return weights;
  }

  /**
   * Calculate transit bonus based on current sky vs user's natal chart.
   * When transit ESMS amplifies the user's natal pattern → bonus tokens.
   */
  calculateTransitBonus(
    natalPositions: Record<string, string>,
    transitESMS: AlchemicalProperties,
  ): { spirit: number; essence: number; matter: number; substance: number } {
    const diurnal = isSectDiurnal();
    const natalESMS = calculateAlchemicalFromPlanets(natalPositions, diurnal);

    // Proportional delta: if transits amplify natal pattern → bonus
    const natalNorm = normalizeESMS(natalESMS);
    const transitNorm = normalizeESMS(transitESMS);

    return {
      spirit: Math.max(0, transitNorm.spirit - natalNorm.spirit) * TRANSIT_BONUS_SCALE,
      essence: Math.max(0, transitNorm.essence - natalNorm.essence) * TRANSIT_BONUS_SCALE,
      matter: Math.max(0, transitNorm.matter - natalNorm.matter) * TRANSIT_BONUS_SCALE,
      substance: Math.max(0, transitNorm.substance - natalNorm.substance) * TRANSIT_BONUS_SCALE,
    };
  }

  /**
   * Main entry point: Calculate and credit the user's daily Cosmic Paycheck.
   *
   * @param userId - User's database ID
   * @param natalPositions - Planet → sign map from user's natal chart
   * @returns DailyYieldResult with amounts and new balances, or null if already claimed
   */
  async claimDailyYield(
    userId: string,
    natalPositions: Record<string, string>,
    isPremium: boolean = false,
  ): Promise<DailyYieldResult | null> {
    // 1. Idempotency check
    const alreadyClaimed = await tokenEconomy.hasClaimedToday(userId);
    if (alreadyClaimed) {
      _logger.info("[DailyYield] User already claimed today:", { userId });
      return null;
    }

    // 2. Get today's transit data (from cache, fetched once/day by cron)
    const { transitESMS } = await this.getTodayEphemeris();

    // 3. Get user's natal yield weights
    const weights = await this.getYieldWeights(userId, natalPositions);

    // 4. Calculate streak multiplier
    const streak = await streakService.getStreak(userId);
    const nextStreak = streak.currentStreak + 1; // will be updated after claim
    const streakMultiplier = getStreakMultiplier(nextStreak);

    // 5. Calculate transit bonus
    const transitBonus = this.calculateTransitBonus(natalPositions, transitESMS);

    // 6. Compute final distribution (premium users get 2× base)
    const premiumMult = isPremium ? PREMIUM_YIELD_MULTIPLIER : 1.0;
    const totalBaseTokens = Math.round(BASE_DAILY_TOKENS * premiumMult * streakMultiplier);

    const distribution = {
      spirit: Math.round((totalBaseTokens * weights.spirit + transitBonus.spirit) * 100) / 100,
      essence: Math.round((totalBaseTokens * weights.essence + transitBonus.essence) * 100) / 100,
      matter: Math.round((totalBaseTokens * weights.matter + transitBonus.matter) * 100) / 100,
      substance: Math.round((totalBaseTokens * weights.substance + transitBonus.substance) * 100) / 100,
    };

    // 7. Credit all tokens atomically
    const todayStr = new Date().toISOString().slice(0, 10);
    const allCredits: Array<{ tokenType: TokenType; amount: number }> = [
      { tokenType: "Spirit" as const, amount: distribution.spirit },
      { tokenType: "Essence" as const, amount: distribution.essence },
      { tokenType: "Matter" as const, amount: distribution.matter },
      { tokenType: "Substance" as const, amount: distribution.substance },
    ];
    const credits = allCredits.filter(c => c.amount > 0);

    const newBalances = await tokenEconomy.creditMultipleTokens(
      userId,
      credits,
      "daily_yield",
      {
        description: `Cosmic Paycheck for ${todayStr}`,
        idempotencyKey: `daily:${userId}:${todayStr}`,
      },
    );

    if (!newBalances) {
      // Idempotency blocked (race condition — already claimed)
      return null;
    }

    // 8. Update daily claim timestamp and streak
    await tokenEconomy.updateDailyClaimTimestamp(userId);
    await streakService.recordActivity(userId);

    const updatedStreak = await streakService.getStreak(userId);
    await reportQuestEventBestEffort(userId, "maintain_streak");

    return {
      baseTokens: BASE_DAILY_TOKENS,
      streakMultiplier,
      totalTokens: credits.reduce((sum, c) => sum + c.amount, 0),
      distribution,
      transitBonus,
      newBalances,
      streakCount: updatedStreak.currentStreak,
    };
  }
}

export const dailyYieldService = new DailyYieldService();
