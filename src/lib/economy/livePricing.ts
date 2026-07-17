import { alchemize, type PlanetaryPosition } from "@/services/RealAlchemizeService";
import type { AlchemicalProperties } from "@/types/celestial";
import { isCurrentSkyDiurnal } from "@/utils/astrology/positions";
import { calculateAlchemicalFromPlanets } from "@/utils/planetaryAlchemyMapping";
import {
  calculatePlanetaryPositions,
  getFallbackPlanetaryPositions,
} from "@/utils/serverPlanetaryCalculations";

interface EsmsCost {
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
}

export interface LivePricingContext {
  multiplier: number;
  aNumber: number;
  dominantElement: string;
  timestamp: string;
}

/**
 * Per-token multipliers — produced by the personalized pricing helper.
 * For users WITHOUT a natal chart, every field equals `LivePricingContext.multiplier`
 * (i.e. behaviour identical to the global multiplier).
 */
export interface PersonalizedPricingContext extends LivePricingContext {
  /** Per-token multipliers, one for each ESMS token. */
  perToken: EsmsCost;
  /** Normalised natal ESMS weights (sums to 1.0). Null if no natal chart. */
  natalWeights: EsmsCost | null;
  /** Normalised current-sky ESMS weights (sums to 1.0). */
  transitWeights: EsmsCost;
  /** True iff natal positions were supplied AND yielded a usable weight vector. */
  personalized: boolean;
}

/**
 * How strongly per-user affinity bends the global multiplier (per token).
 * 0.5 → a user whose natal+transit weight is +0.25 above baseline (0.25)
 * pays that token at ~0.875× of the global cost; symmetric on the upside.
 */
const PERSONALIZATION_SCALE = 0.5;
const BASELINE_WEIGHT = 0.25;
const PER_TOKEN_MIN = 0.5;
const PER_TOKEN_MAX = 1.6;

