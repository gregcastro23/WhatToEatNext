/**
 * Planetary Alchemy Mapping - Authoritative Source
 *
 * This module contains the ONLY correct method for calculating ESMS properties
 * (Spirit, Essence, Matter, Substance) from planetary positions.
 *
 * CRITICAL: ESMS values CANNOT be derived from elemental properties (Fire/Water/Earth/Air).
 * They MUST be calculated from planetary alchemy values.
 *
 * Based on the core alchemizer engine specification.
 *
 * Sectarian Logic (January 2026):
 * Each planet has two elemental natures - one for the day sect (diurnal) and one
 * for the night sect (nocturnal). Saturn, for example, is Air by day and Earth by
 * night. These sectarian elements drive the dynamic elemental profile of the sky.
 */

import { PLANET_WEIGHTS, normalizePlanetWeight } from "@/data/planets";
import type { ElementalProperties } from "@/types/alchemy";

export interface AlchemicalProperties {
  Spirit: number;
  Essence: number;
  Matter: number;
  Substance: number;
}

/**
 * Planetary Alchemy Values (Authoritative from Alchemizer Engine)
 *
 * Each planet contributes specific ESMS values:
 * - Sun: Pure Spirit (consciousness, vitality)
 * - Moon: Essence + Matter (emotion, substance)
 * - Mercury: Spirit + Substance (intellect, communication)
 * - Venus: Essence + Matter (beauty, harmony)
 * - Mars: Essence + Matter (action, energy)
 * - Jupiter: Spirit + Essence (expansion, wisdom)
 * - Saturn: Spirit + Matter (structure, discipline)
 * - Uranus: Essence + Matter (innovation, change)
 * - Neptune: Essence + Substance (intuition, dissolution)
 * - Pluto: Essence + Matter (transformation, power)
 */
export const PLANETARY_ALCHEMY = {
  Sun: { Spirit: 1, Essence: 0, Matter: 0, Substance: 0 },
  Moon: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
  Mercury: { Spirit: 1, Essence: 0, Matter: 0, Substance: 1 },
  Venus: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
  Mars: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
  Jupiter: { Spirit: 1, Essence: 1, Matter: 0, Substance: 0 },
  Saturn: { Spirit: 1, Essence: 0, Matter: 1, Substance: 0 },
  Uranus: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
  Neptune: { Spirit: 0, Essence: 1, Matter: 0, Substance: 1 },
  Pluto: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
} as const;

/**
 * Zodiac Sign to Element Mapping
 *
 * Used to aggregate elemental properties from planetary positions.
 * Each planet's sign contributes its element to the total.
 */
export const ZODIAC_ELEMENTS = {
  Aries: "Fire",
  Taurus: "Earth",
  Gemini: "Air",
  Cancer: "Water",
  Leo: "Fire",
  Virgo: "Earth",
  Libra: "Air",
  Scorpio: "Water",
  Sagittarius: "Fire",
  Capricorn: "Earth",
  Aquarius: "Air",
  Pisces: "Water",
} as const;

export type ZodiacSignType = keyof typeof ZODIAC_ELEMENTS;
export type PlanetName = keyof typeof PLANETARY_ALCHEMY;
export type AlchemicalElement = "Fire" | "Water" | "Earth" | "Air";
export type ZodiacQuality = "Cardinal" | "Fixed" | "Mutable";

/**
 * Planetary Sectarian Elements - Traditional Western Astrology
 *
 * In classical astrology each planet belongs to a sect (diurnal or nocturnal).
 * When it functions within its preferred sect it expresses one element; in the
 * contrary sect it expresses another. This produces the dynamic "live sky" profile
 * that shifts at every sunrise and sunset.
 *
 * Day sect planets: Sun, Jupiter, Saturn
 * Night sect planets: Moon, Venus, Mars
 * Mercury is adaptable - it joins whichever sect it rises with
 *
 * Diurnal / Nocturnal element assignments (traditional authority):
 *   Sun     Fire  / Fire    (luminary - always Fire)
 *   Moon    Water / Water   (luminary - always Water)
 *   Mercury Air   / Earth   (adapts to sect)
 *   Venus   Earth / Water
 *   Mars    Fire  / Water
 *   Jupiter Fire  / Air
 *   Saturn  Air   / Earth   ← key correction (was wrong before)
 *   Uranus  Air   / Air     (modern - airy by nature)
 *   Neptune Water / Water   (modern - watery by nature)
 *   Pluto   Water / Earth   (modern - transformative)
 */
