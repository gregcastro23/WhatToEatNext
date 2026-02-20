"use client";

/**
 * Meal Circuit Badge Component
 * Displays circuit metrics for individual meal slots
 *
 * @file src/components/menu-planner/MealCircuitBadge.tsx
 * @created 2026-01-11
 */

import React, { useState } from "react";
import {
  useMealCircuitMetrics,
  formatPower,
  formatEfficiency,
  getEfficiencyColor,
} from "@/hooks/useCircuitMetrics";

interface MealCircuitBadgeProps {
  mealSlotId: string;
  compact?: boolean;
}

/**
 * Compact badge for meal slot corner
 */
function CompactBadge({
  power,
  efficiency,
  isValid,
}: {
  power: number;
  efficiency: number;
  isValid: boolean;
}) {
  const color = getEfficiencyColor(efficiency);
  const colorClasses = {
    green: "bg-green-100 border-green-400 text-green-700",
    yellow: "bg-yellow-100 border-yellow-400 text-yellow-700",
    red: "bg-red-100 border-red-400 text-red-700",
  };

  if (!isValid) {
    return (
      <div
        className="px-1.5 py-0.5 rounded border bg-gray-100 border-gray-300 text-gray-500 text-[10px] font-mono"
        title="Circuit metrics unavailable"
      >
        ⚡ --
      </div>
    );
  }

  return (
    <div
      className={`px-1.5 py-0.5 rounded border text-[10px] font-mono ${colorClasses[color]}`}
      title={`Power: ${formatPower(power)}\nEfficiency: ${formatEfficiency(efficiency)}`}
    >
      ⚡ {formatEfficiency(efficiency)}
    </div>
  );
}

/**
 * Expanded badge with detailed metrics
 */
function ExpandedBadge({
  power,
  efficiency,
  currentFlow,
  resistance,
  isValid,
}: {
  power: number;
  efficiency: number;
  currentFlow: number;
  resistance: number;
  isValid: boolean;
}) {
  const color = getEfficiencyColor(efficiency);
  const colorClasses = {
    green: "bg-green-50 border-green-300",
    yellow: "bg-yellow-50 border-yellow-300",
    red: "bg-red-50 border-red-300",
  };

  if (!isValid) {
    return (
      <div className="px-2 py-1 rounded border bg-gray-50 border-gray-300">
        <div className="text-[10px] text-gray-500 font-medium mb-0.5">
          Circuit Metrics
        </div>
        <div className="text-xs text-gray-400">Not available</div>
      </div>
    );
  }

  return (
    <div className={`px-2 py-1.5 rounded border ${colorClasses[color]}`}>
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-sm">⚡</span>
        <div className="text-[10px] font-semibold text-gray-700">
          Circuit Metrics
        </div>
      </div>
      <div className="space-y-0.5 text-[10px] font-mono">
        <div className="flex justify-between gap-2">
          <span className="text-gray-600">Power:</span>
          <span className="font-semibold text-gray-800">
            {formatPower(power)}
          </span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-gray-600">Efficiency:</span>
          <span
            className={`font-semibold ${color === "green" ? "text-green-700" : color === "yellow" ? "text-yellow-700" : "text-red-700"}`}
          >
            {formatEfficiency(efficiency)}
          </span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-gray-600">Current:</span>
          <span className="font-medium text-gray-700">
            {currentFlow.toFixed(2)} A
          </span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-gray-600">Resistance:</span>
          <span className="font-medium text-gray-700">
            {resistance.toFixed(2)} Ω
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Main Badge Component
 */
export default function MealCircuitBadge({
  mealSlotId,
  compact = true,
}: MealCircuitBadgeProps) {
  const [showExpanded, setShowExpanded] = useState(false);
  const { metrics, isLoading } = useMealCircuitMetrics(mealSlotId);

  // Loading state
  if (isLoading) {
    return compact ? (
      <div className="px-1.5 py-0.5 rounded border bg-gray-100 border-gray-300 text-gray-400 text-[10px] animate-pulse">
        ⚡ ...
      </div>
    ) : (
      <div className="px-2 py-1 rounded border bg-gray-100 border-gray-300 animate-pulse">
        <div className="h-4 w-16 bg-gray-200 rounded" />
      </div>
    );
  }

  // No metrics available
  if (!metrics) {
    return null;
  }

  // Compact mode (default)
  if (compact) {
    return (
      <div
        onMouseEnter={() => setShowExpanded(true)}
        onMouseLeave={() => setShowExpanded(false)}
        className="relative inline-block"
      >
        <CompactBadge
          power={metrics.power}
          efficiency={metrics.efficiency}
          isValid={metrics.isValid}
        />
        {showExpanded && (
          <div className="absolute top-full left-0 mt-1 z-50 shadow-lg">
            <ExpandedBadge
              power={metrics.power}
              efficiency={metrics.efficiency}
              currentFlow={metrics.currentFlow}
              resistance={metrics.resistance}
              isValid={metrics.isValid}
            />
          </div>
        )}
      </div>
    );
  }

  // Expanded mode
  return (
    <ExpandedBadge
      power={metrics.power}
      efficiency={metrics.efficiency}
      currentFlow={metrics.currentFlow}
      resistance={metrics.resistance}
      isValid={metrics.isValid}
    />
  );
}
