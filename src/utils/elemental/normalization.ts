/**
 * Elemental Normalization Utilities
 *
 * This module provides utilities for normalizing elemental properties for DISPLAY ONLY.
 *
 * IMPORTANT: With the denormalization update, raw elemental values are now the standard
 * for calculations. These utilities should ONLY be used for UI display purposes.
 *
 * For calculations, use raw elemental values directly without normalization.
 * Raw values preserve true energetic intensity information that is lost during normalization.
 *
 * @example
 * // For calculations - use raw values directly
 * const rawProps = { Fire: 5.2, Water: 3.1, Earth: 1.8, Air: 1.2 };
 * const thermodynamics = calculateThermodynamicMetrics(alchemical, rawProps);
 *
 * // For display only - normalize to percentages
 * const displayProps = normalizeForDisplay(rawProps);
 * // Result: { Fire: 0.46, Water: 0.27, Earth: 0.16, Air: 0.11 }
 */

import type {
  Element,
  ElementalProperties,
  NormalizedElementalProperties,
  RawElementalProperties,
} from "@/types/alchemy";
import {
  NORMALIZED_DEFAULT_PROPERTIES,
  VALIDATION_THRESHOLDS,
} from "@/constants/elementalCore";

/**
 * Normalize raw elemental properties to percentages (0.0-1.0) for display
 * Used ONLY for UI display purposes, NOT for calculations
 *
 * @param properties - Raw elemental properties (may have values > 1.0)
 * @returns Normalized elemental properties (sum = 1.0, each value 0.0-1.0)
 *
 * @example
 * const raw = { Fire: 5.2, Water: 3.1, Earth: 1.8, Air: 1.2 };
 * const display = normalizeForDisplay(raw);
 * // Result: { Fire: 0.46, Water: 0.27, Earth: 0.16, Air: 0.11 }
 */
export function normalizeForDisplay(
  properties: RawElementalProperties | ElementalProperties,
): NormalizedElementalProperties {
  const total =
    properties.Fire + properties.Water + properties.Earth + properties.Air;

  if (total === 0) {
    return { ...NORMALIZED_DEFAULT_PROPERTIES };
  }

  return {
    Fire: properties.Fire / total,
    Water: properties.Water / total,
    Earth: properties.Earth / total,
    Air: properties.Air / total,
  };
}

/**
 * Get total elemental intensity (sum of all elements)
 * Useful for understanding the overall energetic magnitude of properties
 *
 * @param properties - Raw elemental properties
 * @returns Total intensity (sum of Fire + Water + Earth + Air)
 *
 * @example
 * const props = { Fire: 5.2, Water: 3.1, Earth: 1.8, Air: 1.2 };
 * const total = getTotalIntensity(props);
 * // Result: 11.3
 */
export function getTotalIntensity(
  properties: RawElementalProperties | ElementalProperties,
): number {
  return (
    properties.Fire + properties.Water + properties.Earth + properties.Air
  );
}

/**
 * Get dominant element by absolute value (not percentage)
 * For raw values, this gives the element with the highest intensity
 *
 * @param properties - Raw or normalized elemental properties
 * @returns The dominant element
 *
 * @example
 * const props = { Fire: 5.2, Water: 3.1, Earth: 1.8, Air: 1.2 };
 * const dominant = getDominantElementByIntensity(props);
 * // Result: "Fire"
 */
export function getDominantElementByIntensity(
  properties: RawElementalProperties | ElementalProperties,
): Element {
  const entries = Object.entries(properties).filter(([key]) =>
    ["Fire", "Water", "Earth", "Air"].includes(key),
  ) as [Element, number][];
  return entries.reduce((a, b) => (a[1] > b[1] ? a : b))[0];
}

/**
 * Check if properties appear to be normalized (sum ≈ 1.0)
 * Useful for detecting legacy normalized data
 *
 * @param properties - Properties to check
 * @returns True if properties appear to be normalized
 *
 * @example
 * const normalized = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
 * const raw = { Fire: 5.2, Water: 3.1, Earth: 1.8, Air: 1.2 };
 *
 * isNormalized(normalized); // true
 * isNormalized(raw); // false
 */
export function isNormalized(
  properties: ElementalProperties | RawElementalProperties,
): boolean {
  const total = getTotalIntensity(properties);
  return (
    Math.abs(total - 1) <= VALIDATION_THRESHOLDS.NORMALIZATION_SUM_TOLERANCE
  );
}

