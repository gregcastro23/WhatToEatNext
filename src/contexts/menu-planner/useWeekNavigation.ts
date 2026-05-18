"use client";

/**
 * Menu Planner — Week navigation hook
 *
 * Manages the week cursor (currentWeekStart) and exposes the CalendarNavigation
 * object consumed by MenuPlannerProvider.
 *
 * @file src/contexts/menu-planner/useWeekNavigation.ts
 */

import { useState, useCallback, useMemo } from "react";
import {
  getWeekStartDate,
  type CalendarNavigation,
} from "@/types/menuPlanner";

export interface UseWeekNavigationReturn {
  currentWeekStart: Date;
  setCurrentWeekStart: React.Dispatch<React.SetStateAction<Date>>;
  navigation: CalendarNavigation;
}

/**
 * Encapsulates the week cursor and all navigation helpers that feed the
 * CalendarNavigation object in MenuPlannerProvider.
 */
export function useWeekNavigation(): UseWeekNavigationReturn {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() =>
    getWeekStartDate(new Date()),
  );

  const goToNextWeek = useCallback(() => {
    const nextWeek = new Date(currentWeekStart);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setCurrentWeekStart(nextWeek);
  }, [currentWeekStart]);

  const goToPreviousWeek = useCallback(() => {
    const previousWeek = new Date(currentWeekStart);
    previousWeek.setDate(previousWeek.getDate() - 7);
    setCurrentWeekStart(previousWeek);
  }, [currentWeekStart]);

  const goToCurrentWeek = useCallback(() => {
    setCurrentWeekStart(getWeekStartDate(new Date()));
  }, []);

  const goToWeek = useCallback((date: Date) => {
    setCurrentWeekStart(getWeekStartDate(date));
  }, []);

  const navigation: CalendarNavigation = useMemo(
    () => ({
      currentWeekStart,
      goToNextWeek,
      goToPreviousWeek,
      goToCurrentWeek,
      goToWeek,
    }),
    [currentWeekStart, goToNextWeek, goToPreviousWeek, goToCurrentWeek, goToWeek],
  );

  return { currentWeekStart, setCurrentWeekStart, navigation };
}
