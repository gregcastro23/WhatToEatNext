/**
 * @file src/lib/mcp/culinarySafety.ts
 *
 * Allergen, restriction, and disliked ingredient gating for recipes.
 */
import { matchesDisallowedIngredient } from "@/lib/cooking/recipeGateAllergens";
import type { Recipe } from "@/types/recipe";
import type { CallerCulinaryProfile } from "./culinaryProfile";

export function isRecipeSafeForProfile(
  recipe: Recipe,
  profile: CallerCulinaryProfile,
): { safe: boolean; reason?: string } {
  for (const allergen of profile.allergens) {
    for (const ing of recipe.ingredients) {
      if (matchesDisallowedIngredient(ing.name.toLowerCase(), allergen)) {
        return {
          safe: false,
          reason: `Contains allergen '${allergen}' (ingredient: ${ing.name})`,
        };
      }
    }
  }

  for (const ing of recipe.ingredients) {
    for (const dislike of profile.dislikedIngredients) {
      if (matchesDisallowedIngredient(ing.name.toLowerCase(), dislike)) {
        return {
          safe: false,
          reason: `Contains disliked ingredient '${ing.name}'`,
        };
      }
    }
  }

  const frameworks = profile.dietaryFrameworks.map((f) => f.toLowerCase());
  if (frameworks.includes("vegan") && !recipe.isVegan) {
    return { safe: false, reason: "Recipe is not vegan" };
  }
  if (frameworks.includes("vegetarian") && !recipe.isVegetarian && !recipe.isVegan) {
    return { safe: false, reason: "Recipe is not vegetarian" };
  }
  if (frameworks.includes("gluten-free") && !recipe.isGlutenFree) {
    return { safe: false, reason: "Recipe is not gluten-free" };
  }
  if (frameworks.includes("dairy-free") && !recipe.isDairyFree) {
    return { safe: false, reason: "Recipe is not dairy-free" };
  }

  return { safe: true };
}

export function profileSafeRecipeFilter(
  recipes: Recipe[],
  profile: CallerCulinaryProfile,
): Recipe[] {
  return recipes.filter((r) => isRecipeSafeForProfile(r, profile).safe);
}

