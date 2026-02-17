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

export type FlavorPreference = "spicy" | "sweet" | "savory" | "bitter" | "sour" | "umami";

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

export type PrepTimeOption = 15 | 30 | 45 | 60 | null;

export type ServingsOption = "1-2" | "3-4" | "5-6" | "7+" | null;

export interface RecipeBuilderState {
  mealType: MealType | null;
  flavors: FlavorPreference[];
  dietaryPreferences: string[];
  allergies: string[];
  selectedCuisines: string[];
  selectedIngredients: SelectedIngredient[];
  selectedCookingMethods: string[];
  prepTime: PrepTimeOption;
  servings: ServingsOption;
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

  // Prep time & servings
  setPrepTime: (time: PrepTimeOption) => void;
  setServings: (servings: ServingsOption) => void;

  // Queue summary
  totalItems: number;

  // Actions
  clearQueue: () => void;
}

const initialState: RecipeBuilderState = {
  mealType: null,
  flavors: [],
  dietaryPreferences: [],
  allergies: [],
  selectedCuisines: [],
  selectedIngredients: [],
  selectedCookingMethods: [],
  prepTime: null,
  servings: null,
};

const RecipeBuilderContext = createContext<RecipeBuilderContextType | undefined>(
  undefined,
);

// ===== Provider =====

export function RecipeBuilderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<RecipeBuilderState>(initialState);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setState((prev) => ({ ...prev, ...parsed }));
        logger.info("Loaded recipe builder state from storage");
      }
    } catch (error) {
      logger.error("Failed to load recipe builder state:", error as any);
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
      logger.error("Failed to persist recipe builder state:", error as any);
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
            selectedCookingMethods: [
              ...prev.selectedCookingMethods,
              method,
            ],
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

  // --- Prep Time & Servings ---
  const setPrepTime = useCallback((time: PrepTimeOption) => {
    setState((prev) => ({ ...prev, prepTime: time }));
  }, []);

  const setServings = useCallback((s: ServingsOption) => {
    setState((prev) => ({ ...prev, servings: s }));
  }, []);

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
      setPrepTime,
      setServings,
      totalItems,
      clearQueue,
    }),
    [
      state,
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
      setPrepTime,
      setServings,
      totalItems,
      clearQueue,
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
