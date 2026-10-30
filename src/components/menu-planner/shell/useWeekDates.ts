"use client";

/**
 * useWeekDates — the seven dates of the displayed week plus "today" lookup
 * and a compact range label ("Oct 25 – 31, 2026").
 *
 * @file src/components/menu-planner/shell/useWeekDates.ts
 */

import { useMemo } from "react";
import { useMenuPlanner } from "@/contexts/MenuPlannerContext";
import type { DayOfWeek } from "@/types/menuPlanner";

export type WeekDates = [Date, Date, Date, Date, Date, Date, Date];

export function formatWeekRange(start: Date, end: Date): string {
  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = sameYear && start.getMonth() === end.getMonth();
  const startStr = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endStr = end.toLocaleDateString("en-US", {
    ...(sameMonth ? {} : { month: "short" }),
    day: "numeric",
  });
  return `${startStr} – ${endStr}, ${end.getFullYear()}`;
}

function isDayOfWeek(val: number): val is DayOfWeek {
  return val >= 0 && val <= 6 && Number.isInteger(val);
}

export function useWeekDates(): {
  weekDates: WeekDates;
  todayDayOfWeek: DayOfWeek | null;
  rangeLabel: string;
} {
  const menuPlanner = useMenuPlanner();
  const rawStart = menuPlanner?.navigation?.currentWeekStart;
  const startMs =
    rawStart instanceof Date && !isNaN(rawStart.getTime())
      ? rawStart.getTime()
      : Date.now();

  return useMemo(() => {
    const at = (i: number): Date => {
      const d = new Date(startMs);
      d.setDate(d.getDate() + i);
      return d;
    };
    const weekDates: WeekDates = [at(0), at(1), at(2), at(3), at(4), at(5), at(6)];
    const todayStr = new Date().toDateString();
    const idx = weekDates.findIndex((d) => d.toDateString() === todayStr);
    return {
      weekDates,
      todayDayOfWeek: isDayOfWeek(idx) ? idx : null,
      rangeLabel: formatWeekRange(weekDates[0], weekDates[6]),
    };
  }, [startMs]);
}
