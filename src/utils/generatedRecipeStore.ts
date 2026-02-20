/**
 * Shared localStorage store for generated recipes.
 * Used by both the Recipe Builder (to save) and the Generated Recipe page (to read).
 *
 * @file src/utils/generatedRecipeStore.ts
 */

import type { MonicaOptimizedRecipe } from "@/data/unified/recipeBuilding";

export const RECIPE_STORE_KEY = "whatToEatNext_generatedRecipes";

/** Persist a generated recipe so the full-recipe page can retrieve it by ID. */
export function saveRecipeToStore(recipe: MonicaOptimizedRecipe): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(RECIPE_STORE_KEY);
    const store: Record<string, MonicaOptimizedRecipe> = raw
      ? JSON.parse(raw)
      : {};
    store[recipe.id] = recipe;
    // Keep store bounded: retain the 50 most-recent entries
    const keys = Object.keys(store);
    if (keys.length > 50) {
      keys.slice(0, keys.length - 50).forEach((k) => delete store[k]);
    }
    localStorage.setItem(RECIPE_STORE_KEY, JSON.stringify(store));
  } catch {
    // localStorage may be unavailable in some environments
  }
}

/** Retrieve a stored recipe by ID. Returns undefined if not found or expired. */
export function getRecipeFromStore(
  id: string,
): MonicaOptimizedRecipe | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = localStorage.getItem(RECIPE_STORE_KEY);
    if (!raw) return undefined;
    const store: Record<string, MonicaOptimizedRecipe> = JSON.parse(raw);
    return store[id];
  } catch {
    return undefined;
  }
}
