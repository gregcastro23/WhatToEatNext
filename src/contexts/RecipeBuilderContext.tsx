"use client";

/**
 * Recipe Builder Context
 * Manages ingredient, cuisine, and cooking method selections for recipe generation.
 * Separate from RecipeQueueContext which manages completed recipe queues.
 *
 * @file src/contexts/RecipeBuilderContext.tsx
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { createLogger } from "@/utils/logger";

const logger = createLogger("RecipeBuilderContext");

const STORAGE_KEY = "alchm-recipe-builder";

// ===== Types =====

export type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snack";

export type FlavorPreference =
  | "spicy"
  | "sweet"
  | "savory"
  | "bitter"
  | "sour"
  | "umami";

export interface SelectedIngredient {
  name: string;
  category?: string;
  elementalProperties?: {
    Fire?: number;
    Water?: number;
    Earth?: number;
    Air?: number;
  };
}

export interface RecipeBuilderState {
  mealType: MealType | null;
  flavors: FlavorPreference[];
  dietaryPreferences: string[];
  allergies: string[];
  selectedCuisines: string[];
  selectedIngredients: SelectedIngredient[];
  selectedCookingMethods: string[];
  /** Preserved quiz context, alongside the editable builder selections. */
  quizBrief: string | null;
  maxPrepTimeMinutes: number | null;
}

export interface RecipeBuilderContextType extends RecipeBuilderState {
  // Meal type
  setMealType: (type: MealType | null) => void;

  // Flavors
  addFlavor: (flavor: FlavorPreference) => void;
  removeFlavor: (flavor: FlavorPreference) => void;
  toggleFlavor: (flavor: FlavorPreference) => void;

  // Dietary
  addDietaryPreference: (pref: string) => void;
  removeDietaryPreference: (pref: string) => void;
  addAllergy: (allergy: string) => void;
  removeAllergy: (allergy: string) => void;

  // Cuisines
  addCuisine: (cuisine: string) => void;
  removeCuisine: (cuisine: string) => void;
  hasCuisine: (cuisine: string) => boolean;

  // Ingredients
  addIngredient: (ingredient: SelectedIngredient) => void;
  removeIngredient: (name: string) => void;
  hasIngredient: (name: string) => boolean;

  // Cooking methods
  addCookingMethod: (method: string) => void;
  removeCookingMethod: (method: string) => void;
  hasCookingMethod: (method: string) => boolean;

  // Queue summary
  totalItems: number;

  // Actions
  clearQueue: () => void;
  seedFromQuiz: (state: RecipeBuilderState) => void;

  /**
   * True once the saved queue has loaded from localStorage. Additions made
   * before then are overwritten by the saved state (the provider's load runs
   * after its children's effects), so a prefill waits for this.
   */
  isReady: boolean;
}

const MEAL_TYPE_LIST: readonly MealType[] = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snack",
];

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

function isFlavorPreference(val: unknown): val is FlavorPreference {
  return (
    typeof val === "string" && FLAVOR_PREFERENCE_LIST.some((f) => f === val)
  );
}

function readStringArray(val: unknown): string[] | undefined {
  if (!Array.isArray(val)) return undefined;
  return val.filter((item): item is string => typeof item === "string");
}

function readElementalProps(
  val: unknown,
): SelectedIngredient["elementalProperties"] | undefined {
  if (!isPlainObject(val)) return undefined;
  const out: NonNullable<SelectedIngredient["elementalProperties"]> = {};
  if (typeof val.Fire === "number") out.Fire = val.Fire;
  if (typeof val.Water === "number") out.Water = val.Water;
  if (typeof val.Earth === "number") out.Earth = val.Earth;
  if (typeof val.Air === "number") out.Air = val.Air;
  return out;
}

function parseSelectedIngredients(val: unknown): SelectedIngredient[] | undefined {
  if (!Array.isArray(val)) return undefined;
  const out: SelectedIngredient[] = [];
  for (const item of val) {
    if (!isPlainObject(item) || typeof item.name !== "string") continue;
    const next: SelectedIngredient = { name: item.name };
    if (typeof item.category === "string") next.category = item.category;
    const elemental = readElementalProps(item.elementalProperties);
    if (elemental) next.elementalProperties = elemental;
    out.push(next);
  }
  return out;
}

