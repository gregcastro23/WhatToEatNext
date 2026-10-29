"use client";

/**
 * PlanMyWeekButton — the planner's single primary CTA.
 * Main action fills every empty slot this week; the attached chevron opens
 * secondary auto-plan options (next day, balance nutrition, add variety).
 *
 * @file src/components/menu-planner/shell/PlanMyWeekButton.tsx
 */

import {
  CalendarPlus,
  ChevronDown,
  LoaderCircle,
  Scale,
  Shuffle,
  Sparkles,
} from "lucide-react";
import React from "react";
import { getDayName } from "@/types/menuPlanner";
import Menu from "./Menu";
import type { PlanActions } from "./usePlanActions";

export default function PlanMyWeekButton({
  actions,
  compact = false,
}: {
  actions: PlanActions;
  /** Shorter label for narrow viewports. */
  compact?: boolean;
}): React.ReactElement {
  const { busy, progressLabel, nextEmptyDay, canOptimize, hasNatalChart } = actions;
  const weekFull = nextEmptyDay === null;
  const isBusy = busy !== null;

  const label = isBusy
    ? progressLabel
    : weekFull
      ? "Week planned"
      : compact
        ? "Plan week"
        : "Plan my week";

  return (
    <div className="inline-flex rounded-full shadow-[0_0_20px_rgba(184,90,240,0.2)]">
      <button
        type="button"
        onClick={() => {
          actions.fillWeek().catch(() => {});
        }}
        disabled={isBusy || weekFull}
        title={
          weekFull
            ? "Every slot this week has a meal"
            : hasNatalChart
              ? "Fill every empty slot with meals personalized to your chart"
              : "Fill every empty slot with planetary-aligned meals"
        }
        aria-live="polite"
        className="inline-flex items-center gap-2 rounded-l-full bg-gradient-to-r from-gold-accent to-active-violet pl-4 pr-3 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-active-violet focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {isBusy ? (
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Sparkles className="h-4 w-4" aria-hidden />
        )}
        <span className="whitespace-nowrap">{label}</span>
      </button>
      <Menu
        label="More planning options"
        items={[
          {
            key: "day",
            icon: <CalendarPlus />,
            label:
              nextEmptyDay !== null
                ? `Plan ${getDayName(nextEmptyDay)}`
                : "Plan next day",
            description: "Fill just the next day with open slots",
            disabled: isBusy || weekFull,
            onSelect: () => {
              actions.fillNextDay().catch(() => {});
            },
          },
          {
            key: "balance",
            icon: <Scale />,
            label: "Balance nutrition",
            description: canOptimize
              ? "Swap a few meals to close nutrition gaps"
              : "Plan at least 3 meals first",
            disabled: isBusy || !canOptimize,
            separated: true,
            onSelect: () => {
              actions.balance().catch(() => {});
            },
          },
          {
            key: "variety",
            icon: <Shuffle />,
            label: "Add variety",
            description: canOptimize
              ? "Replace the most repetitive meals"
              : "Plan at least 3 meals first",
            disabled: isBusy || !canOptimize,
            onSelect: () => {
              actions.addVariety().catch(() => {});
            },
          },
        ]}
        trigger={(p) => (
          <button
            type="button"
            {...p}
            aria-label="More planning options"
            disabled={isBusy}
            className="inline-flex items-center rounded-r-full border-l border-background/25 bg-active-violet px-2.5 py-2 text-background transition-opacity hover:opacity-90 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-active-violet focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <ChevronDown className="h-4 w-4" aria-hidden />
          </button>
        )}
      />
    </div>
  );
}
