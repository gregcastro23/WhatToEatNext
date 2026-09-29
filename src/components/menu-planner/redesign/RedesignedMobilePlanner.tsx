"use client";

/**
 * RedesignedMobilePlanner — the mobile weekly-planner experience.
 * Renders the prominent "Today" hero card, the rest of the week as
 * data-forward day cards, "Week nutrition" (the Nutrition Dashboard) beside a
 * prominent "Shop the week" action, and the single Week Insights rail. Rendered inside WeeklyCalendar's mobile breakpoint; the
 * shared transit ribbon + week nav sit above it.
 *
 * @file src/components/menu-planner/redesign/RedesignedMobilePlanner.tsx
 */

import { BarChart3, ShoppingBag } from "lucide-react";
import type { DayOfWeek, MealSlot as MealSlotType } from "@/types/menuPlanner";
import type { WeeklyNutritionResult } from "@/types/nutrition";
import FastStartCard from "./FastStartCard";
import RedesignedDayCard from "./RedesignedDayCard";
import WeeklyInsights from "./WeeklyInsights";
import type React from "react";

const ALL_DAYS: DayOfWeek[] = [0, 1, 2, 3, 4, 5, 6];

/** "Week nutrition" (the Nutrition Dashboard) beside "Shop the week". */
function WeekActions({
  onOpenNutrition,
  onShopWeek,
}: {
  onOpenNutrition: (() => void) | undefined;
  onShopWeek: (() => void) | undefined;
}): React.JSX.Element | null {
  if (!onOpenNutrition && !onShopWeek) return null;
  return (
    <div className="flex gap-2">
      {onOpenNutrition && (
        <button
          type="button"
          onClick={onOpenNutrition}
          aria-haspopup="dialog"
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full border border-active-violet text-active-violet bg-active-violet/10 font-mono text-[12px] uppercase tracking-wider font-bold active:scale-[0.98] transition-transform"
        >
          <BarChart3 className="h-4 w-4" />
          Week nutrition
        </button>
      )}
      {onShopWeek && (
        <button
          type="button"
          onClick={onShopWeek}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full bg-gradient-to-r from-gold-accent to-active-violet text-background font-mono text-[12px] uppercase tracking-wider font-bold shadow-[0_0_20px_rgba(184,90,240,0.25)] active:scale-[0.98] transition-transform"
        >
          <ShoppingBag className="h-4 w-4" />
          Shop the week
        </button>
      )}
    </div>
  );
}

export default function RedesignedMobilePlanner({
  weekDates,
  mealsByDay,
  todayDayOfWeek,
  weeklyNutrition,
  currentPlanetaryHour,
  onShopWeek,
  onOpenNutrition,
}: {
  /** Seven dates, Sunday-first, so a DayOfWeek index always resolves. */
  weekDates: [Date, Date, Date, Date, Date, Date, Date];
  mealsByDay: Record<DayOfWeek, MealSlotType[]>;
  todayDayOfWeek: DayOfWeek | null;
  weeklyNutrition?: WeeklyNutritionResult | null | undefined;
  currentPlanetaryHour?: string | null | undefined;
  onShopWeek?: (() => void) | undefined;
  /** Opens the week's Nutrition Dashboard (the tools bar is hidden on phones); undefined hides the button. */
  onOpenNutrition: (() => void) | undefined;
}) {
  const otherDays = ALL_DAYS.filter((d) => d !== todayDayOfWeek);
  const daysToRender = todayDayOfWeek !== null ? otherDays : ALL_DAYS;

  const isEmptyWeek = !ALL_DAYS.some((d) =>
    (mealsByDay[d] ?? []).some((m) => m.recipe),
  );

  return (
    <div className="space-y-4">
      {/* Guided fast-start — only when the whole week is empty */}
      {isEmptyWeek && <FastStartCard />}

      {/* Today hero */}
      {todayDayOfWeek !== null && (
        <RedesignedDayCard
          variant="hero"
          dayOfWeek={todayDayOfWeek}
          date={weekDates[todayDayOfWeek]}
          meals={mealsByDay[todayDayOfWeek] ?? []}
          {...(weeklyNutrition?.days?.[todayDayOfWeek] !== undefined
            ? { dailyNutrition: weeklyNutrition.days[todayDayOfWeek] }
            : {})}
          {...(currentPlanetaryHour !== undefined
            ? { currentPlanetaryHour }
            : {})}
        />
      )}

      {/* Rest of the week */}
      {daysToRender.map((day) => (
        <RedesignedDayCard
          key={day}
          variant="day"
          dayOfWeek={day}
          date={weekDates[day]}
          meals={mealsByDay[day] ?? []}
          {...(weeklyNutrition?.days?.[day] !== undefined
            ? { dailyNutrition: weeklyNutrition.days[day] }
            : {})}
        />
      ))}

      {/* Week nutrition + Shop the week */}
      <WeekActions onOpenNutrition={onOpenNutrition} onShopWeek={onShopWeek} />

      {/* Insights rail */}
      <WeeklyInsights />
    </div>
  );
}
