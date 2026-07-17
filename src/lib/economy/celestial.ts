/**
 * The celestial reward layer — sky × chart modulation for invisible practices.
 *
 * Mirror image of livePricing: there, affinity DISCOUNTS what an action costs;
 * here, affinity AMPLIFIES what an action pays. A user whose natal weights
 * resonate with today's transits earns more from the same practice — acting
 * with the cosmic grain is rewarded, and the daily "celestial allowance"
 * (budget) breathes with the same sky, so scarcity lives in-world rather than
 * in a caps table.
 *
 * Cost profile: the global sky is memoized per 10-minute window (one
 * astronomy computation shared by every event), and the per-user half reads
 * the precomputed natal weights straight from user_yield_profiles — one
 * indexed row, no chart math per event.
 */

import { executeQuery } from "@/lib/database";
import { alchemize, type PlanetaryPosition } from "@/services/RealAlchemizeService";
import {
  calculatePlanetaryPositions,
  getFallbackPlanetaryPositions,
} from "@/utils/serverPlanetaryCalculations";

interface CoinVector {
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
}

export interface CelestialRewardContext {
  /** Global sky multiplier (same centering as livePricing: 0.85–1.35). */
  skyMultiplier: number;
  /** Per-coin REWARD multipliers (affinity amplifies; clamped 0.5–1.6). */
  perCoinReward: CoinVector;
  /** Today's total practice allowance in tokens for this user. */
  dailyBudget: number;
  /** Normalised current-sky ESMS weights. */
  transitWeights: CoinVector;
  dominantElement: string;
  aNumber: number;
  /** True iff the user has a yield profile (natal weights) to personalize with. */
  personalized: boolean;
  timestamp: string;
}

/** How strongly affinity bends the payout (mirrors livePricing's cost scale). */
const REWARD_PERSONALIZATION_SCALE = 0.5;
const BASELINE_WEIGHT = 0.25;
const REWARD_MIN = 0.5;
const REWARD_MAX = 1.6;

/**
 * Base daily practice allowance in tokens. The live budget breathes around
 * this with the sky (~15–24): deliberately BELOW the sum of every per-type
 * cap at full rate, so on most days the budget — not the caps — is the
 * binding scarcity.
 */
export const BASE_DAILY_PRACTICE_BUDGET = 18;

function round(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function asPlanetaryPositions(positions: Record<string, any>): Record<string, PlanetaryPosition> {
  const normalized: Record<string, PlanetaryPosition> = {};
  for (const [planet, pos] of Object.entries(positions)) {
    normalized[planet] = {
      sign: String(pos?.sign ?? "").toLowerCase(),
      degree: Number(pos?.degree ?? 0),
      minute: Number(pos?.minute ?? 0),
      isRetrograde: Boolean(pos?.isRetrograde),
      // Carried through so aspects get real angular separations; dropping it
      // forces a reconstruction from sign + degree.
      exactLongitude:
        typeof pos?.exactLongitude === "number" ? pos.exactLongitude : undefined,
    };
  }
  return normalized;
}

interface GlobalSky {
  skyMultiplier: number;
  transitWeights: CoinVector;
  dominantElement: string;
  aNumber: number;
  timestamp: string;
}

// One sky computation per 10-minute window, shared across all events/users.
let skyCache: { bucket: number; sky: GlobalSky } | null = null;

async function getGlobalSky(now = new Date()): Promise<GlobalSky> {
  const bucket = Math.floor(now.getTime() / 600_000);
  if (skyCache && skyCache.bucket === bucket) return skyCache.sky;

  // Time-boxed: the ephemeris backend can burn ~7s of timeout budget on a
  // cold path, and recognize() awaits this before its SQL. 2.5s or we fall
  // back to the local fallback positions (pure CPU) — the 10-minute memo
  // means at most one slow attempt per instance per window.
  let positions: Record<string, any>;
  try {
    positions = await Promise.race([
      calculatePlanetaryPositions(now),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("sky timeout")), 2_500)),
    ]);
  } catch {
    positions = getFallbackPlanetaryPositions();
  }
  const alch = alchemize(asPlanetaryPositions(positions), null, now);
  const total =
    Number(alch.esms.Spirit || 0) +
    Number(alch.esms.Essence || 0) +
    Number(alch.esms.Matter || 0) +
    Number(alch.esms.Substance || 0);

  const transitWeights: CoinVector =
    total > 0
      ? {
          spirit: alch.esms.Spirit / total,
          essence: alch.esms.Essence / total,
          matter: alch.esms.Matter / total,
          substance: alch.esms.Substance / total,
        }
      : { spirit: 0.25, essence: 0.25, matter: 0.25, substance: 0.25 };

  const sky: GlobalSky = {
    skyMultiplier: round(clamp(1 + (total - 20) / 100, 0.85, 1.35), 4),
    transitWeights: {
      spirit: round(transitWeights.spirit, 4),
      essence: round(transitWeights.essence, 4),
      matter: round(transitWeights.matter, 4),
      substance: round(transitWeights.substance, 4),
    },
    dominantElement: alch.metadata.dominantElement,
    aNumber: round(total, 4),
    timestamp: now.toISOString(),
  };
  skyCache = { bucket, sky };
  return sky;
}

