/**
 * Sacred Stats Rating & Archetype Contract
 *
 * Defines the Sacred 7 stats scale [25, 99], Ordered Weighted Averaging (OWA)
 * OVR calculation, relative advantage archetypes, and canonical seals.
 *
 * @file src/lib/vessel/ratingContract.ts
 */

export const SACRED_STAT_KEYS = [
  "power",
  "resonance",
  "wisdom",
  "charisma",
  "intuition",
  "adaptability",
  "vitality",
] as const;

export type SacredStatKey = (typeof SACRED_STAT_KEYS)[number];
export type SacredStat = SacredStatKey;

export const ESMS_KEYS = ["spirit", "essence", "matter", "substance"] as const;
export type EsmsKey = (typeof ESMS_KEYS)[number];

export const SEAL_TIERS = [
  "Copper",
  "Silver",
  "Gold",
  "Astral",
  "Celestial",
] as const;
export type SealTier = (typeof SEAL_TIERS)[number];

export interface VesselArchetype {
  title: string;
  primary: SacredStatKey;
  secondary: SacredStatKey;
}

export interface AlchemicalSeal {
  id: string;
  name: string;
  category: EsmsKey | "general";
  tier: SealTier;
  description: string;
  statKey?: SacredStatKey;
  multiplier: number;
}

export const ROSTER_BASELINE_RATINGS: Record<
  SacredStatKey,
  { mean: number; baseline: number }
> = Object.freeze({
  power: { mean: 76.5, baseline: 63 },
  resonance: { mean: 67.0, baseline: 62 },
  wisdom: { mean: 68.5, baseline: 64 },
  charisma: { mean: 64.5, baseline: 61 },
  intuition: { mean: 66.0, baseline: 62 },
  adaptability: { mean: 67.5, baseline: 63 },
  vitality: { mean: 66.0, baseline: 62 },
});

export const CANONICAL_SEAL_CATALOG: Record<
  SacredStatKey,
  { name: string; category: EsmsKey; description: string }
> = Object.freeze({
  power: {
    name: "Crucible Finisher",
    category: "substance",
    description: "Channels raw material pressure into irresistible decisive force.",
  },
  intuition: {
    name: "Astral Vision",
    category: "spirit",
    description: "Pierces through veil illusions with sovereign foresight.",
  },
  vitality: {
    name: "Immovable Foundation",
    category: "matter",
    description: "Anchors vessel integrity against territorial disruption.",
  },
  charisma: {
    name: "Harmonic Sovereign",
    category: "essence",
    description: "Commands celestial resonance to align allied forces.",
  },
  resonance: {
    name: "Tidal Chorus",
    category: "essence",
    description: "Attunes with the ambient frequencies of celestial transits.",
  },
  adaptability: {
    name: "Quicksilver Pivot",
    category: "spirit",
    description: "Transmutes tactical posture across shifting court elements.",
  },
  wisdom: {
    name: "Philosopher's Stone",
    category: "matter",
    description: "Transforms accumulated experience into strategic mastery.",
  },
});

const ARCHETYPE_TITLE_MATRIX: Record<string, string> = {
  "power:vitality": "Juggernaut Anchor",
  "power:resonance": "Kinetic Resonator",
  "power:wisdom": "Celestial Mechanist",
  "power:charisma": "Dominant Commander",
  "power:intuition": "Instinctive Striker",
  "power:adaptability": "Dynamic Breaker",

  "resonance:intuition": "Harmonic Seer",
  "resonance:wisdom": "Synthesizing Sage",
  "resonance:power": "Astral Striker",
  "resonance:charisma": "Symphonic Virtuoso",
  "resonance:adaptability": "Fluid Harmonizer",
  "resonance:vitality": "Resilient Prism",

  "wisdom:power": "Celestial Mechanist",
  "wisdom:adaptability": "Polymath Craftsman",
  "wisdom:resonance": "Universal Theorist",
  "wisdom:intuition": "Illuminated Sage",
  "wisdom:charisma": "Enlightened Statesman",
  "wisdom:vitality": "Ancient Pillar",

  "charisma:power": "Apex Sovereign",
  "charisma:wisdom": "Inspiring Luminary",
  "charisma:intuition": "Magnetic Visionary",
  "charisma:resonance": "Resonant Herald",
  "charisma:adaptability": "Charismatic Catalyst",
  "charisma:vitality": "Indomitable Leader",

  "intuition:resonance": "Reclusive Visionary",
  "intuition:wisdom": "Mystic Oracle",
  "intuition:power": "Prescient Ingressor",
  "intuition:charisma": "Prophetic Guide",
  "intuition:adaptability": "Intuitive Shifter",
  "intuition:vitality": "Eternal Vigilant",

  "adaptability:wisdom": "Polymath Craftsman",
  "adaptability:intuition": "Quicksilver Weaver",
  "adaptability:power": "Tactical Marauder",
  "adaptability:resonance": "Harmonic Pivot",
  "adaptability:charisma": "Diplomatic Emissary",
  "adaptability:vitality": "Unshakable Survivor",

  "vitality:power": "Ironbound Guardian",
  "vitality:wisdom": "Enduring Sentinel",
  "vitality:resonance": "Stalwart Conduit",
  "vitality:intuition": "Steadfast Bastion",
  "vitality:charisma": "Tenacious Champion",
  "vitality:adaptability": "Adaptive Fortress",
};

export function clampStat(val: number): number {
  if (Number.isNaN(val) || !Number.isFinite(val)) return 25;
  return Math.max(25, Math.min(99, Math.round(val)));
}

export function computeOvr(
  ratings: Record<SacredStatKey, number>,
  options?: { divisor?: number },
): number {
  const sorted = SACRED_STAT_KEYS.map((k) =>
    clampStat(ratings[k] ?? 25),
  ).sort((a, b) => b - a);

  const top1 = sorted[0] ?? 25;
  const top2 = sorted[1] ?? 25;
  const restAvg = sorted.slice(2).reduce((acc, v) => acc + v, 0) / 5;

  const weightedSum = top1 * 1.6 + top2 * 1.3 + restAvg * 1.0;
  const totalWeight = options?.divisor ?? 3.9;

  return clampStat(Math.round(weightedSum / totalWeight));
}

export function computeRelativeAdvantage(
  ratings: Record<SacredStatKey, number>,
): Record<SacredStatKey, number> {
  const res: Record<SacredStatKey, number> = {
    power: 0,
    resonance: 0,
    wisdom: 0,
    charisma: 0,
    intuition: 0,
    adaptability: 0,
    vitality: 0,
  };
  for (const key of SACRED_STAT_KEYS) {
    const raw = clampStat(ratings[key] ?? 25);
    const base = ROSTER_BASELINE_RATINGS[key]?.baseline ?? 62;
    res[key] = Math.round((raw - base) * 10) / 10;
  }
  return res;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function resolveArchetype(
  relativeAdvantage: Record<SacredStatKey, number>,
): VesselArchetype {
  const sorted = [...SACRED_STAT_KEYS].sort((a, b) => {
    const delta = (relativeAdvantage[b] ?? 0) - (relativeAdvantage[a] ?? 0);
    if (delta !== 0) return delta;
    return SACRED_STAT_KEYS.indexOf(a) - SACRED_STAT_KEYS.indexOf(b);
  });

  const primary = sorted[0] ?? "power";
  const secondary = sorted[1] ?? "wisdom";
  const key = `${primary}:${secondary}`;
  const title =
    ARCHETYPE_TITLE_MATRIX[key] ||
    `${capitalize(primary)}-${capitalize(secondary)} Specialist`;

  return { title, primary, secondary };
}
