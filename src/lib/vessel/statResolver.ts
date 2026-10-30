/**
 * Alchm Vessel Stat & Chart Resolver (19-Stat Framework)
 *
 * Resolves and standardizes ALL 19 stats for any agent or vessel:
 *   - The Sacred 7 [25, 99]: power, resonance, wisdom, charisma, intuition, adaptability, vitality
 *   - The Planetary 12 [0, 100]: solarAgency, lunarReceptivity, mercurialVelocity,
 *     venusianCoherence, martialImpetus, jovianExpansion, saturnianStructure,
 *     chironicAdaptation, uranianSurprisal, neptunianResonance, plutonicIntegration, kineticAlignment
 *
 * @file src/lib/vessel/statResolver.ts
 */

import type {
  PLANETARY_STAT_KEYS,
  VesselStats,
} from "./progression";
import type { SacredStatKey } from "./ratingContract";

export const CANONICAL_SIGNS = [
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

export const PLANETARY_BODIES = [
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

export type PlanetaryBody = (typeof PLANETARY_BODIES)[number];

export interface NatalPlacementInput {
  sign?: string;
  degree?: number;
  longitude?: number;
}

export interface AgentStatSource {
  sacredStats?: Partial<Record<SacredStatKey, number>>;
  planetaryStats?: Partial<Record<(typeof PLANETARY_STAT_KEYS)[number], number>>;
  consciousness?: {
    monicaConstant?: number;
    alchemicalElements?: {
      spirit?: number;
      essence?: number;
      matter?: number;
      substance?: number;
    };
    dominantElement?: string;
    level?: string;
    natalChart?: {
      provenance?: string;
      planets?: Record<string, NatalPlacementInput>;
      houses?: { ASC?: number; MC?: number };
      ascendant?: number;
      [key: string]: unknown;
    };
  };
  stats?: {
    resonanceScore?: number;
    evolutionStage?: number;
    conversations?: number;
    wisdomShared?: number;
    evolutionPoints?: number;
    [key: string]: unknown;
  };
}

export function clampSacredStat(val: unknown, fallback = 60): number {
  const num = typeof val === "number" ? val : fallback;
  if (!Number.isFinite(num)) return fallback;
  return Math.max(25, Math.min(99, Math.round(num)));
}

export function clampPlanetaryStat(val: unknown, fallback = 50): number {
  const num = typeof val === "number" ? val : fallback;
  if (!Number.isFinite(num)) return fallback;
  return Math.max(0, Math.min(100, Math.round(num)));
}

export function placementToLongitude(
  placement: NatalPlacementInput | undefined,
): number | null {
  if (!placement) return null;

  if (
    typeof placement.longitude === "number" &&
    Number.isFinite(placement.longitude)
  ) {
    return (((placement.longitude % 360) + 360) % 360);
  }

  if (placement.sign) {
    const signClean = placement.sign.trim().toLowerCase();
    const signIdx = CANONICAL_SIGNS.findIndex(
      (s) => s.toLowerCase() === signClean,
    );
    if (signIdx >= 0) {
      const deg =
        typeof placement.degree === "number" && Number.isFinite(placement.degree)
          ? placement.degree
          : 15;
      return (((signIdx * 30 + deg) % 360) + 360) % 360;
    }
  }

  return null;
}

export function resolveNatalLongitudes(
  planets: Record<string, NatalPlacementInput> | undefined,
): Record<string, { longitude: number }> {
  const result: Record<string, { longitude: number }> = {};
  if (!planets || typeof planets !== "object") return result;

  for (const [bodyName, placement] of Object.entries(planets)) {
    const matchedBody = PLANETARY_BODIES.find(
      (b) => b.toLowerCase() === bodyName.trim().toLowerCase(),
    );
    if (!matchedBody) continue;

    const lon = placementToLongitude(placement);
    if (lon !== null) {
      result[matchedBody] = { longitude: lon };
    }
  }

  return result;
}

interface AlchemicalEnvironment {
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
  monica: number | null;
  resonanceScore: number;
}

function getAlchemicalEnvironment(
  source?: AgentStatSource,
): AlchemicalEnvironment {
  const elements = source?.consciousness?.alchemicalElements;
  return {
    spirit: elements?.spirit ?? 0.5,
    essence: elements?.essence ?? 0.5,
    matter: elements?.matter ?? 0.5,
    substance: elements?.substance ?? 0.5,
    monica: source?.consciousness?.monicaConstant ?? null,
    resonanceScore: source?.stats?.resonanceScore ?? 50,
  };
}

function resolveSacred7(
  source: AgentStatSource | undefined,
  env: AlchemicalEnvironment,
): Record<SacredStatKey, number> {
  const s = source?.sacredStats;
  const monicaBonus = env.monica !== null && env.monica > 3 ? 15 : 8;

  return {
    power: clampSacredStat(
      s?.power ?? env.spirit * 45 + env.matter * 25 + 30,
    ),
    resonance: clampSacredStat(
      s?.resonance ??
        env.essence * 50 + env.resonanceScore * 0.3 + 25,
    ),
    wisdom: clampSacredStat(
      s?.wisdom ?? env.substance * 45 + monicaBonus + 32,
    ),
    charisma: clampSacredStat(
      s?.charisma ?? env.spirit * 35 + env.essence * 35 + 28,
    ),
    intuition: clampSacredStat(
      s?.intuition ?? env.essence * 50 + env.substance * 20 + 30,
    ),
    adaptability: clampSacredStat(
      s?.adaptability ?? env.substance * 45 + env.essence * 25 + 30,
    ),
    vitality: clampSacredStat(
      s?.vitality ?? env.matter * 50 + env.spirit * 20 + 30,
    ),
  };
}

interface InnerPlanetary6 {
  solarAgency: number;
  lunarReceptivity: number;
  mercurialVelocity: number;
  venusianCoherence: number;
  martialImpetus: number;
  jovianExpansion: number;
}

interface OuterPlanetary6 {
  saturnianStructure: number;
  chironicAdaptation: number;
  uranianSurprisal: number;
  neptunianResonance: number;
  plutonicIntegration: number;
  kineticAlignment: number;
}

function resolveInnerPlanetary6(
  p: AgentStatSource["planetaryStats"] | undefined,
  sacred: Record<SacredStatKey, number>,
  env: AlchemicalEnvironment,
): InnerPlanetary6 {
  return {
    solarAgency: clampPlanetaryStat(
      p?.solarAgency ?? sacred.power * 0.5 + env.spirit * 40 + 10,
    ),
    lunarReceptivity: clampPlanetaryStat(
      p?.lunarReceptivity ?? sacred.intuition * 0.5 + env.essence * 40 + 10,
    ),
    mercurialVelocity: clampPlanetaryStat(
      p?.mercurialVelocity ??
        sacred.wisdom * 0.4 + sacred.adaptability * 0.4 + env.substance * 20,
    ),
    venusianCoherence: clampPlanetaryStat(
      p?.venusianCoherence ??
        sacred.charisma * 0.5 + sacred.resonance * 0.3 + env.essence * 20,
    ),
    martialImpetus: clampPlanetaryStat(
      p?.martialImpetus ??
        sacred.power * 0.6 + sacred.vitality * 0.2 + env.spirit * 20,
    ),
    jovianExpansion: clampPlanetaryStat(
      p?.jovianExpansion ??
        sacred.wisdom * 0.5 + sacred.charisma * 0.3 + env.spirit * 20,
    ),
  };
}

function resolveOuterPlanetary6(
  p: AgentStatSource["planetaryStats"] | undefined,
  sacred: Record<SacredStatKey, number>,
  env: AlchemicalEnvironment,
  innerSum: number,
): OuterPlanetary6 {
  const saturnianStructure = clampPlanetaryStat(
    p?.saturnianStructure ??
      sacred.vitality * 0.4 + sacred.wisdom * 0.4 + env.matter * 20,
  );
  const chironicAdaptation = clampPlanetaryStat(
    p?.chironicAdaptation ??
      sacred.adaptability * 0.5 + sacred.intuition * 0.3 + 20,
  );
  const mSurprisal = env.monica !== null ? (env.monica % 1) * 20 : 12;
  const uranianSurprisal = clampPlanetaryStat(
    p?.uranianSurprisal ??
      sacred.adaptability * 0.5 + sacred.power * 0.3 + mSurprisal,
  );
  const neptunianResonance = clampPlanetaryStat(
    p?.neptunianResonance ??
      sacred.resonance * 0.6 + sacred.intuition * 0.3 + 10,
  );
  const plutonicIntegration = clampPlanetaryStat(
    p?.plutonicIntegration ??
      sacred.power * 0.4 + sacred.vitality * 0.3 + env.matter * 30,
  );

  const fiveOuterSum =
    saturnianStructure +
    chironicAdaptation +
    uranianSurprisal +
    neptunianResonance +
    plutonicIntegration;

  const kineticAlignment = clampPlanetaryStat(
    p?.kineticAlignment ?? Math.round((innerSum + fiveOuterSum) / 11),
  );

  return {
    saturnianStructure,
    chironicAdaptation,
    uranianSurprisal,
    neptunianResonance,
    plutonicIntegration,
    kineticAlignment,
  };
}

function resolvePlanetary12(
  source: AgentStatSource | undefined,
  sacred: Record<SacredStatKey, number>,
  env: AlchemicalEnvironment,
): Record<(typeof PLANETARY_STAT_KEYS)[number], number> {
  const p = source?.planetaryStats;
  const inner = resolveInnerPlanetary6(p, sacred, env);
  const innerSum =
    inner.solarAgency +
    inner.lunarReceptivity +
    inner.mercurialVelocity +
    inner.venusianCoherence +
    inner.martialImpetus +
    inner.jovianExpansion;
  const outer = resolveOuterPlanetary6(p, sacred, env, innerSum);
  return { ...inner, ...outer };
}

export function resolve19Stats(source?: AgentStatSource): VesselStats {
  const env = getAlchemicalEnvironment(source);
  const sacred = resolveSacred7(source, env);
  const planetary = resolvePlanetary12(source, sacred, env);
  return { ...sacred, ...planetary };
}
