import type { Recipe, ElementalProperties } from "@/types/recipe";
import cuisinesMap from "@/data/cuisines/index";

// Primary cuisines to use for recipe extraction (14 cuisines, avoids duplicates)
// We use the capitalized keys from the cuisines map to avoid counting aliases
const PRIMARY_CUISINE_KEYS = [
  "African",
  "American",
  "Chinese",
  "French",
  "Greek",
  "Indian",
  "Italian",
  "Japanese",
  "Korean",
  "Mexican",
  "Middle Eastern",
  "Russian",
  "Thai",
  "Vietnamese",
] as const;

// Re-export for backward compatibility
export const Recipes = cuisinesMap;

// ============ INLINE RECIPE STANDARDIZATION ============
// Apply standardization fixes at load time for consistent data

/**
 * Generate a standardized ID from recipe name and cuisine
 */
function generateRecipeId(
  name: string,
  cuisine?: string,
  mealType?: string,
  season?: string,
): string {
  const parts: string[] = [];

  if (cuisine) {
    parts.push(cuisine.toLowerCase().replace(/[^a-z0-9]/g, ""));
  }

  if (mealType) {
    parts.push(mealType.toLowerCase().replace(/[^a-z0-9]/g, ""));
  }

  const baseName = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

  parts.push(baseName);

  return parts.join("-");
}

/**
 * Standardize a single recipe during load
 */
function standardizeRecipe(
  recipe: any,
  cuisineName: string,
  mealType: string,
  season: string,
): Recipe {
  // Ensure the recipe is an object
  if (!recipe || typeof recipe !== "object") {
    return recipe;
  }

  const standardized: Record<string, unknown> = { ...recipe };

  // 1. Generate ID if missing
  if (!standardized.id) {
    standardized.id = generateRecipeId(
      (standardized.name as string) || "unnamed",
      cuisineName,
      mealType,
      season,
    );
  }

  // 2. Ensure cuisine is set
  if (!standardized.cuisine) {
    standardized.cuisine = cuisineName;
  }

  // 3. Ensure mealType is an array
  if (!standardized.mealType) {
    standardized.mealType = [mealType];
  } else if (!Array.isArray(standardized.mealType)) {
    standardized.mealType = [standardized.mealType];
  }

  // 4. Ensure season is an array
  if (!standardized.season) {
    standardized.season =
      season === "all" ? ["spring", "summer", "autumn", "winter"] : [season];
  } else if (!Array.isArray(standardized.season)) {
    standardized.season = [standardized.season];
  }

  // 5. Add default elemental properties if missing
  if (!standardized.elementalProperties) {
    standardized.elementalProperties = {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    } as ElementalProperties;
  } else {
    // Normalize existing elemental properties
    const props = standardized.elementalProperties as Record<string, number>;
    const elements = ["Fire", "Water", "Earth", "Air"];
    let sum = 0;

    for (const elem of elements) {
      const val = typeof props[elem] === "number" ? props[elem] : 0.25;
      props[elem] = val;
      sum += val;
    }

    // Normalize to sum to 1.0 if needed
    if (Math.abs(sum - 1) > 0.01 && sum > 0) {
      for (const elem of elements) {
        props[elem] = props[elem] / sum;
      }
    }

    standardized.elementalProperties = props as unknown as ElementalProperties;
  }

  // 6. Ensure servingSize is a number
  if (
    standardized.servingSize === undefined ||
    standardized.servingSize === null
  ) {
    standardized.servingSize = standardized.numberOfServings || 4;
  } else if (typeof standardized.servingSize === "string") {
    standardized.servingSize = parseInt(standardized.servingSize, 10) || 4;
  }

  // 7. Copy instructions from preparationSteps if missing
  if (
    (!standardized.instructions ||
      !Array.isArray(standardized.instructions) ||
      standardized.instructions.length === 0) &&
    Array.isArray(standardized.preparationSteps) &&
    standardized.preparationSteps.length > 0
  ) {
    standardized.instructions = standardized.preparationSteps;
  }

  // 8. Ensure instructions is an array
  if (!Array.isArray(standardized.instructions)) {
    if (typeof standardized.instructions === "string") {
      standardized.instructions = [standardized.instructions];
    } else {
      standardized.instructions = ["Prepare according to traditional methods"];
    }
  }

  // 9. Ensure ingredients array exists and has proper structure
  if (!Array.isArray(standardized.ingredients)) {
    standardized.ingredients = [];
  } else {
    standardized.ingredients = standardized.ingredients.map((ing: any) => {
      if (!ing || typeof ing !== "object") return ing;

      return {
        ...ing,
        amount:
          typeof ing.amount === "number"
            ? ing.amount
            : typeof ing.amount === "string"
              ? parseFloat(ing.amount) || 1
              : 1,
        unit: ing.unit || "piece",
        name:
          typeof ing.name === "string"
            ? ing.name.toLowerCase()
            : String(ing.name || ""),
      };
    });
  }

  // 10. Ensure cookingMethods is an array
  if (
    standardized.cookingMethods &&
    !Array.isArray(standardized.cookingMethods)
  ) {
    standardized.cookingMethods = [standardized.cookingMethods];
  }

  // 11. Ensure tools is an array
  if (standardized.tools && !Array.isArray(standardized.tools)) {
    standardized.tools = [standardized.tools];
  }

  // 12. Ensure allergens is an array
  if (standardized.allergens && !Array.isArray(standardized.allergens)) {
    standardized.allergens = [standardized.allergens];
  }

  return standardized as unknown as Recipe;
}

// Create flattened list of all recipes from all cuisines with standardization
const flattenCuisineRecipes = () => {
  const allRecipes: Recipe[] = [];
  const seenIds = new Set<string>();
  const cuisines = cuisinesMap as Record<string, any>;

  // Iterate only through primary cuisine keys to avoid duplicates from aliases
  PRIMARY_CUISINE_KEYS.forEach((cuisineName) => {
    const cuisine = cuisines[cuisineName];
    if (cuisine && cuisine.dishes) {
      // Iterate through meal types
      Object.entries(cuisine.dishes).forEach(
        ([mealType, mealTypeData]: [string, unknown]) => {
          // Guard against null/undefined mealType before calling Object.entries
          if (mealTypeData && typeof mealTypeData === "object") {
            // Iterate through seasons
            Object.entries(mealTypeData as Record<string, unknown>).forEach(
              ([season, recipes]: [string, unknown]) => {
                if (Array.isArray(recipes)) {
                  recipes.forEach((recipe: any) => {
                    // Standardize the recipe
                    const standardized = standardizeRecipe(
                      recipe,
                      cuisineName,
                      mealType,
                      season,
                    );

                    // Avoid duplicates by ID
                    const id = standardized.id as string;
                    if (!seenIds.has(id)) {
                      seenIds.add(id);
                      allRecipes.push(standardized);
                    }
                  });
                }
              },
            );
          }
        },
      );
    }
  });

  return allRecipes;
};

// Export flattened recipes from all 14 primary cuisines
export const allRecipes = flattenCuisineRecipes();

// Export recipe count for debugging
export const recipeCount = allRecipes.length;

// Note: getBestRecipeMatches moved to @/data/recipes to avoid circular dependency
