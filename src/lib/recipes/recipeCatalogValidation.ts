/**
 * Recipe catalog reference and provenance validation for external/agent submissions.
 *
 * Enforces:
 * - Server-owned authoritative recipe existence
 * - Prohibits forged `saved-adaptation` provenance in generic submissions
 *
 * @file src/lib/recipes/recipeCatalogValidation.ts
 */

import { isReservedAdaptation } from "@/lib/recipes/savedAdaptationSchemas";
import { resolveRecipeRef } from "@/lib/recipes/recipeRefResolver";
import { LocalRecipeService } from "@/services/LocalRecipeService";
import { getServerRecipes } from "@/actions/recipes";

export interface RecipeValidationResult {
  valid: boolean;
  error?: string;
  isForgedAdaptation?: boolean;
  isUnknownRecipe?: boolean;
}

/**
 * Validates whether a submitted recipe reference points to a known authoritative recipe
 * and does not forge saved-adaptation provenance.
 */
export async function validateMenuRecipeReference(recipe: {
  id?: unknown;
  source?: unknown;
  kind?: unknown;
  payload?: unknown;
}): Promise<RecipeValidationResult> {
  if (!recipe || typeof recipe !== "object") {
    return { valid: false, error: "Missing recipe specification in meal slot" };
  }

  const recipeId = typeof recipe.id === "string" ? recipe.id.trim() : "";
  if (!recipeId) {
    return { valid: false, error: "Meal slot recipe must contain a valid id" };
  }

  // 1. Forged reserved adaptation check
  const sourceStr = typeof recipe.source === "string" ? recipe.source : undefined;
  const kindStr = typeof recipe.kind === "string" ? recipe.kind : undefined;
  if (
    isReservedAdaptation(sourceStr, recipe.payload ?? recipe) ||
    kindStr === "saved-adaptation" ||
    sourceStr === "saved-adaptation"
  ) {
    return {
      valid: false,
      isForgedAdaptation: true,
      error: `Forged reserved adaptation provenance is prohibited for recipe ${recipeId}`,
    };
  }

  // 2. Known recipe check
  const isKnown = await isKnownAuthoritativeRecipe(recipeId);
  if (!isKnown) {
    return {
      valid: false,
      isUnknownRecipe: true,
      error: `Unknown recipe reference: '${recipeId}' does not exist in authoritative catalog`,
    };
  }

  return { valid: true };
}

/**
 * Checks whether a recipe ID exists in live or static catalogs.
 */
export async function isKnownAuthoritativeRecipe(recipeId: string): Promise<boolean> {
  const cleanId = recipeId.trim();
  if (!cleanId) return false;

  // 1. Try resolveRecipeRef (checks live twins and static-only canonical IDs)
  try {
    const resolved = await resolveRecipeRef(cleanId);
    if (resolved) return true;
  } catch {
    // Resolver might throw or fail if DB is offline; continue to fallbacks
  }

  // 2. Try LocalRecipeService (checks DB / Redis / static fallback)
  try {
    const recipe = await LocalRecipeService.getRecipeById(cleanId);
    if (recipe) return true;
  } catch {
    // Continue
  }

  // 3. Try static getServerRecipes directly
  try {
    const staticRecipes = await getServerRecipes();
    const cleanLower = cleanId.toLowerCase();
    const found = staticRecipes.some(
      (r) => String(r.id).toLowerCase() === cleanLower || r.name?.toLowerCase() === cleanLower,
    );
    if (found) return true;
  } catch {
    // Fallback failed
  }

  return false;
}
