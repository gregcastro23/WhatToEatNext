/**
 * Alchemical Constitution — a user's four ESMS reserves and their archetype.
 *
 * The quantities (Spirit/Essence/Matter/Substance) come from which planets a
 * chart contains, plus sect, dignity and aspects. They CANNOT be derived from
 * the chart's elemental balance (Fire/Water/Earth/Air), which is a separate,
 * orthogonal reading taken from the signs those planets occupy — see the header
 * of `./planetaryAlchemyMapping.ts`, the authoritative source.
 *
 * Consumers pass the ESMS that `calculateNatalChart` already derives into
 * `alchemicalProperties`; this module only normalizes and interprets them.
 */

import type { AlchemicalProperties } from "@/types/celestial";

export const ESMS_KEYS = ["spirit", "essence", "matter", "substance"] as const;
export type EsmsKey = (typeof ESMS_KEYS)[number];

export type EsmsShares = Record<EsmsKey, number>;

export const ARCHETYPE_BY_QUANTITY: Record<EsmsKey, string> = {
  spirit: "Solar Forager",
  essence: "Lunar Adept",
  matter: "Root Alchemist",
  substance: "Wind Whisperer",
};

/**
 * Population baseline for each quantity's share of the chart total, per sect.
 *
 * ESMS comes from which planets are present, and every natal chart contains all
 * ten — so within a sect the shares are near-constant (sd < 0.6 points), while
 * the two sects differ sharply (day ~32/49/9/9, night ~14/16/47/22). Taking the
 * raw maximum would therefore hand every day-born user "Lunar Adept" and every
 * night-born user "Root Alchemist", and leave two archetypes unreachable:
 * Essence draws on 7 planets and Matter on 6, but Spirit on only 4 and
 * Substance on only 2, so those two can never win on raw share.
 *
 * Scoring each quantity against its own sect baseline instead makes the
 * archetype reflect what is genuinely distinctive about the chart.
 *
 * Derived by sampling 20,000 uniform-random charts per sect through
 * `calculateEnhancedAlchemicalFromPlanets`. Regenerate if PLANETARY_ALCHEMY,
 * PLANETARY_SECTARIAN_ESMS, or the dignity scales change.
 */
export const ESMS_BASELINE: Record<
  "diurnal" | "nocturnal",
  Record<EsmsKey, { mean: number; sd: number }>
> = {
  diurnal: {
    spirit: { mean: 32.41, sd: 0.55 },
    essence: { mean: 48.79, sd: 0.57 },
    matter: { mean: 9.4, sd: 0.11 },
    substance: { mean: 9.4, sd: 0.11 },
  },
  nocturnal: {
    spirit: { mean: 14.22, sd: 0.26 },
    essence: { mean: 16.28, sd: 0.39 },
    matter: { mean: 47.38, sd: 0.57 },
    substance: { mean: 22.12, sd: 0.44 },
  },
};

/**
 * Normalize raw planetary ESMS sums to each quantity's percentage share of the
 * chart total. Returns exact (unrounded) shares — round only for display, and
 * never before {@link selectArchetype}, whose baselines have an sd well under
 * one point.
 */
export function toEsmsShares(esms: AlchemicalProperties): EsmsShares {
  const total = esms.Spirit + esms.Essence + esms.Matter + esms.Substance;
  const share = (value: number) => (total > 0 ? (value / total) * 100 : 0);
  return {
    spirit: share(esms.Spirit),
    essence: share(esms.Essence),
    matter: share(esms.Matter),
    substance: share(esms.Substance),
  };
}

/**
 * Pick the archetype for a chart: the quantity standing furthest above its sect
 * baseline wins. Ties resolve to the earlier key in {@link ESMS_KEYS}.
 *
 * @param shares - exact ESMS shares from {@link toEsmsShares}
 * @param diurnal - true for a day chart, false for a night chart
 */
export function selectArchetype(
  shares: EsmsShares,
  diurnal: boolean,
): { dominantToken: EsmsKey; baseArchetype: string; z: number } {
  const baseline = ESMS_BASELINE[diurnal ? "diurnal" : "nocturnal"];

  let dominantToken: EsmsKey = "spirit";
  let bestZ = -Infinity;
  for (const key of ESMS_KEYS) {
    const { mean, sd } = baseline[key];
    const z = sd > 0 ? (shares[key] - mean) / sd : 0;
    if (z > bestZ) {
      bestZ = z;
      dominantToken = key;
    }
  }

  return {
    dominantToken,
    baseArchetype: ARCHETYPE_BY_QUANTITY[dominantToken],
    z: bestZ,
  };
}
