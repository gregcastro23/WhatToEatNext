"use client";

/**
 * usePlanActions — the planner's bulk "auto-plan" operations, lifted out of
 * the legacy QuickActionsToolbar so the new header's "Plan my week" split
 * button (and anything else) can drive them without rendering a toolbar.
 *
 * Operations:
 *  - fillWeek     — fill every empty slot across all 7 days (quest-eligible)
 *  - fillNextDay  — fill the next day that still has empty slots
 *  - balance      — swap the lowest-scoring recipes for more nutritious ones
 *  - addVariety   — swap the most ingredient-repetitive recipes
 *
 * `mealTypes` scopes generation to the rows the user can actually see (the
 * snack row is hidden by default), so we never fill slots that are off-screen.
 *
 * @file src/components/menu-planner/shell/usePlanActions.ts
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { getServerRecipes } from "@/actions/recipes";
import { useMenuPlanner } from "@/contexts/MenuPlannerContext";
import { useOptionalUser } from "@/contexts/UserContext";
import { reportQuestEvent } from "@/lib/questReporter";
import type { DayOfWeek, MealType } from "@/types/menuPlanner";
import { getDayName } from "@/types/menuPlanner";
import type { Recipe } from "@/types/recipe";
import { createLogger } from "@/utils/logger";
import { isSuitableForMealType } from "@/utils/menuPlanner/mealTypeMatching";

const logger = createLogger("usePlanActions");

// Ingredient entries may arrive as plain strings or objects at runtime
// despite the declared RecipeIngredient[] type; capture only the field read.
interface NamedIngredientLike {
  name?: string;
}

const ALL_DAYS: DayOfWeek[] = [0, 1, 2, 3, 4, 5, 6];
export const MAIN_MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner"];
export const ALL_MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

function ingredientName(ing: unknown): string {
  if (typeof ing === "string") return ing.toLowerCase();
  if (
    ing &&
    typeof ing === "object" &&
    "name" in ing &&
    typeof ing.name === "string"
  ) {
    return ing.name.toLowerCase();
  }
  return "";
}

/** Score a recipe for nutritional gap-filling potential (0–100). */
export function calculateNutritionScore(recipe: Recipe): number {
  let score = 0;
  const { nutrition } = recipe;
  if (!nutrition) return 50; // neutral score if no nutrition data

  if (nutrition.protein && nutrition.protein > 15) score += 20;
  if (nutrition.fiber && nutrition.fiber > 5) score += 15;
  if (nutrition.calories && nutrition.calories > 200 && nutrition.calories < 800)
    score += 15;

  return Math.min(100, score + 50);
}

export type PlanActionKind = "week" | "day" | "balance" | "variety";

export interface PlanActions {
  busy: PlanActionKind | null;
  /** Human-readable progress label while busy (e.g. "Planning Tuesday…"). */
  progressLabel: string;
  nextEmptyDay: DayOfWeek | null;
  filledCount: number;
  canOptimize: boolean;
  hasNatalChart: boolean;
  fillWeek: () => Promise<void>;
  fillNextDay: () => Promise<void>;
  balance: () => Promise<void>;
  addVariety: () => Promise<void>;
}

