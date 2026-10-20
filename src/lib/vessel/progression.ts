/**
 * Pure, versioned Vessel progression.
 *
 * XP is permanent (accumulates monotonically, never falls);
 * celestial sky transits change only dynamic Current Overall and active stat deltas.
 *
 * @file src/lib/vessel/progression.ts
 */

import { detectAspect, type AspectName } from "./aspectEngine";
import { SACRED_STAT_KEYS, type SacredStatKey } from "./ratingContract";

export const PLANETARY_STAT_KEYS = [
  "solarAgency",
  "lunarReceptivity",
  "mercurialVelocity",
  "venusianCoherence",
  "martialImpetus",
  "jovianExpansion",
  "saturnianStructure",
  "chironicAdaptation",
  "uranianSurprisal",
  "neptunianResonance",
  "plutonicIntegration",
  "kineticAlignment",
] as const;

export const ALL_VESSEL_STAT_KEYS = [
  ...SACRED_STAT_KEYS,
  ...PLANETARY_STAT_KEYS,
] as const;

export type VesselStatKey = (typeof ALL_VESSEL_STAT_KEYS)[number];
export type VesselStats = Record<VesselStatKey, number>;
export const VESSEL_PROGRESSION_VERSION = 1 as const;
export const MAX_SKY_AGE_MS = 15 * 60 * 1000;

export interface VesselProgressionInput {
  stats: VesselStats;
  totalXp: number;
  natal: {
    provenance: "computed" | "authored" | "placeholder" | "unattributed";
    positions: Record<string, { longitude: number }>;
  };
  sky: {
    asOf: string;
    source: "swiss-ephemeris" | "vsop87-approximation" | "unverified";
    positions: Record<string, { longitude: number }>;
  } | null;
  character: { primary: SacredStatKey; secondary: SacredStatKey };
  now: number;
}

export interface VesselProgression {
  version: typeof VESSEL_PROGRESSION_VERSION;
  level: number;
  totalXp: number;
  xpToNextLevel: number | null;
  baseOverall: number;
  trainedOverall: number;
  currentOverall: number | null;
  status: "live" | "estimated" | "unavailable";
  asOf: string | null;
  reasons: string[];
  statDeltas: VesselStats;
}

const PLANETS = [
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
  "Chiron",
] as const;

type Planet = (typeof PLANETS)[number];
type Affinity = Partial<Record<Planet, number>>;

const AFFINITIES: Record<VesselStatKey, Affinity> = {
  power: { Sun: 2, Mars: 2, Pluto: 1 },
  resonance: { Moon: 2, Venus: 1, Neptune: 2 },
  wisdom: { Mercury: 2, Jupiter: 2, Saturn: 1 },
  charisma: { Sun: 1, Venus: 2, Jupiter: 1 },
  intuition: { Moon: 2, Neptune: 2, Chiron: 1 },
  adaptability: { Mercury: 2, Uranus: 2, Chiron: 1 },
  vitality: { Sun: 2, Mars: 1, Saturn: 1 },
  solarAgency: { Sun: 1 },
  lunarReceptivity: { Moon: 1 },
  mercurialVelocity: { Mercury: 1 },
  venusianCoherence: { Venus: 1 },
  martialImpetus: { Mars: 1 },
  jovianExpansion: { Jupiter: 1 },
  saturnianStructure: { Saturn: 1 },
  chironicAdaptation: { Chiron: 1 },
  uranianSurprisal: { Uranus: 1 },
  neptunianResonance: { Neptune: 1 },
  plutonicIntegration: { Pluto: 1 },
  kineticAlignment: Object.fromEntries(
    PLANETS.map((planet) => [planet, 1]),
  ),
};

const ASPECT_RESPONSE: Record<AspectName, number> = {
  Conjunction: 1,
  Opposition: -1,
  Trine: 0.85,
  Square: -0.8,
  Sextile: 0.6,
  Quincunx: -0.4,
  "Semi-Sextile": 0.25,
};

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.max(minimum, Math.min(maximum, value));
const sum = (values: number[]) =>
  values.reduce((total, value) => total + value, 0);
