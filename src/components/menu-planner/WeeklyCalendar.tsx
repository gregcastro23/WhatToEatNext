"use client";

/**
 * Weekly Calendar Component
 *
 * Desktop & Tablet: Renders the modern, space-efficient WeekBoard
 * Mobile (<768px): Renders the RedesignedMobilePlanner
 *
 * @file src/components/menu-planner/WeeklyCalendar.tsx
 */

import React, { useMemo, useState } from "react";
import { useMenuPlanner } from "@/contexts/MenuPlannerContext";
import { useAstrologicalState } from "@/hooks/useAstrologicalState";
import { useNutritionTracking } from "@/hooks/useNutritionTracking";
import { _logger } from "@/lib/logger";
import type { DayOfWeek, MealSlot as MealSlotType } from "@/types/menuPlanner";
import WeekBoard from "./board/WeekBoard";
import CopyMealModal from "./CopyMealModal";
import FocusedDayView from "./FocusedDayView";
import RedesignedMobilePlanner from "./redesign/RedesignedMobilePlanner";
import { usePlannerUI } from "./shell/PlannerUIContext";
import RecipePlacementBanner from "./shell/RecipePlacementBanner";
import { useRecipePlacement } from "./shell/useRecipePlacement";

export interface WeeklyCalendarProps {
  onMealClick?: (mealSlot: MealSlotType) => void;
  /** Fires the "Shop the week" flow (build grocery list + open it). Mobile redesign. */
  onShopWeek?: () => void;
  /** Opens the week's Nutrition Dashboard. Mobile redesign ("Week nutrition"). */
  onOpenNutrition?: () => void;
}

function isDayOfWeek(val: number): val is DayOfWeek {
  return val >= 0 && val <= 6 && Number.isInteger(val);
}