/**
 * Convert normalized properties to raw values using a reference intensity
 *
 * This is useful for backwards compatibility when processing legacy data
 * that was stored as normalized values. The reference intensity determines
 * the scale of the resulting raw values.
 *
 * @param properties - Normalized elemental properties (sum ≈ 1.0)
 * @param referenceIntensity - Target total intensity (default: 4.0)
 * @returns Raw elemental properties scaled to reference intensity
 *
 * @example
 * const normalized = { Fire: 0.45, Water: 0.30, Earth: 0.15, Air: 0.10 };
 * const raw = convertNormalizedToRaw(normalized, 10);
 * // Result: { Fire: 4.5, Water: 3.0, Earth: 1.5, Air: 1.0 }
 */
export function convertNormalizedToRaw(
  properties: NormalizedElementalProperties | ElementalProperties,
  referenceIntensity = 4.0,
): RawElementalProperties {
  const sum = getTotalIntensity(properties);

  // If sum ≈ 1.0, assume normalized and scale
  if (Math.abs(sum - 1.0) < VALIDATION_THRESHOLDS.NORMALIZATION_SUM_TOLERANCE) {
    return {
      Fire: properties.Fire * referenceIntensity,
      Water: properties.Water * referenceIntensity,
      Earth: properties.Earth * referenceIntensity,
      Air: properties.Air * referenceIntensity,
    };
  }

  // Otherwise, assume already raw and return as-is
  return {
    Fire: properties.Fire,
    Water: properties.Water,
    Earth: properties.Earth,
    Air: properties.Air,
  };
}

/**
 * Get relative strength of each element as a multiplier
 * Useful for understanding how much stronger one element is than the average
 *
 * @param properties - Raw elemental properties
 * @returns Object with relative strength multipliers for each element
 *
 * @example
 * const props = { Fire: 8.0, Water: 2.0, Earth: 2.0, Air: 2.0 };
 * const strengths = getRelativeStrengths(props);
 * // Result: { Fire: 2.29, Water: 0.57, Earth: 0.57, Air: 0.57 }
 * // (Fire is 2.29x the average, others are 0.57x)
 */
export function getRelativeStrengths(
  properties: RawElementalProperties | ElementalProperties,
): Record<Element, number> {
  const total = getTotalIntensity(properties);
  const average = total / 4;

  if (average === 0) {
    return { Fire: 1, Water: 1, Earth: 1, Air: 1 };
  }

  return {
    Fire: properties.Fire / average,
    Water: properties.Water / average,
    Earth: properties.Earth / average,
    Air: properties.Air / average,
  };
}

/**
 * Format elemental properties for display with percentages
 *
 * @param properties - Raw or normalized elemental properties
 * @returns Object with formatted percentage strings
 *
 * @example
 * const props = { Fire: 5.2, Water: 3.1, Earth: 1.8, Air: 1.2 };
 * const formatted = formatAsPercentages(props);
 * // Result: { Fire: "46.0%", Water: "27.4%", Earth: "15.9%", Air: "10.6%" }
 */
export function formatAsPercentages(
  properties: RawElementalProperties | ElementalProperties,
  decimals = 1,
): Record<Element, string> {
  const normalized = normalizeForDisplay(properties);

  return {
    Fire: `${(normalized.Fire * 100).toFixed(decimals)}%`,
    Water: `${(normalized.Water * 100).toFixed(decimals)}%`,
    Earth: `${(normalized.Earth * 100).toFixed(decimals)}%`,
    Air: `${(normalized.Air * 100).toFixed(decimals)}%`,
  };
}

/**
 * Compare two sets of elemental properties by intensity
 *
 * Returns positive values where properties1 is stronger, negative where weaker
 *
 * @param properties1 - First set of elemental properties
 * @param properties2 - Second set of elemental properties
 * @returns Difference object (positive = properties1 stronger)
 *
 * @example
 * const recipe = { Fire: 5.2, Water: 3.1, Earth: 1.8, Air: 1.2 };
 * const user = { Fire: 3.0, Water: 4.0, Earth: 2.0, Air: 1.0 };
 * const diff = compareIntensities(recipe, user);
 * // Result: { Fire: 2.2, Water: -0.9, Earth: -0.2, Air: 0.2 }
 */
export function compareIntensities(
  properties1: RawElementalProperties | ElementalProperties,
  properties2: RawElementalProperties | ElementalProperties,
): Record<Element, number> {
  return {
    Fire: properties1.Fire - properties2.Fire,
    Water: properties1.Water - properties2.Water,
    Earth: properties1.Earth - properties2.Earth,
    Air: properties1.Air - properties2.Air,
  };
}

export default {
  normalizeForDisplay,
  getTotalIntensity,
  getDominantElementByIntensity,
  isNormalized,
  convertNormalizedToRaw,
  getRelativeStrengths,
  formatAsPercentages,
  compareIntensities,
};
