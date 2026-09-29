"use client";

/**
 * Nutrition Dashboard
 * The planned week's nutrition: totals, macro split, daily calories,
 * elemental balance and insights.
 *
 * Owner ruling 2026-09-29: the planner's "Nutrition Dashboard" button opens
 * this modal on the alchm dark surface, and only sections with a basis stay.
 * The holistic score (invented weights), Greg's Energy trend (−0.53 printed as
 * "−1", negative bars drawn empty) and the alchemical metrics (Kalchm ≈ 1, so
 * Monica is its φ fallback) were removed.
 *
 * Portalled to <body>, so no transformed or filtered ancestor can confine it.
 *
 * @file src/components/menu-planner/NutritionalDashboard.tsx
 * @created 2026-01-11 (Phase 3)
 */

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useMenuPlanner } from "@/contexts/MenuPlannerContext";
import type {
  DayOfWeek,
  MealSlot,
  NutritionalGoals,
  WeeklyMenu,
  WeeklyNutritionTotals,
} from "@/types/menuPlanner";
import { emptyDayRecord } from "@/utils/dayCircuitCalculations";
import {
  calculateMacroBreakdown,
  calculateWeeklyTotals,
  generateDailyCaloriesChartData,
  generateElementalChartData,
  generateMacroChartData,
  getNutritionalInsights,
} from "@/utils/menuPlanner/nutritionalCalculator";
import { formatCoveredTotal, nutrientNote } from "@/utils/menuPlanner/nutritionCoverage";
import { BarChart, PieChart, RadarChart } from "./NutritionCharts";
import NutritionCoverageNote from "./NutritionCoverageNote";

interface NutritionalDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  goals?: NutritionalGoals;
}

type SectionId = "overview" | "macros" | "calories" | "elemental" | "insights";

type TotalKey =
  | "totalCalories"
  | "totalProtein"
  | "totalCarbs"
  | "totalFat"
  | "totalSodium"
  | "totalSugar";

/** Sodium and sugar carry their own coverage: a recipe that does not state them adds nothing. */
const OVERVIEW: ReadonlyArray<{ label: string; key: TotalKey; unit: string; tone: string; nutrient?: "sodium" | "sugar" }> = [
  { label: "Calories", key: "totalCalories", unit: " kcal", tone: "text-active-violet" },
  { label: "Protein", key: "totalProtein", unit: "g", tone: "text-fire-spirit" },
  { label: "Carbs", key: "totalCarbs", unit: "g", tone: "text-water-essence" },
  { label: "Fat", key: "totalFat", unit: "g", tone: "text-gold-accent" },
  { label: "Sodium", key: "totalSodium", unit: "mg", tone: "text-air-substance", nutrient: "sodium" },
  { label: "Sugar", key: "totalSugar", unit: "g", tone: "text-earth-matter", nutrient: "sugar" },
];

function mealsByDayOf(menu: WeeklyMenu | null): Record<DayOfWeek, MealSlot[]> {
  const grouped = emptyDayRecord<MealSlot[]>(() => []);
  menu?.meals.forEach((meal) => {
    grouped[meal.dayOfWeek].push(meal);
  });
  return grouped;
}

function OverviewTiles({ totals }: { totals: WeeklyNutritionTotals }): React.JSX.Element {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {OVERVIEW.map(({ label, key, unit, tone, nutrient }) => {
        const coverage = nutrient ? totals.nutrientCoverage[nutrient] : totals.coverage;
        const note = nutrient ? nutrientNote(nutrient, coverage) : null;
        return (
        <div key={key} className="rounded-xl border border-muted bg-surface-container-low p-3">
          <p className="font-label-caps text-[10px] uppercase tracking-wider text-on-surface-variant">
            {label}
          </p>
          <p className={`font-mono text-xl font-bold ${tone}`}>
            {formatCoveredTotal(totals[key], coverage, unit)}
          </p>
          <p className="font-mono text-[11px] text-on-surface-variant">
            {formatCoveredTotal(totals[key] / 7, coverage, unit)}/day
          </p>
          {note && <p className="font-mono text-[11px] text-on-surface-variant">{note}</p>}
        </div>
        );
      })}
      <p className="col-span-full font-mono text-[11px] text-on-surface-variant">
        Per day = the week&apos;s total ÷ 7.
      </p>
    </div>
  );
}

function Section({
  id,
  title,
  openId,
  onToggle,
  children,
}: {
  id: SectionId;
  title: string;
  openId: SectionId | null;
  onToggle: (id: SectionId) => void;
  children: React.ReactNode;
}): React.JSX.Element {
  const open = openId === id;
  return (
    <section className="mb-3">
      <h3>
        <button
          type="button"
          onClick={() => onToggle(id)}
          aria-expanded={open}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-muted bg-surface-container-low hover:bg-surface-container-high transition-colors cursor-pointer font-label-caps text-xs uppercase tracking-wider text-on-surface"
        >
          {title}
          <span aria-hidden="true" className="text-on-surface-variant">
            {open ? "▼" : "▶"}
          </span>
        </button>
      </h3>
      {open && <div className="mt-3 rounded-xl border border-muted bg-surface-container-lowest/60 p-4">{children}</div>}
    </section>
  );
}

