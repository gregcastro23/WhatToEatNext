// src/constants/alchemicalPillars.ts

import { seasonalElements } from "@/data/seasons";
import type { Season, ElementalProperties, QuantityScaledProperties } from "@/types/alchemy";
import type { AlchemicalProperty, Element, LunarPhase} from "@/types/celestial";
import { zodiacElements } from "@/types/zodiac";

/**
 * Interface representing an Alchemical Pillar
 * Each pillar defines a specific transformation of alchemical properties
 */
export interface AlchemicalPillar {
  id: number;
  name: string;
  description: string;
  effects: {
    Spirit: number; // Effect on Spirit (-1 = decrease, 0 = neutral, 1 = increase)
    Essence: number; // Effect on Essence
    Matter: number; // Effect on Matter
    Substance: number; // Effect on Substance
  };
  // Adding planetary and tarot associations
  planetaryAssociations?: string[]; // Associated planets
  tarotAssociations?: string[]; // Associated tarot cards
  elementalAssociations?: {
    // Associated elemental character
    primary: Element; // Primary element associated with the pillar
    secondary?: Element; // Secondary element (if applicable)
  };
}

/**
 * The fundamental elemental nature of alchemical properties
 * Based on core principles of the alchemizer engine
 */
export const _ALCHEMICAL_PROPERTY_ELEMENTS = {
  Spirit: { primary: "Fire", secondary: "Air" }, // Spirit exists between Fire and Air
  Essence: { primary: "Fire", secondary: "Water" }, // Essence exists between Fire and Water
  Matter: { primary: "Earth", secondary: "Water" }, // Matter exists between Earth and Water
  Substance: { primary: "Air", secondary: "Earth" }, // Substance exists between Air and Earth
};

/**
 * The 14 Alchemical Pillars representing ways in which the four
 * fundamental alchemical properties (Spirit, Essence, Matter, Substance)
 * are transformed during alchemical processes
 */
export const ALCHEMICAL_PILLARS: AlchemicalPillar[] = [
  {
    id: 1,
    name: "Solution",
    description:
      "The process of dissolving a solid in a liquid, increasing Essence and Matter while decreasing Spirit and Substance",
    effects: {
      Spirit: -1,
      Essence: 1,
      Matter: 1,
      Substance: -1,
    },
    planetaryAssociations: ["Moon", "Neptune"],
    tarotAssociations: ["2 of Cups", "Queen of Cups"],
    elementalAssociations: {
      primary: "Water",
      secondary: "Earth",
    },
  },
  {
    id: 2,
    name: "Filtration",
    description:
      "The separation of solids from liquids, increasing Essence, Spirit, and Substance while decreasing Matter",
    effects: {
      Spirit: 1,
      Essence: 1,
      Matter: -1,
      Substance: 1,
    },
    planetaryAssociations: ["Mercury", "Saturn"],
    tarotAssociations: ["8 of Pentacles", "Temperance"],
    elementalAssociations: {
      primary: "Air",
      secondary: "Water",
    },
  },
  {
    id: 3,
    name: "Evaporation",
    description:
      "The transition from liquid to gaseous state, increasing Essence and Spirit while decreasing Matter and Substance",
    effects: {
      Spirit: 1,
      Essence: 1,
      Matter: -1,
      Substance: -1,
    },
    planetaryAssociations: ["Mercury", "Uranus"],
    tarotAssociations: ["6 of Swords", "8 of Wands"],
    elementalAssociations: {
      primary: "Air",
      secondary: "Fire",
    },
  },
  {
    id: 4,
    name: "Distillation",
    description:
      "The purification of liquids through evaporation and condensation, increasing Essence, Spirit, and Substance while decreasing Matter",
    effects: {
      Spirit: 1,
      Essence: 1,
      Matter: -1,
      Substance: 1,
    },
    planetaryAssociations: ["Mercury", "Neptune"],
    tarotAssociations: ["Temperance", "The Star"],
    elementalAssociations: {
      primary: "Water",
      secondary: "Air",
    },
  },
  {
    id: 5,
    name: "Separation",
    description:
      "The division of a substance into its constituents, increasing Essence, Matter, and Spirit while decreasing Substance",
    effects: {
      Spirit: 1,
      Essence: 1,
      Matter: 1,
      Substance: -1,
    },
    planetaryAssociations: ["Mercury", "Uranus", "Pluto"],
    tarotAssociations: ["2 of Swords", "The Tower"],
    elementalAssociations: {
      primary: "Fire",
      secondary: "Water",
    },
  },
  {
    id: 6,
    name: "Rectification",
    description:
      "The refinement and purification of all elements, increasing all alchemical properties",
    effects: {
      Spirit: 1,
      Essence: 1,
      Matter: 1,
      Substance: 1,
    },
    planetaryAssociations: ["Sun", "Jupiter"],
    tarotAssociations: ["The World", "The Star"],
    elementalAssociations: {
      primary: "Fire",
    },
  },
  {
    id: 7,
    name: "Calcination",
    description:
      "The reduction of a substance through intense heat, increasing Essence and Matter while decreasing Spirit and Substance",
    effects: {
      Spirit: -1,
      Essence: 1,
      Matter: 1,
      Substance: -1,
    },
    planetaryAssociations: ["Mars", "Saturn"],
    tarotAssociations: ["Tower", "King of Wands"],
    elementalAssociations: {
      primary: "Fire",
      secondary: "Earth",
    },
  },
  {
    id: 8,
    name: "Comixion",
    description:
      "The thorough mixing of substances, increasing Matter, Spirit, and Substance while decreasing Essence",
    effects: {
      Spirit: 1,
      Essence: -1,
      Matter: 1,
      Substance: 1,
    },
    planetaryAssociations: ["Venus", "Jupiter", "Pluto"],
    tarotAssociations: ["3 of Cups", "10 of Pentacles"],
    elementalAssociations: {
      primary: "Earth",
      secondary: "Air",
    },
  },
  {
    id: 9,
    name: "Purification",
    description:
      "The removal of impurities, increasing Essence and Spirit while decreasing Matter and Substance",
    effects: {
      Spirit: 1,
      Essence: 1,
      Matter: -1,
      Substance: -1,
    },
    planetaryAssociations: ["Mercury", "Neptune", "Moon"],
    tarotAssociations: ["The Hermit", "Temperance"],
    elementalAssociations: {
      primary: "Fire",
      secondary: "Air",
    },
  },
  {
    id: 10,
    name: "Inhibition",
    description:
      "The restraint of reactive processes, increasing Matter and Substance while decreasing Essence and Spirit",
    effects: {
      Spirit: -1,
      Essence: -1,
      Matter: 1,
      Substance: 1,
    },
    planetaryAssociations: ["Saturn", "Pluto"],
    tarotAssociations: ["4 of Pentacles", "The Hanged Man"],
    elementalAssociations: {
      primary: "Earth",
      secondary: "Water",
    },
  },
  {
    id: 11,
    name: "Fermentation",
    description:
      "The transformation through microbial action, increasing Essence, Matter, and Spirit while decreasing Substance",
    effects: {
      Spirit: 1,
      Essence: 1,
      Matter: 1,
      Substance: -1,
    },
    planetaryAssociations: ["Pluto", "Jupiter", "Mars"],
    tarotAssociations: ["Death", "Wheel of Fortune"],
    elementalAssociations: {
      primary: "Water",
      secondary: "Fire",
    },
  },
  {
    id: 12,
    name: "Fixation",
    description:
      "The stabilization of volatile substances, increasing Matter and Substance while decreasing Essence and Spirit",
    effects: {
      Spirit: -1,
      Essence: -1,
      Matter: 1,
      Substance: 1,
    },
    planetaryAssociations: ["Saturn", "Venus"],
    tarotAssociations: ["4 of Pentacles", "King of Pentacles"],
    elementalAssociations: {
      primary: "Earth",
      secondary: "Air",
    },
  },
  {
    id: 13,
    name: "Multiplication",
    description:
      "The amplification of alchemical virtues, increasing Essence, Matter, and Spirit while decreasing Substance",
    effects: {
      Spirit: 1,
      Essence: 1,
      Matter: 1,
      Substance: -1,
    },
    planetaryAssociations: ["Jupiter", "Sun", "Uranus"],
    tarotAssociations: ["The Sun", "3 of Wands"],
    elementalAssociations: {
      primary: "Fire",
      secondary: "Water",
    },
  },
  {
    id: 14,
    name: "Protection",
    description:
      "The culminating transformation that protects and stabilizes, increasing all alchemical properties",
    effects: {
      Spirit: 1,
      Essence: 1,
      Matter: 1,
      Substance: 1,
    },
    planetaryAssociations: ["Sun", "Moon", "Mercury", "Jupiter"],
    tarotAssociations: ["The World", "The Magician"],
    elementalAssociations: {
      primary: "Fire",
      secondary: "Earth",
    },
  },
];

/**
 * Maps cooking methods to their corresponding alchemical pillars
 */