export const PLANETARY_SECTARIAN_ELEMENTS = {
  Sun:     { diurnal: "Fire"  as AlchemicalElement, nocturnal: "Fire"  as AlchemicalElement },
  Moon:    { diurnal: "Water" as AlchemicalElement, nocturnal: "Water" as AlchemicalElement },
  Mercury: { diurnal: "Air"   as AlchemicalElement, nocturnal: "Earth" as AlchemicalElement },
  Venus:   { diurnal: "Earth" as AlchemicalElement, nocturnal: "Water" as AlchemicalElement },
  Mars:    { diurnal: "Fire"  as AlchemicalElement, nocturnal: "Water" as AlchemicalElement },
  Jupiter: { diurnal: "Fire"  as AlchemicalElement, nocturnal: "Air"   as AlchemicalElement },
  Saturn:  { diurnal: "Air"   as AlchemicalElement, nocturnal: "Earth" as AlchemicalElement },
  Uranus:  { diurnal: "Air"   as AlchemicalElement, nocturnal: "Air"   as AlchemicalElement },
  Neptune: { diurnal: "Water" as AlchemicalElement, nocturnal: "Water" as AlchemicalElement },
  Pluto:   { diurnal: "Water" as AlchemicalElement, nocturnal: "Earth" as AlchemicalElement },
} as const;

/**
 * Zodiac Sign Qualities (Modalities)
 *
 * Each sign belongs to one of three qualities that describe the MODE of its action:
 *   Cardinal - initiates, begins, leads (Aries, Cancer, Libra, Capricorn)
 *   Fixed    - sustains, concentrates, endures (Taurus, Leo, Scorpio, Aquarius)
 *   Mutable  - adapts, disperses, transitions (Gemini, Virgo, Sagittarius, Pisces)
 */
export const ZODIAC_QUALITIES: Record<string, ZodiacQuality> = {
  Aries:       "Cardinal",
  Taurus:      "Fixed",
  Gemini:      "Mutable",
  Cancer:      "Cardinal",
  Leo:         "Fixed",
  Virgo:       "Mutable",
  Libra:       "Cardinal",
  Scorpio:     "Fixed",
  Sagittarius: "Mutable",
  Capricorn:   "Cardinal",
  Aquarius:    "Fixed",
  Pisces:      "Mutable",
};

/**
 * Determine whether the current moment is diurnal (day) or nocturnal (night).
 *
 * A fully precise answer requires the observer's geographic coordinates and the
 * local sidereal time to compute the Sun's altitude above the horizon. Without
 * location data this function uses UTC hour as a reasonable approximation:
 * 06:00–18:00 UTC → diurnal, otherwise → nocturnal.
 *
 * @param date - Optional date/time to evaluate (defaults to now)
 * @returns true if diurnal (day), false if nocturnal (night)
 */
export function isSectDiurnal(date?: Date): boolean {
  const d = date ?? new Date();
  const hour = d.getUTCHours();
  return hour >= 6 && hour < 18;
}

/**
 * Get the sectarian element for a planet given the current sect.
 *
 * @param planet - Planet name (capitalised: "Sun", "Moon", etc.)
 * @param diurnal - true if the current sect is diurnal (day), false for nocturnal
 * @returns The element the planet expresses under the current sect
 */
export function getPlanetarySectElement(
  planet: string,
  diurnal: boolean,
): AlchemicalElement {
  const entry = PLANETARY_SECTARIAN_ELEMENTS[planet as keyof typeof PLANETARY_SECTARIAN_ELEMENTS];
  if (!entry) return "Air"; // safe fallback
  return diurnal ? entry.diurnal : entry.nocturnal;
}

/**
 * Get the quality (modality) for a zodiac sign.
 *
 * @param sign - Zodiac sign name (any capitalisation)
 * @returns Cardinal, Fixed, or Mutable
 */
export function getZodiacQuality(sign: string): ZodiacQuality {
  const key = sign.charAt(0).toUpperCase() + sign.slice(1).toLowerCase();
  return ZODIAC_QUALITIES[key] ?? "Mutable";
}

/**
 * Calculate ESMS (Alchemical) Properties from Planetary Positions
 *
 * This is the ONLY correct method for deriving Spirit, Essence, Matter, and Substance.
 *
 * @param planetaryPositions - Map of planet names to zodiac sign positions
 * @returns Alchemical properties (Spirit, Essence, Matter, Substance)
 *
 * @example
 * const positions = {
 *   Sun: 'Gemini',
 *   Moon: 'Leo',
 *   Mercury: 'Taurus',
 *   Venus: 'Gemini',
 *   Mars: 'Aries',
 *   Jupiter: 'Gemini',
 *   Saturn: 'Pisces',
 *   Uranus: 'Taurus',
 *   Neptune: 'Aries',
 *   Pluto: 'Aquarius'
 * };
 * const alchemical = calculateAlchemicalFromPlanets(positions);
 * // Result: { Spirit: 4, Essence: 6, Matter: 6, Substance: 2 }
 */
export function calculateAlchemicalFromPlanets(planetaryPositions: {
  [planet: string]: string;
}): AlchemicalProperties {
  const totals: AlchemicalProperties = {
    Spirit: 0,
    Essence: 0,
    Matter: 0,
    Substance: 0,
  };

  for (const planet in planetaryPositions) {
    const planetData = PLANETARY_ALCHEMY[planet as PlanetName];
    if (!planetData) {
      console.warn(`Unknown planet in alchemical calculation: ${planet}`);
      continue;
    }

    // Weight each planet's ESMS contribution by its log-normalized physical
    // mass so that massive bodies (Sun, Jupiter) dominate the chart profile.
    // Sun (w=1.0) → full contribution; Mercury (w≈0.17) → ~17% contribution.
    const relMass = PLANET_WEIGHTS[planet] ?? 1.0;
    const w = normalizePlanetWeight(relMass);

    totals.Spirit    += planetData.Spirit    * w;
    totals.Essence   += planetData.Essence   * w;
    totals.Matter    += planetData.Matter    * w;
    totals.Substance += planetData.Substance * w;
  }

  return totals;
}

