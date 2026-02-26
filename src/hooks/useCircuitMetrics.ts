/**
 * useCircuitMetrics Hook
 * Convenient access to circuit metrics at meal, day, or week level
 *
 * @file src/hooks/useCircuitMetrics.ts
 * @created 2026-01-11
 */

import { useMemo } from "react";
import { useMenuPlanner } from "@/contexts/MenuPlannerContext";
import type {
  MealCircuitMetrics,
  DayCircuitMetrics,
  WeeklyMenuCircuitMetrics,
} from "@/types/kinetics";
import type { DayOfWeek } from "@/types/menuPlanner";

/**
 * Circuit metrics scope
 */
export type CircuitScope = "meal" | "day" | "week";

/**
 * Hook return type for meal scope
 */
interface MealCircuitResult {
  scope: "meal";
  metrics: MealCircuitMetrics | null;
  isLoading: boolean;
}

/**
 * Hook return type for day scope
 */
interface DayCircuitResult {
  scope: "day";
  metrics: DayCircuitMetrics | null;
  isLoading: boolean;
}

/**
 * Hook return type for week scope
 */
interface WeekCircuitResult {
  scope: "week";
  metrics: WeeklyMenuCircuitMetrics | null;
  isLoading: boolean;
}

/**
 * Combined return type
 */
type CircuitMetricsResult =
  | MealCircuitResult
  | DayCircuitResult
  | WeekCircuitResult;

/**
 * Hook for accessing meal circuit metrics
 */
export function useMealCircuitMetrics(mealSlotId: string): MealCircuitResult {
  const { mealCircuitMetrics, isLoading } = useMenuPlanner();

  const metrics = useMemo(() => {
    return mealCircuitMetrics[mealSlotId] || null;
  }, [mealCircuitMetrics, mealSlotId]);

  return {
    scope: "meal",
    metrics,
    isLoading,
  };
}

/**
 * Hook for accessing day circuit metrics
 */
export function useDayCircuitMetrics(dayOfWeek: DayOfWeek): DayCircuitResult {
  const { dayCircuitMetrics, isLoading } = useMenuPlanner();

  const metrics = useMemo(() => {
    return dayCircuitMetrics[dayOfWeek] || null;
  }, [dayCircuitMetrics, dayOfWeek]);

  return {
    scope: "day",
    metrics,
    isLoading,
  };
}

/**
 * Hook for accessing weekly circuit metrics
 */
export function useWeeklyCircuitMetrics(): WeekCircuitResult {
  const { weeklyCircuitMetrics, isLoading } = useMenuPlanner();

  return {
    scope: "week",
    metrics: weeklyCircuitMetrics,
    isLoading,
  };
}

/**
 * Universal circuit metrics hook (flexible scope)
 * Use type guards to narrow the return type based on scope
 */
export function useCircuitMetrics(scope: "meal", id: string): MealCircuitResult;
export function useCircuitMetrics(
  scope: "day",
  id: DayOfWeek,
): DayCircuitResult;
export function useCircuitMetrics(scope: "week"): WeekCircuitResult;
export function useCircuitMetrics(
  scope: CircuitScope,
  id?: string | DayOfWeek,
): CircuitMetricsResult {
  const {
    mealCircuitMetrics,
    dayCircuitMetrics,
    weeklyCircuitMetrics,
    isLoading,
  } = useMenuPlanner();

  return useMemo(() => {
    if (scope === "meal" && typeof id === "string") {
      return {
        scope: "meal",
        metrics: mealCircuitMetrics[id] || null,
        isLoading,
      };
    }

    if (scope === "day" && typeof id === "number") {
      return {
        scope: "day",
        metrics: dayCircuitMetrics[id] || null,
        isLoading,
      };
    }

    if (scope === "week") {
      return {
        scope: "week",
        metrics: weeklyCircuitMetrics,
        isLoading,
      };
    }

    // Fallback for invalid scope/id combinations
    return {
      scope,
      metrics: null,
      isLoading,
    } as CircuitMetricsResult;
  }, [
    scope,
    id,
    mealCircuitMetrics,
    dayCircuitMetrics,
    weeklyCircuitMetrics,
    isLoading,
  ]);
}

/**
 * Helper: Check if metrics indicate a bottleneck
 */
export function isBottleneck(
  metrics: MealCircuitMetrics | DayCircuitMetrics | null,
): boolean {
  if (!metrics) return false;

  if ("efficiency" in metrics) {
    // Meal metrics
    return metrics.efficiency < 0.5 || metrics.resistance > 10;
  } else {
    // Day metrics
    return metrics.dayEfficiency < 0.5 || metrics.totalResistance > 40;
  }
}

/**
 * Helper: Get color for efficiency display
 */
export function getEfficiencyColor(efficiency: number): string {
  if (efficiency >= 0.7) return "green";
  if (efficiency >= 0.5) return "yellow";
  return "red";
}

/**
 * Helper: Format power value for display
 */
export function formatPower(power: number): string {
  if (power < 0.01) return "< 0.01 W";
  if (power < 1) return `${power.toFixed(2)} W`;
  if (power < 1000) return `${power.toFixed(1)} W`;
  return `${(power / 1000).toFixed(2)} kW`;
}

/**
 * Helper: Format efficiency as percentage
 */
export function formatEfficiency(efficiency: number): string {
  return `${(efficiency * 100).toFixed(1)}%`;
}
