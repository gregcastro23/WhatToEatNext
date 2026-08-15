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
 *
 * Exported (not copied) so downstream pricing surfaces — the price-index
 * oracle in ./priceIndex.ts — stay pinned to the SAME constants this module
 * charges with. A drifted copy would quote prices the debit path never uses.
 */
export const PERSONALIZATION_SCALE = 0.5;
export const BASELINE_WEIGHT = 0.25;
export const PER_TOKEN_MIN = 0.5;
export const PER_TOKEN_MAX = 1.6;

/**
 * The A-number the global multiplier is centered on ("calm sky").
 *
 * `[MEASURED 2026-08-15]` — the median A-number of the real sky, over
 * 2025-08-15 → 2027-08-15 hourly (n = 17,520) through the canonical engine:
 * local astronomy-engine positions → `alchemize`. Measured p50 = 5.8355,
 * rounded for legibility. A 30-year sweep (n = 43,828) gives p50 = 5.7948, so
 * this is not an artifact of the window. Re-derive with ADR-012's harness:
 * `MEASURE_A_NUMBER=1 bun run jest src/lib/economy/__tests__/aNumberDistribution.measure.test.ts`
 *
 * The previous value, 20, carried no basis and sat 34 standard deviations
 * above the measured mean — `m = 1.00` was unreachable, so the multiplier was
 * a ~0.86 constant using 5% of its own band (ADR-012).
 */
export const A_NUMBER_CENTER = 5.84;
/**
 * A-number points per 1.00 of multiplier movement.
 *
 * `[MEASURED 2026-08-15]` — solved, not chosen: the band is asymmetric about
 * 1.0 (−0.15 / +0.35), so the floor is the binding side, and the spread that
 * puts the measured p01 exactly on the 0.85 floor is `(p50 − p01) / 0.15`
 * = (5.8355 − 4.9226) / 0.15 = 6.086, rounded to 6.1.
 *
 * Measured consequence over the same 17,520 hours: multiplier p50 0.9993,
 * sd 0.0664, range 0.85–1.2703, 84% of the band exercised, 1.02% of hours
 * floor-clamped, the ceiling never reached — the 1.35 sky does not occur.
 */
export const A_NUMBER_SPREAD = 6.1;
export const GLOBAL_MULTIPLIER_MIN = 0.85;
export const GLOBAL_MULTIPLIER_MAX = 1.35;

/**
 * The global cost multiplier for a given A-number (total sky ESMS).
 * Extracted so every surface that quotes or charges this spread — including
 * the price-index oracle — computes it from ONE definition.
 */
export function globalMultiplierForANumber(aNumber: number): number {
  return clamp(
    1 + (aNumber - A_NUMBER_CENTER) / A_NUMBER_SPREAD,
    GLOBAL_MULTIPLIER_MIN,
    GLOBAL_MULTIPLIER_MAX,
  );
}

/**
 * The bodies the economy prices — the ten ESMS planets, and nothing else.
 *
 * `[RULED 2026-08-15, ADR-012]` The position sources disagree on what they
 * hand back: the local astronomy-engine returns 12 keys (adding
 * `NorthNode`/`SouthNode`), while the remote Swiss-Ephemeris backend returns
 * 14 — adding `North Node`/`South Node` (spaced), `MC`, and **`Ascendant`**.
 * `alchemize` counts the Ascendant, so the remote-first debit path was pricing
 * a sky worth **+3.01 A-points** more than the oracle quoted on the same
 * instant — measured over 49 live backend samples, mean 3.0129 (2.85–3.22).
 *
 * The Ascendant is observer-local: it is the sign rising at a particular
 * latitude and longitude, rotating a full circle every 24h. A global price
 * index must not depend on where a server thinks it is, which is why ADR-011
 * §3 already prices without it. This whitelist makes that ruling structural
 * rather than a property of whichever ephemeris answered.
 *
 * Both node spellings and `MC` fall out of the whitelist too; measured, they
 * contribute exactly 0 to ESMS, so excluding them is behaviour-preserving and
 * merely makes the contract explicit.
 */
export const PRICED_BODIES = [
  "Sun",
  "Moon",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto",
] as const;

const PRICED_BODY_SET: ReadonlySet<string> = new Set(PRICED_BODIES);

/**
 * True iff this body is one the economy prices. Whitelist, never a blocklist:
 * a position source that starts returning a new body must not silently
 * re-price the economy the way `Ascendant` did.
 */
export function isPricedBody(name: string): boolean {
  return PRICED_BODY_SET.has(name);
}

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
    // The debit path is remote-first, and the remote hands back an Ascendant.
    // Filtering HERE — at the pricing boundary, not in the shared position
    // util — keeps natal charts and the wheel free to use every body while the
    // economy prices exactly the ten the oracle quotes. See PRICED_BODIES.
    if (!isPricedBody(planet)) continue;
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
  const multiplier = globalMultiplierForANumber(aNumber);

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
  const globalMultiplier = globalMultiplierForANumber(aNumber);
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

