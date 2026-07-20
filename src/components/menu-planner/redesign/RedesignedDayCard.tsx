"use client";

/**
 * RedesignedDayCard — one day in the redesigned mobile planner.
 * Shows the 3 main meals (breakfast/lunch/dinner) as data-forward rows plus a
 * ghost "+ add snack" affordance. The `hero` variant is the prominent, glowing
 * "Today" card with a planetary cosmic tip and an N/3-planned read-out.
 *
 * @file src/components/menu-planner/redesign/RedesignedDayCard.tsx
 */

import type { DayOfWeek, MealSlot as MealSlotType, MealType } from "@/types/menuPlanner";
import {
  formatDateForDisplay,
  getDayName,
  getPlanetaryDayCharacteristics,
} from "@/types/menuPlanner";
import type { DailyNutritionResult } from "@/types/nutrition";
import { PLANET_GLYPHS } from "../StitchTransitRibbon";
import MealRowCard from "./MealRowCard";

const MAIN_TYPES: MealType[] = ["breakfast", "lunch", "dinner"];

export default function RedesignedDayCard({
  dayOfWeek,
  date,
  meals,
  dailyNutrition,
  variant = "day",
  currentPlanetaryHour,
}: {
  dayOfWeek: DayOfWeek;
  date: Date;
  meals: MealSlotType[];
  dailyNutrition?: DailyNutritionResult;
  variant?: "hero" | "day";
  currentPlanetaryHour?: string | null;
}) {
  const characteristics = getPlanetaryDayCharacteristics(dayOfWeek);
  const glyph = PLANET_GLYPHS[characteristics.planet] ?? "✶";

  const byType = (t: MealType) => meals.find((m) => m.mealType === t);
  const mains = MAIN_TYPES.map(byType).filter(Boolean) as MealSlotType[];
  const snack = byType("snack");
  const plannedMains = mains.filter((m) => m.recipe).length;

  const kcal = dailyNutrition?.meals?.length
    ? Math.round(dailyNutrition.totals.calories ?? 0)
    : null;

  const isHero = variant === "hero";

  return (
    <section
      className={
        isHero
          ? "alchm-panel alchm-panel-glow regmarks rounded-2xl p-4 relative overflow-hidden"
          : "alchm-panel rounded-xl p-4 relative overflow-hidden"
      }
    >
      {isHero && (
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-active-violet/10 rounded-full blur-2xl pointer-events-none" />
      )}

      {/* Header */}
      <header className="relative z-10 flex items-start justify-between gap-3 mb-4 border-b border-muted pb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`text-xl ${isHero ? "text-gold-accent" : "text-active-violet/70"}`}
            >
              {glyph}
            </span>
            <div className="min-w-0">
              <h3 className="font-headline-md text-headline-md font-bold text-primary truncate leading-tight">
                {isHero ? "Today" : getDayName(dayOfWeek)}
              </h3>
              <p className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant truncate">
                {isHero ? `${getDayName(dayOfWeek)} · ` : ""}
                {formatDateForDisplay(date)}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="px-2 py-0.5 rounded-full border border-muted bg-surface-container-low font-mono text-[10px] uppercase tracking-wider text-on-surface-variant">
            {plannedMains}/3 planned
          </span>
          {kcal !== null && (
            <span className="font-mono text-[10px] text-on-surface-variant/70">
              {kcal} KCAL
            </span>
          )}
        </div>
      </header>

      {/* Cosmic tip (hero only) */}
      {isHero && (
        <div className="relative z-10 mb-4 p-3 rounded-lg bg-surface-container-high/50 border border-on-surface/5">
          <p className="font-body-md text-[13px] text-on-surface-variant italic">
            {characteristics.mealGuidance}
          </p>
          {currentPlanetaryHour && (
            <p className="mt-1.5 font-mono text-[10px] uppercase tracking-wider text-gold-accent/80">
              ⏰ {currentPlanetaryHour} hour is weaving now
            </p>
          )}
        </div>
      )}

      {/* Meal rows */}
      <div className="relative z-10 space-y-1">
        {mains.map((m) => (
          <MealRowCard key={m.id} mealSlot={m} />
        ))}
        {snack && (snack.recipe ? (
          <MealRowCard key={snack.id} mealSlot={snack} />
        ) : (
          <MealRowCard key={snack.id} mealSlot={snack} ghost />
        ))}
      </div>
    </section>
  );
}
