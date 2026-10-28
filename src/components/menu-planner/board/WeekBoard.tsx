"use client";

/**
 * WeekBoard — modern Weekly Menu Planning Board.
 *
 * Replaces the cluttered 7-column calendar with duplicate hero cards:
 *  - 7 Days × 3 Main Meal Rows (Breakfast, Lunch, Dinner)
 *  - Optional 4th Snack row (toggled from header or overflow)
 *  - Responsive: on wide screens, horizontal meal rows with day columns;
 *    tablet/desktop with horizontal scroll if needed.
 *  - Day column header with planetary ruler tooltip and Day action menu (Plan, Clear, Focus).
 *  - Seamless Day View mode (toggled via Week/Day in header).
 *  - Connects to Click-to-Place mode and drag-and-drop.
 *
 * @file src/components/menu-planner/board/WeekBoard.tsx
 */

import {
  Apple,
  Moon,
  Sun,
  Sunrise,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Ellipsis,
  Sparkles,
  Trash2,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import RecipeSelector from "@/components/menu-planner/RecipeSelector";
import RedesignedDayCard from "@/components/menu-planner/redesign/RedesignedDayCard";
import { PLANET_GLYPHS } from "@/components/menu-planner/StitchTransitRibbon";
import { useMenuPlanner } from "@/contexts/MenuPlannerContext";
import type { MonicaOptimizedRecipe } from "@/data/unified/recipeBuilding";
import type { DayOfWeek, MealSlot as MealSlotType, MealType } from "@/types/menuPlanner";
import {
  getDayName,
  getPlanetaryDayCharacteristics,
} from "@/types/menuPlanner";
import type { WeeklyNutritionResult } from "@/types/nutrition";
import type { Recipe } from "@/types/recipe";
import { formatCoveredTotal, coverageNote } from "@/utils/menuPlanner/nutritionCoverage";
import Menu from "../shell/Menu";
import { usePlannerUI } from "../shell/PlannerUIContext";
import RecipePlacementBanner from "../shell/RecipePlacementBanner";
import { useRecipePlacement } from "../shell/useRecipePlacement";
import { useUndoableClear } from "../shell/useUndoableClear";
import { useWeekDates } from "../shell/useWeekDates";
import BoardSlot from "./BoardSlot";
import MealDetailSheet from "./MealDetailSheet";

const ALL_DAYS: DayOfWeek[] = [0, 1, 2, 3, 4, 5, 6];
const MEAL_ROW_ORDER: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

const ROW_LABELS: Record<MealType, { title: string; icon: React.ReactNode }> = {
  breakfast: { title: "Breakfast", icon: <Sunrise className="h-5 w-5" aria-hidden /> },
  lunch: { title: "Lunch", icon: <Sun className="h-5 w-5" aria-hidden /> },
  dinner: { title: "Dinner", icon: <Moon className="h-5 w-5" aria-hidden /> },
  snack: { title: "Snack", icon: <Apple className="h-5 w-5" aria-hidden /> },
};

interface WeekBoardProps {
  onCopyMeal: (slot: MealSlotType) => void;
  weeklyNutrition?: WeeklyNutritionResult | null;
}

function isDayOfWeek(val: number): val is DayOfWeek {
  return val >= 0 && val <= 6 && Number.isInteger(val);
}

export default function WeekBoard({
  onCopyMeal,
  weeklyNutrition,
}: WeekBoardProps): React.ReactElement {
  const {
    currentMenu,
    addMealToSlot,
    generateMealsForDay,
    moveMeal,
    swapMeals,
  } = useMenuPlanner();
  const ui = usePlannerUI();
  const { state } = ui;
  const { weekDates, todayDayOfWeek } = useWeekDates();
  const { clearDayWithUndo, removeMealWithUndo } = useUndoableClear();

  const [detailSlotId, setDetailSlotId] = useState<string | null>(null);
  const selectedSlotForDetail = currentMenu?.meals.find((slot) => slot.id === detailSlotId) ?? null;
  const { placeRecipe } = useRecipePlacement();
  const [selectorSlot, setSelectorSlot] = useState<MealSlotType | null>(null);
  const [generatingSlotId, setGeneratingSlotId] = useState<string | null>(null);

  // Group meals by day & meal type for O(1) lookups
  const slotMap = useMemo(() => {
    const map = new Map<string, MealSlotType>();
    if (!currentMenu) return map;
    for (const meal of currentMenu.meals) {
      map.set(`${meal.dayOfWeek}-${meal.mealType}`, meal);
    }
    return map;
  }, [currentMenu]);

  // Which rows to show (snack is conditional on showSnacks)
  const activeMealTypes = useMemo(() => state.showSnacks ? MEAL_ROW_ORDER : MEAL_ROW_ORDER.filter((t) => t !== "snack"), [state.showSnacks]);

  // Handle single slot auto-suggest
  const handleSuggestSlot = async (slot: MealSlotType) => {
    setGeneratingSlotId(slot.id);
    try {
      await generateMealsForDay(slot.dayOfWeek, {
        mealTypes: [slot.mealType],
        useCurrentPlanetary: true,
      });
      ui.notify(`Suggested meal for ${getDayName(slot.dayOfWeek)} ${slot.mealType}`);
    } catch {
      ui.notify("Failed to suggest meal");
    } finally {
      setGeneratingSlotId(null);
    }
  };

  // Handle drag-and-drop from other slots or external
  const handleDropSlotToSlot = async (sourceId: string, targetSlot: MealSlotType) => {
    if (targetSlot.recipe) {
      await swapMeals(sourceId, targetSlot.id);
    } else {
      await moveMeal(sourceId, targetSlot.id);
    }
  };

  const handleDropRecipe = async (recipe: MonicaOptimizedRecipe, targetSlot: MealSlotType) => {
    await addMealToSlot(targetSlot.dayOfWeek, targetSlot.mealType, recipe);
    ui.notify(`Added "${recipe.name}" to ${getDayName(targetSlot.dayOfWeek)} ${targetSlot.mealType}`);
  };

  // ─── Single Day View Mode ────────────────────────────────────────────────
  if (state.view === "day") {
    const activeDay = state.focusDay ?? todayDayOfWeek ?? (0);
    const dayMeals = currentMenu?.meals.filter((m) => m.dayOfWeek === activeDay) ?? [];
    const prevShift = (activeDay - 1 + 7) % 7;
    const prevDay = isDayOfWeek(prevShift) ? prevShift : 0;
    const nextShift = (activeDay + 1) % 7;
    const nextDay = isDayOfWeek(nextShift) ? nextShift : 0;

    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        <RecipePlacementBanner />
        {/* Day View Navigation Header */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-muted bg-surface-container-low">
          <button
            type="button"
            onClick={() => ui.setFocusDay(prevDay)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-muted bg-surface-container-high hover:border-active-violet text-xs font-mono uppercase text-on-surface hover:text-primary transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>{getDayName(prevDay)}</span>
          </button>

          <div className="text-center">
            <h2 className="text-base font-bold text-primary font-headline-md">
              {getDayName(activeDay)}
            </h2>
            <p className="text-xs text-on-surface-variant font-mono">
              {weekDates[activeDay]?.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </p>
          </div>

          <button
            type="button"
            onClick={() => ui.setFocusDay(nextDay)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-muted bg-surface-container-high hover:border-active-violet text-xs font-mono uppercase text-on-surface hover:text-primary transition-all"
          >
            <span>{getDayName(nextDay)}</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Day Card */}
        <RedesignedDayCard
          variant="hero"
          placingRecipe={state.placingRecipe}
          onPlaceMeal={(slot) => { void placeRecipe(slot); }}
          showSnacks={state.showSnacks}
          dayOfWeek={activeDay}
          date={weekDates[activeDay]}
          meals={dayMeals}
          {...(weeklyNutrition?.days?.[activeDay] ? { dailyNutrition: weeklyNutrition.days[activeDay] } : {})}
        />
      </div>
    );
  }

  // ─── Weekly Grid View Mode ───────────────────────────────────────────────
  return (
    <div className="space-y-3">
      <RecipePlacementBanner />

      {/* Grid Container */}
      <div className="overflow-x-auto no-scrollbar rounded-2xl border border-muted bg-surface shadow-sm">
        <div role="grid" aria-label="Weekly meal plan" tabIndex={-1} className="min-w-[900px]" onKeyDown={(event) => {
          const delta = { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0] }[event.key];
          if (!delta || !(event.target instanceof HTMLElement)) return;
          const cell = event.target.closest<HTMLElement>("[data-board-day]");
          if (!cell) return;
          const row = Number(cell.dataset.boardRow) + delta[0]!;
          const day = Number(cell.dataset.boardDay) + delta[1]!;
          const next = event.currentTarget.querySelector<HTMLButtonElement>(`[data-board-row="${row}"][data-board-day="${day}"] button:not(:disabled)`);
          if (next) { event.preventDefault(); next.focus(); }
        }}>
          {/* Table Header: Days of the week */}
          <div role="row" className="grid grid-cols-[100px_repeat(7,1fr)] border-b border-muted bg-surface-container-low/70">
            <div role="rowheader" className="p-3 border-r border-muted flex items-center justify-center font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">
              Meal
            </div>

            {ALL_DAYS.map((day) => {
              const characteristics = getPlanetaryDayCharacteristics(day);
              const glyph = PLANET_GLYPHS[characteristics.planet] ?? "✶";
              const isToday = day === todayDayOfWeek;
              const date = weekDates[day];
              const dateStr = date ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";

              return (
                <div
                  role="columnheader"
                  key={day}
                  className={`p-2.5 border-r border-muted last:border-r-0 flex flex-col justify-between ${
                    isToday ? "bg-active-violet/5" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span
                          className={`text-sm ${isToday ? "text-gold-accent" : "text-on-surface-variant"}`}
                          title={`Ruled by ${characteristics.planet}: ${characteristics.description}`}
                        >
                          {glyph}
                        </span>
                        <span className="font-semibold text-xs text-primary truncate">
                          {getDayName(day).slice(0, 3)}
                        </span>
                        {isToday && (
                          <span className="bg-active-violet text-background text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                            TODAY
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-on-surface-variant font-mono block">
                        {dateStr}
                      </span>
                    </div>

                    {/* Day Action Menu */}
                    <Menu
                      label={`${getDayName(day)} actions`}
                      items={[
                        {
                          key: "focus",
                          icon: <Sparkles />,
                          label: `Focus ${getDayName(day)}`,
                          onSelect: () => ui.setView("day", day),
                        },
                        {
                          key: "generate",
                          icon: <CalendarPlus />,
                          label: "Auto-plan day",
                          onSelect: () => {
                            generateMealsForDay(day, { mealTypes: activeMealTypes, useCurrentPlanetary: true }).catch(() => ui.notify("Could not plan that day"));
                          },
                        },
                        {
                          key: "clear",
                          icon: <Trash2 />,
                          label: "Clear day",
                          tone: "danger",
                          onSelect: () => clearDayWithUndo(day),
                        },
                      ]}
                      trigger={(p) => (
                        <button
                          type="button"
                          {...p}
                          aria-label={`${getDayName(day)} actions`}
                          className="p-1 rounded-md text-on-surface-variant/60 hover:text-primary hover:bg-surface-container-high transition-colors"
                        >
                          <Ellipsis className="h-3.5 w-3.5" />
                        </button>
                      )}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Meal Rows */}
          {activeMealTypes.map((mealType) => {
            const meta = ROW_LABELS[mealType];

            return (
              <div
                role="row"
                key={mealType}
                className="grid grid-cols-[100px_repeat(7,1fr)] border-b border-muted last:border-b-0 min-h-[110px]"
              >
                {/* Row Header */}
                <div role="rowheader" className="p-3 border-r border-muted bg-surface-container-low/40 flex flex-col justify-center items-center text-center">
                  <span className="text-lg mb-1">{meta.icon}</span>
                  <span className="text-xs font-semibold text-primary capitalize font-headline-md">
                    {meta.title}
                  </span>
                </div>

                {/* Day Slots */}
                {ALL_DAYS.map((day) => {
                  const slotKey = `${day}-${mealType}`;
                  const slot = slotMap.get(slotKey);
                  const isToday = day === todayDayOfWeek;

                  if (!slot) {
                    return (
                      <div
                        role="gridcell"
                      key={slotKey}
                        className={`p-2 border-r border-muted last:border-r-0 ${
                          isToday ? "bg-active-violet/[0.02]" : ""
                        }`}
                      />
                    );
                  }

                  return (
                    <div
                      role="gridcell"
                      key={slotKey}
                      data-board-day={day}
                      data-board-row={activeMealTypes.indexOf(mealType)}
                      className={`p-1.5 border-r border-muted last:border-r-0 ${
                        isToday ? "bg-active-violet/[0.02]" : ""
                      }`}
                    >
                      <BoardSlot
                        slot={slot}
                        isToday={isToday}
                        placingRecipe={state.placingRecipe}
                        isGenerating={generatingSlotId === slot.id}
                        onOpen={() => setDetailSlotId(slot.id)}
                        onPickRecipe={() => setSelectorSlot(slot)}
                        onSuggest={() => { void handleSuggestSlot(slot); }}
                        onPlace={() => { void placeRecipe(slot); }}
                        onCopy={() => onCopyMeal(slot)}
                        onRemove={() => removeMealWithUndo(slot)}
                        onDropSlot={(sourceId) => { void handleDropSlotToSlot(sourceId, slot).catch(() => ui.notify("Could not move that meal")); }}
                        onDropRecipe={(recipe) => { void handleDropRecipe(recipe, slot).catch(() => ui.notify("Could not add that recipe")); }}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* Board Footer Row: Daily calorie sums */}
          <div role="row" className="grid grid-cols-[100px_repeat(7,1fr)] bg-surface-container-low/50 font-mono text-[11px] border-t border-muted">
            <div role="rowheader" className="p-2 border-r border-muted text-center text-on-surface-variant uppercase text-[10px] flex items-center justify-center">
              Day Totals
            </div>
            {ALL_DAYS.map((day) => {
              const dayNut = weeklyNutrition?.days?.[day];
              const cal = dayNut?.coverage.planned ? formatCoveredTotal(dayNut.totals.calories ?? 0, dayNut.coverage) : null;

              return (
                <div
                  role="gridcell"
                  key={day}
                  className="p-2 border-r border-muted last:border-r-0 text-center text-on-surface-variant font-mono"
                >
                  {cal !== null ? `${cal} kcal` : "—"}
                  {dayNut && <span className="block text-[9px]">{coverageNote(dayNut.coverage)}</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Slot Modal Sheet */}
      {selectedSlotForDetail && (
        <MealDetailSheet
          slot={selectedSlotForDetail}
          onRemove={removeMealWithUndo}
          onClose={() => setDetailSlotId(null)}
          onCopyMeal={(s) => onCopyMeal(s)}
          onReplace={(s) => setSelectorSlot(s)}
        />
      )}

      {/* Recipe Selector Modal for empty slot */}
      {selectorSlot && (
        <RecipeSelector
          isOpen={Boolean(selectorSlot)}
          onClose={() => setSelectorSlot(null)}
          onSelectRecipe={async (recipe: Recipe) => {
            try {
            await addMealToSlot(
              selectorSlot.dayOfWeek,
              selectorSlot.mealType,
              recipe,
            );
            setSelectorSlot(null);
            ui.notify(`Added "${recipe.name}" to ${getDayName(selectorSlot.dayOfWeek)}`);
            } catch { ui.notify("Could not add recipe. Try again."); }
          }}
          filters={{
            mealType: selectorSlot.mealType,
            dayOfWeek: selectorSlot.dayOfWeek,
            planetarySnapshot: selectorSlot.planetarySnapshot,
          }}
        />
      )}
    </div>
  );
}
