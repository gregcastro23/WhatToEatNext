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
import { useUser } from "@/contexts/UserContext";
import type { MonicaOptimizedRecipe } from "@/data/unified/recipeBuilding";
import { useAstrologicalState } from "@/hooks/useAstrologicalState";
import { reportQuestEvent } from "@/lib/questReporter";
import ChartComparisonService, {
  type ChartComparison,
} from "@/services/ChartComparisonService";
import type {
  WeeklyMenuCircuitMetrics,
  DayCircuitMetrics,
  MealCircuitMetrics,
  CircuitBottleneck,
  CircuitImprovementSuggestion,
  CircuitOptimizationGoal as _CircuitOptimizationGoal,
} from "@/types/kinetics";
import type {
  WeeklyMenu,
  MealSlot,
  DayOfWeek,
  MealType,
  GroceryItem,
  DailyNutritionTotals,
  PlanetarySnapshot,
  WeeklyMenuStats,
  CalendarNavigation,
} from "@/types/menuPlanner";
import {
  getWeekStartDate,
  getWeekEndDate,
  PLANETARY_DAY_RULERS,
} from "@/types/menuPlanner";
import {
  findCircuitBottlenecks,
  generateCircuitSuggestions,
} from "@/utils/circuitOptimization";
import {
  calculateDayCircuit,
  getMealsForDay,
} from "@/utils/dayCircuitCalculations";
import { generateGroceryList } from "@/utils/groceryListGenerator";
import {
  estimateWeeklyGroceryCost,
  calculateRecipeEstimatedCost as _calculateRecipeEstimatedCost,
  type RecipeCostEstimate as _RecipeCostEstimate,
} from "@/utils/instacart/priceEstimator";
import { logger } from "@/utils/logger";
import { calculateMealCircuit } from "@/utils/mealCircuitCalculations";
import {
  generateDayRecommendations,
  type RecommendedMeal as _RecommendedMeal,
  type AstrologicalState,
  type UserPersonalizationContext,
} from "@/utils/menuPlanner/recommendationBridge";
import PantryManager from "@/utils/pantryManager";
import { calculateWeeklyCircuit } from "@/utils/weeklyCircuitCalculations";

/**
 * Flavor preference type for generation
 */
export type FlavorPreference = "spicy" | "sweet" | "savory" | "bitter" | "sour" | "umami";

/**
 * Generation preferences for meal recommendation customization
 */
/**
 * Daily nutritional targets for meal generation.
 * When set, recommendations will prioritize recipes that fill nutritional gaps.
 * null values mean "use default RDA targets".
 */
export interface NutritionalTargets {
  dailyCalories: number | null;
  dailyProteinG: number | null;
  dailyCarbsG: number | null;
  dailyFatG: number | null;
  dailyFiberG: number | null;
  prioritizeProtein: boolean;
  prioritizeFiber: boolean;
}

export interface GenerationPreferences {
  preferredCuisines: string[];
  dietaryRestrictions: string[];
  excludeIngredients: string[];
  requiredIngredients: string[];
  preferredCookingMethods: string[];
  flavorPreferences: FlavorPreference[];
  maxPrepTimeMinutes: number | null; // null = no limit
  nutritionalTargets: NutritionalTargets;
}

const GENERATION_PREFS_STORAGE_KEY = "alchm-generation-preferences";

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

/**
 * Guest alchemist participant for synastry calculations
 */
export interface Participant {
  id: string;
  name: string;
  birthDate: string;
  birthTime?: string;
  location?: string;
}

/**
 * Context type definition
 */
