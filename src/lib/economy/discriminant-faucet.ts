/**
 * Untethered, self-normalised natal-to-current-sky faucet (ADR-015).
 *
 * Magnitude and colour are deliberately separate:
 *   - degree-level synastry sets the variable total in [3, 24];
 *   - natal ESMS x sky elements x anti-glut damping allocates that total;
 *   - a 0.3000 reserve on every axis guarantees operational gas.
 */

import { _logger } from "@/lib/logger";
import type {
  DiscriminantYieldResult,
  GlobalSupplyState,
  TokenDistribution,
} from "@/types/economy";
import { AXIS_FLOOR, PROTOCOL_BAND } from "@/types/economy";
import {
  ZODIAC_ELEMENTS,
  type AlchemicalElement,
  type AlchemicalPlanetPosition,
  type AlchemicalPlanetPositions,
} from "@/utils/planetaryAlchemyMapping";
import {
  calculatePositionsWithAstronomyEngine,
} from "@/utils/serverPlanetaryCalculations";

export const FAUCET_PLANETS = [
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

const SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;

const ASPECTS = [
  { angle: 0, weight: 1 },
  { angle: 60, weight: 0.5 },
  { angle: 90, weight: -0.5 },
  { angle: 120, weight: 1 },
  { angle: 180, weight: -0.75 },
] as const;

export const SYNASTRY_ORB_DEGREES = 6;

/**
 * Algorithm identifier for S-bar(N). The stored `baseline_version` is this
 * prefix joined to the epoch year, so a year rollover is a cache miss and the
 * baseline recomputes itself — no migration, no yearly operational ritual.
 */
export const BASELINE_ALGORITHM = "synastry-annual-v2";

export function baselineVersionFor(year: number): string {
  return `${BASELINE_ALGORITHM}:${year}`;
}

/**
 * The self-normalisation window is the claim's OWN calendar year.
 *
 * ADR-015 §3 prescribes a single fixed window ("never a rolling window"), and
 * v1 of this engine pinned 2026 to reproduce the ADR's published emission table.
 * Measured out of sample, that pin does not survive its own year: a chart's
 * resonance with the slow-planet background is strongly non-stationary, so a
 * 2026 mean is simply the wrong divisor for any later sky.
 *
 *   annual ESMS, 2026-pinned baseline (target 4380)
 *                        2026    2027    2028    2029    2030    2031
 *   stellium 0° Aries    4369    2118    1474    1373    1915    1413
 *   even 36° spread      4407    3511    3732    4770    6690    7054
 *   chart-shape spread  1.01x   1.91x   2.53x   3.47x   3.49x   4.99x
 *
 * A 5x shape spread is the exploit ADR-015 exists to close. The ADR's literal
 * 12-year Jupiter window does not fix it either (±53% emission, 1.8-3.0x
 * spread) because one cycle still leaves Saturn and outward drifting. Sampling
 * the claim's own year holds both invariants — ±3% emission for 3 of 4
 * archetypes in every year measured, shape spread ≤1.37x — so WTEN diverges
 * from §3 deliberately. See docs/adr/016-untethered-resonance-faucet.md.
 */
export function baselineEpochFor(year: number): { start: number; endExclusive: number } {
  return {
    start: Date.UTC(year, 0, 1, 12),
    endExclusive: Date.UTC(year + 1, 0, 1, 12),
  };
}

/** UTC year whose sky a claim at `date` is normalised against. */
export function baselineYearFor(date: Date): number {
  return date.getUTCFullYear();
}

const DAY_MS = 86_400_000;
const SUPPLY_CACHE_TTL_MS = 5 * 60 * 1000;
const ROUNDING_FACTOR = 10_000;
const REQUIRED_BASELINE_EPSILON = 0.000_001;

/** Audited ASOL snapshot used only when live circulating supply cannot be read. */
export const FALLBACK_NETWORK_SUPPLY: GlobalSupplyState = {
  spirit: 10_583.22,
  essence: 15_780.23,
  matter: 29_116.87,
  substance: 22_133.85,
  total: 77_614.17,
  isDegraded: true,
};

export interface TransitSkyData {
  elementWeights: Record<AlchemicalElement, number>;
  dominantElement: AlchemicalElement;
}

export interface DiscriminantFaucetInput {
  natalWeights: TokenDistribution;
  natalPositions: AlchemicalPlanetPositions;
  transitPositions: AlchemicalPlanetPositions;
  chartBaseline: number;
  supply: GlobalSupplyState;
}

export class DegradedEphemerisError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DegradedEphemerisError";
  }
}

