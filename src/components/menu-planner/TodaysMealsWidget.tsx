"use client";

/**
 * TodaysMealsWidget
 * Interactive widget showing today's meal plan with the current meal time highlighted.
 * Users can click meal rows to add recipes directly, similar to clicking on the calendar.
 *
 * @file src/components/menu-planner/TodaysMealsWidget.tsx
 */

import React, { useMemo, useState } from "react";
import type { MonicaOptimizedRecipe } from "@/data/unified/recipeBuilding";
import type { WeeklyMenu, MealType, DayOfWeek } from "@/types/menuPlanner";
import { PLANETARY_DAY_RULERS, getDayName } from "@/types/menuPlanner";
import type { Recipe } from "@/types/recipe";
import RecipeSelector from "./RecipeSelector";

interface TodaysMealsWidgetProps {
  weekPlan: WeeklyMenu | null;
  onScrollToDay?: (day: DayOfWeek) => void;
  onAddRecipe?: (dayOfWeek: DayOfWeek, mealType: MealType, recipe: MonicaOptimizedRecipe) => void;
  onGenerateMeal?: (dayOfWeek: DayOfWeek, mealType: MealType) => void;
}

interface MealWindow {
  type: MealType;
  label: string;
  icon: string;
  startHour: number; // 24h
  endHour: number;
  timeRange: string;
  color: string;
  activeColor: string;
  activeBg: string;
  activeBorder: string;
}

const MEAL_WINDOWS: MealWindow[] = [
  {
    type: "breakfast",
    label: "Breakfast",
    icon: "🌅",
    startHour: 5,
    endHour: 11,
    timeRange: "5 – 11 AM",
    color: "text-amber-600",
    activeColor: "text-amber-700",
    activeBg: "bg-amber-50",
    activeBorder: "border-amber-400",
  },
  {
    type: "lunch",
    label: "Lunch",
    icon: "☀️",
    startHour: 11,
    endHour: 15,
    timeRange: "11 AM – 3 PM",
    color: "text-orange-600",
    activeColor: "text-orange-700",
    activeBg: "bg-orange-50",
    activeBorder: "border-orange-400",
  },
  {
    type: "snack",
    label: "Snack",
    icon: "🍎",
    startHour: 15,
    endHour: 18,
    timeRange: "3 – 6 PM",
    color: "text-green-600",
    activeColor: "text-green-700",
    activeBg: "bg-green-50",
    activeBorder: "border-green-400",
  },
  {
    type: "dinner",
    label: "Dinner",
    icon: "🌙",
    startHour: 18,
    endHour: 22,
    timeRange: "6 – 10 PM",
    color: "text-purple-600",
    activeColor: "text-purple-700",
    activeBg: "bg-purple-50",
    activeBorder: "border-purple-400",
  },
];

/** Returns the MealType whose window contains the current hour */
function getCurrentMealWindow(hour: number): MealType | null {
  for (const w of MEAL_WINDOWS) {
    if (hour >= w.startHour && hour < w.endHour) return w.type;
  }
  return null;
}

/** Returns the next upcoming MealWindow from the current hour */
function getNextMealWindow(hour: number): MealWindow | null {
  return MEAL_WINDOWS.find((w) => w.startHour > hour) ?? null;
}

