// src/types/indexedRecipe.ts
//
// Type-only module that is safe to import from any runtime (Edge, Node,
// server actions). Next.js `"use server"` files may only export async
// functions, so these type definitions live outside `src/actions/recipes.ts`
// and are imported from both the server action and the recommendation
// bridge.

import type { Recipe } from "@/types/recipe";

/**
 * Internal shape for the pre-indexed recipe cache. The extra lowercased
 * fields are attached on each recipe so the recommendation bridge can
 * score without repeated toLowerCase() calls.
 */
export interface IndexedRecipe extends Recipe {
  _lcCuisine?: string;
  _lcTags?: string[];
  _lcCookingMethod?: string[];
  _lcSeasons?: string[];
  _lcMealTypes?: string[];
}

/** Precomputed lookup buckets keyed by `${mealType}-${season}`. */
export type RecipeIndex = Map<string, IndexedRecipe[]>;
