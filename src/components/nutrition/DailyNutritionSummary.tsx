"use client";

import React from "react";
import type { DailyNutritionResult } from "@/types/nutrition";
import { MacroSummary } from "../nutrition";
import { ComplianceScore } from "../nutrition";
import { MicronutrientHighlights } from "../nutrition";

interface DailyNutritionSummaryProps {
  result: DailyNutritionResult;
  dayLabel?: string;
  expanded?: boolean;
}

/**
 * Displays a complete daily nutrition summary with macros, compliance, and micronutrient highlights.
 */
export function DailyNutritionSummary({
  result,
  dayLabel,
  expanded = false,
}: DailyNutritionSummaryProps) {
  const [isExpanded, setIsExpanded] = React.useState(expanded);

  const dateStr =
    dayLabel ??
    result.date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold text-gray-800 text-sm">{dateStr}</span>
          <span className="text-xs text-gray-500">
            {Math.round(result.totals.calories)} kcal
          </span>
          <span className="text-xs text-gray-500">
            {result.meals.length} meal{result.meals.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ComplianceScore score={result.compliance.overall} size="compact" />
          <span className="text-gray-400 text-xs">
            {isExpanded ? "▼" : "▶"}
          </span>
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Macro rings */}
          <MacroSummary
            totals={result.totals}
            goals={result.goals}
            percentages={{
              protein: result.goals.protein
                ? (result.totals.protein / result.goals.protein) * 100
                : 0,
              carbs: result.goals.carbs
                ? (result.totals.carbs / result.goals.carbs) * 100
                : 0,
              fat: result.goals.fat
                ? (result.totals.fat / result.goals.fat) * 100
                : 0,
            }}
          />
          {/* Meal list */}
          {result.meals.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">
                Meals
              </h4>
              <div className="space-y-1">
                {result.meals.map((meal, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 capitalize w-16">
                        {meal.mealType}
                      </span>
                      <span className="text-gray-700">{meal.recipeName}</span>
                    </div>
                    <span className="text-gray-500">
                      {Math.round(meal.nutrition.calories)} kcal
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Micronutrient highlights */}
          <MicronutrientHighlights
            totals={result.totals}
            goals={result.goals}
            deficiencies={result.compliance.deficiencies.map((d) => ({
              nutrient: d.nutrient,
              averageDaily: d.actual,
              targetDaily: d.target,
            }))}
            excesses={result.compliance.excesses.map((e) => ({
              nutrient: e.nutrient,
              averageDaily: e.actual,
              targetDaily: e.target,
            }))}
          />

          {/* Suggestions */}
          {result.compliance.suggestions.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-3">
              <h4 className="text-xs font-medium text-blue-700 mb-1">
                Suggestions
              </h4>
              <ul className="space-y-1">
                {result.compliance.suggestions.map((s, i) => (
                  <li
                    key={i}
                    className="text-xs text-blue-600 flex items-start gap-1"
                  >
                    <span>-</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
