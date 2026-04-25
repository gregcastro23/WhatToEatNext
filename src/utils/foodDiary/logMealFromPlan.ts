/**
 * logMealFromPlan
 *
 * Translates a planned meal slot (or a bare recipe) into a food diary entry.
 * Used by the "I ate this" action so a single click records the exact recipe
 * with full nutrition and elemental properties rather than re-typing.
 *
 * Pure translation — no I/O here. Callers pass the output to the diary
 * service (server action `createServerEntry` / `foodDiaryService.createEntry`).
 *
 * @file src/utils/foodDiary/logMealFromPlan.ts
 */

import type { ElementalProperties } from "@/types/alchemy";
import type { CreateFoodDiaryEntryInput } from "@/types/foodDiary";
import type { MealSlot, MealType } from "@/types/menuPlanner";
import type { NutritionalSummary } from "@/types/nutrition";
import type { Recipe } from "@/types/recipe";

/**
 * Inputs a caller can provide. Either pass a full `mealSlot` (preferred — it
 * carries meal type, servings, and the recipe), or pass the pieces directly
 * when logging ad-hoc outside the planner.
 */
export type LogFromPlanInput =
  | { mealSlot: MealSlot; date?: Date; time?: string; notes?: string }
  | {
      recipe: Recipe;
      mealType: MealType;
      servings?: number;
      date?: Date;
      time?: string;
      notes?: string;
    };

function isMealSlotInput(
  input: LogFromPlanInput,
): input is { mealSlot: MealSlot; date?: Date; time?: string; notes?: string } {
  return "mealSlot" in input;
}

function scaleNutrition(
  nutrition: Partial<NutritionalSummary> | undefined,
  servings: number,
): Partial<NutritionalSummary> | undefined {
  if (!nutrition || servings === 1) return nutrition;
  const scaled: Partial<NutritionalSummary> = {};
  for (const [key, value] of Object.entries(nutrition)) {
    if (typeof value === "number") {
      scaled[key as keyof NutritionalSummary] =
        Math.round(value * servings * 10) / 10;
    }
  }
  return scaled;
}

function nowTimeString(): string {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, "0")}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}

/**
 * Build a `CreateFoodDiaryEntryInput` that faithfully represents a planned
 * meal. Does not persist — the caller passes this to the diary service.
 */
export function buildDiaryEntryFromPlan(
  input: LogFromPlanInput,
): CreateFoodDiaryEntryInput {
  const recipe: Recipe = isMealSlotInput(input)
    ? (input.mealSlot.recipe as unknown as Recipe)
    : input.recipe;
  const mealType: MealType = isMealSlotInput(input)
    ? input.mealSlot.mealType
    : input.mealType;
  const servings = isMealSlotInput(input)
    ? input.mealSlot.servings || 1
    : input.servings ?? 1;

  if (!recipe) {
    throw new Error("logMealFromPlan: recipe is required on the meal slot");
  }

  const recipeNutrition = (recipe as Recipe & {
    nutrition?: NutritionalSummary;
  }).nutrition;
  const elementalProperties = (recipe as Recipe & {
    elementalProperties?: ElementalProperties;
  }).elementalProperties;

  const date = input.date ?? new Date();
  const time = input.time ?? nowTimeString();

  return {
    foodName: recipe.name ?? "Planned meal",
    foodSource: "recipe",
    sourceId: recipe.id,
    date,
    mealType,
    time,
    // Recipes store nutrition per-serving; our `grams` is best-effort so we
    // neutralize the FoodDiaryService scaling by setting grams=100, quantity=1
    // and passing the already-scaled nutrition directly.
    serving: {
      amount: servings,
      unit: "serving",
      grams: 100,
      description:
        servings === 1 ? "1 serving" : `${servings} servings`,
    },
    quantity: 1,
    nutrition: scaleNutrition(recipeNutrition, servings),
    elementalProperties,
    notes: input.notes,
    tags: ["from-plan"],
  };
}
