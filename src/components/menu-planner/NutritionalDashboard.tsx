"use client";

/**
 * Nutritional Dashboard Component
 * Displays weekly nutrition totals, macronutrient breakdown, and alchemical metrics
 *
 * @file src/components/menu-planner/NutritionalDashboard.tsx
 * @created 2026-01-11 (Phase 3)
 */

import React, { useMemo, useState } from "react";
import { useMenuPlanner } from "@/contexts/MenuPlannerContext";
import type {
  DayOfWeek,
  NutritionalGoals,
  WeeklyNutritionTotals,
} from "@/types/menuPlanner";
import {
  calculateWeeklyTotals,
  calculateMacroBreakdown,
  generateMacroChartData,
  generateElementalChartData,
  generateDailyCaloriesChartData,
  generateGregsEnergyChartData,
  getNutritionalInsights,
} from "@/utils/menuPlanner/nutritionalCalculator";

interface NutritionalDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  goals?: NutritionalGoals;
}

/**
 * Simple Pie Chart Component
 */
function PieChart({
  data,
}: {
  data: Array<{ label: string; value: number; color?: string }>;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  let cumulativePercent = 0;

  return (
    <div className="flex items-center justify-center gap-6">
      {/* Pie Chart */}
      <div className="relative w-48 h-48">
        <svg viewBox="0 0 100 100" className="transform -rotate-90">
          {data.map((item, index) => {
            const percent = (item.value / total) * 100;
            const offset = cumulativePercent;
            cumulativePercent += percent;

            // SVG circle with stroke-dasharray for pie slice
            const circumference = 2 * Math.PI * 30; // radius = 30
            const dashArray = `${(percent / 100) * circumference} ${circumference}`;
            const dashOffset = -((offset / 100) * circumference);

            return (
              <circle
                key={index}
                cx="50"
                cy="50"
                r="30"
                fill="transparent"
                stroke={item.color || "#8b5cf6"}
                strokeWidth="30"
                strokeDasharray={dashArray}
                strokeDashoffset={dashOffset}
                style={{ transition: "all 0.3s ease" }}
              />
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: item.color || "#8b5cf6" }}
            />
            <span className="text-sm">
              {item.label}: {item.value.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Simple Bar Chart Component
 */
function BarChart({
  data,
  unit,
}: {
  data: Array<{ label: string; value: number; color?: string }>;
  unit?: string;
}) {
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className="space-y-3">
      {data.map((item, index) => {
        const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;

        return (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{item.label}</span>
              <span className="text-gray-600">
                {Math.round(item.value)} {unit || ""}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: item.color || "#8b5cf6",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Simple Radar Chart Component
 */
function RadarChart({
  data,
}: {
  data: Array<{ label: string; value: number; color?: string }>;
}) {
  const size = 200;
  const center = size / 2;
  const radius = size / 2 - 20;
  const levels = 5;

  // Calculate points for the data polygon
  const dataPoints = data.map((item, i) => {
    const angle = (i * 2 * Math.PI) / data.length - Math.PI / 2;
    const distance = item.value * radius;
    return {
      x: center + distance * Math.cos(angle),
      y: center + distance * Math.sin(angle),
    };
  });

  const dataPath =
    dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") +
    " Z";

  // Calculate axis labels positions
  const axisLabels = data.map((item, i) => {
    const angle = (i * 2 * Math.PI) / data.length - Math.PI / 2;
    const distance = radius + 15;
    return {
      x: center + distance * Math.cos(angle),
      y: center + distance * Math.sin(angle),
      label: item.label,
      color: item.color,
    };
  });

  return (
    <div className="flex justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background levels */}
        {Array.from({ length: levels }, (_, i) => {
          const levelRadius = ((i + 1) / levels) * radius;
          const levelPoints = data.map((_, j) => {
            const angle = (j * 2 * Math.PI) / data.length - Math.PI / 2;
            return {
              x: center + levelRadius * Math.cos(angle),
              y: center + levelRadius * Math.sin(angle),
            };
          });
          const levelPath =
            levelPoints
              .map((p, j) => `${j === 0 ? "M" : "L"} ${p.x} ${p.y}`)
              .join(" ") + " Z";

          return (
            <path
              key={i}
              d={levelPath}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          );
        })}

        {/* Axes */}
        {data.map((_, i) => {
          const angle = (i * 2 * Math.PI) / data.length - Math.PI / 2;
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={center + radius * Math.cos(angle)}
              y2={center + radius * Math.sin(angle)}
              stroke="#d1d5db"
              strokeWidth="1"
            />
          );
        })}

        {/* Data polygon */}
        <path
          d={dataPath}
          fill="rgba(139, 92, 246, 0.3)"
          stroke="#8b5cf6"
          strokeWidth="2"
        />

        {/* Data points */}
        {dataPoints.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="4"
            fill={data[i].color || "#8b5cf6"}
          />
        ))}

        {/* Labels */}
        {axisLabels.map((label, i) => (
          <text
            key={i}
            x={label.x}
            y={label.y}
            textAnchor="middle"
            alignmentBaseline="middle"
            className="text-xs font-medium"
            fill={label.color || "#8b5cf6"}
          >
            {label.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

/**
 * Main Nutritional Dashboard Component
 */
export default function NutritionalDashboard({
  isOpen,
  onClose,
  goals,
}: NutritionalDashboardProps) {
  const { currentMenu } = useMenuPlanner();
  const [expandedSection, setExpandedSection] = useState<string | null>(
    "overview",
  );

  // Group meals by day
  const mealsByDay = useMemo(() => {
    if (!currentMenu) return {} as Record<DayOfWeek, any[]>;

    const grouped: Record<DayOfWeek, any[]> = {} as any;
    ([0, 1, 2, 3, 4, 5, 6] as DayOfWeek[]).forEach((day) => {
      grouped[day] = [];
    });

    currentMenu.meals.forEach((meal) => {
      grouped[meal.dayOfWeek].push(meal);
    });

    return grouped;
  }, [currentMenu]);

  // Calculate weekly totals
  const weeklyTotals: WeeklyNutritionTotals = useMemo(() => {
    return calculateWeeklyTotals(mealsByDay);
  }, [mealsByDay]);

  // Calculate macro breakdown
  const macroBreakdown = useMemo(() => {
    return calculateMacroBreakdown(
      weeklyTotals.totalProtein / 7,
      weeklyTotals.totalCarbs / 7,
      weeklyTotals.totalFat / 7,
    );
  }, [weeklyTotals]);

  // Generate chart data
  const macroChart = useMemo(
    () => generateMacroChartData(macroBreakdown),
    [macroBreakdown],
  );
  const elementalChart = useMemo(
    () => generateElementalChartData(weeklyTotals.weeklyElementalBalance),
    [weeklyTotals],
  );
  const caloriesChart = useMemo(
    () => generateDailyCaloriesChartData(weeklyTotals.dailyBreakdown),
    [weeklyTotals],
  );
  const gregsEnergyChart = useMemo(
    () => generateGregsEnergyChartData(weeklyTotals.dailyBreakdown),
    [weeklyTotals],
  );

  // Get insights
  const insights = useMemo(
    () => getNutritionalInsights(weeklyTotals, goals),
    [weeklyTotals, goals],
  );

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Calculate nutrient density score (nutrients per calorie)
  const calculateNutrientDensity = (totals: WeeklyNutritionTotals): number => {
    if (totals.totalCalories === 0) return 0;

    // Calculate nutrient score based on protein, fiber, and macros
    const proteinScore = (totals.totalProtein / totals.totalCalories) * 100;
    const fiberScore = (totals.totalFiber / totals.totalCalories) * 500;

    // Higher protein and fiber per calorie = better density
    const score = Math.min(
      100,
      ((proteinScore * 2 + fiberScore * 3) / 5) * 100,
    );
    return Math.round(score);
  };

  // Calculate meal type percentage of total calories
  const getMealTypePercentage = (mealType: string): number => {
    if (!currentMenu || weeklyTotals.totalCalories === 0) return 0;

    let mealTypeCalories = 0;
    currentMenu.meals.forEach((meal) => {
      if (meal.mealType === mealType && meal.recipe) {
        const nutrition =
          (meal.recipe as any).nutritionalProfile || meal.recipe.nutrition;
        if (nutrition?.calories) {
          mealTypeCalories += nutrition.calories * (meal.servings || 1);
        }
      }
    });

    return Math.round((mealTypeCalories / weeklyTotals.totalCalories) * 100);
  };

  // Calculate unique ingredient count
  const calculateIngredientVariety = (): number => {
    if (!currentMenu) return 0;

    const uniqueIngredients = new Set<string>();
    currentMenu.meals.forEach((meal) => {
      if (meal.recipe?.ingredients) {
        meal.recipe.ingredients.forEach((ing) => {
          uniqueIngredients.add(typeof ing === 'string' ? ing.toLowerCase() : (ing as any).name?.toLowerCase() ?? '');
        });
      }
    });

    return uniqueIngredients.size;
  };

  // Calculate overall holistic nutrition score
  const calculateHolisticScore = (): number => {
    const densityScore = calculateNutrientDensity(weeklyTotals);
    const varietyScore = Math.min(
      100,
      (calculateIngredientVariety() / 30) * 100,
    );
    const fiberScore = Math.min(100, (weeklyTotals.totalFiber / 7 / 30) * 100);

    // Meal balance score - closer to ideal distribution is better
    const breakfastPct = getMealTypePercentage("breakfast");
    const lunchPct = getMealTypePercentage("lunch");
    const dinnerPct = getMealTypePercentage("dinner");

    const balanceScore =
      100 -
      (Math.abs(breakfastPct - 25) +
        Math.abs(lunchPct - 35) +
        Math.abs(dinnerPct - 40));

    // Weighted average
    const score =
      densityScore * 0.3 +
      varietyScore * 0.25 +
      fiberScore * 0.2 +
      Math.max(0, balanceScore) * 0.25;

    return Math.round(score);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Nutritional Dashboard</h2>
              <p className="text-purple-100 text-sm mt-1">
                Weekly nutrition totals and alchemical metrics
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
              aria-label="Close"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Overview Section */}
          <section className="mb-6">
            <button
              onClick={() => toggleSection("overview")}
              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <h3 className="text-lg font-bold text-gray-800">
                📊 Weekly Overview
              </h3>
              <span className="text-gray-600">
                {expandedSection === "overview" ? "▼" : "▶"}
              </span>
            </button>

            {expandedSection === "overview" && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Total Calories</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {Math.round(weeklyTotals.totalCalories)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {Math.round(weeklyTotals.totalCalories / 7)}/day avg
                  </p>
                </div>

                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Protein</p>
                  <p className="text-2xl font-bold text-red-700">
                    {Math.round(weeklyTotals.totalProtein)}g
                  </p>
                  <p className="text-xs text-gray-500">
                    {Math.round(weeklyTotals.totalProtein / 7)}g/day avg
                  </p>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Carbs</p>
                  <p className="text-2xl font-bold text-yellow-700">
                    {Math.round(weeklyTotals.totalCarbs)}g
                  </p>
                  <p className="text-xs text-gray-500">
                    {Math.round(weeklyTotals.totalCarbs / 7)}g/day avg
                  </p>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Fat</p>
                  <p className="text-2xl font-bold text-orange-700">
                    {Math.round(weeklyTotals.totalFat)}g
                  </p>
                  <p className="text-xs text-gray-500">
                    {Math.round(weeklyTotals.totalFat / 7)}g/day avg
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Macronutrient Distribution */}
          <section className="mb-6">
            <button
              onClick={() => toggleSection("macros")}
              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <h3 className="text-lg font-bold text-gray-800">
                🥗 Macronutrient Distribution
              </h3>
              <span className="text-gray-600">
                {expandedSection === "macros" ? "▼" : "▶"}
              </span>
            </button>

            {expandedSection === "macros" && (
              <div className="mt-4 bg-white rounded-lg p-6 border border-gray-200">
                <PieChart data={macroChart.data} />
              </div>
            )}
          </section>

          {/* Daily Calories */}
          <section className="mb-6">
            <button
              onClick={() => toggleSection("calories")}
              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <h3 className="text-lg font-bold text-gray-800">
                📈 Daily Calories
              </h3>
              <span className="text-gray-600">
                {expandedSection === "calories" ? "▼" : "▶"}
              </span>
            </button>

            {expandedSection === "calories" && (
              <div className="mt-4 bg-white rounded-lg p-6 border border-gray-200">
                <BarChart data={caloriesChart.data} unit={caloriesChart.unit} />
              </div>
            )}
          </section>

          {/* Elemental Balance */}
          <section className="mb-6">
            <button
              onClick={() => toggleSection("elemental")}
              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <h3 className="text-lg font-bold text-gray-800">
                🔮 Elemental Balance
              </h3>
              <span className="text-gray-600">
                {expandedSection === "elemental" ? "▼" : "▶"}
              </span>
            </button>

            {expandedSection === "elemental" && (
              <div className="mt-4 bg-white rounded-lg p-6 border border-gray-200">
                <RadarChart data={elementalChart.data} />
              </div>
            )}
          </section>

          {/* Greg's Energy Trend */}
          <section className="mb-6">
            <button
              onClick={() => toggleSection("gregs-energy")}
              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <h3 className="text-lg font-bold text-gray-800">
                ⚡ Greg&apos;s Energy Trend
              </h3>
              <span className="text-gray-600">
                {expandedSection === "gregs-energy" ? "▼" : "▶"}
              </span>
            </button>

            {expandedSection === "gregs-energy" && (
              <div className="mt-4 bg-white rounded-lg p-6 border border-gray-200">
                <BarChart
                  data={gregsEnergyChart.data}
                  unit={gregsEnergyChart.unit}
                />
              </div>
            )}
          </section>

          {/* Alchemical Metrics */}
          <section className="mb-6">
            <button
              onClick={() => toggleSection("alchemical")}
              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <h3 className="text-lg font-bold text-gray-800">
                🧪 Alchemical Metrics
              </h3>
              <span className="text-gray-600">
                {expandedSection === "alchemical" ? "▼" : "▶"}
              </span>
            </button>

            {expandedSection === "alchemical" && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Greg&apos;s Energy</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {weeklyTotals.averageGregsEnergy.toFixed(3)}
                  </p>
                </div>

                <div className="bg-pink-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Monica Constant</p>
                  <p className="text-2xl font-bold text-pink-700">
                    {weeklyTotals.averageMonica.toFixed(3)}
                  </p>
                </div>

                <div className="bg-indigo-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Kalchm</p>
                  <p className="text-2xl font-bold text-indigo-700">
                    {weeklyTotals.averageKalchm.toFixed(3)}
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Insights */}
          <section className="mb-6">
            <button
              onClick={() => toggleSection("insights")}
              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <h3 className="text-lg font-bold text-gray-800">
                💡 Nutritional Insights
              </h3>
              <span className="text-gray-600">
                {expandedSection === "insights" ? "▼" : "▶"}
              </span>
            </button>

            {expandedSection === "insights" && (
              <div className="mt-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
                <ul className="space-y-2">
                  {insights.map((insight, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-gray-700"
                    >
                      <span className="text-purple-600 font-bold">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Holistic Nutrition Section */}
          <section className="mb-6">
            <button
              onClick={() => toggleSection("holistic")}
              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <h3 className="text-lg font-bold text-gray-800">
                🌿 Holistic Nutrition Score
              </h3>
              <span className="text-gray-600">
                {expandedSection === "holistic" ? "▼" : "▶"}
              </span>
            </button>

            {expandedSection === "holistic" && (
              <div className="mt-4 space-y-4">
                {/* Nutrient Density */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-700">
                      Nutrient Density
                    </h4>
                    <span className="text-lg font-bold text-green-600">
                      {calculateNutrientDensity(weeklyTotals)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Measures nutrients per calorie - higher is better
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all"
                      style={{
                        width: `${Math.min(100, calculateNutrientDensity(weeklyTotals))}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Meal Balance */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-700 mb-3">
                    Meal Balance
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl mb-1">🌅</div>
                      <p className="text-xs text-gray-600">Breakfast</p>
                      <p className="font-bold text-orange-600">
                        {getMealTypePercentage("breakfast")}%
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-1">☀️</div>
                      <p className="text-xs text-gray-600">Lunch</p>
                      <p className="font-bold text-blue-600">
                        {getMealTypePercentage("lunch")}%
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-1">🌙</div>
                      <p className="text-xs text-gray-600">Dinner</p>
                      <p className="font-bold text-purple-600">
                        {getMealTypePercentage("dinner")}%
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    Ideal: 25% breakfast, 35% lunch, 40% dinner
                  </p>
                </div>

                {/* Ingredient Variety */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-700">
                      Ingredient Variety
                    </h4>
                    <span className="text-lg font-bold text-blue-600">
                      {calculateIngredientVariety()} unique
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Diverse ingredients provide broader nutrition
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500 transition-all"
                        style={{
                          width: `${Math.min(100, (calculateIngredientVariety() / 30) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">Goal: 30+</span>
                  </div>
                </div>

                {/* Fiber Intake */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-700">
                      Fiber Intake
                    </h4>
                    <span className="text-lg font-bold text-amber-600">
                      {Math.round(weeklyTotals.totalFiber / 7)}g/day
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Daily fiber supports gut health and satiety
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 transition-all"
                        style={{
                          width: `${Math.min(100, (weeklyTotals.totalFiber / 7 / 30) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">Goal: 30g</span>
                  </div>
                </div>

                {/* Overall Holistic Score */}
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4 border border-purple-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-purple-800">
                        Overall Holistic Score
                      </h4>
                      <p className="text-sm text-purple-600">
                        Based on variety, balance, and nutrient density
                      </p>
                    </div>
                    <div className="text-4xl font-bold text-purple-700">
                      {calculateHolisticScore()}
                      <span className="text-xl text-purple-500">/100</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
