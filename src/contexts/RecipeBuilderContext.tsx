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
import { z } from "zod";
import { quizCosmicRequestSchema, type QuizCosmicRequest } from "@/components/home/quiz/quizIntegrations";
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

export interface RecipeBuilderState {
  mealType: MealType | null;
  flavors: FlavorPreference[];
  dietaryPreferences: string[];
  allergies: string[];
  selectedCuisines: string[];
  selectedIngredients: SelectedIngredient[];
  selectedCookingMethods: string[];
  /** Complete, validated culinary brief from the homepage quiz. */
  quizBrief: QuizCosmicRequest | null;
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
  applyQuizBrief: (state: RecipeBuilderState) => void;
  clearQuizBrief: () => void;
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
};

const savedBuilderSchema = z.object({
  mealType: z.enum(["Breakfast", "Lunch", "Dinner", "Snack"]).nullable().default(null),
  flavors: z.array(z.enum(["spicy", "sweet", "savory", "bitter", "sour", "umami"])).default([]),
  dietaryPreferences: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
  selectedCuisines: z.array(z.string()).default([]),
  selectedIngredients: z.array(z.object({ name: z.string().min(1), category: z.string().optional(), elementalProperties: z.object({ Fire: z.number().optional(), Water: z.number().optional(), Earth: z.number().optional(), Air: z.number().optional() }).optional() })).default([]),
  selectedCookingMethods: z.array(z.string()).default([]),
  quizBrief: quizCosmicRequestSchema.nullable().catch(null).default(null),
});

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
        const raw: unknown = JSON.parse(stored);
        const parsed = savedBuilderSchema.safeParse(raw);
        if (!parsed.success) return;
        setState({
          ...parsed.data,
          selectedIngredients: parsed.data.selectedIngredients.map((ingredient) => ({
            name: ingredient.name,
            ...(ingredient.category !== undefined ? { category: ingredient.category } : {}),
            ...(ingredient.elementalProperties ? { elementalProperties: Object.fromEntries(Object.entries(ingredient.elementalProperties).filter(([, value]) => value !== undefined)) } : {}),
          })),
        });
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

  const applyQuizBrief = useCallback((next: RecipeBuilderState) => {
    setState(next);
  }, []);
  const clearQuizBrief = useCallback(() => {
    setState((previous) => ({ ...previous, quizBrief: null }));
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
      applyQuizBrief,
      clearQuizBrief,
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
      totalItems,
      clearQueue,
      applyQuizBrief,
      clearQuizBrief,
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