export default function WeeklyCalendar({
  onShopWeek,
  onOpenNutrition,
}: WeeklyCalendarProps): React.JSX.Element {
  const {
    currentMenu,
    isLoading,
    navigation,
    copyMealToSlots,
    moveMealToSlots,
    generationPreferences,
  } = useMenuPlanner();

  const { placingRecipe, placeRecipe } = useRecipePlacement();
  const { state } = usePlannerUI();
  const { currentPlanetaryHour } = useAstrologicalState();
  const weeklyNutrition = useNutritionTracking(
    currentMenu,
    generationPreferences.nutritionalTargets,
  );

  // Copy/move modal state
  const [copyMealModalState, setCopyMealModalState] = useState<{
    isOpen: boolean;
    sourceMeal: MealSlotType | null;
  }>({
    isOpen: false,
    sourceMeal: null,
  });

  // Focused day view modal state
  const [focusedDayState, setFocusedDayState] = useState<{
    isOpen: boolean;
    dayOfWeek: DayOfWeek;
  }>({
    isOpen: false,
    dayOfWeek: 0 as DayOfWeek,
  });

  // 7-day date resolution for mobile planner & focused day
  const weekDates = useMemo<[Date, Date, Date, Date, Date, Date, Date]>(() => {
    const at = (i: number): Date => {
      const date = new Date(navigation.currentWeekStart);
      date.setDate(date.getDate() + i);
      return date;
    };
    return [at(0), at(1), at(2), at(3), at(4), at(5), at(6)];
  }, [navigation.currentWeekStart]);

  const todayDateStr = new Date().toDateString();
  const todayIndex = weekDates.findIndex(
    (d) => d.toDateString() === todayDateStr,
  );
  const todayDayOfWeek: DayOfWeek | null =
    isDayOfWeek(todayIndex) ? todayIndex : null;

  // Group meals by day for mobile
  const mealsByDay = useMemo<Record<DayOfWeek, MealSlotType[]>>(() => {
    const grouped: Record<DayOfWeek, MealSlotType[]> = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
    };

    if (!currentMenu) return grouped;

    currentMenu.meals.forEach((meal) => {
      grouped[meal.dayOfWeek].push(meal);
    });

    return grouped;
  }, [currentMenu]);

  // Handle copy/move meal click
  const handleCopyMealClick = (mealSlot: MealSlotType): void => {
    if (!mealSlot.recipe) return;
    setCopyMealModalState({
      isOpen: true,
      sourceMeal: mealSlot,
    });
  };

  // Handle copy operation
  const handleCopy = (targetSlotIds: string[], servings?: number): void => {
    if (!copyMealModalState.sourceMeal) return;
    copyMealToSlots(copyMealModalState.sourceMeal.id, targetSlotIds, servings).catch((err: unknown) => {
      _logger.error("[WeeklyCalendar] copyMealToSlots failed:", err);
    });
    setCopyMealModalState({ isOpen: false, sourceMeal: null });
  };

  // Handle move operation
  const handleMove = (targetSlotIds: string[], servings?: number): void => {
    if (!copyMealModalState.sourceMeal) return;
    moveMealToSlots(copyMealModalState.sourceMeal.id, targetSlotIds, servings).catch((err: unknown) => {
      _logger.error("[WeeklyCalendar] moveMealToSlots failed:", err);
    });
    setCopyMealModalState({ isOpen: false, sourceMeal: null });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 alchm-panel rounded-xl border border-muted">
        <div className="text-center">
          <div className="animate-spin text-3xl mb-2">⏳</div>
          <p className="text-on-surface-variant font-mono text-xs">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (!currentMenu) {
    return (
      <div className="flex items-center justify-center h-64 alchm-panel rounded-xl border border-muted">
        <div className="text-center">
          <p className="text-on-surface-variant font-mono text-xs">No menu available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop & Tablet: Modern WeekBoard */}
      <div className="hidden md:block">
        <WeekBoard
          onCopyMeal={handleCopyMealClick}
          weeklyNutrition={weeklyNutrition}
        />
      </div>

      {/* Mobile: Data-forward Day Cards & Insights Rail */}
      <div className="md:hidden space-y-3">
        <RecipePlacementBanner />
        <RedesignedMobilePlanner
          placingRecipe={placingRecipe}
          onPlaceMeal={(slot) => { void placeRecipe(slot); }}
          showSnacks={state.showSnacks}
          weekDates={weekDates}
          mealsByDay={mealsByDay}
          todayDayOfWeek={todayDayOfWeek}
          weeklyNutrition={weeklyNutrition}
          currentPlanetaryHour={currentPlanetaryHour}
          onShopWeek={onShopWeek}
          onOpenNutrition={onOpenNutrition}
        />
      </div>

      {/* Copy/Move Meal Modal */}
      {copyMealModalState.sourceMeal && (
        <CopyMealModal
          isOpen={copyMealModalState.isOpen}
          onClose={(): void =>
            setCopyMealModalState({ isOpen: false, sourceMeal: null })
          }
          sourceMeal={copyMealModalState.sourceMeal}
          allMeals={currentMenu.meals}
          onCopy={handleCopy}
          onMove={handleMove}
        />
      )}

      {/* Focused Day View Modal */}
      {focusedDayState.isOpen && (
        <FocusedDayView
          dayOfWeek={focusedDayState.dayOfWeek}
          date={weekDates[focusedDayState.dayOfWeek]}
          meals={mealsByDay[focusedDayState.dayOfWeek]}
          onClose={(): void =>
            setFocusedDayState({ isOpen: false, dayOfWeek: 0 })
          }
          onDayChange={(direction: "prev" | "next"): void => {
            setFocusedDayState((prev) => {
              const shifted =
                direction === "prev"
                  ? (prev.dayOfWeek - 1 + 7) % 7
                  : (prev.dayOfWeek + 1) % 7;
              return {
                ...prev,
                dayOfWeek: isDayOfWeek(shifted) ? shifted : 0,
              };
            });
          }}
        />
      )}
    </div>
  );
}
