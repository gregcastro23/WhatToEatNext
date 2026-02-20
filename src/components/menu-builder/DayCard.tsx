"use client";

/**
 * Day Card Component
 * Displays a single day in the weekly calendar with meal slots and nutrition summary
 *
 * @file src/components/menu-builder/DayCard.tsx
 * @created 2026-01-28
 */

import React, { useMemo } from "react";
import type {
  DayOfWeek,
  MealType,
  MealSlot as MealSlotType,
} from "@/types/menuPlanner";
import {
  getDayName,
  formatDateForDisplay,
  getPlanetaryDayCharacteristics,
} from "@/types/menuPlanner";
import type { Recipe } from "@/types/recipe";
import type { DragState } from "@/hooks/useDragAndDrop";
import PlanetaryHourIndicator from "./PlanetaryHourIndicator";

interface DayCardProps {
  dayOfWeek: DayOfWeek;
  date: Date;
  meals: MealSlotType[];
  onGenerateMeal: (mealType: MealType) => void;
  dragState: DragState;
  isValidDrop: (
    dayOfWeek: DayOfWeek,
    mealType: MealType,
    recipe: Recipe,
  ) => boolean;
  children?: React.ReactNode;
  /** Render prop for each meal slot */
  renderMealSlot: (mealSlot: MealSlotType) => React.ReactNode;
}

/**
 * Compact daily nutrition rings
 */
function DailyNutritionRings({ meals }: { meals: MealSlotType[] }) {
  const totals = useMemo(() => {
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;

    meals.forEach((m) => {
      if (!m.recipe?.nutrition) return;
      const n = m.recipe.nutrition;
      const servings = m.servings || 1;
      calories += (n.calories || 0) * servings;
      protein += (n.protein || 0) * servings;
      carbs += (n.carbs || 0) * servings;
      fat += (n.fat || 0) * servings;
    });

    return { calories, protein, carbs, fat };
  }, [meals]);

  // Daily targets (rough estimates)
  const targets = { calories: 2000, protein: 50, carbs: 250, fat: 65 };

  const rings = [
    {
      label: "Cal",
      value: totals.calories,
      target: targets.calories,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      label: "Pro",
      value: totals.protein,
      target: targets.protein,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      label: "Carb",
      value: totals.carbs,
      target: targets.carbs,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      label: "Fat",
      value: totals.fat,
      target: targets.fat,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
  ];

  if (totals.calories === 0) return null;

  return (
    <div className="flex gap-2 justify-center pt-2 border-t border-gray-100">
      {rings.map((ring) => {
        const pct = Math.min(100, Math.round((ring.value / ring.target) * 100));
        return (
          <div
            key={ring.label}
            className="flex flex-col items-center"
            title={`${ring.label}: ${Math.round(ring.value)} / ${ring.target} (${pct}%)`}
          >
            <div
              className={`w-8 h-8 rounded-full ${ring.bgColor} flex items-center justify-center relative`}
            >
              <span className={`text-[9px] font-bold ${ring.color}`}>
                {pct}%
              </span>
            </div>
            <span className="text-[8px] text-gray-500 mt-0.5">
              {ring.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Planet symbols mapping
 */
const PLANET_SYMBOLS: Record<string, string> = {
  Sun: "☉",
  Moon: "☽",
  Mars: "♂",
  Mercury: "☿",
  Jupiter: "♃",
  Venus: "♀",
  Saturn: "♄",
};

export default function DayCard({
  dayOfWeek,
  date,
  meals,
  onGenerateMeal,
  dragState,
  isValidDrop,
  renderMealSlot,
}: DayCardProps) {
  const characteristics = getPlanetaryDayCharacteristics(dayOfWeek);
  const isToday = new Date().toDateString() === new Date(date).toDateString();
  const filledMeals = meals.filter((m) => m.recipe);

  // Sort meals by type order
  const mealTypeOrder: MealType[] = ["breakfast", "lunch", "dinner", "snack"];
  const sortedMeals = mealTypeOrder
    .map((type) => meals.find((m) => m.mealType === type))
    .filter((m): m is MealSlotType => !!m);

  return (
    <div
      className={`
        bg-white rounded-xl shadow-sm border-2 overflow-hidden flex flex-col
        ${isToday ? "border-purple-400 shadow-lg" : "border-gray-200"}
        ${dragState.isDragging ? "transition-all duration-200" : ""}
      `}
    >
      {/* Day Header */}
      <div
        className={`
          px-3 py-2 border-b
          ${
            isToday
              ? "bg-gradient-to-r from-purple-100 to-pink-100 border-purple-200"
              : "bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200"
          }
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlanetaryHourIndicator date={date} position="tooltip" />
            <div>
              <h3 className="font-semibold text-sm text-gray-800">
                {getDayName(dayOfWeek)}
              </h3>
              <p className="text-[10px] text-gray-600">
                {formatDateForDisplay(date)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {isToday && (
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-purple-600 text-white rounded">
                Today
              </span>
            )}
            <span className="text-[10px] text-gray-500">
              {filledMeals.length}/3
            </span>
          </div>
        </div>
        <p className="text-[10px] text-gray-500 mt-1 italic line-clamp-1">
          {characteristics.mealGuidance}
        </p>
      </div>

      {/* Meal Slots */}
      <div className="flex-1 p-2 space-y-2">
        {sortedMeals.map((mealSlot) => (
          <div
            key={mealSlot.id}
            role="region"
            aria-label={`${mealSlot.mealType} slot`}
            tabIndex={0}
            className="focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1 rounded-lg"
          >
            {renderMealSlot(mealSlot)}
          </div>
        ))}
      </div>

      {/* Daily Nutrition Summary */}
      <div className="px-2 pb-2">
        <DailyNutritionRings meals={sortedMeals} />
      </div>
    </div>
  );
}
