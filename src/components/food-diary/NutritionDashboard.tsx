"use client";

/**
 * NutritionDashboard Component
 * Comprehensive nutrition tracking display with goals, trends, and insights
 *
 * @file src/components/food-diary/NutritionDashboard.tsx
 * @created 2026-02-02
 */

import React, { useMemo, useState } from "react";
import type {
  DailyFoodDiarySummary,
  WeeklyFoodDiarySummary,
  FoodInsight,
  FoodDiaryStats,
} from "@/types/foodDiary";
import type { NutritionalSummary } from "@/types/nutrition";
import { NutritionRing } from "../nutrition";

interface NutritionDashboardProps {
  dailySummary: DailyFoodDiarySummary | null;
  weeklySummary: WeeklyFoodDiarySummary | null;
  stats: FoodDiaryStats | null;
  insights: FoodInsight[];
  onRefreshInsights?: () => void;
}

const NUTRIENT_LABELS: Partial<
  Record<
    keyof NutritionalSummary,
    { label: string; unit: string; color: string }
  >
> = {
  calories: { label: "Calories", unit: "", color: "#f59e0b" },
  protein: { label: "Protein", unit: "g", color: "#ef4444" },
  carbs: { label: "Carbs", unit: "g", color: "#3b82f6" },
  fat: { label: "Fat", unit: "g", color: "#8b5cf6" },
  fiber: { label: "Fiber", unit: "g", color: "#22c55e" },
  sugar: { label: "Sugar", unit: "g", color: "#ec4899" },
  sodium: { label: "Sodium", unit: "mg", color: "#6b7280" },
  vitaminC: { label: "Vitamin C", unit: "mg", color: "#f97316" },
  iron: { label: "Iron", unit: "mg", color: "#dc2626" },
  calcium: { label: "Calcium", unit: "mg", color: "#e5e7eb" },
};

