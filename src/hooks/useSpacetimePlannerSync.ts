"use client";

/**
 * useSpacetimePlannerSync — mirrors the weekly meal plan into the
 * `meal_plan_slot` table (gated by NEXT_PUBLIC_SPACETIME_LIVE_PLANNER).
 *
 * Direction: one-way write-mirror with scoped deletes. Every local change to
 * the planner (set / move / swap / clear / servings / locks — all visible as
 * `currentMenu.meals` diffs) converges the user's remote rows via the
 * owner-scoped reducers. Deletes are only issued for slots *this session*
 * previously pushed, so a second device with an empty local plan can never
 * wipe rows written elsewhere. Remote→local application (true multi-master)
 * is a documented follow-up — see docs/adr/008-spacetimedb-live-state.md.
 *
 * Falls back silently: when the flag is off or the connection is anything
 * but "connected", the hook is inert and the planner behaves exactly as the
 * legacy localStorage/Postgres path.
 */

import { track } from "@vercel/analytics";
import { useEffect, useRef, useState } from "react";
import { useSpacetime } from "@/contexts/SpacetimeContext";
import { isLivePlannerEnabled } from "@/lib/spacetime/config";
import {
  MEAL_TYPE_INDEX,
  weekEpochDay,
} from "@/lib/spacetime/mealPlanMapping";
import type { WeeklyMenu } from "@/types/menuPlanner";

interface DesiredSlot {
  week: number;
  day: number;
  meal: number;
  recipeRef: string;
  recipeName: string;
  servings: number;
  locked: boolean;
}

export interface PlannerSyncState {
  /** True when the flag is on, the connection is up, and rows are flowing. */
  live: boolean;
  /** The user's slot rows currently held in the module. */
  liveSlotCount: number;
}

function desiredFromMenu(menu: WeeklyMenu | null): Map<string, DesiredSlot> {
  const desired = new Map<string, DesiredSlot>();
  if (!menu) return desired;
  const week = weekEpochDay(menu.weekStartDate);
  for (const slot of menu.meals) {
    if (!slot.recipe) continue;
    const meal = MEAL_TYPE_INDEX[slot.mealType];
    if (meal === undefined) continue;
    const recipe = slot.recipe as { id?: string | number; name?: string };
    const recipeName = (recipe.name ?? "").toString().trim();
    if (!recipeName) continue;
    const key = `${week}|${slot.dayOfWeek}|${meal}`;
    desired.set(key, {
      week,
      day: slot.dayOfWeek,
      meal,
      recipeRef: (recipe.id ?? recipeName).toString().slice(0, 250),
      recipeName: recipeName.slice(0, 250),
      servings: slot.servings > 0 ? slot.servings : 1,
      locked: Boolean(slot.isLocked),
    });
  }
  return desired;
}

export function useSpacetimePlannerSync(
  currentMenu: WeeklyMenu | null,
): PlannerSyncState {
  const enabled = isLivePlannerEnabled();
  const { connection, status, identityHex } = useSpacetime();
  const [applied, setApplied] = useState(false);
  const [liveSlotCount, setLiveSlotCount] = useState(0);
  const lastPushedRef = useRef<Map<string, DesiredSlot>>(new Map());
  const trackedRef = useRef(false);

  // Subscription: the user's slot rows (filtered client-side by identity).
  useEffect(() => {
    if (!enabled || status !== "connected" || !connection || !identityHex) {
      setApplied(false);
      setLiveSlotCount(0);
      return;
    }

    const refreshCount = () => {
      try {
        let count = 0;
        for (const row of connection.db.meal_plan_slot.iter()) {
          if (row.owner.toHexString() === identityHex) count += 1;
        }
        setLiveSlotCount(count);
      } catch {
        // Raced a disconnect; status change resets state.
      }
    };

    const subscription = connection
      .subscriptionBuilder()
      .onApplied(() => {
        setApplied(true);
        refreshCount();
        if (!trackedRef.current) {
          trackedRef.current = true;
          track("spacetime_planner_sync_attached");
        }
      })
      .subscribe(["SELECT * FROM meal_plan_slot"]);

    connection.db.meal_plan_slot.onInsert(refreshCount);
    connection.db.meal_plan_slot.onUpdate(refreshCount);
    connection.db.meal_plan_slot.onDelete(refreshCount);

    return () => {
      setApplied(false);
      try {
        connection.db.meal_plan_slot.removeOnInsert(refreshCount);
        connection.db.meal_plan_slot.removeOnUpdate(refreshCount);
        connection.db.meal_plan_slot.removeOnDelete(refreshCount);
        subscription.unsubscribe();
      } catch {
        // Connection already torn down.
      }
    };
  }, [enabled, status, connection, identityHex]);

  // Write mirror: debounce local plan changes, then converge remote rows.
  useEffect(() => {
    if (!enabled || !applied || status !== "connected" || !connection) return;
    if (!identityHex) return;

    const timer = setTimeout(() => {
      const desired = desiredFromMenu(currentMenu);

      const remote = new Map<
        string,
        { recipeRef: string; recipeName: string; servings: number; locked: boolean }
      >();
      try {
        for (const row of connection.db.meal_plan_slot.iter()) {
          if (row.owner.toHexString() !== identityHex) continue;
          remote.set(`${row.weekEpochDay}|${row.dayOfWeek}|${row.mealType}`, {
            recipeRef: row.recipeRef,
            recipeName: row.recipeName,
            servings: row.servings,
            locked: row.locked,
          });
        }
      } catch {
        return;
      }

      for (const [key, slot] of desired) {
        const existing = remote.get(key);
        const changed =
          !existing ||
          existing.recipeRef !== slot.recipeRef ||
          existing.recipeName !== slot.recipeName ||
          Math.abs(existing.servings - slot.servings) > 1e-6;
        if (changed) {
          void connection.reducers.upsertMealPlanSlot({
            weekEpochDay: slot.week,
            dayOfWeek: slot.day,
            mealType: slot.meal,
            recipeId: 0n,
            recipeRef: slot.recipeRef,
            recipeName: slot.recipeName,
            servings: slot.servings,
          });
        }
        if ((existing?.locked ?? false) !== slot.locked) {
          void connection.reducers.setMealPlanSlotLocked({
            weekEpochDay: slot.week,
            dayOfWeek: slot.day,
            mealType: slot.meal,
            locked: slot.locked,
          });
        }
      }

      // Scoped deletes: only retract slots this session previously pushed.
      for (const [key, slot] of lastPushedRef.current) {
        if (!desired.has(key) && remote.has(key)) {
          void connection.reducers.clearMealPlanSlot({
            weekEpochDay: slot.week,
            dayOfWeek: slot.day,
            mealType: slot.meal,
          });
        }
      }

      lastPushedRef.current = desired;
    }, 600);

    return () => clearTimeout(timer);
  }, [enabled, applied, status, connection, identityHex, currentMenu]);

  return { live: enabled && applied && status === "connected", liveSlotCount };
}
