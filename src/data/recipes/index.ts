import Recipes from "../cuisines";
import { Recipe } from '@/types/recipe';
import { getBestRecipeMatches as getBestRecipeMatchesFromMain } from '../recipes';

export { Recipes };

// Create flattened list of all recipes from all cuisines
const flattenCuisineRecipes = (cuisines: Record<string, unknown>) => {
  const allRecipes: Recipe[] = [];
  
  // Iterate through all cuisines
  Object.values(cuisines).forEach((cuisine: Record<string, unknown>) => {
    if (cuisine.dishes) {
      // Iterate through meal types
      Object.values(cuisine.dishes).forEach((mealType: Record<string, unknown>) => {
        // Iterate through seasons
        Object.values(mealType).forEach((recipes: Record<string, unknown>) => {
          if (Array.isArray(recipes)) {
            allRecipes.push(...recipes);
          }
        });
      });
    }
  });
  
  return allRecipes;
};

// Export alias for compatibility
export const allRecipes = flattenCuisineRecipes(Recipes);
export { getAllRecipes } from '@/services/RecipeFinder';
export { getBestRecipeMatchesFromMain as getBestRecipeMatches };