export default function NutritionDashboard({
  dailySummary,
  weeklySummary,
  stats,
  insights,
  onRefreshInsights,
}: NutritionDashboardProps) {
  const [activeTab, setActiveTab] = useState<"today" | "week" | "insights">(
    "today",
  );

  const macroPercentages = useMemo(() => {
    if (!dailySummary) return null;
    const { protein, carbs, fat } = dailySummary.totalNutrition;
    const total = (protein || 0) * 4 + (carbs || 0) * 4 + (fat || 0) * 9;
    if (total === 0) return null;

    return {
      protein: Math.round((((protein || 0) * 4) / total) * 100),
      carbs: Math.round((((carbs || 0) * 4) / total) * 100),
      fat: Math.round((((fat || 0) * 9) / total) * 100),
    };
  }, [dailySummary]);

  const priorityInsights = useMemo(() => {
    return insights.filter((i) => i.priority === "high").slice(0, 3);
  }, [insights]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        {[
          { id: "today", label: "Today" },
          { id: "week", label: "This Week" },
          { id: "insights", label: "Insights" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "text-amber-600 border-b-2 border-amber-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Today Tab */}
      {activeTab === "today" && (
        <div className="p-4">
          {!dailySummary || dailySummary.entries.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <p className="text-gray-500">
                Log some food to see your nutrition stats
              </p>
            </div>
          ) : (
            <>
              {/* Macro Summary */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Daily Progress
                </h4>
                <div className="flex items-center justify-around">
                  <NutritionRing
                    percentage={
                      dailySummary.nutritionGoals?.calories
                        ? (dailySummary.totalNutrition.calories /
                            dailySummary.nutritionGoals.calories) *
                          100
                        : 0
                    }
                    label="Calories"
                    size={90}
                    strokeWidth={8}
                    color="#f59e0b"
                  />
                  <NutritionRing
                    percentage={
                      dailySummary.nutritionGoals?.protein
                        ? (dailySummary.totalNutrition.protein /
                            dailySummary.nutritionGoals.protein) *
                          100
                        : 0
                    }
                    label="Protein"
                    size={90}
                    strokeWidth={8}
                    color="#ef4444"
                  />
                  <NutritionRing
                    percentage={
                      dailySummary.nutritionGoals?.carbs
                        ? (dailySummary.totalNutrition.carbs /
                            dailySummary.nutritionGoals.carbs) *
                          100
                        : 0
                    }
                    label="Carbs"
                    size={90}
                    strokeWidth={8}
                    color="#3b82f6"
                  />
                  <NutritionRing
                    percentage={
                      dailySummary.nutritionGoals?.fat
                        ? (dailySummary.totalNutrition.fat /
                            dailySummary.nutritionGoals.fat) *
                          100
                        : 0
                    }
                    label="Fat"
                    size={90}
                    strokeWidth={8}
                    color="#8b5cf6"
                  />
                </div>
              </div>

              {/* Macro Distribution Bar */}
              {macroPercentages && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Macro Distribution
                  </h4>
                  <div className="h-6 rounded-full overflow-hidden flex">
                    <div
                      className="bg-red-500 flex items-center justify-center text-xs text-white font-medium"
                      style={{ width: `${macroPercentages.protein}%` }}
                    >
                      {macroPercentages.protein}%
                    </div>
                    <div
                      className="bg-blue-500 flex items-center justify-center text-xs text-white font-medium"
                      style={{ width: `${macroPercentages.carbs}%` }}
                    >
                      {macroPercentages.carbs}%
                    </div>
                    <div
                      className="bg-purple-500 flex items-center justify-center text-xs text-white font-medium"
                      style={{ width: `${macroPercentages.fat}%` }}
                    >
                      {macroPercentages.fat}%
                    </div>
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-gray-500">
                    <span>Protein</span>
                    <span>Carbs</span>
                    <span>Fat</span>
                  </div>
                </div>
              )}

              {/* Micronutrients */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Other Nutrients
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <NutrientBar
                    label="Fiber"
                    value={dailySummary.totalNutrition.fiber}
                    max={dailySummary.nutritionGoals?.fiber || 28}
                    unit="g"
                    color="#22c55e"
                  />
                  <NutrientBar
                    label="Sugar"
                    value={dailySummary.totalNutrition.sugar}
                    max={50}
                    unit="g"
                    color="#ec4899"
                    inverse
                  />
                  <NutrientBar
                    label="Sodium"
                    value={dailySummary.totalNutrition.sodium}
                    max={dailySummary.nutritionGoals?.sodium || 2300}
                    unit="mg"
                    color="#6b7280"
                    inverse
                  />
                  <NutrientBar
                    label="Vitamin C"
                    value={dailySummary.totalNutrition.vitaminC}
                    max={90}
                    unit="mg"
                    color="#f97316"
                  />
                </div>
              </div>

              {/* Meal Breakdown */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Calories by Meal
                </h4>
                <div className="space-y-2">
                  {(["breakfast", "lunch", "dinner", "snack"] as const).map(
                    (meal) => {
                      const mealEntries = dailySummary.mealBreakdown[meal];
                      const mealCalories = mealEntries.reduce(
                        (sum, e) => sum + (e.nutrition.calories || 0),
                        0,
                      );
                      const percentage = dailySummary.nutritionGoals?.calories
                        ? (mealCalories /
                            dailySummary.nutritionGoals.calories) *
                          100
                        : 0;

                      return (
                        <div key={meal} className="flex items-center gap-3">
                          <span className="w-20 text-sm text-gray-600 capitalize">
                            {meal}
                          </span>
                          <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500 rounded-full transition-all"
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                          <span className="w-16 text-sm text-gray-600 text-right">
                            {Math.round(mealCalories)}
                          </span>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Week Tab */}
      {activeTab === "week" && (
        <div className="p-4">
          {!weeklySummary || weeklySummary.totalEntries === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No data for this week yet</p>
            </div>
          ) : (
            <>
              {/* Weekly Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {weeklySummary.totalEntries}
                  </div>
                  <div className="text-sm text-gray-500">Total Entries</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.round(weeklySummary.averageDailyNutrition.calories)}
                  </div>
                  <div className="text-sm text-gray-500">Avg Calories/Day</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.round(weeklySummary.averageDailyNutrition.protein)}g
                  </div>
                  <div className="text-sm text-gray-500">Avg Protein/Day</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-amber-600">
                    {weeklySummary.goalCompliance.overall}%
                  </div>
                  <div className="text-sm text-gray-500">Goal Compliance</div>
                </div>
              </div>

              {/* Daily Breakdown Chart */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Daily Calories
                </h4>
                <div className="flex items-end gap-2 h-32">
                  {weeklySummary.dailySummaries.map((day, index) => {
                    const maxCal = Math.max(
                      ...weeklySummary.dailySummaries.map(
                        (d) => d.totalNutrition.calories,
                      ),
                      1,
                    );
                    const height = (day.totalNutrition.calories / maxCal) * 100;
                    const dayName = new Date(day.date).toLocaleDateString(
                      "en-US",
                      { weekday: "short" },
                    );
                    const isToday =
                      new Date(day.date).toDateString() ===
                      new Date().toDateString();

                    return (
                      <div
                        key={index}
                        className="flex-1 flex flex-col items-center"
                      >
                        <div
                          className={`w-full rounded-t transition-all ${
                            isToday ? "bg-amber-500" : "bg-amber-300"
                          }`}
                          style={{
                            height: `${height}%`,
                            minHeight: day.entries.length > 0 ? 4 : 0,
                          }}
                        />
                        <div
                          className={`text-xs mt-1 ${isToday ? "font-bold text-amber-600" : "text-gray-500"}`}
                        >
                          {dayName}
                        </div>
                        <div className="text-xs text-gray-400">
                          {day.entries.length > 0
                            ? Math.round(day.totalNutrition.calories)
                            : "-"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Foods */}
              {weeklySummary.patterns.topFoods.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Most Eaten Foods
                  </h4>
                  <div className="space-y-2">
                    {weeklySummary.patterns.topFoods
                      .slice(0, 5)
                      .map((food, index) => (
                        <div
                          key={food.name}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-xs flex items-center justify-center font-medium">
                              {index + 1}
                            </span>
                            <span className="text-sm text-gray-900">
                              {food.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                              {food.count}x
                            </span>
                            {food.averageRating && (
                              <span className="text-sm text-amber-600">
                                {food.averageRating.toFixed(1)} stars
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Insights Tab */}
      {activeTab === "insights" && (
        <div className="p-4">
          {insights.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 mb-4">
                Track more meals to get personalized insights
              </p>
              {onRefreshInsights && (
                <button
                  onClick={onRefreshInsights}
                  className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                >
                  Check for insights
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {insights.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          )}

          {/* Streak Stats */}
          {stats && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Your Tracking
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-amber-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-amber-600">
                    {stats.trackingStreak}
                  </div>
                  <div className="text-xs text-amber-800">Day Streak</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.longestStreak}
                  </div>
                  <div className="text-xs text-gray-500">Best Streak</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.totalDaysTracked}
                  </div>
                  <div className="text-xs text-gray-500">Days Tracked</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.averageRating.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500">Avg Rating</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Nutrient progress bar component
 */
function NutrientBar({
  label,
  value,
  max,
  unit,
  color,
  inverse = false,
}: {
  label: string;
  value: number;
  max: number;
  unit: string;
  color: string;
  inverse?: boolean;
}) {
  const percentage = Math.min((value / max) * 100, 100);
  const isOver = value > max;

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span
          className={
            isOver && inverse ? "text-red-600 font-medium" : "text-gray-900"
          }
        >
          {Math.round(value)}
          {unit} / {max}
          {unit}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${percentage}%`,
            backgroundColor: isOver && inverse ? "#ef4444" : color,
          }}
        />
      </div>
    </div>
  );
}

/**
 * Insight card component
 */
function InsightCard({ insight }: { insight: FoodInsight }) {
  const priorityColors = {
    high: "border-red-200 bg-red-50",
    medium: "border-amber-200 bg-amber-50",
    low: "border-green-200 bg-green-50",
  };

  const priorityIcons = {
    high: "text-red-600",
    medium: "text-amber-600",
    low: "text-green-600",
  };

  return (
    <div
      className={`rounded-lg border p-4 ${priorityColors[insight.priority]}`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${priorityIcons[insight.priority]}`}>
          {insight.type === "nutrition_gap" && (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          )}
          {insight.type === "positive_pattern" && (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
          {(insight.type === "excess_warning" ||
            insight.type === "improvement_opportunity") && (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
        </div>
        <div className="flex-1">
          <h5 className="font-medium text-gray-900">{insight.title}</h5>
          <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
          {insight.recommendation && (
            <p className="text-sm text-gray-700 mt-2 font-medium">
              {insight.recommendation}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
