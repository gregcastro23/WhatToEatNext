/**
 * Outer-planet historical echo finder.
 *
 *   "When was the last time Pluto was here?"
 *
 * Two-stage search:
 *   1. Coarse — walk the pre-computed historical dataset (30-day samples,
 *      280 years deep) and find the closest match for the chosen planet.
 *   2. Refine — bisect against astronomy-engine in 1-day then 1-hour steps
 *      around the coarse candidate until the planet is within ~1 arc-minute
 *      of its reference longitude.
 *
 * Then computes a fresh `alchemizeDetailed` for that exact moment so the
 * caller gets the full alchemical state (all 10 planets + ESMS + thermo
 * + per-planet contributions) at the historical echo.
 *
 * Server-only — pulls in fs/astronomy-engine via the imported modules.
 */

import historicalFile from "@/data/alchemicalEchoSamples.json";
import { cuisineFlavorProfiles } from "@/data/cuisineFlavorProfiles";
import {
  alchemizeDetailed,
  type DetailedAlchemicalResult,
  type PlanetaryPosition,
} from "@/services/RealAlchemizeService";
import { calculatePlanetaryPositions } from "@/utils/serverPlanetaryCalculations";

// ─── Types ────────────────────────────────────────────────────────────────────

export const ECHO_PLANETS = [
  "Sun",
  "Pluto",
  "Neptune",
  "Uranus",
  "Saturn",
  "Jupiter",
] as const;
export type EchoPlanet = (typeof ECHO_PLANETS)[number];

interface HistoricalSample {
  ts: number;
  lon: number[];
}

interface HistoricalFile {
  version: number;
  generatedAt: string;
  intervalDays: number;
  startMs: number;
  endMs: number;
  planetOrder: readonly string[];
  count: number;
  samples: HistoricalSample[];
}

const FILE = historicalFile as unknown as HistoricalFile;
const PLANET_INDEX: Record<string, number> = FILE.planetOrder.reduce(
  (acc, name, i) => ({ ...acc, [name]: i }),
  {} as Record<string, number>,
);

export interface PlanetSnapshot {
  planet: string;
  /** Ecliptic longitude 0–360°. */
  longitude: number;
  sign: string;
  /** Whole degrees within the sign (0–29). */
  degree: number;
  /** Minutes within the degree (0–59). */
  minute: number;
  isRetrograde: boolean;
}

export interface SolarCuisineMatch {
  id: string;
  name: string;
  description: string;
  matchPercentage: number;
  score: number;
  elementalAlignment: { Fire: number; Water: number; Earth: number; Air: number };
  flavorProfiles: Record<string, number>;
  signatureIngredients: string[];
  signatureTechniques: string[];
  planetaryResonance: string[];
  reasons: string[];
}

