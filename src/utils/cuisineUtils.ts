import type { Modality } from '@/data/ingredients/types';
import type { ElementalProperties } from '@/types/alchemy';
import { getDominantElement } from '@/utils/elemental/elementalUtils';

/**
 * Determines the modality of a cuisine based on its elemental properties
 * Implementing hierarchical affinities:
 * - Mutability: Air > Water > Fire > Earth
 * - Fixed: Earth > Water > Fire > Air
 * - Cardinal: Equal for all elements
 *
 * @param elementalProperties The elemental properties of the cuisine
 * @returns The modality (Cardinal, Fixed, or Mutable)
 */
export function determineModalityFromElements(_elementalProperties: ElementalProperties): any {
  const { Fire, Water, Earth, Air} = elementalProperties;

  // Determine dominant element
  const dominantElement = getDominantElement(elementalProperties)

  // Primary determination based on dominant element and its strength
  switch (dominantElement) {
    case 'Air':
      // Air has strongest affinity with Mutable, then Cardinal, then Fixed
      if (Air > 0.5) {
        return 'Mutable';
      }
      break;
    case 'Earth':
      // Earth has strongest affinity with Fixed, then Cardinal, then Mutable
      if (Earth > 0.5) {
        return 'Fixed';
      }
      break;
    case 'Fire': // Fire has balanced affinities but leans Cardinal
      if (Fire > 0.5) {
        return 'Cardinal'
      }
      break;
    case 'Water': // Water is balanced between Fixed and Mutable
      if (Water > 0.5) {
        // Slightly favor Mutable for Wateras per our hierarchy
        return Water > 0.7 ? 'Mutable' : 'Fixed'
      }
      break;
  }

  // Calculate modality scores based on hierarchical affinities
  const mutableScore = Air * 0.9 + Water * 0.8 + Fire * 0.7 + Earth * 0.5;
  const fixedScore = Earth * 0.9 + Water * 0.8 + Fire * 0.6 + Air * 0.5;
  const cardinalScore = Fire * 0.8 + Earth * 0.8 + Water * 0.8 + Air * 0.8;

  // Return the modality with the highest score
  if (mutableScore > fixedScore && mutableScore > cardinalScore) {
    return 'Mutable';
  } else if (fixedScore > mutableScore && fixedScore > cardinalScore) {
    return 'Fixed';
  } else {
    return 'Cardinal';
  }
}

/**
 * Get modality description for a cuisine
 */
export function getModalityDescription(modality: Modality): string {
  switch (modality) {
    case 'Cardinal':
      return 'Bold, direct, and initiating. Typically spicy, intense, or stimulating cuisine with strong flavors.';
    case 'Fixed':
      return 'Grounded, stable, and nourishing. Hearty cuisine with substantial ingredients that provide comfort and sustenance.';
    case 'Mutable':
      return 'Versatile, adaptive, and harmonizing. Balanced cuisine that can be customized and pairs well with many other foods.';
    default:
      return ''
  }
}

/**
 * Get cooking methods that work best with each modality
 */
export function getModalityCookingMethods(modality: Modality): string[] {
  switch (modality) {
    case 'Cardinal':
      return ['Grilling', 'Stir-frying', 'Roasting', 'Searing', 'High-heat methods'];
    case 'Fixed':
      return ['Slow cooking', 'Braising', 'Baking', 'Stewing', 'Low-heat methods'];
    case 'Mutable':
      return ['Steaming', 'Poaching', 'Blanching', 'Multiple techniques', 'Variable methods'];
    default:
      return []
  }
}