"use client";

/**
 * useNutritionTracking Hook
 * Real-time nutrition tracking that recalculates whenever the menu changes.
 * Supports custom daily macro targets from user generation preferences.
 */

import { useMemo } from "react";
import { getNutritionTrackingService } from "@/services/NutritionTrackingService";
import type { WeeklyMenu, DayOfWeek, MealSlot } from "@/types/menuPlanner";
import type { WeeklyNutritionResult } from "@/types/nutrition";

/**
 * Optional custom daily macro overrides.
 * null values mean "use default RDA target".
 */
interface DailyMacroOverrides {
  dailyCalories: number | null;
  dailyProteinG: number | null;
  dailyCarbsG: number | null;
  dailyFatG: number | null;
  dailyFiberG: number | null;
}

/**
 * Given the current WeeklyMenu, compute a WeeklyNutritionResult in real-time.
 * Re-runs whenever currentMenu reference or customTargets change.
 *
 * @param currentMenu - The current weekly menu state
 * @param customTargets - Optional custom daily macro targets from generation preferences
 */
export function useNutritionTracking(
  currentMenu: WeeklyMenu | null,
  customTargets?: DailyMacroOverrides | null,
): WeeklyNutritionResult | null {
  return useMemo(() => {
    if (!currentMenu) return null;

    const service = getNutritionTrackingService();

    // Apply custom targets if provided (overrides FDA defaults for set macros)
    if (customTargets) {
      service.applyDailyOverrides({
        calories: customTargets.dailyCalories,
        protein: customTargets.dailyProteinG,
        carbs: customTargets.dailyCarbsG,
        fat: customTargets.dailyFatG,
        fiber: customTargets.dailyFiberG,
      });
    }

    // Group meals by day
    const mealsByDay: Record<DayOfWeek, MealSlot[]> = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
    } as Record<DayOfWeek, MealSlot[]>;

    for (const meal of currentMenu.meals) {
      const day = meal.dayOfWeek;
      if (mealsByDay[day]) {
        mealsByDay[day].push(meal);
      }
    }

    return service.calculateWeeklyNutrition(
      mealsByDay,
      new Date(currentMenu.weekStartDate),
    );
  }, [currentMenu, customTargets]);
}