export default function TodaysMealsWidget({
  weekPlan,
  onScrollToDay,
  onAddRecipe,
  onGenerateMeal,
}: TodaysMealsWidgetProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [recipeSelectorMealType, setRecipeSelectorMealType] = useState<MealType | null>(null);

  const now = new Date();
  const todayDow = now.getDay() as DayOfWeek;
  const currentHour = now.getHours();
  const currentMealType = getCurrentMealWindow(currentHour);
  const nextMeal = !currentMealType ? getNextMealWindow(currentHour) : null;

  const planetaryRuler = PLANETARY_DAY_RULERS[todayDow];

  // Get the planetary snapshot for today's meals (for RecipeSelector filters)
  const todayMealSlots = useMemo(() => {
    if (!weekPlan) return [];
    return weekPlan.meals.filter((m) => m.dayOfWeek === todayDow);
  }, [weekPlan, todayDow]);

  // Today's assigned meals
  const todaysMeals = useMemo(() => {
    if (!weekPlan) return {} as Record<MealType, string | null>;
    const result: Record<MealType, string | null> = {
      breakfast: null,
      lunch: null,
      snack: null,
      dinner: null,
    };
    weekPlan.meals
      .filter((m) => m.dayOfWeek === todayDow)
      .forEach((m) => {
        if (m.recipe) {
          result[m.mealType] = m.recipe.name ?? null;
        }
      });
    return result;
  }, [weekPlan, todayDow]);

  const plannedCount = Object.values(todaysMeals).filter(Boolean).length;

  const dayLabel = getDayName(todayDow);
  const dateLabel = now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const planetEmoji: Record<string, string> = {
    Sun: "☀️",
    Moon: "🌙",
    Mars: "🔴",
    Mercury: "🝉",
    Jupiter: "♃",
    Venus: "💜",
    Saturn: "♄",
  };

  // Handle clicking a meal row to open recipe selector
  const handleMealClick = (mealType: MealType) => {
    if (todaysMeals[mealType]) {
      // Already has a recipe - scroll to day on calendar for editing
      if (onScrollToDay) onScrollToDay(todayDow);
    } else {
      // No recipe - open recipe selector
      setRecipeSelectorMealType(mealType);
    }
  };

  // Handle recipe selection from the modal
  const handleRecipeSelect = (recipe: Recipe) => {
    if (recipeSelectorMealType && onAddRecipe) {
      onAddRecipe(todayDow, recipeSelectorMealType, recipe as MonicaOptimizedRecipe);
    }
    setRecipeSelectorMealType(null);
  };

  // Get planetary snapshot for the current meal type's selector
  const currentSlotSnapshot = useMemo(() => {
    if (!recipeSelectorMealType) return undefined;
    const slot = todayMealSlots.find((s) => s.mealType === recipeSelectorMealType);
    return slot?.planetarySnapshot;
  }, [recipeSelectorMealType, todayMealSlots]);

  return (
    <>
      <div
        className="relative rounded-2xl shadow-md border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-purple-50 transition-all duration-300"
        role="region"
        aria-label="Today's Meals"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">
                Today&apos;s Meals
              </span>
              <span className="text-sm font-bold text-gray-800 leading-tight">
                {dayLabel}, {dateLabel}
              </span>
            </div>
            {/* Planetary ruler badge */}
            <span className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium">
              {planetEmoji[planetaryRuler] ?? "⭐"} {planetaryRuler} Day
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Progress pill */}
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                plannedCount === 4
                  ? "bg-green-100 text-green-700"
                  : plannedCount >= 2
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
              }`}
            >
              {plannedCount}/4 planned
            </span>
            <span className="text-gray-400 text-xs">
              {isCollapsed ? "▼" : "▲"}
            </span>
          </div>
        </div>

        {/* Meal rows */}
        {!isCollapsed && (
          <div className="px-4 pb-4 space-y-2">
            {MEAL_WINDOWS.map((meal) => {
              const isActive = currentMealType === meal.type;
              const isNext = !currentMealType && nextMeal?.type === meal.type;
              const isPast =
                !isActive && meal.endHour <= currentHour && currentHour < 22;
              const recipeName = todaysMeals[meal.type];
              const isEmpty = !recipeName;

              return (
                <div
                  key={meal.type}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMealClick(meal.type);
                  }}
                  className={`
                    flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-200 cursor-pointer
                    ${
                      isActive
                        ? `${meal.activeBg} ${meal.activeBorder} border-2 shadow-sm`
                        : isNext
                          ? "bg-gray-50 border-dashed border-gray-300 border"
                          : isPast
                            ? "bg-gray-50 border-gray-100 border opacity-60"
                            : "bg-white border-gray-100 border"
                    }
                    ${isEmpty ? "hover:border-indigo-300 hover:shadow-sm" : "hover:shadow-sm"}
                  `}
                >
                  {/* Icon + label */}
                  <div className="flex items-center gap-2 w-24 flex-shrink-0">
                    <span
                      className={`text-lg ${isActive ? "" : "opacity-70"}`}
                      aria-hidden
                    >
                      {meal.icon}
                    </span>
                    <div>
                      <p
                        className={`text-xs font-bold leading-tight ${
                          isActive ? meal.activeColor : "text-gray-700"
                        }`}
                      >
                        {meal.label}
                      </p>
                      <p className="text-[10px] text-gray-400 leading-none">
                        {meal.timeRange}
                      </p>
                    </div>
                  </div>

                  {/* Recipe name or CTA */}
                  <div className="flex-1 min-w-0">
                    {recipeName ? (
                      <p
                        className={`text-xs font-semibold truncate ${
                          isActive ? meal.activeColor : "text-gray-600"
                        }`}
                        title={recipeName}
                      >
                        {recipeName}
                      </p>
                    ) : (
                      <span
                        className={`text-xs font-medium transition-colors ${
                          isActive
                            ? `${meal.activeColor} underline underline-offset-2`
                            : "text-gray-400 hover:text-indigo-500"
                        }`}
                      >
                        {isActive ? "Plan now →" : "Not planned"}
                      </span>
                    )}
                  </div>

                  {/* Action buttons for empty slots */}
                  {isEmpty && onGenerateMeal && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onGenerateMeal(todayDow, meal.type);
                      }}
                      className="flex-shrink-0 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors"
                      title={`Auto-generate ${meal.label}`}
                    >
                      ✨ Generate
                    </button>
                  )}

                  {/* Status indicator */}
                  <div className="flex-shrink-0">
                    {isActive && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-current text-[10px] font-bold animate-pulse">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${meal.activeBorder.replace("border-", "bg-")}`}
                        />
                        <span className={meal.activeColor}>Now</span>
                      </span>
                    )}
                    {isNext && (
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-semibold">
                        Up next
                      </span>
                    )}
                    {recipeName && !isActive && !isNext && (
                      <span className="text-green-500 text-sm">✓</span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Nudge banner if no meals planned today */}
            {plannedCount === 0 && (
              <div
                className="mt-3 p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-center cursor-pointer hover:from-indigo-600 hover:to-purple-700 transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  // Open recipe selector for the current or next meal window
                  const targetMeal = currentMealType || nextMeal?.type || "breakfast";
                  handleMealClick(targetMeal);
                }}
              >
                <p className="text-xs font-semibold mb-1">
                  No meals planned for today yet!
                </p>
                <p className="text-[10px] opacity-80">
                  Tap to start planning your {dayLabel} meals
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recipe Selector Modal - opens when clicking an empty meal slot */}
      <RecipeSelector
        isOpen={!!recipeSelectorMealType}
        onClose={() => setRecipeSelectorMealType(null)}
        onSelectRecipe={handleRecipeSelect}
        filters={{
          mealType: recipeSelectorMealType || undefined,
          dayOfWeek: todayDow,
          planetarySnapshot: currentSlotSnapshot,
        }}
      />
    </>
  );
}
