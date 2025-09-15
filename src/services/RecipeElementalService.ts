import type { ElementalProperties } from '../types/alchemy';
import type { Recipe } from '../types/recipe';
import { elementalUtils } from '../utils/elementalUtils';
import { logger } from '../utils/logger';

import { ElementalCalculator } from './ElementalCalculator';

/**
 * Service responsible for handling elemental properties of recipes
 */
export class RecipeElementalService {
  private static instance: RecipeElementalService;

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): RecipeElementalService {
    if (!RecipeElementalService.instance) {
      RecipeElementalService.instance = new RecipeElementalService();
    }
    return RecipeElementalService.instance;
  }

  /**
   * Ensures a recipe has valid elemental properties
   * @param recipe The recipe to standardize
   * @returns Recipe with guaranteed elemental properties
   */
  public standardizeRecipe<T extends Partial<Recipe>>(
    recipe: T,
  ): T & { elementalProperties: ElementalProperties } {
    try {
      return elementalUtils.standardizeRecipeElements(recipe);
    } catch (error) {
      logger.error('Error standardizing recipe elements:', error);
      // Return recipe with current elemental state if there's an error
      return {
        ...recipe,
        elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }
      } as T & { elementalProperties: ElementalProperties };
    }
  }

  /**
   * Standardizes an array of recipes, ensuring they all have valid elemental properties
   * @param recipes Array of recipes to standardize
   * @returns Array of recipes with guaranteed elemental properties
   */
  public standardizeRecipes<T extends Partial<Recipe>>(
    recipes: T[],
  ): Array<T & { elementalProperties: ElementalProperties }> {
    return recipes.map(recipe => this.standardizeRecipe(recipe));
  }

  /**
   * Calculates the dominant elemental property in a recipe
   * @param recipe The recipe to analyze
   * @returns The dominant element and its value
   */
  public getDominantElement(recipe: Recipe): { element: keyof ElementalProperties; value: number } {
    const standardized = this.standardizeRecipe(recipe);

    let dominantElement: keyof ElementalProperties = 'Earth';
    let highestValue = 0;

    Object.entries(standardized.elementalProperties).forEach(([element, value]) => {
      if (value > highestValue) {
        highestValue = value;
        dominantElement = element as unknown;
      }
    });

    return { element: dominantElement, value: highestValue };
  }

  /**
   * Calculates similarity between two elemental property sets
   * @param a First elemental property set
   * @param b Second elemental property set
   * @returns Similarity score (0-1)
   */
  public calculateSimilarity(a: ElementalProperties, b: ElementalProperties): number {
    const elements = ['Fire', 'Water', 'Earth', 'Air'];

    // Calculate average difference across all elements
    const totalDifference = elements.reduce((sum: number, element) => {
      const aValue = a[element] || 0;
      const bValue = b[element] || 0;
      return sum + Math.abs(aValue - bValue);
    }, 0);

    // Convert difference to similarity (1 - avg difference)
    const avgDifference = totalDifference / elements.length;

    // Apply non-linear scaling to make smaller differences more significant
    // This will boost low similarity scores to be more representative
    const similarity = Math.pow(1 - avgDifference, 0.5);

    // Ensure the similarity is at least 0.05 (5%) to avoid showing extremely low percentages
    return Math.max(similarity, 0.05);
  }

  /**
   * Derives elemental properties based on recipe attributes if they're missing
   * @param recipe Recipe to derive elemental properties for
   * @returns Derived elemental properties
   */
  public deriveElementalProperties(recipe: Partial<Recipe>): ElementalProperties {
    // Start with a balanced base
    const elementalProps: ElementalProperties = {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25
    };

    try {
      // Adjust based on cooking method - safe property access for string/string[]
      if (recipe.cookingMethod) {
        const methodValue = Array.isArray(recipe.cookingMethod);
          ? recipe.cookingMethod[0]
          : recipe.cookingMethod;
        const method = (methodValue || '').toString().toLowerCase();

        if (method.includes('roast') || method.includes('grill') || method.includes('bake')) {
          elementalProps.Fire += 0.2;
          elementalProps.Earth += 0.05;
          elementalProps.Water -= 0.15;
          elementalProps.Air -= 0.1;
        } else if (
          method.includes('steam') ||
          method.includes('boil') ||
          method.includes('poach')
        ) {
          elementalProps.Water += 0.2;
          elementalProps.Fire -= 0.15;
          elementalProps.Air += 0.05;
          elementalProps.Earth -= 0.1;
        } else if (method.includes('fry') || method.includes('sauté')) {
          elementalProps.Fire += 0.15;
          elementalProps.Air += 0.1;
          elementalProps.Water -= 0.15;
          elementalProps.Earth -= 0.1;
        } else if (method.includes('raw') || method.includes('fresh')) {
          elementalProps.Water += 0.1;
          elementalProps.Earth += 0.1;
          elementalProps.Fire -= 0.2;
        }
      }

      // Adjust based on cuisine
      if (recipe.cuisine) {
        const cuisine = recipe.cuisine.toLowerCase();

        if (['mexican', 'thai', 'indian', 'cajun', 'szechuan'].includes(cuisine)) {
          // Spicy cuisines - more Fire
          elementalProps.Fire += 0.1;
          elementalProps.Air += 0.05;
          elementalProps.Water -= 0.1;
          elementalProps.Earth -= 0.05;
        } else if (['japanese', 'korean', 'cantonese'].includes(cuisine)) {
          // Balanced cuisines
          elementalProps.Water += 0.1;
          elementalProps.Air += 0.05;
          elementalProps.Fire -= 0.1;
          elementalProps.Earth -= 0.05;
        } else if (['french', 'italian', 'spanish'].includes(cuisine)) {
          // Mediterranean cuisines
          elementalProps.Earth += 0.1;
          elementalProps.Fire += 0.05;
          elementalProps.Water -= 0.05;
          elementalProps.Air -= 0.1;
        } else if (['german', 'russian', 'english', 'scandinavian'].includes(cuisine)) {
          // Northern cuisines
          elementalProps.Earth += 0.15;
          elementalProps.Water += 0.05;
          elementalProps.Fire -= 0.1;
          elementalProps.Air -= 0.1;
        }
      }

      // Consider ingredients if available
      if (recipe.ingredients && recipe.ingredients.length > 0) {
        // Create a new object for ingredient properties
        const ingredientProps: ElementalProperties = {
          Fire: 0,
          Water: 0,
          Earth: 0,
          Air: 0
        };

        // Process ingredients with elemental properties
        let ingredientCount = 0;
        recipe.ingredients.forEach(ingredient => {
          if (ingredient.elementalProperties) {
            // Get values from each element, guarding against undefined values
            ingredientProps.Fire += ingredient.elementalProperties.Fire || 0;
            ingredientProps.Water += ingredient.elementalProperties.Water || 0;
            ingredientProps.Earth += ingredient.elementalProperties.Earth || 0;
            ingredientProps.Air += ingredient.elementalProperties.Air || 0;
            ingredientCount++;
          }
        });

        // Average ingredient properties if we found any
        if (ingredientCount > 0) {
          ingredientProps.Fire /= ingredientCount;
          ingredientProps.Water /= ingredientCount;
          ingredientProps.Earth /= ingredientCount;
          ingredientProps.Air /= ingredientCount;

          // Blend with method/cuisine derived properties
          return elementalUtils.combineProperties(elementalProps, ingredientProps, 0.7);
        }
      }
    } catch (error) {
      logger.error('Error deriving elemental properties', error);
    }

    // Normalize to ensure values sum to 1
    return elementalUtils.normalizeProperties(elementalProps);
  }
}

// Export singleton instance
export const _recipeElementalService = RecipeElementalService.getInstance();
