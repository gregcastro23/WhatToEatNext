"use client";

/**
 * Stitch Transit Ribbon
 * The golden thread of the "Stitch" design: seven planetary day-ruler
 * medallions stitched together along a dashed gold line, one per day of the
 * viewed week. Today's medallion glows; selecting a medallion expands that
 * day inline on the calendar below.
 *
 * Styled with the menu-planner console tokens (design.md): gold-accent,
 * active-violet, surface-container ramp, on-surface text.
 *
 * @file src/components/menu-planner/StitchTransitRibbon.tsx
 * @created 2026-06-09 (v4.0 "Stitch" redesign)
 */

import React from "react";
import type { DayOfWeek } from "@/types/menuPlanner";
import {
  getPlanetaryDayCharacteristics,
  getShortDayName,
} from "@/types/menuPlanner";

/** Astronomical glyphs for the seven planetary day rulers. */
export const PLANET_GLYPHS: Record<string, string> = {
  Sun: "☉",
  Moon: "☽",
  Mars: "♂",
  Mercury: "☿",
  Jupiter: "♃",
  Venus: "♀",
  Saturn: "♄",
};

interface StitchTransitRibbonProps {
  /** The seven dates of the viewed week, index === DayOfWeek (0 = Sunday). */
  weekDates: Date[];
  /** Index of today within the viewed week, or null if today is outside it. */
  todayIndex: DayOfWeek | null;
  /** Currently expanded/selected day, or null. */
  selectedDay: DayOfWeek | null;
  onSelectDay: (day: DayOfWeek) => void;
  /** Live planetary hour ruler, shown beneath the thread when today is in view. */
  currentPlanetaryHour?: string | null;
}

export default function StitchTransitRibbon({
  weekDates,
  todayIndex,
  selectedDay,
  onSelectDay,
  currentPlanetaryHour,
}: StitchTransitRibbonProps) {
  return (
    <div className="alchm-panel rounded-xl border border-muted px-3 pt-4 pb-3 sm:px-6">
      <div className="relative">
        {/* The golden thread stitching the week together */}
        <div
          aria-hidden
          className="absolute left-1 right-1 top-[1.375rem] border-t-2 border-dashed border-gold-accent/35"
        />
        <div className="relative grid grid-cols-7 gap-1">
          {weekDates.map((date, idx) => {
            const day = idx as DayOfWeek;
            const characteristics = getPlanetaryDayCharacteristics(day);
            const isToday = todayIndex === day;
            const isSelected = selectedDay === day;
            return (
              <button
                key={day}
                type="button"
                onClick={() => onSelectDay(day)}
                aria-pressed={isSelected}
                aria-label={`${getShortDayName(day)}, ruled by ${characteristics.planet}${isToday ? " — today" : ""}`}
                title={`${characteristics.planet} day — ${characteristics.mealGuidance}`}
                className="group flex flex-col items-center gap-1.5 focus:outline-none"
              >
                <span
                  className={`relative flex h-9 w-9 items-center justify-center rounded-full border text-base transition-all sm:h-11 sm:w-11 sm:text-lg ${
                    isToday
                      ? "border-gold-accent/80 bg-gold-accent/15 text-gold-accent shadow-[0_0_18px_rgba(222,165,75,0.35)]"
                      : isSelected
                        ? "border-active-violet/70 bg-active-violet/10 text-active-violet shadow-[0_0_14px_rgba(184,90,240,0.25)]"
                        : "border-active-violet/30 bg-surface-container-low text-on-surface-variant group-hover:border-gold-accent/60 group-hover:text-gold-accent"
                  }`}
                >
                  {isToday && (
                    <span
                      aria-hidden
                      className="absolute -inset-1 animate-pulse rounded-full bg-gold-accent/10"
                    />
                  )}
                  <span className="relative">
                    {PLANET_GLYPHS[characteristics.planet] ?? "✶"}
                  </span>
                </span>
                <span
                  className={`font-mono text-[10px] font-semibold uppercase tracking-wider sm:text-[11px] ${
                    isToday
                      ? "text-gold-accent"
                      : "text-on-surface-variant group-hover:text-on-surface"
                  }`}
                >
                  {getShortDayName(day)}
                </span>
                <span
                  className={`-mt-1 font-mono text-[10px] ${
                    isToday ? "text-gold-accent/80" : "text-on-surface-variant/50"
                  }`}
                >
                  {date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {todayIndex !== null && currentPlanetaryHour && (
        <div className="mt-3 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-active-violet/25 bg-active-violet/10 px-3 py-1 font-mono text-xs text-on-surface">
            <span className="text-gold-accent">⏰</span>
            <span className="font-semibold text-gold-accent">
              {currentPlanetaryHour}
            </span>
            <span className="text-on-surface-variant">hour is weaving now</span>
          </span>
        </div>
      )}
    </div>
  );
}
