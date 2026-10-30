"use client";

/**
 * PlannerHeader — compact planner header.
 *
 * Row 1: title (+ live-sync badge) · Recipes rail toggle · Shop · the single
 *        primary "Plan my week" CTA · ⋯ overflow (secondary tools).
 * Row 2: week switcher · Week/Day view toggle · context chips.
 *
 * Replaces the legacy Quick Actions toolbar + Tools bar (≈21 buttons).
 *
 * @file src/components/menu-planner/shell/PlannerHeader.tsx
 */

import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Ellipsis,
  Eye,
  EyeOff,
  Moon,
  PanelRight,
  Save,
  Share2,
  ShoppingBag,
  SlidersHorizontal,
  Trash2,
  Users,
} from "lucide-react";
import React from "react";
import { useMenuPlanner } from "@/contexts/MenuPlannerContext";
import ContextChips from "./ContextChips";
import Menu from "./Menu";
import PlanMyWeekButton from "./PlanMyWeekButton";
import { usePlannerUI } from "./PlannerUIContext";
import { useUndoableClear } from "./useUndoableClear";
import { useWeekDates } from "./useWeekDates";
import type { PlanActions } from "./usePlanActions";

export interface PlannerSyncInfo {
  live: boolean;
  liveSlotCount: number;
  unappliedRemoteSlots: number;
}

const ICON_BTN =
  "inline-flex items-center justify-center gap-2 rounded-full border border-muted px-3.5 py-2 text-sm text-on-surface transition-colors hover:border-active-violet/50 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-active-violet";

export default function PlannerHeader({
  actions,
  sync,
  onShop,
  onShare,
}: {
  actions: PlanActions;
  sync: PlannerSyncInfo;
  onShop: () => void;
  onShare: () => void;
}): React.ReactElement {
  const { navigation, currentMenu, syncWithLunarCycle, toggleSyncWithLunarCycle } =
    useMenuPlanner();
  const ui = usePlannerUI();
  const { state } = ui;
  const { rangeLabel, todayDayOfWeek } = useWeekDates();
  const { clearWeekWithUndo } = useUndoableClear();
  const hasMeals = (currentMenu?.meals ?? []).some((m) => m.recipe);

  return (
    <header className="mb-4 space-y-3">
      {/* Row 1 — title + actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="font-display-lg text-3xl md:text-4xl text-primary leading-tight">
            Weekly Menu
          </h1>
          {sync.live && (
            <span
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-gold-accent/30 bg-gold-accent/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-gold-accent"
              title={
                sync.unappliedRemoteSlots > 0
                  ? `Syncing in real time. ${sync.unappliedRemoteSlots} slot(s) planned on another device are still loading.`
                  : "Your plan syncs across devices in real time"
              }
            >
              <span className="h-1.5 w-1.5 rounded-full bg-gold-accent animate-pulse" aria-hidden />
              Synced
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={ui.toggleRail}
            aria-label="Recipes"
            aria-pressed={state.railOpen}
            className={`${ICON_BTN} ${
              state.railOpen ? "border-active-violet/50 text-active-violet bg-active-violet/10" : ""
            }`}
          >
            <PanelRight className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Recipes</span>
          </button>
          <button type="button" onClick={onShop} className={`${ICON_BTN} hidden md:inline-flex`}>
            <ShoppingBag className="h-4 w-4" aria-hidden />
            Shop
          </button>
          <PlanMyWeekButton actions={actions} />
          <Menu
            label="More planner tools"
            items={[
              {
                key: "settings",
                icon: <SlidersHorizontal />,
                label: "Plan settings",
                description: "Diet, nutrition goals, budget, guests",
                onSelect: () => ui.openSettings(),
              },
              {
                key: "nutrition",
                icon: <BarChart3 />,
                label: "Nutrition Dashboard",
                onSelect: () => ui.openModal("nutrition"),
              },
              {
                key: "snacks",
                icon: state.showSnacks ? <EyeOff /> : <Eye />,
                label: state.showSnacks ? "Hide snack row" : "Show snack row",
                onSelect: () => ui.setShowSnacks(!state.showSnacks),
              },
              {
                key: "lunar",
                icon: <Moon />,
                label: `Lunar sync: ${syncWithLunarCycle ? "on" : "off"}`,
                description: "Weight suggestions by the moon phase",
                onSelect: toggleSyncWithLunarCycle,
              },
              {
                key: "guests",
                icon: <Users />,
                label: "Guests",
                description: "Plan around saved charts",
                onSelect: () => ui.openSettings("guests"),
              },
              {
                key: "template",
                icon: <Save />,
                label: "Save as template",
                separated: true,
                disabled: !hasMeals,
                onSelect: () => ui.openModal("template"),
              },
              {
                key: "share",
                icon: <Share2 />,
                label: "Share to feed",
                disabled: !hasMeals,
                onSelect: onShare,
              },
              {
                key: "clear",
                icon: <Trash2 />,
                label: "Clear week",
                tone: "danger",
                separated: true,
                disabled: !hasMeals,
                onSelect: clearWeekWithUndo,
              },
            ]}
            trigger={(p) => (
              <button
                type="button"
                {...p}
                aria-label="More planner tools"
                className={`${ICON_BTN} px-2.5`}
              >
                <Ellipsis className="h-4 w-4" aria-hidden />
              </button>
            )}
          />
        </div>
      </div>

      {/* Row 2 — week switcher, view toggle, context chips */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <nav aria-label="Week" className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => navigation?.goToPreviousWeek?.()}
            aria-label="Previous week"
            disabled={actions.busy !== null}
            className="rounded-full p-1.5 text-on-surface-variant hover:bg-on-surface/5 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-active-violet"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <span className="min-w-[10.5rem] text-center font-mono text-sm text-on-surface" aria-live="polite">
            {rangeLabel}
          </span>
          <button
            type="button"
            onClick={() => navigation?.goToNextWeek?.()}
            aria-label="Next week"
            disabled={actions.busy !== null}
            className="rounded-full p-1.5 text-on-surface-variant hover:bg-on-surface/5 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-active-violet"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
          {todayDayOfWeek === null && (
            <button
              type="button"
              disabled={actions.busy !== null}
              onClick={() => navigation?.goToCurrentWeek?.()}
              className="ml-1 rounded-full border border-muted px-2.5 py-0.5 text-xs text-active-violet hover:border-active-violet/50"
            >
              This week
            </button>
          )}
        </nav>

        {/* Week / Day toggle (tablet+; phones always get the day-card list) */}
        <div
          role="radiogroup"
          aria-label="Planner view"
          className="hidden md:inline-flex rounded-full border border-muted p-0.5"
        >
          {(["week", "day"] as const).map((v) => (
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={state.view === v}
              onClick={() =>
                ui.setView(v, v === "day" ? (state.focusDay ?? todayDayOfWeek ?? 0) : undefined)
              }
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
                state.view === v
                  ? "bg-active-violet/20 text-active-violet"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        <ContextChips className="md:ml-auto" />
      </div>
    </header>
  );
}