const isSacred = (key: VesselStatKey): key is SacredStatKey =>
  SACRED_STAT_KEYS.some((k) => k === key);
const zeroDeltas = (): VesselStats => ({
  power: 0,
  resonance: 0,
  wisdom: 0,
  charisma: 0,
  intuition: 0,
  adaptability: 0,
  vitality: 0,
  solarAgency: 0,
  lunarReceptivity: 0,
  mercurialVelocity: 0,
  venusianCoherence: 0,
  martialImpetus: 0,
  jovianExpansion: 0,
  saturnianStructure: 0,
  chironicAdaptation: 0,
  uranianSurprisal: 0,
  neptunianResonance: 0,
  plutonicIntegration: 0,
  kineticAlignment: 0,
});

function normalizedStat(key: VesselStatKey, value: number): number {
  return isSacred(key) ? (value - 25) / 74 : value / 100;
}

function overall(stats: VesselStats): number {
  const sacred =
    sum(SACRED_STAT_KEYS.map((key) => normalizedStat(key, stats[key]))) / 7;
  const planetary =
    sum(PLANETARY_STAT_KEYS.map((key) => normalizedStat(key, stats[key]))) / 12;
  return 25 + 74 * (sacred * 0.5 + planetary * 0.5);
}

function parsePositions(
  positions: Record<string, { longitude: number }> | undefined,
  label: string,
  reasons: string[],
): Partial<Record<Planet, number>> | null {
  if (!positions || typeof positions !== "object" || Array.isArray(positions)) {
    reasons.push(`${label} positions are unavailable.`);
    return null;
  }
  const parsed: Partial<Record<Planet, number>> = {};
  for (const [name, position] of Object.entries(positions)) {
    const planet = PLANETS.find(
      (candidate) => candidate.toLowerCase() === name.trim().toLowerCase(),
    );
    if (!planet) continue;
    if (parsed[planet] !== undefined || !Number.isFinite(position?.longitude)) {
      reasons.push(`${label} has an invalid or duplicate ${planet} position.`);
      return null;
    }
    parsed[planet] = (((position.longitude % 360) + 360) % 360);
  }
  return parsed;
}

function affinityOverlap(affinity: Affinity, signature: Affinity): number {
  const weight = sum(Object.values(affinity));
  if (weight === 0) return 0;
  return (
    sum(
      PLANETS.map(
        (planet) => (affinity[planet] ?? 0) * (signature[planet] ? 1 : 0),
      ),
    ) / weight
  );
}

