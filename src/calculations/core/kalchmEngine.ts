/**
 * Kalchm and Monica Constants Calculation Engine
 *
 * This module implements the core alchemical calculations using the exact formulas
 * for Kalchm (K_alchm) and Monica Constant (M) as specified in the system requirements.
 */

import {
  calculateKalchm as canonicalCalculateKalchm,
  calculateMonica,
  thermoQuotient,
} from "@/data/unified/alchemicalCalculations";
import type { ElementalProperties, PlanetaryPosition } from "@/types/alchemy";
import type { AlchemicalProperties } from "@/types/celestial";

export type { AlchemicalProperties };

/**
 * The four alchemical properties, as a closed key union.
 *
 * `AlchemicalProperties` declares a `[key: string]: number` index signature,
 * which makes `keyof AlchemicalProperties` widen to `string | number` — so any
 * lookup through it is an unchecked index access. Indexing through this union
 * instead hits the declared (always-present) properties.
 */
type AlchemicalPropertyKey = "Spirit" | "Essence" | "Matter" | "Substance";

/**
 * Elemental values derived from zodiac signs and planetary influences
 */
export interface ElementalValues {
  Fire: number;
  Water: number;
  Air: number;
  Earth: number;
}

/**
 * Complete thermodynamic calculation results
 */
export interface ThermodynamicResults {
  heat: number;
  entropy: number;
  reactivity: number;
  gregsEnergy: number;
  kalchm: number;
  monicaConstant: number;
}

/**
 * Complete alchemical calculation result
 */
export interface KalchmResult {
  alchemicalProperties: AlchemicalProperties;
  alchemicalCounts: AlchemicalProperties; // Alias for backward compatibility
  elementalValues: ElementalValues;
  thermodynamics: ThermodynamicResults;
  thermodynamicResults?: ThermodynamicResults; // Alias for backward compatibility
  dominantElement: keyof ElementalValues;
  dominantProperty: keyof AlchemicalProperties;
  timestamp: string;
}

interface ThermodynamicInputs {
  Spirit: number;
  Substance: number;
  Essence: number;
  Matter: number;
  Fire: number;
  Water: number;
  Air: number;
  Earth: number;
}

/**
 * Calculate Heat using the exact formula: * Heat = (Spirit^2 + Fire^2) / (Substance + Essence + Matter + Water + (Air || 0) + (Earth || 0))^2
 */
export function calculateHeat(
  {
    Spirit,
    Fire,
    Substance,
    Essence,
    Matter,
    Water,
    Air,
    Earth,
  }: ThermodynamicInputs,
): number {
  const numerator = Math.pow(Spirit, 2) + Math.pow(Fire, 2);
  const denominator = Math.pow(
    Substance + Essence + Matter + Water + (Air || 0) + (Earth || 0),
    2,
  );

  // Canonical pole handling (§18k k7/k30): exact wherever the ratio is defined,
  // the published THERMO_DEN_FLOOR substitution at a true pole, NaN propagation
  // for malformed input. The old `denominator === 0 ? 0.5` was a k12-class
  // fabrication — a flat invented ratio indistinguishable from a measurement,
  // and a THIRD divergent pole policy after canonical's and the second
  // engine's (#679 removed that one).
  return thermoQuotient(numerator, denominator);
}

/**
 * Calculate Entropy using the exact formula: * Entropy = (Spirit^2 + Substance^2 + Fire^2 + Air^2) / (Essence + Matter + Earth + Water)^2
 */
export function calculateEntropy(
  {
    Spirit,
    Substance,
    Fire,
    Air,
    Essence,
    Matter,
    Earth,
    Water,
  }: ThermodynamicInputs,
): number {
  const numerator =
    Math.pow(Spirit, 2) +
    Math.pow(Substance, 2) +
    Math.pow(Fire, 2) +
    Math.pow(Air, 2);
  const denominator = Math.pow(
    Essence + Matter + (Earth || 0) + (Water || 0),
    2,
  );

  // Canonical pole handling (§18k k7/k30): exact wherever the ratio is defined,
  // the published THERMO_DEN_FLOOR substitution at a true pole, NaN propagation
  // for malformed input. The old `denominator === 0 ? 0.5` was a k12-class
  // fabrication — a flat invented ratio indistinguishable from a measurement,
  // and a THIRD divergent pole policy after canonical's and the second
  // engine's (#679 removed that one).
  return thermoQuotient(numerator, denominator);
}

/**
 * Calculate Reactivity using the exact formula: * Reactivity = (Spirit^2 + Substance^2 + Essence^2 + Fire^2 + Air^2 + Water^2) / (Matter + Earth)^2
 */
