import type { ElementalProperties } from '@/types/alchemy';
import type { Modality } from '@/data/ingredients/types';

/**
 * Determines the modality of a cuisine based on its elemental properties
 */
export function determineModalityFromElements(elements: ElementalProperties): Modality {
  const { Fire, Water, Earth, Air } = elements;
  
  // Cardinal cuisines tend to have strong Fire or Air elements
  if ((Fire > 0.4 && Air > 0.3) || Fire > 0.6 || Air > 0.6) {
    return 'Cardinal';
  }
  
  // Fixed cuisines tend to have strong Earth or Water elements
  if ((Earth > 0.4 && Water > 0.3) || Earth > 0.6 || Water > 0.6) {
    return 'Fixed';
  }
  
  // Mutable cuisines tend to have balanced elements
  return 'Mutable';
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
      return '';
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
      return [];
  }
} 