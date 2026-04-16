"use server";

import { primaryCuisines } from "@/data/cuisines/index";
import type { IndexedRecipe, RecipeIndex } from "@/types/indexedRecipe";
import type { Recipe } from "@/types/recipe";
import { computeRecipeNutritionFromIngredients } from "@/utils/ingredientNutritionAggregation";
import {
  hasNutritionData,
  normalizeRecipeNutrition,
} from "@/utils/recipeNutrition";

interface NutritionCoverageStats {
  total: number;
  fromSource: number; // had usable nutritionPerServing / nutrition / nutritionalProfile
  fromIngredients: number; // filled via UnifiedIngredientService fallback
  missing: number; // still zero after both paths
  missingNames: string[];
}

let _cachedRecipes: IndexedRecipe[] | null = null;
let _cachedIndex: RecipeIndex | null = null;
let _nutritionStats: NutritionCoverageStats = {
  total: 0,
  fromSource: 0,
  fromIngredients: 0,
  missing: 0,
  missingNames: [],
};

function lowerArray(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    const out = value
      .filter((v): v is string => typeof v === "string")
      .map((v) => v.toLowerCase());
    return out.length ? out : undefined;
  }
  if (typeof value === "string") return [value.toLowerCase()];
  return undefined;
}

/**
 * Extract and normalize recipes from the static cuisine data files.
 * This is the authoritative source for the 351 recipes.
 */
function extractRecipesFromCuisines(): IndexedRecipe[] {
  const recipes: IndexedRecipe[] = [];
  const seen = new Set<string>();
  const stats: NutritionCoverageStats = {
    total: 0,
    fromSource: 0,
    fromIngredients: 0,
    missing: 0,
    missingNames: [],
  };

  for (const [cuisineName, cuisine] of Object.entries(primaryCuisines)) {
    if (!cuisine?.dishes) continue;

    const mealTypes = ["breakfast", "lunch", "dinner", "dessert"] as const;

    for (const mealType of mealTypes) {
      const mealCategory = cuisine.dishes[mealType];
      if (!mealCategory) continue;

      const seasons = ["spring", "summer", "autumn", "winter"] as const;

      for (const season of seasons) {
        const dishes = (mealCategory as Record<string, unknown>)[season];
        if (!Array.isArray(dishes)) continue;

        for (const dish of dishes) {
          if (!dish?.name || typeof dish.name !== "string") continue;

          const key = `${dish.name.toLowerCase().trim()}`;
          if (seen.has(key)) continue;
          seen.add(key);

          const alchemical = (dish.alchemicalProfile ?? {}) as Record<
            string,
            unknown
          >;
          const prepTime = Number(dish.prepTimeMinutes ?? 0);
          const cookTime = Number(dish.cookTimeMinutes ?? 0);

          const dietaryTags: string[] = [];
          if (dish.isVegetarian || alchemical.vegetarian)
            dietaryTags.push("vegetarian");
          if (dish.isVegan || alchemical.vegan) dietaryTags.push("vegan");
          if (dish.isGlutenFree || alchemical.glutenFree)
            dietaryTags.push("glutenFree");
          if (dish.isDairyFree || alchemical.dairyFree)
            dietaryTags.push("dairyFree");

          const recipe: IndexedRecipe = {
            id:
              (dish.id as string) ??
              `${cuisineName.toLowerCase()}-${key.replace(/\s+/g, "-")}`,
            name: dish.name,
            description: (dish.description as string) ?? "",
            cuisine:
              (dish.cuisine as string) ??
              ((dish.alchemicalProfile as Record<string, unknown>)
                ?.cuisine as string) ??
              cuisineName,
            ingredients: Array.isArray(dish.ingredients)
              ? dish.ingredients.map((ing: unknown) => {
                  if (typeof ing === "string") {
                    return { name: ing, amount: 1, unit: "" };
                  }
                  const i = ing as Record<string, unknown>;
                  return {
                    name: (i.name as string) ?? "",
                    amount: Number(i.amount ?? i.quantity ?? 0),
                    unit: (i.unit as string) ?? "",
                    optional: (i.optional as boolean) ?? false,
                    notes: (i.notes as string) ?? undefined,
                  };
                })
              : [],
            instructions: Array.isArray(dish.instructions)
              ? dish.instructions.map((step: unknown) => {
                  if (typeof step === "string") return step;
                  const s = step as Record<string, unknown>;
                  return (
                    (s.instruction as string) ??
                    (s.text as string) ??
                    (s.step as string) ??
                    String(step)
                  );
                })
              : [],
            prepTime: String(prepTime),
            cookTime: String(cookTime),
            totalTime: String(prepTime + cookTime),
            timeToMake: `${prepTime + cookTime} minutes`,
            mealType: (dish.mealType as string[]) ?? [mealType],
            season: (dish.season as string[]) ?? [season],
            tags: dietaryTags,
            isVegetarian: dietaryTags.includes("vegetarian"),
            isVegan: dietaryTags.includes("vegan"),
            isGlutenFree: dietaryTags.includes("glutenFree"),
            isDairyFree: dietaryTags.includes("dairyFree"),
            numberOfServings:
              Number(
                (dish as { numberOfServings?: unknown }).numberOfServings ??
                  (dish as { servings?: unknown }).servings,
              ) || undefined,
            nutrition: undefined,
            elementalProperties:
              (dish.elementalProfile ?? dish.elementalProperties ?? {
                Fire: 0.25,
                Water: 0.25,
                Earth: 0.25,
                Air: 0.25,
              }) as Recipe["elementalProperties"],
          };

          // ── Nutrition pipeline ──
          //
          // 1. Try the canonical field-name mapping (reads
          //    nutritionPerServing / nutritionalProfile / nutrition).
          // 2. If that produces nothing, compute from the ingredient list
          //    via UnifiedIngredientService.
          // 3. If both fail, log a dev-only warning and leave nutrition
          //    undefined so the counter gracefully skips this recipe.
          stats.total++;
          const normalized = normalizeRecipeNutrition(
            dish as Record<string, unknown>,
          );
          if (normalized && hasNutritionData(normalized)) {
            recipe.nutrition = normalized as Recipe["nutrition"];
            stats.fromSource++;
          } else {
            const computed = computeRecipeNutritionFromIngredients(recipe);
            if (computed && hasNutritionData(computed)) {
              recipe.nutrition = computed as Recipe["nutrition"];
              stats.fromIngredients++;
            } else {
              stats.missing++;
              if (stats.missingNames.length < 20) {
                stats.missingNames.push(recipe.name);
              }
            }
          }

          // ── Precomputed lowercased fields for perf in the bridge ──
          recipe._lcCuisine = recipe.cuisine?.toLowerCase() ?? "";
          recipe._lcTags = lowerArray(recipe.tags);
          recipe._lcCookingMethod = lowerArray(
            (recipe as { cookingMethod?: unknown }).cookingMethod,
          );
          recipe._lcSeasons = lowerArray(recipe.season);
          recipe._lcMealTypes = lowerArray(recipe.mealType);

          recipes.push(recipe);
        }
      }
    }
  }

  _nutritionStats = stats;

  // Dev-only visibility for any recipes that couldn't be filled by either
  // path. Silent in production to avoid flooding logs.
  if (process.env.NODE_ENV !== "production" && stats.missing > 0) {
    console.warn(
      `[getServerRecipes] ${stats.missing}/${stats.total} recipes have no usable nutrition. ` +
        `Sample: ${stats.missingNames.slice(0, 5).join(", ")}`,
    );
  }

  return recipes;
}