export function parseStoredRecipeBuilderState(
  raw: unknown,
): Partial<RecipeBuilderState> {
  if (!isPlainObject(raw)) return {};
  const out: Partial<RecipeBuilderState> = {};
  if (raw.mealType === null) {
    out.mealType = null;
  } else if (typeof raw.mealType === "string") {
    const matched = MEAL_TYPE_LIST.find((m) => m === raw.mealType);
    if (matched) out.mealType = matched;
  }
  if (Array.isArray(raw.flavors)) {
    out.flavors = raw.flavors.filter(isFlavorPreference);
  }
  const dietary = readStringArray(raw.dietaryPreferences);
  if (dietary) out.dietaryPreferences = dietary;
  const allergies = readStringArray(raw.allergies);
  if (allergies) out.allergies = allergies;
  const cuisines = readStringArray(raw.selectedCuisines);
  if (cuisines) out.selectedCuisines = cuisines;
  const ingredients = parseSelectedIngredients(raw.selectedIngredients);
  if (ingredients) out.selectedIngredients = ingredients;
  const methods = readStringArray(raw.selectedCookingMethods);
  if (methods) out.selectedCookingMethods = methods;
  if (raw.quizBrief === null || typeof raw.quizBrief === "string") {
    out.quizBrief = raw.quizBrief;
  }
  if (
    raw.maxPrepTimeMinutes === null ||
    (typeof raw.maxPrepTimeMinutes === "number" &&
      Number.isFinite(raw.maxPrepTimeMinutes))
  ) {
    out.maxPrepTimeMinutes = raw.maxPrepTimeMinutes;
  }
  return out;
}

const initialState: RecipeBuilderState = {
  mealType: null,
  flavors: [],
  dietaryPreferences: [],
  allergies: [],
  selectedCuisines: [],
  selectedIngredients: [],
  selectedCookingMethods: [],
  quizBrief: null,
  maxPrepTimeMinutes: null,
};

const RecipeBuilderContext = createContext<
  RecipeBuilderContextType | undefined
>(undefined);

// ===== Provider =====

