"use client";

/**
 * useSpacetimePlannerSync — syncs the weekly meal plan with the
 * `meal_plan_slot` table (gated by NEXT_PUBLIC_SPACETIME_LIVE_PLANNER).
 *
 * Write path: every local change to the planner (set / move / swap / clear /
 * servings / locks — all visible as `currentMenu.meals` diffs) converges the
 * user's remote rows via the owner-scoped reducers.
 *
 * Read path (remote→local): slot *removals*, *servings* changes, and *lock*
 * changes apply directly to slots whose recipe matches. Remote *additions*
 * and *replacements* are materialized into real local meals when the
 * caller-supplied `resolveRecipeRef` can rehydrate their `recipe_ref` into a
 * full recipe (static catalog id, exact name, or live "stdb-{id}" row);
 * whatever doesn't resolve stays surfaced as `unappliedRemoteSlots` instead
 * of guessed at.
 *
 * Safety rails:
 *  - The "what this device pushed" map persists per SpacetimeDB identity
 *    (localStorage), so deletions made elsewhere while this device was
 *    offline are recognized — and an empty plan on a brand-new device still
 *    can never wipe rows it didn't write.
 *  - A missing remote row only counts as a remote deletion after a grace
 *    window, so an in-flight or rejected push is never misread as one.
 *  - Session keys (the delete scope) are cleared whenever the local menu
 *    changes weeks: week navigation swaps the whole plan object, and the
 *    vacated week's keys must not read as user deletions.
 *
 * Falls back silently: when the flag is off or the connection is anything
 * but "connected", the hook is inert and the planner behaves exactly as the
 * legacy localStorage/Postgres path.
 */

import { track } from "@vercel/analytics";
import { useEffect, useRef, useState } from "react";
import { useSpacetime } from "@/contexts/SpacetimeContext";
import type { MonicaOptimizedRecipe } from "@/data/unified/recipeBuilding";
import type { RecipeRefResolver } from "@/hooks/useRecipeRefResolver";
import { isLivePlannerEnabled } from "@/lib/spacetime/config";
import {
  MEAL_TYPE_BY_INDEX,
  MEAL_TYPE_INDEX,
  weekEpochDay,
} from "@/lib/spacetime/mealPlanMapping";
import {
  eligibleForDeletion,
  loadPushedEntries,
  savePushedEntries,
  type PushedEntry,
} from "@/lib/spacetime/pushedState";
import type { DayOfWeek, MealType, WeeklyMenu } from "@/types/menuPlanner";

interface DesiredSlot {
  week: number;
  day: number;
  meal: number;
  recipeRef: string;
  recipeName: string;
  servings: number;
  locked: boolean;
}

interface LocalSlotRef extends DesiredSlot {
  /** The planner context's slot id, for applying remote changes locally. */
  localSlotId: string;
}

/** The user's `meal_plan_slot` row values, keyed by `week|day|meal`. */
interface RemoteSlot {
  recipeRef: string;
  recipeName: string;
  servings: number;
  locked: boolean;
}

/** The planner-context actions the remote→local path needs. */
export interface PlannerSyncActions {
  removeMealFromSlot: (mealSlotId: string) => Promise<void>;
  updateMealServings: (mealSlotId: string, servings: number) => Promise<void>;
  lockMeal: (mealSlotId: string) => void;
  unlockMeal: (mealSlotId: string) => void;
  addMealToSlot: (
    dayOfWeek: DayOfWeek,
    mealType: MealType,
    recipe: MonicaOptimizedRecipe,
    servings?: number,
    locked?: boolean,
  ) => Promise<void>;
}

export interface PlannerSyncState {
  /** True when the flag is on, the connection is up, and rows are flowing. */
  live: boolean;
  /** The user's slot rows currently held in the module. */
  liveSlotCount: number;
  /**
   * Current-week remote slots that exist in the module but couldn't be
   * applied locally yet — their `recipe_ref` didn't resolve, or a local
   * edit of the same slot is still in flight. Rows for other weeks aren't
   * counted: they're out of view, and materialize when the planner
   * navigates to their week.
   */
  unappliedRemoteSlots: number;
}

