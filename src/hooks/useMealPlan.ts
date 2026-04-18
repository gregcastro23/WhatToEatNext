"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "alchm:meal-plan:v1";

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

function read(): MealPlanEntry[] {
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

function write(next: MealPlanEntry[]) {
  cached = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (err) {
    console.warn("meal-plan write failed:", err);
  }
  listeners.forEach((l) => l(next));
}

export function useMealPlan() {
  const [plan, setPlan] = useState<MealPlanEntry[]>(() => read());

  useEffect(() => {
    const listener: Listener = (next) => setPlan(next);
    listeners.add(listener);
    // Cross-tab sync
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        cached = null;
        setPlan(read());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const addEntry = useCallback((entry: Omit<MealPlanEntry, "id" | "addedAt">) => {
    const full: MealPlanEntry = {
      ...entry,
      id: `${entry.recipeId}-${entry.date}-${Date.now()}`,
      addedAt: Date.now(),
    };
    write([...read(), full]);
    return full;
  }, []);

  const removeEntry = useCallback((id: string) => {
    write(read().filter((e) => e.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    write([]);
  }, []);

  const entriesForRecipe = useCallback(
    (recipeId: string) => plan.filter((e) => e.recipeId === recipeId),
    [plan],
  );

  return { plan, addEntry, removeEntry, clearAll, entriesForRecipe };
}