export function usePlanActions(mealTypes: MealType[] = ALL_MEAL_TYPES): PlanActions {
  const { currentMenu, addMealToSlot, generateMealsForDay, generationPreferences } =
    useMenuPlanner();
  const userContext = useOptionalUser();
  const hasNatalChart = !!userContext?.currentUser?.natalChart;

  const [questPending, setQuestPending] = useState(false);
  const [busy, setBusy] = useState<PlanActionKind | null>(null);
  const [progressDay, setProgressDay] = useState<DayOfWeek | null>(null);

  const filledTypesFor = useCallback(
    (day: DayOfWeek): Set<MealType> =>
      new Set(
        (currentMenu?.meals ?? [])
          .filter((m) => m.dayOfWeek === day && m.recipe)
          .map((m) => m.mealType),
      ),
    [currentMenu],
  );

  const nextEmptyDay = useMemo<DayOfWeek | null>(() => {
    for (const day of ALL_DAYS) {
      const filled = filledTypesFor(day);
      if (mealTypes.some((t) => !filled.has(t))) return day;
    }
    return null;
  }, [filledTypesFor, mealTypes]);

  const filledCount = useMemo(
    () =>
      (currentMenu?.meals ?? []).filter(
        (m) => m.recipe && mealTypes.includes(m.mealType),
      ).length,
    [currentMenu, mealTypes],
  );

  /** Apply generation preferences to filter a recipe list. */
  const applyPreferenceFilters = useCallback(
    (recipes: Recipe[]): Recipe[] => {
      let filtered = recipes;
      const prefs = generationPreferences;

      if (prefs.dietaryRestrictions.length > 0) {
        filtered = filtered.filter((r) =>
          prefs.dietaryRestrictions.every((restriction) => {
            switch (restriction) {
              case "vegetarian": return r.isVegetarian !== false;
              case "vegan": return r.isVegan !== false;
              case "gluten-free": return r.isGlutenFree !== false;
              case "dairy-free": return r.isDairyFree !== false;
              case "nut-free": return r.isNutFree !== false;
              case "low-carb": return r.isLowCarb !== false;
              case "keto": return r.isKeto !== false;
              case "paleo": return r.isPaleo !== false;
              default: return true;
            }
          }),
        );
      }

      if (prefs.excludeIngredients.length > 0) {
        filtered = filtered.filter((r) => {
          const names = r.ingredients.map(ingredientName);
          return !prefs.excludeIngredients.some((excl) =>
            names.some((name) => name.includes(excl.toLowerCase())),
          );
        });
      }

      if (prefs.requiredIngredients.length > 0) {
        filtered = filtered.filter((r) => prefs.requiredIngredients.every((required) =>
          r.ingredients.map(ingredientName).some((name) => name.includes(required.toLowerCase())),
        ));
      }

      if (prefs.preferredCuisines.length > 0) {
        const cuisineFiltered = filtered.filter(
          (r) =>
            r.cuisine &&
            prefs.preferredCuisines.some(
              (c) => c.toLowerCase() === (r.cuisine ?? "").toLowerCase(),
            ),
        );
        // Fall back to the full list if nothing matches.
        if (cuisineFiltered.length > 0) filtered = cuisineFiltered;
      }

      if (prefs.maxPrepTimeMinutes !== null) {
        const maxTime = prefs.maxPrepTimeMinutes;
        const timeFiltered = filtered.filter((r) => {
          const prepTime = parseInt(r.prepTime ?? r.timeToMake ?? "0", 10) || 0;
          return prepTime <= 0 || prepTime <= maxTime;
        });
        filtered = timeFiltered;
      }

      return filtered;
    },
    [generationPreferences],
  );

  const fillDay = useCallback(
    async (day: DayOfWeek): Promise<boolean> => {
      if (!currentMenu) return false;
      const filled = filledTypesFor(day);
      const missing = mealTypes.filter((t) => !filled.has(t));
      if (missing.length === 0) return false;

      setProgressDay(day);
      await generateMealsForDay(day, {
        mealTypes: missing,
        useCurrentPlanetary: true,
        usePersonalization: hasNatalChart,
      });

      return true;
    },
    [currentMenu, filledTypesFor, mealTypes, generateMealsForDay, hasNatalChart],
  );

  const fillNextDay = useCallback(async (): Promise<void> => {
    if (nextEmptyDay === null || busy) return;
    setBusy("day");
    try {
      await fillDay(nextEmptyDay);
    } catch (err) {
      logger.error(`Failed to plan day ${nextEmptyDay}:`, err);
    } finally {
      setBusy(null);
      setProgressDay(null);
    }
  }, [nextEmptyDay, busy, fillDay]);

  const fillWeek = useCallback(async (): Promise<void> => {
    if (!currentMenu || busy || nextEmptyDay === null) return;
    setBusy("week");
    setQuestPending(true);
    try {
      for (const day of ALL_DAYS) {
         
        await fillDay(day);
      }

    } catch (err) {
      logger.error("Failed to plan full week:", err);
    } finally {
      setBusy(null);
      setProgressDay(null);
    }
  }, [currentMenu, busy, fillDay, nextEmptyDay]);

  // Read the committed plan after generation finishes, rather than the menu
  // captured before the async operation started.
  useEffect(() => {
    if (!questPending || busy) return;
    if (MAIN_MEAL_TYPES.every((type) => ALL_DAYS.every((day) =>
      currentMenu?.meals.some((meal) => meal.dayOfWeek === day && meal.mealType === type && meal.recipe),
    ))) reportQuestEvent("generate_meal_plan");
    setQuestPending(false);
  }, [questPending, busy, currentMenu]);

  const balance = useCallback(async (): Promise<void> => {
    if (!currentMenu || busy) return;
    setBusy("balance");
    try {
      const allRecipes = applyPreferenceFilters(await getServerRecipes());
      if (allRecipes.length === 0) return;

      const filledMeals = currentMenu.meals
        .flatMap((m) => {
          if (!m.recipe || m.isLocked || !mealTypes.includes(m.mealType)) return [];
          return [{ slot: m, score: calculateNutritionScore(m.recipe) }];
        })
        .sort((a, b) => a.score - b.score);

      const usedIds = new Set(
        currentMenu.meals.filter((m) => m.recipe).map((m) => m.recipe!.id),
      );
      const swapCount = Math.min(5, Math.floor(filledMeals.length / 2));

      for (let i = 0; i < swapCount; i++) {
        const meal = filledMeals[i];
        if (!meal || meal.slot.isLocked) continue;
        const [replacement] = allRecipes
          .filter(
            (r) =>
              !usedIds.has(r.id) &&
              isSuitableForMealType(r, meal.slot.mealType) &&
              calculateNutritionScore(r) > meal.score,
          )
          .sort((a, b) => calculateNutritionScore(b) - calculateNutritionScore(a));
        if (replacement) {
          usedIds.delete(meal.slot.recipe!.id);
          usedIds.add(replacement.id);
           
          await addMealToSlot(meal.slot.dayOfWeek, meal.slot.mealType, replacement);
        }
      }
    } catch (err) {
      logger.error("Failed to balance nutrition:", err);
    } finally {
      setBusy(null);
    }
  }, [currentMenu, busy, addMealToSlot, applyPreferenceFilters, mealTypes]);

  const addVariety = useCallback(async (): Promise<void> => {
    if (!currentMenu || busy) return;
    setBusy("variety");
    try {
      const allRecipes = applyPreferenceFilters(await getServerRecipes());
      if (allRecipes.length === 0) return;

      const ingredientCounts = new Map<string, number>();
      const recipeIngredients = new Map<string, Set<string>>();
      currentMenu.meals
        .filter((m) => m.recipe)
        .forEach((m) => {
          const ings = new Set<string>();
          m.recipe!.ingredients.forEach((ing) => {
            const name = ingredientName(ing);
            ingredientCounts.set(name, (ingredientCounts.get(name) ?? 0) + 1);
            ings.add(name);
          });
          recipeIngredients.set(m.recipe!.id, ings);
        });

      const filledMeals = currentMenu.meals
        .filter((m) => m.recipe && !m.isLocked && mealTypes.includes(m.mealType))
        .map((m) => {
          const ings = recipeIngredients.get(m.recipe!.id) ?? new Set<string>();
          const repetitionScore = Array.from(ings).reduce(
            (sum, ing) => sum + (ingredientCounts.get(ing) ?? 0),
            0,
          );
          return { slot: m, repetitionScore };
        })
        .sort((a, b) => b.repetitionScore - a.repetitionScore);

      const usedIds = new Set(
        currentMenu.meals.filter((m) => m.recipe).map((m) => m.recipe!.id),
      );
      const swapCount = Math.min(3, Math.floor(filledMeals.length / 3));
      const currentIngs = new Set(ingredientCounts.keys());

      for (let i = 0; i < swapCount; i++) {
        const meal = filledMeals[i];
        if (!meal || meal.slot.isLocked) continue;
        const [mostDiverse] = allRecipes
          .filter((r) => !usedIds.has(r.id) && isSuitableForMealType(r, meal.slot.mealType))
          .map((r) => ({
            recipe: r,
            newIngCount: r.ingredients
              .map(ingredientName)
              .filter((ing) => !currentIngs.has(ing)).length,
          }))
          .sort((a, b) => b.newIngCount - a.newIngCount);
        if (mostDiverse && mostDiverse.newIngCount > 0) {
          usedIds.delete(meal.slot.recipe!.id);
          usedIds.add(mostDiverse.recipe.id);
           
          await addMealToSlot(meal.slot.dayOfWeek, meal.slot.mealType, mostDiverse.recipe);
        }
      }
    } catch (err) {
      logger.error("Failed to add variety:", err);
    } finally {
      setBusy(null);
    }
  }, [currentMenu, busy, addMealToSlot, applyPreferenceFilters, mealTypes]);

  const progressLabel = useMemo(() => {
    switch (busy) {
      case "week":
      case "day":
        return progressDay !== null
          ? `Planning ${getDayName(progressDay)}…`
          : "Planning…";
      case "balance":
        return "Balancing nutrition…";
      case "variety":
        return "Adding variety…";
      default:
        return "";
    }
  }, [busy, progressDay]);

  return {
    busy,
    progressLabel,
    nextEmptyDay,
    filledCount,
    canOptimize: filledCount >= 3,
    hasNatalChart,
    fillWeek,
    fillNextDay,
    balance,
    addVariety,
  };
}
