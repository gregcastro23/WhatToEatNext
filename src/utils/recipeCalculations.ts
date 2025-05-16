import { ElementalProperties } from '@/types/alchemy';
import { Recipe } from '@/types/recipes';

/**
 * A utility function for logging debug information
 * This is a safe replacement for console.log that can be disabled in production
 */
const debugLog = (message: string, ...args: unknown[]): void => {
  // Comment out console.log to avoid linting warnings
  // console.log(message, ...args);
};

/**
 * Utility functions for recipe calculations and alignments
 */
export const recipeCalculations = {
  /**
   * Calculate how well a recipe aligns with its cuisine's elemental properties
   * @param recipe Recipe with elemental properties and cuisine data
   * @returns Alignment score (higher is better)
   */
  calculateCuisineAlignment(recipe: RecipeElementalMapping): number {
    const cuisineElements = recipe.cuisine.elementalAlignment;
    const alignmentScore = Object.entries(recipe.elementalProperties).reduce((sum, [element, value]) => {
      return sum + (value * cuisineElements[element as keyof ElementalProperties]);
    }, 0);
    
    debugLog(`Cuisine alignment score for ${recipe.name}: ${alignmentScore.toFixed(2)}`);
    return alignmentScore;
  },

  /**
   * Get the optimal astrological windows for cooking a particular recipe
   * @param recipe Recipe with astrological profile
   * @returns Array of optimal times / (conditions || 1) for cooking
   */
  getOptimalCookingWindow(recipe: RecipeElementalMapping): string[] {
    const optimalTimes = [
      ...recipe.astrologicalProfile.rulingPlanets.map(p => `${p} dominant hours`),
      ...recipe.cuisine.astrologicalProfile.aspectEnhancers
    ];
    
    debugLog(`Optimal cooking windows for ${recipe.name}:`, optimalTimes);
    return optimalTimes;
  },

  /**
   * Determine how much an elemental boost a user would get from a recipe
   * based on their personal elemental profile
   * @param recipe Recipe with elemental properties
   * @param userElements User's elemental properties / (affinities || 1)
   * @returns Boost value (higher means more boost)
   */
  determineElementalBoost(recipe: RecipeElementalMapping, userElements: ElementalProperties): number {
    // Find the dominant element in the recipe
    const dominantElement = Object.entries(recipe.elementalProperties)
      .sort(([,a], [,b]) => b - a)[0][0];
    
    // Calculate boost from the user's affinity with that element
    const boost = userElements[dominantElement] * 1.5;
    
    debugLog(`Elemental boost for ${recipe.name}: ${boost.toFixed(2)} (dominant: ${dominantElement})`);
    return boost;
  }
}; 