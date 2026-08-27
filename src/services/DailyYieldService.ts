/**
 * Daily Yield Service
 *
 * Calculates personalized ESMS token yields based on the user's natal chart
 * and current planetary transits. This is the "Cosmic Yield" engine.
 *
 * Architecture:
 *   - Today's planetary positions are read from daily_ephemeris_cache (1 fetch/day)
 *   - User's natal positions come from user_profiles (already stored)
 *   - Yield weights are computed via calculateAlchemicalFromPlanets() (pure math)
 *   - Result: a personalized ESMS token distribution unique to each user each day
 *
 * @file src/services/DailyYieldService.ts
 */

import type { AlchemicalProperties } from "@/types/celestial";
import type { DailyYieldClaim, TokenType } from "@/types/economy";
import {
  BASE_DAILY_TOKENS,
  TRANSIT_BONUS_SCALE,
  getHoldingsMultiplier,
  getStreakMilestone,
  getStreakMultiplier,
} from "@/types/economy";
import { isCurrentSkyDiurnal } from "@/utils/astrology/positions";
import { createLogger } from "@/utils/logger";
import {
  calculateAlchemicalFromPlanets,
  type AlchemicalPlanetPositions,
} from "@/utils/planetaryAlchemyMapping";
import { reportQuestEventBestEffort } from "./questEventReporter";
import { streakService } from "./StreakService";
import { tokenEconomy } from "./TokenEconomyService";

const _logger = createLogger("daily-yield-service");

// ─── DB Bootstrapping ─────────────────────────────────────────────────

interface EphemerisRow {
  planet_positions: string | AlchemicalPlanetPositions;
  transit_esms: string | AlchemicalProperties;
}

interface UserYieldProfileRow {
  spirit_weight: string;
  essence_weight: string;
  matter_weight: string;
  substance_weight: string;
  natal_chart_hash: string;
  weight_scale_version: string;
}

const isServerWithDB = (): boolean =>
  typeof window === "undefined" && !!process.env.DATABASE_URL;

