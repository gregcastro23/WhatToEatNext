"use client";

/**
 * Weekly Calendar Component
 * 7-day calendar grid displaying meal slots for each day
 *
 * @file src/components/menu-planner/WeeklyCalendar.tsx
 * @created 2026-01-10
 * @updated 2026-01-10 (Phase 2 - Drag-and-drop and Copy/Move)
 */

import React, { useMemo, useState } from "react";
import MealSlot from "./MealSlot";
import CopyMealModal from "./CopyMealModal";
import FocusedDayView from "./FocusedDayView";

import { useMenuPlanner } from "@/contexts/MenuPlannerContext";
import { useAstrologicalState } from "@/hooks/useAstrologicalState";
import type {
  DayOfWeek,
  MealType,
  MealSlot as MealSlotType,
} from "@/types/menuPlanner";
import {
  getDayName,
  getShortDayName,
  getPlanetaryDayCharacteristics,
  PLANETARY_DAY_RULERS,
  formatDateForDisplay,
} from "@/types/menuPlanner";
import type { Recipe } from "@/types/recipe";

interface WeeklyCalendarProps {
  onMealClick?: (mealSlot: MealSlotType) => void;
}

/**
 * Day Column Component
 */
function DayColumn({
  dayOfWeek,
  date,
  meals,
  onMealClick,
  onCopyMealClick,
  onFocusDay,
  currentPlanetaryHour,
}: {
  dayOfWeek: DayOfWeek;
  date: Date;
  meals: MealSlotType[];
  onMealClick?: (mealSlot: MealSlotType) => void;
  onCopyMealClick?: (mealSlot: MealSlotType) => void;
  onFocusDay?: () => void;
  currentPlanetaryHour?: string | null;
}) {
  const {
    addMealToSlot,
    removeMealFromSlot,
    updateMealServings,
    clearDay,
    moveMeal,
    swapMeals,
    generateMealsForDay,
  } = useMenuPlanner();

  const characteristics = getPlanetaryDayCharacteristics(dayOfWeek);
  const isToday = new Date().toDateString() === new Date(date).toDateString();

  // Get meals sorted by type
  const mealTypes: MealType[] = ["breakfast", "lunch", "dinner", "snack"];
  const sortedMeals = mealTypes.map(
    (type) => meals.find((m) => m.mealType === type)!,
  );

  // Planetary symbol
  const planetSymbols: Record<string, string> = {
    Sun: "☉",
    Moon: "☽",
    Mars: "♂",
    Mercury: "☿",
    Jupiter: "♃",
    Venus: "♀",
    Saturn: "♄",
  };

  return (
    <div
      className={`
        flex flex-col border-2 rounded-xl
        ${isToday ? "border-purple-400 shadow-lg" : "border-gray-200"}
        bg-white overflow-hidden
      `}
    >
      {/* Day Header */}
      <div
        className={`
          p-3 border-b-2 border-gray-200
          ${isToday ? "bg-gradient-to-r from-purple-100 to-pink-100" : "bg-gray-50"}
        `}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">
              {planetSymbols[characteristics.planet]}
            </span>
            <div>
              <h3 className="font-bold text-lg text-gray-800">
                {getDayName(dayOfWeek)}
              </h3>
              <p className="text-xs text-gray-600">
                {formatDateForDisplay(date)}
              </p>
            </div>
          </div>
          {isToday && (
            <span className="px-2 py-1 text-xs font-semibold bg-purple-600 text-white rounded">
              Today
            </span>
          )}
        </div>
        <p className="text-xs text-gray-600 italic">
          {characteristics.mealGuidance}
        </p>

        {/* Planetary Hour Indicator (only for today) */}
        {isToday && currentPlanetaryHour && (
          <div className="mt-2 flex items-center gap-2 bg-purple-100 rounded-lg px-3 py-2">
            <span className="text-purple-700 font-semibold text-xs">
              ⏰ Planetary Hour:
            </span>
            <span className="text-purple-900 font-bold text-sm">
              {currentPlanetaryHour}
            </span>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2 mt-2">
          <button
            onClick={onFocusDay}
            className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors font-medium"
            title={`Focus on ${getDayName(dayOfWeek)} with suggestions`}
          >
            🔍 Focus
          </button>
          <button
            onClick={() => generateMealsForDay(dayOfWeek)}
            className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors font-medium"
            title={`Generate meals for ${getDayName(dayOfWeek)} using ${characteristics.planet} energy`}
          >
            ✨ Generate
          </button>
          <button
            onClick={() => clearDay(dayOfWeek)}
            className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
            title="Clear all meals for this day"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Meal Slots */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto">
        {sortedMeals.map((mealSlot) => (
          <MealSlot
            key={mealSlot.id}
            mealSlot={mealSlot}
            onAddRecipe={(recipe: Recipe) =>
              addMealToSlot(dayOfWeek, mealSlot.mealType, recipe)
            }
            onRemoveRecipe={() => removeMealFromSlot(mealSlot.id)}
            onUpdateServings={(servings: number) =>
              updateMealServings(mealSlot.id, servings)
            }
            onMoveMeal={(sourceSlotId: string) =>
              moveMeal(sourceSlotId, mealSlot.id)
            }
            onSwapMeals={(sourceSlotId: string) =>
              swapMeals(sourceSlotId, mealSlot.id)
            }
            onCopyMeal={() => onCopyMealClick?.(mealSlot)}
            onGenerateMeal={() =>
              generateMealsForDay(dayOfWeek, { mealTypes: [mealSlot.mealType] })
            }
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Main Weekly Calendar Component
 */
export default function WeeklyCalendar({ onMealClick }: WeeklyCalendarProps) {
  const {
    currentMenu,
    navigation,
    isLoading,
    copyMealToSlots,
    moveMealToSlots,
  } = useMenuPlanner();
  const { currentPlanetaryHour } = useAstrologicalState();
  const [copyMealModalState, setCopyMealModalState] = useState<{
    isOpen: boolean;
    sourceMeal: MealSlotType | null;
  }>({
    isOpen: false,
    sourceMeal: null,
  });

  // Focused day view state
  const [focusedDayState, setFocusedDayState] = useState<{
    isOpen: boolean;
    dayOfWeek: DayOfWeek;
  }>({
    isOpen: false,
    dayOfWeek: 0 as DayOfWeek,
  });

  // Handle opening focused day view
  const handleOpenFocusedDay = (dayOfWeek: DayOfWeek) => {
    setFocusedDayState({
      isOpen: true,
      dayOfWeek,
    });
  };

  // Handle day change in focused view
  const handleFocusedDayChange = (direction: "prev" | "next") => {
    setFocusedDayState((prev) => ({
      ...prev,
      dayOfWeek: (direction === "prev"
        ? (prev.dayOfWeek - 1 + 7) % 7
        : (prev.dayOfWeek + 1) % 7) as DayOfWeek,
    }));
  };

  // Group meals by day
  const mealsByDay = useMemo(() => {
    if (!currentMenu) return {};

    const grouped: Record<DayOfWeek, MealSlotType[]> = {} as any;
    currentMenu.meals.forEach((meal) => {
      if (!grouped[meal.dayOfWeek]) {
        grouped[meal.dayOfWeek] = [];
      }
      grouped[meal.dayOfWeek].push(meal);
    });

    return grouped;
  }, [currentMenu]);

  // Calculate dates for each day
  const weekDates = useMemo(() => {
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(navigation.currentWeekStart);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [navigation.currentWeekStart]);

  // Handle copy/move meal click
  const handleCopyMealClick = (mealSlot: MealSlotType) => {
    if (!mealSlot.recipe) return;
    setCopyMealModalState({
      isOpen: true,
      sourceMeal: mealSlot,
    });
  };

  // Handle copy operation
  const handleCopy = (targetSlotIds: string[], servings?: number) => {
    if (!copyMealModalState.sourceMeal) return;
    copyMealToSlots(copyMealModalState.sourceMeal.id, targetSlotIds, servings);
    setCopyMealModalState({ isOpen: false, sourceMeal: null });
  };

  // Handle move operation
  const handleMove = (targetSlotIds: string[], servings?: number) => {
    if (!copyMealModalState.sourceMeal) return;
    moveMealToSlots(copyMealModalState.sourceMeal.id, targetSlotIds, servings);
    setCopyMealModalState({ isOpen: false, sourceMeal: null });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-2">⏳</div>
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (!currentMenu) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-gray-600">No menu available</p>
        </div>
      </div>
    );
  }

  // Calculate total meal count for progressive messaging
  const totalMeals = currentMenu?.meals.filter((m) => m.recipe).length || 0;

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between bg-white rounded-xl shadow-md p-4">
        <button
          onClick={navigation.goToPreviousWeek}
          className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors font-medium"
        >
          ← Previous Week
        </button>

        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800">
            {formatDateForDisplay(weekDates[0])} -{" "}
            {formatDateForDisplay(weekDates[6])}
          </h2>
          <button
            onClick={navigation.goToCurrentWeek}
            className="text-sm text-purple-600 hover:text-purple-700 underline mt-1"
          >
            Go to Current Week
          </button>
        </div>

        <button
          onClick={navigation.goToNextWeek}
          className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors font-medium"
        >
          Next Week →
        </button>
      </div>

      {/* Progressive Empty State Banner */}
      {totalMeals === 0 && (
        <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 rounded-xl shadow-md p-6 border-2 border-purple-200">
          <div className="text-center">
            <div className="text-4xl mb-3">🍽️</div>
            <h3 className="text-xl font-bold text-purple-900 mb-2">
              Your Weekly Menu Awaits
            </h3>
            <p className="text-gray-600 mb-4">
              Plan your week with alchemical precision
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-purple-600">✨</span>
                <span>
                  Click "Generate" on any day for planetary-aligned suggestions
                </span>
              </div>
              <div className="hidden sm:block text-gray-400">•</div>
              <div className="flex items-center gap-2">
                <span className="text-blue-600">🔍</span>
                <span>Search recipes below and drag to calendar</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {totalMeals > 0 && totalMeals < 6 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-md p-4 border-2 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">📅</div>
              <div>
                <h3 className="font-bold text-gray-800">
                  Great start! {totalMeals} meal{totalMeals === 1 ? "" : "s"}{" "}
                  planned
                </h3>
                <p className="text-sm text-gray-600">
                  Keep adding meals to build your ideal week
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200">
              <div className="flex gap-1">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-8 rounded ${
                      i < totalMeals ? "bg-purple-500" : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-medium text-gray-600">
                {totalMeals}/6
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Grid - Desktop (7 columns) */}
      <div className="hidden lg:grid lg:grid-cols-7 gap-3">
        {([0, 1, 2, 3, 4, 5, 6] as DayOfWeek[]).map((day) => (
          <DayColumn
            key={day}
            dayOfWeek={day}
            date={weekDates[day]}
            meals={mealsByDay[day] || []}
            onMealClick={onMealClick}
            onCopyMealClick={handleCopyMealClick}
            onFocusDay={() => handleOpenFocusedDay(day)}
            currentPlanetaryHour={currentPlanetaryHour}
          />
        ))}
      </div>

      {/* Calendar Grid - Tablet (4-3 split) */}
      <div className="hidden md:block lg:hidden space-y-3">
        <div className="grid grid-cols-4 gap-3">
          {([0, 1, 2, 3] as DayOfWeek[]).map((day) => (
            <DayColumn
              key={day}
              dayOfWeek={day}
              date={weekDates[day]}
              meals={mealsByDay[day] || []}
              onMealClick={onMealClick}
              onCopyMealClick={handleCopyMealClick}
              onFocusDay={() => handleOpenFocusedDay(day)}
              currentPlanetaryHour={currentPlanetaryHour}
            />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {([4, 5, 6] as DayOfWeek[]).map((day) => (
            <DayColumn
              key={day}
              dayOfWeek={day}
              date={weekDates[day]}
              meals={mealsByDay[day] || []}
              onMealClick={onMealClick}
              onCopyMealClick={handleCopyMealClick}
              onFocusDay={() => handleOpenFocusedDay(day)}
              currentPlanetaryHour={currentPlanetaryHour}
            />
          ))}
        </div>
      </div>

      {/* Calendar Grid - Mobile (1 column) */}
      <div className="md:hidden space-y-3">
        {([0, 1, 2, 3, 4, 5, 6] as DayOfWeek[]).map((day) => (
          <DayColumn
            key={day}
            dayOfWeek={day}
            date={weekDates[day]}
            meals={mealsByDay[day] || []}
            onMealClick={onMealClick}
            onCopyMealClick={handleCopyMealClick}
            onFocusDay={() => handleOpenFocusedDay(day)}
            currentPlanetaryHour={currentPlanetaryHour}
          />
        ))}
      </div>

      {/* Helper Text */}
      <div className="text-center text-sm text-gray-500 mt-6">
        <p>
          Click "+ Add Recipe" to add meals. Drag between slots to rearrange.
          Click 📋 to copy/move to multiple slots.
        </p>
      </div>

      {/* Copy/Move Meal Modal */}
      {copyMealModalState.sourceMeal && (
        <CopyMealModal
          isOpen={copyMealModalState.isOpen}
          onClose={() =>
            setCopyMealModalState({ isOpen: false, sourceMeal: null })
          }
          sourceMeal={copyMealModalState.sourceMeal}
          allMeals={currentMenu?.meals || []}
          onCopy={handleCopy}
          onMove={handleMove}
        />
      )}

      {/* Focused Day View Modal */}
      {focusedDayState.isOpen && currentMenu && (
        <FocusedDayView
          dayOfWeek={focusedDayState.dayOfWeek}
          date={weekDates[focusedDayState.dayOfWeek]}
          meals={mealsByDay[focusedDayState.dayOfWeek] || []}
          onClose={() =>
            setFocusedDayState({ isOpen: false, dayOfWeek: 0 as DayOfWeek })
          }
          onDayChange={handleFocusedDayChange}
        />
      )}
    </div>
  );
}
