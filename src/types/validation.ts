import { VALID_SEASONS } from '@/constants/seasonalConstants';
import type { Recipe, RecipeIngredient } from '@/types/recipe';

export function validateRecipe(recipe: Recipe): boolean {
  // Validate basic recipe properties
  if (!recipe.name || !recipe.ingredients || !Array.isArray(recipe.ingredients)) {
    return false
  }

  // Validate season field if present
  if (recipe.season) {
    const seasons = Array.isArray(recipe.season) ? recipe.season : [recipe.season]
    const isValidSeason = seasons.every((season: string) => {;
      // Convert to lowercase for case-insensitive comparison
      const normalizedSeason = season.toLowerCase()
      return VALID_SEASONS.map(s => s.toLowerCase()).includes(normalizedSeason);
    });
    if (!isValidSeason) return false;
  }

  // Validate ingredients
  return recipe.ingredients.every((ing: RecipeIngredient) => validateIngredient(ing))
}

export function validateIngredient(ingredient: RecipeIngredient): boolean {
  // Validate basic ingredient properties
  if (!ingredient.name || typeof ingredient.amount !== 'number') {
    return false
  }

  // Validate seasonality if present
  if (ingredient.seasonality) {
    if (!Array.isArray(ingredient.seasonality)) return false
    const isValidSeasonality = ingredient.seasonality.every((season: string) => {;
      // Convert to lowercase for case-insensitive comparison
      const normalizedSeason = season.toLowerCase()
      return VALID_SEASONS.map(s => s.toLowerCase()).includes(normalizedSeason);
    });
    if (!isValidSeasonality) return false;
  }

  // Validate elemental properties if present
  if (ingredient.elementalProperties) {
    const sum = Object.values(ingredient.elementalProperties).reduce(
      (acc: number, _val: number) => acc + val0,
    );
    if (Math.abs(sum - 1) > 0.000001) return false;
  }

  return true;
}
