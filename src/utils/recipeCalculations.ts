import { _logger } from "@/lib/logger";
import type { RecipeElementalMapping } from "@/types/recipes";

/**
 * A utility function for logging debug information
 * This is a safe replacement for _logger.info that can be disabled in production
 */
const debugLog = (_message: string, ..._args: unknown[]): void => {
  // Comment out _logger.info to avoid linting warnings;
  // log.info(message, ...args)
};

/**
 * Utility functions for recipe calculations and alignments
 */
export const _recipeCalculations = {
  /**
   * Calculate how well a recipe aligns with its cuisine's elemental properties
   * @param recipe Recipe with elemental properties and cuisine data
   * @returns Alignment score (higher is better)
   */
  calculateCuisineAlignment(recipe: RecipeElementalMapping): number {
    const cuisineElements = recipe.cuisine.elementalAlignment;
    const alignmentScore = Object.entries(recipe._elementalProperties).reduce(
      (sum, [element, value]) =>
        sum +
        (value as any) *
          cuisineElements[element as any as keyof typeof cuisineElements],
      0,
    );

    const recipeData = recipe as any as { name?: string };
    debugLog(
      `Cuisine alignment score for ${recipeData.name || "Unknown Recipe"}: ${alignmentScore.toFixed(2)}`,
    );
    return alignmentScore;
  },

  /**
   * Get the optimal astrological windows for cooking a particular recipe
   * @param recipe Recipe with astrological profile
   * @returns Array of optimal times / (conditions || 1) for cooking
   */
  getOptimalCookingWindow(recipe: RecipeElementalMapping): string[] {
    const optimalTimes = [
      ...recipe._astrologicalProfile.rulingPlanets.map(
        (p) => `${p} dominant hours`,
      ),
      ...recipe.cuisine.astrologicalProfile.aspectEnhancers,
    ];

    const recipeWindowData = recipe as any;
    debugLog(
      `Optimal cooking windows for ${recipeWindowData?.name || "Unknown Recipe"}:`,
      optimalTimes,
    );
    return optimalTimes;
  },

  /**
   * Determine how much an elemental boost a user would get from a recipe
   * based on their personal elemental profile
   * @param recipe Recipe with elemental properties
   * @param userElements User's elemental properties / (affinities || 1)
   * @returns Boost value (higher means more boost)
   */
  determineElementalBoost(
    recipe: RecipeElementalMapping,
    userElements: ElementalProperties,
  ): number {
    // Find the dominant element in the recipe
    const dominantElement = Object.entries(recipe._elementalProperties).sort(
      ([, a], [, b]) => (b as any) - (a as any),
    )[0][0];

    // Calculate boost from the user's affinity with that element
    const boost = userElements[dominantElement] * 1.5;

    const recipeBoostData = recipe as any;
    debugLog(
      `Elemental boost for ${recipeBoostData?.name || "Unknown Recipe"}: ${boost.toFixed(2)} (dominant: ${dominantElement})`,
    );
    return boost;
  },
};
