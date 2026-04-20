/**
 * Runtime accessors for the generated ingredient → recipe index.
 *
 * The JSON payload is produced by `scripts/buildIngredientRecipeIndex.ts` and
 * committed at `src/data/generated/ingredientRecipeIndex.json`. Regenerate it
 * whenever cuisines or ingredient slugs change:
 *
 *   yarn build:ingredient-recipe-index
 *
 * This module exposes O(1) lookups from an ingredient slug (or display name)
 * to the list of recipes that reference it, with the raw ingredient text and
 * measurement pulled verbatim from the recipe.
 */

import rawIndex from "./generated/ingredientRecipeIndex.json";

export interface IngredientRecipeMatch {
  recipeId: string;
  recipeName: string;
  cuisine: string;
  rawIngredientName: string;
  amount?: number | string;
  unit?: string;
}

type IngredientRecipeIndex = Record<string, IngredientRecipeMatch[]>;

const INDEX = rawIndex as unknown as IngredientRecipeIndex;

/**
 * Return every recipe reference for an ingredient slug.
 * Returns [] for unknown slugs.
 */
export function getRecipesForIngredient(slug: string): IngredientRecipeMatch[] {
  return INDEX[slug] ?? [];
}

/**
 * Convenience — how many recipes reference this ingredient.
 */
export function getRecipeCountForIngredient(slug: string): number {
  return (INDEX[slug] ?? []).length;
}

/**
 * Return recipes grouped by cuisine for an ingredient slug.
 * Useful for UI that shows "Italian: 4 recipes, Thai: 2 recipes, …".
 */
export function getRecipesByCuisineForIngredient(
  slug: string,
): Record<string, IngredientRecipeMatch[]> {
  const matches = getRecipesForIngredient(slug);
  const grouped: Record<string, IngredientRecipeMatch[]> = {};
  for (const m of matches) {
    (grouped[m.cuisine] ??= []).push(m);
  }
  return grouped;
}

/**
 * Full index — prefer the accessor functions above; this is exposed for
 * bulk operations and tests.
 */
export function getIngredientRecipeIndex(): IngredientRecipeIndex {
  return INDEX;
}
