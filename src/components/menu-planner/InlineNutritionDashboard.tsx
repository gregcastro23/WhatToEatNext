"use client";

/**
 * InlineNutritionDashboard Component
 * Real-time inline nutrition tracking for the menu planner
 *
 * Displays compact nutrition progress bars and elemental balance
 * directly within the menu planner interface.
 *
 * @file src/components/menu-planner/InlineNutritionDashboard.tsx
 * @created 2026-01-29
 */

import React, { useMemo } from "react";
import { useMenuPlanner } from "@/contexts/MenuPlannerContext";
import type { DayOfWeek, NutritionalGoals } from "@/types/menuPlanner";

// ============================================================================
// Types
// ============================================================================

interface InlineNutritionDashboardProps {
  goals?: ExtendedNutritionalGoals;
  compact?: boolean;
  showElemental?: boolean;
  className?: string;
}

interface NutritionProgress {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

interface ElementalBalance {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
}

// ============================================================================
// Extended Goals Interface (internal)
// ============================================================================

interface ExtendedNutritionalGoals extends NutritionalGoals {
  weeklyCalories?: number;
  weeklyProtein?: number;
  weeklyCarbs?: number;
  weeklyFat?: number;
  weeklyFiber?: number;
}

// ============================================================================
// Default Goals
// ============================================================================

const DEFAULT_GOALS: ExtendedNutritionalGoals = {
  dailyCalories: 2000,
  dailyProtein: 50,
  dailyCarbs: 250,
  dailyFat: 65,
  dailyFiber: 28,
  weeklyCalories: 14000,
  weeklyProtein: 350,
  weeklyCarbs: 1750,
  weeklyFat: 455,
  weeklyFiber: 196,
};

// ============================================================================
// Progress Bar Component
// ============================================================================

interface ProgressBarProps {
  label: string;
  current: number;
  goal: number;
  unit?: string;
  color: string;
  showValue?: boolean;
}

function ProgressBar({
  label,
  current,
  goal,
  unit = "",
  color,
  showValue = true,
}: ProgressBarProps) {
  const percentage = Math.min(100, (current / goal) * 100);
  const isOver = current > goal;

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-xs">
        <span className="font-medium text-gray-600">{label}</span>
        {showValue && (
          <span
            className={`${isOver ? "text-orange-600 font-semibold" : "text-gray-500"}`}
          >
            {Math.round(current)}
            {unit} / {goal}
            {unit}
          </span>
        )}
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            backgroundColor: isOver ? "#f97316" : color,
          }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Elemental Balance Indicator
// ============================================================================

interface ElementalIndicatorProps {
  balance: ElementalBalance;
}

function ElementalIndicator({ balance }: ElementalIndicatorProps) {
  const elements = [
    { name: "Fire", value: balance.Fire, color: "#ef4444", emoji: "🔥" },
    { name: "Water", value: balance.Water, color: "#3b82f6", emoji: "💧" },
    { name: "Earth", value: balance.Earth, color: "#84cc16", emoji: "🌿" },
    { name: "Air", value: balance.Air, color: "#a855f7", emoji: "💨" },
  ];

  const total = elements.reduce((sum, el) => sum + el.value, 0);

  return (
    <div className="flex items-center gap-1">
      {elements.map((element) => {
        const percentage = total > 0 ? (element.value / total) * 100 : 25;
        return (
          <div
            key={element.name}
            className="flex items-center gap-0.5"
            title={`${element.name}: ${percentage.toFixed(1)}%`}
          >
            <span className="text-xs">{element.emoji}</span>
            <div
              className="h-3 rounded-sm transition-all duration-300"
              style={{
                width: `${Math.max(8, percentage * 0.6)}px`,
                backgroundColor: element.color,
                opacity: 0.7 + (percentage / 100) * 0.3,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// Nutritional Insights
// ============================================================================

interface InsightsProps {
  progress: NutritionProgress;
  goals: ExtendedNutritionalGoals;
  dayCount: number;
}

function NutritionalInsights({ progress, goals, dayCount }: InsightsProps) {
  const insights: string[] = [];

  const weeklyCalories =
    goals.weeklyCalories ?? (goals.dailyCalories ?? 2000) * 7;
  const weeklyProtein = goals.weeklyProtein ?? (goals.dailyProtein ?? 50) * 7;
  const weeklyFiber = goals.weeklyFiber ?? (goals.dailyFiber ?? 28) * 7;

  const expectedCalories = (weeklyCalories / 7) * dayCount;
  const expectedProtein = (weeklyProtein / 7) * dayCount;

  if (progress.calories < expectedCalories * 0.8) {
    insights.push("Below calorie target - consider adding more meals");
  } else if (progress.calories > expectedCalories * 1.1) {
    insights.push("Above calorie target - review portion sizes");
  }

  if (progress.protein < expectedProtein * 0.7) {
    insights.push("Low protein - add lean meats, fish, or legumes");
  }

  if (progress.fiber < (weeklyFiber / 7) * dayCount * 0.6) {
    insights.push("Increase fiber with vegetables and whole grains");
  }

  if (insights.length === 0) {
    insights.push("Great balance! Keep it up");
  }

  return (
    <div className="text-xs text-gray-600 mt-2 space-y-1">
      {insights.slice(0, 2).map((insight, idx) => (
        <div key={idx} className="flex items-center gap-1">
          <span className="text-purple-500">&#8226;</span>
          <span>{insight}</span>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function InlineNutritionDashboard({
  goals = DEFAULT_GOALS,
  compact = false,
  showElemental = true,
  className = "",
}: InlineNutritionDashboardProps) {
  const { currentMenu } = useMenuPlanner();

  // Calculate nutrition totals from current menu
  const { nutrition, elemental, dayCount } = useMemo(() => {
    if (!currentMenu) {
      return {
        nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
        elemental: { Fire: 0, Water: 0, Earth: 0, Air: 0 },
        dayCount: 0,
      };
    }

    const totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
    const elementalTotals = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
    const daysWithMeals = new Set<DayOfWeek>();

    for (const meal of currentMenu.meals) {
      if (meal.recipe) {
        daysWithMeals.add(meal.dayOfWeek);
        const servings = meal.servings || 1;

        // Add nutrition
        if (meal.recipe.nutrition) {
          totals.calories += (meal.recipe.nutrition.calories || 0) * servings;
          totals.protein += (meal.recipe.nutrition.protein || 0) * servings;
          totals.carbs += (meal.recipe.nutrition.carbs || 0) * servings;
          totals.fat += (meal.recipe.nutrition.fat || 0) * servings;
          totals.fiber += (meal.recipe.nutrition.fiber || 0) * servings;
        }

        // Add elemental properties
        if (meal.recipe.elementalProperties) {
          elementalTotals.Fire +=
            (meal.recipe.elementalProperties.Fire || 0) * servings;
          elementalTotals.Water +=
            (meal.recipe.elementalProperties.Water || 0) * servings;
          elementalTotals.Earth +=
            (meal.recipe.elementalProperties.Earth || 0) * servings;
          elementalTotals.Air +=
            (meal.recipe.elementalProperties.Air || 0) * servings;
        }
      }
    }

    return {
      nutrition: totals,
      elemental: elementalTotals,
      dayCount: daysWithMeals.size,
    };
  }, [currentMenu]);

  // Calculate weekly goals from daily (with fallbacks)
  const weeklyGoals = useMemo(
    () => ({
      calories: goals.weeklyCalories ?? (goals.dailyCalories ?? 2000) * 7,
      protein: goals.weeklyProtein ?? (goals.dailyProtein ?? 50) * 7,
      carbs: goals.weeklyCarbs ?? (goals.dailyCarbs ?? 250) * 7,
      fat: goals.weeklyFat ?? (goals.dailyFat ?? 65) * 7,
      fiber: goals.weeklyFiber ?? (goals.dailyFiber ?? 28) * 7,
    }),
    [goals],
  );

  // Calculate completion percentage
  const completion = useMemo(() => {
    const caloriePercent = (nutrition.calories / weeklyGoals.calories) * 100;
    return Math.min(100, Math.round(caloriePercent));
  }, [nutrition, weeklyGoals]);

  if (compact) {
    return (
      <div
        className={`bg-white rounded-lg p-3 shadow-sm border border-gray-200 ${className}`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Weekly Progress
          </span>
          <span className="text-xs text-purple-600 font-semibold">
            {completion}%
          </span>
        </div>

        {/* Compact progress indicator */}
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${completion}%` }}
          />
        </div>

        {/* Compact stats */}
        <div className="flex justify-between text-xs text-gray-500">
          <span>
            {Math.round(nutrition.calories)} / {weeklyGoals.calories} kcal
          </span>
          <span>{nutrition.protein}g protein</span>
        </div>

        {/* Elemental balance (if enabled) */}
        {showElemental && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <ElementalIndicator balance={elemental} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-xl p-4 shadow-md border border-gray-200 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-800">Weekly Nutrition</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            {dayCount}/7 days planned
          </span>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              completion >= 80
                ? "bg-green-100 text-green-700"
                : completion >= 50
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-gray-100 text-gray-600"
            }`}
          >
            {completion}%
          </span>
        </div>
      </div>

      {/* Main progress bars */}
      <div className="space-y-3">
        <ProgressBar
          label="Calories"
          current={nutrition.calories}
          goal={weeklyGoals.calories}
          unit="kcal"
          color="#8b5cf6"
        />
        <ProgressBar
          label="Protein"
          current={nutrition.protein}
          goal={weeklyGoals.protein}
          unit="g"
          color="#ef4444"
        />
        <ProgressBar
          label="Carbs"
          current={nutrition.carbs}
          goal={weeklyGoals.carbs}
          unit="g"
          color="#f59e0b"
        />
        <ProgressBar
          label="Fat"
          current={nutrition.fat}
          goal={weeklyGoals.fat}
          unit="g"
          color="#10b981"
        />
        <ProgressBar
          label="Fiber"
          current={nutrition.fiber}
          goal={weeklyGoals.fiber}
          unit="g"
          color="#6366f1"
        />
      </div>

      {/* Elemental balance */}
      {showElemental && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600">
              Elemental Balance
            </span>
          </div>
          <ElementalIndicator balance={elemental} />
        </div>
      )}

      {/* Insights */}
      <NutritionalInsights
        progress={nutrition}
        goals={goals}
        dayCount={dayCount}
      />
    </div>
  );
}

// ============================================================================
// Daily Summary Component (for use in day columns)
// ============================================================================

interface DailyNutritionSummaryProps {
  dayOfWeek: DayOfWeek;
  className?: string;
}

export function DailyNutritionSummary({
  dayOfWeek,
  className = "",
}: DailyNutritionSummaryProps) {
  const { currentMenu } = useMenuPlanner();

  const dayNutrition = useMemo(() => {
    if (!currentMenu) {
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }

    const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };

    for (const meal of currentMenu.meals) {
      if (meal.dayOfWeek === dayOfWeek && meal.recipe?.nutrition) {
        const servings = meal.servings || 1;
        totals.calories += (meal.recipe.nutrition.calories || 0) * servings;
        totals.protein += (meal.recipe.nutrition.protein || 0) * servings;
        totals.carbs += (meal.recipe.nutrition.carbs || 0) * servings;
        totals.fat += (meal.recipe.nutrition.fat || 0) * servings;
      }
    }

    return totals;
  }, [currentMenu, dayOfWeek]);

  if (dayNutrition.calories === 0) {
    return null;
  }

  return (
    <div
      className={`text-xs text-gray-500 px-2 py-1 bg-gray-50 rounded ${className}`}
    >
      <div className="flex items-center gap-2 justify-center">
        <span title="Calories">{Math.round(dayNutrition.calories)} kcal</span>
        <span className="text-gray-300">|</span>
        <span title="Protein">{Math.round(dayNutrition.protein)}g P</span>
      </div>
    </div>
  );
}

// ============================================================================
// Macro Ring Component (circular progress)
// ============================================================================

interface MacroRingProps {
  protein: number;
  carbs: number;
  fat: number;
  size?: number;
}

export function MacroRing({ protein, carbs, fat, size = 60 }: MacroRingProps) {
  const total = protein + carbs + fat;
  if (total === 0) {
    return (
      <div
        className="rounded-full bg-gray-100 flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <span className="text-xs text-gray-400">-</span>
      </div>
    );
  }

  const proteinPercent = (protein / total) * 100;
  const carbsPercent = (carbs / total) * 100;
  const fatPercent = (fat / total) * 100;

  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;

  const proteinDash = (proteinPercent / 100) * circumference;
  const carbsDash = (carbsPercent / 100) * circumference;
  const fatDash = (fatPercent / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Fat segment */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#22c55e"
          strokeWidth="4"
          strokeDasharray={`${fatDash} ${circumference}`}
          strokeDashoffset={0}
        />
        {/* Carbs segment */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#f59e0b"
          strokeWidth="4"
          strokeDasharray={`${carbsDash} ${circumference}`}
          strokeDashoffset={-fatDash}
        />
        {/* Protein segment */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#ef4444"
          strokeWidth="4"
          strokeDasharray={`${proteinDash} ${circumference}`}
          strokeDashoffset={-(fatDash + carbsDash)}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-medium text-gray-600">
          {Math.round(total)}g
        </span>
      </div>
    </div>
  );
}