export function RecipeBuilderProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [state, setState] = useState<RecipeBuilderState>(initialState);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        const restored = parseStoredRecipeBuilderState(parsed);
        setState((prev) => ({ ...prev, ...restored }));
        logger.info("Loaded recipe builder state from storage");
      }
    } catch (error) {
      logger.error("Failed to load recipe builder state:", error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      logger.error("Failed to persist recipe builder state:", error);
    }
  }, [state, isInitialized]);

  // --- Meal Type ---
  const setMealType = useCallback((type: MealType | null) => {
    setState((prev) => ({ ...prev, mealType: type }));
  }, []);

  // --- Flavors ---
  const addFlavor = useCallback((flavor: FlavorPreference) => {
    setState((prev) =>
      prev.flavors.includes(flavor)
        ? prev
        : { ...prev, flavors: [...prev.flavors, flavor] },
    );
  }, []);

  const removeFlavor = useCallback((flavor: FlavorPreference) => {
    setState((prev) => ({
      ...prev,
      flavors: prev.flavors.filter((f) => f !== flavor),
    }));
  }, []);

  const toggleFlavor = useCallback((flavor: FlavorPreference) => {
    setState((prev) =>
      prev.flavors.includes(flavor)
        ? { ...prev, flavors: prev.flavors.filter((f) => f !== flavor) }
        : { ...prev, flavors: [...prev.flavors, flavor] },
    );
  }, []);

  // --- Dietary ---
  const addDietaryPreference = useCallback((pref: string) => {
    setState((prev) =>
      prev.dietaryPreferences.includes(pref)
        ? prev
        : { ...prev, dietaryPreferences: [...prev.dietaryPreferences, pref] },
    );
  }, []);

  const removeDietaryPreference = useCallback((pref: string) => {
    setState((prev) => ({
      ...prev,
      dietaryPreferences: prev.dietaryPreferences.filter((p) => p !== pref),
    }));
  }, []);

  const addAllergy = useCallback((allergy: string) => {
    setState((prev) =>
      prev.allergies.includes(allergy)
        ? prev
        : { ...prev, allergies: [...prev.allergies, allergy] },
    );
  }, []);

  const removeAllergy = useCallback((allergy: string) => {
    setState((prev) => ({
      ...prev,
      allergies: prev.allergies.filter((a) => a !== allergy),
    }));
  }, []);

  // --- Cuisines ---
  const addCuisine = useCallback((cuisine: string) => {
    setState((prev) =>
      prev.selectedCuisines.includes(cuisine)
        ? prev
        : { ...prev, selectedCuisines: [...prev.selectedCuisines, cuisine] },
    );
    logger.info(`Added cuisine: ${cuisine}`);
  }, []);

  const removeCuisine = useCallback((cuisine: string) => {
    setState((prev) => ({
      ...prev,
      selectedCuisines: prev.selectedCuisines.filter((c) => c !== cuisine),
    }));
  }, []);

  const hasCuisine = useCallback(
    (cuisine: string) => state.selectedCuisines.includes(cuisine),
    [state.selectedCuisines],
  );

  // --- Ingredients ---
  const addIngredient = useCallback((ingredient: SelectedIngredient) => {
    setState((prev) => {
      if (prev.selectedIngredients.some((i) => i.name === ingredient.name)) {
        return prev;
      }
      return {
        ...prev,
        selectedIngredients: [...prev.selectedIngredients, ingredient],
      };
    });
    logger.info(`Added ingredient: ${ingredient.name}`);
  }, []);

  const removeIngredient = useCallback((name: string) => {
    setState((prev) => ({
      ...prev,
      selectedIngredients: prev.selectedIngredients.filter(
        (i) => i.name !== name,
      ),
    }));
  }, []);

  const hasIngredient = useCallback(
    (name: string) => state.selectedIngredients.some((i) => i.name === name),
    [state.selectedIngredients],
  );

  // --- Cooking Methods ---
  const addCookingMethod = useCallback((method: string) => {
    setState((prev) =>
      prev.selectedCookingMethods.includes(method)
        ? prev
        : {
            ...prev,
            selectedCookingMethods: [...prev.selectedCookingMethods, method],
          },
    );
    logger.info(`Added cooking method: ${method}`);
  }, []);

  const removeCookingMethod = useCallback((method: string) => {
    setState((prev) => ({
      ...prev,
      selectedCookingMethods: prev.selectedCookingMethods.filter(
        (m) => m !== method,
      ),
    }));
  }, []);

  const hasCookingMethod = useCallback(
    (method: string) => state.selectedCookingMethods.includes(method),
    [state.selectedCookingMethods],
  );

  // --- Queue Summary ---
  const totalItems = useMemo(
    () =>
      state.selectedCuisines.length +
      state.selectedIngredients.length +
      state.selectedCookingMethods.length,
    [
      state.selectedCuisines.length,
      state.selectedIngredients.length,
      state.selectedCookingMethods.length,
    ],
  );

  // --- Clear ---
  const clearQueue = useCallback(() => {
    setState(initialState);
    logger.info("Cleared recipe builder queue");
  }, []);

  const seedFromQuiz = useCallback((next: RecipeBuilderState) => {
    setState(next);
  }, []);

  const contextValue = useMemo<RecipeBuilderContextType>(
    () => ({
      ...state,
      setMealType,
      addFlavor,
      removeFlavor,
      toggleFlavor,
      addDietaryPreference,
      removeDietaryPreference,
      addAllergy,
      removeAllergy,
      addCuisine,
      removeCuisine,
      hasCuisine,
      addIngredient,
      removeIngredient,
      hasIngredient,
      addCookingMethod,
      removeCookingMethod,
      hasCookingMethod,
      totalItems,
      clearQueue,
      seedFromQuiz,
      isReady: isInitialized,
    }),
    [
      state,
      isInitialized,
      setMealType,
      addFlavor,
      removeFlavor,
      toggleFlavor,
      addDietaryPreference,
      removeDietaryPreference,
      addAllergy,
      removeAllergy,
      addCuisine,
      removeCuisine,
      hasCuisine,
      addIngredient,
      removeIngredient,
      hasIngredient,
      addCookingMethod,
      removeCookingMethod,
      hasCookingMethod,
      totalItems,
      clearQueue,
      seedFromQuiz,
    ],
  );

  return (
    <RecipeBuilderContext.Provider value={contextValue}>
      {children}
    </RecipeBuilderContext.Provider>
  );
}

// ===== Hook =====

export function useRecipeBuilder(): RecipeBuilderContextType {
  const context = useContext(RecipeBuilderContext);
  if (!context) {
    throw new Error(
      "useRecipeBuilder must be used within a RecipeBuilderProvider",
    );
  }
  return context;
}
