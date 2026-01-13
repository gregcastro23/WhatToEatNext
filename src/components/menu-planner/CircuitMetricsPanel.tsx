"use client";

/**
 * Circuit Metrics Panel Component
 * Comprehensive display of weekly circuit metrics, day breakdowns, and suggestions
 *
 * @file src/components/menu-planner/CircuitMetricsPanel.tsx
 * @created 2026-01-11
 */

import React, { useState } from "react";
import { useMenuPlanner } from "@/contexts/MenuPlannerContext";
import { useWeeklyCircuitMetrics, formatPower, formatEfficiency, getEfficiencyColor } from "@/hooks/useCircuitMetrics";
import { getDayName } from "@/types/menuPlanner";
import type { DayOfWeek } from "@/types/menuPlanner";

/**
 * Simple Tooltip Component
 */
function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="cursor-help"
      >
        {children}
      </div>
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg max-w-xs whitespace-normal">
          {text}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-gray-900" />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Weekly Overview Section
 */
function WeeklyOverview() {
  const { metrics, isLoading } = useWeeklyCircuitMetrics();

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-2" />
        <div className="h-4 bg-gray-100 rounded w-3/4" />
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-6 text-gray-500">
        <p className="text-sm">No circuit metrics available yet.</p>
        <p className="text-xs mt-1">Add meals to your menu to see circuit analysis.</p>
      </div>
    );
  }

  const efficiencyColor = getEfficiencyColor(metrics.weekEfficiency);
  const efficiencyClasses = {
    green: "bg-green-100 text-green-800 border-green-300",
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-300",
    red: "bg-red-100 text-red-800 border-red-300",
  };

  return (
    <div className="space-y-4">
      {/* Main Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Tooltip text="Total Power (P=IV): Sum of all meal energies calculated using current and voltage from alchemical properties. Higher = more energetic week.">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 border-2 border-purple-200">
            <div className="text-xs font-medium text-purple-600 mb-1 flex items-center gap-1">
              Total Power <span className="text-[10px]">ⓘ</span>
            </div>
            <div className="text-lg font-bold text-purple-800">
              {formatPower(metrics.totalWeekPower)}
            </div>
          </div>
        </Tooltip>

        <Tooltip text="Efficiency: Percentage of power successfully delivered vs. lost to resistance. 70%+ is excellent, 40-70% is good, <40% needs optimization.">
          <div className={`rounded-lg p-3 border-2 ${efficiencyClasses[efficiencyColor]}`}>
            <div className="text-xs font-medium mb-1 flex items-center gap-1">
              Efficiency <span className="text-[10px]">ⓘ</span>
            </div>
            <div className="text-lg font-bold">
              {formatEfficiency(metrics.weekEfficiency)}
            </div>
          </div>
        </Tooltip>

        <Tooltip text="Total Charge: Sum of alchemical current (Spirit + Essence) across all meals. Represents the week's overall vitality.">
          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-3 border-2 border-orange-200">
            <div className="text-xs font-medium text-orange-600 mb-1 flex items-center gap-1">
              Total Charge <span className="text-[10px]">ⓘ</span>
            </div>
            <div className="text-lg font-bold text-orange-800">
              {metrics.totalWeekCharge.toFixed(1)} C
            </div>
          </div>
        </Tooltip>

        <Tooltip text="Losses: Power dissipated due to resistance (Matter + Substance). Lower losses mean better harmony between meals.">
          <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg p-3 border-2 border-red-200">
            <div className="text-xs font-medium text-red-600 mb-1 flex items-center gap-1">
              Losses <span className="text-[10px]">ⓘ</span>
            </div>
            <div className="text-lg font-bold text-red-800">
              {formatPower(metrics.totalWeekLosses)}
            </div>
          </div>
        </Tooltip>
      </div>

      {/* Power Distribution */}
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
        <div className="text-xs font-semibold text-gray-700 mb-2">
          Power Distribution by Meal Type
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <div className="text-[10px] text-gray-600 mb-1">Morning</div>
            <div className="text-sm font-bold text-orange-700">
              {(metrics.powerDistribution.morning * 100).toFixed(0)}%
            </div>
          </div>
          <div>
            <div className="text-[10px] text-gray-600 mb-1">Midday</div>
            <div className="text-sm font-bold text-blue-700">
              {(metrics.powerDistribution.midday * 100).toFixed(0)}%
            </div>
          </div>
          <div>
            <div className="text-[10px] text-gray-600 mb-1">Evening</div>
            <div className="text-sm font-bold text-purple-700">
              {(metrics.powerDistribution.evening * 100).toFixed(0)}%
            </div>
          </div>
          <div>
            <div className="text-[10px] text-gray-600 mb-1">Snacks</div>
            <div className="text-sm font-bold text-green-700">
              {(metrics.powerDistribution.snacks * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      </div>

      {/* Elemental Balance */}
      <div className="bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50 rounded-lg p-3 border border-gray-200">
        <div className="text-xs font-semibold text-gray-700 mb-2">
          Weekly Elemental Balance
        </div>
        <div className="flex gap-1 h-4 rounded overflow-hidden">
          {Object.entries(metrics.weeklyElementalBalance).map(([element, value]) => {
            const colors = {
              Fire: "bg-orange-500",
              Water: "bg-blue-500",
              Earth: "bg-amber-600",
              Air: "bg-sky-400",
            };
            const total = Object.values(metrics.weeklyElementalBalance).reduce(
              (sum, v) => sum + v,
              0
            );
            const percentage = total > 0 ? (value / total) * 100 : 0;
            return (
              <div
                key={element}
                className={colors[element as keyof typeof colors]}
                style={{ width: `${percentage}%` }}
                title={`${element}: ${percentage.toFixed(1)}%`}
              />
            );
          })}
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-gray-600">
          <span>🔥 Fire</span>
          <span>💧 Water</span>
          <span>🌍 Earth</span>
          <span>💨 Air</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Day Breakdown Section
 */
function DayBreakdown() {
  const { metrics } = useWeeklyCircuitMetrics();

  if (!metrics) return null;

  const dayOrder: DayOfWeek[] = [0, 1, 2, 3, 4, 5, 6];
  const dayKeys: (keyof typeof metrics.days)[] = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        Day-by-Day Breakdown
      </h3>
      {dayOrder.map((dayIndex) => {
        const dayKey = dayKeys[dayIndex];
        const dayMetrics = metrics.days[dayKey];

        if (!dayMetrics) return null;

        const efficiencyColor = getEfficiencyColor(dayMetrics.dayEfficiency);
        const colorClasses = {
          green: "border-green-400 bg-green-50",
          yellow: "border-yellow-400 bg-yellow-50",
          red: "border-red-400 bg-red-50",
        };

        return (
          <div
            key={dayIndex}
            className={`flex items-center justify-between p-2 rounded border-2 ${colorClasses[efficiencyColor]}`}
          >
            <div className="flex items-center gap-3">
              <div className="font-semibold text-sm text-gray-800 min-w-[80px]">
                {getDayName(dayIndex)}
              </div>
              <div className="text-xs text-gray-600">
                {formatPower(dayMetrics.totalPower)}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-xs">
                <span className="text-gray-600">Efficiency: </span>
                <span className="font-semibold">
                  {formatEfficiency(dayMetrics.dayEfficiency)}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                R: {dayMetrics.totalResistance.toFixed(1)}Ω
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Bottlenecks Section
 */
function BottlenecksSection() {
  const { findBottlenecks } = useMenuPlanner();
  const bottlenecks = findBottlenecks();

  if (bottlenecks.length === 0) {
    return (
      <div className="text-center py-4 text-green-600 bg-green-50 rounded-lg border border-green-200">
        <div className="text-2xl mb-1">✓</div>
        <div className="text-sm font-medium">No bottlenecks detected!</div>
        <div className="text-xs mt-1">Your menu has good circuit flow</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
        <span className="text-red-500">⚠️</span>
        Bottlenecks Detected ({bottlenecks.length})
      </h3>
      {bottlenecks.map((bottleneck, idx) => (
        <div
          key={idx}
          className="bg-red-50 border-2 border-red-300 rounded-lg p-3"
        >
          <div className="flex items-start justify-between mb-1">
            <div className="text-xs font-semibold text-red-800">
              Slot: {bottleneck.mealSlotId}
            </div>
            <div className="text-xs font-mono text-red-600">
              Impact: {(bottleneck.impactScore * 100).toFixed(0)}%
            </div>
          </div>
          <div className="text-xs text-red-700">{bottleneck.reason}</div>
        </div>
      ))}
    </div>
  );
}

/**
 * Suggestions Section
 */
function SuggestionsSection() {
  const { getSuggestions } = useMenuPlanner();
  const suggestions = getSuggestions();

  if (suggestions.length === 0) return null;

  const topSuggestions = suggestions.slice(0, 3); // Show top 3

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
        <span className="text-blue-500">💡</span>
        Improvement Suggestions
      </h3>
      {topSuggestions.map((suggestion, idx) => (
        <div
          key={idx}
          className="bg-blue-50 border border-blue-300 rounded-lg p-3"
        >
          <div className="flex items-start justify-between mb-1">
            <div className="text-xs font-semibold text-blue-800 capitalize">
              {suggestion.type.replace(/_/g, " ")}
            </div>
            <div className="text-xs font-mono text-blue-600">
              +{(suggestion.expectedImprovement * 100).toFixed(0)}% efficiency
            </div>
          </div>
          <div className="text-xs text-blue-700 mb-1">{suggestion.reason}</div>
          {suggestion.suggestedRecipe && (
            <div className="text-xs text-blue-600 font-medium">
              → {suggestion.suggestedRecipe.name}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Empty State Component (< 6 meals)
 */
function EmptyStatePrompt({ mealCount }: { mealCount: number }) {
  return (
    <div className="p-6 text-center">
      <div className="text-4xl mb-3">⚡</div>
      <h3 className="text-lg font-bold text-purple-900 mb-2">
        Circuit Optimization Ready
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Add recipes to your calendar to unlock weekly power flow analysis and optimization suggestions.
      </p>
      {mealCount > 0 && (
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-lg border border-purple-200">
          <span className="text-purple-700 font-semibold text-sm">
            {mealCount} / 6 meals planned
          </span>
          <span className="text-xs text-purple-600">
            ({6 - mealCount} more to unlock)
          </span>
        </div>
      )}
      {mealCount === 0 && (
        <div className="mt-4 text-xs text-gray-500 max-w-md mx-auto">
          <p>💡 Tip: Click "✨ Generate" on any day or search recipes below to get started!</p>
        </div>
      )}
    </div>
  );
}

/**
 * Main Circuit Metrics Panel
 */
export default function CircuitMetricsPanel() {
  const { currentMenu } = useMenuPlanner();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Calculate total meal count
  const totalMeals = currentMenu?.meals.filter((m) => m.recipe).length || 0;
  const hasEnoughMeals = totalMeals >= 6;

  // Auto-collapse when not enough meals
  const shouldShowFullPanel = hasEnoughMeals && !isCollapsed;

  return (
    <div className="bg-white rounded-xl shadow-md border-2 border-purple-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-150 hover:to-pink-150 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚡</span>
          <div className="text-left">
            <h2 className="text-lg font-bold text-purple-900">
              Circuit Metrics
            </h2>
            <p className="text-xs text-purple-700">
              {hasEnoughMeals
                ? "Weekly power flow & optimization analysis"
                : `Add ${6 - totalMeals} more meal${6 - totalMeals === 1 ? "" : "s"} to unlock`}
            </p>
          </div>
        </div>
        <div className="text-purple-600 text-xl">
          {isCollapsed ? "▼" : "▲"}
        </div>
      </button>

      {/* Content */}
      {!isCollapsed && (
        <div>
          {!hasEnoughMeals ? (
            // Empty state when < 6 meals
            <EmptyStatePrompt mealCount={totalMeals} />
          ) : (
            // Full metrics when >= 6 meals
            <div className="p-4 space-y-6">
              {/* Weekly Overview */}
              <section>
                <WeeklyOverview />
              </section>

              {/* Day Breakdown */}
              <section>
                <DayBreakdown />
              </section>

              {/* Bottlenecks */}
              <section>
                <BottlenecksSection />
              </section>

              {/* Suggestions */}
              <section>
                <SuggestionsSection />
              </section>

              {/* Footer Note */}
              <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-200">
                <p>
                  Circuit metrics calculated using P=IV model with planetary
                  positions
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