function useWeekNutrition(goals: NutritionalGoals | undefined): {
  totals: WeeklyNutritionTotals;
  hasMacros: boolean;
  charts: {
    macros: ReturnType<typeof generateMacroChartData>;
    calories: ReturnType<typeof generateDailyCaloriesChartData>;
    elemental: ReturnType<typeof generateElementalChartData>;
  };
  insights: string[];
} {
  const { currentMenu } = useMenuPlanner();
  return useMemo(() => {
    const totals = calculateWeeklyTotals(mealsByDayOf(currentMenu));
    const macros = calculateMacroBreakdown(totals.totalProtein / 7, totals.totalCarbs / 7, totals.totalFat / 7);
    return {
      totals,
      hasMacros: totals.totalProtein + totals.totalCarbs + totals.totalFat > 0,
      charts: {
        macros: generateMacroChartData(macros),
        calories: generateDailyCaloriesChartData(totals.dailyBreakdown, totals.dailyCoverage),
        elemental: generateElementalChartData(totals.weeklyElementalBalance),
      },
      insights: getNutritionalInsights(totals, goals),
    };
  }, [currentMenu, goals]);
}

function WeekSections({ goals }: { goals: NutritionalGoals | undefined }): React.JSX.Element {
  const { totals, hasMacros, charts, insights } = useWeekNutrition(goals);
  const [openId, setOpenId] = useState<SectionId | null>("overview");
  const toggle = (id: SectionId): void => setOpenId((current) => (current === id ? null : id));
  if (totals.coverage.planned === 0) {
    return (
      <p className="py-8 text-center text-sm text-on-surface-variant">
        No meals are planned this week yet. Plan some to see the week&apos;s nutrition.
      </p>
    );
  }
  const shared = { openId, onToggle: toggle };
  return (
    <>
      <NutritionCoverageNote coverage={totals.coverage} className="mb-3" />
      <Section id="overview" title="Weekly Overview" {...shared}>
        <OverviewTiles totals={totals} />
      </Section>
      <Section id="macros" title="Macronutrient Distribution" {...shared}>
        {hasMacros ? (
          <PieChart data={charts.macros.data} label="Share of macro energy: protein, carbs and fat" />
        ) : (
          <p className="text-sm text-on-surface-variant">No planned meal publishes protein, carbs or fat.</p>
        )}
      </Section>
      <Section id="calories" title="Daily Calories" {...shared}>
        <BarChart data={charts.calories.data} unit=" kcal" />
      </Section>
      <Section id="elemental" title="Elemental Balance" {...shared}>
        <RadarChart data={charts.elemental.data} label="Elemental balance of the planned meals" />
      </Section>
      <Section id="insights" title="Nutritional Insights" {...shared}>
        <ul className="space-y-2 text-sm text-on-surface">
          {insights.map((insight) => (
            <li key={insight} className="flex items-start gap-2">
              <span aria-hidden="true" className="text-active-violet font-bold">•</span>
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}

function DialogHeader({
  titleId,
  onClose,
}: {
  titleId: string;
  onClose: () => void;
}): React.JSX.Element {
  const closeRef = useRef<HTMLButtonElement>(null);
  // Focus starts inside the dialog, on its close button.
  useEffect(() => {
    closeRef.current?.focus();
  }, []);
  return (
    <header className="flex items-start justify-between gap-4 p-5 border-b border-muted">
      <div>
        <h2 id={titleId} className="font-display-lg text-headline-lg text-primary">
          Nutrition Dashboard
        </h2>
        <p className="mt-1 text-sm text-on-surface-variant">Totals for the meals planned this week</p>
      </div>
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Close nutrition dashboard"
        className="text-2xl leading-none text-on-surface-variant hover:text-white transition-colors cursor-pointer"
      >
        ×
      </button>
    </header>
  );
}

function DashboardDialog({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}): React.JSX.Element {
  const titleId = useId();
  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return (): void => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    // z-[70] clears the phone tab bar (z 65), as the site's other full-screen modals do.
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="alchm-panel alchm-panel-glow regmarks w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden rounded-2xl text-on-surface"
      >
        <DialogHeader titleId={titleId} onClose={onClose} />
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        <footer className="flex justify-end p-4 border-t border-muted">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-active-violet text-active-violet bg-active-violet/10 hover:bg-active-violet/20 transition-colors font-label-caps text-xs uppercase cursor-pointer active:scale-95"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}

/**
 * Main Nutritional Dashboard Component
 */
export default function NutritionalDashboard({
  isOpen,
  onClose,
  goals,
}: NutritionalDashboardProps): React.JSX.Element | null {
  if (!isOpen) return null;
  return createPortal(
    <DashboardDialog onClose={onClose}>
      <WeekSections goals={goals} />
    </DashboardDialog>,
    document.body,
  );
}