export const COOKING_METHOD_PILLAR_MAPPING = {
  // Wet Cooking Methods
  boiling: 1, // Solution
  steaming: 3, // Evaporation
  poaching: 1, // Solution
  simmering: 1, // Solution
  braising: 11, // Fermentation (slow transformation)
  stewing: 11, // Fermentation (slow transformation)
  sous_vide: 12, // Fixation (stabilizing at fixed temperature)
  // Dry Cooking Methods
  baking: 7, // Calcination
  roasting: 7, // Calcination
  broiling: 7, // Calcination
  grilling: 7, // Calcination
  frying: 7, // Calcination
  sauteing: 5, // Separation
  "stir-frying": 5, // Separation

  // Transformation Methods
  fermenting: 11, // Fermentation
  pickling: 11, // Fermentation
  curing: 12, // Fixation
  smoking: 13, // Multiplication
  drying: 3, // Evaporation

  // Modern/Molecular Methods
  spherification: 6, // Rectification
  emulsification: 8, // Comixion
  gelification: 12, // Fixation
  foam: 3, // Evaporation
  cryo_cooking: 10, // Inhibition

  // No-heat Methods
  raw: 9, // Purification
  ceviche: 1, // Solution
  marinating: 4, // Distillation (flavor extraction)
};

/**
 * Maps elements to their thermodynamic properties
 */
export const ELEMENTAL_THERMODYNAMIC_PROPERTIES: Record<
  Element,
  {
    heat: number;
    entropy: number;
    reactivity: number;
  }
> = {
  Fire: { heat: 1.0, entropy: 0.7, reactivity: 0.8 },
  Air: { heat: 0.3, entropy: 0.9, reactivity: 0.7 },
  Water: { heat: 0.1, entropy: 0.4, reactivity: 0.6 },
  Earth: { heat: 0.2, entropy: 0.1, reactivity: 0.2 },
};

/**
 * Maps planets to their alchemical effects based on day/night status
 * Values represent the contribution to each alchemical property
 */
export const PLANETARY_ALCHEMICAL_EFFECTS: Record<
  string,
  {
    diurnal: Record<AlchemicalProperty, number>;
    nocturnal: Record<AlchemicalProperty, number>;
  }
> = {
  Sun: {
    diurnal: { Spirit: 1, Essence: 0, Matter: 0, Substance: 0 },
    nocturnal: { Spirit: 0.8, Essence: 0.2, Matter: 0, Substance: 0 },
  },
  Moon: {
    diurnal: { Spirit: 0, Essence: 0.7, Matter: 0.3, Substance: 0 },
    nocturnal: { Spirit: 0, Essence: 1, Matter: 0, Substance: 0 },
  },
  Mercury: {
    diurnal: { Spirit: 0.7, Essence: 0, Matter: 0, Substance: 0.3 },
    nocturnal: { Spirit: 0.3, Essence: 0, Matter: 0.3, Substance: 0.4 },
  },
  Venus: {
    diurnal: { Spirit: 0, Essence: 0.6, Matter: 0.4, Substance: 0 },
    nocturnal: { Spirit: 0, Essence: 0.4, Matter: 0.6, Substance: 0 },
  },
  Mars: {
    diurnal: { Spirit: 0.3, Essence: 0.4, Matter: 0.3, Substance: 0 },
    nocturnal: { Spirit: 0.2, Essence: 0.2, Matter: 0.6, Substance: 0 },
  },
  Jupiter: {
    diurnal: { Spirit: 0.6, Essence: 0.4, Matter: 0, Substance: 0 },
    nocturnal: { Spirit: 0.3, Essence: 0.3, Matter: 0.4, Substance: 0 },
  },
  Saturn: {
    diurnal: { Spirit: 0.4, Essence: 0, Matter: 0.6, Substance: 0 },
    nocturnal: { Spirit: 0.2, Essence: 0, Matter: 0, Substance: 0.8 },
  },
  Uranus: {
    diurnal: { Spirit: 0.4, Essence: 0.2, Matter: 0, Substance: 0.4 },
    nocturnal: { Spirit: 0.3, Essence: 0.3, Matter: 0, Substance: 0.4 },
  },
  Neptune: {
    diurnal: { Spirit: 0.2, Essence: 0.6, Matter: 0, Substance: 0.2 },
    nocturnal: { Spirit: 0, Essence: 0.5, Matter: 0, Substance: 0.5 },
  },
  Pluto: {
    diurnal: { Spirit: 0, Essence: 0.3, Matter: 0.7, Substance: 0 },
    nocturnal: { Spirit: 0, Essence: 0.3, Matter: 0.3, Substance: 0.4 },
  },
};

/**
 * Maps tarot suits to their alchemical property contributions
 */
export const _TAROT_SUIT_ALCHEMICAL_MAPPING: Record<
  string,
  Record<AlchemicalProperty, number>
> = {
  Wands: { Spirit: 0.7, Essence: 0.2, Matter: 0.1, Substance: 0 },
  Cups: { Spirit: 0.1, Essence: 0.7, Matter: 0, Substance: 0.2 },
  Swords: { Spirit: 0.3, Essence: 0, Matter: 0, Substance: 0.7 },
  Pentacles: { Spirit: 0, Essence: 0.2, Matter: 0.7, Substance: 0.1 },
};

/**
 * Get the alchemical pillar associated with a cooking method
 * @param cookingMethod The cooking method to map
 * @returns The corresponding alchemical pillar or undefined if not mapped
 */
export function getCookingMethodPillar(
  cookingMethod: string,
): AlchemicalPillar | undefined {
  // `COOKING_METHOD_PILLAR_MAPPING` is a literal-keyed object; view it through
  // a bounds-checked `Record` for the dynamic lookup below (same pattern used
  // in monicaKalchmCalculations.ts).
  const pillarMapping: Record<string, number> = COOKING_METHOD_PILLAR_MAPPING;
  const pillerId = pillarMapping[cookingMethod.toLowerCase()];
  if (!pillerId) return undefined;
  return ALCHEMICAL_PILLARS.find((pillar) => pillar.id === pillerId);
}

/**
 * Calculate the alchemical effect of a cooking method
 * @param cookingMethod The cooking method
 * @returns The effect on alchemical properties or null if method not recognized
 */
export function getCookingMethodAlchemicalEffect(
  cookingMethod: string,
): Record<AlchemicalProperty, number> | null {
  const pillar = getCookingMethodPillar(cookingMethod);
  if (!pillar) return null;

  return pillar.effects;
}

/**
 * Calculate the thermodynamic properties of a cooking method based on its elemental associations
 * @param cookingMethod The cooking method
 * @returns Thermodynamic properties (heat, entropy, reactivity) or null if method not recognized
 */
export function getCookingMethodThermodynamics(cookingMethod: string): {
  heat: number;
  entropy: number;
  reactivity: number;
} | null {
  const pillar = getCookingMethodPillar(cookingMethod);
  if (!pillar || !pillar.elementalAssociations) return null;

  const primaryElement = pillar.elementalAssociations.primary;
  const secondaryElement = pillar.elementalAssociations.secondary;

  const primaryProps = ELEMENTAL_THERMODYNAMIC_PROPERTIES[primaryElement];

  // If no secondary element, return primary properties
  if (!secondaryElement) return primaryProps;
  // If secondary element exists, blend properties (70% primary, 30% secondary)
  const secondaryProps = ELEMENTAL_THERMODYNAMIC_PROPERTIES[secondaryElement];
  return {
    heat: (primaryProps.heat || 0) * 0.7 + (secondaryProps.heat || 0) * 0.3,
    entropy:
      (primaryProps.entropy || 0) * 0.7 + (secondaryProps.entropy || 0) * 0.3,
    reactivity:
      (primaryProps.reactivity || 0) * 0.7 +
      (secondaryProps.reactivity || 0) * 0.3,
  };
}

/**
 * Calculate the alchemical effect of a planet based on day/night status
 * @param planet The planet name
 * @param isDaytime Whether it is day (true) or night (false)
 * @returns The alchemical effect of the planet
 */
export function getPlanetaryAlchemicalEffect(
  planet: string,
  isDaytime = true,
): Record<AlchemicalProperty, number> | null {
  const planetEffects = PLANETARY_ALCHEMICAL_EFFECTS[planet];
  if (!planetEffects) return null;

  return isDaytime ? planetEffects.diurnal : planetEffects.nocturnal;
}

/**
 * Get the alchemical effect of a tarot card based on its suit
 * @param cardName The full name of the tarot card (e.g., '10 of Cups')
 * @returns The alchemical effect of the tarot card or null if not recognized
 */
export function getTarotCardAlchemicalEffect(
  cardName: string,
): Record<AlchemicalProperty, number> | null {
  const lower = cardName.toLowerCase();
  const pillar = ALCHEMICAL_PILLARS.find((p) =>
    (p.tarotAssociations || []).some(
      (t) => t.toLowerCase().includes(lower) || lower.includes(t.toLowerCase()),
    ),
  );
  return pillar ? pillar.effects : null;
}

