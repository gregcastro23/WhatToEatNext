"use client";

/**
 * ElementalHarmonyModal — interactive modal and inspector for weekly & daily
 * elemental harmony and astrological planetary resonance.
 *
 * @file src/components/menu-planner/modals/ElementalHarmonyModal.tsx
 */

import { Flame, Sparkles, Wind, Droplets, Mountain } from "lucide-react";
import React, { useMemo } from "react";
import { useMenuPlanner } from "@/contexts/MenuPlannerContext";
import type { DayOfWeek, MealSlot } from "@/types/menuPlanner";
import { getDayName } from "@/types/menuPlanner";
import { PLANETARY_DAY_RULERS } from "@/utils/planetaryDayRecommendations";
import { readElemental, type ElementName, ELEMENT_TEXT } from "../redesign/elementUtils";
import Sheet from "../shell/Sheet";
import { useWeekDates } from "../shell/useWeekDates";

const ALL_DAYS: DayOfWeek[] = [0, 1, 2, 3, 4, 5, 6];
const ALL_ELEMENTS: ElementName[] = ["Fire", "Water", "Earth", "Air"];

const ELEMENT_ICONS: Record<ElementName, React.ReactNode> = {
  Fire: <Flame className="h-4 w-4 text-fire-spirit" aria-hidden />,
  Water: <Droplets className="h-4 w-4 text-water-essence" aria-hidden />,
  Earth: <Mountain className="h-4 w-4 text-earth-matter" aria-hidden />,
  Air: <Wind className="h-4 w-4 text-air-substance" aria-hidden />,
};

const ELEMENT_EXPLANATIONS: Record<ElementName, { principle: string; foods: string }> = {
  Fire: {
    principle: "Metabolic vitality, digestive heat, and dynamic energy.",
    foods: "Warming spices, ginger, roasted peppers, garlic, rosemary.",
  },
  Water: {
    principle: "Cellular hydration, soothing recovery, and fluid balance.",
    foods: "Simmered broths, melons, cucumbers, leafy greens, cooling teas.",
  },
  Earth: {
    principle: "Physical grounding, mineral density, and steady satiety.",
    foods: "Root vegetables, lentils, whole grains, seeds, hearty squashes.",
  },
  Air: {
    principle: "Mental clarity, digestive lightness, and active movement.",
    foods: "Fresh bitter greens, crisp sprouts, herbs, citrus, fermented items.",
  },
};

interface DailyBreakdownItem {
  day: DayOfWeek;
  date: Date | null;
  planet: string;
  rulerElement: ElementName;
  dominant: ElementName | null;
  totalPlanned: number;
  isResonant: boolean;
  dist: Record<ElementName, number>;
}

function computeDailyBreakdown(meals: MealSlot[] | undefined, weekDates: Date[]): DailyBreakdownItem[] {
  return ALL_DAYS.map((day) => {
    const ruler = PLANETARY_DAY_RULERS[day];
    const dayMeals = meals?.filter((m) => m.dayOfWeek === day && m.recipe) ?? [];
    const sum = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
    for (const meal of dayMeals) {
      if (!meal.recipe?.elementalProperties) continue;
      const e = readElemental(meal.recipe.elementalProperties);
      sum.Fire += e.Fire;
      sum.Water += e.Water;
      sum.Earth += e.Earth;
      sum.Air += e.Air;
    }
    const totalWeight = sum.Fire + sum.Water + sum.Earth + sum.Air;
    const dist: Record<ElementName, number> = {
      Fire: totalWeight > 0 ? sum.Fire / totalWeight : 0.25,
      Water: totalWeight > 0 ? sum.Water / totalWeight : 0.25,
      Earth: totalWeight > 0 ? sum.Earth / totalWeight : 0.25,
      Air: totalWeight > 0 ? sum.Air / totalWeight : 0.25,
    };
    let dominant: ElementName | null = null;
    if (dayMeals.length > 0 && totalWeight > 0) {
      let maxVal = -1;
      for (const el of ALL_ELEMENTS) {
        if (dist[el] > maxVal) {
          maxVal = dist[el];
          dominant = el;
        }
      }
    }
    return {
      day,
      date: weekDates[day] ?? null,
      planet: ruler.planet,
      rulerElement: ruler.element,
      dominant,
      totalPlanned: dayMeals.length,
      isResonant: dominant === ruler.element,
      dist,
    };
  });
}

function computeGuidance(totalMeals: number, dist: Record<ElementName, number>): string {
  if (totalMeals === 0) {
    return "Plan meals across the week to compute personalized culinary alchemy recommendations.";
  }
  const entries = ALL_ELEMENTS.map((el) => ({ el, val: dist[el] })).sort((a, b) => a.val - b.val);
  const [lowest] = entries;
  const highest = entries[entries.length - 1];
  if (!lowest || !highest) return "";
  const lowPct = Math.round(lowest.val * 100);
  const highPct = Math.round(highest.val * 100);
  if (highPct - lowPct <= 14) {
    return `Exceptional Alchemical Equilibrium! Your planned week maintains a harmonious distribution across all four elements (low ${lowest.el} at ${lowPct}%, high ${highest.el} at ${highPct}%).`;
  }
  return `Elemental Adjustment Recommended: Your plan is enriched with ${highest.el} (${highPct}%) while ${lowest.el} is lower (${lowPct}%). Incorporate ${ELEMENT_EXPLANATIONS[lowest.el].foods.toLowerCase()} to restore culinary harmony.`;
}

