"use client";

/**
 * Menu Planner — Generation preferences hook
 *
 * Owns the generation-preferences state and its localStorage persistence.
 * The provider used to inline this; it was extracted to keep
 * MenuPlannerProvider focused on cross-cutting state.
 *
 * @file src/contexts/menu-planner/useGenerationPreferences.ts
 */

import { useCallback, useState } from "react";
import type { GenerationPreferences, NutritionalTargets } from "./types";

const STORAGE_KEY = "alchm-generation-preferences";

const DEFAULT_NUTRITIONAL_TARGETS: NutritionalTargets = {
  dailyCalories: null,
  dailyProteinG: null,
  dailyCarbsG: null,
  dailyFatG: null,
  dailyFiberG: null,
  prioritizeProtein: false,
  prioritizeFiber: false,
};

const DEFAULT_GENERATION_PREFERENCES: GenerationPreferences = {
  preferredCuisines: [],
  dietaryRestrictions: [],
  excludeIngredients: [],
  requiredIngredients: [],
  preferredCookingMethods: [],
  flavorPreferences: [],
  maxPrepTimeMinutes: null,
  nutritionalTargets: DEFAULT_NUTRITIONAL_TARGETS,
};

function writeStorage(prefs: GenerationPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // localStorage may be unavailable (SSR, private mode, quota)
  }
}

export interface UseGenerationPreferencesReturn {
  generationPreferences: GenerationPreferences;
  setGenerationPreferences: (prefs: GenerationPreferences) => void;
  updateGenerationPreference: <K extends keyof GenerationPreferences>(
    key: K,
    value: GenerationPreferences[K],
  ) => void;
  resetGenerationPreferences: () => void;
}

export function useGenerationPreferences(): UseGenerationPreferencesReturn {
  const [generationPreferences, setRaw] = useState<GenerationPreferences>(() => {
    if (typeof window === "undefined") return DEFAULT_GENERATION_PREFERENCES;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved
        ? { ...DEFAULT_GENERATION_PREFERENCES, ...JSON.parse(saved) }
        : DEFAULT_GENERATION_PREFERENCES;
    } catch {
      return DEFAULT_GENERATION_PREFERENCES;
    }
  });

  const setGenerationPreferences = useCallback((prefs: GenerationPreferences) => {
    setRaw(prefs);
    writeStorage(prefs);
  }, []);

  const updateGenerationPreference = useCallback(
    <K extends keyof GenerationPreferences>(
      key: K,
      value: GenerationPreferences[K],
    ) => {
      setRaw((prev) => {
        const updated = { ...prev, [key]: value };
        writeStorage(updated);
        return updated;
      });
    },
    [],
  );

  const resetGenerationPreferences = useCallback(() => {
    setRaw(DEFAULT_GENERATION_PREFERENCES);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // localStorage may be unavailable
    }
  }, []);

  return {
    generationPreferences,
    setGenerationPreferences,
    updateGenerationPreference,
    resetGenerationPreferences,
  };
}