// ===========================================================================
// Alchemical analysis
// ===========================================================================
//
// These four objects replace the "PHASE 48 enterprise intelligence" scaffold.
// That scaffold asked the right questions — how does a season, a planet, a
// zodiac sign, or a cooking method modulate an alchemical subject — but answered
// every one of them with `Math.random()`. 51 calls supplied every compatibility,
// strength, impact and effectiveness scalar it returned, and it additionally
// applied a ±10% random jitter directly to real ESMS values.
//
// Every scalar below is now derived from a named table in this codebase and
// carries the arithmetic that produced it, so any value can be recomputed by
// hand from its `derivation` string.
//
// Two things the scaffold did that are deliberately NOT carried over:
//
//   - `predictiveModeling` / `predictiveOutcomes` returned success probabilities
//     over short/medium/long-term horizons. Nothing in this system can predict
//     a cooking outcome's probability, and no engine is planned that could, so
//     the block is gone rather than preserved as a permanently-absent shape.
//
//   - Both thermodynamic methods hardcoded their own elemental table inline
//     (Fire heat 0.9, Air 0.6, Water 0.3, Earth entropy 0.4) which contradicted
//     ELEMENTAL_THERMODYNAMIC_PROPERTIES above (1.0 / 0.3 / 0.1 / 0.1). There is
//     one elemental table and it is that one.

/**
 * A number that can be reproduced from its stated inputs.
 *
 * `derivation` is not a description — it is the calculation, precise enough to
 * recompute by hand. A score that cannot state its own arithmetic does not
 * belong in this system.
 */
export interface DerivedScore {
  /** Normalised to 0–1. */
  value: number;
  derivation: string;
}

/** The four alchemical axes, in canonical order. */
const ALCHEMICAL_AXES: AlchemicalProperty[] = [
  "Spirit",
  "Essence",
  "Matter",
  "Substance",
];

const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));

const round3 = (n: number): number => Math.round(n * 1000) / 1000;

/**
 * Similarity between two ESMS vectors, as 1 − normalised L1 distance.
 *
 * `axisSpan` is the width of a single axis's domain and must be stated by the
 * caller, because the vectors in this codebase do not share one: pillar effects
 * run −1…1 (span 2) while planetary and tarot effects run 0…1 (span 1).
 * Normalising by the wrong span silently rescales every score.
 */
function esmsAlignment(
  a: Record<AlchemicalProperty, number>,
  b: Record<AlchemicalProperty, number>,
  axisSpan: number,
): DerivedScore {
  const distance = ALCHEMICAL_AXES.reduce(
    (sum, axis) => sum + Math.abs((a[axis] ?? 0) - (b[axis] ?? 0)),
    0,
  );
  const maxDistance = axisSpan * ALCHEMICAL_AXES.length;
  return {
    value: clamp01(1 - distance / maxDistance),
    derivation:
      `1 − Σ|Δ(Spirit,Essence,Matter,Substance)| / (span ${axisSpan} × 4 axes) ` +
      `= 1 − ${round3(distance)}/${maxDistance}`,
  };
}

/**
 * Similarity between two elements, from ELEMENTAL_THERMODYNAMIC_PROPERTIES.
 *
 * Each of heat/entropy/reactivity is on 0…1, so the maximum L1 distance across
 * the three is 3.
 */
function elementalCompatibility(a: Element, b: Element): DerivedScore {
  const pa = ELEMENTAL_THERMODYNAMIC_PROPERTIES[a];
  const pb = ELEMENTAL_THERMODYNAMIC_PROPERTIES[b];
  const distance =
    Math.abs(pa.heat - pb.heat) +
    Math.abs(pa.entropy - pb.entropy) +
    Math.abs(pa.reactivity - pb.reactivity);
  return {
    value: clamp01(1 - distance / 3),
    derivation:
      `1 − Σ|Δ(heat,entropy,reactivity)| / 3 between ${a} and ${b} ` +
      `= 1 − ${round3(distance)}/3  [ELEMENTAL_THERMODYNAMIC_PROPERTIES]`,
  };
}

/**
 * How well a season suits an element.
 *
 * Read straight out of `seasonalElements[season].compatibility[element]` — a
 * real table, not a derivation. Returns null for an unrecognised season rather
 * than defaulting, because a wrong season silently scores every subject.
 */
function seasonalCompatibility(
  season: string,
  element: Element,
): DerivedScore | null {
  const affinity = seasonalElements[season.toLowerCase() as Season];
  if (!affinity) return null;
  const value = affinity.compatibility?.[element];
  if (typeof value !== "number") return null;
  return {
    value: clamp01(value),
    derivation: `seasonalElements.${season.toLowerCase()}.compatibility.${element} = ${value}`,
  };
}

/** The element a zodiac sign belongs to, or null if the sign is unrecognised. */
function zodiacElement(sign: string): Element | null {
  const key = sign.toLowerCase() as keyof typeof zodiacElements;
  // zodiacElements is a total Record over the 12 signs, so the index type is
  // already Element; the runtime `?? null` is what handles a sign that is not
  // one of the 12, which the type cannot express.
  return zodiacElements[key] ?? null;
}

/**
 * Weighted alignment of a subject's ESMS against caller-supplied preference
 * weights.
 *
 * The weights come from the caller, so nothing is invented here — only the
 * axes the caller actually named are scored, and an empty or entirely
 * unrecognised preference set returns null.
 */
function preferenceAlignment(
  effects: Record<AlchemicalProperty, number>,
  preferences: Record<string, number>,
  axisSpan: number,
): DerivedScore | null {
  const named = Object.entries(preferences).filter(([axis]) =>
    (ALCHEMICAL_AXES as string[]).includes(axis),
  );
  if (named.length === 0) return null;

  const totalWeight = named.reduce((sum, [, w]) => sum + Math.abs(w), 0);
  if (totalWeight === 0) return null;

  const weighted = named.reduce((sum, [axis, weight]) => {
    const normalised = (effects[axis as AlchemicalProperty] ?? 0) / axisSpan;
    return sum + normalised * weight;
  }, 0);

  return {
    value: clamp01(weighted / totalWeight),
    derivation:
      `Σ(effect/${axisSpan} × weight) / Σ|weight| over [${named
        .map(([a]) => a)
        .join(", ")}] = ${round3(weighted)}/${round3(totalWeight)}`,
  };
}

/**
 * Cooking-method pillar analysis.
 *
 * Every context factor is optional. A factor the caller does not supply is
 * absent from the result — never defaulted, never filled.
 */
