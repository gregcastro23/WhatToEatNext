import { _logger } from "@/lib/logger";
import type { RecipeIngredient, Recipe } from "@/types/recipe";

export function validateIngredientData(recipes: Recipe[]): boolean {
  const missingElementals: RecipeIngredient[] = [];

  recipes.forEach((recipe) => {
    recipe.ingredients.forEach((ingredient) => {
      if (!ingredient.elementalProperties) {
        missingElementals.push(ingredient);
        // Set default values to prevent runtime errors
        ingredient.elementalProperties = {
          Fire: 0,
          Water: 0,
          Air: 0,
          Earth: 0,
        };
      } else {
        // Ensure all elemental properties exist
        const elements = ["Fire", "Water", "Air", "Earth"] as const;
        elements.forEach((element) => {
          if (
            ingredient.elementalProperties &&
            ingredient.elementalProperties[element] === undefined
          ) {
            if (ingredient.elementalProperties) {
              ingredient.elementalProperties[element] = 0;
            }
          }
        });
      }
    });
  });

  if (missingElementals.length > 0) {
    _logger.warn(
      `Found ${missingElementals.length} ingredients with missing elemental properties`,
      missingElementals,
    );
  }

  return missingElementals.length === 0;
}

export function validateIngredients(ingredients: RecipeIngredient[]): string[] {
  const validationErrors: string[] = [];

  // Check that ingredients is an array
  if (!Array.isArray(ingredients)) {
    return ["Ingredients must be an array"];
  }

  // Validate each ingredient
  ingredients.forEach((ingredient, index) => {
    const errors: string[] = [];

    if (!ingredient) {
      errors.push(`Ingredient at position ${index} is undefined`);
      return;
    }

    // Check for required elementalProperties
    if (!ingredient.elementalProperties) {
      errors.push(
        `Ingredient at position ${index} is missing elementalProperties`,
      );
    } else {
      // Check that each element has a valid value
      (["Fire", "Water", "Earth", "Air"] as const).forEach((element) => {
        if (
          ingredient.elementalProperties &&
          ingredient.elementalProperties[element] === undefined
        ) {
          errors.push(
            `Ingredient ${ingredient.name || index} is missing ${element} elementalProperty`,
          );
          if (ingredient.elementalProperties) {
            ingredient.elementalProperties[element] = 0;
          }
        }
      });
    }

    // Add all errors for this ingredient
    if (errors.length > 0) {
      validationErrors.push(...errors);
    }
  });

  return validationErrors;
}
