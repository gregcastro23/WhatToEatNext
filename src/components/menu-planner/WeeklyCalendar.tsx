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
import { useMenuPlanner } from "@/contexts/MenuPlannerContext";
import type { MonicaOptimizedRecipe } from "@/data/unified/recipeBuilding";
import { useAstrologicalState } from "@/hooks/useAstrologicalState";
import { useNutritionTracking } from "@/hooks/useNutritionTracking";
import type {
  DayOfWeek,
  MealType,
  MealSlot as MealSlotType,
} from "@/types/menuPlanner";
import {
  getDayName,
  getShortDayName as _getShortDayName,
  getPlanetaryDayCharacteristics,
  PLANETARY_DAY_RULERS as _PLANETARY_DAY_RULERS,
  formatDateForDisplay,
} from "@/types/menuPlanner";
import type { DailyNutritionResult } from "@/types/nutrition";
import CopyMealModal from "./CopyMealModal";
import FocusedDayView from "./FocusedDayView";
import MealSlot from "./MealSlot";

/**
 * Per-day nutrition mini-bar
 * Compact calorie/macro summary for each day card
 */
function DayNutritionStrip({
  daily,
}: {
  daily: DailyNutritionResult | undefined;
}) {
  if (!daily || daily.meals.length === 0) {
    return (
      <div className="px-3 py-2 border-t border-gray-100 text-[10px] text-gray-400 italic">
        No meals — nutrition unlogged
      </div>
    );
  }

  const { totals, goals, compliance } = daily;
  const calPct = goals.calories > 0
    ? Math.min(150, Math.round(((totals.calories ?? 0) / goals.calories) * 100))
    : 0;
  const barColor =
    calPct < 60
      ? "bg-amber-400"
      : calPct > 120
        ? "bg-red-400"
        : "bg-emerald-400";

  return (
    <div className="px-3 py-2 border-t border-gray-100 bg-gray-50 text-[11px]">
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold text-gray-700">
          {Math.round(totals.calories ?? 0)} / {Math.round(goals.calories)} kcal
        </span>
        <span
          className={`font-medium ${compliance.overall >= 0.75
              ? "text-emerald-700"
              : compliance.overall >= 0.5
                ? "text-amber-700"
                : "text-red-700"
            }`}
        >
          {Math.round(compliance.overall * 100)}%
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all`}
          style={{ width: `${Math.min(100, calPct)}%` }}
        />
      </div>
      <div className="flex gap-2 mt-1 text-gray-600">
        <span>P {Math.round(totals.protein ?? 0)}g</span>
        <span>C {Math.round(totals.carbs ?? 0)}g</span>
        <span>F {Math.round(totals.fat ?? 0)}g</span>
      </div>
    </div>
  );
}

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
  onMealClick: _onMealClick,
  onCopyMealClick,
  onFocusDay,
  onToggleExpand,
  isExpanded,
  currentPlanetaryHour,
  dailyNutrition,
  isSelectedForHero = false,
}: {
  dayOfWeek: DayOfWeek;
  date: Date;
  meals: MealSlotType[];
  onMealClick?: (mealSlot: MealSlotType) => void;
  onCopyMealClick?: (mealSlot: MealSlotType) => void;
  onFocusDay?: () => void;
  onToggleExpand?: () => void;
  isExpanded?: boolean;
  currentPlanetaryHour?: string | null;
  dailyNutrition?: DailyNutritionResult;
  isSelectedForHero?: boolean;
}) {
  const {
    addMealToSlot,
    removeMealFromSlot,
    updateMealServings,
    addSauceToMeal,
    removeSauceFromMeal,
    updateSauceServings,
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
    Sun: "🝇",
    Moon: "🝑",
    Mars: "♂",
    Mercury: "🝉",
    Jupiter: "♃",
    Venus: "♀",
    Saturn: "♄",
  };

  const highlight = isToday || isSelectedForHero;

  return (
    <div
      className={`
        flex flex-col border-2 rounded-xl bg-white overflow-hidden transition-shadow
        ${highlight ? "border-purple-400 shadow-lg" : "border-gray-200"}
        ${isExpanded ? "ring-2 ring-purple-300" : ""}
      `}
    >
      {/* Day Header - clickable to expand */}
      <button
        type="button"
        onClick={onToggleExpand}
        className={`
          text-left p-3 border-b-2 border-gray-200 w-full hover:brightness-[0.98] transition-all
          ${highlight ? "bg-gradient-to-r from-purple-100 to-pink-100" : "bg-gray-50"}
        `}
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? "Collapse" : "Expand"} ${getDayName(dayOfWeek)}`}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-2xl">
              {planetSymbols[characteristics.planet]}
            </span>
            <div className="min-w-0">
              <h3 className="font-bold text-lg text-gray-800 truncate">
                {getDayName(dayOfWeek)}
              </h3>
              <p className="text-xs text-gray-600 truncate">
                {formatDateForDisplay(date)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {isToday && (
              <span className="px-2 py-1 text-xs font-semibold bg-purple-600 text-white rounded">
                Today
              </span>
            )}
            <span className="text-gray-500 text-xs select-none" aria-hidden>
              {isExpanded ? "▾" : "▸"}
            </span>
          </div>
        </div>
        <p className="text-[11px] text-gray-600 italic line-clamp-2">
          {characteristics.mealGuidance}
        </p>

        {/* Planetary Hour Indicator (only for today) */}
        {isToday && currentPlanetaryHour && (
          <div className="mt-2 flex items-center gap-2 bg-purple-100 rounded-lg px-3 py-1.5">
            <span className="text-purple-700 font-semibold text-[10px]">
              ⏰ Hour:
            </span>
            <span className="text-purple-900 font-bold text-xs truncate">
              {currentPlanetaryHour}
            </span>
          </div>
        )}
      </button>

      {/* Quick Actions - separate row, non-clickable header area */}
      <div className="flex gap-1 px-2 py-1.5 bg-gray-50/50 border-b border-gray-100">
        <button
          onClick={(e) => { e.stopPropagation(); onFocusDay?.(); }}
          className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors font-medium flex-1"
          title={`Focus on ${getDayName(dayOfWeek)} with suggestions`}
        >
          🔍 Focus
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            void generateMealsForDay(dayOfWeek);
          }}
          className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors font-medium flex-1"
          title={`Recommend meals for ${getDayName(dayOfWeek)} using ${characteristics.planet} energy`}
        >
          ✨ Rec
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            void clearDay(dayOfWeek);
          }}
          className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
          title="Clear all meals for this day"
        >
          🗑
        </button>
      </div>

      {/* Meal Slots */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto">
        {sortedMeals.map((mealSlot) => (
          <MealSlot
            key={mealSlot.id}
            mealSlot={mealSlot}
            onAddRecipe={(recipe: MonicaOptimizedRecipe) => {
              void addMealToSlot(dayOfWeek, mealSlot.mealType, recipe);
            }}
            onRemoveRecipe={() => {
              void removeMealFromSlot(mealSlot.id);
            }}
            onUpdateServings={(servings: number) => {
              void updateMealServings(mealSlot.id, servings);
            }}
            onMoveMeal={(sourceSlotId: string) => {
              void moveMeal(sourceSlotId, mealSlot.id);
            }}
            onSwapMeals={(sourceSlotId: string) => {
              void swapMeals(sourceSlotId, mealSlot.id);
            }}
            onCopyMeal={() => onCopyMealClick?.(mealSlot)}
            onGenerateMeal={() => {
              void generateMealsForDay(dayOfWeek, { mealTypes: [mealSlot.mealType] });
            }}
            onAddSauce={(sauceId: string, servings?: number) => {
              void addSauceToMeal(mealSlot.id, sauceId, servings);
            }}
            onRemoveSauce={() => {
              void removeSauceFromMeal(mealSlot.id);
            }}
            onUpdateSauceServings={(servings: number) => {
              void updateSauceServings(mealSlot.id, servings);
            }}
          />
        ))}
      </div>

      {/* Per-day nutrition summary */}
      <DayNutritionStrip daily={dailyNutrition} />
    </div>
  );
}