export const cookingMethodPillarAnalysis = {
  /**
   * Analyse a cooking method's pillar against seasonal, planetary and user context.
   *
   * @param cookingMethod The method to analyse.
   * @param context Optional seasonal factors, planetary influences, and ESMS preference weights.
   * @returns Analysis, or null when the method has no pillar mapping.
   */
  analyzeCookingMethodPillar: (
    cookingMethod: string,
    context?: {
      seasonalFactors?: string[];
      planetaryInfluences?: string[];
      /** Weights keyed by alchemical axis, e.g. { Spirit: 0.8, Matter: 0.2 }. */
      userPreferences?: Record<string, number>;
      /** Planetary effects are diurnal by default. */
      isDaytime?: boolean;
    },
  ) => {
    const basePillar = getCookingMethodPillar(cookingMethod);
    if (!basePillar) return null;

    const pillarElement = basePillar.elementalAssociations?.primary;
    const isDaytime = context?.isDaytime ?? true;

    return {
      pillar: basePillar,
      analysis: {
        // Requires the pillar to declare a primary element; without one there is
        // nothing to compare a season against.
        seasonalOptimization: (context?.seasonalFactors ?? [])
          .map((season) => {
            const score = pillarElement
              ? seasonalCompatibility(season, pillarElement)
              : null;
            return score ? { season, element: pillarElement, score } : null;
          })
          .filter((entry): entry is NonNullable<typeof entry> => entry !== null),

        // Planetary effects are ESMS vectors on 0…1; pillar effects are −1…1.
        // Compared on the pillar's span, which is the wider of the two.
        planetaryEnhancement: (context?.planetaryInfluences ?? [])
          .map((planet) => {
            const effect = getPlanetaryAlchemicalEffect(planet, isDaytime);
            if (!effect) return null;
            return {
              planet,
              phase: isDaytime ? ("diurnal" as const) : ("nocturnal" as const),
              score: esmsAlignment(basePillar.effects, effect, 2),
            };
          })
          .filter((entry): entry is NonNullable<typeof entry> => entry !== null),

        userCustomization: context?.userPreferences
          ? preferenceAlignment(basePillar.effects, context.userPreferences, 1)
          : null,
      },
    };
  },

  /**
   * Rank pillars by alchemical proximity to a target pillar.
   *
   * The candidate filter (ESMS distance ≤ 1 on Spirit and Essence) is carried
   * over from the scaffold, where it was already real. What changed is the
   * ranking: it was `Math.random()`, and is now the actual alignment.
   *
   * `skillLevel` and `availableEquipment` are echoed back as supplied. The
   * scaffold also returned `timeEfficiency` and `dietaryCompliance` scores;
   * both are gone, because a pillar has no duration and no dietary profile from
   * which either could be derived.
   */
  generatePillarRecommendations: (
    targetPillar: AlchemicalPillar,
    constraints?: {
      skillLevel?: string;
      availableEquipment?: string[];
    },
  ) => {
    const ranked = ALCHEMICAL_PILLARS.filter(
      (pillar) =>
        Math.abs(pillar.effects.Spirit - targetPillar.effects.Spirit) <= 1 &&
        Math.abs(pillar.effects.Essence - targetPillar.effects.Essence) <= 1,
    )
      .map((pillar) => ({
        pillar,
        compatibility: esmsAlignment(pillar.effects, targetPillar.effects, 2),
      }))
      .sort((a, b) => b.compatibility.value - a.compatibility.value);

    const meanCompatibility =
      ranked.length > 0
        ? ranked.reduce((sum, r) => sum + r.compatibility.value, 0) / ranked.length
        : null;

    return {
      recommendations: ranked.slice(0, 5),
      constraints: {
        skillLevel: constraints?.skillLevel ?? null,
        availableEquipment: constraints?.availableEquipment ?? null,
      },
      analysis: {
        totalOptions: ranked.length,
        meanCompatibility:
          meanCompatibility === null
            ? null
            : {
                value: round3(meanCompatibility),
                derivation: `mean of ${ranked.length} candidate alignments`,
              },
      },
    };
  },

  /**
   * Analyse a pillar's transformation against temporal and intent context.
   *
   * The scaffold applied a ±10% random jitter to the pillar's ESMS effects
   * before returning them. That is removed outright: the effects are the
   * pillar's declared values, unmodified.
   *
   * It also accepted `environmentalConditions` {temperature, humidity, pressure}
   * and never used them, defaulting missing values to 20/50/1. The parameter is
   * dropped here rather than kept as an ignored input. Real environmental
   * response is regime-specific per cooking method and belongs to the
   * environmental engine (src/lib/environment, PR #680); it will be wired in
   * from there rather than approximated at the pillar level.
   */
  analyzePillarTransformation: (
    pillar: AlchemicalPillar,
    transformationContext?: {
      seasonalFactors?: string[];
      userIntent?: string;
    },
  ) => {
    const pillarElement = pillar.elementalAssociations?.primary;

    return {
      pillar,
      effects: pillar.effects,
      analysis: {
        seasonalOptimization: (transformationContext?.seasonalFactors ?? [])
          .map((season) => {
            const score = pillarElement
              ? seasonalCompatibility(season, pillarElement)
              : null;
            return score ? { season, element: pillarElement, score } : null;
          })
          .filter((entry): entry is NonNullable<typeof entry> => entry !== null),

        // Echoed, not scored. There is no table mapping a free-text intent to an
        // alchemical alignment, and inventing one is exactly what this rewrite
        // exists to remove.
        userIntent: transformationContext?.userIntent ?? null,
      },
    };
  },
};

/**
 * Elemental thermodynamic analysis.
 *
 * Reads ELEMENTAL_THERMODYNAMIC_PROPERTIES — the single elemental table — rather
 * than the contradicting inline copy the scaffold carried.
 */
export const elementalThermodynamicAnalysis = {
  /**
   * Analyse an element against seasonal, planetary and cooking-method context.
   */
  analyzeElementalThermodynamics: (
    element: Element,
    context?: {
      seasonalFactors?: string[];
      planetaryInfluences?: string[];
      cookingMethod?: string;
      isDaytime?: boolean;
    },
  ) => {
    const baseProperties = ELEMENTAL_THERMODYNAMIC_PROPERTIES[element];
    const isDaytime = context?.isDaytime ?? true;

    const methodPillar = context?.cookingMethod
      ? getCookingMethodPillar(context.cookingMethod)
      : null;
    const methodElement = methodPillar?.elementalAssociations?.primary;

    return {
      element,
      baseProperties,
      analysis: {
        seasonalOptimization: (context?.seasonalFactors ?? [])
          .map((season) => {
            const score = seasonalCompatibility(season, element);
            return score ? { season, score } : null;
          })
          .filter((entry): entry is NonNullable<typeof entry> => entry !== null),

        // A planet's contribution to an ELEMENT, via the alchemical properties
        // that element underpins. _ALCHEMICAL_PROPERTY_ELEMENTS states which
        // properties each element serves; the planet's weight on those is its
        // strength here.
        planetaryEnhancement: (context?.planetaryInfluences ?? [])
          .map((planet) => {
            const effect = getPlanetaryAlchemicalEffect(planet, isDaytime);
            if (!effect) return null;
            const contributing = ALCHEMICAL_AXES.filter((axis) => {
              const mapping = _ALCHEMICAL_PROPERTY_ELEMENTS[axis];
              return mapping.primary === element || mapping.secondary === element;
            });
            if (contributing.length === 0) return null;
            const total = contributing.reduce(
              (sum, axis) => sum + (effect[axis] ?? 0),
              0,
            );
            return {
              planet,
              phase: isDaytime ? ("diurnal" as const) : ("nocturnal" as const),
              score: {
                value: clamp01(total / contributing.length),
                derivation:
                  `mean of ${planet} ${isDaytime ? "diurnal" : "nocturnal"} weights on ` +
                  `[${contributing.join(", ")}] (the properties ${element} underpins) ` +
                  `= ${round3(total)}/${contributing.length}`,
              } satisfies DerivedScore,
            };
          })
          .filter((entry): entry is NonNullable<typeof entry> => entry !== null),

        // Null when the method has no pillar mapping or the pillar declares no
        // primary element — both are real gaps, not zeros.
        cookingMethodIntegration:
          context?.cookingMethod && methodElement
            ? {
                method: context.cookingMethod,
                pillar: methodPillar?.name ?? null,
                methodElement,
                compatibility: elementalCompatibility(element, methodElement),
              }
            : null,
      },
    };
  },

  /**
   * Rank elements by thermodynamic proximity to a target element.
   *
   * The candidate filter (heat and entropy within 0.3) is carried over from the
   * scaffold. The ranking was `Math.random()` and is now the real distance.
   */
  generateThermodynamicRecommendations: (
    targetElement: Element,
    constraints?: {
      skillLevel?: string;
      availableEquipment?: string[];
    },
  ) => {
    const target = ELEMENTAL_THERMODYNAMIC_PROPERTIES[targetElement];

    const ranked = (
      Object.keys(ELEMENTAL_THERMODYNAMIC_PROPERTIES) as Element[]
    )
      .filter((element) => {
        const properties = ELEMENTAL_THERMODYNAMIC_PROPERTIES[element];
        return (
          Math.abs(properties.heat - target.heat) <= 0.3 &&
          Math.abs(properties.entropy - target.entropy) <= 0.3
        );
      })
      .map((element) => ({
        element,
        properties: ELEMENTAL_THERMODYNAMIC_PROPERTIES[element],
        compatibility: elementalCompatibility(element, targetElement),
      }))
      .sort((a, b) => b.compatibility.value - a.compatibility.value);

    const meanCompatibility =
      ranked.length > 0
        ? ranked.reduce((sum, r) => sum + r.compatibility.value, 0) / ranked.length
        : null;

    return {
      recommendations: ranked,
      constraints: {
        skillLevel: constraints?.skillLevel ?? null,
        availableEquipment: constraints?.availableEquipment ?? null,
      },
      analysis: {
        totalOptions: ranked.length,
        meanCompatibility:
          meanCompatibility === null
            ? null
            : {
                value: round3(meanCompatibility),
                derivation: `mean of ${ranked.length} candidate alignments`,
              },
      },
    };
  },
};

/**
 * Planetary alchemical analysis.
 *
 * Reads PLANETARY_ALCHEMICAL_EFFECTS via getPlanetaryAlchemicalEffect, which
 * distinguishes diurnal from nocturnal — a real distinction the scaffold ignored
 * entirely while randomising the result.
 */