export function calculateReactivity(
  {
    Spirit,
    Substance,
    Essence,
    Fire,
    Air,
    Water,
    Matter,
    Earth,
  }: ThermodynamicInputs,
): number {
  const numerator =
    Math.pow(Spirit, 2) +
    Math.pow(Substance, 2) +
    Math.pow(Essence, 2) +
    Math.pow(Fire, 2) +
    Math.pow(Air, 2) +
    Math.pow(Water, 2);
  const denominator = Math.pow((Matter || 0) + (Earth || 0), 2);

  // Canonical pole handling (§18k k7/k30): exact wherever the ratio is defined,
  // the published THERMO_DEN_FLOOR substitution at a true pole, NaN propagation
  // for malformed input. The old `denominator === 0 ? 0.5` was a k12-class
  // fabrication — a flat invented ratio indistinguishable from a measurement,
  // and a THIRD divergent pole policy after canonical's and the second
  // engine's (#679 removed that one).
  return thermoQuotient(numerator, denominator);
}

/**
 * Calculate Greg's Energy using the exact formula: * Greg's Energy = Heat - (Entropy × Reactivity)
 */
export function calculateGregsEnergy(
  heat: number,
  entropy: number,
  reactivity: number,
): number {
  return heat - entropy * reactivity;
}

/**
 * Calculate Kalchm (K_alchm) using the exact formula: * K_alchm = (Spirit^Spirit * Essence^Essence) / (Matter^Matter * Substance^Substance)
 */
export function calculateKAlchm(
  Spirit: number,
  Essence: number,
  Matter: number,
  Substance: number,
): number {
  // Delegates to THE canonical engine.
  //
  // This copy floored every axis at 0.1, and of all the strays it was the only
  // one that corrupted the DEGENERACY CLASSIFICATION rather than just the
  // magnitude. A floor at eps inflates kalchm by exactly eps^(-eps) − 1 per
  // zeroed axis — +25.8925% at 0.1 — so a truly degenerate chart (kalchm
  // exactly 1, |ln k| exactly 0) came back with |ln k| up to 0.2303, ABOVE the
  // measured healthy floor of 0.21878586815274545. It therefore read as a
  // perfectly HEALTHY chart rather than an equilibrium one, and monica was
  // computed from the divergence instead of returning φ.
  //
  // The floor was never needed: `Math.max(0.1, x)` was justified as avoiding
  // NaN, but 0**0 is exactly 1 in JS and x^x has a global minimum of
  // 0.6922006275556402, so neither NaN nor a zero denominator is reachable from
  // a non-negative axis. Only NEGATIVES produce NaN, and canonical clamps those.
  return canonicalCalculateKalchm({ Spirit, Essence, Matter, Substance });
}

/**
 * Calculate Monica Constant: M = -Greg's Energy / (Reactivity × ln(K_alchm))
 *
 * §14d — DELEGATES to the canonical engine. Name and signature kept so no
 * importer changes.
 *
 * It previously reimplemented the formula and agreed with the canonical engine
 * EXACTLY on healthy input (−2.705053 to the last digit), so this moves no
 * healthy value. It differed only in failure handling, and had no totality
 * contract at all — it could return NaN (kalchm ≤ 0, or ln(kalchm) === 0) and
 * **-Infinity** (reactivity === 0, which it never checked).
 *
 * -Infinity is worse than NaN: NaN poisons comparisons visibly, while -Infinity
 * silently wins every Math.min and sorts to the front of every list. Nothing
 * downstream guarded for either.
 *
 * It also had no near-degenerate band, so at kalchm = 1.0001 it returned
 * −18750.94 where the canonical engine returns φ — both finite, so undetectable.
 *
 * Pinned before and after in
 * `src/__tests__/thermodynamicDegenerateCharacterisation.test.ts`.
 */
export function calculateMonicaConstant(
  gregsEnergy: number,
  reactivity: number,
  K_alchm: number,
): number {
  return calculateMonica(gregsEnergy, reactivity, K_alchm);
}

/**
 * Map planetary positions to alchemical properties
 * Based on traditional planetary correspondences
 */
