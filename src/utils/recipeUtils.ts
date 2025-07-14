import type { Recipe } from '@/types/recipe';

// Replace any with Recipe
function processRecipes(recipes: Recipe[]): Recipe[] {
  // existing logic
  return recipes;
}

// Type guard
function validateRecipe(recipe: Recipe): boolean {
  if (recipe?.ingredients && Array.isArray(recipe.ingredients)) {
    // process safely
    return true;
  }
  return false;
}

// Prefix unused
const _matchScore = 0;

export { processRecipes, validateRecipe }; 