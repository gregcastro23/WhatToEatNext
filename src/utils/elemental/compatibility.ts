/**
 * Elemental Properties Backwards Compatibility Layer
 *
 * This module provides utilities for handling legacy normalized data
 * during the transition to raw elemental values.
 *
 * Use these utilities when:
 * - Processing data from external sources that may be normalized
 * - Converting legacy database records
 * - Migrating existing ingredient/recipe data
 *
 * @example
 * // Convert legacy normalized data to raw values
 * const legacyData = { Fire: 0.45, Water: 0.30, Earth: 0.15, Air: 0.10 };
 * const rawData = ensureRawValues(legacyData);
 *
 * // Auto-detect and convert
 * const processed = autoConvertToRaw(unknownData);
 */

import type {
  ElementalProperties,
  NormalizedElementalProperties,
  RawElementalProperties,
} from "@/types/alchemy";
import {
  DEFAULT_ELEMENTAL_PROPERTIES,
  VALIDATION_THRESHOLDS,
  ZERO_ELEMENTAL_PROPERTIES,
} from "@/constants/elementalCore";
import { getTotalIntensity, isNormalized } from "./normalization";

/**
 * Reference intensity values for different ingredient categories
 * Used when converting normalized values back to raw
 */
export const CATEGORY_REFERENCE_INTENSITIES: Record<string, number> = {
  spice: 8.0,       // Spices have high elemental intensity
  herb: 6.0,        // Herbs have moderate-high intensity
  vegetable: 4.0,   // Vegetables have moderate intensity
  fruit: 3.5,       // Fruits have moderate intensity
  grain: 3.0,       // Grains have lower intensity
  protein: 4.5,     // Proteins have moderate intensity
  dairy: 3.0,       // Dairy has moderate-low intensity
  fat: 2.5,         // Fats/oils have lower intensity
  default: 4.0,     // Default reference for unknown categories
};

/**
 * Convert normalized properties to raw values
 *
 * If the properties appear to be normalized (sum ≈ 1.0), they are scaled
 * by the reference intensity. Otherwise, they are returned as-is.
 *
 * @param properties - Properties that may be normalized or raw
 * @param referenceIntensity - Target total intensity (default: 4.0)
 * @returns Raw elemental properties
 *
 * @example
 * const normalized = { Fire: 0.45, Water: 0.30, Earth: 0.15, Air: 0.10 };
 * const raw = convertNormalizedToRaw(normalized, 10);
 * // Result: { Fire: 4.5, Water: 3.0, Earth: 1.5, Air: 1.0 }
 */
