"use client";

/**
 * Menu Planner Context
 * Provides global state management for the weekly menu planning system
 *
 * @file src/contexts/MenuPlannerContext.tsx
 * @created 2026-01-10
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import type {
  WeeklyMenu,
  MealSlot,
  DayOfWeek,
  MealType,
  GroceryItem,
  DailyNutritionTotals,
  PlanetarySnapshot,
  MenuTemplate,
  WeeklyMenuStats,
  CalendarNavigation,
} from "@/types/menuPlanner";
import type {
  WeeklyMenuCircuitMetrics,
  DayCircuitMetrics,
  MealCircuitMetrics,
  CircuitBottleneck,
  CircuitImprovementSuggestion,
  CircuitOptimizationGoal,
} from "@/types/kinetics";
import {
  getWeekStartDate,
  getWeekEndDate,
  PLANETARY_DAY_RULERS,
} from "@/types/menuPlanner";
import type { Recipe } from "@/types/recipe";
import { logger } from "@/utils/logger";
import { generateGroceryList } from "@/utils/groceryListGenerator";
import { calculateMealCircuit } from "@/utils/mealCircuitCalculations";
import { calculateDayCircuit, getMealsForDay } from "@/utils/dayCircuitCalculations";
import { calculateWeeklyCircuit } from "@/utils/weeklyCircuitCalculations";
import { findCircuitBottlenecks, generateCircuitSuggestions } from "@/utils/circuitOptimization";
import { generateDayRecommendations } from "@/utils/menuPlanner/recommendationBridge";
import type { AstrologicalState } from "@/utils/menuPlanner/recommendationBridge";
import { useAstrologicalState } from "@/hooks/useAstrologicalState";

/**
 * Context type definition
 */
interface MenuPlannerContextType {
  // Current menu state
  currentMenu: WeeklyMenu | null;
  isLoading: boolean;
  error: Error | null;

  // Circuit metrics (NEW - Phase 3A)
  weeklyCircuitMetrics: WeeklyMenuCircuitMetrics | null;
  dayCircuitMetrics: Record<DayOfWeek, DayCircuitMetrics | null>;
  mealCircuitMetrics: Record<string, MealCircuitMetrics | null>; // keyed by mealSlotId

  // Calendar navigation
  navigation: CalendarNavigation;

  // Meal operations
  addMealToSlot: (
    dayOfWeek: DayOfWeek,
    mealType: MealType,
    recipe: Recipe,
    servings?: number,
  ) => Promise<void>;
  removeMealFromSlot: (mealSlotId: string) => Promise<void>;
  updateMealServings: (mealSlotId: string, servings: number) => Promise<void>;
  copyMeal: (
    sourceMealSlotId: string,
    targetDay: DayOfWeek,
    targetMealType: MealType,
  ) => Promise<void>;
  moveMeal: (sourceMealSlotId: string, targetMealSlotId: string) => Promise<void>;
  swapMeals: (mealSlotId1: string, mealSlotId2: string) => Promise<void>;
  copyMealToSlots: (
    sourceMealSlotId: string,
    targetSlotIds: string[],
    servings?: number,
  ) => Promise<void>;
  moveMealToSlots: (
    sourceMealSlotId: string,
    targetSlotIds: string[],
    servings?: number,
  ) => Promise<void>;

  // Bulk operations
  clearDay: (dayOfWeek: DayOfWeek) => Promise<void>;
  clearWeek: () => Promise<void>;
  regenerateDay: (dayOfWeek: DayOfWeek) => Promise<void>;
  generateMealsForDay: (
    dayOfWeek: DayOfWeek,
    options?: {
      mealTypes?: MealType[];
      dietaryRestrictions?: string[];
      useCurrentPlanetary?: boolean;
    },
  ) => Promise<void>;

  // Grocery list
  groceryList: GroceryItem[];
  updateGroceryItem: (itemId: string, updates: Partial<GroceryItem>) => void;
  regenerateGroceryList: () => void;

  // Menu templates
  saveAsTemplate: (name: string, description?: string) => Promise<void>;
  loadTemplate: (templateId: string) => Promise<void>;

  // Statistics
  weeklyStats: WeeklyMenuStats | null;
  refreshStats: () => void;

  // Circuit operations (NEW - Phase 3A)
  calculateMealCircuit: (mealSlotId: string) => Promise<MealCircuitMetrics | null>;
  calculateDayCircuit: (dayOfWeek: DayOfWeek) => Promise<DayCircuitMetrics | null>;
  calculateWeeklyCircuit: () => Promise<WeeklyMenuCircuitMetrics | null>;
  refreshCircuitMetrics: () => Promise<void>;
  findBottlenecks: () => CircuitBottleneck[];
  getSuggestions: () => CircuitImprovementSuggestion[];

