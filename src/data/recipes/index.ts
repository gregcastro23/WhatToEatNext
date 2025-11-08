import type { Recipe } from "@/types/recipe";
import Recipes from "../cuisines";
import { getBestRecipeMatches as getBestRecipeMatchesFromMain } from "../recipes";

export { Recipes };

// Create flattened list of all recipes from all cuisines
const flattenCuisineRecipes = (cuisines: any) => {
  const allRecipes: Recipe[] = [];

  // Iterate through all cuisines
  Object.values(cuisines).forEach((cuisine: any) => {
    if (cuisine.dishes) {
      // Iterate through meal types
      Object.values(cuisine.dishes).forEach((mealType: unknown) => {
        // Iterate through seasons
        ((Object.values as any)(mealType)).forEach((recipes: unknown) => {
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
// export { getAllRecipes } from "@/services/RecipeFinder"; // Service doesn't exist
export { getBestRecipeMatchesFromMain as getBestRecipeMatches };