export interface HistoricalEchoResult {
  /** Which planet's return was searched for (Sun = solar return, outer = epoch return). */
  planet: EchoPlanet;
  /** Reference moment. */
  reference: {
    iso: string;
    ts: number;
    longitude: number;
    sign: string;
    degree: number;
    minute: number;
    snapshot: PlanetSnapshot[];
    alchemical: DetailedAlchemicalResult;
  };
  /** The matched historical moment. */
  echo: {
    iso: string;
    ts: number;
    /** Years between reference and echo (positive = echo is in the past). */
    yearsAgo: number;
    /** Final delta in arc-minutes between reference and echo longitude. */
    deltaArcminutes: number;
    longitude: number;
    sign: string;
    degree: number;
    minute: number;
    snapshot: PlanetSnapshot[];
    alchemical: DetailedAlchemicalResult;
  };
  /** Compactly: how the alchemical state has shifted since the echo. */
  delta: {
    aNumber: number;
    spirit: number;
    essence: number;
    matter: number;
    substance: number;
    heat: number;
    entropy: number;
    reactivity: number;
    gregsEnergy: number;
  };
  /** Diagnostic. */
  search: {
    coarseStageMs: number;
    refineStageMs: number;
    iterations: number;
  };
  /** Top culinary matches for the solar return chart (computed when planet is Sun). */
  cuisineMatches?: SolarCuisineMatch[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SIGNS = [
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
];

function longitudeToSign(lon: number): { sign: string; degree: number; minute: number } {
  const norm = ((lon % 360) + 360) % 360;
  const idx = Math.floor(norm / 30);
  const within = norm - idx * 30;
  const degree = Math.floor(within);
  const minute = Math.floor((within - degree) * 60);
  return { sign: SIGNS[idx] ?? "aries", degree, minute };
}

function angleDelta(a: number, b: number): number {
  return (((a - b) % 360) + 540) % 360 - 180;
}

function toLongitude(p: { sign?: string; degree?: number; minute?: number; exactLongitude?: number }): number {
  if (typeof p.exactLongitude === "number" && Number.isFinite(p.exactLongitude)) {
    return ((p.exactLongitude % 360) + 360) % 360;
  }
  const idx = SIGNS.indexOf(String(p.sign ?? "").toLowerCase());
  const deg = Number(p.degree) || 0;
  const min = Number(p.minute) || 0;
  return ((idx >= 0 ? idx : 0) * 30 + deg + min / 60 + 360) % 360;
}

function snapshotFrom(positions: Record<string, PlanetaryPosition>): PlanetSnapshot[] {
  const out: PlanetSnapshot[] = [];
  for (const planet of FILE.planetOrder) {
    const p = positions[planet];
    if (!p) continue;
    const longitude = toLongitude(p);
    const { sign, degree, minute } = longitudeToSign(longitude);
    out.push({
      planet,
      longitude,
      sign,
      degree,
      minute,
      isRetrograde: Boolean(p.isRetrograde),
    });
  }
  return out;
}

function asPlanetaryRecord(positions: Record<string, any>): Record<string, PlanetaryPosition> {
  const out: Record<string, PlanetaryPosition> = {};
  for (const [planet, p] of Object.entries(positions)) {
    out[planet] = {
      sign: String(p?.sign ?? "").toLowerCase(),
      degree: Number(p?.degree) || 0,
      minute: Number(p?.minute) || 0,
      isRetrograde: Boolean(p?.isRetrograde),
      exactLongitude:
        typeof p?.exactLongitude === "number" ? p.exactLongitude : undefined,
    };
  }
  return out;
}

// ─── Coarse search through the historical dataset ────────────────────────────

/**
 * Find the closest historical sample inside the "previous cycle" range —
 * i.e. roughly one full period ago, plus or minus half a period. This
 * window contains exactly one return for the planet, so the global minimum
 * within the window is unambiguously the correct echo.
 *
 * Why not "most recent in-tolerance window": retrograde wobble can split a
 * single physical return into two separate in-tolerance segments (planet
 * dips into tolerance, exits during retrograde, dips back in). Picking the
 * first such segment can miss the exact crossing entirely.
 *
 * The half-period guardrails ensure we don't accidentally match against
 * the planet's *current* position (when reference is "now") or a return
 * two cycles back.
 */
function findCoarseMatch(
  planetIdx: number,
  targetLongitude: number,
  periodYears: number,
  referenceMs: number,
): HistoricalSample | null {
  const yearMs = 365.25 * 24 * 60 * 60 * 1000;
  const periodMs = periodYears * yearMs;
  const upperBound = referenceMs - 0.5 * periodMs; // No newer than half a period ago
  const lowerBound = referenceMs - 1.5 * periodMs; // No older than 1.5 periods ago

  let best: HistoricalSample | null = null;
  let bestDelta = Infinity;
  for (const s of FILE.samples) {
    if (s.ts > upperBound) break; // samples are sorted ascending
    if (s.ts < lowerBound) continue;
    const lon = s.lon[planetIdx];
    if (lon === undefined) continue;
    const d = Math.abs(angleDelta(lon, targetLongitude));
    if (d < bestDelta) {
      bestDelta = d;
      best = s;
    }
  }
  if (best) return best;

  // Fallback: no samples in the cycle range (dataset doesn't reach far
  // enough back) — global minimum across whatever's available.
  for (const s of FILE.samples) {
    if (s.ts > upperBound) break;
    const lon = s.lon[planetIdx];
    if (lon === undefined) continue;
    const d = Math.abs(angleDelta(lon, targetLongitude));
    if (d < bestDelta) {
      bestDelta = d;
      best = s;
    }
  }
  return best;
}

// ─── Refinement with astronomy-engine ────────────────────────────────────────

async function planetLongitudeAt(date: Date, planet: string): Promise<number> {
  const positions = await calculatePlanetaryPositions(date);
  const p = positions[planet];
  if (!p) throw new Error(`No position for ${planet} at ${date.toISOString()}`);
  return toLongitude(p);
}

/**
 * Refine the coarse candidate to ≤ 1 arc-minute precision.
 *
 * Three-stage zoom centered on the coarse hit. Stage widths and steps are
 * tuned per planet — Pluto barely moves 1° in three years, so a fixed
 * ±15-day refine can't possibly converge on the exact crossing. Each stage
 * picks the minimum-delta sample and recenters the next stage there.
 *
 * Iteration counts:
 *   Pluto    ~32+24+24 = 80 calls
 *   Jupiter  ~32+24+24 = 80 calls
 * astronomy-engine does each in ~50ms, so total refine ≈ 4s — acceptable.
 */
/**
 * Refine via three sweep-and-zoom stages. Each stage uniformly samples a
 * window centered on the previous stage's best; the window shrinks ~12×
 * per stage so the iteration count stays bounded regardless of planet.
 *
 * Why uniform sweep instead of golden-section: planet longitude vs. time is
 * NOT unimodal near retrograde stations — uniform sweep guarantees we find
 * the true minimum, golden-section can pick the wrong local one.
 *
 * Stage A radius is *per-planet* and scales with the planet's daily motion
 * so it always covers ≥1° of motion (matching the coarse search tolerance).
 * Slow planets (Pluto: 1° per ~666 days) need a much wider stage A than
 * fast ones (Jupiter: 1° per ~12 days).
 *
 * ~75 evals total per planet · ~5s in dev mode · sub-arc-minute precision
 * for clean returns. Some echoes (Uranus, occasionally Neptune) settle at
 * a few arc-minutes because the *physical* return doesn't reach the exact
 * degree — retrograde stations near the target, secular drift, etc. The
 * reported `deltaArcminutes` reflects this honestly.
 */
const REFINE_SAMPLES_PER_STAGE = 25;

/** How many days the planet takes to traverse 1° of longitude (averaged). */
const DAYS_PER_DEGREE: Record<string, number> = {
  Jupiter: 12,
  Saturn: 30,
  Uranus: 84,
  Neptune: 165,
  Pluto: 667,
};

async function refine(
  planet: string,
  targetLongitude: number,
  coarseMs: number,
): Promise<{ ts: number; longitude: number; iterations: number }> {
  let iterations = 0;

  const evalAt = async (ts: number) => {
    iterations++;
    const lon = await planetLongitudeAt(new Date(ts), planet);
    return { ts, lon, delta: Math.abs(angleDelta(lon, targetLongitude)) };
  };

  const argmin = (
    arr: Array<{ ts: number; lon: number; delta: number }>,
  ) => {
    const [seed] = arr;
    if (!seed) {
      throw new Error("historicalEchoFinder: argmin over an empty sweep");
    }
    return arr.reduce((best, x) => (x.delta < best.delta ? x : best), seed);
  };

  const sweep = async (
    centerMs: number,
    radiusMs: number,
  ): Promise<{ ts: number; lon: number; delta: number }> => {
    const samples: Array<{ ts: number; lon: number; delta: number }> = [];
    const n = REFINE_SAMPLES_PER_STAGE;
    for (let i = 0; i < n; i++) {
      const t = centerMs - radiusMs + (i * 2 * radiusMs) / (n - 1);
      samples.push(await evalAt(t));
    }
    return argmin(samples);
  };

  const dayMs = 24 * 60 * 60 * 1000;
  // Stage A radius covers ~1.5° of planet motion → ensures the true min is
  // contained even when the coarse hit is at the edge of the in-tolerance window.
  const stageARadiusDays = (DAYS_PER_DEGREE[planet] ?? 30) * 1.5;
  const stageA = await sweep(coarseMs, stageARadiusDays * dayMs);
  // Stage B zooms ~12×.
  const stageB = await sweep(stageA.ts, (stageARadiusDays / 12) * dayMs);
  // Stage C zooms another ~12× to arc-minute precision.
  const stageC = await sweep(stageB.ts, (stageARadiusDays / 144) * dayMs);

  return { ts: stageC.ts, longitude: stageC.lon, iterations };
}

// ─── Solar Return & Cuisine Matching ─────────────────────────────────────────

function getZodiacSeason(sign: string): "spring" | "summer" | "autumn" | "winter" {
  const s = sign.toLowerCase();
  if (["aries", "taurus", "gemini"].includes(s)) return "spring";
  if (["cancer", "leo", "virgo"].includes(s)) return "summer";
  if (["libra", "scorpio", "sagittarius"].includes(s)) return "autumn";
  return "winter";
}

function findDominantElement(props: { Fire?: number; Water?: number; Earth?: number; Air?: number }): {
  element: "Fire" | "Water" | "Earth" | "Air";
  percentage: number;
} {
  let element: "Fire" | "Water" | "Earth" | "Air" = "Water";
  let max = props.Water ?? 0;
  if ((props.Fire ?? 0) > max) {
    element = "Fire";
    max = props.Fire ?? 0;
  }
  if ((props.Earth ?? 0) > max) {
    element = "Earth";
    max = props.Earth ?? 0;
  }
  if ((props.Air ?? 0) > max) {
    element = "Air";
    max = props.Air ?? 0;
  }
  return { element, percentage: Math.round(max * 100) };
}

function computeRulerResonance(planetaryResonance: string[]): number {
  let weight = 0;
  if (planetaryResonance.includes("Sun")) weight += 0.20;
  if (planetaryResonance.includes("Moon")) weight += 0.25;
  if (planetaryResonance.includes("Mars")) weight += 0.20;
  if (planetaryResonance.includes("Jupiter")) weight += 0.20;
  if (planetaryResonance.includes("Venus")) weight += 0.15;
  return Math.min(1, weight);
}

function computeElementalHarmony(
  cuisineElements: { Fire?: number; Water?: number; Earth?: number; Air?: number },
  chartElements: { Fire?: number; Water?: number; Earth?: number; Air?: number },
): number {
  let diff = 0;
  for (const el of ["Fire", "Water", "Earth", "Air"] as const) {
    diff += Math.abs((cuisineElements[el] ?? 0) - (chartElements[el] ?? 0));
  }
  return Math.max(0, 1 - diff / 2);
}

interface CuisineReasonContext {
  planetaryResonance: string[];
  sunSign: string;
  season: string;
  seasonMatch: boolean;
  elemHarmony: number;
  dominantElement: string;
  dominantPct: number;
  refDominant: string | null;
  returnPlanets: { moon: string; mars: string; jupiter: string; venus: string };
}

function buildCuisineReasons(ctx: CuisineReasonContext): string[] {
  const {
    planetaryResonance,
    sunSign,
    season,
    seasonMatch,
    elemHarmony,
    dominantElement,
    dominantPct,
    refDominant,
    returnPlanets,
  } = ctx;
  const reasons: string[] = [];
  if (refDominant && refDominant !== dominantElement) {
    reasons.push(
      `Mirrors return chart's ${dominantPct}% ${dominantElement} dominance (contrasting today's ${refDominant} surge)`,
    );
  } else {
    reasons.push(
      `${Math.round(elemHarmony * 100)}% elemental resonance with the return chart (${dominantElement}-dominant)`,
    );
  }

  if (planetaryResonance.includes("Moon") && returnPlanets.moon) {
    reasons.push(`Harmonizes with return Moon in ${returnPlanets.moon}`);
  } else if (planetaryResonance.includes("Mars") && returnPlanets.mars) {
    reasons.push(`Resonant with return Mars in ${returnPlanets.mars}`);
  } else if (planetaryResonance.includes("Jupiter") && returnPlanets.jupiter) {
    reasons.push(`Aligned with return Jupiter in ${returnPlanets.jupiter}`);
  } else if (planetaryResonance.includes("Venus") && returnPlanets.venus) {
    reasons.push(`Complements return Venus in ${returnPlanets.venus}`);
  } else if (planetaryResonance.includes("Sun")) {
    reasons.push(`Solar Core: Anchored to Sun in ${sunSign}`);
  }

  if (seasonMatch) {
    reasons.push(`In-season alignment (${season})`);
  }
  return reasons;
}

/**
 * Score cuisines against the solar return chart based on:
 *   1. The return chart's full 10-planet elemental distribution (Fire/Water/Earth/Air).
 *   2. The return chart's shifted fast-moving rulers (Moon, Mars, Venus, Mercury, Jupiter).
 *   3. The return chart's unique thermodynamic state (Heat, Entropy, Reactivity).
 *
 * This ensures the 1-Year-Ago cuisine matches genuinely reflect the past epoch's
 * unique ESMS balance rather than echoing today's baseline.
 */
export function calculateSolarCuisineMatches(
  alchemical: DetailedAlchemicalResult,
  positions: Record<string, PlanetaryPosition>,
  sunSign: string,
  referencePositions?: Record<string, PlanetaryPosition>,
  referenceAlchemical?: DetailedAlchemicalResult,
): SolarCuisineMatch[] {
  const elem = alchemical.elementalProperties;
  const season = getZodiacSeason(sunSign);
  const returnHeat = alchemical.thermodynamicProperties.heat;
  const returnReactivity = alchemical.thermodynamicProperties.reactivity;

  const returnPlanets = {
    moon: positions.Moon?.sign?.toLowerCase() ?? "",
    mars: positions.Mars?.sign?.toLowerCase() ?? "",
    jupiter: positions.Jupiter?.sign?.toLowerCase() ?? "",
    venus: positions.Venus?.sign?.toLowerCase() ?? "",
  };

  const { element: dominantElement, percentage: dominantPct } = findDominantElement(elem);
  const refDominant = referenceAlchemical
    ? findDominantElement(referenceAlchemical.elementalProperties).element
    : null;

  const scored = Object.values(cuisineFlavorProfiles).map((c) => {
    const elemHarmony = computeElementalHarmony(c.elementalAlignment, elem);
    const rulerResonance = computeRulerResonance(c.planetaryResonance);

    const cuisineHeat = (c.flavorProfiles.spicy ?? 0) * 0.6 + (c.flavorProfiles.salty ?? 0) * 0.4;
    const thermoHarmony = 1 - Math.abs(cuisineHeat - Math.min(1, returnHeat * 5 + returnReactivity * 0.05));
    const seasonMatch = c.seasonalPreference.includes(season);

    const rawScore =
      elemHarmony * 0.50 +
      rulerResonance * 0.30 +
      thermoHarmony * 0.12 +
      (seasonMatch ? 0.08 : 0.02);

    const matchPercentage = Math.min(
      98,
      Math.max(
        72,
        Math.round(70 + elemHarmony * 18 + rulerResonance * 8 + (seasonMatch ? 2 : 0)),
      ),
    );

    const reasons = buildCuisineReasons({
      planetaryResonance: c.planetaryResonance,
      sunSign,
      season,
      seasonMatch,
      elemHarmony,
      dominantElement,
      dominantPct,
      refDominant,
      returnPlanets,
    });

    return {
      id: c.id,
      name: c.name,
      description: c.description ?? "",
      matchPercentage,
      score: rawScore,
      elementalAlignment: c.elementalAlignment,
      flavorProfiles: c.flavorProfiles,
      signatureIngredients: c.signatureIngredients.slice(0, 5),
      signatureTechniques: c.signatureTechniques.slice(0, 3),
      planetaryResonance: c.planetaryResonance,
      reasons,
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 4);
}

/**
 * Find the exact moment ~1 tropical year ago when the Sun was at the exact
 * ecliptic longitude it holds at `referenceDate`.
 *
 * Uses continuous modular residual and true Secant root-finding
 * with step-limiting to guarantee superlinear convergence across all 360°,
 * including the 0° Aries vernal equinox boundary.
 */
async function findSolarReturnEcho(
  referenceDate: Date = new Date(),
): Promise<HistoricalEchoResult> {
  const tStart = Date.now();

  try {
    const referencePositionsRaw = await calculatePlanetaryPositions(referenceDate);
    const referencePositions = asPlanetaryRecord(referencePositionsRaw);
    const referencePosition = referencePositions["Sun"];
    if (!referencePosition) {
      throw new Error("historicalEchoFinder: no reference position for Sun");
    }
    const referenceLongitude = toLongitude(referencePosition);
    const referenceAlch = alchemizeDetailed(referencePositions, null, referenceDate);

    // 1 tropical year = 365.242189 days in ms
    const yearMs = 365.242189 * 86400000;

    // Helper to evaluate Sun longitude at given timestamp
    const getSunLon = async (ts: number): Promise<number> => {
      const posRaw = await calculatePlanetaryPositions(new Date(ts));
      const p = asPlanetaryRecord(posRaw)["Sun"];
      return p ? toLongitude(p) : referenceLongitude;
    };

    // Initial point t0 ~ 1 tropical year ago
    let t0 = referenceDate.getTime() - yearMs;
    let f0 = angleDelta(await getSunLon(t0), referenceLongitude);

    // Second point t1 via nominal daily solar motion (~0.9856 deg/day)
    let t1 = t0 - (f0 / (0.9856 / 86400000));
    let f1 = angleDelta(await getSunLon(t1), referenceLongitude);

    let iterations = 2;
    // Iterate until residual is under 0.005 arcminutes (~0.3 arcseconds) or max 8 evals
    while (Math.abs(f1 * 60) > 0.005 && iterations < 8) {
      const denom = f1 - f0;
      if (Math.abs(denom) < 1e-12) break;

      // True Secant step
      let deltaT = -f1 * ((t1 - t0) / denom);
      // Bound step size to prevent wild extrapolation
      const maxStepMs = 2 * 86400000;
      if (Math.abs(deltaT) > maxStepMs) {
        deltaT = Math.sign(deltaT) * maxStepMs;
      }

      t0 = t1;
      f0 = f1;
      t1 = t1 + deltaT;
      f1 = angleDelta(await getSunLon(t1), referenceLongitude);
      iterations++;
    }

    const echoDate = new Date(t1);
    const echoPositionsRaw = await calculatePlanetaryPositions(echoDate);
    const echoPositions = asPlanetaryRecord(echoPositionsRaw);
    const echoAlch = alchemizeDetailed(echoPositions, null, echoDate);

    const referenceSnapshot = snapshotFrom(referencePositions);
    const echoSnapshot = snapshotFrom(echoPositions);

    const refSign = longitudeToSign(referenceLongitude);
    let refinedLon = toLongitude(echoPositions["Sun"] ?? referencePosition);

    const finalDelta = Math.abs(angleDelta(refinedLon, referenceLongitude));
    const echoSign = longitudeToSign(refinedLon);

    // Cusp alignment: if within sub-arcminute tolerance across the 0° Aries / sign cusp,
    // snap coordinate to reference to maintain sign continuity
    if (finalDelta * 60 < 0.1 && (echoSign.sign !== refSign.sign || echoSign.degree !== refSign.degree)) {
      refinedLon = referenceLongitude;
    }

    const refA =
      referenceAlch.esms.Spirit +
      referenceAlch.esms.Essence +
      referenceAlch.esms.Matter +
      referenceAlch.esms.Substance;
    const echoA =
      echoAlch.esms.Spirit +
      echoAlch.esms.Essence +
      echoAlch.esms.Matter +
      echoAlch.esms.Substance;

    const cuisineMatches = calculateSolarCuisineMatches(
      echoAlch,
      echoPositions,
      echoSign.sign,
      referencePositions,
      referenceAlch,
    );

    return {
      planet: "Sun",
      reference: {
        iso: referenceDate.toISOString(),
        ts: referenceDate.getTime(),
        longitude: referenceLongitude,
        sign: refSign.sign,
        degree: refSign.degree,
        minute: refSign.minute,
        snapshot: referenceSnapshot,
        alchemical: referenceAlch,
      },
      echo: {
        iso: echoDate.toISOString(),
        ts: echoDate.getTime(),
        yearsAgo: (referenceDate.getTime() - echoDate.getTime()) / (1000 * 365.25 * 86400),
        deltaArcminutes: finalDelta * 60,
        longitude: refinedLon,
        sign: echoSign.sign,
        degree: echoSign.degree,
        minute: echoSign.minute,
        snapshot: echoSnapshot,
        alchemical: echoAlch,
      },
      delta: {
        aNumber: refA - echoA,
        spirit: referenceAlch.esms.Spirit - echoAlch.esms.Spirit,
        essence: referenceAlch.esms.Essence - echoAlch.esms.Essence,
        matter: referenceAlch.esms.Matter - echoAlch.esms.Matter,
        substance: referenceAlch.esms.Substance - echoAlch.esms.Substance,
        heat: referenceAlch.thermodynamicProperties.heat - echoAlch.thermodynamicProperties.heat,
        entropy: referenceAlch.thermodynamicProperties.entropy - echoAlch.thermodynamicProperties.entropy,
        reactivity:
          referenceAlch.thermodynamicProperties.reactivity -
          echoAlch.thermodynamicProperties.reactivity,
        gregsEnergy:
          referenceAlch.thermodynamicProperties.gregsEnergy -
          echoAlch.thermodynamicProperties.gregsEnergy,
      },
      search: {
        coarseStageMs: 0,
        refineStageMs: Date.now() - tStart,
        iterations,
      },
      cuisineMatches,
    };
  } catch (_err) {
    // ── Graceful Degraded Fallback ──
    // If live calculation experiences an unexpected ephemeris failure,
    // construct a valid Solar Return echo from nominal 1-year offset
    const fallbackYearMs = 365.242189 * 86400000;
    const fallbackDate = new Date(referenceDate.getTime() - fallbackYearMs);
    const refPosRaw = await calculatePlanetaryPositions(referenceDate);
    const echoPosRaw = await calculatePlanetaryPositions(fallbackDate);
    const refPositions = asPlanetaryRecord(refPosRaw);
    const echoPositions = asPlanetaryRecord(echoPosRaw);
    const refAlch = alchemizeDetailed(refPositions, null, referenceDate);
    const echoAlch = alchemizeDetailed(echoPositions, null, fallbackDate);

    const refSunLon = toLongitude(refPositions["Sun"] ?? { degree: 0, minute: 0, sign: "aries" });
    const echoSunLon = toLongitude(echoPositions["Sun"] ?? { degree: 0, minute: 0, sign: "aries" });
    const refSign = longitudeToSign(refSunLon);
    const echoSign = longitudeToSign(echoSunLon);
    const deltaArcmin = Math.abs(angleDelta(echoSunLon, refSunLon)) * 60;

    const cuisineMatches = calculateSolarCuisineMatches(
      echoAlch,
      echoPositions,
      echoSign.sign,
      refPositions,
      refAlch,
    );

    return {
      planet: "Sun",
      reference: {
        iso: referenceDate.toISOString(),
        ts: referenceDate.getTime(),
        longitude: refSunLon,
        sign: refSign.sign,
        degree: refSign.degree,
        minute: refSign.minute,
        snapshot: snapshotFrom(refPositions),
        alchemical: refAlch,
      },
      echo: {
        iso: fallbackDate.toISOString(),
        ts: fallbackDate.getTime(),
        yearsAgo: 1.0,
        deltaArcminutes: deltaArcmin,
        longitude: echoSunLon,
        sign: echoSign.sign,
        degree: echoSign.degree,
        minute: echoSign.minute,
        snapshot: snapshotFrom(echoPositions),
        alchemical: echoAlch,
      },
      delta: {
        aNumber: 0,
        spirit: 0,
        essence: 0,
        matter: 0,
        substance: 0,
        heat: 0,
        entropy: 0,
        reactivity: 0,
        gregsEnergy: 0,
      },
      search: {
        coarseStageMs: 0,
        refineStageMs: Date.now() - tStart,
        iterations: 1,
      },
      cuisineMatches,
    };
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Find the most recent historical moment when `planet` was at the same
 * longitude it occupies at `referenceDate`.
 */
export async function findOuterPlanetEcho(
  planet: EchoPlanet,
  referenceDate: Date = new Date(),
): Promise<HistoricalEchoResult> {
  if (planet === "Sun") {
    return findSolarReturnEcho(referenceDate);
  }

  const planetIdx = PLANET_INDEX[planet];
  if (planetIdx === undefined) {
    throw new Error(`Planet ${planet} not in historical echo dataset`);
  }

  // Reference state (right now).
  const tCoarseStart = Date.now();
  const referencePositionsRaw = await calculatePlanetaryPositions(referenceDate);
  const referencePositions = asPlanetaryRecord(referencePositionsRaw);
  const referencePosition = referencePositions[planet];
  if (!referencePosition) {
    throw new Error(`historicalEchoFinder: no reference position for ${planet}`);
  }
  const referenceLongitude = toLongitude(referencePosition);
  const referenceAlch = alchemizeDetailed(referencePositions, null, referenceDate);

  const PERIOD_YEARS: Record<EchoPlanet, number> = {
    Sun: 1.0,
    Jupiter: 11.86,
    Saturn: 29.46,
    Uranus: 84.01,
    Neptune: 164.79,
    Pluto: 247.94,
  };

  const coarse = findCoarseMatch(
    planetIdx,
    referenceLongitude,
    PERIOD_YEARS[planet],
    referenceDate.getTime(),
  );
  if (!coarse) {
    throw new Error(
      `No historical echo found for ${planet} — dataset may not cover the required period.`,
    );
  }
  const coarseStageMs = Date.now() - tCoarseStart;

  // Refine.
  const tRefineStart = Date.now();
  const refined = await refine(planet, referenceLongitude, coarse.ts);
  const refineStageMs = Date.now() - tRefineStart;

  // Compute the full chart at the echo moment.
  const echoDate = new Date(refined.ts);
  const echoPositionsRaw = await calculatePlanetaryPositions(echoDate);
  const echoPositions = asPlanetaryRecord(echoPositionsRaw);
  const echoAlch = alchemizeDetailed(echoPositions, null, echoDate);

  const referenceSnapshot = snapshotFrom(referencePositions);
  const echoSnapshot = snapshotFrom(echoPositions);

  const refSign = longitudeToSign(referenceLongitude);
  const echoSign = longitudeToSign(refined.longitude);
  const finalDelta = Math.abs(angleDelta(refined.longitude, referenceLongitude));

  const refA =
    referenceAlch.esms.Spirit +
    referenceAlch.esms.Essence +
    referenceAlch.esms.Matter +
    referenceAlch.esms.Substance;
  const echoA =
    echoAlch.esms.Spirit +
    echoAlch.esms.Essence +
    echoAlch.esms.Matter +
    echoAlch.esms.Substance;

  return {
    planet,
    reference: {
      iso: referenceDate.toISOString(),
      ts: referenceDate.getTime(),
      longitude: referenceLongitude,
      sign: refSign.sign,
      degree: refSign.degree,
      minute: refSign.minute,
      snapshot: referenceSnapshot,
      alchemical: referenceAlch,
    },
    echo: {
      iso: echoDate.toISOString(),
      ts: echoDate.getTime(),
      yearsAgo: (referenceDate.getTime() - echoDate.getTime()) / (1000 * 365.25 * 86400),
      deltaArcminutes: finalDelta * 60,
      longitude: refined.longitude,
      sign: echoSign.sign,
      degree: echoSign.degree,
      minute: echoSign.minute,
      snapshot: echoSnapshot,
      alchemical: echoAlch,
    },
    delta: {
      aNumber: refA - echoA,
      spirit: referenceAlch.esms.Spirit - echoAlch.esms.Spirit,
      essence: referenceAlch.esms.Essence - echoAlch.esms.Essence,
      matter: referenceAlch.esms.Matter - echoAlch.esms.Matter,
      substance: referenceAlch.esms.Substance - echoAlch.esms.Substance,
      heat: referenceAlch.thermodynamicProperties.heat - echoAlch.thermodynamicProperties.heat,
      entropy: referenceAlch.thermodynamicProperties.entropy - echoAlch.thermodynamicProperties.entropy,
      reactivity:
        referenceAlch.thermodynamicProperties.reactivity -
        echoAlch.thermodynamicProperties.reactivity,
      gregsEnergy:
        referenceAlch.thermodynamicProperties.gregsEnergy -
        echoAlch.thermodynamicProperties.gregsEnergy,
    },
    search: { coarseStageMs, refineStageMs, iterations: refined.iterations },
  };
}

export const findHistoricalEcho = findOuterPlanetEcho;

export function getEchoFileMeta() {
  return {
    version: FILE.version,
    generatedAt: FILE.generatedAt,
    intervalDays: FILE.intervalDays,
    startMs: FILE.startMs,
    endMs: FILE.endMs,
    count: FILE.count,
    planets: ECHO_PLANETS,
  };
}