interface MenuPlannerContextType {
  // Guest alchemist participants
  participants: Participant[];
  addParticipant: (participant: Omit<Participant, 'id'>, id?: string) => void;
  removeParticipant: (id: string) => void;
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
    recipe: MonicaOptimizedRecipe,
    servings?: number,
  ) => Promise<void>;
  removeMealFromSlot: (mealSlotId: string) => Promise<void>;
  updateMealServings: (mealSlotId: string, servings: number) => Promise<void>;
  copyMeal: (
    sourceMealSlotId: string,
    targetDay: DayOfWeek,
    targetMealType: MealType,
  ) => Promise<void>;
  moveMeal: (
    sourceMealSlotId: string,
    targetMealSlotId: string,
  ) => Promise<void>;
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
      preferredCuisines?: string[];
      excludeIngredients?: string[];
      requiredIngredients?: string[];
      preferredCookingMethods?: string[];
      flavorPreferences?: string[];
      maxPrepTimeMinutes?: number | null;
      useCurrentPlanetary?: boolean;
      /** Use user's natal chart for personalized recommendations */
      usePersonalization?: boolean;
    },
  ) => Promise<void>;

  // Sauce operations
  addSauceToMeal: (mealSlotId: string, sauceId: string, servings?: number) => void;
  removeSauceFromMeal: (mealSlotId: string) => void;
  updateSauceServings: (mealSlotId: string, servings: number) => void;

  // Meal lock operations
  lockMeal: (mealSlotId: string) => void;
  unlockMeal: (mealSlotId: string) => void;
  isMealLocked: (mealSlotId: string) => boolean;

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
  calculateMealCircuit: (
    mealSlotId: string,
  ) => Promise<MealCircuitMetrics | null>;
  calculateDayCircuit: (
    dayOfWeek: DayOfWeek,
  ) => Promise<DayCircuitMetrics | null>;
  calculateWeeklyCircuit: () => Promise<WeeklyMenuCircuitMetrics | null>;
  refreshCircuitMetrics: () => Promise<void>;
  findBottlenecks: () => CircuitBottleneck[];
  getSuggestions: () => CircuitImprovementSuggestion[];

  // Persistence
  saveMenu: () => Promise<void>;
  loadMenu: (menuId: string) => Promise<void>;

  // Lunar Sync
  syncWithLunarCycle: boolean;
  toggleSyncWithLunarCycle: () => void;

  // Budget
  weeklyBudget: number | null;
  setWeeklyBudget: (budget: number | null) => void;
  estimatedWeeklyCost: number;
  costConfidence: "high" | "medium" | "low";
  costBreakdown: Array<{ ingredient: string; estimatedCost: number; confidence: string }>;
  budgetPerMeal: number | null;

  // Inventory / Posso
  inventory: string[];
  setInventory: (inv: string[]) => void;

  // Generation Preferences
  generationPreferences: GenerationPreferences;
  setGenerationPreferences: (prefs: GenerationPreferences) => void;
  updateGenerationPreference: <K extends keyof GenerationPreferences>(key: K, value: GenerationPreferences[K]) => void;
  resetGenerationPreferences: () => void;
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
    throw new Error("useMenuPlanner must be used within a MenuPlannerProvider");
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
      sodium: 0,
      sugar: 0,
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

function toDate(value: unknown): Date {
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}

