/**
 * Culinary Calculations Module Index
 *
 * Barrel exports for all culinary calculation modules
 */

// Export all from cuisine recommendations
export {
  generateCuisineRecommendations,
  type CuisineRecommendation,
} from './cuisineRecommendations';

// Export all from recipe matching
export { calculateRecipeCompatibility, type RecipeCompatibilityResult } from './recipeMatching';

// Export all from seasonal adjustments
export {
  applySeasonalAdjustments,
  applyLunarPhaseAdjustments,
  applyTimeOfDayAdjustments,
  getSeasonalCookingRecommendations,
  calculateSeasonalEffectiveness,
} from './seasonalAdjustments';

// Default exports
export { default as cuisineRecommendations } from './cuisineRecommendations';
export { default as recipeMatching } from './recipeMatching';
export { default as seasonalAdjustments } from './seasonalAdjustments';