  // Persistence
  saveMenu: () => Promise<void>;
  loadMenu: (menuId: string) => Promise<void>;
}

/**
 * Create context with default values
 */
const MenuPlannerContext = createContext<MenuPlannerContextType | undefined>(
  undefined,
);

/**
 * Hook to use the menu planner context
 */
export function useMenuPlanner(): MenuPlannerContextType {
  const context = useContext(MenuPlannerContext);
  if (!context) {
    throw new Error(
      "useMenuPlanner must be used within a MenuPlannerProvider",
    );
  }
  return context;
}

/**
 * Helper to create an empty meal slot
 */
function createEmptyMealSlot(
  dayOfWeek: DayOfWeek,
  mealType: MealType,
  planetarySnapshot: PlanetarySnapshot,
): MealSlot {
  return {
    id: `${dayOfWeek}-${mealType}-${Date.now()}`,
    dayOfWeek,
    mealType,
    servings: 1,
    planetarySnapshot,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Helper to create initial weekly menu
 */
function createInitialMenu(weekStartDate: Date): WeeklyMenu {
  const meals: MealSlot[] = [];
  const nutritionalTotals: Record<DayOfWeek, DailyNutritionTotals> = {} as any;

  // Initialize empty meals for each day and meal type
  for (let day = 0; day < 7; day++) {
    const dayOfWeek = day as DayOfWeek;

    // Create default planetary snapshot
    const planetarySnapshot: PlanetarySnapshot = {
      dominantPlanet: PLANETARY_DAY_RULERS[dayOfWeek],
      zodiacSign: "aries" as any, // Will be updated with real data
      lunarPhase: "waxing crescent" as any,
      elementalState: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
      timestamp: new Date(weekStartDate.getTime() + day * 24 * 60 * 60 * 1000),
    };

    // Create empty meal slots
    const mealTypes: MealType[] = ["breakfast", "lunch", "dinner", "snack"];
    mealTypes.forEach((mealType) => {
      meals.push(createEmptyMealSlot(dayOfWeek, mealType, planetarySnapshot));
    });

    // Initialize nutrition totals
    nutritionalTotals[dayOfWeek] = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      gregsEnergy: 0,
      monicaConstant: 0,
      kalchm: 0,
      elementalBalance: { Fire: 0, Water: 0, Earth: 0, Air: 0 },
    };
  }

  return {
    id: `menu-${Date.now()}`,
    weekStartDate,
    weekEndDate: getWeekEndDate(weekStartDate),
    meals,
    nutritionalTotals,
    groceryList: [],
    savedAsTemplate: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Menu Planner Provider Component
 */
export function MenuPlannerProvider({ children }: { children: ReactNode }) {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() =>
    getWeekStartDate(new Date()),
  );
  const [currentMenu, setCurrentMenu] = useState<WeeklyMenu | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyMenuStats | null>(null);

  // Circuit metrics state (NEW - Phase 3A)
  const [weeklyCircuitMetrics, setWeeklyCircuitMetrics] =
    useState<WeeklyMenuCircuitMetrics | null>(null);
  const [dayCircuitMetrics, setDayCircuitMetrics] = useState<
    Record<DayOfWeek, DayCircuitMetrics | null>
  >({} as any);
  const [mealCircuitMetrics, setMealCircuitMetrics] = useState<
    Record<string, MealCircuitMetrics | null>
  >({});

  // Astrological state for planetary recommendations (Phase 3)
  const astrologicalState = useAstrologicalState();

  const isMountedRef = useRef(false);

  /**
   * Initialize menu on mount
   */
  useEffect(() => {
    isMountedRef.current = true;

    const initializeMenu = async () => {
      try {
        // Try to load from localStorage
        const savedMenuJson = localStorage.getItem("currentWeeklyMenu");
        if (savedMenuJson) {
          const savedMenu = JSON.parse(savedMenuJson) as WeeklyMenu;
          // Check if saved menu is for current week
          const savedWeekStart = new Date(savedMenu.weekStartDate);
          if (
            savedWeekStart.getTime() === currentWeekStart.getTime() &&
            isMountedRef.current
          ) {
            setCurrentMenu(savedMenu);
            setGroceryList(savedMenu.groceryList || []);
            setIsLoading(false);
            logger.info("Loaded menu from localStorage");
            return;
          }
        }

        // Create new menu for current week
        const newMenu = createInitialMenu(currentWeekStart);
        if (isMountedRef.current) {
          setCurrentMenu(newMenu);
          setIsLoading(false);
          logger.info("Created new weekly menu");
        }
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error("Failed to initialize menu");
        logger.error("Menu initialization error:", err);
        if (isMountedRef.current) {
          setError(error);
          setIsLoading(false);
        }
      }
    };

    initializeMenu();

    return () => {
      isMountedRef.current = false;
    };
  }, [currentWeekStart]);

  /**
   * Save menu to localStorage whenever it changes
   */
  useEffect(() => {
    if (currentMenu && !isLoading) {
      try {
        localStorage.setItem("currentWeeklyMenu", JSON.stringify(currentMenu));
        logger.debug("Menu saved to localStorage");
      } catch (err) {
        logger.error("Failed to save menu to localStorage:", err);
      }
    }
  }, [currentMenu, isLoading]);

  /**
   * Calendar Navigation
   */
  const goToNextWeek = useCallback(() => {
    const nextWeek = new Date(currentWeekStart);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setCurrentWeekStart(nextWeek);
  }, [currentWeekStart]);

  const goToPreviousWeek = useCallback(() => {
    const previousWeek = new Date(currentWeekStart);
    previousWeek.setDate(previousWeek.getDate() - 7);
    setCurrentWeekStart(previousWeek);
  }, [currentWeekStart]);

  const goToCurrentWeek = useCallback(() => {
    setCurrentWeekStart(getWeekStartDate(new Date()));
  }, []);

  const goToWeek = useCallback((date: Date) => {
    setCurrentWeekStart(getWeekStartDate(date));
  }, []);

  const navigation: CalendarNavigation = useMemo(
    () => ({
      currentWeekStart,
      goToNextWeek,
      goToPreviousWeek,
      goToCurrentWeek,
      goToWeek,
    }),
    [
      currentWeekStart,
      goToNextWeek,
      goToPreviousWeek,
      goToCurrentWeek,
      goToWeek,
    ],
  );

  /**
   * Add meal to slot
   */
  const addMealToSlot = useCallback(
    async (
      dayOfWeek: DayOfWeek,
      mealType: MealType,
      recipe: Recipe,
      servings: number = 1,
    ) => {
      if (!currentMenu) return;

      try {
        const updatedMeals = currentMenu.meals.map((meal) => {
          if (meal.dayOfWeek === dayOfWeek && meal.mealType === mealType) {
            return {
              ...meal,
              recipe,
              servings,
              updatedAt: new Date(),
            };
          }
          return meal;
        });

        const updatedMenu = {
          ...currentMenu,
          meals: updatedMeals,
          updatedAt: new Date(),
        };

        setCurrentMenu(updatedMenu);
        logger.info(`Added ${recipe.name} to ${mealType} on day ${dayOfWeek}`);
      } catch (err) {
        logger.error("Failed to add meal:", err);
        throw err;
      }
    },
    [currentMenu],
  );

  /**
   * Remove meal from slot
   */
  const removeMealFromSlot = useCallback(
    async (mealSlotId: string) => {
      if (!currentMenu) return;

      try {
        const updatedMeals = currentMenu.meals.map((meal) => {
          if (meal.id === mealSlotId) {
            const { recipe, ...mealWithoutRecipe } = meal;
            return {
              ...mealWithoutRecipe,
              updatedAt: new Date(),
            };
          }
          return meal;
        });

        const updatedMenu = {
          ...currentMenu,
          meals: updatedMeals,
          updatedAt: new Date(),
        };

        setCurrentMenu(updatedMenu);
        logger.info(`Removed meal from slot ${mealSlotId}`);
      } catch (err) {
        logger.error("Failed to remove meal:", err);
        throw err;
      }
    },
    [currentMenu],
  );

  /**
   * Update meal servings
   */
  const updateMealServings = useCallback(
    async (mealSlotId: string, servings: number) => {
      if (!currentMenu) return;

      try {
        const updatedMeals = currentMenu.meals.map((meal) => {
          if (meal.id === mealSlotId) {
            return {
              ...meal,
              servings,
              updatedAt: new Date(),
            };
          }
          return meal;
        });

        const updatedMenu = {
          ...currentMenu,
          meals: updatedMeals,
          updatedAt: new Date(),
        };

        setCurrentMenu(updatedMenu);
        logger.info(`Updated servings for meal ${mealSlotId} to ${servings}`);
      } catch (err) {
        logger.error("Failed to update servings:", err);
        throw err;
      }
    },
    [currentMenu],
  );

  /**
   * Copy meal to another slot
   */
  const copyMeal = useCallback(
    async (
      sourceMealSlotId: string,
      targetDay: DayOfWeek,
      targetMealType: MealType,
    ) => {
      if (!currentMenu) return;

      try {
        const sourceMeal = currentMenu.meals.find(
          (m) => m.id === sourceMealSlotId,
        );
        if (!sourceMeal || !sourceMeal.recipe) {
          throw new Error("Source meal not found or has no recipe");
        }

        await addMealToSlot(
          targetDay,
          targetMealType,
          sourceMeal.recipe,
          sourceMeal.servings,
        );
        logger.info(
          `Copied meal from ${sourceMealSlotId} to ${targetDay}-${targetMealType}`,
        );
      } catch (err) {
        logger.error("Failed to copy meal:", err);
        throw err;
      }
    },
    [currentMenu, addMealToSlot],
  );

  /**
   * Move meal from one slot to another (clears source slot)
   */
  const moveMeal = useCallback(
    async (sourceMealSlotId: string, targetMealSlotId: string) => {
      if (!currentMenu) return;

      try {
        const sourceMeal = currentMenu.meals.find(
          (m) => m.id === sourceMealSlotId,
        );
        const targetMeal = currentMenu.meals.find(
          (m) => m.id === targetMealSlotId,
        );

        if (!sourceMeal || !sourceMeal.recipe) {
          throw new Error("Source meal not found or has no recipe");
        }

        if (!targetMeal) {
          throw new Error("Target meal slot not found");
        }

        // Check if target slot already has a recipe
        if (targetMeal.recipe) {
          throw new Error("Target slot is already occupied");
        }

        const updatedMeals = currentMenu.meals.map((meal) => {
          if (meal.id === targetMealSlotId) {
            // Add recipe to target slot
            return {
              ...meal,
              recipe: sourceMeal.recipe,
              servings: sourceMeal.servings,
              updatedAt: new Date(),
            };
          }
          if (meal.id === sourceMealSlotId) {
            // Clear source slot
            const { recipe, ...mealWithoutRecipe } = meal;
            return {
              ...mealWithoutRecipe,
              updatedAt: new Date(),
            };
          }
          return meal;
        });

        const updatedMenu = {
          ...currentMenu,
          meals: updatedMeals,
          updatedAt: new Date(),
        };

        setCurrentMenu(updatedMenu);
        logger.info(`Moved meal from ${sourceMealSlotId} to ${targetMealSlotId}`);
      } catch (err) {
        logger.error("Failed to move meal:", err);
        throw err;
      }
    },
    [currentMenu],
  );

  /**
   * Swap meals between two slots
   */
  const swapMeals = useCallback(
    async (mealSlotId1: string, mealSlotId2: string) => {
      if (!currentMenu) return;

      try {
        const meal1 = currentMenu.meals.find((m) => m.id === mealSlotId1);
        const meal2 = currentMenu.meals.find((m) => m.id === mealSlotId2);

        if (!meal1 || !meal2) {
          throw new Error("One or both meal slots not found");
        }

        const updatedMeals = currentMenu.meals.map((meal) => {
          if (meal.id === mealSlotId1) {
            return {
              ...meal,
              recipe: meal2.recipe,
              servings: meal2.servings,
              updatedAt: new Date(),
            };
          }
          if (meal.id === mealSlotId2) {
            return {
              ...meal,
              recipe: meal1.recipe,
              servings: meal1.servings,
              updatedAt: new Date(),
            };
          }
          return meal;
        });

        const updatedMenu = {
          ...currentMenu,
          meals: updatedMeals,
          updatedAt: new Date(),
        };

        setCurrentMenu(updatedMenu);
        logger.info(`Swapped meals between ${mealSlotId1} and ${mealSlotId2}`);
      } catch (err) {
        logger.error("Failed to swap meals:", err);
        throw err;
      }
    },
    [currentMenu],
  );

  /**
   * Copy meal to multiple slots
   */
  const copyMealToSlots = useCallback(
    async (
      sourceMealSlotId: string,
      targetSlotIds: string[],
      servings?: number,
    ) => {
      if (!currentMenu) return;

      try {
        const sourceMeal = currentMenu.meals.find(
          (m) => m.id === sourceMealSlotId,
        );
        if (!sourceMeal || !sourceMeal.recipe) {
          throw new Error("Source meal not found or has no recipe");
        }

        const useServings = servings ?? sourceMeal.servings;

        const updatedMeals = currentMenu.meals.map((meal) => {
          if (targetSlotIds.includes(meal.id)) {
            return {
              ...meal,
              recipe: sourceMeal.recipe,
              servings: useServings,
              updatedAt: new Date(),
            };
          }
          return meal;
        });

        const updatedMenu = {
          ...currentMenu,
          meals: updatedMeals,
          updatedAt: new Date(),
        };

        setCurrentMenu(updatedMenu);
        logger.info(
          `Copied meal from ${sourceMealSlotId} to ${targetSlotIds.length} slots`,
        );
      } catch (err) {
        logger.error("Failed to copy meal to slots:", err);
        throw err;
      }
    },
    [currentMenu],
  );

  /**
   * Move meal to multiple slots (clears source slot)
   */
  const moveMealToSlots = useCallback(
    async (
      sourceMealSlotId: string,
      targetSlotIds: string[],
      servings?: number,
    ) => {
      if (!currentMenu) return;

      try {
        const sourceMeal = currentMenu.meals.find(
          (m) => m.id === sourceMealSlotId,
        );
        if (!sourceMeal || !sourceMeal.recipe) {
          throw new Error("Source meal not found or has no recipe");
        }

        const useServings = servings ?? sourceMeal.servings;

        const updatedMeals = currentMenu.meals.map((meal) => {
          if (targetSlotIds.includes(meal.id)) {
            // Add recipe to target slots
            return {
              ...meal,
              recipe: sourceMeal.recipe,
              servings: useServings,
              updatedAt: new Date(),
            };
          }
          if (meal.id === sourceMealSlotId) {
            // Clear source slot
            const { recipe, ...mealWithoutRecipe } = meal;
            return {
              ...mealWithoutRecipe,
              updatedAt: new Date(),
            };
          }
          return meal;
        });

        const updatedMenu = {
          ...currentMenu,
          meals: updatedMeals,
          updatedAt: new Date(),
        };

        setCurrentMenu(updatedMenu);
        logger.info(
          `Moved meal from ${sourceMealSlotId} to ${targetSlotIds.length} slots`,
        );
      } catch (err) {
        logger.error("Failed to move meal to slots:", err);
        throw err;
      }
    },
    [currentMenu],
  );

  /**
   * Clear all meals for a day
   */
  const clearDay = useCallback(
    async (dayOfWeek: DayOfWeek) => {
      if (!currentMenu) return;

      try {
        const updatedMeals = currentMenu.meals.map((meal) => {
          if (meal.dayOfWeek === dayOfWeek) {
            const { recipe, ...mealWithoutRecipe } = meal;
            return {
              ...mealWithoutRecipe,
              updatedAt: new Date(),
            };
          }
          return meal;
        });

        const updatedMenu = {
          ...currentMenu,
          meals: updatedMeals,
          updatedAt: new Date(),
        };

        setCurrentMenu(updatedMenu);
        logger.info(`Cleared all meals for day ${dayOfWeek}`);
      } catch (err) {
        logger.error("Failed to clear day:", err);
        throw err;
      }
    },
    [currentMenu],
  );

  /**
   * Clear entire week
   */
  const clearWeek = useCallback(async () => {
    if (!currentMenu) return;

    try {
      const updatedMeals = currentMenu.meals.map((meal) => {
        const { recipe, ...mealWithoutRecipe } = meal;
        return {
          ...mealWithoutRecipe,
          updatedAt: new Date(),
        };
      });

      const updatedMenu = {
        ...currentMenu,
        meals: updatedMeals,
        groceryList: [],
        updatedAt: new Date(),
      };

      setCurrentMenu(updatedMenu);
      setGroceryList([]);
      logger.info("Cleared entire week");
    } catch (err) {
      logger.error("Failed to clear week:", err);
      throw err;
    }
  }, [currentMenu]);

  /**
   * Regenerate day with new recommendations
   * TODO: Implement actual recommendation logic in Phase 3
   */
  const regenerateDay = useCallback(
    async (dayOfWeek: DayOfWeek) => {
      if (!currentMenu) return;

      try {
        // For now, just clear the day
        // In Phase 3, this will call the recommendation engine
        await clearDay(dayOfWeek);
        logger.info(`Regenerated day ${dayOfWeek} (placeholder)`);
      } catch (err) {
        logger.error("Failed to regenerate day:", err);
        throw err;
      }
    },
    [currentMenu, clearDay],
  );

  /**
   * Generate meals for a specific day using planetary recommendations
   * Phase 3: Smart recommendation feature
   */
  const generateMealsForDay = useCallback(
    async (
      dayOfWeek: DayOfWeek,
      options: {
        mealTypes?: MealType[];
        dietaryRestrictions?: string[];
        useCurrentPlanetary?: boolean;
      } = {},
    ) => {
      if (!currentMenu) return;

      try {
        const {
          mealTypes = ["breakfast", "lunch", "dinner"],
          dietaryRestrictions = [],
          useCurrentPlanetary = true,
        } = options;

        logger.info(`Generating meals for day ${dayOfWeek}`, {
          mealTypes,
          dietaryRestrictions,
        });

        // Build astrological state for recommendations
        const astroState: AstrologicalState = {
          currentZodiac: astrologicalState.currentZodiac || "",
          lunarPhase: astrologicalState.lunarPhase || "waxing crescent",
          activePlanets: astrologicalState.activePlanets || [],
          domElements: astrologicalState.domElements || {
            Fire: 0,
            Water: 0,
            Earth: 0,
            Air: 0,
          },
          currentPlanetaryHour: astrologicalState.currentPlanetaryHour || undefined,
        };

        // Generate recommendations using planetary intelligence
        const recommendations = await generateDayRecommendations(
          dayOfWeek,
          astroState,
          {
            mealTypes,
            dietaryRestrictions,
            useCurrentPlanetary: useCurrentPlanetary,
            maxRecipesPerMeal: 1, // Take top recommendation per meal
          },
        );

        logger.info(
          `Generated ${recommendations.length} meal recommendations for day ${dayOfWeek}`,
          {
            recommendations: recommendations.map((r) => ({
              mealType: r.mealType,
              score: r.score,
              recipeName: r.recipe?.name || "N/A",
            })),
          },
        );

        if (recommendations.length > 0) {
          // Add recommended recipes to meal slots (only fill empty slots)
          for (const recommendation of recommendations) {
            // Check if this slot already has a recipe
            const existingSlot = currentMenu.meals.find(
              (m) =>
                m.dayOfWeek === dayOfWeek &&
                m.mealType === recommendation.mealType &&
                m.recipe,
            );

            // Only add if slot is empty
            if (!existingSlot) {
              await addMealToSlot(
                dayOfWeek,
                recommendation.mealType,
                recommendation.recipe,
                recommendation.score >= 0.8 ? 2 : 1, // Suggest 2 servings for highly aligned meals
              );
            }
          }
        } else {
          logger.info(
            `No matching recipes found for day ${dayOfWeek} with current filters`,
          );
        }

        logger.info(`Meal generation complete for day ${dayOfWeek}`);
      } catch (err) {
        logger.error("Failed to generate meals for day:", err);
        throw err;
      }
    },
    [currentMenu, astrologicalState, addMealToSlot],
  );

  /**
   * Update grocery item
   */
  const updateGroceryItem = useCallback(
    (itemId: string, updates: Partial<GroceryItem>) => {
      setGroceryList((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, ...updates } : item)),
      );
    },
    [],
  );

  /**
   * Regenerate grocery list from current meals
   * Uses enhanced grocery list generator with category detection and unit conversion
   */
  const regenerateGroceryList = useCallback(() => {
    if (!currentMenu) return;

    try {
      // Generate using enhanced grocery list generator
      const newGroceryList = generateGroceryList(currentMenu.meals, {
        consolidateBy: "ingredient",
        convertUnits: true,
        excludePantryItems: false,
      });

      setGroceryList(newGroceryList);
      logger.info(`Generated grocery list with ${newGroceryList.length} items`);
    } catch (err) {
      logger.error("Failed to regenerate grocery list:", err);
    }
  }, [currentMenu]);

  /**
   * Save as template
   * TODO: Implement backend persistence in Phase 4
   */
  const saveAsTemplate = useCallback(
    async (name: string, description?: string) => {
      if (!currentMenu) return;

      try {
        const template: MenuTemplate = {
          id: `template-${Date.now()}`,
          name,
          description,
          meals: currentMenu.meals.map((m) => ({
            dayOfWeek: m.dayOfWeek,
            mealType: m.mealType,
            recipe: m.recipe,
            servings: m.servings,
            notes: m.notes,
          })),
          isPublic: false,
          usageCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Save to localStorage for now
        const templates = JSON.parse(
          localStorage.getItem("menuTemplates") || "[]",
        );
        templates.push(template);
        localStorage.setItem("menuTemplates", JSON.stringify(templates));

        logger.info(`Saved menu as template: ${name}`);
      } catch (err) {
        logger.error("Failed to save template:", err);
        throw err;
      }
    },
    [currentMenu],
  );

  /**
   * Load template
   * TODO: Implement backend loading in Phase 4
   */
  const loadTemplate = useCallback(
    async (templateId: string) => {
      try {
        const templates = JSON.parse(
          localStorage.getItem("menuTemplates") || "[]",
        );
        const template = templates.find((t: any) => t.id === templateId);

        if (!template) {
          throw new Error("Template not found");
        }

        // Create new menu from template
        const newMenu = createInitialMenu(currentWeekStart);
        newMenu.meals = template.meals.map((m: any, index: number) => ({
          ...m,
          id: `${m.dayOfWeek}-${m.mealType}-${Date.now()}-${index}`,
          planetarySnapshot: newMenu.meals.find(
            (nm) =>
              nm.dayOfWeek === m.dayOfWeek && nm.mealType === m.mealType,
          )!.planetarySnapshot,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

        setCurrentMenu(newMenu);
        logger.info(`Loaded template: ${template.name}`);
      } catch (err) {
        logger.error("Failed to load template:", err);
        throw err;
      }
    },
    [currentWeekStart],
  );

  /**
   * Refresh weekly statistics
   * TODO: Implement full stats calculation in Phase 3
   */
  const refreshStats = useCallback(() => {
    if (!currentMenu) return;

    try {
      const totalMeals = currentMenu.meals.filter((m) => m.recipe).length;
      const uniqueRecipes = new Set(
        currentMenu.meals.filter((m) => m.recipe).map((m) => m.recipe!.id),
      ).size;

      const stats: WeeklyMenuStats = {
        totalMeals,
        totalRecipes: uniqueRecipes,
        averageGregsEnergy: 0, // TODO: Calculate
        averageMonica: 0, // TODO: Calculate
        elementalDistribution: { Fire: 0, Water: 0, Earth: 0, Air: 0 },
        cuisineDistribution: {},
        dietaryCompliance: {
          vegetarian: false,
          vegan: false,
          glutenFree: false,
          dairyFree: false,
        },
        missingMeals: currentMenu.meals
          .filter((m) => !m.recipe)
          .map((m) => ({
            dayOfWeek: m.dayOfWeek,
            mealType: m.mealType,
          })),
      };

      setWeeklyStats(stats);
    } catch (err) {
      logger.error("Failed to refresh stats:", err);
    }
  }, [currentMenu]);

  /**
   * Save menu (persistence)
   */
  const saveMenu = useCallback(async () => {
    if (!currentMenu) return;

    try {
      // For now, just use localStorage
      localStorage.setItem("currentWeeklyMenu", JSON.stringify(currentMenu));
      logger.info("Menu saved");
    } catch (err) {
      logger.error("Failed to save menu:", err);
      throw err;
    }
  }, [currentMenu]);

  /**
   * Load menu by ID
   */
  const loadMenu = useCallback(async (menuId: string) => {
    try {
      // TODO: Implement backend loading
      logger.info(`Loading menu ${menuId} (not yet implemented)`);
    } catch (err) {
      logger.error("Failed to load menu:", err);
      throw err;
    }
  }, []);

  /**
   * Circuit Calculations (NEW - Phase 3A)
   */

  /**
   * Calculate circuit metrics for a single meal slot
   */
  const calculateMealCircuitMetrics = useCallback(
    async (mealSlotId: string): Promise<MealCircuitMetrics | null> => {
      if (!currentMenu) return null;

      const mealSlot = currentMenu.meals.find((m) => m.id === mealSlotId);
      if (!mealSlot) return null;

      try {
        const metrics = calculateMealCircuit(
          mealSlot,
          mealSlot.planetarySnapshot.planetaryPositions
        );

        if (metrics) {
          // Update state
          setMealCircuitMetrics((prev) => ({
            ...prev,
            [mealSlotId]: metrics,
          }));
        }

        return metrics;
      } catch (err) {
        logger.error(`Failed to calculate meal circuit for ${mealSlotId}:`, err);
        return null;
      }
    },
    [currentMenu]
  );

  /**
   * Calculate circuit metrics for a specific day
   */
  const calculateDayCircuitMetrics = useCallback(
    async (dayOfWeek: DayOfWeek): Promise<DayCircuitMetrics | null> => {
      if (!currentMenu) return null;

      try {
        const dayMeals = getMealsForDay(currentMenu.meals, dayOfWeek);
        const metrics = calculateDayCircuit(
          dayMeals,
          dayOfWeek,
          dayMeals[0]?.planetarySnapshot.planetaryPositions
        );

        // Update state
        setDayCircuitMetrics((prev) => ({
          ...prev,
          [dayOfWeek]: metrics,
        }));

        return metrics;
      } catch (err) {
        logger.error(`Failed to calculate day circuit for day ${dayOfWeek}:`, err);
        return null;
      }
    },
    [currentMenu]
  );

  /**
   * Calculate circuit metrics for the entire weekly menu
   */
  const calculateWeeklyCircuitMetrics = useCallback(
    async (): Promise<WeeklyMenuCircuitMetrics | null> => {
      if (!currentMenu) return null;

      try {
        const metrics = calculateWeeklyCircuit(
          currentMenu,
          currentMenu.meals[0]?.planetarySnapshot.planetaryPositions
        );

        // Update state
        setWeeklyCircuitMetrics(metrics);

        // Also update day circuits from weekly metrics
        if (metrics) {
          setDayCircuitMetrics({
            0: metrics.days.sunday,
            1: metrics.days.monday,
            2: metrics.days.tuesday,
            3: metrics.days.wednesday,
            4: metrics.days.thursday,
            5: metrics.days.friday,
            6: metrics.days.saturday,
          } as any);
        }

        return metrics;
      } catch (err) {
        logger.error("Failed to calculate weekly circuit:", err);
        return null;
      }
    },
    [currentMenu]
  );

  /**
   * Refresh all circuit metrics
   */
  const refreshCircuitMetrics = useCallback(async () => {
    if (!currentMenu) return;

    try {
      // Calculate weekly circuit (this also calculates all days and meals)
      await calculateWeeklyCircuitMetrics();
      logger.info("Circuit metrics refreshed");
    } catch (err) {
      logger.error("Failed to refresh circuit metrics:", err);
    }
  }, [currentMenu, calculateWeeklyCircuitMetrics]);

  /**
   * Find bottlenecks in the current menu
   */
  const findBottlenecks = useCallback((): CircuitBottleneck[] => {
    if (!currentMenu || !dayCircuitMetrics) return [];

    // Filter out null day circuits
    const validDayCircuits = Object.values(dayCircuitMetrics).filter(
      (d): d is DayCircuitMetrics => d !== null
    );

    // Need all 7 days to analyze bottlenecks
    if (validDayCircuits.length < 7) return [];

    try {
      return findCircuitBottlenecks(
        dayCircuitMetrics as Record<DayOfWeek, DayCircuitMetrics>,
        currentMenu
      );
    } catch (err) {
      logger.error("Failed to find bottlenecks:", err);
      return [];
    }
  }, [currentMenu, dayCircuitMetrics]);

  /**
   * Get improvement suggestions for the current menu
   */
  const getSuggestions = useCallback((): CircuitImprovementSuggestion[] => {
    if (!currentMenu || !dayCircuitMetrics) return [];

    // Filter out null day circuits
    const validDayCircuits = Object.values(dayCircuitMetrics).filter(
      (d): d is DayCircuitMetrics => d !== null
    );

    // Need all 7 days to generate suggestions
    if (validDayCircuits.length < 7) return [];

    try {
      return generateCircuitSuggestions(
        dayCircuitMetrics as Record<DayOfWeek, DayCircuitMetrics>,
        currentMenu,
        currentMenu.meals[0]?.planetarySnapshot.planetaryPositions
      );
    } catch (err) {
      logger.error("Failed to generate suggestions:", err);
      return [];
    }
  }, [currentMenu, dayCircuitMetrics]);

  /**
   * Auto-refresh circuit metrics when menu changes
   */
  useEffect(() => {
    if (currentMenu && isMountedRef.current) {
      // Debounce circuit refresh to avoid excessive calculations
      const timeoutId = setTimeout(() => {
        refreshCircuitMetrics();
      }, 500); // 500ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [currentMenu, refreshCircuitMetrics]);

  /**
   * Context value
   */
  const contextValue = useMemo<MenuPlannerContextType>(
    () => ({
      currentMenu,
      isLoading,
      error,
      weeklyCircuitMetrics,
      dayCircuitMetrics,
      mealCircuitMetrics,
      navigation,
      addMealToSlot,
      removeMealFromSlot,
      updateMealServings,
      copyMeal,
      moveMeal,
      swapMeals,
      copyMealToSlots,
      moveMealToSlots,
      clearDay,
      clearWeek,
      regenerateDay,
      generateMealsForDay,
      groceryList,
      updateGroceryItem,
      regenerateGroceryList,
      saveAsTemplate,
      loadTemplate,
      weeklyStats,
      refreshStats,
      calculateMealCircuit: calculateMealCircuitMetrics,
      calculateDayCircuit: calculateDayCircuitMetrics,
      calculateWeeklyCircuit: calculateWeeklyCircuitMetrics,
      refreshCircuitMetrics,
      findBottlenecks,
      getSuggestions,
      saveMenu,
      loadMenu,
    }),
    [
      currentMenu,
      isLoading,
      error,
      weeklyCircuitMetrics,
      dayCircuitMetrics,
      mealCircuitMetrics,
      navigation,
      addMealToSlot,
      removeMealFromSlot,
      updateMealServings,
      copyMeal,
      moveMeal,
      swapMeals,
      copyMealToSlots,
      moveMealToSlots,
      clearDay,
      clearWeek,
      regenerateDay,
      generateMealsForDay,
      groceryList,
      updateGroceryItem,
      regenerateGroceryList,
      saveAsTemplate,
      loadTemplate,
      weeklyStats,
      refreshStats,
      calculateMealCircuitMetrics,
      calculateDayCircuitMetrics,
      calculateWeeklyCircuitMetrics,
      refreshCircuitMetrics,
      findBottlenecks,
      getSuggestions,
      saveMenu,
      loadMenu,
    ],
  );

  return (
    <MenuPlannerContext.Provider value={contextValue}>
      {children}
    </MenuPlannerContext.Provider>
  );
}

export default MenuPlannerProvider;
