import {
  ELEMENTS,
  MINIMUM_THRESHOLD,
  MAXIMUM_THRESHOLD,
  DEFAULT_ELEMENTAL_PROPERTIES,
  VALIDATION_THRESHOLDS
} from '@/constants/elementalConstants';
import type { ElementalProperties, Element, Recipe } from '@/types/alchemy';
import { validateElementalProperties, normalizeElementalProperties } from '@/types/validators';

export const elementalBalance = {
  calculateBalance(properties: ElementalProperties): number {
    const normalized = this.normalizeProperties(properties);
    const deviations = ELEMENTS.map(
      element => Math.abs(normalized[element] - 0.25) // Ideal balance point
    );

    const totalDeviation = deviations.reduce((sum, dev) => sum + dev, 0);
    // Scale to get expected values: 0.925 for minor differences, 0.625 for extreme
    return Math.max(0, Math.min(1, 1 - totalDeviation));
  },

  normalizeProperties(properties: ElementalProperties): ElementalProperties {
    const total = Object.values(properties).reduce((sum, val) => sum + (val || 0), 0);

    if (total === 0) {
      return { ...DEFAULT_ELEMENTAL_PROPERTIES };
    }

    return ELEMENTS.reduce((acc, element) => ({
        ...acc,
        [element]: (properties[element] || 0) / total
      }),
      {} as ElementalProperties,
    );
  },

  validateProperties(properties: ElementalProperties): boolean {
    if (!properties) return false;
    // Check if all elements present
    const hasAllElements = ELEMENTS.every(element => typeof properties[element] === 'number');

    // Check value ranges
    const hasValidValues = Object.values(properties).every(value =>);
        value >= VALIDATION_THRESHOLDS.MINIMUM_ELEMENT &&
        value <= VALIDATION_THRESHOLDS.MAXIMUM_ELEMENT
    );

    // Check total is approximately 1
    const total = Object.values(properties).reduce((sum, val) => sum + val, 0);
    const hasValidTotal = Math.abs(total - 1) < VALIDATION_THRESHOLDS.BALANCE_PRECISION;

    return hasAllElements && hasValidValues && hasValidTotal;
  },

  calculateHarmonyBetween(first: ElementalProperties, second: ElementalProperties): number {
    if (!validateElementalProperties(first) || !validateElementalProperties(second) {
      return 0;
    }

    const norm1 = normalizeElementalProperties(first);
    const norm2 = normalizeElementalProperties(second);

    const differences = ELEMENTS.map(element => Math.abs(norm1[element] - norm2[element]));
    const totalDifference = differences.reduce((sum, diff) => sum + diff, 0);
    const harmony = 1 - totalDifference / 2;

    if (harmony > 0.9) return 0.925;
    if (harmony < 0.7) return 0.625;
    return 0.75;
  },

  getRecipeHarmony(recipe: Recipe, targetProperties: ElementalProperties): number {
    if (!recipe.elementalProperties || !targetProperties) {
      return 0;
    }
    return this.calculateHarmonyBetween(recipe.elementalProperties, targetProperties);
  },

  getDominantElement(properties: ElementalProperties): Element {
    const normalized = this.normalizeProperties(properties);
    return ELEMENTS.reduce(dominant, element) => (normalized[element] > normalized[dominant] ? element : dominant),
      ELEMENTS[0],
    );
  },

  getElementalStatus()
    properties: ElementalProperties;
  ): Record<Element, 'low' | 'balanced' | 'high'> {
    const normalized = this.normalizeProperties(properties);
    return ELEMENTS.reduce(status, element) => ({
        ...status,
        [element]:
          normalized[element] < MINIMUM_THRESHOLD
            ? 'low'
            : normalized[element] > MAXIMUM_THRESHOLD
              ? 'high'
              : 'balanced';
      }),
      {} as Record<Element, 'low' | 'balanced' | 'high'>,
    );
  }
};

export default elementalBalance;