function round(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function asPlanetaryPositions(
  positions: Record<string, any>,
): Record<string, PlanetaryPosition> {
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

export async function getLivePricingContext(now = new Date()): Promise<LivePricingContext> {
  let positions: Record<string, any>;
  try {
    positions = await calculatePlanetaryPositions(now);
  } catch {
    positions = getFallbackPlanetaryPositions();
  }

  const alch = alchemize(asPlanetaryPositions(positions), null, now);
  const aNumber =
    Number(alch.esms.Spirit || 0) +
    Number(alch.esms.Essence || 0) +
    Number(alch.esms.Matter || 0) +
    Number(alch.esms.Substance || 0);

  // Dynamic spread based on current alchemical intensity.
  // Centered near 20, clamped to avoid extreme swings.
  const multiplier = clamp(1 + (aNumber - 20) / 100, 0.85, 1.35);

  return {
    multiplier: round(multiplier, 4),
    aNumber: round(aNumber, 4),
    dominantElement: alch.metadata.dominantElement,
    timestamp: now.toISOString(),
  };
}

export function applyLivePricing(base: EsmsCost, multiplier: number): EsmsCost {
  const apply = (value: number) => {
    if (value <= 0) return 0;
    return round(value * multiplier, 2);
  };
  return {
    spirit: apply(base.spirit),
    essence: apply(base.essence),
    matter: apply(base.matter),
    substance: apply(base.substance),
  };
}

// ──────────────────────────────────────────────────────────────────────────
// Personalized pricing
//
// The site's economic premise: action cost is a function of the user's natal
// chart × the chart of the moment. Token types in which a user resonates
// (high natal weight) AND that today's transits emphasise (high transit
// weight) are CHEAPER for that user — they're working with the cosmic grain,
// not against it. Conversely, tokens where they're weak pay a premium.
//
// Without a natal chart (anonymous demo, mid-onboarding) the helper falls
// back to the global multiplier so calling code is uniform.
// ──────────────────────────────────────────────────────────────────────────

function normaliseEsms(esms: AlchemicalProperties): EsmsCost {
  const total = esms.Spirit + esms.Essence + esms.Matter + esms.Substance;
  if (total <= 0) {
    return { spirit: 0.25, essence: 0.25, matter: 0.25, substance: 0.25 };
  }
  return {
    spirit: esms.Spirit / total,
    essence: esms.Essence / total,
    matter: esms.Matter / total,
    substance: esms.Substance / total,
  };
}

function uniformPerToken(multiplier: number): EsmsCost {
  return {
    spirit: multiplier,
    essence: multiplier,
    matter: multiplier,
    substance: multiplier,
  };
}

/**
 * Compute a pricing context personalised to the user's natal chart.
 *
 * @param natalPositions  Planet → sign map from the user's natal chart, in the
 *                        same shape that DailyYieldService consumes. Pass
 *                        `null`/`undefined` for anonymous/onboarding users to
 *                        get the uniform global multiplier back.
 * @param now             Override "current sky" timestamp (test hook).
 */
export async function getPersonalizedPricingContext(
  natalPositions: Record<string, string> | null | undefined,
  now = new Date(),
): Promise<PersonalizedPricingContext> {
  let positions: Record<string, any>;
  try {
    positions = await calculatePlanetaryPositions(now);
  } catch {
    positions = getFallbackPlanetaryPositions();
  }

  const alch = alchemize(asPlanetaryPositions(positions), null, now);
  const aNumber =
    Number(alch.esms.Spirit || 0) +
    Number(alch.esms.Essence || 0) +
    Number(alch.esms.Matter || 0) +
    Number(alch.esms.Substance || 0);
  const globalMultiplier = clamp(1 + (aNumber - 20) / 100, 0.85, 1.35);
  const transitWeights = normaliseEsms(alch.esms);

  let natalWeights: EsmsCost | null = null;
  let perToken: EsmsCost = uniformPerToken(globalMultiplier);

  if (natalPositions && Object.keys(natalPositions).length > 0) {
    const diurnal = isCurrentSkyDiurnal(now);
    const natalEsms = calculateAlchemicalFromPlanets(natalPositions, diurnal);
    natalWeights = normaliseEsms(natalEsms);

    // Per-token affinity: how strongly THIS user resonates with TODAY's sky
    // on each token axis. Average of natal and transit weights, centred on
    // the uniform baseline (0.25) so the signed delta is the discount driver.
    const affinity = {
      spirit: (natalWeights.spirit + transitWeights.spirit) / 2 - BASELINE_WEIGHT,
      essence: (natalWeights.essence + transitWeights.essence) / 2 - BASELINE_WEIGHT,
      matter: (natalWeights.matter + transitWeights.matter) / 2 - BASELINE_WEIGHT,
      substance: (natalWeights.substance + transitWeights.substance) / 2 - BASELINE_WEIGHT,
    };

    perToken = {
      spirit: round(clamp(globalMultiplier * (1 - PERSONALIZATION_SCALE * affinity.spirit), PER_TOKEN_MIN, PER_TOKEN_MAX), 4),
      essence: round(clamp(globalMultiplier * (1 - PERSONALIZATION_SCALE * affinity.essence), PER_TOKEN_MIN, PER_TOKEN_MAX), 4),
      matter: round(clamp(globalMultiplier * (1 - PERSONALIZATION_SCALE * affinity.matter), PER_TOKEN_MIN, PER_TOKEN_MAX), 4),
      substance: round(clamp(globalMultiplier * (1 - PERSONALIZATION_SCALE * affinity.substance), PER_TOKEN_MIN, PER_TOKEN_MAX), 4),
    };
  }

  return {
    multiplier: round(globalMultiplier, 4),
    perToken,
    natalWeights,
    transitWeights: {
      spirit: round(transitWeights.spirit, 4),
      essence: round(transitWeights.essence, 4),
      matter: round(transitWeights.matter, 4),
      substance: round(transitWeights.substance, 4),
    },
    aNumber: round(aNumber, 4),
    dominantElement: alch.metadata.dominantElement,
    timestamp: now.toISOString(),
    personalized: natalWeights !== null,
  };
}

/**
 * Apply per-token multipliers to a base ESMS cost. Pair with
 * `getPersonalizedPricingContext` so the user's natal × current-sky discount
 * lands on the actual debit.
 */
export function applyPersonalizedPricing(
  base: EsmsCost,
  ctx: PersonalizedPricingContext,
): EsmsCost {
  const apply = (value: number, mult: number) => {
    if (value <= 0) return 0;
    return round(value * mult, 2);
  };
  return {
    spirit: apply(base.spirit, ctx.perToken.spirit),
    essence: apply(base.essence, ctx.perToken.essence),
    matter: apply(base.matter, ctx.perToken.matter),
    substance: apply(base.substance, ctx.perToken.substance),
  };
}