function DailyResonanceRow({ row }: { row: DailyBreakdownItem }): React.JSX.Element {
  const dateStr = row.date ? row.date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";
  return (
    <div className="p-3 rounded-xl border border-muted bg-surface-container-low/70 flex items-center justify-between gap-3 text-xs">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-primary font-mono">{getDayName(row.day)}</span>
          <span className="text-[11px] text-on-surface-variant font-mono">{dateStr}</span>
          <span className="text-[11px] text-on-surface-variant">
            · Ruled by <strong className="text-primary">{row.planet}</strong> ({row.rulerElement})
          </span>
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <div className="flex w-24 h-1.5 rounded-full overflow-hidden bg-surface-container-high">
            <div className="bg-fire-spirit h-full" style={{ width: `${Math.round(row.dist.Fire * 100)}%` }} />
            <div className="bg-water-essence h-full" style={{ width: `${Math.round(row.dist.Water * 100)}%` }} />
            <div className="bg-earth-matter h-full" style={{ width: `${Math.round(row.dist.Earth * 100)}%` }} />
            <div className="bg-air-substance h-full" style={{ width: `${Math.round(row.dist.Air * 100)}%` }} />
          </div>
          <span className="text-[10px] text-on-surface-variant font-mono">
            {row.totalPlanned > 0 ? `${row.totalPlanned} meal${row.totalPlanned > 1 ? "s" : ""} · ` : "No meals planned"}
            {row.dominant && <span className={`font-semibold capitalize ${ELEMENT_TEXT[row.dominant]}`}>{row.dominant}</span>}
          </span>
        </div>
      </div>
      <div className="shrink-0 text-right">
        {row.totalPlanned === 0 ? (
          <span className="text-[10px] font-mono text-on-surface-variant/60">Open Slot</span>
        ) : row.isResonant ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-gold-accent/15 border border-gold-accent/30 text-gold-accent">
            <span>✦</span> Resonant
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-surface-container-high border border-muted text-on-surface-variant">
            Complementary
          </span>
        )}
      </div>
    </div>
  );
}

function WeeklyMeter({ dist, totalMeals }: { dist: Record<ElementName, number>; totalMeals: number }): React.JSX.Element {
  return (
    <div className="p-4 rounded-xl border border-muted bg-surface-container-low space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-wider text-on-surface-variant font-bold">Weekly Elemental Distribution</span>
        <span className="font-mono text-xs text-primary font-semibold">{totalMeals} Meals Analyzed</span>
      </div>
      <div className="flex w-full h-3 rounded-full overflow-hidden bg-surface-container-high">
        {ALL_ELEMENTS.map((el) => {
          const pct = totalMeals > 0 ? Math.round(dist[el] * 100) : 25;
          const barClass = { Fire: "bg-fire-spirit", Water: "bg-water-essence", Earth: "bg-earth-matter", Air: "bg-air-substance" }[el];
          return <div key={el} className={`${barClass} h-full transition-all duration-300`} style={{ width: `${Math.max(2, pct)}%` }} title={`${el}: ${pct}%`} />;
        })}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        {ALL_ELEMENTS.map((el) => {
          const pct = totalMeals > 0 ? Math.round(dist[el] * 100) : 0;
          return (
            <div key={el} className="p-2.5 rounded-lg border border-muted/60 bg-surface-container/60 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold text-xs">{ELEMENT_ICONS[el]}<span className={ELEMENT_TEXT[el]}>{el}</span></span>
                <span className="font-mono text-xs font-bold text-primary">{pct}%</span>
              </div>
              <p className="text-[10px] text-on-surface-variant line-clamp-2 leading-tight">{ELEMENT_EXPLANATIONS[el].principle}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export interface ElementalHarmonyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ElementalHarmonyModal({ isOpen, onClose }: ElementalHarmonyModalProps): React.JSX.Element | null {
  const { currentMenu, weeklyStats } = useMenuPlanner();
  const { weekDates } = useWeekDates();
  const dist = useMemo<Record<ElementName, number>>(() => readElemental(weeklyStats?.elementalDistribution ?? null), [weeklyStats?.elementalDistribution]);
  const totalMeals = weeklyStats?.totalMeals ?? 0;
  const dailyBreakdown = useMemo(() => computeDailyBreakdown(currentMenu?.meals, weekDates), [currentMenu?.meals, weekDates]);
  const guidance = useMemo(() => computeGuidance(totalMeals, dist), [totalMeals, dist]);

  if (!isOpen) return null;
  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => { if (!open) onClose(); }}
      title="Elemental Harmony & Astrological Resonance"
      description="Holistic balance of Fire, Water, Earth, and Air across your planned week."
      width="max-w-2xl"
      footer={<div className="flex justify-end"><button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-primary font-mono text-xs uppercase font-semibold transition-colors">Close</button></div>}
    >
      <div className="space-y-6">
        <WeeklyMeter dist={dist} totalMeals={totalMeals} />
        <div className="p-4 rounded-xl border border-gold-accent/30 bg-gold-accent/5 space-y-1.5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-gold-accent" />
            <h4 className="font-mono text-xs font-bold text-gold-accent uppercase tracking-wider">Alchemical Culinary Guidance</h4>
          </div>
          <p className="text-xs text-on-surface leading-relaxed">{guidance}</p>
        </div>
        <div className="space-y-3">
          <h4 className="font-mono text-xs uppercase tracking-wider text-on-surface-variant font-bold">Daily Planetary Resonance (Mon – Sun)</h4>
          <div className="space-y-2">
            {dailyBreakdown.map((row) => (
              <DailyResonanceRow key={row.day} row={row} />
            ))}
          </div>
        </div>
      </div>
    </Sheet>
  );
}
