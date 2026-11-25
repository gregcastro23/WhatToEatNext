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
import type {
  FlavorPreference,
  GenerationPreferences,
  NutritionalTargets,
} from "./types";

const FLAVOR_PREFERENCE_LIST: readonly FlavorPreference[] = [
  "spicy",
  "sweet",
  "savory",
  "bitter",
  "sour",
  "umami",
];

function isPlainObject(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

function readStringArray(val: unknown, fallback: string[]): string[] {
  if (!Array.isArray(val)) return fallback;
  return val.filter((item): item is string => typeof item === "string");
}

function isFlavorPreference(val: unknown): val is FlavorPreference {
  return (
    typeof val === "string" && FLAVOR_PREFERENCE_LIST.some((f) => f === val)
  );
}

function readFlavorPreferences(
  val: unknown,
  fallback: FlavorPreference[],
): FlavorPreference[] {
  if (!Array.isArray(val)) return fallback;
  return val.filter(isFlavorPreference);
}

function readNullableNumber(val: unknown, fallback: number | null): number | null {
  if (val === null) return null;
  return typeof val === "number" && Number.isFinite(val) ? val : fallback;
}

function readBoolean(val: unknown, fallback: boolean): boolean {
  return typeof val === "boolean" ? val : fallback;
}

function parseNutritionalTargets(raw: unknown): NutritionalTargets {
  if (!isPlainObject(raw)) return DEFAULT_NUTRITIONAL_TARGETS;
  return {
    dailyCalories: readNullableNumber(
      raw.dailyCalories,
      DEFAULT_NUTRITIONAL_TARGETS.dailyCalories,
    ),
    dailyProteinG: readNullableNumber(
      raw.dailyProteinG,
      DEFAULT_NUTRITIONAL_TARGETS.dailyProteinG,
    ),
    dailyCarbsG: readNullableNumber(
      raw.dailyCarbsG,
      DEFAULT_NUTRITIONAL_TARGETS.dailyCarbsG,
    ),
    dailyFatG: readNullableNumber(
      raw.dailyFatG,
      DEFAULT_NUTRITIONAL_TARGETS.dailyFatG,
    ),
    dailyFiberG: readNullableNumber(
      raw.dailyFiberG,
      DEFAULT_NUTRITIONAL_TARGETS.dailyFiberG,
    ),
    prioritizeProtein: readBoolean(
      raw.prioritizeProtein,
      DEFAULT_NUTRITIONAL_TARGETS.prioritizeProtein,
    ),
    prioritizeFiber: readBoolean(
      raw.prioritizeFiber,
      DEFAULT_NUTRITIONAL_TARGETS.prioritizeFiber,
    ),
  };
}

export function parseStoredGenerationPreferences(
  raw: unknown,
): GenerationPreferences {
  if (!isPlainObject(raw)) return DEFAULT_GENERATION_PREFERENCES;
  return {
    preferredCuisines: readStringArray(
      raw.preferredCuisines,
      DEFAULT_GENERATION_PREFERENCES.preferredCuisines,
    ),
    dietaryRestrictions: readStringArray(
      raw.dietaryRestrictions,
      DEFAULT_GENERATION_PREFERENCES.dietaryRestrictions,
    ),
    excludeIngredients: readStringArray(
      raw.excludeIngredients,
      DEFAULT_GENERATION_PREFERENCES.excludeIngredients,
    ),
    requiredIngredients: readStringArray(
      raw.requiredIngredients,
      DEFAULT_GENERATION_PREFERENCES.requiredIngredients,
    ),
    preferredCookingMethods: readStringArray(
      raw.preferredCookingMethods,
      DEFAULT_GENERATION_PREFERENCES.preferredCookingMethods,
    ),
    flavorPreferences: readFlavorPreferences(
      raw.flavorPreferences,
      DEFAULT_GENERATION_PREFERENCES.flavorPreferences,
    ),
    maxPrepTimeMinutes: readNullableNumber(
      raw.maxPrepTimeMinutes,
      DEFAULT_GENERATION_PREFERENCES.maxPrepTimeMinutes,
    ),
    nutritionalTargets: parseNutritionalTargets(raw.nutritionalTargets),
  };
}

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
      if (!saved) return DEFAULT_GENERATION_PREFERENCES;
      const parsed: unknown = JSON.parse(saved);
      return parseStoredGenerationPreferences(parsed);
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
