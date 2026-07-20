"use client";

/**
 * RedesignedMobilePlanner — the mobile weekly-planner experience.
 * Renders the prominent "Today" hero card, the rest of the week as
 * data-forward day cards, a prominent "Shop the week" action, and the single
 * Week Insights rail. Rendered inside WeeklyCalendar's mobile breakpoint; the
 * shared transit ribbon + week nav sit above it.
 *
 * @file src/components/menu-planner/redesign/RedesignedMobilePlanner.tsx
 */

import { ShoppingBag } from "lucide-react";
import type { DayOfWeek, MealSlot as MealSlotType } from "@/types/menuPlanner";
import type { WeeklyNutritionResult } from "@/types/nutrition";
import FastStartCard from "./FastStartCard";
import RedesignedDayCard from "./RedesignedDayCard";
import WeeklyInsights from "./WeeklyInsights";

const ALL_DAYS: DayOfWeek[] = [0, 1, 2, 3, 4, 5, 6];

export default function RedesignedMobilePlanner({
  weekDates,
  mealsByDay,
  todayDayOfWeek,
  weeklyNutrition,
  currentPlanetaryHour,
  onShopWeek,
}: {
  weekDates: Date[];
  mealsByDay: Record<DayOfWeek, MealSlotType[]>;
  todayDayOfWeek: DayOfWeek | null;
  weeklyNutrition?: WeeklyNutritionResult | null;
  currentPlanetaryHour?: string | null;
  onShopWeek?: () => void;
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
          dailyNutrition={weeklyNutrition?.days?.[todayDayOfWeek]}
          currentPlanetaryHour={currentPlanetaryHour}
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
          dailyNutrition={weeklyNutrition?.days?.[day]}
        />
      ))}

      {/* Shop the week */}
      {onShopWeek && (
        <button
          type="button"
          onClick={onShopWeek}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-gradient-to-r from-gold-accent to-active-violet text-background font-mono text-[12px] uppercase tracking-wider font-bold shadow-[0_0_20px_rgba(184,90,240,0.25)] active:scale-[0.98] transition-transform"
        >
          <ShoppingBag className="h-4 w-4" />
          Shop the week
        </button>
      )}

      {/* Insights rail */}
      <WeeklyInsights />
    </div>
  );
}