export const planetaryAlchemyAnalysis = {
  analyzePlanetaryAlchemy: (
    planet: string,
    context?: {
      seasonalFactors?: string[];
      zodiacInfluences?: string[];
      cookingMethod?: string;
      isDaytime?: boolean;
    },
  ) => {
    const isDaytime = context?.isDaytime ?? true;
    const baseEffects = getPlanetaryAlchemicalEffect(planet, isDaytime);
    // Null rather than a zeroed ESMS vector: the scaffold defaulted an unknown
    // planet to all-zeros, which reads downstream as a real measurement of
    // nothing rather than as an absent one.
    if (!baseEffects) return null;

    const methodPillar = context?.cookingMethod
      ? getCookingMethodPillar(context.cookingMethod)
      : null;

    return {
      planet,
      phase: isDaytime ? ("diurnal" as const) : ("nocturnal" as const),
      baseEffects,
      analysis: {
        // A planet has no element of its own here, so season is scored against
        // the element the planet's dominant alchemical axis underpins.
        seasonalOptimization: (() => {
          const dominantAxis = ALCHEMICAL_AXES.reduce((best, axis) =>
            (baseEffects[axis] ?? 0) > (baseEffects[best] ?? 0) ? axis : best,
          );
          const element = _ALCHEMICAL_PROPERTY_ELEMENTS[dominantAxis]
            .primary as Element;
          return (context?.seasonalFactors ?? [])
            .map((season) => {
              const score = seasonalCompatibility(season, element);
              return score
                ? { season, viaAxis: dominantAxis, element, score }
                : null;
            })
            .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
        })(),

        zodiacEnhancement: (context?.zodiacInfluences ?? [])
          .map((sign) => {
            const element = zodiacElement(sign);
            if (!element) return null;
            const dominantAxis = ALCHEMICAL_AXES.reduce((best, axis) =>
              (baseEffects[axis] ?? 0) > (baseEffects[best] ?? 0) ? axis : best,
            );
            const planetElement = _ALCHEMICAL_PROPERTY_ELEMENTS[dominantAxis]
              .primary as Element;
            return {
              sign,
              signElement: element,
              score: elementalCompatibility(planetElement, element),
            };
          })
          .filter((entry): entry is NonNullable<typeof entry> => entry !== null),

        cookingMethodIntegration: methodPillar
          ? {
              method: context?.cookingMethod ?? null,
              pillar: methodPillar.name,
              compatibility: esmsAlignment(methodPillar.effects, baseEffects, 2),
            }
          : null,
      },
    };
  },

  /**
   * Rank planets by alchemical proximity to a target planet.
   *
   * Candidates are the planets PLANETARY_ALCHEMICAL_EFFECTS actually defines —
   * not a hardcoded list — so the set cannot drift from the data.
   */
  generatePlanetaryRecommendations: (
    targetPlanet: string,
    options?: { isDaytime?: boolean },
  ) => {
    const isDaytime = options?.isDaytime ?? true;
    const target = getPlanetaryAlchemicalEffect(targetPlanet, isDaytime);
    if (!target) return null;

    const ranked = Object.keys(PLANETARY_ALCHEMICAL_EFFECTS)
      .filter((planet) => planet !== targetPlanet)
      .map((planet) => {
        const effects = getPlanetaryAlchemicalEffect(planet, isDaytime)!;
        return {
          planet,
          effects,
          compatibility: esmsAlignment(effects, target, 1),
        };
      })
      .sort((a, b) => b.compatibility.value - a.compatibility.value);

    return {
      target: { planet: targetPlanet, effects: target },
      phase: isDaytime ? ("diurnal" as const) : ("nocturnal" as const),
      recommendations: ranked.slice(0, 5),
      analysis: {
        totalOptions: ranked.length,
        meanCompatibility: {
          value: round3(
            ranked.reduce((sum, r) => sum + r.compatibility.value, 0) /
              ranked.length,
          ),
          derivation: `mean of ${ranked.length} candidate alignments`,
        },
      },
    };
  },
};

/**
 * Tarot alchemical analysis.
 *
 * Card effects resolve through getTarotCardAlchemicalEffect, which matches a
 * card against the pillars' `tarotAssociations`. Cards with no pillar
 * association return null — the scaffold defaulted them to a zeroed ESMS vector
 * and then scored that, which manufactured a reading for cards this system has
 * no data on at all.
 */
