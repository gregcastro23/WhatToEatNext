import type { Recipe } from '@/types/recipe';

// Replace any with Recipe
function processRecipes(recipes: Recipe[]): Recipe[] {
  // existing logic
}

// Type guard
if (recipe?.ingredients && Array.isArray(recipe.ingredients)) {
  // process safely
}

// Prefix unused
let _matchScore = 0; 