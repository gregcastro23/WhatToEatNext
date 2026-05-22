import type { Recipe } from "@/types/recipe";
import {
  flattenCuisineRecipes,
  PRIMARY_CUISINE_KEYS,
} from "@/utils/recipe/recipeStandardization";

// Export the flattener for external use (e.g., AlchemicalDataContext)
export { flattenCuisineRecipes };

let _allRecipesCache: Recipe[] | null = null;

/**
 * Get all recipes asynchronously. Hydrates every primary cuisine's full dish
 * data — the ~200KB-per-cuisine files are dynamically imported so they never
 * land in the client bundle — and flattens it into the recipe catalog.
 *
 * The synchronous `cuisinesMap` export only carries metadata (empty dishes),
 * so it must NOT be used here; `getCuisineData()` performs the real load.
 * Result is memoized for the lifetime of the process.
 */
export async function getAllRecipes(): Promise<Recipe[]> {
  if (_allRecipesCache) return _allRecipesCache;
  const { getCuisineData } = await import("@/data/cuisines/index");
  const hydratedCuisines: Record<string, unknown> = {};
  await Promise.all(
    PRIMARY_CUISINE_KEYS.map(async (key) => {
      const cuisine = await getCuisineData(key);
      if (cuisine) hydratedCuisines[key] = cuisine;
    }),
  );
  _allRecipesCache = flattenCuisineRecipes(hydratedCuisines) || [];
  return _allRecipesCache;
}

// Legacy exports - WARNING: these will pull in everything if accessed!
// We'll use a getter to only load them when actually needed.
export const allRecipes = [] as Recipe[]; // Keep as empty array initially to satisfy types

/** @deprecated Use getAllRecipes() instead */
export const recipeCount = 579; // Hardcoded count from GEMINI.md

// Note: getBestRecipeMatches moved to @/data/recipes to avoid circular dependency

// Note: getBestRecipeMatches moved to @/data/recipes to avoid circular dependency