export function calculateAlchemicalProperties(planetaryPositions: {
  [key: string]: PlanetaryPosition;
}): AlchemicalProperties {
  const properties: AlchemicalProperties = {
    Spirit: 0,
    Essence: 0,
    Matter: 0,
    Substance: 0,
  };

  // Planetary to alchemical property mappings
  const planetaryMappings = {
    Sun: { Spirit: 1.0, Essence: 0.3, Matter: 0.2, Substance: 0.1 },
    Moon: { Spirit: 0.2, Essence: 1.0, Matter: 0.8, Substance: 0.3 },
    Mercury: { Spirit: 0.8, Essence: 0.2, Matter: 0.1, Substance: 0.9 },
    Venus: { Spirit: 0.3, Essence: 0.9, Matter: 0.7, Substance: 0.2 },
    Mars: { Spirit: 0.6, Essence: 0.8, Matter: 0.9, Substance: 0.1 },
    Jupiter: { Spirit: 0.9, Essence: 0.7, Matter: 0.2, Substance: 0.3 },
    Saturn: { Spirit: 0.7, Essence: 0.1, Matter: 0.9, Substance: 0.8 },
    Uranus: { Spirit: 0.4, Essence: 0.6, Matter: 0.3, Substance: 0.7 },
    Neptune: { Spirit: 0.2, Essence: 0.8, Matter: 0.4, Substance: 0.6 },
    Pluto: { Spirit: 0.5, Essence: 0.7, Matter: 0.9, Substance: 0.4 },
  };

  // Process each planet
  Object.entries(planetaryPositions || {}).forEach(([planet, position]) => {
    const planetKey =
      planet.charAt(0).toUpperCase() + planet.slice(1).toLowerCase();
    const mapping =
      planetaryMappings[planetKey as keyof typeof planetaryMappings];

    if (mapping && position) {
      // Base contribution
      let strength = 1.0;

      // Apply dignity modifiers if available
      if (position.sign) {
        strength *= getDignityModifier(planet, position.sign);
      }

      // Add to properties
      properties.Spirit += (mapping.Spirit || 0) * strength;
      properties.Essence += (mapping.Essence || 0) * strength;
      properties.Matter += (mapping.Matter || 0) * strength;
      properties.Substance += (mapping.Substance || 0) * strength;
    }
  });

  // Normalize to reasonable ranges (1-10 scale as in the example)
  const total =
    properties.Spirit +
    properties.Essence +
    properties.Matter +
    properties.Substance;
  if (total > 0) {
    const scale = 20 / total; // Scale to approximately match example values
    properties.Spirit = Math.max(1, properties.Spirit * scale);
    properties.Essence = Math.max(1, properties.Essence * scale);
    properties.Matter = Math.max(1, properties.Matter * scale);
    properties.Substance = Math.max(1, properties.Substance * scale);
  }

  return properties;
}

/**
 * Calculate elemental values from zodiac signs and planetary influences
 */
export function calculateElementalValues(planetaryPositions: {
  [key: string]: PlanetaryPosition;
}): ElementalValues {
  const elements: ElementalValues = { Fire: 0, Water: 0, Air: 0, Earth: 0 };

  // Sign to element mapping
  const signElements: Record<string, keyof ElementalValues> = {
    aries: "Fire",
    leo: "Fire",
    sagittarius: "Fire",
    cancer: "Water",
    scorpio: "Water",
    pisces: "Water",
    gemini: "Air",
    libra: "Air",
    aquarius: "Air",
    taurus: "Earth",
    virgo: "Earth",
    capricorn: "Earth",
  };

  // Process each planet's sign
  Object.entries(planetaryPositions || {}).forEach(([planet, position]) => {
    if (position.sign) {
      const element = signElements[position.sign.toLowerCase()];
      if (element) {
        // Weight by planet importance
        let weight = 1.0;
        const planetName =
          planet.charAt(0).toUpperCase() + planet.slice(1).toLowerCase();
        if (planetName === "Sun" || planetName === "Moon") {
          weight = 2.0;
        } else if (["Mercury", "Venus", "Mars"].includes(planetName)) {
          weight = 1.5;
        }

        elements[element] += weight;
      }
    }
  });

  // Normalize to 0.1-1.0 range as in the example
  const total = elements.Fire + elements.Water + elements.Air + elements.Earth;
  if (total > 0) {
    const scale = 2.9 / total; // Scale to match example range
    elements.Fire = Math.max(0.1, Math.min(1.0, elements.Fire * scale));
    elements.Water = Math.max(0.1, Math.min(1.0, elements.Water * scale));
    elements.Air = Math.max(0.1, Math.min(1.0, elements.Air * scale));
    elements.Earth = Math.max(0.1, Math.min(1.0, elements.Earth * scale));
  }

  return elements;
}

/**
 * Get dignity modifier for a planet in a sign
 */
function getDignityModifier(planet: string, sign: string): number {
  const dignities: Record<string, Record<string, number>> = {
    Sun: {
      leo: 1.5,
      aries: 1.3,
      aquarius: 0.7,
      libra: 0.5,
    },
    Moon: {
      cancer: 1.5,
      taurus: 1.3,
      capricorn: 0.7,
      scorpio: 0.5,
    },
    Mercury: {
      gemini: 1.5,
      virgo: 1.5,
      sagittarius: 0.7,
      pisces: 0.5,
    },
    Venus: {
      taurus: 1.5,
      libra: 1.5,
      pisces: 1.3,
      scorpio: 0.7,
      aries: 0.7,
      virgo: 0.5,
    },
    Mars: {
      aries: 1.5,
      scorpio: 1.5,
      capricorn: 1.3,
      libra: 0.7,
      taurus: 0.7,
      cancer: 0.5,
    },
    Jupiter: {
      sagittarius: 1.5,
      pisces: 1.5,
      cancer: 1.3,
      gemini: 0.7,
      virgo: 0.7,
      capricorn: 0.5,
    },
    Saturn: {
      capricorn: 1.5,
      aquarius: 1.5,
      libra: 1.3,
      cancer: 0.7,
      leo: 0.7,
      aries: 0.5,
    },
  };

  const planetKey =
    planet.charAt(0).toUpperCase() + planet.slice(1).toLowerCase();
  const signKey = sign.toLowerCase();
  return dignities[planetKey]?.[signKey] ?? 1.0;
}