interface BodyGeometry {
  sign: (typeof SIGNS)[number] | null;
  longitude: number | null;
}

function quantize(value: number): number {
  return Math.round(value * ROUNDING_FACTOR) / ROUNDING_FACTOR;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function canonicalSign(sign: unknown): (typeof SIGNS)[number] | null {
  if (typeof sign !== "string" || sign.trim().length === 0) return null;
  const normalized = `${sign.trim().charAt(0).toUpperCase()}${sign
    .trim()
    .slice(1)
    .toLowerCase()}`;
  // `find` narrows to the literal union on its own; `includes` cannot, which is
  // why this needed two assertions to say what the code already guarantees.
  return SIGNS.find((candidate) => candidate === normalized) ?? null;
}

function finiteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function geometryOf(position: string | AlchemicalPlanetPosition): BodyGeometry {
  if (typeof position === "string") {
    return { sign: canonicalSign(position), longitude: null };
  }

  const sign = canonicalSign(position.sign);
  const exactLongitude = finiteNumber(position.exactLongitude);
  if (exactLongitude !== null) {
    return {
      sign,
      longitude: ((exactLongitude % 360) + 360) % 360,
    };
  }

  const degree = finiteNumber(position.degree);
  if (sign && degree !== null && degree >= 0 && degree < 30) {
    return {
      sign,
      longitude: SIGNS.indexOf(sign) * 30 + degree,
    };
  }

  return { sign, longitude: null };
}

function canonicalBodies(
  positions: AlchemicalPlanetPositions,
): Map<(typeof FAUCET_PLANETS)[number], BodyGeometry> {
  const byLowerName = new Map(
    Object.entries(positions).map(([name, position]) => [name.trim().toLowerCase(), position]),
  );
  const canonical = new Map<(typeof FAUCET_PLANETS)[number], BodyGeometry>();
  for (const planet of FAUCET_PLANETS) {
    const position = byLowerName.get(planet.toLowerCase());
    if (position !== undefined) canonical.set(planet, geometryOf(position));
  }
  return canonical;
}

function angularSeparation(a: number, b: number): number {
  const difference = Math.abs(a - b) % 360;
  return Math.min(difference, 360 - difference);
}

function aspectContribution(natalLongitude: number, transitLongitude: number): number {
  const separation = angularSeparation(natalLongitude, transitLongitude);
  for (const aspect of ASPECTS) {
    const orb = Math.abs(separation - aspect.angle);
    if (orb <= SYNASTRY_ORB_DEGREES) {
      return aspect.weight * (1 - orb / SYNASTRY_ORB_DEGREES);
    }
  }
  return 0;
}

/**
 * `Map.get` is honestly optional, so the miss branch below type-checks as
 * reachable. Indexing `ZODIAC_ELEMENTS` with `as keyof typeof` instead claimed
 * every string resolves, which made that branch read as dead code and cost two
 * type assertions to paper over.
 */
const ELEMENT_BY_SIGN = new Map<string, AlchemicalElement>(
  Object.entries(ZODIAC_ELEMENTS),
);

/** Deterministic tie-break order for the dominant-element reduce. */
const ELEMENT_ORDER = ["Fire", "Water", "Earth", "Air"] as const;

/**
 * Sign-only legacy charts still move with the sky, but never fabricate degrees.
 * Same-element and traditional complementary pairs conduct; cross-polar pairs
 * resist. The chart's own annual mean normalises this fallback exactly as it
 * does degree-level geometry, so sign-only shape cannot inflate magnitude.
 *
 * Parameters are the canonical union, not `string`: unrecognised signs are
 * already dropped upstream by {@link canonicalSign}, and typing them loosely
 * here would invite a caller to pass a raw string and silently collect the
 * -0.25 cross-polar score instead of nothing.
 */
function elementalConductance(
  natalSign: (typeof SIGNS)[number],
  transitSign: (typeof SIGNS)[number],
): number {
  const natalElement = ELEMENT_BY_SIGN.get(natalSign);
  const transitElement = ELEMENT_BY_SIGN.get(transitSign);
  if (!natalElement || !transitElement) return 0;
  if (natalElement === transitElement) return 1;
  if (
    (natalElement === "Fire" && transitElement === "Air") ||
    (natalElement === "Air" && transitElement === "Fire") ||
    (natalElement === "Earth" && transitElement === "Water") ||
    (natalElement === "Water" && transitElement === "Earth")
  ) {
    return 0.5;
  }
  return -0.25;
}

/** Signed aspect synastry S(N,t), across every available natal x transit pair. */
export function computeSynastryScore(
  natalPositions: AlchemicalPlanetPositions,
  transitPositions: AlchemicalPlanetPositions,
): number {
  const natal = canonicalBodies(natalPositions);
  const transit = canonicalBodies(transitPositions);
  let score = 0;

  for (const natalBody of natal.values()) {
    for (const transitBody of transit.values()) {
      if (natalBody.longitude !== null && transitBody.longitude !== null) {
        score += aspectContribution(natalBody.longitude, transitBody.longitude);
      } else if (natalBody.sign && transitBody.sign) {
        score += elementalConductance(natalBody.sign, transitBody.sign);
      }
    }
  }

  return Number.isFinite(score) ? score : 0;
}

/** Convert and validate the current moment chart used by both magnitude and colour. */
export function deriveTransitWeightsFromPositions(
  positions: AlchemicalPlanetPositions,
  options: { requireComplete?: boolean } = {},
): TransitSkyData {
  const bodies = canonicalBodies(positions);
  const invalid: string[] = [];
  const counts: Record<AlchemicalElement, number> = {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0,
  };

  for (const planet of FAUCET_PLANETS) {
    const body = bodies.get(planet);
    if (!body) {
      invalid.push(`${planet}:missing`);
      continue;
    }
    if (!body.sign) {
      invalid.push(`${planet}:invalid-sign`);
      continue;
    }
    if (body.longitude === null) {
      invalid.push(`${planet}:missing-longitude`);
    }
    counts[ZODIAC_ELEMENTS[body.sign]] += 1;
  }

  if (options.requireComplete && invalid.length > 0) {
    throw new DegradedEphemerisError(
      `Degraded ephemeris: ${invalid.join(", ")}`,
    );
  }

  const total = counts.Fire + counts.Water + counts.Earth + counts.Air;
  if (total === 0) {
    if (options.requireComplete) {
      throw new DegradedEphemerisError("Degraded ephemeris: no valid planetary positions");
    }
    counts.Fire = 2.5;
    counts.Water = 2.5;
    counts.Earth = 2.5;
    counts.Air = 2.5;
  }

  // Reducing over the element union keeps this typed without asserting the
  // shape of `Object.entries`, which erases the key type to `string`.
  const dominantElement = ELEMENT_ORDER.reduce((dominant, candidate) =>
    counts[candidate] > counts[dominant] ? candidate : dominant,
  );

  return { elementWeights: counts, dominantElement };
}

/**
 * Memoised per epoch year. The 365-sky sweep runs once per year per process;
 * every user's baseline for that year then reuses it, so a year rollover costs
 * one sweep rather than one per claimer.
 */
const baselineSkiesByYear = new Map<number, AlchemicalPlanetPositions[]>();
const chartBaselineCache = new Map<string, number>();

function baselineSkies(year: number): AlchemicalPlanetPositions[] {
  const memo = baselineSkiesByYear.get(year);
  if (memo) return memo;

  const { start, endExclusive } = baselineEpochFor(year);
  const samples: AlchemicalPlanetPositions[] = [];
  for (let timestamp = start; timestamp < endExclusive; timestamp += DAY_MS) {
    const date = new Date(timestamp);
    const { positions, usedFallback } = calculatePositionsWithAstronomyEngine(date, {
      log: false,
    });
    if (usedFallback) {
      throw new DegradedEphemerisError(
        `Cannot construct ${baselineVersionFor(year)}: ephemeris degraded at ${date.toISOString()}`,
      );
    }
    deriveTransitWeightsFromPositions(positions, { requireComplete: true });
    samples.push(positions);
  }
  baselineSkiesByYear.set(year, samples);
  return samples;
}

function geometryCacheKey(positions: AlchemicalPlanetPositions): string {
  const bodies = canonicalBodies(positions);
  return FAUCET_PLANETS.map((planet) => {
    const body = bodies.get(planet);
    return `${planet}:${body?.sign ?? "?"}:${body?.longitude ?? "?"}`;
  }).join("|");
}

/**
 * Deterministic chart mean S-bar(N), sampled daily over `year`'s sky.
 *
 * `year` is explicit rather than defaulted to the current date: this is the
 * divisor that sets a claim's magnitude, and a hidden `new Date()` inside it
 * would make the engine's output depend on the wall clock of whatever process
 * called it. Callers pass the claim's own year (see {@link baselineYearFor}).
 * The algorithm and epoch are versioned because changing either reprices income.
 */
export function calculateChartBaseline(
  natalPositions: AlchemicalPlanetPositions,
  year: number,
  samples: readonly AlchemicalPlanetPositions[] = baselineSkies(year),
): number {
  const key = `${baselineVersionFor(year)}:${geometryCacheKey(natalPositions)}`;
  if (samples === baselineSkiesByYear.get(year)) {
    const cached = chartBaselineCache.get(key);
    if (cached !== undefined) return cached;
  }

  if (canonicalBodies(natalPositions).size === 0 || samples.length === 0) {
    throw new Error("Cannot calculate faucet baseline without natal and ephemeris geometry");
  }

  const mean =
    samples.reduce(
      (sum, transitPositions) => sum + computeSynastryScore(natalPositions, transitPositions),
      0,
    ) / samples.length;
  if (!Number.isFinite(mean) || mean <= REQUIRED_BASELINE_EPSILON) {
    throw new Error(`Invalid chart baseline: ${mean}`);
  }

  const baseline = Math.round(mean * 1_000_000) / 1_000_000;
  if (samples === baselineSkiesByYear.get(year)) chartBaselineCache.set(key, baseline);
  return baseline;
}

function positiveFinite(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function normaliseDistribution(distribution: TokenDistribution): TokenDistribution {
  const safe = {
    spirit: positiveFinite(distribution.spirit),
    essence: positiveFinite(distribution.essence),
    matter: positiveFinite(distribution.matter),
    substance: positiveFinite(distribution.substance),
  };
  const total = safe.spirit + safe.essence + safe.matter + safe.substance;
  if (total <= 0) {
    return { spirit: 0.25, essence: 0.25, matter: 0.25, substance: 0.25 };
  }
  return {
    spirit: safe.spirit / total,
    essence: safe.essence / total,
    matter: safe.matter / total,
    substance: safe.substance / total,
  };
}

function antiGlutFactors(supply: GlobalSupplyState): TokenDistribution {
  const safe = {
    spirit: positiveFinite(supply.spirit),
    essence: positiveFinite(supply.essence),
    matter: positiveFinite(supply.matter),
    substance: positiveFinite(supply.substance),
  };
  const total = safe.spirit + safe.essence + safe.matter + safe.substance;
  const factor = (value: number): number => {
    if (total <= 0) return 1;
    const share = value / total;
    return share > 0.3 ? Math.max(0.65, 1 - 2 * (share - 0.25)) : 1;
  };
  return {
    spirit: factor(safe.spirit),
    essence: factor(safe.essence),
    matter: factor(safe.matter),
    substance: factor(safe.substance),
  };
}

/** Full ADR-015 law: self-normalised magnitude, then floored four-axis allocation. */
export function computeDiscriminantDailyYield(
  input: DiscriminantFaucetInput,
): DiscriminantYieldResult {
  if (!Number.isFinite(input.chartBaseline) || input.chartBaseline <= REQUIRED_BASELINE_EPSILON) {
    throw new Error(`Invalid chart baseline: ${input.chartBaseline}`);
  }

  const transit = deriveTransitWeightsFromPositions(input.transitPositions, {
    requireComplete: true,
  });
  const score = computeSynastryScore(input.natalPositions, input.transitPositions);
  const resonanceRatio = score / input.chartBaseline;
  if (!Number.isFinite(resonanceRatio)) {
    throw new Error(`Invalid self-normalised resonance: ${resonanceRatio}`);
  }

  const total = quantize(
    clamp(
      PROTOCOL_BAND.center * resonanceRatio,
      PROTOCOL_BAND.min,
      PROTOCOL_BAND.max,
    ),
  );
  const natalRatio = normaliseDistribution(input.natalWeights);
  const transitTotal =
    transit.elementWeights.Fire +
    transit.elementWeights.Water +
    transit.elementWeights.Earth +
    transit.elementWeights.Air;
  const transitRatio: TokenDistribution = {
    spirit: transit.elementWeights.Fire / transitTotal,
    essence: transit.elementWeights.Water / transitTotal,
    matter: transit.elementWeights.Earth / transitTotal,
    substance: transit.elementWeights.Air / transitTotal,
  };
  const omega = antiGlutFactors(input.supply);
  const weighted = {
    spirit: natalRatio.spirit * transitRatio.spirit * omega.spirit,
    essence: natalRatio.essence * transitRatio.essence * omega.essence,
    matter: natalRatio.matter * transitRatio.matter * omega.matter,
    substance: natalRatio.substance * transitRatio.substance * omega.substance,
  };
  const weightedTotal =
    weighted.spirit + weighted.essence + weighted.matter + weighted.substance;
  const discretionary = total - AXIS_FLOOR * 4;

  const distribution: TokenDistribution = {
    spirit: 0,
    essence: 0,
    matter: 0,
    substance: 0,
  };
  const axes = ["spirit", "essence", "matter", "substance"] as const;
  for (const axis of axes) {
    const share = weightedTotal > 0 ? weighted[axis] / weightedTotal : 0.25;
    distribution[axis] = quantize(AXIS_FLOOR + discretionary * share);
  }

  const roundedSum = quantize(
    distribution.spirit +
      distribution.essence +
      distribution.matter +
      distribution.substance,
  );
  const residual = quantize(total - roundedSum);
  if (residual !== 0) {
    const largest = axes.reduce((a, b) =>
      distribution[b] > distribution[a] ? b : a,
    );
    distribution[largest] = quantize(distribution[largest] + residual);
  }

  const result: DiscriminantYieldResult = {
    ...distribution,
    total,
    resonance: {
      score: Math.round(score * 1_000_000) / 1_000_000,
      baseline: input.chartBaseline,
      ratio: Math.round(resonanceRatio * 1_000_000) / 1_000_000,
    },
    breakdown: {
      spirit: {
        natalRatio: quantize(natalRatio.spirit),
        transitRatio: quantize(transitRatio.spirit),
        antiGlutFactor: Math.round(omega.spirit * 1_000) / 1_000,
        finalYield: distribution.spirit,
      },
      essence: {
        natalRatio: quantize(natalRatio.essence),
        transitRatio: quantize(transitRatio.essence),
        antiGlutFactor: Math.round(omega.essence * 1_000) / 1_000,
        finalYield: distribution.essence,
      },
      matter: {
        natalRatio: quantize(natalRatio.matter),
        transitRatio: quantize(transitRatio.matter),
        antiGlutFactor: Math.round(omega.matter * 1_000) / 1_000,
        finalYield: distribution.matter,
      },
      substance: {
        natalRatio: quantize(natalRatio.substance),
        transitRatio: quantize(transitRatio.substance),
        antiGlutFactor: Math.round(omega.substance * 1_000) / 1_000,
        finalYield: distribution.substance,
      },
    },
  };
  validateLedgerClamp(result);
  return result;
}

/** Last-line mint invariant. A failure throws before any ledger write is attempted. */
export function validateLedgerClamp(
  distribution: Pick<
    DiscriminantYieldResult,
    "spirit" | "essence" | "matter" | "substance" | "total"
  >,
): void {
  const axes = [
    distribution.spirit,
    distribution.essence,
    distribution.matter,
    distribution.substance,
  ];
  const computedSum = quantize(axes.reduce((sum, value) => sum + value, 0));
  const invalid =
    !Number.isFinite(distribution.total) ||
    axes.some((value) => !Number.isFinite(value)) ||
    distribution.total < PROTOCOL_BAND.min ||
    distribution.total > PROTOCOL_BAND.max ||
    computedSum < PROTOCOL_BAND.min ||
    computedSum > PROTOCOL_BAND.max ||
    Math.abs(computedSum - distribution.total) > 0.0001 ||
    axes.some((value) => value < AXIS_FLOOR - 0.0001);
  if (invalid) {
    throw new Error(
      `Ledger clamp invariant breach: computedSum=${computedSum}, total=${distribution.total} ` +
        `(allowed [${PROTOCOL_BAND.min}, ${PROTOCOL_BAND.max}]), ` +
        `minAxis=${Math.min(...axes)} (floor ${AXIS_FLOOR})`,
    );
  }
}

let cachedSupply: { data: GlobalSupplyState; expiresAt: number } | null = null;

interface SupplyRow extends Record<string, unknown> {
  spirit: number | string;
  essence: number | string;
  matter: number | string;
  substance: number | string;
}

type SupplyQuery = () => Promise<{ rows: SupplyRow[] }>;

/** Native-Postgres circulating-supply read with a five-minute in-process TTL. */
export async function getLiveNetworkSupply(query?: SupplyQuery): Promise<GlobalSupplyState> {
  const now = Date.now();
  if (cachedSupply && cachedSupply.expiresAt > now) return cachedSupply.data;

  try {
    const runQuery: SupplyQuery = query ?? (async (): Promise<{ rows: SupplyRow[] }> => {
      const { executeQuery } = await import("@/lib/database");
      return executeQuery<SupplyRow>(
        `SELECT COALESCE(SUM(spirit), 0)::float8 AS spirit,
                COALESCE(SUM(essence), 0)::float8 AS essence,
                COALESCE(SUM(matter), 0)::float8 AS matter,
                COALESCE(SUM(substance), 0)::float8 AS substance
           FROM token_balances`,
      );
    });
    const result = await runQuery();
    const [row] = result.rows;
    if (row) {
      const data: GlobalSupplyState = {
        spirit: positiveFinite(Number(row.spirit)),
        essence: positiveFinite(Number(row.essence)),
        matter: positiveFinite(Number(row.matter)),
        substance: positiveFinite(Number(row.substance)),
        isDegraded: false,
      };
      data.total = data.spirit + data.essence + data.matter + data.substance;
      if (data.total > 0) {
        cachedSupply = { data, expiresAt: now + SUPPLY_CACHE_TTL_MS };
        return data;
      }
    }
  } catch (error) {
    _logger.warn("[DiscriminantFaucet] live supply query failed; using audited snapshot", error);
  }

  return { ...FALLBACK_NETWORK_SUPPLY };
}
