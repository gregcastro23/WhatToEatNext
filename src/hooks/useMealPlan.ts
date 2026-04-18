"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "alchm:meal-plan:v1";
const SYNC_FLAG_PREFIX = "alchm:meal-plan:synced:";

export interface MealPlanEntry {
  id: string;
  date: string;        // YYYY-MM-DD
  recipeId: string;
  recipeName?: string;
  mealType?: string;   // "breakfast" | "lunch" | "dinner" | "snack"
  servings?: number;
  addedAt: number;
}

type Listener = (plan: MealPlanEntry[]) => void;
const listeners = new Set<Listener>();
let cached: MealPlanEntry[] | null = null;

function readLocal(): MealPlanEntry[] {
  if (typeof window === "undefined") return [];
  if (cached !== null) return cached;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    cached = raw ? (JSON.parse(raw) as MealPlanEntry[]) : [];
  } catch {
    cached = [];
  }
  return cached;
}

function writeLocal(next: MealPlanEntry[]) {
  cached = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (err) {
    console.warn("meal-plan write failed:", err);
  }
  listeners.forEach((l) => l(next));
}

function clearLocal() {
  cached = [];
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  listeners.forEach((l) => l([]));
}

export function useMealPlan() {
  const { data: session, status } = useSession();
  const userKey = session?.user?.id || session?.user?.email || "";
  const isAuthed = status === "authenticated";

  const [plan, setPlan] = useState<MealPlanEntry[]>(() => readLocal());
  const syncRan = useRef(false);

  // Listener registration + cross-tab sync
  useEffect(() => {
    const listener: Listener = (next) => setPlan(next);
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        cached = null;
        setPlan(readLocal());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // Load from API when authed. On first authed mount, bulk-import any
  // localStorage entries then clear them (once per user).
  useEffect(() => {
    if (!isAuthed || !userKey) return;
    if (syncRan.current) return;
    syncRan.current = true;

    async function syncAndLoad() {
      const syncFlagKey = SYNC_FLAG_PREFIX + userKey;
      const alreadySynced =
        typeof window !== "undefined" &&
        window.localStorage.getItem(syncFlagKey) === "1";

      const localEntries = readLocal();

      try {
        if (!alreadySynced && localEntries.length > 0) {
          await fetch("/api/users/me/meal-plan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bulkImport: localEntries.map((e) => ({
                recipeId: e.recipeId,
                recipeName: e.recipeName,
                date: e.date,
                mealType: e.mealType,
                servings: e.servings,
              })),
            }),
          });
          clearLocal();
          try {
            window.localStorage.setItem(syncFlagKey, "1");
          } catch {
            // ignore
          }
        } else if (!alreadySynced) {
          try {
            window.localStorage.setItem(syncFlagKey, "1");
          } catch {
            // ignore
          }
        }

        const res = await fetch("/api/users/me/meal-plan", { cache: "no-store" });
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = await res.json();
        if (data.authenticated && Array.isArray(data.entries)) {
          // Remote is source of truth when authed. Mirror into cache for
          // instant render, but do NOT persist to localStorage — we cleared it.
          cached = data.entries as MealPlanEntry[];
          listeners.forEach((l) => l(cached!));
        }
      } catch (err) {
        console.warn("meal-plan sync failed, staying local:", err);
      }
    }

    void syncAndLoad();
  }, [isAuthed, userKey]);

  const addEntry = useCallback(
    (entry: Omit<MealPlanEntry, "id" | "addedAt">) => {
      const optimistic: MealPlanEntry = {
        ...entry,
        id: `${entry.recipeId}-${entry.date}-${Date.now()}`,
        addedAt: Date.now(),
      };

      if (isAuthed) {
        // Optimistic insert, then reconcile with server id.
        const current = readLocal();
        cached = [...current, optimistic];
        listeners.forEach((l) => l(cached!));

        void (async () => {
          try {
            const res = await fetch("/api/users/me/meal-plan", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                recipeId: entry.recipeId,
                recipeName: entry.recipeName,
                date: entry.date,
                mealType: entry.mealType,
                servings: entry.servings,
              }),
            });
            if (!res.ok) throw new Error(`status ${res.status}`);
            const data = await res.json();
            if (data?.entry?.id) {
              const reconciled = (cached || []).map((e) =>
                e.id === optimistic.id ? (data.entry as MealPlanEntry) : e,
              );
              cached = reconciled;
              listeners.forEach((l) => l(cached!));
            }
          } catch (err) {
            console.warn("meal-plan remote add failed:", err);
          }
        })();
        return optimistic;
      }

      // Unauthed: localStorage only
      writeLocal([...readLocal(), optimistic]);
      return optimistic;
    },
    [isAuthed],
  );

  const removeEntry = useCallback(
    (id: string) => {
      if (isAuthed) {
        cached = (cached || []).filter((e) => e.id !== id);
        listeners.forEach((l) => l(cached!));
        void fetch(`/api/users/me/meal-plan?id=${encodeURIComponent(id)}`, {
          method: "DELETE",
        }).catch((err) => console.warn("meal-plan remote delete failed:", err));
        return;
      }
      writeLocal(readLocal().filter((e) => e.id !== id));
    },
    [isAuthed],
  );

  const clearAll = useCallback(() => {
    if (isAuthed) {
      const ids = (cached || []).map((e) => e.id);
      cached = [];
      listeners.forEach((l) => l([]));
      void Promise.all(
        ids.map((id) =>
          fetch(`/api/users/me/meal-plan?id=${encodeURIComponent(id)}`, {
            method: "DELETE",
          }).catch(() => undefined),
        ),
      );
      return;
    }
    writeLocal([]);
  }, [isAuthed]);

  const entriesForRecipe = useCallback(
    (recipeId: string) => plan.filter((e) => e.recipeId === recipeId),
    [plan],
  );

  return { plan, addEntry, removeEntry, clearAll, entriesForRecipe };
}