export function computeVesselProgression(
  input: VesselProgressionInput,
): VesselProgression {
  if (
    !Number.isFinite(input.totalXp) ||
    input.totalXp < 0 ||
    input.totalXp > Number.MAX_SAFE_INTEGER
  ) {
    throw new RangeError("totalXp must be a finite nonnegative safe number");
  }
  if (
    !Number.isFinite(input.now) ||
    !Number.isFinite(new Date(input.now).getTime())
  ) {
    throw new RangeError("now must be a valid timestamp");
  }
  for (const key of ALL_VESSEL_STAT_KEYS) {
    const value = input.stats?.[key];
    const minimum = isSacred(key) ? 25 : 0;
    const maximum = isSacred(key) ? 99 : 100;
    if (!Number.isFinite(value) || value < minimum || value > maximum) {
      throw new RangeError(
        `${key} must be finite and within [${minimum}, ${maximum}]`,
      );
    }
  }
  if (
    !input.character ||
    !SACRED_STAT_KEYS.includes(input.character.primary) ||
    !SACRED_STAT_KEYS.includes(input.character.secondary)
  ) {
    throw new RangeError("character must identify canonical Sacred stats");
  }

  const level = Math.min(100, 1 + Math.floor(Math.sqrt(input.totalXp / 100)));
  const baseOverall = overall(input.stats);
  const levelBoost = (12 * (level - 1)) / 99;
  const trainedOverall = clamp(baseOverall + levelBoost, 25, 99);
  const result: VesselProgression = {
    version: VESSEL_PROGRESSION_VERSION,
    level,
    totalXp: input.totalXp,
    xpToNextLevel: level === 100 ? null : 100 * level ** 2 - input.totalXp,
    baseOverall,
    trainedOverall,
    currentOverall: null,
    status: "unavailable",
    asOf: null,
    reasons: [],
    statDeltas: zeroDeltas(),
  };

  if (
    !input.natal ||
    !["computed", "authored"].includes(input.natal.provenance)
  ) {
    result.reasons.push(
      "An attributed natal chart is required; placeholder or unattributed DNA is unavailable.",
    );
    return result;
  }
  if (
    !input.sky ||
    !["swiss-ephemeris", "vsop87-approximation"].includes(input.sky.source)
  ) {
    result.reasons.push("A sourced current sky snapshot is unavailable.");
    return result;
  }
  const skyTime = Date.parse(input.sky.asOf);
  if (!Number.isFinite(skyTime)) {
    result.reasons.push("The sky snapshot has no valid observation time.");
    return result;
  }
  result.asOf = new Date(skyTime).toISOString();
  if (input.now - skyTime > MAX_SKY_AGE_MS || skyTime - input.now > 60_000) {
    result.reasons.push(
      "The sky snapshot is stale or does not describe the current time.",
    );
    return result;
  }

  const natal = parsePositions(
    input.natal.positions,
    "Natal chart",
    result.reasons,
  );
  const sky = parsePositions(input.sky.positions, "Sky snapshot", result.reasons);
  if (!natal || !sky) return result;
  const paired = PLANETS.filter(
    (planet) => natal[planet] !== undefined && sky[planet] !== undefined,
  );
  if (!paired.length) {
    result.reasons.push(
      "No natal and current planetary positions can be compared.",
    );
    return result;
  }
  const missing = PLANETS.filter((planet) => !paired.includes(planet));
  if (missing.length)
    result.reasons.push(`Transit coverage unavailable for ${missing.join(", ")}.`);
  if (input.natal.provenance === "authored")
    result.reasons.push(
      "Natal DNA is authored, not a verified ephemeris measurement.",
    );
  if (input.sky.source === "vsop87-approximation")
    result.reasons.push("Current sky positions are approximate.");
  result.status =
    input.natal.provenance === "computed" &&
    input.sky.source === "swiss-ephemeris" &&
    missing.every((planet) => planet === "Chiron")
      ? "live"
      : "estimated";

  const responses: Partial<Record<Planet, number>> = {};
  for (const planet of paired) {
    const aspect = detectAspect(natal[planet]!, sky[planet]!);
    responses[planet] = aspect
      ? ASPECT_RESPONSE[aspect.name] *
        Math.max(0, 1 - aspect.orb / aspect.definition.orb)
      : 0;
  }
  for (const key of ALL_VESSEL_STAT_KEYS) {
    const affinity = AFFINITIES[key];
    const totalAffinity = sum(Object.values(affinity));
    const response =
      totalAffinity > 0
        ? sum(
            PLANETS.map(
              (planet) =>
                (affinity[planet] ?? 0) * (responses[planet] ?? 0),
            ),
          ) / totalAffinity
        : 0;
    const sensitivity =
      0.75 +
      0.15 * affinityOverlap(affinity, AFFINITIES[input.character.primary]) +
      0.1 * affinityOverlap(affinity, AFFINITIES[input.character.secondary]);
    const scale = isSacred(key) ? 74 : 100;
    const delta = response * sensitivity * (8 / 74) * scale;
    result.statDeltas[key] =
      clamp(
        input.stats[key] + delta,
        isSacred(key) ? 25 : 0,
        isSacred(key) ? 99 : 100,
      ) - input.stats[key];
  }
  const changed: VesselStats = zeroDeltas();
  for (const key of ALL_VESSEL_STAT_KEYS) {
    changed[key] = input.stats[key] + result.statDeltas[key];
  }
  const transitDelta = clamp(overall(changed) - baseOverall, -8, 8);
  result.currentOverall = clamp(trainedOverall + transitDelta, 25, 99);
  return result;
}