/**
 * Aggregate Elemental Properties from Zodiac Sign Positions
 *
 * Each planet's zodiac sign contributes its element to the total.
 * Results are normalized to sum to 1.0.
 *
 * @param planetaryPositions - Map of planet names to zodiac sign positions
 * @returns Normalized elemental properties (Fire, Water, Earth, Air)
 *
 * @example
 * const positions = { Sun: 'Gemini', Moon: 'Leo', Mercury: 'Taurus' };
 * const elementals = aggregateZodiacElementals(positions);
 * // Result: { Fire: 0.33, Water: 0, Earth: 0.33, Air: 0.33 }
 */
export function aggregateZodiacElementals(planetaryPositions: {
  [planet: string]: string;
}): ElementalProperties {
  const totals = {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0,
  };

  let count = 0;

  for (const planet in planetaryPositions) {
    const sign = planetaryPositions[planet] as ZodiacSignType;
    const element = ZODIAC_ELEMENTS[sign];

    if (!element) {
      console.warn(`Unknown zodiac sign in elemental aggregation: ${sign}`);
      continue;
    }

    // Weight elemental contribution by planet's normalized physical mass.
    // Jupiter in Sagittarius adds ~7× more Fire than Mercury in Sagittarius.
    const relMass = PLANET_WEIGHTS[planet] ?? 1.0;
    const w = normalizePlanetWeight(relMass);
    totals[element] += w;
    count += w;
  }

  // Normalize to sum = 1.0
  if (count === 0) {
    // Default to balanced if no valid positions
    return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  }

  return {
    Fire: totals.Fire / count,
    Water: totals.Water / count,
    Earth: totals.Earth / count,
    Air: totals.Air / count,
  };
}

/**
 * Get the dominant alchemical property
 *
 * @param alchemical - Alchemical properties
 * @returns The name of the dominant property
 */
export function getDominantAlchemicalProperty(
  alchemical: AlchemicalProperties,
): keyof AlchemicalProperties {
  const entries = Object.entries(alchemical) as Array<
    [keyof AlchemicalProperties, number]
  >;
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

/**
 * Get the dominant element from elemental properties
 *
 * @param elemental - Elemental properties
 * @returns The name of the dominant element
 */
export function getDominantElement(
  elemental: ElementalProperties,
): keyof ElementalProperties {
  const entries = Object.entries(elemental) as Array<
    [keyof ElementalProperties, number]
  >;
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

/**
 * Get the full contribution profile for a single planet at a given moment.
 *
 * Returns:
 *   - ESMS values (from PLANETARY_ALCHEMY — the authoritative source)
 *   - The sect element the planet expresses under the current sect
 *   - The sign element (derived from the zodiac sign, if provided)
 *
 * This is the convenience function the UI should call for each planet card.
 *
 * @param planet   - Planet name (capitalised: "Sun", "Moon", etc.)
 * @param diurnal  - true if the current sect is diurnal (day)
 * @param sign     - Optional zodiac sign the planet occupies (for sign element)
 */
export function getCurrentPlanetaryContribution(
  planet: string,
  diurnal: boolean,
  sign?: string,
): {
  esms: AlchemicalProperties;
  sectElement: AlchemicalElement;
  signElement: AlchemicalElement | null;
} {
  const alchemy = PLANETARY_ALCHEMY[planet as PlanetName];
  const esms: AlchemicalProperties = alchemy
    ? { Spirit: alchemy.Spirit, Essence: alchemy.Essence, Matter: alchemy.Matter, Substance: alchemy.Substance }
    : { Spirit: 0, Essence: 0, Matter: 0, Substance: 0 };

  const sectElement = getPlanetarySectElement(planet, diurnal);

  let signElement: AlchemicalElement | null = null;
  if (sign) {
    const normalised = sign.charAt(0).toUpperCase() + sign.slice(1).toLowerCase();
    signElement = ZODIAC_ELEMENTS[normalised as ZodiacSignType] ?? null;
  }

  return { esms, sectElement, signElement };
}

/**
 * Validate planetary positions object
 *
 * @param positions - Object to validate
 * @returns True if valid, false otherwise
 */
export function validatePlanetaryPositions(
  positions: unknown,
): positions is { [planet: string]: string } {
  if (typeof positions !== "object" || positions === null) {
    return false;
  }

  const posObj = positions as { [key: string]: unknown };

  // Check that all values are strings
  for (const key in posObj) {
    if (typeof posObj[key] !== "string") {
      return false;
    }
  }

  return true;
}
