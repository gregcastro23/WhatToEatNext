"use client";

import React, { useMemo } from "react";
import type { WeeklyNutritionResult } from "@/types/nutrition";
import MacroSummary from "./MacroSummary";
import ComplianceScore from "./ComplianceScore";
import DailyNutritionSummary from "./DailyNutritionSummary";
import MicronutrientHighlights from "./MicronutrientHighlights";
import { findDeficiencies, findExcesses } from "@/utils/nutritionAggregation";
import { multiplyNutrition } from "@/data/nutritional/rdaStandards";

interface WeeklyNutritionDashboardProps {
  weeklyResult: WeeklyNutritionResult;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Full-page weekly nutrition dashboard showing:
 * - Overall weekly compliance
 * - Weekly macro totals vs targets
 * - Daily breakdowns (expandable)
 * - Weekly micronutrient highlights
 * - Variety metrics
 */
export default function WeeklyNutritionDashboard({
  weeklyResult,
  isOpen,
  onClose,
}: WeeklyNutritionDashboardProps) {
  if (!isOpen) return null;

  const dailyAvgTarget = useMemo(() => {
    return multiplyNutrition(weeklyResult.weeklyGoals, 1 / 7);
  }, [weeklyResult.weeklyGoals]);

  const dailyAvgActual = useMemo(() => {
    return multiplyNutrition(weeklyResult.weeklyTotals, 1 / 7);
  }, [weeklyResult.weeklyTotals]);

  const weeklyDeficiencies = useMemo(
    () => findDeficiencies(weeklyResult.weeklyTotals, weeklyResult.weeklyGoals),
    [weeklyResult],
  );

  const weeklyExcesses = useMemo(
    () => findExcesses(weeklyResult.weeklyTotals, weeklyResult.weeklyGoals),
    [weeklyResult],
  );

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Weekly Nutrition Dashboard</h2>
              <p className="text-green-100 text-sm mt-1">
                {weeklyResult.weekStartDate.toLocaleDateString()} - {weeklyResult.weekEndDate.toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
          {/* Top row: Compliance + Average Macros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ComplianceScore
              score={weeklyResult.weeklyCompliance.overall}
              label="Weekly Compliance"
              size="lg"
            />

            <div className="md:col-span-2">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Daily Averages vs Targets</h3>
              <MacroSummary actual={dailyAvgActual} target={dailyAvgTarget} />
            </div>
          </div>

          {/* Weekly summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <SummaryCard
              label="Total Calories"
              value={Math.round(weeklyResult.weeklyTotals.calories)}
              target={Math.round(weeklyResult.weeklyGoals.calories)}
              unit="kcal"
            />
            <SummaryCard
              label="Total Protein"
              value={Math.round(weeklyResult.weeklyTotals.protein)}
              target={Math.round(weeklyResult.weeklyGoals.protein)}
              unit="g"
            />
            <SummaryCard
              label="Total Carbs"
              value={Math.round(weeklyResult.weeklyTotals.carbs)}
              target={Math.round(weeklyResult.weeklyGoals.carbs)}
              unit="g"
            />
            <SummaryCard
              label="Total Fat"
              value={Math.round(weeklyResult.weeklyTotals.fat)}
              target={Math.round(weeklyResult.weeklyGoals.fat)}
              unit="g"
            />
            <SummaryCard
              label="Unique Recipes"
              value={weeklyResult.variety.uniqueRecipes}
              unit=""
            />
          </div>

          {/* Micronutrient highlights */}
          <MicronutrientHighlights
            actual={weeklyResult.weeklyTotals}
            target={weeklyResult.weeklyGoals}
            deficiencies={weeklyDeficiencies}
            excesses={weeklyExcesses}
          />

          {/* Daily breakdowns */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Daily Breakdowns</h3>
            <div className="space-y-2">
              {weeklyResult.days.map((day, i) => (
                <DailyNutritionSummary
                  key={i}
                  result={day}
                  dayLabel={dayNames[i]}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  target,
  unit,
}: {
  label: string;
  value: number;
  target?: number;
  unit: string;
}) {
  const pct = target && target > 0 ? Math.round((value / target) * 100) : null;

  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-bold text-gray-800">
        {value.toLocaleString()} {unit}
      </p>
      {target !== undefined && (
        <p className="text-xs text-gray-400">
          / {target.toLocaleString()} {unit}
          {pct !== null && <span className="ml-1">({pct}%)</span>}
        </p>
      )}
    </div>
  );
}