let dbModule: typeof import("@/lib/database") | null = null;
const getDbModule = async (): Promise<typeof import("@/lib/database") | null> => {
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
 * Identifies the weight scale the cached ESMS weights were computed under.
 *
 * `user_yield_profiles` caches weights keyed by `natal_chart_hash`. That hash
 * used to cover POSITIONS ONLY, so changing the per-planet weight scale left the
 * key untouched and the cache served pre-change weights forever — silently, on a
 * path that scales real token payouts. Positions are not the only input to the
 * cached value; the scale is an input too, and the key has to say so.
 *
 * BUMP THIS whenever the weighting that feeds `calculateAlchemicalFromPlanets`
 * changes. Every cached row then misses on its next read and is recomputed.
 *
 * ADR-009 note: the yield path already runs on the inertial scale, so unifying
 * the OTHER scales onto it does not move these weights (proven by probe: zero
 * Scale-B calls in this path). This guard exists for the change after that one.
 */
export const YIELD_WEIGHT_SCALE_VERSION = "inertial-v1";

/**
 * Create a SHA-256 hash of natal chart positions for cache invalidation.
 *
 * The hash deliberately covers POSITIONS ONLY. The weight scale is the cache's
 * other input and is tracked separately, in the `weight_scale_version` column,
 * because `celestial.ts` reads these rows WITHOUT the positions in hand and so
 * cannot verify a hash — it can only check a stored version. One mechanism,
 * checkable by both readers, beats two that can disagree.
 */
async function hashNatalChart(positions: Record<string, string>): Promise<string> {
  const text = JSON.stringify(positions, Object.keys(positions).sort());
  if (typeof globalThis.crypto.subtle !== "undefined") {
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
    positions: AlchemicalPlanetPositions;
    transitESMS: AlchemicalProperties;
  }> {
    const db = await getDbModule();
    const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    if (db) {
      try {
        const result = await db.executeQuery<EphemerisRow>(
          `SELECT planet_positions, transit_esms FROM daily_ephemeris_cache WHERE cache_date = $1`,
          [todayStr],
        );
        if (result.rows.length > 0) {
          const [row] = result.rows;
          const positions: AlchemicalPlanetPositions = typeof row.planet_positions === "string"
            ? (JSON.parse(row.planet_positions) as AlchemicalPlanetPositions)
            : row.planet_positions;
          const transitESMS: AlchemicalProperties = typeof row.transit_esms === "string"
            ? (JSON.parse(row.transit_esms) as AlchemicalProperties)
            : row.transit_esms;
          return { positions, transitESMS };
        }
      } catch (error) {
        _logger.error("[DailyYield] Failed to fetch ephemeris cache:", error);
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
    positions: AlchemicalPlanetPositions,
    source: "railway" | "astronomy-engine" = "railway",
  ): Promise<void> {
    const todayStr = new Date().toISOString().slice(0, 10);
    const diurnal = isCurrentSkyDiurnal();
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
        _logger.error("[DailyYield] Failed to cache ephemeris:", error);
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
        const result = await db.executeQuery<UserYieldProfileRow>(
          `SELECT spirit_weight, essence_weight, matter_weight, substance_weight, natal_chart_hash, weight_scale_version
           FROM user_yield_profiles WHERE user_id = $1`,
          [userId],
        );
        // Both inputs must match: the positions (hash) AND the weight scale.
        // A row on an older scale is a miss, not a hit — it falls through to the
        // recompute below and is upserted on the current scale.
        if (
          result.rows.length > 0 &&
          result.rows[0].natal_chart_hash === chartHash &&
          result.rows[0].weight_scale_version === YIELD_WEIGHT_SCALE_VERSION
        ) {
          const [row] = result.rows;
          return {
            spirit: parseFloat(row.spirit_weight),
            essence: parseFloat(row.essence_weight),
            matter: parseFloat(row.matter_weight),
            substance: parseFloat(row.substance_weight),
          };
        }
      } catch (error) {
        _logger.warn("[DailyYield] Failed to read yield profile:", error);
      }
    }

    // Compute from natal chart via calculateAlchemicalFromPlanets
    const diurnal = isCurrentSkyDiurnal();
    const natalESMS = calculateAlchemicalFromPlanets(natalPositions, diurnal);
    const weights = normalizeESMS(natalESMS);

    // Cache the weights
    if (db) {
      try {
        await db.executeQuery(
          `INSERT INTO user_yield_profiles (user_id, spirit_weight, essence_weight, matter_weight, substance_weight, natal_chart_hash, weight_scale_version)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (user_id) DO UPDATE SET
             spirit_weight = EXCLUDED.spirit_weight,
             essence_weight = EXCLUDED.essence_weight,
             matter_weight = EXCLUDED.matter_weight,
             substance_weight = EXCLUDED.substance_weight,
             natal_chart_hash = EXCLUDED.natal_chart_hash,
             weight_scale_version = EXCLUDED.weight_scale_version,
             calculated_at = now()`,
          [
            userId,
            weights.spirit,
            weights.essence,
            weights.matter,
            weights.substance,
            chartHash,
            YIELD_WEIGHT_SCALE_VERSION,
          ],
        );
      } catch (error) {
        _logger.warn("[DailyYield] Failed to cache yield weights:", error);
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
    const diurnal = isCurrentSkyDiurnal();
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
   * Main entry point: Calculate and credit the user's daily Cosmic Yield.
   *
   * Returns a discriminated {@link DailyYieldClaim} rather than
   * `DailyYieldResult | null`.
   *
   * @param userId - User's database ID
   * @param natalPositions - Planet → sign map from user's natal chart
   * @param siteOrLegacyPremium - Origin site ('main' | 'agents') or legacy boolean
   * @param legacySite - Origin site when called with 4 arguments
   */
  async claimDailyYield(
    userId: string,
    natalPositions: Record<string, string>,
    siteOrLegacyPremium?: "main" | "agents" | boolean,
    legacySite?: "main" | "agents",
  ): Promise<DailyYieldClaim> {
    const site: "main" | "agents" =
      typeof siteOrLegacyPremium === "string"
        ? siteOrLegacyPremium
        : legacySite ?? "main";

    // 1. Idempotency check (site-specific)
    const alreadyClaimed = await tokenEconomy.hasClaimedToday(userId, site);
    if (alreadyClaimed) {
      _logger.info("[DailyYield] User already claimed today:", { userId, site });
      return { status: "already_claimed" };
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

    // 6. Compute final distribution: holdings scale yield dynamically
    // Balance-scaled yield: the more ESMS you hold, the more you draw each day —
    // with steep diminishing returns + a hard cap (getHoldingsMultiplier) so
    // holdings reward loyalty without runaway "whale" compounding.
    const currentBalances = await tokenEconomy.getBalances(userId);
    const totalHoldings =
      currentBalances.spirit +
      currentBalances.essence +
      currentBalances.matter +
      currentBalances.substance;
    const holdingsMultiplier = getHoldingsMultiplier(totalHoldings);

    const totalBaseTokens = Math.round(
      BASE_DAILY_TOKENS * streakMultiplier * holdingsMultiplier,
    );

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

    const sourceType = site === "agents" ? "agents_yield" : "daily_yield";
    const credit = await tokenEconomy.creditMultipleTokensDetailed(
      userId,
      credits,
      sourceType,
      {
        description: `Cosmic Yield for ${todayStr} (${site})`,
        idempotencyKey: `daily:${site}:${userId}:${todayStr}`,
      },
    );

    if (credit.status === "failed") {
      // The transaction ROLLED BACK — nothing was credited. This is the case
      // the old `null` hid: the day's yield is still unclaimed and the caller
      // must say so, rather than sending the user away until tomorrow.
      _logger.error(
        `[DailyYield] credit rolled back for user ${userId} (${site}) — yield NOT claimed ` +
          `(code=${credit.code ?? "—"} constraint=${credit.constraint ?? "—"}): ${credit.message}`,
      );
      return {
        status: "failed",
        code: credit.code,
        constraint: credit.constraint,
        message: credit.message,
      };
    }

    if (credit.status === "already_applied" || credit.status === "replayed") {
      // Genuinely already claimed. `already_applied` is the daily-yield
      // uniqueness index catching a race the `hasClaimedToday` check above lost;
      // `replayed` means today's idempotency key was already written, which
      // happens when a previous claim credited but then failed to stamp the
      // timestamp below. Re-stamp it so that user is not wedged on 409 for the
      // rest of the day — the same repair the old code did by accident, by
      // treating a replay as a successful claim.
      _logger.info("[DailyYield] already claimed (credit was a no-op):", {
        userId,
        site,
        creditStatus: credit.status,
      });
      await tokenEconomy.updateDailyClaimTimestamp(userId, site);
      return { status: "already_claimed" };
    }

    // Preserves the old adapter's behaviour exactly: a failed balance READ must
    // not be reported as a zero balance.
    const newBalances = credit.balances ?? (await tokenEconomy.getBalances(userId));

    // 8. Update site-specific daily claim timestamp and streak
    await tokenEconomy.updateDailyClaimTimestamp(userId, site);
    await streakService.recordActivity(userId);

    const updatedStreak = await streakService.getStreak(userId);
    await reportQuestEventBestEffort(userId, "maintain_streak");

    // 9. Streak milestone bonus — fires the day the streak hits a milestone.
    // Day-scoped idempotency: a rebuilt streak re-earns the milestone later,
    // but a retry/race today can never double-credit.
    let milestoneBonus: { days: number; totalTokens: number } | undefined;
    const milestone = getStreakMilestone(updatedStreak.currentStreak);
    if (milestone) {
      const perToken = Math.round((milestone.totalTokens / 4) * 100) / 100;
      const bonus = await tokenEconomy.creditMultipleTokensDetailed(
        userId,
        [
          { tokenType: "Spirit", amount: perToken },
          { tokenType: "Essence", amount: perToken },
          { tokenType: "Matter", amount: perToken },
          { tokenType: "Substance", amount: perToken },
        ],
        "streak_bonus",
        {
          sourceId: `milestone-${milestone.days}`,
          description: `🔥 ${milestone.days}-day streak milestone bonus`,
          idempotencyKey: `streak_bonus:${userId}:m${milestone.days}:${todayStr}`,
        },
      );
      if (bonus.status === "failed") {
        // Permanent, unlike the base yield: this key is day-scoped, and by
        // tomorrow the streak has moved past `milestone.days`, so
        // `getStreakMilestone` no longer matches and nothing re-attempts it.
        // The claim itself succeeded, so it is still reported as claimed —
        // but the forfeited bonus needs an operator to grant by hand.
        _logger.error(
          `[DailyYield] streak milestone bonus LOST for user ${userId} — ` +
            `${milestone.days}-day milestone (${milestone.totalTokens} tokens) rolled back and will not be retried ` +
            `(code=${bonus.code ?? "—"}): ${bonus.message}`,
        );
      } else {
        // credited, replayed, or already_applied — the bonus is in place.
        milestoneBonus = milestone;
      }
    }

    return {
      status: "claimed",
      result: {
        baseTokens: BASE_DAILY_TOKENS,
        streakMultiplier,
        holdingsMultiplier,
        totalTokens: credits.reduce((sum, c) => sum + c.amount, 0),
        distribution,
        transitBonus,
        newBalances,
        streakCount: updatedStreak.currentStreak,
        milestoneBonus,
      },
    };
  }
}

export const dailyYieldService = new DailyYieldService();
