import type { Recipe } from "@/types/recipe";
import Recipes, { primaryCuisines } from "../cuisines";

export { Recipes };

// Create flattened list of all recipes from all cuisines
const flattenCuisineRecipes = (cuisines: any) => {
  const allRecipes: Recipe[] = [];

  // Iterate through all cuisines
  Object.values(cuisines).forEach((cuisine: any) => {
    if (cuisine && cuisine.dishes) {
      // Iterate through meal types
      Object.values(cuisine.dishes).forEach((mealType: unknown) => {
        // Guard against null/undefined mealType before calling Object.values
        if (mealType && typeof mealType === "object") {
          // Iterate through seasons
          (Object.values as any)(mealType).forEach((recipes: unknown) => {
            if (Array.isArray(recipes)) {
              allRecipes.push(...recipes);
            }
          });
        }
      });
    }
  });

  return allRecipes;
};

// Export alias for compatibility
// Use primaryCuisines (14 cuisines) to avoid duplicate counting from aliases
export const allRecipes = flattenCuisineRecipes(primaryCuisines);
// Note: getBestRecipeMatches moved to @/data/recipes to avoid circular dependency
