import type { ElementalProperties } from '@/types/alchemy';
import { elementalUtils } from './elementalUtils';
import { calculationUtils } from './calculationUtils';

export const recipeUtils = {
  calculateRecipeBalance(
    ingredients: Array<{ properties: ElementalProperties; amount: number }>
  ): ElementalProperties {
    // Weight ingredients by their amounts
    const weighted = ingredients.map(({ properties, amount }) => {
      return Object.entries(properties).reduce((acc, [element, value]) => {
        acc[element] = value * amount;
        return acc;
      }, { Fire: 0, Water: 0, Earth: 0, Air: 0 } as ElementalProperties);
    });

    // Combine all weighted properties
    return elementalUtils.normalizeProperties(
      weighted.reduce((acc, curr) => elementalUtils.combineProperties(acc, curr), {
        Fire: 0,
        Water: 0,
        Earth: 0,
        Air: 0
      })
    );
  },

  suggestBalancingIngredients(
    currentBalance: ElementalProperties
  ): { element: string; strength: number }[] {
    const ideal = 0.25; // Perfect balance for 4 elements
    const suggestions: { element: string; strength: number }[] = [];

    Object.entries(currentBalance).forEach(([element, value]) => {
      const difference = ideal - (value || 0);
      if (difference > 0.1) { // Only suggest if significantly below ideal
        suggestions.push({
          element,
          strength: difference
        });
      }
    });

    // Add missing elements
    elementalUtils.getMissingElements(currentBalance).forEach(element => {
      suggestions.push({
        element,
        strength: ideal
      });
    });

    return suggestions.sort((a, b) => b.strength - a.strength);
  },

  adjustForCookingMethod(
    properties: ElementalProperties,
    method: string
  ): ElementalProperties {
    const methodModifiers: Record<string, ElementalProperties> = {
      'boiling': {
        Water: 0.4,
        Fire: 0.3,
        Air: 0.2,
        Earth: 0.1
      },
      'steaming': {
        Water: 0.3,
        Air: 0.3,
        Fire: 0.2,
        Earth: 0.2
      },
      'baking': {
        Fire: 0.4,
        Air: 0.3,
        Earth: 0.2,
        Water: 0.1
      },
      'raw': {
        Water: 0.4,
        Earth: 0.3,
        Air: 0.2,
        Fire: 0.1
      }
    };

    const modifier = methodModifiers[method.toLowerCase()];
    return modifier 
      ? elementalUtils.combineProperties(properties, modifier)
      : properties;
  }
};

export default recipeUtils;