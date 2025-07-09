import { Element, ElementalProperties } from "@/types/alchemy";

// Utility array for safe iteration
const ELEMENTS: Element[] = ["Fire", "Water", "Earth", "Air"];

/**
 * Element Compatibility Module
 * 
 * This module implements element compatibility according to the Elemental Logic Principles:
 * 1. No opposing elements - all elements are individually valuable
 * 2. Elements reinforce themselves (like reinforces like)
 * 3. All element combinations have good compatibility
 * 4. No elemental "balancing" - match based on individual qualities
 */

/**
 * Calculate compatibility between two elements
 * Following the principle that all elements are harmonious
 * 
 * @param element1 First element
 * @param element2 Second element
 * @returns Compatibility score between 0 and 1
 */
export function getElementalCompatibility(element1: Element, element2: Element): number {
  // Same element has highest compatibility
  if (element1 === element2) {
    return 0.9; // Same element has high compatibility
  }
  // All different element combinations have good compatibility
  return 0.7; // Different elements have good compatibility
}

/**
 * Get the complementary element for a given element
 * Following the principle that each element complements itself most strongly
 * 
 * @param element The element to find complementary for
 * @returns The complementary element
 */
export function getComplementaryElement(element: Element): Element {
  // Each element complements itself most strongly
  return element; // Element reinforces itself
}

/**
 * Calculate the overall compatibility between two elemental profiles
 * 
 * @param profile1 First elemental profile
 * @param profile2 Second elemental profile
 * @returns Overall compatibility score between 0 and 1
 */
export function calculateElementalProfileCompatibility(
  profile1: ElementalProperties,
  profile2: ElementalProperties
): number {
  let totalCompatibility = 0;
  let totalWeight = 0;

  ELEMENTS.forEach(element1 => {
    const weight1 = profile1[element1] ?? 0;
    ELEMENTS.forEach(element2 => {
      const weight2 = profile2[element2] ?? 0;
      const compatibility = getElementalCompatibility(element1, element2);
      const combinedWeight = weight1 * weight2;
      totalCompatibility += compatibility * combinedWeight;
      totalWeight += combinedWeight;
    });
  });

  // Return weighted average compatibility
  return totalWeight > 0 ? totalCompatibility / totalWeight : 0.5;
}

/**
 * Enhance an elemental profile by reinforcing its existing elements
 * Following the principle that elements reinforce themselves
 * 
 * @param profile The elemental profile to enhance
 * @returns Enhanced elemental profile
 */
export function enhanceElementalProfile(
  profile: ElementalProperties
): ElementalProperties {
  const enhancedProfile: ElementalProperties = { ...profile };

  // Find the strongest element
  let strongestElement: Element = "Fire";
  let highestValue = profile["Fire"];
  ELEMENTS.forEach(element => {
    if (profile[element] > highestValue) {
      highestValue = profile[element];
      strongestElement = element;
    }
  });

  // Enhance the strongest element even more
  enhancedProfile[strongestElement] = (enhancedProfile[strongestElement] ?? 0) * 1.2;

  // Normalize to ensure values still sum to same total
  const originalSum = ELEMENTS.reduce((sum, el) => sum + (profile[el] ?? 0), 0);
  const enhancedSum = ELEMENTS.reduce((sum, el) => sum + (enhancedProfile[el] ?? 0), 0);

  if (enhancedSum > 0) {
    const normalizeFactor = originalSum / enhancedSum;
    ELEMENTS.forEach(element => {
      enhancedProfile[element] = (enhancedProfile[element] ?? 0) * normalizeFactor;
    });
  }

  return enhancedProfile;
}

/**
 * Display element values as percentages
 * 
 * @param elementalProfile Elemental profile to display
 * @returns Object with elements as percentages
 */
export function getElementalPercentages(
  elementalProfile: ElementalProperties
): ElementalProperties {
  const total = ELEMENTS.reduce((sum, el) => sum + (elementalProfile[el] ?? 0), 0);

  if (total <= 0) {
    return { Fire: 25, Water: 25, Earth: 25, Air: 25 };
  }

  return {
    Fire: Math.round(((elementalProfile.Fire ?? 0) / total) * 100),
    Water: Math.round(((elementalProfile.Water ?? 0) / total) * 100),
    Earth: Math.round(((elementalProfile.Earth ?? 0) / total) * 100),
    Air: Math.round(((elementalProfile.Air ?? 0) / total) * 100)
  };
}

// Re-export Element type for components that need it
export type { Element } from "@/types/alchemy";

// Backward-compatibility alias
export type _Element = Element; 