export const tarotAlchemyAnalysis = {
  analyzeTarotAlchemy: (
    cardName: string,
    context?: {
      seasonalFactors?: string[];
      zodiacInfluences?: string[];
      cookingMethod?: string;
    },
  ) => {
    const baseEffects = getTarotCardAlchemicalEffect(cardName);
    if (!baseEffects) return null;

    const dominantAxis = ALCHEMICAL_AXES.reduce((best, axis) =>
      (baseEffects[axis] ?? 0) > (baseEffects[best] ?? 0) ? axis : best,
    );
    const cardElement = _ALCHEMICAL_PROPERTY_ELEMENTS[dominantAxis]
      .primary as Element;

    const methodPillar = context?.cookingMethod
      ? getCookingMethodPillar(context.cookingMethod)
      : null;

    return {
      cardName,
      baseEffects,
      dominantAxis,
      cardElement,
      analysis: {
        seasonalOptimization: (context?.seasonalFactors ?? [])
          .map((season) => {
            const score = seasonalCompatibility(season, cardElement);
            return score ? { season, score } : null;
          })
          .filter((entry): entry is NonNullable<typeof entry> => entry !== null),

        zodiacEnhancement: (context?.zodiacInfluences ?? [])
          .map((sign) => {
            const element = zodiacElement(sign);
            if (!element) return null;
            return {
              sign,
              signElement: element,
              score: elementalCompatibility(cardElement, element),
            };
          })
          .filter((entry): entry is NonNullable<typeof entry> => entry !== null),

        cookingMethodIntegration: methodPillar
          ? {
              method: context?.cookingMethod ?? null,
              pillar: methodPillar.name,
              compatibility: esmsAlignment(methodPillar.effects, baseEffects, 2),
            }
          : null,
      },
    };
  },

  /**
   * Rank tarot cards by alchemical proximity to a target card.
   *
   * Candidates come from the pillars' declared `tarotAssociations` rather than a
   * hardcoded list of the 22 Major Arcana. The scaffold listed all 22 and scored
   * every one, including the majority that have no pillar association and
   * therefore no alchemical data in this system at all.
   */
  generateTarotRecommendations: (targetCard: string) => {
    const target = getTarotCardAlchemicalEffect(targetCard);
    if (!target) return null;

    const associated = [
      ...new Set(
        ALCHEMICAL_PILLARS.flatMap((pillar) => pillar.tarotAssociations ?? []),
      ),
    ];

    const ranked = associated
      .filter((card) => card.toLowerCase() !== targetCard.toLowerCase())
      .map((card) => {
        const effects = getTarotCardAlchemicalEffect(card);
        return effects
          ? { card, effects, compatibility: esmsAlignment(effects, target, 2) }
          : null;
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
      .sort((a, b) => b.compatibility.value - a.compatibility.value);

    return {
      target: { card: targetCard, effects: target },
      recommendations: ranked.slice(0, 5),
      analysis: {
        totalOptions: ranked.length,
        meanCompatibility:
          ranked.length > 0
            ? {
                value: round3(
                  ranked.reduce((sum, r) => sum + r.compatibility.value, 0) /
                    ranked.length,
                ),
                derivation: `mean of ${ranked.length} candidate alignments`,
              }
            : null,
      },
    };
  },
};

// ========== MISSING EXPORTS FOR TS2305 FIXES & NEW INTERFACES ==========

/**
 * EnhancedRecipeIngredient type, based on RecipeIngredient from src/types/recipe.ts
 * with additional properties from initial alchemicalPillars.ts context.
 */
export interface EnhancedRecipeIngredient {
  id?: string;
  name: string;
  amount: number; // Ensuring this is number, not string
  unit: string;
  category?: string;
  optional?: boolean;
  preparation?: string;
  notes?: string;
  function?: string;
  cookingPoint?: string;
  substitutes?: string[];
  elementalProperties?: ElementalProperties;
  seasonality?: Season | "all" | Season[]; // Using the more specific Season type

  // Astrological associations (from original EnhancedRecipeIngredient in alchemicalPillars.ts)
  cuisine?: string;
  zodiacInfluences?: any[];
  planetaryInfluences?: string[];
  lunarPhaseInfluences?: LunarPhase[];

  tags?: string[]; // Added from original ALL_ENHANCED_INGREDIENTS
  allergens?: string[]; // Added from original ALL_ENHANCED_INGREDIENTS

  // Quantity-scaled properties for enhanced alchemical calculations (from src/types/recipeIngredient.ts if needed, assuming QuantityScaledProperties from alchemy)
  scaledProperties?: QuantityScaledProperties;

  // Astrological profile for recipe context (from src/types/recipeIngredient.ts)
  astrologicalProfile?: {
    _elementalAffinity: {
      base: string;
      secondary?: string;
    };
    rulingPlanets?: string[];
    zodiacAffinity?: string[];
  };

  // Nutritional properties (optional)
  calories?: number;
  macronutrients?: {
    carbs?: number;
    protein?: number;
    fat?: number;
  };

  // Storage and handling
  storage?: string;
  shelfLife?: string;

  // Cultural and culinary properties
  origin?: string;
  culinaryUse?: string[];
  flavorProfile?: string[];

  // Processing state
  isProcessed?: boolean;
  processingLevel?: "minimal" | "moderate" | "highly-processed";
  // Compatibility and pairing
  pairing?: string[];
  avoidWith?: string[];

  // Allow additional properties for extensibility
  [_key: string]: unknown;
}

/**
 * EnhancedCookingMethod interface, combining definitions from
 * src/constants/alchemicalPillars.ts and src/types/alchemy.ts
 */
export interface EnhancedCookingMethod {
  id: string;
  name: string;
  description: string;
  category:
    | "dry"
    | "wet"
    | "combination"
    | "molecular"
    | "raw"
    | "traditional"
    | "transformation";
  // Core alchemical properties
  alchemicalEffects: {
    Spirit: number;
    Essence: number;
    Matter: number;
    Substance: number;
  };
  // Thermodynamic properties
  thermodynamics: {
    heat: number;
    entropy: number;
    reactivity: number;
  };
  // Elemental influences (from src/constants/alchemicalPillars.ts)
  elementalInfluence: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  };
  // elementalEffect (from src/types/alchemy.ts) - integrating it here
  elementalEffect?: ElementalProperties; // Made optional to avoid immediate conflicts, can be aligned later

  monicaCompatibility: {
    score: number;
    factors: string[];
    enhancedProperties: string[];
  };
  techniques: string[];
  equipment: string[];
  skillLevel: "beginner" | "intermediate" | "advanced" | "expert";
  timeRange: {
    min: number;
    max: number;
    unit: "minutes" | "hours";
  };
  planetaryAssociations?: string[];
  zodiacAffinity?: string[];
  lunarPhaseOptimal?: string[];
  duration?: {
    min: number;
    max: number;
  };
  suitable_for?: string[];
  benefits?: string[];
  [key: string]: unknown;
}

/**
 * Calculate optimal cooking conditions based on the Monica constant and
 * thermodynamic properties. Uses calculatePillarMonicaModifiers for
 * physics-based temperature/timing adjustments, and derives planetary
 * hours and lunar phases from thermodynamic and Monica characteristics.
 *
 * @param monica The Monica constant value
 * @param thermodynamicProperties The thermodynamic properties of the cooking method
 * @returns Optimal cooking conditions including temperature, timing, planetary hours, and lunar phases
 */
export function calculateOptimalCookingConditions(
  monica: number,
  thermodynamicProperties: { heat: number; entropy: number; reactivity: number; energy?: number; },
): { temperature: number; timing: string; planetaryHours: string[]; lunarPhases: string[]; } {
  const { heat, entropy, reactivity } = thermodynamicProperties;

  // Use the physics-based Monica modifiers for temperature and timing
  const monicaModifiers = calculatePillarMonicaModifiers(monica);

  // Base temperature from heat property (200-500F range)
  const baseTemperature = 200 + heat * 300;
  const temperature = Math.round(
    Math.max(200, Math.min(500, baseTemperature + monicaModifiers.temperatureAdjustment))
  );

  // Timing from Monica classification
  let timing: string;
  if (monica > 5) {
    timing = "quick";
  } else if (monica > 1) {
    timing = "steady";
  } else {
    timing = "slow";
  }

  // Planetary hours from thermodynamic properties
  const planetaryHours: string[] = [];
  if (heat > 0.6) {
    planetaryHours.push("Sun", "Mars");
  } else if (reactivity > 0.6) {
    planetaryHours.push("Mercury", "Uranus");
  } else if (entropy > 0.6) {
    planetaryHours.push("Neptune", "Pluto");
  } else {
    planetaryHours.push("Jupiter");
  }

  // Lunar phases from Monica sign and magnitude
  const lunarPhases: string[] = [];
  if (!isFinite(monica) || isNaN(monica)) {
    lunarPhases.push("new moon", "full moon", "first quarter", "third quarter");
  } else if (monica > 0.5) {
    lunarPhases.push("waxing gibbous", "full moon");
  } else if (monica < -0.5) {
    lunarPhases.push("waning crescent", "new moon");
  } else {
    lunarPhases.push("first quarter", "third quarter");
  }

  return { temperature, timing, planetaryHours, lunarPhases };
}

/**
 * Calculate physics-based Monica modifiers for cooking optimization.
 *
 * The Monica constant (M_c) reflects the thermodynamic-alchemical balance of a cooking system.
 * This function derives practical cooking adjustments based on M_c's value:
 *
 * - Highly Volatile (M_c > 10): Reduce temperature, shorten time, lower intensity
 *   → System is energetically unstable, needs dampening
 * - Volatile (5 < M_c ≤ 10): Moderate temperature reduction, slight timing decrease
 *   → System is reactive, benefit from controlled acceleration
 * - Transformative (2 < M_c ≤ 5): Slight temperature increase to push past barriers
 *   → System is in active transformation zone
 * - Balanced (1 < M_c ≤ 2): Near-equilibrium, optimal cooking window
 *   → Minimal adjustments needed
 * - Stable (0.5 < M_c ≤ 1): Increase temperature/time to overcome inertia
 *   → System needs energy input to transform
 * - Very Stable (M_c ≤ 0.5): Significant energy input needed
 *   → System resists transformation
 *
 * @param monica The Monica constant value
 * @returns Physics-based cooking modifiers
 */
export function calculatePillarMonicaModifiers(monica: number): {
  temperatureAdjustment: number;
  timingAdjustment: number;
  intensityModifier: string;
} {
  if (monica > 10) {
    // Highly Volatile: dampen the system significantly
    return {
      temperatureAdjustment: -25,
      timingAdjustment: -15,
      intensityModifier: "reduce",
    };
  } else if (monica > 5) {
    // Volatile: controlled reduction
    return {
      temperatureAdjustment: -15,
      timingAdjustment: -8,
      intensityModifier: "temper",
    };
  } else if (monica > 2) {
    // Transformative: slight push to drive reactions
    return {
      temperatureAdjustment: 10,
      timingAdjustment: 5,
      intensityModifier: "amplify",
    };
  } else if (monica > 1) {
    // Balanced: optimal zone, minimal adjustment
    return {
      temperatureAdjustment: 0,
      timingAdjustment: 0,
      intensityModifier: "neutral",
    };
  } else if (monica > 0.5) {
    // Stable: needs energy input
    return {
      temperatureAdjustment: 15,
      timingAdjustment: 10,
      intensityModifier: "boost",
    };
  } else {
    // Very Stable: significant energy needed to overcome inertia
    return {
      temperatureAdjustment: 25,
      timingAdjustment: 20,
      intensityModifier: "intensify",
    };
  }
}

/**
 * Returns a list of all enhanced cooking methods.
 * Currently, this maps ALCHEMICAL_PILLARS to EnhancedCookingMethod.
 * This function is a placeholder and may need more complex logic.
 * @returns {EnhancedCookingMethod[]}
 */
export function getAllEnhancedCookingMethods(): EnhancedCookingMethod[] {
  return ALCHEMICAL_PILLARS.map((pillar) => ({
    id: String(pillar.id),
    name: pillar.name,
    description: pillar.description,
    category: "transformation", // Default category
    alchemicalEffects: pillar.effects,
    thermodynamics: { heat: 0.5, entropy: 0.5, reactivity: 0.5 }, // Placeholder
    elementalInfluence: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }, // Placeholder
    techniques: [],
    equipment: [],
    skillLevel: "intermediate",
    timeRange: { min: 5, max: 60, unit: "minutes" },
    elementalEffect: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }, // Placeholder
    duration: { min: 5, max: 60 },
    suitable_for: [],
    benefits: [],
    monicaCompatibility: { score: 0, factors: [], enhancedProperties: [] }, // Initialize monicaCompatibility
  }));
}

