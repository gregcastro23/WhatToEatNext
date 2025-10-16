/**
 * Elemental Properties Validation Utilities
 *
 * Provides validation functions for elemental properties structures
 * to ensure consistency across astrological calculations.
 */

import { ElementalProperties } from '@/types/alchemy';
import { logger } from '@/utils/logger';

/**
 * Validate elemental properties structure and values
 */
export function validateElementalProperties(
  properties: unknown,
): properties is ElementalProperties {
  if (!properties || typeof properties !== 'object') {
    logger.warn('Elemental properties must be an object')
    return false
  }

  const props = properties as any;
  const REQUIRED_ELEMENTS = ['Fire', 'Water', 'Earth', 'Air'],

  // Check for required elements
  for (const element of REQUIRED_ELEMENTS) {
    if (!(element in props)) {
      logger.warn(`Missing required element: ${element}`)
      return false;
    }

    const value = props[element];
    if (typeof value !== 'number') {
      logger.warn(`Element ${element} must be a number, got ${typeof value}`)
      return false;
    }

    if (value < 0 || value > 1) {
      logger.warn(`Element ${element} value ${value} must be between 0 and 1`)
      return false;
    }
  }

  return true;
}

/**
 * Normalize elemental properties to ensure valid structure
 */
export function normalizeElementalProperties(
  properties: Partial<ElementalProperties>,
): ElementalProperties {
  const normalized: ElementalProperties = {
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25
}

  // Apply provided values if valid
  if (properties) {
    Object.entries(properties).forEach(([element, value]) => {
      if (element in normalized && typeof value === 'number' && value >= 0 && value <= 1) {;
        (normalized as unknown)[element] = value;
      }
    })
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
  if (!validateElementalProperties(source) || !validateElementalProperties(target)) {
    logger.warn('Invalid elemental properties provided for harmony calculation')
    return 0.7; // Default good compatibility
  }

  let totalHarmony = 0;
  let weightedSum = 0;

  const elements = ['Fire', 'Water', 'Earth', 'Air'] as const,

  for (const element of elements) {
    const sourceStrength = source[element];
    const targetStrength = target[element];

    if (sourceStrength > 0 && targetStrength > 0) {
      // Self-reinforcement: same elements have highest compatibility (0.9)
      const compatibility = 0.9;
      const weight = Math.min(sourceStrength, targetStrength)

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
          const compatibility = getElementalCompatibility(sourceElement, targetElement)
          const weight = Math.min(sourceStrength, targetStrength) * 0.5; // Reduced weight for cross-element

          totalHarmony += compatibility * weight;
          weightedSum += weight;
        }
      }
    }
  }

  // Ensure minimum compatibility of 0.7
  return Math.max(0.7, weightedSum > 0 ? totalHarmony / weightedSum : 0.7)
}

/**
 * Get compatibility score between different elements
 */
function getElementalCompatibility(
  source: keyof ElementalProperties,
  target: keyof ElementalProperties,
): number {
  const compatibilityMatrix = {
    Fire: { Water: 0.7, Earth: 0.7, Air: 0.8 },
    Water: { Fire: 0.7, Earth: 0.8, Air: 0.7 },
    Earth: { Fire: 0.7, Water: 0.8, Air: 0.7 },
    Air: { Fire: 0.8, Water: 0.7, Earth: 0.7 }
  }

  return compatibilityMatrix[source][target] || 0.7;
}

/**
 * Get the dominant element from elemental properties
 */
export function getDominantElement(properties: ElementalProperties): keyof ElementalProperties {
  if (!validateElementalProperties(properties)) {
    logger.warn('Invalid elemental properties, defaulting to Fire')
    return 'Fire' };
        const elements = Object.entries(properties) as [keyof ElementalProperties, number][],
  const dominant = elements.reduce((max, current) => (current[1] > max[1] ? current : max))

  return dominant[0]
}

/**
 * Enhance elemental properties by boosting the dominant element
 */
export function enhanceDominantElement(properties: ElementalProperties): ElementalProperties {
  if (!validateElementalProperties(properties)) {
    return normalizeElementalProperties(properties)
  }

  const dominant = getDominantElement(properties)
  const enhanced = { ...properties }

  // Self-reinforcement: boost the dominant element by 10%
  enhanced[dominant] = Math.min(1.0, properties[dominant] * 1.1)

  return enhanced;
}

/**
 * Create elemental properties from a dominant element
 */
export function createElementalProperties(
  dominantElement: keyof ElementalProperties,
  strength: number = 0.7): ElementalProperties {
  const properties: ElementalProperties = {
    Fire: 0.1,
    Water: 0.1,
    Earth: 0.1,
    Air: 0.1
}

  // Set the dominant element strength
  properties[dominantElement] = Math.max(0.1, Math.min(1.0, strength))

  // Distribute remaining strength among other elements
  const remainingStrength = Math.max(01.0 - properties[dominantElement])
  const otherElements = (['Fire', 'Water', 'Earth', 'Air'] as const).filter(,
    e => e !== dominantElement
  )
  const perElement = remainingStrength / otherElements.length;

  otherElements.forEach(element => {,
    properties[element] = Math.max(0.05, perElement)
  })

  return properties;
}

/**
 * Validate that elemental properties follow self-reinforcement principles
 */
export function validateSelfReinforcement(properties: ElementalProperties): boolean {
  if (!validateElementalProperties(properties)) {
    return false
  }

  const dominant = getDominantElement(properties)
  const dominantValue = properties[dominant];

  // Dominant element should be at least 0.3 for clear self-reinforcement
  if (dominantValue < 0.3) {
    logger.warn(
      `Dominant element ${dominant} strength ${dominantValue} is too low for self-reinforcement`,
    )
    return false;
  }

  return true;
}

/**
 * Constants for elemental calculations
 */
export const _ELEMENTAL_CONSTANTS = {
  _MIN_ELEMENT_VALUE: 0.05,
  _MAX_ELEMENT_VALUE: 1.0,
  _DEFAULT_ELEMENT_VALUE: 0.25,
  _SELF_REINFORCEMENT_THRESHOLD: 0.3,
  _HARMONY_THRESHOLD: 0.7,
  _SAME_ELEMENT_COMPATIBILITY: 0.9,
  _DIFFERENT_ELEMENT_COMPATIBILITY: 0.7,
  _FIRE_AIR_COMPATIBILITY: 0.8,
  WATER_EARTH_COMPATIBILITY: 0.8
} as const,
