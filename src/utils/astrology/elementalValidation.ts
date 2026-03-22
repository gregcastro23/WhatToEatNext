/**
 * Elemental Properties Validation Utilities
 *
 * Provides validation functions for elemental properties structures
 * to ensure consistency across astrological calculations.
 */

import type { ElementalProperties } from "@/types/alchemy";
import { logger } from "@/utils/logger";

/**
 * Constants for elemental calculations
 */
export const ELEMENTAL_CONSTANTS = {
  MIN_ELEMENT_VALUE: 0.05,
  MAX_ELEMENT_VALUE: 1.0,
  DEFAULT_ELEMENT_VALUE: 0.25,
  SELF_REINFORCEMENT_THRESHOLD: 0.3,
  HARMONY_THRESHOLD: 0.7,
  SAME_ELEMENT_COMPATIBILITY: 0.9,
  DIFFERENT_ELEMENT_COMPATIBILITY: 0.7,
  FIRE_AIR_COMPATIBILITY: 0.8,
  WATER_EARTH_COMPATIBILITY: 0.8,
} as const;

/**
 * Validate elemental properties structure and values
 */
export function validateElementalProperties(
  properties: unknown,
): properties is ElementalProperties {
  if (!properties || typeof properties !== "object") {
    logger.warn("Elemental properties must be an object");
    return false;
  }

  const props = properties as any;
  const REQUIRED_ELEMENTS = ["Fire", "Water", "Earth", "Air"];

  // Check for required elements
  for (const element of REQUIRED_ELEMENTS) {
    if (!(element in props)) {
      logger.warn(`Missing required element: ${element}`);
      return false;
    }

    const value = props[element];
    if (typeof value !== "number") {
      logger.warn(`Element ${element} must be a number, got ${typeof value}`);
      return false;
    }

    if (value < 0 || value > 1) {
      logger.warn(`Element ${element} value ${value} must be between 0 and 1`);
      return false;
    }
  }

  return true;
}

/**
 * Normalize elemental properties to ensure valid structure
 * Throws error if properties are missing or invalid
 */
export function normalizeElementalProperties(
  properties: Partial<ElementalProperties>,
): ElementalProperties {
  if (!properties || typeof properties !== "object") {
    throw new Error(
      "Cannot normalize: elemental properties must be a valid object",
    );
  }

  const normalized: ElementalProperties = {
    Fire: ELEMENTAL_CONSTANTS.DEFAULT_ELEMENT_VALUE,
    Water: ELEMENTAL_CONSTANTS.DEFAULT_ELEMENT_VALUE,
    Earth: ELEMENTAL_CONSTANTS.DEFAULT_ELEMENT_VALUE,
    Air: ELEMENTAL_CONSTANTS.DEFAULT_ELEMENT_VALUE,
  };

  let hasValidElement = false;

  // Apply provided values if valid
  Object.entries(properties).forEach(([element, value]) => {
    if (
      element in normalized &&
      typeof value === "number" &&
      value >= 0 &&
      value <= 1
    ) {
      (normalized as any)[element] = value;
      hasValidElement = true;
    }
  });

  if (!hasValidElement) {
    throw new Error(
      "Cannot normalize: no valid elemental properties found in input",
    );
  }

  return normalized;
}

/**
 * Calculate elemental harmony score between two sets of properties
 */
export function calculateElementalHarmony(
  source: ElementalProperties,
  target: ElementalProperties,
): number {
  if (
    !validateElementalProperties(source) ||
    !validateElementalProperties(target)
  ) {
    throw new Error(
      "Invalid elemental properties provided for harmony calculation",
    );
  }

  let totalHarmony = 0;
  let weightedSum = 0;

  const elements = ["Fire", "Water", "Earth", "Air"] as const;

  for (const element of elements) {
    const sourceStrength = source[element];
    const targetStrength = target[element];

    if (sourceStrength > 0 && targetStrength > 0) {
      // Self-reinforcement: same elements have highest compatibility (0.9)
      const compatibility = ELEMENTAL_CONSTANTS.SAME_ELEMENT_COMPATIBILITY;
      const weight = Math.min(sourceStrength, targetStrength);

      totalHarmony += compatibility * weight;
      weightedSum += weight;
    }
  }

  // Calculate cross-element compatibility for remaining strength
  for (const sourceElement of elements) {
    for (const targetElement of elements) {
      if (sourceElement !== targetElement) {
        const sourceStrength = source[sourceElement];
        const targetStrength = target[targetElement];

        if (sourceStrength > 0 && targetStrength > 0) {
          // Different elements have good compatibility (0.7-0.8)
          const compatibility = getElementalCompatibility(
            sourceElement,
            targetElement,
          );
          const weight = Math.min(sourceStrength, targetStrength) * 0.5; // Reduced weight for cross-element

          totalHarmony += compatibility * weight;
          weightedSum += weight;
        }
      }
    }
  }

  if (weightedSum === 0) {
    throw new Error(
      "Cannot calculate harmony with zero weighted sum - check elemental properties",
    );
  }

  // Ensure minimum compatibility of 0.7 (per project design: all combinations work)
  return Math.max(ELEMENTAL_CONSTANTS.HARMONY_THRESHOLD, totalHarmony / weightedSum);
}

