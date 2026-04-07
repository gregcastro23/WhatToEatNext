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
        const dishes = (mealCategory as any)[season];
        if (!Array.isArray(dishes)) continue;

        for (const dish of dishes) {
          if (!dish?.name) continue;

          const key = `${dish.name.toLowerCase().trim()}`;
          if (seen.has(key)) continue;
          seen.add(key);

          const alchemical = dish.alchemicalProfile ?? {};
          const nutritional = dish.nutritionalProfile ?? dish.nutrition ?? {};
          const prepTime = dish.prepTimeMinutes ?? 0;
          const cookTime = dish.cookTimeMinutes ?? 0;

          const dietaryTags: string[] = [];
          if (dish.isVegetarian || alchemical.vegetarian) dietaryTags.push("vegetarian");
          if (dish.isVegan || alchemical.vegan) dietaryTags.push("vegan");
          if (dish.isGlutenFree || alchemical.glutenFree) dietaryTags.push("glutenFree");
          if (dish.isDairyFree || alchemical.dairyFree) dietaryTags.push("dairyFree");

          const recipe: Recipe = {
            id: dish.id ?? `${cuisineName.toLowerCase()}-${key.replace(/\s+/g, "-")}`,
            name: dish.name,
            description: dish.description ?? "",
            cuisine: dish.cuisine ?? dish.alchemicalProfile?.cuisine ?? cuisineName,
            ingredients: Array.isArray(dish.ingredients)
              ? dish.ingredients.map((ing: any) =>
                  typeof ing === "string"
                    ? { name: ing, amount: 1, unit: "" }
                    : {
                        name: ing.name ?? "",
                        amount: Number(ing.amount ?? ing.quantity ?? 0),
                        unit: ing.unit ?? "",
                        optional: ing.optional ?? false,
                        notes: ing.notes ?? undefined,
                      }
                )
              : [],
            instructions: Array.isArray(dish.instructions)
              ? dish.instructions.map((step: any) =>
                  typeof step === "string"
                    ? step
                    : step.instruction ?? step.text ?? step.step ?? String(step)
                )
              : [],
            prepTime: String(prepTime),
            cookTime: String(cookTime),
            totalTime: String(prepTime + cookTime),
            timeToMake: `${prepTime + cookTime} minutes`,
            mealType: dish.mealType ?? [mealType],
            season: dish.season ?? [season],
            tags: dietaryTags,
            isVegetarian: dietaryTags.includes("vegetarian"),
            isVegan: dietaryTags.includes("vegan"),
            isGlutenFree: dietaryTags.includes("glutenFree"),
            isDairyFree: dietaryTags.includes("dairyFree"),
            nutrition: nutritional,
            elementalProperties: dish.elementalProfile ?? dish.elementalProperties ?? {
              Fire: 0.25,
              Water: 0.25,
              Earth: 0.25,
              Air: 0.25,
            },
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
