"use server";

import { primaryCuisines } from "@/data/cuisines/index";
import type { Recipe } from "@/types/recipe";

/**
 * Extract and normalize recipes from the static cuisine data files.
 * This is the authoritative source for the 351 recipes.
 */
function extractRecipesFromCuisines(): Recipe[] {
  const recipes: Recipe[] = [];
  const seen = new Set<string>();

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

          const alchemical = (dish.alchemicalProfile ?? {}) as Record<string, unknown>;
          const nutritional = (dish.nutritionalProfile ?? dish.nutrition ?? {}) as Record<string, unknown>;
          const prepTime = Number(dish.prepTimeMinutes ?? 0);
          const cookTime = Number(dish.cookTimeMinutes ?? 0);

          const dietaryTags: string[] = [];
          if (dish.isVegetarian || alchemical.vegetarian) dietaryTags.push("vegetarian");
          if (dish.isVegan || alchemical.vegan) dietaryTags.push("vegan");
          if (dish.isGlutenFree || alchemical.glutenFree) dietaryTags.push("glutenFree");
          if (dish.isDairyFree || alchemical.dairyFree) dietaryTags.push("dairyFree");

          const recipe: Recipe = {
            id: (dish.id as string) ?? `${cuisineName.toLowerCase()}-${key.replace(/\s+/g, "-")}`,
            name: dish.name,
            description: (dish.description as string) ?? "",
            cuisine: (dish.cuisine as string) ?? (dish.alchemicalProfile as Record<string, unknown>)?.cuisine as string ?? cuisineName,
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
                  return (s.instruction as string) ?? (s.text as string) ?? (s.step as string) ?? String(step);
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
            nutrition: nutritional as any, // nutritional is complex and fits the interface loosely
            elementalProperties: (dish.elementalProfile ?? dish.elementalProperties ?? {
              Fire: 0.25,
              Water: 0.25,
              Earth: 0.25,
              Air: 0.25,
            }),
          };

          recipes.push(recipe);
        }
      }
    }
  }

  return recipes;
}

// Server-side in-memory cache
let _cachedRecipes: Recipe[] | null = null;

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
    console.log(`[getServerRecipes] Loaded ${recipes.length} recipes from static cuisine data`);
    return recipes;
  } catch (error) {
    console.error("Failed to load recipes from cuisine data:", error);
    return [];
  }
}
