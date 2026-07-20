"use client";

/**
 * ProfileWeekFixture — a compact, embeddable "this week" fixture for
 * alchm.kitchen profile pages. Two variants share one visual language:
 *  - "user":  the signed-in user's own week, interactive (day tiles link to
 *             the full planner).
 *  - "agent": a Planetary Agent's authored week, read-only, with an
 *             "Adopt this week" action.
 * Renders a condensed 7-day (Sun→Sat) row of tiles; each tile shows the day's
 * ruling-planet glyph and three main-meal dots (filled + element-colored when
 * planned, hollow when empty).
 *
 * @file src/components/menu-planner/redesign/ProfileWeekFixture.tsx
 */

import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import type { DayOfWeek, MealSlot as MealSlotType, MealType } from "@/types/menuPlanner";
import {
  getPlanetaryDayCharacteristics,
  getShortDayName,
} from "@/types/menuPlanner";
import { PLANET_GLYPHS } from "../StitchTransitRibbon";
import { dominantElement, ELEMENT_DOT } from "./elementUtils";

const MAIN_TYPES: MealType[] = ["breakfast", "lunch", "dinner"];
const ALL_DAYS: DayOfWeek[] = [0, 1, 2, 3, 4, 5, 6];

function DayTile({
  day,
  meals,
  isToday,
}: {
  day: DayOfWeek;
  meals: MealSlotType[];
  isToday: boolean;
}) {
  const glyph = PLANET_GLYPHS[getPlanetaryDayCharacteristics(day).planet] ?? "✶";
  const mains = MAIN_TYPES.map((t) => meals.find((m) => m.mealType === t));

  return (
    <div className="flex flex-col items-center gap-1.5">
      <span
        className={`text-sm ${isToday ? "text-gold-accent" : "text-active-violet/60"}`}
      >
        {glyph}
      </span>
      <span
        className={`font-mono text-[9px] uppercase tracking-wider ${
          isToday ? "text-gold-accent" : "text-on-surface-variant/70"
        }`}
      >
        {getShortDayName(day).slice(0, 1)}
      </span>
      <div className="flex flex-col gap-1 mt-0.5">
        {mains.map((slot, i) => {
          const el = dominantElement(slot?.recipe?.elementalProperties);
          const planned = !!slot?.recipe;
          return (
            <span
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${
                planned
                  ? el
                    ? ELEMENT_DOT[el]
                    : "bg-active-violet"
                  : "border border-on-surface-variant/25"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function ProfileWeekFixture({
  meals,
  variant,
  title,
  updatedLabel,
  planetaryFocus,
  onAdopt,
  href = "/menu-planner",
  todayDayOfWeek = null,
}: {
  meals: MealSlotType[];
  variant: "user" | "agent";
  title: string;
  /** Agent variant: "UPDATED 2H AGO"-style freshness stamp. */
  updatedLabel?: string;
  /** Agent variant: e.g. "Saturn focus · grounding". */
  planetaryFocus?: string;
  /** Agent variant: adopt this week into the viewer's planner. */
  onAdopt?: () => void;
  /** User variant: where day tiles link (defaults to the planner). */
  href?: string;
  todayDayOfWeek?: DayOfWeek | null;
}) {
  const mealsByDay: Record<DayOfWeek, MealSlotType[]> = {
    0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [],
  };
  meals.forEach((m) => {
    if (mealsByDay[m.dayOfWeek]) mealsByDay[m.dayOfWeek].push(m);
  });

  const plannedMains = meals.filter(
    (m) => m.recipe && m.mealType !== "snack",
  ).length;

  const grid = (
    <div className="grid grid-cols-7 gap-1">
      {ALL_DAYS.map((day) => (
        <DayTile
          key={day}
          day={day}
          meals={mealsByDay[day] ?? []}
          isToday={day === todayDayOfWeek}
        />
      ))}
    </div>
  );

  return (
    <section className="alchm-panel rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="min-w-0">
          <h3 className="font-headline-md text-[18px] font-bold text-primary truncate">
            {title}
          </h3>
          {variant === "agent" && (updatedLabel || planetaryFocus) && (
            <p className="font-mono text-[9px] uppercase tracking-wider text-on-surface-variant/70 truncate">
              {[updatedLabel, planetaryFocus].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-on-surface-variant">
          {plannedMains}/21 planned
        </span>
      </div>

      {/* 7-day tiles — interactive (link) for the user's own week */}
      {variant === "user" ? (
        <Link href={href} className="block group" aria-label="Open the weekly planner">
          {grid}
        </Link>
      ) : (
        grid
      )}

      {/* Footer action */}
      <div className="mt-3 pt-3 border-t border-muted flex items-center justify-between">
        {variant === "user" ? (
          <Link
            href={href}
            className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-active-violet hover:text-primary transition-colors"
          >
            Open planner <ArrowRight className="h-3 w-3" />
          </Link>
        ) : (
          <button
            type="button"
            onClick={onAdopt}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-gold-accent to-active-violet text-background font-mono text-[10px] uppercase tracking-wider font-bold active:scale-[0.98] transition-transform"
          >
            <Sparkles className="h-3 w-3" /> Adopt this week
          </button>
        )}
      </div>
    </section>
  );
}
