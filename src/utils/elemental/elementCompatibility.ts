import { Element } from '@/types/alchemy';

/**
 * Element Compatibility Module
 *
 * This module implements element compatibility according to the Elemental Logic Principles:
 * 1. No opposing elements - all elements are individually valuable
 * 2. Elements reinforce themselves (like reinforces like)
 * 3. All element combinations have good compatibility
 * 4. No elemental 'balancing' - match based on individual qualities
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
  profile1: Record<Element, number>,
  profile2: Record<Element, number>,
): number {
  let totalCompatibility = 0;
  let totalWeight = 0;

  // For each element in profile1, calculate weighted compatibility with each element in profile2
  Object.entries(profile1 || {}).forEach(([element1, weight1]) => {
    Object.entries(profile2 || {}).forEach(([element2, weight2]) => {
      const compatibility = getElementalCompatibility(element1 as Element, element2 as Element);
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
export function enhanceElementalProfile(profile: Record<Element, number>): Record<Element, number> {
  const enhancedProfile: Record<Element, number> = { ...profile };

  // Find the strongest element
  let strongestElement: Element = 'Fire';
  let highestValue = profile.Fire;

  Object.entries(profile || {}).forEach(([element, value]) => {
    if (value > highestValue) {
      highestValue = value;
      strongestElement = element as Element;
    }
  });

  // Enhance the strongest element even more
  enhancedProfile[strongestElement] *= 1.2;

  // Normalize to ensure values still sum to same total
  const originalSum = Object.values(profile).reduce((sum, val) => sum + val, 0);
  const enhancedSum = Object.values(enhancedProfile).reduce((sum, val) => sum + val, 0);

  if (enhancedSum > 0) {
    const normalizeFactor = originalSum / enhancedSum;
    Object.keys(enhancedProfile || {}).forEach(element => {
      enhancedProfile[element as Element] *= normalizeFactor;
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
  elementalProfile: Record<Element, number>,
): Record<Element, number> {
  const total = Object.values(elementalProfile).reduce((sum, val) => sum + val, 0);

  if (total <= 0) {
    return { Fire: 25, Water: 25, Earth: 25, Air: 25 };
  }

  return {
    Fire: Math.round((elementalProfile.Fire / total) * 100),
    Water: Math.round((elementalProfile.Water / total) * 100),
    Earth: Math.round((elementalProfile.Earth / total) * 100),
    Air: Math.round((elementalProfile.Air / total) * 100),
  };
}

// Re-export Element type for components that need it
export type { Element } from '@/types/alchemy';