/**
 * Main Kalchm calculation function
 * Integrates all calculations and returns complete results
 */
export function calculateKalchmResults(planetaryPositions: {
  [key: string]: PlanetaryPosition;
}): KalchmResult {
  // Calculate alchemical properties
  const alchemicalProperties =
    calculateAlchemicalProperties(planetaryPositions);

  // Calculate elemental values
  const elementalValues = calculateElementalValues(planetaryPositions);

  // Calculate thermodynamic properties
  const thermodynamicInputs = {
    Spirit: alchemicalProperties.Spirit,
    Substance: alchemicalProperties.Substance,
    Essence: alchemicalProperties.Essence,
    Matter: alchemicalProperties.Matter,
    Fire: elementalValues.Fire,
    Water: elementalValues.Water,
    Air: elementalValues.Air,
    Earth: elementalValues.Earth,
  };

  const heat = calculateHeat(thermodynamicInputs);
  const entropy = calculateEntropy(thermodynamicInputs);
  const reactivity = calculateReactivity(thermodynamicInputs);
  const gregsEnergy = calculateGregsEnergy(heat, entropy, reactivity);
  const kalchm = calculateKAlchm(
    alchemicalProperties.Spirit,
    alchemicalProperties.Essence,
    alchemicalProperties.Matter,
    alchemicalProperties.Substance,
  );
  const monicaConstant = calculateMonicaConstant(
    gregsEnergy,
    reactivity,
    kalchm,
  );

  // Determine dominant element and property
  const dominantElement = Object.entries(elementalValues).reduce((a, b) =>
    elementalValues[a[0] as keyof ElementalValues] >
    elementalValues[b[0] as keyof ElementalValues]
      ? a
      : b,
  )[0] as keyof ElementalValues;

  // `AlchemicalProperties` carries a `[key: string]: number` index signature,
  // so `keyof AlchemicalProperties` widens to `string | number` and every
  // lookup routes through the index signature (i.e. `number | undefined`).
  // Compare through the declared four-key union instead: the declared
  // properties are `number`, so the comparison is total. Purely a type change
  // — the reduce still walks the object's own runtime keys in insertion order
  // and still keeps the incumbent on a tie.
  const dominantProperty = Object.entries(alchemicalProperties).reduce(
    (a, b) =>
      alchemicalProperties[a[0] as AlchemicalPropertyKey] >
      alchemicalProperties[b[0] as AlchemicalPropertyKey]
        ? a
        : b,
  )[0] as keyof AlchemicalProperties;

  const thermoResults: ThermodynamicResults = {
    heat,
    entropy,
    reactivity,
    gregsEnergy,
    kalchm,
    monicaConstant,
  };

  return {
    alchemicalProperties,
    alchemicalCounts: alchemicalProperties,
    elementalValues,
    thermodynamics: thermoResults,
    thermodynamicResults: thermoResults,
    dominantElement,
    dominantProperty,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Convert KalchmResult to ElementalProperties format for compatibility
 */
export function toElementalProperties(
  result: KalchmResult,
): ElementalProperties {
  return {
    Fire: result.elementalValues.Fire,
    Water: result.elementalValues.Water,
    Air: result.elementalValues.Air,
    Earth: result.elementalValues.Earth,
  };
}

/**
 * Get dominant property from alchemical properties
 */
function getDominantProperty(
  properties: AlchemicalProperties,
): keyof AlchemicalProperties {
  return Object.entries(properties).reduce(
    (max, [key, value]) =>
      value > max.value
        ? { key, value }
        : max,
    { key: "Spirit", value: 0 },
  ).key;
}

/**
 * Default export providing all kalchm engine functionality
 */
const kalchmEngine = {
  calculateHeat,
  calculateEntropy,
  calculateReactivity,
  calculateGregsEnergy,
  calculateKAlchm,
  calculateMonicaConstant,
  calculateAlchemicalProperties,
  calculateElementalValues,
  calculateKalchmResults,
  toElementalProperties,
  getDominantProperty,
};

export default kalchmEngine;
