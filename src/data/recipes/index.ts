import type { Recipe } from "@/types/recipe";
import { flattenCuisineRecipes } from "@/utils/recipe/recipeStandardization";

// Export the flattener for external use (e.g., AlchemicalDataContext)
export { flattenCuisineRecipes };

/**
 * Get all recipes asynchronously to avoid bundling large static data in the client.
 * This should be used on the server or inside an async context.
 */
export async function getAllRecipes(): Promise<Recipe[]> {
  const { cuisinesMap } = await import("@/data/cuisines/index");
  return flattenCuisineRecipes(cuisinesMap) || [];
}

// Legacy exports - WARNING: these will pull in everything if accessed!
// We'll use a getter to only load them when actually needed.
export const allRecipes = [] as Recipe[]; // Keep as empty array initially to satisfy types

/** @deprecated Use getAllRecipes() instead */
export const recipeCount = 579; // Hardcoded count from GEMINI.md

// Note: getBestRecipeMatches moved to @/data/recipes to avoid circular dependency

// Note: getBestRecipeMatches moved to @/data/recipes to avoid circular dependency