/** Build the mealType × season lookup index from a flat recipe array. */
function buildRecipeIndex(recipes: IndexedRecipe[]): RecipeIndex {
  const index: RecipeIndex = new Map();
  const mealTypes = ["breakfast", "lunch", "dinner", "dessert"] as const;
  const seasons = ["spring", "summer", "autumn", "winter", "all"] as const;

  for (const mt of mealTypes) {
    for (const s of seasons) {
      index.set(`${mt}-${s}`, []);
    }
  }

  for (const r of recipes) {
    const recipeMealTypes =
      r._lcMealTypes && r._lcMealTypes.length > 0
        ? r._lcMealTypes
        : ["breakfast", "lunch", "dinner"];
    const recipeSeasons =
      r._lcSeasons && r._lcSeasons.length > 0 ? r._lcSeasons : ["all"];

    for (const mt of mealTypes) {
      const mtMatches =
        recipeMealTypes.includes(mt) ||
        recipeMealTypes.some((m) => m.includes(mt));
      if (!mtMatches) continue;

      for (const s of recipeSeasons) {
        const seasonKey =
          s === "fall" ? "autumn" : s === "all" ? "all" : s;
        const bucketKey = `${mt}-${seasonKey}`;
        const bucket = index.get(bucketKey);
        if (bucket) bucket.push(r);
      }
    }
  }

  return index;
}

/**
 * Server action to fetch all recipes from the static cuisine data files.
 * Prevents database code from being bundled into client components.
 */
export async function getServerRecipes(): Promise<Recipe[]> {
  try {
    if (_cachedRecipes) {
      return _cachedRecipes;
    }
    const recipes = extractRecipesFromCuisines();
    _cachedRecipes = recipes;
    _cachedIndex = buildRecipeIndex(recipes);
    console.log(
      `[getServerRecipes] Loaded ${recipes.length} recipes from static cuisine data ` +
        `(nutrition: ${_nutritionStats.fromSource} from source, ${_nutritionStats.fromIngredients} computed, ${_nutritionStats.missing} missing)`,
    );
    return recipes;
  } catch (error) {
    console.error("Failed to load recipes from cuisine data:", error);
    return [];
  }
}

/**
 * Return the prebuilt mealType × season index, building it on demand if
 * `getServerRecipes` hasn't been called yet. Used by the recommendation
 * bridge to avoid scanning all 351 recipes on every generation request.
 */
export async function getServerRecipeIndex(): Promise<RecipeIndex> {
  if (!_cachedIndex) {
    await getServerRecipes();
  }
  return _cachedIndex ?? new Map();
}

/**
 * Diagnostics: how many of the cached recipes have real nutrition data and
 * from which source. Returned as a plain object so it can be serialized to
 * a diagnostics page.
 */
export async function getNutritionCoverageStats(): Promise<NutritionCoverageStats> {
  if (!_cachedRecipes) {
    await getServerRecipes();
  }
  return { ..._nutritionStats };
}