/**
 * Get compatibility score between different elements
 */
function getElementalCompatibility(
  source: keyof ElementalProperties,
  target: keyof ElementalProperties,
): number {
  const compatibilityMatrix = {
    Fire: { 
      Water: ELEMENTAL_CONSTANTS.DIFFERENT_ELEMENT_COMPATIBILITY, 
      Earth: ELEMENTAL_CONSTANTS.DIFFERENT_ELEMENT_COMPATIBILITY, 
      Air: ELEMENTAL_CONSTANTS.FIRE_AIR_COMPATIBILITY 
    },
    Water: { 
      Fire: ELEMENTAL_CONSTANTS.DIFFERENT_ELEMENT_COMPATIBILITY, 
      Earth: ELEMENTAL_CONSTANTS.WATER_EARTH_COMPATIBILITY, 
      Air: ELEMENTAL_CONSTANTS.DIFFERENT_ELEMENT_COMPATIBILITY 
    },
    Earth: { 
      Fire: ELEMENTAL_CONSTANTS.DIFFERENT_ELEMENT_COMPATIBILITY, 
      Water: ELEMENTAL_CONSTANTS.WATER_EARTH_COMPATIBILITY, 
      Air: ELEMENTAL_CONSTANTS.DIFFERENT_ELEMENT_COMPATIBILITY 
    },
    Air: { 
      Fire: ELEMENTAL_CONSTANTS.FIRE_AIR_COMPATIBILITY, 
      Water: ELEMENTAL_CONSTANTS.DIFFERENT_ELEMENT_COMPATIBILITY, 
      Earth: ELEMENTAL_CONSTANTS.DIFFERENT_ELEMENT_COMPATIBILITY 
    },
  };

  return compatibilityMatrix[source][target] || ELEMENTAL_CONSTANTS.DIFFERENT_ELEMENT_COMPATIBILITY;
}

/**
 * Get the dominant element from elemental properties
 */
export function getDominantElement(
  properties: ElementalProperties,
): keyof ElementalProperties {
  if (!validateElementalProperties(properties)) {
    logger.warn("Invalid elemental properties, defaulting to Fire");
    return "Fire";
  }

  const elements = Object.entries(properties) as Array<
    [keyof ElementalProperties, number]
  >;
  const dominant = elements.reduce((max, current) =>
    current[1] > max[1] ? current : max,
  );

  return dominant[0];
}

/**
 * Enhance elemental properties by boosting the dominant element
 */
export function enhanceDominantElement(
  properties: ElementalProperties,
): ElementalProperties {
  if (!validateElementalProperties(properties)) {
    return normalizeElementalProperties(properties);
  }

  const dominant = getDominantElement(properties);
  const enhanced = { ...properties };

  // Self-reinforcement: boost the dominant element by 10%
  enhanced[dominant] = Math.min(1.0, properties[dominant] * 1.1);

  return enhanced;
}

/**
 * Create elemental properties from a dominant element
 */
export function createElementalProperties(
  dominantElement: keyof ElementalProperties,
  strength = 0.7,
): ElementalProperties {
  const properties: ElementalProperties = {
    Fire: 0.1,
    Water: 0.1,
    Earth: 0.1,
    Air: 0.1,
  };

  // Set the dominant element strength
  properties[dominantElement] = Math.max(0.1, Math.min(1.0, strength));

  // Distribute remaining strength among other elements
  const remainingStrength = Math.max(0, 1.0 - properties[dominantElement]);
  const otherElements = (["Fire", "Water", "Earth", "Air"] as const).filter(
    (e) => e !== dominantElement,
  );
  const perElement = remainingStrength / otherElements.length;

  otherElements.forEach((element) => {
    properties[element] = Math.max(0.05, perElement);
  });

  return properties;
}

/**
 * Validate that elemental properties follow self-reinforcement principles
 */
export function validateSelfReinforcement(
  properties: ElementalProperties,
): boolean {
  if (!validateElementalProperties(properties)) {
    return false;
  }

  const dominant = getDominantElement(properties);
  const dominantValue = properties[dominant];

  // Dominant element should be at least threshold for clear self-reinforcement
  if (dominantValue < ELEMENTAL_CONSTANTS.SELF_REINFORCEMENT_THRESHOLD) {
    logger.warn(
      `Dominant element ${dominant} strength ${dominantValue} is too low for self-reinforcement`,
    );
    return false;
  }

  return true;
}
