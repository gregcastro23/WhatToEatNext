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
  sacredStats?: Partial<Record<SacredStatKey, number>> | undefined;
  planetaryStats?: Partial<Record<(typeof PLANETARY_STAT_KEYS)[number], number>> | undefined;
  consciousness?: {
    monicaConstant?: number | undefined;
    alchemicalElements?: {
      spirit?: number | undefined;
      essence?: number | undefined;
      matter?: number | undefined;
      substance?: number | undefined;
    } | undefined;
    dominantElement?: string | undefined;
    level?: string | undefined;
    natalChart?: {
      provenance?: string | undefined;
      planets?: Record<string, NatalPlacementInput> | undefined;
      houses?: { ASC?: number | undefined; MC?: number | undefined } | undefined;
      ascendant?: number | undefined;
      [key: string]: unknown;
    } | undefined;
  } | undefined;
  stats?: {
    resonanceScore?: number | undefined;
    evolutionStage?: number | undefined;
    conversations?: number | undefined;
    wisdomShared?: number | undefined;
    evolutionPoints?: number | undefined;
    [key: string]: unknown;
  } | undefined;
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

export function resolve19Stats(source?: AgentStatSource): VesselStats {
  const sacredSource = source?.sacredStats ?? {};
  const planetarySource = source?.planetaryStats ?? {};
  const elements = source?.consciousness?.alchemicalElements ?? {};
  const spirit = elements.spirit ?? 0.5;
  const essence = elements.essence ?? 0.5;
  const matter = elements.matter ?? 0.5;
  const substance = elements.substance ?? 0.5;
  const monica = source?.consciousness?.monicaConstant ?? 1.618;

  // 1. Resolve Sacred 7 [25, 99]
  const power = clampSacredStat(
    sacredSource.power ?? spirit * 45 + matter * 25 + 30,
  );
  const resonance = clampSacredStat(
    sacredSource.resonance ??
      essence * 50 + (source?.stats?.resonanceScore ?? 50) * 0.3 + 25,
  );
  const wisdom = clampSacredStat(
    sacredSource.wisdom ?? substance * 45 + (monica > 3 ? 15 : 8) + 32,
  );
  const charisma = clampSacredStat(
    sacredSource.charisma ?? spirit * 35 + essence * 35 + 28,
  );
  const intuition = clampSacredStat(
    sacredSource.intuition ?? essence * 50 + substance * 20 + 30,
  );
  const adaptability = clampSacredStat(
    sacredSource.adaptability ?? substance * 45 + essence * 25 + 30,
  );
  const vitality = clampSacredStat(
    sacredSource.vitality ?? matter * 50 + spirit * 20 + 30,
  );

  // 2. Resolve Planetary 12 [0, 100]
  const solarAgency = clampPlanetaryStat(
    planetarySource.solarAgency ?? power * 0.5 + spirit * 40 + 10,
  );
  const lunarReceptivity = clampPlanetaryStat(
    planetarySource.lunarReceptivity ?? intuition * 0.5 + essence * 40 + 10,
  );
  const mercurialVelocity = clampPlanetaryStat(
    planetarySource.mercurialVelocity ??
      wisdom * 0.4 + adaptability * 0.4 + substance * 20,
  );
  const venusianCoherence = clampPlanetaryStat(
    planetarySource.venusianCoherence ??
      charisma * 0.5 + resonance * 0.3 + essence * 20,
  );
  const martialImpetus = clampPlanetaryStat(
    planetarySource.martialImpetus ??
      power * 0.6 + vitality * 0.2 + spirit * 20,
  );
  const jovianExpansion = clampPlanetaryStat(
    planetarySource.jovianExpansion ??
      wisdom * 0.5 + charisma * 0.3 + spirit * 20,
  );
  const saturnianStructure = clampPlanetaryStat(
    planetarySource.saturnianStructure ??
      vitality * 0.4 + wisdom * 0.4 + matter * 20,
  );
  const chironicAdaptation = clampPlanetaryStat(
    planetarySource.chironicAdaptation ??
      adaptability * 0.5 + intuition * 0.3 + 20,
  );
  const uranianSurprisal = clampPlanetaryStat(
    planetarySource.uranianSurprisal ??
      adaptability * 0.5 + power * 0.3 + (monica % 1) * 20,
  );
  const neptunianResonance = clampPlanetaryStat(
    planetarySource.neptunianResonance ??
      resonance * 0.6 + intuition * 0.3 + 10,
  );
  const plutonicIntegration = clampPlanetaryStat(
    planetarySource.plutonicIntegration ??
      power * 0.4 + vitality * 0.3 + matter * 30,
  );

  const kineticAlignment = clampPlanetaryStat(
    planetarySource.kineticAlignment ??
      Math.round(
        (solarAgency +
          lunarReceptivity +
          mercurialVelocity +
          venusianCoherence +
          martialImpetus +
          jovianExpansion +
          saturnianStructure +
          chironicAdaptation +
          uranianSurprisal +
          neptunianResonance +
          plutonicIntegration) /
          11,
      ),
  );

  return {
    power,
    resonance,
    wisdom,
    charisma,
    intuition,
    adaptability,
    vitality,
    solarAgency,
    lunarReceptivity,
    mercurialVelocity,
    venusianCoherence,
    martialImpetus,
    jovianExpansion,
    saturnianStructure,
    chironicAdaptation,
    uranianSurprisal,
    neptunianResonance,
    plutonicIntegration,
    kineticAlignment,
  };
}
