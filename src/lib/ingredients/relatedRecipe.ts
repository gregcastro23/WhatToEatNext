/**
 * Shared helper to format related ingredient recipes for both Next.js and Hono routes.
 *
 * @file src/lib/ingredients/relatedRecipe.ts
 */

import type { RelatedIngredientRecipe } from "@/types/ingredient";
import type { Recipe } from "@/types/recipe";

export interface IngredientRecipeMatchInput {
  recipeId: string;
  recipeName: string;
  cuisine: string;
  rawIngredientName?: string;
  amount?: number | string | null;
  unit?: string;
}

export function extractRecipeTime(recipe: Partial<Recipe> | Record<string, unknown>, kind: "prep" | "cook"): number | undefined {
  const details: unknown = Reflect.get(recipe, "details");
  if (details !== null && typeof details === "object") {
    const v: unknown = Reflect.get(details, kind === "prep" ? "prepTimeMinutes" : "cookTimeMinutes");
    if (typeof v === "number") return v;
  }
  const raw = kind === "prep" ? recipe.prepTime : recipe.cookTime;
  if (typeof raw === "string") {
    const m = raw.match(/(\d+)/);
    if (m) return parseInt(m[1] ?? "", 10);
  }
  return undefined;
}

export function buildRelatedIngredientRecipe(
  match: IngredientRecipeMatchInput,
  recipe: Recipe | undefined,
): RelatedIngredientRecipe {
  const amount = typeof match.amount === "number" ? match.amount : undefined;
  if (!recipe) {
    // Fallback if not loaded in memory
    return {
      id: match.recipeId,
      name: match.recipeName,
      cuisine: match.cuisine,
      description: undefined,
      prepTime: undefined,
      cookTime: undefined,
      servings: undefined,
      amount,
      unit: match.unit,
    };
  }
  const baseServings: unknown = Reflect.get(recipe, "baseServingSize");
  return {
    id: recipe.id,
    name: recipe.name,
    cuisine: recipe.cuisine ?? "",
    description: recipe.description,
    prepTime: extractRecipeTime(recipe, "prep"),
    cookTime: extractRecipeTime(recipe, "cook"),
    servings: typeof baseServings === "number" ? baseServings : (recipe.servingSize ?? recipe.numberOfServings),
    amount,
    unit: match.unit,
  };
}
