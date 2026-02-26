"use client";

/**
 * useNutritionTracking Hook
 * Real-time nutrition tracking that recalculates whenever the menu changes.
 */

import { useMemo } from "react";
import { getNutritionTrackingService } from "@/services/NutritionTrackingService";
import type { WeeklyMenu, DayOfWeek, MealSlot } from "@/types/menuPlanner";
import type { WeeklyNutritionResult } from "@/types/nutrition";

/**
 * Given the current WeeklyMenu, compute a WeeklyNutritionResult in real-time.
 * Re-runs whenever currentMenu reference changes (i.e., when meals are added/removed).
 */
export function useNutritionTracking(
  currentMenu: WeeklyMenu | null,
): WeeklyNutritionResult | null {
  return useMemo(() => {
    if (!currentMenu) return null;

    const service = getNutritionTrackingService();

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
  }, [currentMenu]);
}
