"use client";

/**
 * useUndoableClear — clear a day or the whole week, with an Undo toast
 * instead of a blocking `window.confirm`. The cleared meals are snapshotted
 * (recipe, servings, lock) and re-added slot-by-slot on undo.
 *
 * @file src/components/menu-planner/shell/useUndoableClear.ts
 */

import { useCallback, useRef } from "react";
import { useMenuPlanner } from "@/contexts/MenuPlannerContext";
import type { DayOfWeek, MealSlot } from "@/types/menuPlanner";
import { getDayName } from "@/types/menuPlanner";
import { usePlannerUI } from "./PlannerUIContext";

interface Snapshot {
  dayOfWeek: DayOfWeek;
  mealType: MealSlot["mealType"];
  recipe: NonNullable<MealSlot["recipe"]>;
  servings: number;
  locked: boolean;
}

function snapshot(meals: MealSlot[]): Snapshot[] {
  return meals
    .filter((m): m is MealSlot & { recipe: NonNullable<MealSlot["recipe"]> } =>
      Boolean(m.recipe),
    )
    .map((m) => ({
      dayOfWeek: m.dayOfWeek,
      mealType: m.mealType,
      recipe: m.recipe,
      servings: m.servings,
      locked: m.isLocked ?? false,
    }));
}

export function useUndoableClear(): {
  clearWeekWithUndo: () => void;
  clearDayWithUndo: (day: DayOfWeek) => void;
  removeMealWithUndo: (slot: MealSlot) => void;
} {
  const { currentMenu, clearWeek, clearDay, removeMealFromSlot, addMealToSlot } =
    useMenuPlanner();
  const { notify } = usePlannerUI();
  const menuRef = useRef(currentMenu);
  menuRef.current = currentMenu;

  const restore = useCallback(
    (items: Snapshot[]) => {
      if (menuRef.current?.id !== currentMenu?.id) {
        notify("Return to the original week to undo this change");
        return;
      }
      (async () => {
        for (const s of items) {
          if (menuRef.current?.meals.some((meal) => meal.dayOfWeek === s.dayOfWeek && meal.mealType === s.mealType && meal.recipe)) continue;
           
          await addMealToSlot(s.dayOfWeek, s.mealType, s.recipe, s.servings, s.locked);
        }
      })().catch(() => notify("Could not restore meals"));
    },
    [addMealToSlot, currentMenu?.id, notify],
  );

  const clearWeekWithUndo = useCallback(() => {
    const items = snapshot(currentMenu?.meals ?? []);
    if (items.length === 0) return;
    clearWeek()
      .then(() =>
        notify(`Cleared ${items.length} meal${items.length === 1 ? "" : "s"}`, () =>
          restore(items),
        ),
      )
      .catch(() => notify("Couldn't clear the week"));
  }, [currentMenu, clearWeek, notify, restore]);

  const clearDayWithUndo = useCallback(
    (day: DayOfWeek) => {
      const items = snapshot(
        (currentMenu?.meals ?? []).filter((m) => m.dayOfWeek === day),
      );
      if (items.length === 0) return;
      clearDay(day)
        .then(() => notify(`Cleared ${getDayName(day)}`, () => restore(items)))
        .catch(() => notify(`Couldn't clear ${getDayName(day)}`));
    },
    [currentMenu, clearDay, notify, restore],
  );

  const removeMealWithUndo = useCallback(
    (slot: MealSlot) => {
      const items = snapshot([slot]);
      removeMealFromSlot(slot.id)
        .then(() =>
          notify(
            `Removed ${slot.recipe?.name ?? "meal"}`,
            items.length ? () => restore(items) : undefined,
          ),
        )
        .catch(() => notify("Couldn't remove that meal"));
    },
    [removeMealFromSlot, notify, restore],
  );

  return { clearWeekWithUndo, clearDayWithUndo, removeMealWithUndo };
}