function slotSignature(slot: DesiredSlot): string {
  return JSON.stringify([
    slot.recipeRef,
    slot.recipeName,
    slot.servings,
    slot.locked,
  ]);
}

function localSlotsFromMenu(menu: WeeklyMenu | null): Map<string, LocalSlotRef> {
  const local = new Map<string, LocalSlotRef>();
  if (!menu) return local;
  const week = weekEpochDay(menu.weekStartDate);
  for (const slot of menu.meals) {
    if (!slot.recipe) continue;
    const meal = MEAL_TYPE_INDEX[slot.mealType];
    if (meal === undefined) continue;
    const recipe = slot.recipe as { id?: string | number; name?: string };
    const recipeName = (recipe.name ?? "").toString().trim();
    if (!recipeName) continue;
    const key = `${week}|${slot.dayOfWeek}|${meal}`;
    local.set(key, {
      week,
      day: slot.dayOfWeek,
      meal,
      recipeRef: (recipe.id ?? recipeName).toString().slice(0, 250),
      recipeName: recipeName.slice(0, 250),
      servings: slot.servings > 0 ? slot.servings : 1,
      locked: Boolean(slot.isLocked),
      localSlotId: slot.id,
    });
  }
  return local;
}

export function useSpacetimePlannerSync(
  currentMenu: WeeklyMenu | null,
  actions: PlannerSyncActions,
  resolveRecipeRef?: RecipeRefResolver,
): PlannerSyncState {
  const enabled = isLivePlannerEnabled();
  const { connection, status, identityHex } = useSpacetime();
  const [applied, setApplied] = useState(false);
  const [liveSlotCount, setLiveSlotCount] = useState(0);
  const [unappliedRemoteSlots, setUnappliedRemoteSlots] = useState(0);
  /** Bumped on every remote row event so the apply effect re-runs. */
  const [remoteVersion, setRemoteVersion] = useState(0);
  const pushedRef = useRef<Map<string, PushedEntry>>(new Map());
  /**
   * Keys whose slot existed in the local plan at some point THIS session.
   * Remote deletes are scoped to this set, not the durable map: the local
   * plan does not persist across reloads (in-memory for guests), so a fresh
   * page load starts with an empty plan while the durable map still lists
   * past pushes — issuing deletes from the durable map would wipe the user's
   * remote plan on every reload. The durable map only serves remote-deletion
   * recognition and the local-echo guard.
   */
  const sessionKeysRef = useRef<Set<string>>(new Set());
  /**
   * Keys with an addMealToSlot dispatched whose menu state hasn't landed
   * yet — guards against double-materializing while React state is in
   * flight. Entries clear once the local slot matches the remote ref (or
   * the remote row disappears, or the menu changes weeks).
   */
  const materializingRef = useRef<Set<string>>(new Set());
  /** The week sessionKeysRef's entries belong to. */
  const sessionWeekRef = useRef<number | null>(null);
  const storageKeyRef = useRef<string | null>(null);
  const trackedRef = useRef(false);
  const actionsRef = useRef(actions);
  actionsRef.current = actions;

  /**
   * Week navigation swaps the entire menu object — the vacated week's keys
   * say nothing about user intent there, so carrying them across the swap
   * would make the write-mirror read "key in session, absent from plan" as
   * a deletion and wipe the week the user just navigated away from.
   */
  const syncSessionWeek = (menu: WeeklyMenu | null): number | null => {
    const week = menu ? weekEpochDay(menu.weekStartDate) : null;
    if (week !== sessionWeekRef.current) {
      sessionWeekRef.current = week;
      sessionKeysRef.current.clear();
      materializingRef.current.clear();
    }
    return week;
  };

  // Hydrate the durable pushed-map for this identity.
  useEffect(() => {
    if (!enabled || !identityHex) return;
    const storageKey = `alchm:planner:stdb-pushed:v1:${identityHex}`;
    storageKeyRef.current = storageKey;
    pushedRef.current = loadPushedEntries(storageKey);
  }, [enabled, identityHex]);

  const persistPushed = () => {
    if (storageKeyRef.current) {
      savePushedEntries(storageKeyRef.current, pushedRef.current);
    }
  };

  // Subscription: the user's slot rows (filtered client-side by identity).
  useEffect(() => {
    if (!enabled || status !== "connected" || !connection || !identityHex) {
      setApplied(false);
      setLiveSlotCount(0);
      setUnappliedRemoteSlots(0);
      return;
    }

    const refresh = () => {
      try {
        let count = 0;
        for (const row of connection.db.meal_plan_slot.iter()) {
          if (row.owner.toHexString() === identityHex) count += 1;
        }
        setLiveSlotCount(count);
        setRemoteVersion((v) => v + 1);
      } catch {
        // Raced a disconnect; status change resets state.
      }
    };

    const subscription = connection
      .subscriptionBuilder()
      .onApplied(() => {
        setApplied(true);
        refresh();
        if (!trackedRef.current) {
          trackedRef.current = true;
          track("spacetime_planner_sync_attached");
        }
      })
      .subscribe(["SELECT * FROM meal_plan_slot"]);

    connection.db.meal_plan_slot.onInsert(refresh);
    connection.db.meal_plan_slot.onUpdate(refresh);
    connection.db.meal_plan_slot.onDelete(refresh);

    return () => {
      setApplied(false);
      try {
        connection.db.meal_plan_slot.removeOnInsert(refresh);
        connection.db.meal_plan_slot.removeOnUpdate(refresh);
        connection.db.meal_plan_slot.removeOnDelete(refresh);
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

    syncSessionWeek(currentMenu);

    const timer = setTimeout(() => {
      const desired = localSlotsFromMenu(currentMenu);

      const remote = new Map<string, RemoteSlot>();
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

      let dirty = false;
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
        const sig = slotSignature(slot);
        sessionKeysRef.current.add(key);
        if (pushedRef.current.get(key)?.s !== sig) {
          pushedRef.current.set(key, { s: sig, t: Date.now() });
          dirty = true;
        }
      }

      // Scoped deletes: only retract slots that were present in the local
      // plan during THIS session — a reload's empty plan must never wipe
      // remote rows recorded in the durable map.
      for (const [key] of pushedRef.current) {
        if (!sessionKeysRef.current.has(key)) continue;
        if (!desired.has(key) && remote.has(key)) {
          const [week, day, meal] = key.split("|").map(Number);
          void connection.reducers.clearMealPlanSlot({
            weekEpochDay: week,
            dayOfWeek: day,
            mealType: meal,
          });
          pushedRef.current.delete(key);
          sessionKeysRef.current.delete(key);
          dirty = true;
        } else if (!desired.has(key) && !remote.has(key)) {
          pushedRef.current.delete(key);
          sessionKeysRef.current.delete(key);
          dirty = true;
        }
      }

      if (dirty) persistPushed();
    }, 600);

    return () => clearTimeout(timer);
  }, [enabled, applied, status, connection, identityHex, currentMenu]);

  // Remote→local application: removals + servings/locks for matching slots,
  // and materialization of remote additions/replacements whose recipe_ref
  // the resolver can rehydrate.
  useEffect(() => {
    if (!enabled || !applied || status !== "connected" || !connection) return;
    if (!identityHex) return;

    const currentWeek = syncSessionWeek(currentMenu);
    const local = localSlotsFromMenu(currentMenu);
    const remote = new Map<string, RemoteSlot>();
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

    // In-flight materialization markers whose remote row vanished will never
    // land a matching local slot — drop them so the key isn't blocked.
    for (const key of materializingRef.current) {
      if (!remote.has(key)) materializingRef.current.delete(key);
    }

    let unapplied = 0;
    let dirty = false;

    /**
     * Rehydrate a remote slot into the local plan. Returns true when the
     * insert was dispatched (or is already in flight); false when the key
     * can't be materialized — caller surfaces it as unapplied.
     */
    const materialize = (key: string, remoteSlot: RemoteSlot): boolean => {
      if (materializingRef.current.has(key)) return true;
      if (!currentMenu || currentWeek === null) return false;
      const [week, day, meal] = key.split("|").map(Number);
      if (week !== currentWeek) return false;
      const mealType = MEAL_TYPE_BY_INDEX[meal];
      if (!mealType) return false;
      // A silent no-op insert (no such grid slot) would re-dispatch forever.
      const hasSlot = currentMenu.meals.some(
        (m) => m.dayOfWeek === day && m.mealType === mealType,
      );
      if (!hasSlot) return false;
      const recipe = resolveRecipeRef?.(remoteSlot.recipeRef);
      if (!recipe) return false;
      const recipeName = (recipe.name ?? "").toString().trim();
      if (!recipeName) return false;
      // Seed the pushed entry with the exact signature the local slot will
      // have once the insert lands: the echo guard then reads the slot as
      // in-sync, and the write-mirror sees nothing to push (or, when the
      // resolver matched by name and the canonical ref differs, converges
      // the remote ref in a single upsert with no ping-pong).
      const expected: DesiredSlot = {
        week,
        day,
        meal,
        recipeRef: (recipe.id ?? recipeName).toString().slice(0, 250),
        recipeName: recipeName.slice(0, 250),
        servings: remoteSlot.servings > 0 ? remoteSlot.servings : 1,
        locked: remoteSlot.locked,
      };
      materializingRef.current.add(key);
      pushedRef.current.set(key, {
        s: slotSignature(expected),
        t: Date.now(),
      });
      dirty = true;
      void actionsRef.current.addMealToSlot(
        day as DayOfWeek,
        mealType,
        recipe as MonicaOptimizedRecipe,
        expected.servings,
        expected.locked,
      );
      return true;
    };

    for (const [key, slot] of local) {
      const remoteSlot = remote.get(key);
      const pushed = pushedRef.current.get(key);
      if (!remoteSlot) {
        // Cleared on another device — apply locally, but only when this
        // device's push is old enough that "missing" can't be an in-flight
        // or rejected write of our own.
        if (eligibleForDeletion(pushed)) {
          void actionsRef.current.removeMealFromSlot(slot.localSlotId);
          pushedRef.current.delete(key);
          dirty = true;
        }
        continue;
      }
      if (remoteSlot.recipeRef !== slot.recipeRef) {
        // Replaced with a different dish elsewhere. Materialize it only when
        // the local slot has no pending edit of its own (its state matches
        // what this device last pushed); otherwise local is ahead and the
        // write-mirror will converge remote to local instead. An in-flight
        // materialization (pushed already re-seeded) just waits for state
        // to land.
        if (
          materializingRef.current.has(key) ||
          (pushed?.s === slotSignature(slot) && materialize(key, remoteSlot))
        ) {
          continue;
        }
        unapplied += 1;
        continue;
      }
      materializingRef.current.delete(key);
      if (pushed !== undefined && pushed.s !== slotSignature(slot)) {
        // The local slot is ahead of what this device last pushed — a local
        // edit is still waiting on the debounced write-mirror. Applying the
        // (stale) remote values now would revert the edit before it ever
        // reaches the module. Skip; the push will converge remote to local.
        continue;
      }
      if (Math.abs(remoteSlot.servings - slot.servings) > 1e-6) {
        void actionsRef.current.updateMealServings(
          slot.localSlotId,
          remoteSlot.servings,
        );
      }
      if (remoteSlot.locked !== slot.locked) {
        if (remoteSlot.locked) actionsRef.current.lockMeal(slot.localSlotId);
        else actionsRef.current.unlockMeal(slot.localSlotId);
      }
    }

    // Remote rows with no local counterpart: additions from other devices,
    // or this device's own rows surviving a reload. Materialize what
    // resolves; keep the honest "elsewhere" count for what doesn't.
    for (const [key, remoteSlot] of remote) {
      if (local.has(key)) continue;
      // A key that was local earlier this session is a local deletion
      // awaiting the debounced clear push — don't resurrect it (and don't
      // count the sub-second transient as unapplied).
      if (sessionKeysRef.current.has(key)) continue;
      const week = Number(key.split("|")[0]);
      if (week !== currentWeek) continue; // out of view, not pending
      if (!materialize(key, remoteSlot)) unapplied += 1;
    }

    setUnappliedRemoteSlots(unapplied);
    if (dirty) persistPushed();
  }, [
    enabled,
    applied,
    status,
    connection,
    identityHex,
    currentMenu,
    remoteVersion,
    resolveRecipeRef,
  ]);

  return {
    live: enabled && applied && status === "connected",
    liveSlotCount,
    unappliedRemoteSlots,
  };
}