/**
 * Today Hero Card
 * Prominent card highlighting today's meals — always visible at top of calendar.
 */
function TodayHeroCard({
  dayOfWeek,
  date,
  meals,
  onCopyMealClick,
  onFocusDay,
  currentPlanetaryHour,
  dailyNutrition,
}: {
  dayOfWeek: DayOfWeek;
  date: Date;
  meals: MealSlotType[];
  onCopyMealClick?: (mealSlot: MealSlotType) => void;
  onFocusDay?: () => void;
  currentPlanetaryHour?: string | null;
  dailyNutrition?: DailyNutritionResult;
}) {
  const {
    addMealToSlot,
    removeMealFromSlot,
    updateMealServings,
    addSauceToMeal,
    removeSauceFromMeal,
    updateSauceServings,
    clearDay,
    moveMeal,
    swapMeals,
    generateMealsForDay,
  } = useMenuPlanner();

  const characteristics = getPlanetaryDayCharacteristics(dayOfWeek);
  const mealTypes: MealType[] = ["breakfast", "lunch", "dinner", "snack"];
  const sortedMeals = mealTypes.map(
    (type) => meals.find((m) => m.mealType === type)!,
  );
  const plannedCount = meals.filter((m) => m.recipe).length;

  const planetSymbols: Record<string, string> = {
    Sun: "🝇",
    Moon: "🝑",
    Mars: "♂",
    Mercury: "🝉",
    Jupiter: "♃",
    Venus: "♀",
    Saturn: "♄",
  };

  return (
    <div className="rounded-2xl border-2 border-purple-400 bg-gradient-to-br from-purple-50 via-white to-pink-50 shadow-xl overflow-hidden">
      {/* Hero Header */}
      <div className="p-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{planetSymbols[characteristics.planet]}</span>
            <div>
              <div className="text-[11px] uppercase tracking-widest opacity-90">
                Today · {characteristics.planet} day
              </div>
              <h2 className="text-2xl font-bold">{getDayName(dayOfWeek)}</h2>
              <p className="text-sm opacity-90">{formatDateForDisplay(date)}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 text-right">
            {currentPlanetaryHour && (
              <div className="text-xs bg-white/20 rounded-full px-3 py-1">
                ⏰ {currentPlanetaryHour} hour
              </div>
            )}
            <div className="text-xs opacity-90">
              {plannedCount}/4 meals planned
            </div>
          </div>
        </div>
        <p className="text-sm mt-3 italic opacity-95">
          {characteristics.mealGuidance}
        </p>
      </div>

      {/* Nutrition row */}
      {dailyNutrition && dailyNutrition.meals.length > 0 && (
        <div className="px-5 py-3 bg-white border-b border-purple-100 grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
          <div>
            <div className="text-[10px] uppercase text-gray-500 tracking-wide">
              Calories
            </div>
            <div className="font-bold text-gray-900">
              {Math.round(dailyNutrition.totals.calories ?? 0)}
              <span className="text-xs font-normal text-gray-500">
                {" "}/ {Math.round(dailyNutrition.goals.calories)}
              </span>
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase text-gray-500 tracking-wide">
              Protein
            </div>
            <div className="font-bold text-gray-900">
              {Math.round(dailyNutrition.totals.protein ?? 0)}g
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase text-gray-500 tracking-wide">
              Carbs
            </div>
            <div className="font-bold text-gray-900">
              {Math.round(dailyNutrition.totals.carbs ?? 0)}g
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase text-gray-500 tracking-wide">
              Fat
            </div>
            <div className="font-bold text-gray-900">
              {Math.round(dailyNutrition.totals.fat ?? 0)}g
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase text-gray-500 tracking-wide">
              Compliance
            </div>
            <div
              className={`font-bold ${dailyNutrition.compliance.overall >= 0.75
                  ? "text-emerald-700"
                  : dailyNutrition.compliance.overall >= 0.5
                    ? "text-amber-700"
                    : "text-red-700"
                }`}
            >
              {Math.round(dailyNutrition.compliance.overall * 100)}%
            </div>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="flex gap-2 px-5 py-3 bg-white border-b border-purple-100 flex-wrap">
        <button
          onClick={onFocusDay}
          className="text-sm px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors font-medium"
        >
          🔍 Focus mode
        </button>
        <button
          onClick={() => { void generateMealsForDay(dayOfWeek); }}
          className="text-sm px-3 py-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors font-medium"
        >
          ✨ Auto-fill day
        </button>
        <button
          onClick={() => { void clearDay(dayOfWeek); }}
          className="text-sm px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
        >
          🗑 Clear
        </button>
      </div>

      {/* Meal slots — horizontal on desktop, stacked on mobile */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {sortedMeals.map((mealSlot) => (
          <MealSlot
            key={mealSlot.id}
            mealSlot={mealSlot}
            onAddRecipe={(recipe: MonicaOptimizedRecipe) => {
              void addMealToSlot(dayOfWeek, mealSlot.mealType, recipe);
            }}
            onRemoveRecipe={() => {
              void removeMealFromSlot(mealSlot.id);
            }}
            onUpdateServings={(servings: number) => {
              void updateMealServings(mealSlot.id, servings);
            }}
            onMoveMeal={(sourceSlotId: string) => {
              void moveMeal(sourceSlotId, mealSlot.id);
            }}
            onSwapMeals={(sourceSlotId: string) => {
              void swapMeals(sourceSlotId, mealSlot.id);
            }}
            onCopyMeal={() => onCopyMealClick?.(mealSlot)}
            onGenerateMeal={() => {
              void generateMealsForDay(dayOfWeek, { mealTypes: [mealSlot.mealType] });
            }}
            onAddSauce={(sauceId: string, servings?: number) => {
              void addSauceToMeal(mealSlot.id, sauceId, servings);
            }}
            onRemoveSauce={() => {
              void removeSauceFromMeal(mealSlot.id);
            }}
            onUpdateSauceServings={(servings: number) => {
              void updateSauceServings(mealSlot.id, servings);
            }}
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
    generationPreferences,
  } = useMenuPlanner();
  const { currentPlanetaryHour } = useAstrologicalState();
  const weeklyNutrition = useNutritionTracking(
    currentMenu,
    generationPreferences?.nutritionalTargets ?? null,
  );
  const [copyMealModalState, setCopyMealModalState] = useState<{
    isOpen: boolean;
    sourceMeal: MealSlotType | null;
  }>({
    isOpen: false,
    sourceMeal: null,
  });

  // Inline expanded day (grows in place)
  const [expandedDay, setExpandedDay] = useState<DayOfWeek | null>(null);

  // Focused day view state (modal — kept for advanced users)
  const [focusedDayState, setFocusedDayState] = useState<{
    isOpen: boolean;
    dayOfWeek: DayOfWeek;
  }>({
    isOpen: false,
    dayOfWeek: 0 as DayOfWeek,
  });

  const toggleExpandDay = (day: DayOfWeek) => {
    setExpandedDay((prev) => (prev === day ? null : day));
  };

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
    void copyMealToSlots(copyMealModalState.sourceMeal.id, targetSlotIds, servings);
    setCopyMealModalState({ isOpen: false, sourceMeal: null });
  };

  // Handle move operation
  const handleMove = (targetSlotIds: string[], servings?: number) => {
    if (!copyMealModalState.sourceMeal) return;
    void moveMealToSlots(copyMealModalState.sourceMeal.id, targetSlotIds, servings);
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

  // Determine whether today falls within the currently-displayed week.
  // If yes, surface the Today hero card and highlight that column.
  const todayDateStr = new Date().toDateString();
  const todayIndex = weekDates.findIndex(
    (d) => d.toDateString() === todayDateStr,
  );
  const todayDayOfWeek: DayOfWeek | null =
    todayIndex >= 0 ? (todayIndex as DayOfWeek) : null;

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
                  Click &quot;Generate&quot; on any day for planetary-aligned suggestions
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
                    className={`w-2 h-8 rounded ${i < totalMeals ? "bg-purple-500" : "bg-gray-200"
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

      {/* Today Hero Card — always on top when today is within the viewed week */}
      {todayDayOfWeek !== null && (
        <TodayHeroCard
          dayOfWeek={todayDayOfWeek}
          date={weekDates[todayDayOfWeek]}
          meals={mealsByDay[todayDayOfWeek] || []}
          onCopyMealClick={handleCopyMealClick}
          onFocusDay={() => handleOpenFocusedDay(todayDayOfWeek)}
          currentPlanetaryHour={currentPlanetaryHour}
          dailyNutrition={weeklyNutrition?.days?.[todayDayOfWeek]}
        />
      )}

      {/* Calendar Grid - Desktop (7 columns, clickable to expand) */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-7 gap-3">
          {([0, 1, 2, 3, 4, 5, 6] as DayOfWeek[]).map((day) => (
            <DayColumn
              key={day}
              dayOfWeek={day}
              date={weekDates[day]}
              meals={mealsByDay[day] || []}
              onMealClick={onMealClick}
              onCopyMealClick={handleCopyMealClick}
              onFocusDay={() => handleOpenFocusedDay(day)}
              onToggleExpand={() => toggleExpandDay(day)}
              isExpanded={expandedDay === day}
              currentPlanetaryHour={currentPlanetaryHour}
              dailyNutrition={weeklyNutrition?.days?.[day]}
              isSelectedForHero={day === todayDayOfWeek}
            />
          ))}
        </div>
        {/* Inline expanded-day panel appears below the grid */}
        {expandedDay !== null && expandedDay !== todayDayOfWeek && (
          <div className="mt-4">
            <TodayHeroCard
              dayOfWeek={expandedDay}
              date={weekDates[expandedDay]}
              meals={mealsByDay[expandedDay] || []}
              onCopyMealClick={handleCopyMealClick}
              onFocusDay={() => handleOpenFocusedDay(expandedDay)}
              currentPlanetaryHour={null}
              dailyNutrition={weeklyNutrition?.days?.[expandedDay]}
            />
          </div>
        )}
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
              onToggleExpand={() => toggleExpandDay(day)}
              isExpanded={expandedDay === day}
              currentPlanetaryHour={currentPlanetaryHour}
              dailyNutrition={weeklyNutrition?.days?.[day]}
              isSelectedForHero={day === todayDayOfWeek}
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
              onToggleExpand={() => toggleExpandDay(day)}
              isExpanded={expandedDay === day}
              currentPlanetaryHour={currentPlanetaryHour}
              dailyNutrition={weeklyNutrition?.days?.[day]}
              isSelectedForHero={day === todayDayOfWeek}
            />
          ))}
        </div>
        {expandedDay !== null && expandedDay !== todayDayOfWeek && (
          <div className="mt-4">
            <TodayHeroCard
              dayOfWeek={expandedDay}
              date={weekDates[expandedDay]}
              meals={mealsByDay[expandedDay] || []}
              onCopyMealClick={handleCopyMealClick}
              onFocusDay={() => handleOpenFocusedDay(expandedDay)}
              currentPlanetaryHour={null}
              dailyNutrition={weeklyNutrition?.days?.[expandedDay]}
            />
          </div>
        )}
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
            onToggleExpand={() => toggleExpandDay(day)}
            isExpanded={expandedDay === day}
            currentPlanetaryHour={currentPlanetaryHour}
            dailyNutrition={weeklyNutrition?.days?.[day]}
            isSelectedForHero={day === todayDayOfWeek}
          />
        ))}
      </div>

      {/* Helper Text */}
      <div className="text-center text-sm text-gray-500 mt-6">
        <p>
          Click a day header to expand it inline. Click &quot;+ Add Recipe&quot;
          to add meals. Click 📋 to copy/move to multiple slots.
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