export function convertNormalizedToRaw(
  properties: ElementalProperties | NormalizedElementalProperties,
  referenceIntensity = CATEGORY_REFERENCE_INTENSITIES.default,
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
 * Ensure properties are in raw format
 *
 * Automatically detects if properties are normalized and converts if needed.
 *
 * @param properties - Properties to ensure are raw
 * @param category - Optional category for reference intensity lookup
 * @returns Raw elemental properties
 */
export function ensureRawValues(
  properties: ElementalProperties | null | undefined,
  category?: string,
): RawElementalProperties {
  if (!properties) {
    return { ...ZERO_ELEMENTAL_PROPERTIES };
  }

  if (isNormalized(properties)) {
    const refIntensity =
      CATEGORY_REFERENCE_INTENSITIES[category?.toLowerCase() ?? ""] ||
      CATEGORY_REFERENCE_INTENSITIES.default;
    return convertNormalizedToRaw(properties, refIntensity);
  }

  return {
    Fire: properties.Fire,
    Water: properties.Water,
    Earth: properties.Earth,
    Air: properties.Air,
  };
}

/**
 * Auto-convert to raw values with intelligent detection
 *
 * Uses multiple heuristics to detect normalized data:
 * 1. Sum ≈ 1.0
 * 2. All values ≤ 1.0
 * 3. Values appear to be percentages
 *
 * @param properties - Properties to convert
 * @param options - Conversion options
 * @returns Raw elemental properties
 */
export function autoConvertToRaw(
  properties: ElementalProperties | null | undefined,
  options: {
    category?: string;
    forceConvert?: boolean;
    referenceIntensity?: number;
  } = {},
): RawElementalProperties {
  if (!properties) {
    return { ...ZERO_ELEMENTAL_PROPERTIES };
  }

  const { category, forceConvert = false, referenceIntensity } = options;

  // If force convert, always treat as normalized
  if (forceConvert) {
    const refIntensity =
      referenceIntensity ||
      CATEGORY_REFERENCE_INTENSITIES[category?.toLowerCase() ?? ""] ||
      CATEGORY_REFERENCE_INTENSITIES.default;
    return {
      Fire: properties.Fire * refIntensity,
      Water: properties.Water * refIntensity,
      Earth: properties.Earth * refIntensity,
      Air: properties.Air * refIntensity,
    };
  }

  // Check if appears normalized using multiple heuristics
  const sum = getTotalIntensity(properties);
  const allUnderOne = Object.values(properties).every(
    (v) => typeof v === "number" && v <= 1.0,
  );

  const appearsNormalized =
    Math.abs(sum - 1.0) < VALIDATION_THRESHOLDS.NORMALIZATION_SUM_TOLERANCE ||
    (allUnderOne && sum > 0 && sum <= 1.0);

  if (appearsNormalized) {
    const refIntensity =
      referenceIntensity ||
      CATEGORY_REFERENCE_INTENSITIES[category?.toLowerCase() ?? ""] ||
      CATEGORY_REFERENCE_INTENSITIES.default;
    return convertNormalizedToRaw(properties, refIntensity);
  }

  // Already raw
  return {
    Fire: properties.Fire,
    Water: properties.Water,
    Earth: properties.Earth,
    Air: properties.Air,
  };
}

/**
 * Validate and fix elemental properties with backwards compatibility
 *
 * Handles edge cases and ensures valid raw values:
 * - Converts normalized to raw if detected
 * - Clamps negative values to 0
 * - Replaces NaN/undefined with 0
 *
 * @param properties - Properties to validate and fix
 * @param options - Fix options
 * @returns Valid raw elemental properties
 */
export function validateAndFixProperties(
  properties: Partial<ElementalProperties> | null | undefined,
  options: {
    category?: string;
    allowNormalized?: boolean;
  } = {},
): RawElementalProperties {
  if (!properties) {
    return { ...ZERO_ELEMENTAL_PROPERTIES };
  }

  const { category, allowNormalized = false } = options;

  // Build complete properties with defaults for missing values
  const complete: RawElementalProperties = {
    Fire:
      typeof properties.Fire === "number" && isFinite(properties.Fire)
        ? Math.max(0, properties.Fire)
        : 0,
    Water:
      typeof properties.Water === "number" && isFinite(properties.Water)
        ? Math.max(0, properties.Water)
        : 0,
    Earth:
      typeof properties.Earth === "number" && isFinite(properties.Earth)
        ? Math.max(0, properties.Earth)
        : 0,
    Air:
      typeof properties.Air === "number" && isFinite(properties.Air)
        ? Math.max(0, properties.Air)
        : 0,
  };

  // If all zeros, return default
  const sum = complete.Fire + complete.Water + complete.Earth + complete.Air;
  if (sum === 0) {
    // Return balanced defaults (these will be raw balanced values)
    return allowNormalized
      ? { ...DEFAULT_ELEMENTAL_PROPERTIES }
      : {
          Fire: 1,
          Water: 1,
          Earth: 1,
          Air: 1,
        };
  }

  // Convert from normalized if detected and not allowed
  if (!allowNormalized && isNormalized(complete)) {
    return ensureRawValues(complete, category);
  }

  return complete;
}

/**
 * Create a migration report for a set of properties
 *
 * Useful for auditing existing data before migration.
 *
 * @param properties - Properties to analyze
 * @returns Migration report
 */
export function createMigrationReport(
  properties: ElementalProperties | null | undefined,
): {
  isNormalized: boolean;
  totalIntensity: number;
  suggestedAction: "convert" | "keep" | "invalid";
  convertedValues?: RawElementalProperties;
} {
  if (!properties) {
    return {
      isNormalized: false,
      totalIntensity: 0,
      suggestedAction: "invalid",
    };
  }

  const total = getTotalIntensity(properties);
  const normalized = isNormalized(properties);

  if (normalized) {
    return {
      isNormalized: true,
      totalIntensity: total,
      suggestedAction: "convert",
      convertedValues: convertNormalizedToRaw(
        properties,
        CATEGORY_REFERENCE_INTENSITIES.default,
      ),
    };
  }

  return {
    isNormalized: false,
    totalIntensity: total,
    suggestedAction: "keep",
  };
}

export default {
  CATEGORY_REFERENCE_INTENSITIES,
  convertNormalizedToRaw,
  ensureRawValues,
  autoConvertToRaw,
  validateAndFixProperties,
  createMigrationReport,
};