function hydrateMenuDates(menu: WeeklyMenu): WeeklyMenu {
  return {
    ...menu,
    weekStartDate: toDate(menu.weekStartDate),
    weekEndDate: toDate(menu.weekEndDate),
    createdAt: toDate(menu.createdAt),
    updatedAt: toDate(menu.updatedAt),
    meals: (menu.meals || []).map((meal) => ({
      ...meal,
      createdAt: toDate(meal.createdAt),
      updatedAt: toDate(meal.updatedAt),
      planetarySnapshot: {
        ...meal.planetarySnapshot,
        timestamp: toDate(meal.planetarySnapshot?.timestamp),
      },
    })),
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
  const { currentUser } = useUser();

  // Guest alchemist participants
  const [participants, setParticipants] = useState<Participant[]>([]);
  const addParticipant = useCallback((participant: Omit<Participant, 'id'>, id?: string) => {
    const newId = id ?? `participant-${Date.now()}`;
    setParticipants(prev => (prev.some(p => p.id === newId) ? prev : [...prev, { ...participant, id: newId }]));
  }, []);
  const removeParticipant = useCallback((id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
  }, []);

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
  const [syncWithLunarCycle, setSyncWithLunarCycle] = useState<boolean>(false);

  // Budget state
  const [weeklyBudget, setWeeklyBudgetRaw] = useState<number | null>(null);

  // Inventory state - unified with PantryManager
  const [inventory, setInventoryRaw] = useState<string[]>([]);
  const saveInFlightRef = useRef(false);
  const pendingSaveRef = useRef(false);

  // Initialize inventory from PantryManager on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const pantry = PantryManager.getPantry();
      const itemNames = pantry.map(item => item.name.toLowerCase());
      setInventoryRaw(itemNames);
    }
  }, []);

  const setInventory = useCallback((inv: string[]) => {
    setInventoryRaw(inv);
    // Sync with PantryManager for items that might be missing
    try {
      const currentPantry = PantryManager.getPantry();
      const currentNames = new Set(currentPantry.map(i => i.name.toLowerCase()));

      inv.forEach(name => {
        if (!currentNames.has(name.toLowerCase())) {
          PantryManager.addItem({
            name,
            quantity: 1,
            unit: "each",
            category: "other",
          });
        }
      });

    } catch (err) {
      logger.error("Failed to sync inventory with PantryManager", err);
    }
  }, []);

  // Generation preferences state with localStorage persistence
  const [generationPreferences, setGenerationPreferencesRaw] = useState<GenerationPreferences>(() => {
    if (typeof window === "undefined") return DEFAULT_GENERATION_PREFERENCES;
    try {
      const saved = localStorage.getItem(GENERATION_PREFS_STORAGE_KEY);
      return saved ? { ...DEFAULT_GENERATION_PREFERENCES, ...JSON.parse(saved) } : DEFAULT_GENERATION_PREFERENCES;
    } catch {
      return DEFAULT_GENERATION_PREFERENCES;
    }
  });

  const setGenerationPreferences = useCallback((prefs: GenerationPreferences) => {
    setGenerationPreferencesRaw(prefs);
    try {
      localStorage.setItem(GENERATION_PREFS_STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // localStorage may be unavailable
    }
  }, []);

  const updateGenerationPreference = useCallback(<K extends keyof GenerationPreferences>(key: K, value: GenerationPreferences[K]) => {
    setGenerationPreferencesRaw(prev => {
      const updated = { ...prev, [key]: value };
      try {
        localStorage.setItem(GENERATION_PREFS_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // localStorage may be unavailable
      }
      return updated;
    });
  }, []);

  const resetGenerationPreferences = useCallback(() => {
    setGenerationPreferencesRaw(DEFAULT_GENERATION_PREFERENCES);
    try {
      localStorage.removeItem(GENERATION_PREFS_STORAGE_KEY);
    } catch {
      // localStorage may be unavailable
    }
  }, []);

  const isMountedRef = useRef(false);

  const persistMenu = useCallback(
    async (overrides?: {
      menu?: WeeklyMenu;
      groceryList?: GroceryItem[];
      inventory?: string[];
      weeklyBudget?: number | null;
    }) => {
      const activeMenu = overrides?.menu ?? currentMenu;
      if (!activeMenu || !currentUser?.userId) return;

      if (saveInFlightRef.current) {
        pendingSaveRef.current = true;
        return;
      }

      saveInFlightRef.current = true;
      try {
        const response = await fetch("/api/menu-planner/menus", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            weekStartDate: activeMenu.weekStartDate,
            meals: activeMenu.meals,
            nutritionalTotals: activeMenu.nutritionalTotals,
            groceryList: overrides?.groceryList ?? groceryList,
            inventory: overrides?.inventory ?? inventory,
            weeklyBudget:
              overrides?.weeklyBudget === undefined
                ? weeklyBudget
                : overrides.weeklyBudget,
          }),
        });

        if (!response.ok) {
          throw new Error(`Save failed with status ${response.status}`);
        }
      } catch (err) {
        logger.error("Failed to persist weekly menu", err);
      } finally {
        saveInFlightRef.current = false;
        if (pendingSaveRef.current) {
          pendingSaveRef.current = false;
          void persistMenu();
        }
      }
    },
    [currentMenu, currentUser?.userId, groceryList, inventory, weeklyBudget],
  );

  const setWeeklyBudget = useCallback((budget: number | null) => {
    setWeeklyBudgetRaw(budget);
    void persistMenu({ weeklyBudget: budget });
  }, [persistMenu]);

  const setInventoryAndPersist = useCallback((inv: string[]) => {
    setInventory(inv);
    void persistMenu({ inventory: inv });
  }, [setInventory, persistMenu]);

  const toggleSyncWithLunarCycle = useCallback(() => {
    setSyncWithLunarCycle((prev) => !prev);
  }, []);

  /**
   * Automatically synchronize grocery list when menu or inventory changes
   */
  useEffect(() => {
    if (currentMenu?.meals) {
      const newList = generateGroceryList(currentMenu.meals);
      setGroceryList(newList);
    } else {
      setGroceryList([]);
    }
  }, [currentMenu?.meals, inventory]);

  /**
   * Initialize menu on mount
   */
  useEffect(() => {
    isMountedRef.current = true;

    const initializeMenu = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (currentUser?.userId) {
          const response = await fetch(
            `/api/menu-planner/menus?weekStartDate=${encodeURIComponent(currentWeekStart.toISOString())}`,
            { credentials: "include" },
          );
          if (!response.ok) {
            throw new Error(`Load failed with status ${response.status}`);
          }
          const data = await response.json();
          const savedMenu = data?.menu
            ? hydrateMenuDates(data.menu as WeeklyMenu)
            : null;
          if (savedMenu && isMountedRef.current) {
            setCurrentMenu(savedMenu);
            setGroceryList(savedMenu.groceryList || []);
            setWeeklyBudgetRaw(
              typeof data.menu.weeklyBudget === "number"
                ? data.menu.weeklyBudget
                : null,
            );
            setInventoryRaw(
              Array.isArray(data.menu.inventory)
                ? data.menu.inventory.map((item: string) => item.toLowerCase())
                : [],
            );
            setIsLoading(false);
            logger.info("Loaded menu from backend");
            return;
          }
        }

        const newMenu = createInitialMenu(currentWeekStart);
        if (isMountedRef.current) {
          const pantryNames = PantryManager.getPantry().map((item) =>
            item.name.toLowerCase(),
          );
          setCurrentMenu(newMenu);
          setGroceryList([]);
          setInventoryRaw(pantryNames);
          setWeeklyBudgetRaw(null);
          setIsLoading(false);
          logger.info("Created new weekly menu");
        }
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to initialize menu");
        logger.error("Menu initialization error:", err);
        if (isMountedRef.current) {
          setError(error);
          setIsLoading(false);
        }
      }
    };

    void initializeMenu();

    return () => {
      isMountedRef.current = false;
    };
  }, [currentWeekStart, currentUser?.userId]);

  useEffect(() => {
    if (!currentMenu || isLoading || !currentUser?.userId) return;
    const timeoutId = setTimeout(() => {
      void persistMenu();
    }, 250);
    return () => clearTimeout(timeoutId);
  }, [currentMenu, groceryList, isLoading, persistMenu, currentUser?.userId]);

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
      recipe: MonicaOptimizedRecipe,
      servings: number = 1,
    ) => {
      if (!currentMenu) return;

      try {
        setCurrentMenu((prevMenu) => {
          if (!prevMenu) return prevMenu;
          const updatedMeals = prevMenu.meals.map((meal) => {
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

          return {
            ...prevMenu,
            meals: updatedMeals,
            updatedAt: new Date(),
          } as any;
        });
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
        setCurrentMenu((prevMenu) => {
          if (!prevMenu) return prevMenu;
          const updatedMeals = prevMenu.meals.map((meal) => {
            if (meal.id === mealSlotId) {
              const { recipe: _recipe, ...mealWithoutRecipe } = meal;
              return {
                ...mealWithoutRecipe,
                updatedAt: new Date(),
              };
            }
            return meal;
          });

          return {
            ...prevMenu,
            meals: updatedMeals,
            updatedAt: new Date(),
          } as any;
        });
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
          sourceMeal.recipe as any,
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

        setCurrentMenu((prevMenu) => {
          if (!prevMenu) return prevMenu;
          const updatedMeals = prevMenu.meals.map((meal) => {
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
              const { recipe: _recipe, ...mealWithoutRecipe } = meal;
              return {
                ...mealWithoutRecipe,
                updatedAt: new Date(),
              };
            }
            return meal;
          });

          return {
            ...prevMenu,
            meals: updatedMeals,
            updatedAt: new Date(),
          } as any;
        });
        logger.info(
          `Moved meal from ${sourceMealSlotId} to ${targetMealSlotId}`,
        );
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
            const { recipe: _recipe, ...mealWithoutRecipe } = meal;
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
            const { recipe: _recipe, ...mealWithoutRecipe } = meal;
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
        const { recipe: _recipe, ...mealWithoutRecipe } = meal;
        return {
          ...mealWithoutRecipe,
          updatedAt: new Date(),
        };
      });

      setCurrentMenu((prevMenu) => {
        if (!prevMenu) return prevMenu;
        return {
          ...prevMenu,
          meals: updatedMeals,
          groceryList: [],
          updatedAt: new Date(),
        };
      });
      setGroceryList([]);
      logger.info("Cleared entire week");
    } catch (err) {
      logger.error("Failed to clear week:", err);
      throw err;
    }
  }, [currentMenu]);

  /**
   * Add a sauce to a meal slot
   */
  const addSauceToMeal = useCallback(
    (mealSlotId: string, sauceId: string, servings: number = 1) => {
      if (!currentMenu) return;

      // Dynamic import to avoid circular deps at module level
      const { allSauces } = require("@/data/sauces");
      const sauceData = allSauces[sauceId];
      if (!sauceData) {
        logger.warn(`Sauce not found: ${sauceId}`);
        return;
      }

      const updatedMeals = currentMenu.meals.map((meal) => {
        if (meal.id === mealSlotId) {
          return {
            ...meal,
            sauce: {
              id: sauceId,
              name: sauceData.name,
              servings,
              nutritionalProfile: sauceData.nutritionalProfile ? {
                calories: sauceData.nutritionalProfile.calories,
                protein: sauceData.nutritionalProfile.protein,
                carbs: sauceData.nutritionalProfile.carbs,
                fat: sauceData.nutritionalProfile.fat,
                fiber: sauceData.nutritionalProfile.fiber,
              } : undefined,
              elementalProperties: sauceData.elementalProperties,
              ingredients: sauceData.ingredients,
            },
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
      const newGroceryList = generateGroceryList(updatedMeals, {
        consolidateBy: "ingredient",
        convertUnits: true,
        excludePantryItems: false,
      });

      setCurrentMenu(updatedMenu as any);
      setGroceryList(newGroceryList);
      logger.info(`Added sauce ${sauceData.name} to meal ${mealSlotId}`);
    },
    [currentMenu],
  );

  /**
   * Remove sauce from a meal slot
   */
  const removeSauceFromMeal = useCallback(
    (mealSlotId: string) => {
      if (!currentMenu) return;

      const updatedMeals = currentMenu.meals.map((meal) => {
        if (meal.id === mealSlotId) {
          const { sauce: _sauce, ...mealWithoutSauce } = meal;
          return {
            ...mealWithoutSauce,
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
      const newGroceryList = generateGroceryList(updatedMeals, {
        consolidateBy: "ingredient",
        convertUnits: true,
        excludePantryItems: false,
      });

      setCurrentMenu(updatedMenu as any);
      setGroceryList(newGroceryList);
      logger.info(`Removed sauce from meal ${mealSlotId}`);
    },
    [currentMenu],
  );

  /**
   * Update sauce servings on a meal slot
   */
  const updateSauceServings = useCallback(
    (mealSlotId: string, servings: number) => {
      if (!currentMenu) return;

      const updatedMeals = currentMenu.meals.map((meal) => {
        if (meal.id === mealSlotId && meal.sauce) {
          return {
            ...meal,
            sauce: {
              ...meal.sauce,
              servings: Math.max(0.5, servings),
            },
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
      const newGroceryList = generateGroceryList(updatedMeals, {
        consolidateBy: "ingredient",
        convertUnits: true,
        excludePantryItems: false,
      });

      setCurrentMenu(updatedMenu as any);
      setGroceryList(newGroceryList);
      logger.info(`Updated sauce servings to ${servings} for meal ${mealSlotId}`);
    },
    [currentMenu],
  );

  /**
   * Lock a meal to prevent changes
   */
  const lockMeal = useCallback(
    (mealSlotId: string) => {
      if (!currentMenu) return;

      const updatedMeals = currentMenu.meals.map((meal) => {
        if (meal.id === mealSlotId) {
          return {
            ...meal,
            isLocked: true,
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
      logger.info(`Locked meal ${mealSlotId}`);
    },
    [currentMenu],
  );

  /**
   * Unlock a meal to allow changes
   */
  const unlockMeal = useCallback(
    (mealSlotId: string) => {
      if (!currentMenu) return;

      const updatedMeals = currentMenu.meals.map((meal) => {
        if (meal.id === mealSlotId) {
          return {
            ...meal,
            isLocked: false,
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
      logger.info(`Unlocked meal ${mealSlotId}`);
    },
    [currentMenu],
  );

  /**
   * Check if a meal is locked
   */
  const isMealLocked = useCallback(
    (mealSlotId: string): boolean => {
      if (!currentMenu) return false;
      const meal = currentMenu.meals.find((m) => m.id === mealSlotId);
      return meal?.isLocked ?? false;
    },
    [currentMenu],
  );

  // regenerateDay is defined after generateMealsForDay (see below) so it can
  // call it. Forward-declare the ref so the context value shape stays intact.

  // Get user context for personalization
  const natalChart = currentUser?.natalChart;

  // Memoize chart comparison to avoid recalculating on every render
  const [chartComparison, setChartComparison] =
    useState<ChartComparison | null>(null);

  // Update chart comparison when natal chart changes
  useEffect(() => {
    const updateChartComparison = async () => {
      if (!natalChart) {
        setChartComparison(null);
        return;
      }
      try {
        const comparison =
          await ChartComparisonService.compareCharts(natalChart);
        setChartComparison(comparison);
      } catch (err) {
        logger.error("Failed to calculate chart comparison:", err);
      }
    };
    void updateChartComparison();
  }, [natalChart]);

  /**
   * Generate meals for a specific day using planetary recommendations
   * Phase 3: Smart recommendation feature with user personalization
   */
  const generateMealsForDay = useCallback(
    async (
      dayOfWeek: DayOfWeek,
      options: {
        mealTypes?: MealType[];
        dietaryRestrictions?: string[];
        preferredCuisines?: string[];
        excludeIngredients?: string[];
        requiredIngredients?: string[];
        preferredCookingMethods?: string[];
        flavorPreferences?: string[];
        maxPrepTimeMinutes?: number | null;
        useCurrentPlanetary?: boolean;
        usePersonalization?: boolean;
      } = {},
    ) => {
      if (!currentMenu) return;

      try {
        const {
          mealTypes = ["breakfast", "lunch", "dinner"],
          useCurrentPlanetary = true,
          usePersonalization = true,
        } = options;

        // Merge per-call options with stored generation preferences (per-call overrides stored)
        const mergedDietaryRestrictions = options.dietaryRestrictions ?? generationPreferences.dietaryRestrictions;
        const mergedPreferredCuisines = options.preferredCuisines ?? generationPreferences.preferredCuisines;
        const mergedExcludeIngredients = options.excludeIngredients ?? generationPreferences.excludeIngredients;
        const mergedRequiredIngredients = options.requiredIngredients ?? generationPreferences.requiredIngredients;
        const mergedCookingMethods = options.preferredCookingMethods ?? generationPreferences.preferredCookingMethods;
        const mergedFlavorPreferences = options.flavorPreferences ?? generationPreferences.flavorPreferences;
        const mergedMaxPrepTime = options.maxPrepTimeMinutes !== undefined ? options.maxPrepTimeMinutes : generationPreferences.maxPrepTimeMinutes;

        const hasPersonalization = usePersonalization && !!natalChart;

        if (syncWithLunarCycle) {
          logger.info("Generating meals with Lunar Cycle sync enabled.");
        }

        logger.info(`Generating meals for day ${dayOfWeek}`, {
          mealTypes,
          dietaryRestrictions: mergedDietaryRestrictions,
          preferredCuisines: mergedPreferredCuisines,
          personalized: hasPersonalization,
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
          currentPlanetaryHour:
            astrologicalState.currentPlanetaryHour || undefined,
        };

        // Build user context for personalization
        const userContext: UserPersonalizationContext | undefined =
          hasPersonalization && natalChart
            ? {
              natalChart,
              chartComparison: chartComparison || undefined,
              prioritizeHarmony: true,
            }
            : undefined;

        // Extract existing meals from the weekly plan for context-aware recommendations
        const existingMeals = currentMenu.meals
          .filter((m) => m.recipe && m.dayOfWeek !== dayOfWeek)
          .map((m) => ({
            recipeId: m.recipe!.id,
            recipeName: m.recipe!.name ?? "",
            cuisine: m.recipe!.cuisine,
            primaryProtein: (() => {
              const proteinIng = m.recipe!.ingredients?.find(
                (i: any) => typeof i !== "string" && i.category === "protein",
              );
              return proteinIng && typeof proteinIng !== "string" ? (proteinIng as any).name : undefined;
            })(),
          }));

        // Derive per-meal budget if weekly budget is set
        const totalPlannedMeals = currentMenu.meals.filter((m) => m.recipe).length;
        const budgetPerMealValue = weeklyBudget
          ? weeklyBudget / Math.max(21, totalPlannedMeals)
          : undefined;

        // Build nutritional gap context from targets and current day's planned meals
        const nutTargets = generationPreferences.nutritionalTargets;
        const hasNutritionalTargets = nutTargets.dailyCalories !== null
          || nutTargets.dailyProteinG !== null
          || nutTargets.prioritizeProtein
          || nutTargets.prioritizeFiber;

        let nutritionalContext: {
          remainingCalories?: number;
          remainingProteinG?: number;
          remainingCarbsG?: number;
          remainingFatG?: number;
          remainingFiberG?: number;
          prioritizeProtein?: boolean;
          prioritizeFiber?: boolean;
        } | undefined;

        if (hasNutritionalTargets) {
          // Sum nutrition already planned for this day
          const dayMeals = currentMenu.meals.filter(
            (m) => m.dayOfWeek === dayOfWeek && m.recipe,
          );
          let plannedCals = 0, plannedProtein = 0, plannedCarbs = 0, plannedFat = 0, plannedFiber = 0;
          for (const m of dayMeals) {
            const n = m.recipe?.nutrition as Record<string, number | undefined> | undefined;
            const s = m.servings || 1;
            if (n) {
              plannedCals += (n.calories ?? 0) * s;
              plannedProtein += (n.protein ?? 0) * s;
              plannedCarbs += (n.carbs ?? 0) * s;
              plannedFat += (n.fat ?? 0) * s;
              plannedFiber += (n.fiber ?? 0) * s;
            }
          }

          nutritionalContext = {
            remainingCalories: nutTargets.dailyCalories ? Math.max(0, nutTargets.dailyCalories - plannedCals) : undefined,
            remainingProteinG: nutTargets.dailyProteinG ? Math.max(0, nutTargets.dailyProteinG - plannedProtein) : undefined,
            remainingCarbsG: nutTargets.dailyCarbsG ? Math.max(0, nutTargets.dailyCarbsG - plannedCarbs) : undefined,
            remainingFatG: nutTargets.dailyFatG ? Math.max(0, nutTargets.dailyFatG - plannedFat) : undefined,
            remainingFiberG: nutTargets.dailyFiberG ? Math.max(0, nutTargets.dailyFiberG - plannedFiber) : undefined,
            prioritizeProtein: nutTargets.prioritizeProtein,
            prioritizeFiber: nutTargets.prioritizeFiber,
          };
        }

        // Generate recommendations using planetary intelligence + user personalization
        const recommendations = await generateDayRecommendations(
          dayOfWeek,
          astroState,
          {
            mealTypes,
            dietaryRestrictions: mergedDietaryRestrictions,
            preferredCuisines: mergedPreferredCuisines,
            excludeIngredients: mergedExcludeIngredients,
            requiredIngredients: mergedRequiredIngredients,
            preferredCookingMethods: mergedCookingMethods,
            flavorPreferences: mergedFlavorPreferences,
            maxPrepTimeMinutes: mergedMaxPrepTime,
            useCurrentPlanetary,
            maxRecipesPerMeal: 1, // Take top recommendation per meal
            userContext,
            existingMeals,
            budgetPerMeal: budgetPerMealValue,
            nutritionalContext,
          },
        );

        logger.info(
          `Generated ${recommendations.length} meal recommendations for day ${dayOfWeek}`,
          {
            personalized: hasPersonalization,
            recommendations: recommendations.map((r) => ({
              mealType: r.mealType,
              score: r.personalizedScore || r.score,
              recipeName: r.recipe?.name || "N/A",
              isPersonalized: r.isPersonalized,
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
              const score =
                recommendation.personalizedScore || recommendation.score;
              await addMealToSlot(
                dayOfWeek,
                recommendation.mealType,
                recommendation.recipe,
                score >= 0.8 ? 2 : 1, // Suggest 2 servings for highly aligned meals
              );
              reportQuestEvent("generate_recipe");
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
    [
      currentMenu,
      astrologicalState,
      addMealToSlot,
      natalChart,
      chartComparison,
      weeklyBudget,
      syncWithLunarCycle,
      generationPreferences,
    ],
  );

  /**
   * Regenerate a day: clears existing meals then re-runs the recommendation
   * engine for that day.  Defined after generateMealsForDay so the dependency
   * is always resolved.
   */
  const regenerateDay = useCallback(
    async (dayOfWeek: DayOfWeek) => {
      if (!currentMenu) return;
      try {
        await clearDay(dayOfWeek);
        await generateMealsForDay(dayOfWeek, {
          mealTypes: ["breakfast", "lunch", "dinner"],
          useCurrentPlanetary: true,
          usePersonalization: !!natalChart,
        });
        logger.info(`Regenerated day ${dayOfWeek}`);
      } catch (err) {
        logger.error("Failed to regenerate day:", err);
        throw err;
      }
    },
    [currentMenu, clearDay, generateMealsForDay, natalChart],
  );

  /**
   * Update grocery item
   */
  const updateGroceryItem = useCallback(
    (itemId: string, updates: Partial<GroceryItem>) => {
      setGroceryList((prev) => {
        const next = prev.map((item) =>
          item.id === itemId ? { ...item, ...updates } : item,
        );
        void persistMenu({ groceryList: next });
        return next;
      });
    },
    [persistMenu],
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
    async (name: string, _description?: string) => {
      if (!currentMenu) return;

      try {
        const response = await fetch("/api/menu-planner/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name,
            weekStartDate: currentMenu.weekStartDate,
            meals: currentMenu.meals,
            nutritionalTotals: currentMenu.nutritionalTotals,
            groceryList,
            inventory,
            weeklyBudget,
          }),
        });

        if (!response.ok) {
          throw new Error(`Template save failed with status ${response.status}`);
        }

        logger.info(`Saved menu as template: ${name}`);
      } catch (err) {
        logger.error("Failed to save template:", err);
        throw err;
      }
    },
    [currentMenu, groceryList, inventory, weeklyBudget],
  );

  /**
   * Load template
   * TODO: Implement backend loading in Phase 4
   */
  const loadTemplate = useCallback(
    async (templateId: string) => {
      try {
        const response = await fetch(
          `/api/menu-planner/templates?id=${encodeURIComponent(templateId)}`,
          { credentials: "include" },
        );
        if (!response.ok) {
          throw new Error(`Template load failed with status ${response.status}`);
        }
        const data = await response.json();
        const template = data?.template;

        if (!template) {
          throw new Error("Template not found");
        }

        // Create new menu from template
        const newMenu = createInitialMenu(currentWeekStart);
        newMenu.meals = template.meals.map((m: any, index: number) => ({
          ...m,
          id: `${m.dayOfWeek}-${m.mealType}-${Date.now()}-${index}`,
          planetarySnapshot: newMenu.meals.find(
            (nm) => nm.dayOfWeek === m.dayOfWeek && nm.mealType === m.mealType,
          )!.planetarySnapshot,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

        setCurrentMenu(newMenu);
        setGroceryList(template.groceryList || []);
        setInventoryRaw(
          Array.isArray(template.inventory) ? template.inventory : [],
        );
        setWeeklyBudgetRaw(
          typeof template.weeklyBudget === "number"
            ? template.weeklyBudget
            : null,
        );
        void persistMenu({
          menu: newMenu,
          groceryList: template.groceryList || [],
          inventory: Array.isArray(template.inventory)
            ? template.inventory
            : [],
          weeklyBudget:
            typeof template.weeklyBudget === "number"
              ? template.weeklyBudget
              : null,
        });
        logger.info(`Loaded template: ${template.name}`);
      } catch (err) {
        logger.error("Failed to load template:", err);
        throw err;
      }
    },
    [currentWeekStart, persistMenu],
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
    await persistMenu();
  }, [persistMenu]);

  // Cost Estimation State
  const [estimatedCostState, setEstimatedCostState] = useState<{
    total: number;
    confidence: "high" | "medium" | "low";
    breakdown: Array<{ ingredient: string; estimatedCost: number; confidence: string }>;
  }>({
    total: 0,
    confidence: "low",
    breakdown: [],
  });

  /**
   * Recalculate estimated cost whenever recipes or inventory change
   */
  useEffect(() => {
    if (!currentMenu) return;

    const recipesWithIngredients = currentMenu.meals
      .filter((m) => m.recipe)
      .map((m) => ({
        ingredients: (m.recipe!.ingredients || []).map((ing: any) => ({
          name: typeof ing === "string" ? ing : ing.name ?? "",
          amount: typeof ing === "string" ? 1 : ing.amount ?? 1,
          unit: typeof ing === "string" ? "each" : ing.unit ?? "each",
          category: typeof ing === "string" ? undefined : ing.category,
          optional: typeof ing === "string" ? false : ing.optional,
        })),
        servings: m.servings || 1,
        dietaryFlags: [
          m.recipe?.isVegetarian ? "vegetarian" : "",
          m.recipe?.isVegan ? "vegan" : "",
          m.recipe?.isGlutenFree ? "gluten-free" : "",
          m.recipe?.isDairyFree ? "dairy-free" : "",
        ].filter(Boolean),
      }));

    if (recipesWithIngredients.length === 0) {
      setEstimatedCostState({ total: 0, confidence: "low", breakdown: [] });
      return;
    }

    // 1. Local Estimate (Instant)
    const { totalCost, recipeBreakdown } = estimateWeeklyGroceryCost(
      recipesWithIngredients,
      inventory,
    );

    const allIngredientsBreakdown = recipeBreakdown.flatMap((rb) => rb.breakdown);
    const avgMatchRatio = recipeBreakdown.reduce((acc, rb) => acc + (rb.confidence === "high" ? 1 : rb.confidence === "medium" ? 0.5 : 0), 0) / recipeBreakdown.length;

    setEstimatedCostState({
      total: totalCost,
      confidence: avgMatchRatio >= 0.7 ? "high" : avgMatchRatio >= 0.4 ? "medium" : "low",
      breakdown: allIngredientsBreakdown,
    });

    // 2. Background IDP Probe (Debounced)
    const probeTimeout = setTimeout(() => {
      void (async () => {
        try {
          const lineItems = allIngredientsBreakdown.slice(0, 50).map(b => ({
            name: b.ingredient,
            display_text: b.ingredient
          }));

          const response = await fetch("/api/instacart/price-estimate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ line_items: lineItems }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.confidence === "high") {
              // If IDP confirms matching, we can bump our confidence
              setEstimatedCostState(prev => ({
                ...prev,
                confidence: "high"
              }));
            }
          }
        } catch (err) {
          logger.warn("Cost probe failed:", err);
        }
      })();
    }, 2000);

    return () => clearTimeout(probeTimeout);
  }, [currentMenu, inventory]);

  /**
   * Load menu by ID
   */
  const loadMenu = useCallback(async (menuId: string) => {
    try {
      await loadTemplate(menuId);
    } catch (err) {
      logger.error("Failed to load menu:", err);
      throw err;
    }
  }, [loadTemplate]);

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
          mealSlot.planetarySnapshot.planetaryPositions,
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
        logger.error(
          `Failed to calculate meal circuit for ${mealSlotId}:`,
          err,
        );
        return null;
      }
    },
    [currentMenu],
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
          dayMeals[0]?.planetarySnapshot.planetaryPositions,
        );

        // Update state
        setDayCircuitMetrics((prev) => ({
          ...prev,
          [dayOfWeek]: metrics,
        }));

        return metrics;
      } catch (err) {
        logger.error(
          `Failed to calculate day circuit for day ${dayOfWeek}:`,
          err,
        );
        return null;
      }
    },
    [currentMenu],
  );

  /**
   * Calculate circuit metrics for the entire weekly menu
   */
  const calculateWeeklyCircuitMetrics =
    useCallback(async (): Promise<WeeklyMenuCircuitMetrics | null> => {
      if (!currentMenu) return null;

      try {
        const metrics = calculateWeeklyCircuit(
          currentMenu,
          currentMenu.meals[0]?.planetarySnapshot.planetaryPositions,
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
    }, [currentMenu]);

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
      (d): d is DayCircuitMetrics => d !== null,
    );

    // Need all 7 days to analyze bottlenecks
    if (validDayCircuits.length < 7) return [];

    try {
      return findCircuitBottlenecks(
        dayCircuitMetrics as Record<DayOfWeek, DayCircuitMetrics>,
        currentMenu,
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
      (d): d is DayCircuitMetrics => d !== null,
    );

    // Need all 7 days to generate suggestions
    if (validDayCircuits.length < 7) return [];

    try {
      return generateCircuitSuggestions(
        dayCircuitMetrics as Record<DayOfWeek, DayCircuitMetrics>,
        currentMenu,
        currentMenu.meals[0]?.planetarySnapshot.planetaryPositions,
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
        void refreshCircuitMetrics();
      }, 500); // 500ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [currentMenu, refreshCircuitMetrics]);

  /**
   * Context value
   */
  const contextValue = useMemo<MenuPlannerContextType>(
    () => ({
      participants,
      addParticipant,
      removeParticipant,
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
      addSauceToMeal,
      removeSauceFromMeal,
      updateSauceServings,
      lockMeal,
      unlockMeal,
      isMealLocked,
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
      syncWithLunarCycle,
      toggleSyncWithLunarCycle,
      weeklyBudget,
      setWeeklyBudget,
      estimatedWeeklyCost: estimatedCostState.total,
      costConfidence: estimatedCostState.confidence,
      costBreakdown: estimatedCostState.breakdown,
      budgetPerMeal: weeklyBudget ? Math.round((weeklyBudget / 21) * 100) / 100 : null,
      inventory,
      setInventory: setInventoryAndPersist,
      generationPreferences,
      setGenerationPreferences,
      updateGenerationPreference,
      resetGenerationPreferences,
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
      addSauceToMeal,
      removeSauceFromMeal,
      updateSauceServings,
      lockMeal,
      unlockMeal,
      isMealLocked,
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
      participants,
      addParticipant,
      removeParticipant,
      syncWithLunarCycle,
      toggleSyncWithLunarCycle,
      weeklyBudget,
      setWeeklyBudget,
      inventory,
      setInventoryAndPersist,
      estimatedCostState, // Added this
      generationPreferences,
      setGenerationPreferences,
      updateGenerationPreference,
      resetGenerationPreferences,
    ],
  );

  return (
    <MenuPlannerContext.Provider value={contextValue}>
      {children}
    </MenuPlannerContext.Provider>
  );
}

export default MenuPlannerProvider;
