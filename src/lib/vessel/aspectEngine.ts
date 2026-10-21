/**
 * Aspect geometry for the Celestial Vessel Progression Engine
 *
 * Provides exact angular separation, aspect definitions, and transit aspect
 * detection between natal placements and current celestial sky bodies.
 *
 * @file src/lib/vessel/aspectEngine.ts
 */

export type AspectName =
  | "Conjunction"
  | "Opposition"
  | "Trine"
  | "Square"
  | "Sextile"
  | "Quincunx"
  | "Semi-Sextile";

export type AspectQuality = "harmonious" | "dynamic" | "neutral";
export type AspectPhase = "applying" | "separating" | "exact" | "unknown";

export interface AspectDefinition {
  name: AspectName;
  angle: number;
  orb: number;
  quality: AspectQuality;
  major: boolean;
  color: string;
  verb: string;
}

export const ASPECT_DEFINITIONS: readonly AspectDefinition[] = [
  {
    name: "Conjunction",
    angle: 0,
    orb: 8,
    quality: "neutral",
    major: true,
    color: "#fbbf24",
    verb: "stands fused with",
  },
  {
    name: "Opposition",
    angle: 180,
    orb: 8,
    quality: "dynamic",
    major: true,
    color: "#ef4444",
    verb: "faces across the wheel from",
  },
  {
    name: "Trine",
    angle: 120,
    orb: 7,
    quality: "harmonious",
    major: true,
    color: "#38bdf8",
    verb: "flows in trine with",
  },
  {
    name: "Square",
    angle: 90,
    orb: 7,
    quality: "dynamic",
    major: true,
    color: "#f97316",
    verb: "grinds at right angles to",
  },
  {
    name: "Sextile",
    angle: 60,
    orb: 5,
    quality: "harmonious",
    major: true,
    color: "#a3e635",
    verb: "opens a sextile toward",
  },
  {
    name: "Quincunx",
    angle: 150,
    orb: 3,
    quality: "dynamic",
    major: false,
    color: "#a855f7",
    verb: "strains at an awkward angle to",
  },
  {
    name: "Semi-Sextile",
    angle: 30,
    orb: 2,
    quality: "neutral",
    major: false,
    color: "#94a3b8",
    verb: "brushes shoulders with",
  },
] as const;

export interface AspectHit {
  definition: AspectDefinition;
  name: AspectName;
  separation: number;
  orb: number;
  quality: AspectQuality;
  phase: AspectPhase;
}

export const SIGN_ORDER = [
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

export function signToLongitude(sign: string, degree: number): number {
  const idx = SIGN_ORDER.findIndex(
    (s) => s.toLowerCase() === (sign || "").toLowerCase(),
  );
  if (idx === -1) return degree;
  return (((idx * 30 + degree) % 360) + 360) % 360;
}

export function signedDelta(from: number, to: number): number {
  const raw = (((to - from) % 360) + 360) % 360;
  return raw > 180 ? raw - 360 : raw;
}

export function angularSeparation(degA: number, degB: number): number {
  const diff = Math.abs((((degA - degB) % 360) + 360) % 360);
  return diff > 180 ? 360 - diff : diff;
}

const EXACT_THRESHOLD = 0.25;

export function detectAspect(
  degA: number,
  degB: number,
  speedA?: number,
  speedB?: number,
): AspectHit | null {
  const separation = angularSeparation(degA, degB);

  let best: AspectHit | null = null;
  for (const definition of ASPECT_DEFINITIONS) {
    const orb = Math.abs(separation - definition.angle);
    if (orb > definition.orb) continue;
    if (best && orb >= best.orb) continue;
    best = {
      definition,
      name: definition.name,
      separation,
      orb,
      quality: definition.quality,
      phase: "exact",
    };
  }

  if (!best) return null;
  best.phase = resolvePhase(
    degA,
    degB,
    best.definition,
    best.orb,
    speedA,
    speedB,
  );
  return best;
}

function resolvePhase(
  degA: number,
  degB: number,
  definition: AspectDefinition,
  orb: number,
  speedA?: number,
  speedB?: number,
): AspectPhase {
  if (orb <= EXACT_THRESHOLD) return "exact";
  if (speedA === undefined || speedB === undefined) return "unknown";
  if (speedA === 0 && speedB === 0) return "separating";

  const dt = 0.001;
  const stepA = speedA * dt;
  const stepB = speedB * dt;
  const nextOrb = Math.abs(
    angularSeparation(degA + stepA, degB + stepB) - definition.angle,
  );
  return nextOrb < orb ? "applying" : "separating";
}
