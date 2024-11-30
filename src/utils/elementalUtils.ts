// src/utils/elementalUtils.ts

import { 
  ELEMENTS,
  VALIDATION_THRESHOLDS,
  DEFAULT_ELEMENTAL_PROPERTIES,
  MINIMUM_THRESHOLD,
  MAXIMUM_THRESHOLD
} from '@/constants/elementalConstants';
import type { ElementalProperties, Recipe } from '@/types/alchemy';

export const elementalUtils = {
  validateProperties(properties: ElementalProperties): boolean {
    // Check if all elements are present
    const hasAllElements = ELEMENTS.every(element => 
      typeof properties[element] === 'number'
    );

    // Check if values are within valid range
    const hasValidValues = Object.values(properties)
      .every(value => 
        value >= VALIDATION_THRESHOLDS.MINIMUM_ELEMENT && 
        value <= VALIDATION_THRESHOLDS.MAXIMUM_ELEMENT
      );

    // Check if total is valid
    const total = Object.values(properties)
      .reduce((sum, val) => sum + val, 0);

    const hasValidTotal = total >= VALIDATION_THRESHOLDS.MINIMUM_TOTAL && 
                         total <= VALIDATION_THRESHOLDS.MAXIMUM_TOTAL;

    return hasAllElements && hasValidValues && hasValidTotal;
  },

  normalizeProperties(properties: ElementalProperties): ElementalProperties {
    const total = Object.values(properties)
      .reduce((sum, val) => sum + (val || 0), 0);
    
    if (total === 0) {
      return { ...DEFAULT_ELEMENTAL_PROPERTIES };
    }

    return ELEMENTS.reduce((acc, element) => ({
      ...acc,
      [element]: properties[element] / total
    }), {} as ElementalProperties);
  },

  getRecipeHarmony(recipe: Recipe, targetProperties: ElementalProperties): number {
    if (!recipe.elementalProperties) return 0;
    
    const normalized1 = this.normalizeProperties(recipe.elementalProperties);
    const normalized2 = this.normalizeProperties(targetProperties);

    return 1 - ELEMENTS.reduce((diff, element) => {
      return diff + Math.abs(normalized1[element] - normalized2[element]);
    }, 0) / 2;
  }
};

export default elementalUtils;