// Comprehensive ingredient database for recipe generation
const ALL_ENHANCED_INGREDIENTS: EnhancedRecipeIngredient[] = [
  // ===== PROTEINS (12) =====
  { id: "chicken-breast", name: "Chicken Breast", amount: 1, unit: "piece", category: "protein", cuisine: "universal", seasonality: "all", elementalProperties: { Fire: 0.4, Water: 0.3, Earth: 0.5, Air: 0.2 }, tags: ["lean-protein"] },
  { id: "salmon-fillet", name: "Salmon Fillet", amount: 1, unit: "piece", category: "protein", cuisine: "universal", seasonality: ["summer", "fall"], elementalProperties: { Fire: 0.3, Water: 0.7, Earth: 0.4, Air: 0.2 }, tags: ["fatty-fish", "omega-3"], allergens: ["fish"] },
  { id: "beef-sirloin", name: "Beef Sirloin", amount: 1, unit: "piece", category: "protein", cuisine: "universal", seasonality: "all", elementalProperties: { Fire: 0.7, Water: 0.2, Earth: 0.6, Air: 0.1 }, tags: ["red-meat", "iron-rich"] },
  { id: "shrimp", name: "Shrimp", amount: 1, unit: "lb", category: "protein", cuisine: "asian", seasonality: ["spring", "summer"], elementalProperties: { Fire: 0.3, Water: 0.8, Earth: 0.2, Air: 0.3 }, tags: ["shellfish", "quick-cook"], allergens: ["shellfish"] },
  { id: "tofu", name: "Tofu", amount: 1, unit: "block", category: "protein", cuisine: "asian", seasonality: "all", elementalProperties: { Fire: 0.1, Water: 0.6, Earth: 0.4, Air: 0.3 }, tags: ["plant-protein", "versatile"] },
  { id: "lamb-chop", name: "Lamb Chop", amount: 2, unit: "pieces", category: "protein", cuisine: "mediterranean", seasonality: ["spring"], elementalProperties: { Fire: 0.6, Water: 0.3, Earth: 0.5, Air: 0.2 }, tags: ["red-meat", "gamey"] },
  { id: "eggs", name: "Eggs", amount: 2, unit: "large", category: "protein", cuisine: "universal", seasonality: "all", elementalProperties: { Fire: 0.3, Water: 0.4, Earth: 0.4, Air: 0.5 }, tags: ["versatile", "binding"], allergens: ["eggs"] },
  { id: "pork-tenderloin", name: "Pork Tenderloin", amount: 1, unit: "piece", category: "protein", cuisine: "universal", seasonality: "all", elementalProperties: { Fire: 0.5, Water: 0.3, Earth: 0.5, Air: 0.2 }, tags: ["lean-meat", "mild"] },
  { id: "tuna-steak", name: "Tuna Steak", amount: 1, unit: "piece", category: "protein", cuisine: "japanese", seasonality: ["summer", "fall"], elementalProperties: { Fire: 0.4, Water: 0.7, Earth: 0.3, Air: 0.2 }, tags: ["fatty-fish", "sashimi-grade"], allergens: ["fish"] },
  { id: "chicken-thigh", name: "Chicken Thigh", amount: 2, unit: "pieces", category: "protein", cuisine: "universal", seasonality: "all", elementalProperties: { Fire: 0.5, Water: 0.4, Earth: 0.4, Air: 0.2 }, tags: ["dark-meat", "flavorful"] },
  { id: "tempeh", name: "Tempeh", amount: 1, unit: "block", category: "protein", cuisine: "indonesian", seasonality: "all", elementalProperties: { Fire: 0.3, Water: 0.3, Earth: 0.6, Air: 0.4 }, tags: ["fermented", "plant-protein"] },
  { id: "duck-breast", name: "Duck Breast", amount: 1, unit: "piece", category: "protein", cuisine: "french", seasonality: ["fall", "winter"], elementalProperties: { Fire: 0.6, Water: 0.4, Earth: 0.5, Air: 0.1 }, tags: ["rich", "gamey"] },

  // ===== VEGETABLES (14) =====
  { id: "broccoli", name: "Broccoli", amount: 1, unit: "cup", category: "vegetable", cuisine: "universal", seasonality: ["spring", "fall"], elementalProperties: { Fire: 0.1, Water: 0.6, Earth: 0.3, Air: 0.5 }, tags: ["green-vegetable", "cruciferous"] },
  { id: "bell-pepper", name: "Bell Pepper", amount: 1, unit: "piece", category: "vegetable", cuisine: "mexican", seasonality: ["summer"], elementalProperties: { Fire: 0.5, Water: 0.4, Earth: 0.3, Air: 0.4 }, tags: ["colorful", "vitamin-c"] },
  { id: "spinach", name: "Spinach", amount: 1, unit: "cup", category: "leafy-green", cuisine: "mediterranean", seasonality: ["spring", "fall"], elementalProperties: { Fire: 0.1, Water: 0.5, Earth: 0.2, Air: 0.6 }, tags: ["nutrient-dense", "iron"] },
  { id: "tomato", name: "Tomato", amount: 1, unit: "medium", category: "fruit", cuisine: "mediterranean", seasonality: ["summer"], elementalProperties: { Fire: 0.3, Water: 0.7, Earth: 0.2, Air: 0.3 }, tags: ["acidic", "juicy"] },
  { id: "sweet-potato", name: "Sweet Potato", amount: 1, unit: "medium", category: "root-vegetable", cuisine: "universal", seasonality: ["fall", "winter"], elementalProperties: { Fire: 0.3, Water: 0.3, Earth: 0.7, Air: 0.1 }, tags: ["starchy", "beta-carotene"] },
  { id: "zucchini", name: "Zucchini", amount: 1, unit: "medium", category: "vegetable", cuisine: "italian", seasonality: ["summer"], elementalProperties: { Fire: 0.1, Water: 0.7, Earth: 0.3, Air: 0.3 }, tags: ["summer-squash", "mild"] },
  { id: "mushroom", name: "Mushrooms", amount: 1, unit: "cup", category: "fungi", cuisine: "universal", seasonality: ["fall"], elementalProperties: { Fire: 0.2, Water: 0.5, Earth: 0.6, Air: 0.3 }, tags: ["umami", "earthy"] },
  { id: "kale", name: "Kale", amount: 1, unit: "cup", category: "leafy-green", cuisine: "universal", seasonality: ["fall", "winter"], elementalProperties: { Fire: 0.2, Water: 0.4, Earth: 0.3, Air: 0.7 }, tags: ["superfood", "bitter"] },
  { id: "eggplant", name: "Eggplant", amount: 1, unit: "medium", category: "vegetable", cuisine: "mediterranean", seasonality: ["summer"], elementalProperties: { Fire: 0.2, Water: 0.5, Earth: 0.5, Air: 0.2 }, tags: ["meaty", "absorbent"] },
  { id: "asparagus", name: "Asparagus", amount: 1, unit: "bunch", category: "vegetable", cuisine: "french", seasonality: ["spring"], elementalProperties: { Fire: 0.2, Water: 0.5, Earth: 0.3, Air: 0.5 }, tags: ["spring-vegetable", "elegant"] },
  { id: "cauliflower", name: "Cauliflower", amount: 1, unit: "head", category: "vegetable", cuisine: "indian", seasonality: ["fall", "winter"], elementalProperties: { Fire: 0.1, Water: 0.5, Earth: 0.4, Air: 0.4 }, tags: ["cruciferous", "versatile"] },
  { id: "carrot", name: "Carrot", amount: 2, unit: "medium", category: "root-vegetable", cuisine: "universal", seasonality: ["fall", "winter"], elementalProperties: { Fire: 0.2, Water: 0.4, Earth: 0.6, Air: 0.2 }, tags: ["sweet", "beta-carotene"] },
  { id: "green-beans", name: "Green Beans", amount: 1, unit: "cup", category: "vegetable", cuisine: "universal", seasonality: ["summer"], elementalProperties: { Fire: 0.1, Water: 0.5, Earth: 0.4, Air: 0.4 }, tags: ["snap", "fresh"] },
  { id: "butternut-squash", name: "Butternut Squash", amount: 1, unit: "medium", category: "vegetable", cuisine: "universal", seasonality: ["fall", "winter"], elementalProperties: { Fire: 0.2, Water: 0.3, Earth: 0.7, Air: 0.2 }, tags: ["winter-squash", "sweet"] },

  // ===== GRAINS & LEGUMES (8) =====
  { id: "rice", name: "Rice", amount: 1, unit: "cup", category: "grain", cuisine: "asian", seasonality: "all", elementalProperties: { Fire: 0.2, Water: 0.4, Earth: 0.7, Air: 0.1 }, tags: ["staple", "carbohydrate"] },
  { id: "quinoa", name: "Quinoa", amount: 1, unit: "cup", category: "grain", cuisine: "south-american", seasonality: "all", elementalProperties: { Fire: 0.2, Water: 0.3, Earth: 0.6, Air: 0.4 }, tags: ["complete-protein", "gluten-free"] },
  { id: "pasta", name: "Pasta", amount: 1, unit: "lb", category: "grain", cuisine: "italian", seasonality: "all", elementalProperties: { Fire: 0.2, Water: 0.3, Earth: 0.7, Air: 0.2 }, tags: ["staple", "comfort"], allergens: ["gluten"] },
  { id: "lentils", name: "Lentils", amount: 1, unit: "cup", category: "legume", cuisine: "indian", seasonality: "all", elementalProperties: { Fire: 0.3, Water: 0.3, Earth: 0.7, Air: 0.3 }, tags: ["plant-protein", "fiber"] },
  { id: "chickpeas", name: "Chickpeas", amount: 1, unit: "can", category: "legume", cuisine: "middle-eastern", seasonality: "all", elementalProperties: { Fire: 0.2, Water: 0.3, Earth: 0.6, Air: 0.4 }, tags: ["hummus", "plant-protein"] },
  { id: "black-beans", name: "Black Beans", amount: 1, unit: "can", category: "legume", cuisine: "mexican", seasonality: "all", elementalProperties: { Fire: 0.3, Water: 0.3, Earth: 0.7, Air: 0.2 }, tags: ["fiber", "hearty"] },
  { id: "couscous", name: "Couscous", amount: 1, unit: "cup", category: "grain", cuisine: "middle-eastern", seasonality: "all", elementalProperties: { Fire: 0.2, Water: 0.3, Earth: 0.6, Air: 0.3 }, tags: ["quick-cook", "light"], allergens: ["gluten"] },
  { id: "farro", name: "Farro", amount: 1, unit: "cup", category: "grain", cuisine: "italian", seasonality: "all", elementalProperties: { Fire: 0.2, Water: 0.3, Earth: 0.7, Air: 0.3 }, tags: ["ancient-grain", "nutty"], allergens: ["gluten"] },

  // ===== AROMATICS & HERBS (10) =====
  { id: "garlic", name: "Garlic", amount: 1, unit: "clove", category: "aromatic", cuisine: "universal", seasonality: "all", elementalProperties: { Fire: 0.6, Water: 0.2, Earth: 0.4, Air: 0.3 }, tags: ["pungent", "flavor-enhancer"] },
  { id: "onion", name: "Onion", amount: 1, unit: "medium", category: "aromatic", cuisine: "universal", seasonality: "all", elementalProperties: { Fire: 0.4, Water: 0.3, Earth: 0.5, Air: 0.2 }, tags: ["base-flavor", "pungent"] },
  { id: "ginger", name: "Fresh Ginger", amount: 1, unit: "thumb", category: "aromatic", cuisine: "asian", seasonality: "all", elementalProperties: { Fire: 0.7, Water: 0.2, Earth: 0.3, Air: 0.4 }, tags: ["warming", "zingy"] },
  { id: "cilantro", name: "Cilantro", amount: 1, unit: "bunch", category: "herb", cuisine: "mexican", seasonality: ["spring", "summer"], elementalProperties: { Fire: 0.2, Water: 0.4, Earth: 0.2, Air: 0.7 }, tags: ["fresh", "citrusy"] },
  { id: "basil", name: "Fresh Basil", amount: 1, unit: "cup", category: "herb", cuisine: "italian", seasonality: ["summer"], elementalProperties: { Fire: 0.3, Water: 0.3, Earth: 0.2, Air: 0.7 }, tags: ["aromatic", "sweet"] },
  { id: "rosemary", name: "Fresh Rosemary", amount: 2, unit: "sprigs", category: "herb", cuisine: "mediterranean", seasonality: "all", elementalProperties: { Fire: 0.5, Water: 0.1, Earth: 0.4, Air: 0.5 }, tags: ["woodsy", "piney"] },
  { id: "thyme", name: "Fresh Thyme", amount: 4, unit: "sprigs", category: "herb", cuisine: "french", seasonality: "all", elementalProperties: { Fire: 0.3, Water: 0.2, Earth: 0.4, Air: 0.6 }, tags: ["earthy", "delicate"] },
  { id: "lemongrass", name: "Lemongrass", amount: 2, unit: "stalks", category: "aromatic", cuisine: "thai", seasonality: "all", elementalProperties: { Fire: 0.3, Water: 0.3, Earth: 0.2, Air: 0.7 }, tags: ["citrusy", "fragrant"] },
  { id: "shallot", name: "Shallot", amount: 2, unit: "pieces", category: "aromatic", cuisine: "french", seasonality: "all", elementalProperties: { Fire: 0.3, Water: 0.3, Earth: 0.5, Air: 0.3 }, tags: ["mild", "refined"] },
  { id: "green-onion", name: "Green Onion", amount: 4, unit: "stalks", category: "aromatic", cuisine: "asian", seasonality: "all", elementalProperties: { Fire: 0.3, Water: 0.3, Earth: 0.3, Air: 0.5 }, tags: ["garnish", "mild"] },

  // ===== DAIRY & FATS (6) =====
  { id: "butter", name: "Butter", amount: 2, unit: "tbsp", category: "fat", cuisine: "french", seasonality: "all", elementalProperties: { Fire: 0.4, Water: 0.3, Earth: 0.5, Air: 0.2 }, tags: ["rich", "creamy"], allergens: ["dairy"] },
  { id: "olive-oil", name: "Olive Oil", amount: 2, unit: "tbsp", category: "fat", cuisine: "mediterranean", seasonality: "all", elementalProperties: { Fire: 0.4, Water: 0.2, Earth: 0.5, Air: 0.3 }, tags: ["healthy-fat", "fruity"] },
  { id: "coconut-milk", name: "Coconut Milk", amount: 1, unit: "can", category: "fat", cuisine: "thai", seasonality: "all", elementalProperties: { Fire: 0.2, Water: 0.6, Earth: 0.4, Air: 0.2 }, tags: ["creamy", "tropical"] },
  { id: "parmesan", name: "Parmesan Cheese", amount: 0.5, unit: "cup", category: "dairy", cuisine: "italian", seasonality: "all", elementalProperties: { Fire: 0.3, Water: 0.2, Earth: 0.7, Air: 0.3 }, tags: ["umami", "aged"], allergens: ["dairy"] },
  { id: "heavy-cream", name: "Heavy Cream", amount: 1, unit: "cup", category: "dairy", cuisine: "french", seasonality: "all", elementalProperties: { Fire: 0.2, Water: 0.5, Earth: 0.4, Air: 0.3 }, tags: ["rich", "luscious"], allergens: ["dairy"] },
  { id: "yogurt", name: "Greek Yogurt", amount: 1, unit: "cup", category: "dairy", cuisine: "mediterranean", seasonality: "all", elementalProperties: { Fire: 0.1, Water: 0.5, Earth: 0.4, Air: 0.4 }, tags: ["tangy", "probiotic"], allergens: ["dairy"] },

  // ===== SPICES & SEASONINGS (8) =====
  { id: "cumin", name: "Cumin", amount: 1, unit: "tsp", category: "spice", cuisine: "indian", seasonality: "all", elementalProperties: { Fire: 0.6, Water: 0.1, Earth: 0.5, Air: 0.3 }, tags: ["warming", "earthy"] },
  { id: "turmeric", name: "Turmeric", amount: 1, unit: "tsp", category: "spice", cuisine: "indian", seasonality: "all", elementalProperties: { Fire: 0.5, Water: 0.2, Earth: 0.5, Air: 0.3 }, tags: ["anti-inflammatory", "golden"] },
  { id: "smoked-paprika", name: "Smoked Paprika", amount: 1, unit: "tsp", category: "spice", cuisine: "spanish", seasonality: "all", elementalProperties: { Fire: 0.7, Water: 0.1, Earth: 0.4, Air: 0.3 }, tags: ["smoky", "sweet-heat"] },
  { id: "cinnamon", name: "Cinnamon", amount: 0.5, unit: "tsp", category: "spice", cuisine: "middle-eastern", seasonality: "all", elementalProperties: { Fire: 0.5, Water: 0.1, Earth: 0.4, Air: 0.5 }, tags: ["warming", "sweet"] },
  { id: "soy-sauce", name: "Soy Sauce", amount: 2, unit: "tbsp", category: "condiment", cuisine: "asian", seasonality: "all", elementalProperties: { Fire: 0.3, Water: 0.5, Earth: 0.5, Air: 0.2 }, tags: ["umami", "salty"], allergens: ["soy"] },
  { id: "fish-sauce", name: "Fish Sauce", amount: 1, unit: "tbsp", category: "condiment", cuisine: "thai", seasonality: "all", elementalProperties: { Fire: 0.3, Water: 0.6, Earth: 0.4, Air: 0.2 }, tags: ["funky", "umami"], allergens: ["fish"] },
  { id: "miso-paste", name: "Miso Paste", amount: 2, unit: "tbsp", category: "condiment", cuisine: "japanese", seasonality: "all", elementalProperties: { Fire: 0.2, Water: 0.4, Earth: 0.6, Air: 0.3 }, tags: ["fermented", "umami"], allergens: ["soy"] },
  { id: "harissa", name: "Harissa Paste", amount: 1, unit: "tbsp", category: "condiment", cuisine: "middle-eastern", seasonality: "all", elementalProperties: { Fire: 0.8, Water: 0.2, Earth: 0.3, Air: 0.3 }, tags: ["spicy", "smoky"] },

  // ===== FRUITS & CITRUS (4) =====
  { id: "lemon", name: "Lemon", amount: 1, unit: "piece", category: "citrus", cuisine: "mediterranean", seasonality: "all", elementalProperties: { Fire: 0.3, Water: 0.6, Earth: 0.1, Air: 0.5 }, tags: ["acidic", "bright"] },
  { id: "lime", name: "Lime", amount: 1, unit: "piece", category: "citrus", cuisine: "mexican", seasonality: "all", elementalProperties: { Fire: 0.3, Water: 0.5, Earth: 0.1, Air: 0.6 }, tags: ["tart", "tropical"] },
  { id: "avocado", name: "Avocado", amount: 1, unit: "piece", category: "fruit", cuisine: "mexican", seasonality: ["spring", "summer"], elementalProperties: { Fire: 0.1, Water: 0.4, Earth: 0.6, Air: 0.3 }, tags: ["creamy", "healthy-fat"] },
  { id: "pomegranate", name: "Pomegranate Seeds", amount: 0.5, unit: "cup", category: "fruit", cuisine: "middle-eastern", seasonality: ["fall", "winter"], elementalProperties: { Fire: 0.3, Water: 0.6, Earth: 0.2, Air: 0.4 }, tags: ["jewel-like", "tart-sweet"] },
];

/**
 * Returns a list of all enhanced ingredients.
 * @returns {EnhancedRecipeIngredient[]}
 */
export function getEnhancedIngredients(): EnhancedRecipeIngredient[] {
  return [...ALL_ENHANCED_INGREDIENTS];
}
