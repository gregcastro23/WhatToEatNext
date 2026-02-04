"use client";

/**
 * InlineNutritionDashboard
 * Sticky, collapsible nutrition summary that updates in real-time
 * as recipes are added/removed from the weekly menu planner.
 */

import React, { useState, useMemo } from "react";
import type { WeeklyNutritionResult } from "@/types/nutrition";
import { getComplianceSeverity } from "@/types/nutrition";
import { ComplianceScore } from "../nutrition";
import { MacroSummary } from "../nutrition";
import { MicronutrientHighlights } from "../nutrition";
import { findDeficiencies, findExcesses } from "@/utils/nutritionAggregation";
import { multiplyNutrition } from "@/data/nutritional/rdaStandards";

interface InlineNutritionDashboardProps {
  weeklyResult: WeeklyNutritionResult;
}

/**
 * Compact + expandable inline nutrition dashboard.
 * Compact view: compliance score, macro pills, deficiency count.
 * Expanded view: macro rings, micronutrient highlights, variety stats, suggestions.
 */
export default function InlineNutritionDashboard({
  weeklyResult,
}: InlineNutritionDashboardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const { weeklyTotals, weeklyGoals, weeklyCompliance, variety } = weeklyResult;

  const severity = getComplianceSeverity(weeklyCompliance.overall);

  const deficiencyCount = weeklyCompliance.deficiencies.length;
  const excessCount = weeklyCompliance.excesses.length;

  // Daily averages for expanded macro view
  const dailyAvgActual = useMemo(
    () => multiplyNutrition(weeklyTotals, 1 / 7),
    [weeklyTotals],
  );
  const dailyAvgTarget = useMemo(
    () => multiplyNutrition(weeklyGoals, 1 / 7),
    [weeklyGoals],
  );

  const weeklyDeficiencies = useMemo(
    () => findDeficiencies(weeklyTotals, weeklyGoals),
    [weeklyTotals, weeklyGoals],
  );
  const weeklyExcesses = useMemo(
    () => findExcesses(weeklyTotals, weeklyGoals),
    [weeklyTotals, weeklyGoals],
  );

  // Severity-based border color
  const borderColors: Record<string, string> = {
    excellent: "border-green-400",
    good: "border-lime-400",
    fair: "border-yellow-400",
    poor: "border-orange-400",
    critical: "border-red-400",
  };

  const bgColors: Record<string, string> = {
    excellent: "from-green-50 to-white",
    good: "from-lime-50 to-white",
    fair: "from-yellow-50 to-white",
    poor: "from-orange-50 to-white",
    critical: "from-red-50 to-white",
  };

  return (
    <div
      className={`sticky top-20 z-30 border-2 rounded-2xl shadow-md transition-all duration-300 bg-gradient-to-br ${bgColors[severity] || "from-gray-50 to-white"} ${borderColors[severity] || "border-gray-300"}`}
      role="region"
      aria-label="Weekly Nutrition Dashboard"
    >
      {/* Compact View */}
      <div className="flex items-center justify-between gap-4 p-4 flex-wrap">
        <div className="flex items-center gap-4 flex-wrap flex-1">
          {/* Compliance Score */}
          <ComplianceScore
            score={weeklyCompliance.overall}
            label="Weekly"
            size="compact"
          />

          {/* Macro Pills */}
          <div className="flex gap-2 flex-wrap">
            <MacroPill
              label="Cal"
              value={Math.round(weeklyTotals.calories)}
              target={Math.round(weeklyGoals.calories)}
              unit="kcal"
            />
            <MacroPill
              label="Protein"
              value={Math.round(weeklyTotals.protein)}
              target={Math.round(weeklyGoals.protein)}
              unit="g"
            />
            <MacroPill
              label="Carbs"
              value={Math.round(weeklyTotals.carbs)}
              target={Math.round(weeklyGoals.carbs)}
              unit="g"
            />
            <MacroPill
              label="Fat"
              value={Math.round(weeklyTotals.fat)}
              target={Math.round(weeklyGoals.fat)}
              unit="g"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Deficiency Alert */}
          {deficiencyCount > 0 && (
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-300">
              {deficiencyCount} low
            </span>
          )}
          {excessCount > 0 && (
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-orange-100 text-orange-800 border border-orange-300">
              {excessCount} high
            </span>
          )}

          {/* Expand/Collapse */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-green-600 to-teal-600 text-white hover:shadow-md transition-all"
            aria-expanded={isExpanded}
            aria-label={
              isExpanded ? "Hide nutrition details" : "Show nutrition details"
            }
          >
            {isExpanded ? "Hide Details" : "Details"}
            <span className="ml-1">{isExpanded ? "\u25B2" : "\u25BC"}</span>
          </button>
        </div>
      </div>

      {/* Expanded View */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 space-y-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Macronutrient Breakdown */}
            <div>
              <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                Daily Average Macros
              </h3>
              <MacroSummary
                totals={dailyAvgActual}
                goals={dailyAvgTarget}
                percentages={{
                  protein: dailyAvgTarget.protein
                    ? (dailyAvgActual.protein / dailyAvgTarget.protein) * 100
                    : 0,
                  carbs: dailyAvgTarget.carbs
                    ? (dailyAvgActual.carbs / dailyAvgTarget.carbs) * 100
                    : 0,
                  fat: dailyAvgTarget.fat
                    ? (dailyAvgActual.fat / dailyAvgTarget.fat) * 100
                    : 0,
                }}
              />
            </div>

            {/* Micronutrient Highlights */}
            <div>
              <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                Key Micronutrients
              </h3>
              <MicronutrientHighlights
                totals={weeklyTotals}
                goals={weeklyGoals}
                deficiencies={weeklyDeficiencies}
                excesses={weeklyExcesses}
              />
            </div>

            {/* Variety Stats */}
            <div>
              <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                Dietary Variety
              </h3>
              <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-3">
                <VarietyStat
                  label="Unique Recipes"
                  value={variety.uniqueRecipes}
                />
                <VarietyStat
                  label="Unique Ingredients"
                  value={variety.uniqueIngredients}
                />
                <VarietyBar
                  label="Cuisine Diversity"
                  value={variety.cuisineDiversity}
                />
                <VarietyBar
                  label="Color Diversity"
                  value={variety.colorDiversity}
                />
              </div>
            </div>
          </div>

          {/* Suggestions */}
          {weeklyCompliance.deficiencies.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <h4 className="text-xs font-bold text-yellow-800 uppercase tracking-wide mb-2">
                Recommendations
              </h4>
              <ul className="space-y-1">
                {weeklyCompliance.deficiencies.slice(0, 4).map((def, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-yellow-700 flex items-start gap-1"
                  >
                    <span className="font-bold">-</span>
                    <span>
                      <strong>
                        {formatNutrientName(String(def.nutrient))}
                      </strong>
                      : {Math.round(def.averageDaily)}/day (target:{" "}
                      {Math.round(def.targetDaily)})
                    </span>
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

/** Compact macro pill */
function MacroPill({
  label,
  value,
  target,
  unit,
}: {
  label: string;
  value: number;
  target: number;
  unit: string;
}) {
  const pct = target > 0 ? Math.round((value / target) * 100) : 0;
  const color =
    pct >= 85 && pct <= 115
      ? "text-green-700"
      : pct < 85
        ? "text-yellow-700"
        : "text-orange-700";

  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 min-w-[90px]">
      <p className="text-[10px] font-semibold text-gray-500 uppercase">
        {label}
      </p>
      <p className="text-sm font-bold text-gray-800">
        {value.toLocaleString()}
        <span className="text-xs text-gray-400 ml-0.5">
          / {target.toLocaleString()} {unit}
        </span>
      </p>
      <p className={`text-[10px] font-semibold ${color}`}>{pct}%</p>
    </div>
  );
}

function VarietyStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-gray-600">{label}</span>
      <span className="text-sm font-bold text-gray-800">{value}</span>
    </div>
  );
}

function VarietyBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-600">{label}</span>
        <span className="text-xs font-semibold text-gray-700">
          {Math.round(value * 100)}%
        </span>
      </div>
      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-500 to-teal-500 rounded-full transition-all duration-500"
          style={{ width: `${Math.round(value * 100)}%` }}
        />
      </div>
    </div>
  );
}

function formatNutrientName(nutrient: string): string {
  const map: Record<string, string> = {
    vitaminA: "Vitamin A",
    vitaminC: "Vitamin C",
    vitaminD: "Vitamin D",
    vitaminE: "Vitamin E",
    vitaminK: "Vitamin K",
    vitaminB6: "Vitamin B6",
    vitaminB12: "Vitamin B12",
    thiamin: "Thiamin",
    riboflavin: "Riboflavin",
    niacin: "Niacin",
    folate: "Folate",
    saturatedFat: "Sat. Fat",
    transFat: "Trans Fat",
  };
  return map[nutrient] || nutrient.charAt(0).toUpperCase() + nutrient.slice(1);
}