/** The user's precomputed natal ESMS weights, if they have a yield profile. */
async function getNatalWeights(userId: string): Promise<CoinVector | null> {
  try {
    const res = await executeQuery<{
      spirit_weight: string;
      essence_weight: string;
      matter_weight: string;
      substance_weight: string;
    }>(
      `SELECT spirit_weight, essence_weight, matter_weight, substance_weight
       FROM user_yield_profiles WHERE user_id = $1`,
      [userId],
    );
    const row = res.rows[0];
    if (!row) return null;
    const w = {
      spirit: parseFloat(row.spirit_weight) || 0,
      essence: parseFloat(row.essence_weight) || 0,
      matter: parseFloat(row.matter_weight) || 0,
      substance: parseFloat(row.substance_weight) || 0,
    };
    const total = w.spirit + w.essence + w.matter + w.substance;
    return total > 0 ? w : null;
  } catch {
    return null;
  }
}

/**
 * Full reward context for a user under the current sky. REWARD polarity:
 * where livePricing multiplies costs DOWN on affinity, this multiplies
 * payouts UP — same affinity signal, mirrored sign.
 */
export async function getCelestialRewardContext(
  userId: string,
  now = new Date(),
): Promise<CelestialRewardContext> {
  const sky = await getGlobalSky(now);
  const natal = await getNatalWeights(userId);

  const rewardFor = (coin: keyof CoinVector): number => {
    if (!natal) return round(clamp(sky.skyMultiplier, REWARD_MIN, REWARD_MAX), 4);
    const affinity = (natal[coin] + sky.transitWeights[coin]) / 2 - BASELINE_WEIGHT;
    return round(
      clamp(sky.skyMultiplier * (1 + REWARD_PERSONALIZATION_SCALE * affinity), REWARD_MIN, REWARD_MAX),
      4,
    );
  };

  const perCoinReward: CoinVector = {
    spirit: rewardFor("spirit"),
    essence: rewardFor("essence"),
    matter: rewardFor("matter"),
    substance: rewardFor("substance"),
  };

  // The allowance breathes with the user's average resonance today.
  const avg =
    (perCoinReward.spirit + perCoinReward.essence + perCoinReward.matter + perCoinReward.substance) / 4;
  const dailyBudget = round(BASE_DAILY_PRACTICE_BUDGET * avg, 1);

  return {
    skyMultiplier: sky.skyMultiplier,
    perCoinReward,
    dailyBudget,
    transitWeights: sky.transitWeights,
    dominantElement: sky.dominantElement,
    aNumber: sky.aNumber,
    personalized: natal !== null,
    timestamp: sky.timestamp,
  };
}
