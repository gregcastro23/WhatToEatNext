"use client";

/**
 * Menu Planner — Context + Provider
 *
 * Composes useMealSlots and useWeekNavigation, then owns the remaining
 * state that can't cleanly be split yet (persistence, circuit metrics,
 * generation preferences, cost estimation).
 *
 * @file src/contexts/menu-planner/MenuPlannerProvider.tsx
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
import { useAstrologicalState } from "@/hooks/useAstrologicalState";
import { useMenuPersistence } from "@/hooks/useMenuPersistence";
import { useMenuStats } from "@/hooks/useMenuStats";
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
} from "@/types/kinetics";
import type {
  WeeklyMenu,
  MealSlot,
  DayOfWeek,
  MealType,
  GroceryItem,
  DailyNutritionTotals,
  PlanetarySnapshot,
} from "@/types/menuPlanner";
import {
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
import { estimateWeeklyGroceryCost } from "@/utils/instacart/priceEstimator";
import { logger } from "@/utils/logger";
import { calculateMealCircuit } from "@/utils/mealCircuitCalculations";
import {
  generateDayRecommendations,
  type AstrologicalState,
  type UserPersonalizationContext,
} from "@/utils/menuPlanner/recommendationBridge";
import PantryManager from "@/utils/pantryManager";
import { calculateWeeklyCircuit } from "@/utils/weeklyCircuitCalculations";
import { useMealSlots } from "./useMealSlots";
import { useWeekNavigation } from "./useWeekNavigation";
import type {
  NutritionalTargets,
  GenerationPreferences,
  Participant,
  MenuPlannerContextType,
} from "./types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

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

const GROCERY_LIST_OPTIONS = {
  consolidateBy: "ingredient" as const,
  convertUnits: true,
  excludePantryItems: false,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

function createInitialMenu(weekStartDate: Date): WeeklyMenu {
  const meals: MealSlot[] = [];
  const nutritionalTotals: Record<DayOfWeek, DailyNutritionTotals> = {} as any;

  for (let day = 0; day < 7; day++) {
    const dayOfWeek = day as DayOfWeek;

    const planetarySnapshot: PlanetarySnapshot = {
      dominantPlanet: PLANETARY_DAY_RULERS[dayOfWeek],
      zodiacSign: "aries",
      lunarPhase: "waxing crescent",
      elementalState: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
      timestamp: new Date(weekStartDate.getTime() + day * 24 * 60 * 60 * 1000),
    };

    const mealTypes: MealType[] = ["breakfast", "lunch", "dinner", "snack"];
    mealTypes.forEach((mealType) => {
      meals.push(createEmptyMealSlot(dayOfWeek, mealType, planetarySnapshot));
    });

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

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export const MenuPlannerContext = createContext<
  MenuPlannerContextType | undefined
>(undefined);

/**
 * Hook to use the menu planner context.
 * Import path `@/contexts/MenuPlannerContext` still works via the barrel file.
 */
export function useMenuPlanner(): MenuPlannerContextType {
  const context = useContext(MenuPlannerContext);
  if (!context) {
    throw new Error("useMenuPlanner must be used within a MenuPlannerProvider");
  }
  return context;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function MenuPlannerProvider({ children }: { children: ReactNode }) {
  // -- Core state --
  const [currentMenu, setCurrentMenu] = useState<WeeklyMenu | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([]);

  const { currentUser } = useUser();

  // -- Week navigation (extracted hook) --
  const { currentWeekStart, navigation } = useWeekNavigation();

  // -- Meal slot CRUD (extracted hook) --
  const {
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
    addSauceToMeal,
    removeSauceFromMeal,
    updateSauceServings,
    lockMeal,
    unlockMeal,
    isMealLocked,
  } = useMealSlots({ currentMenu, setCurrentMenu, setGroceryList });

  // -- Participants --
  const [participants, setParticipants] = useState<Participant[]>([]);
  const addParticipant = useCallback(
    (participant: Omit<Participant, "id">, id?: string) => {
      const newId = id ?? `participant-${Date.now()}`;
      setParticipants((prev) =>
        prev.some((p) => p.id === newId)
          ? prev
          : [...prev, { ...participant, id: newId }],
      );
    },
    [],
  );
  const removeParticipant = useCallback((id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // -- Circuit metrics --
  const [weeklyCircuitMetrics, setWeeklyCircuitMetrics] =
    useState<WeeklyMenuCircuitMetrics | null>(null);
  const [dayCircuitMetrics, setDayCircuitMetrics] = useState<
    Record<DayOfWeek, DayCircuitMetrics | null>
  >({} as any);
  const [mealCircuitMetrics, setMealCircuitMetrics] = useState<
    Record<string, MealCircuitMetrics | null>
  >({});

  // -- Astrological state --
  const astrologicalState = useAstrologicalState();
  const [syncWithLunarCycle, setSyncWithLunarCycle] = useState<boolean>(false);

  // -- Budget --
  const [weeklyBudget, setWeeklyBudgetRaw] = useState<number | null>(null);

  // -- Inventory --
  const [inventory, setInventoryRaw] = useState<string[]>([]);
  const saveInFlightRef = useRef(false);
  const pendingSaveRef = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const pantry = PantryManager.getPantry();
      setInventoryRaw(pantry.map((item) => item.name.toLowerCase()));
    }
  }, []);

  const setInventory = useCallback((inv: string[]) => {
    setInventoryRaw(inv);
    try {
      const currentPantry = PantryManager.getPantry();
      const currentNames = new Set(
        currentPantry.map((i) => i.name.toLowerCase()),
      );
      inv.forEach((name) => {
        if (!currentNames.has(name.toLowerCase())) {
          PantryManager.addItem({ name, quantity: 1, unit: "each", category: "other" });
        }
      });
    } catch (err) {
      logger.error("Failed to sync inventory with PantryManager", err);
    }
  }, []);

  // -- Generation preferences --
  const [generationPreferences, setGenerationPreferencesRaw] =
    useState<GenerationPreferences>(() => {
      if (typeof window === "undefined") return DEFAULT_GENERATION_PREFERENCES;
      try {
        const saved = localStorage.getItem(GENERATION_PREFS_STORAGE_KEY);
        return saved
          ? { ...DEFAULT_GENERATION_PREFERENCES, ...JSON.parse(saved) }
          : DEFAULT_GENERATION_PREFERENCES;
      } catch {
        return DEFAULT_GENERATION_PREFERENCES;
      }
    });

  const setGenerationPreferences = useCallback(
    (prefs: GenerationPreferences) => {
      setGenerationPreferencesRaw(prefs);
      try {
        localStorage.setItem(GENERATION_PREFS_STORAGE_KEY, JSON.stringify(prefs));
      } catch {
        // localStorage may be unavailable
      }
    },
    [],
  );

  const updateGenerationPreference = useCallback(
    <K extends keyof GenerationPreferences>(
      key: K,
      value: GenerationPreferences[K],
    ) => {
      setGenerationPreferencesRaw((prev) => {
        const updated = { ...prev, [key]: value };
        try {
          localStorage.setItem(GENERATION_PREFS_STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // localStorage may be unavailable
        }
        return updated;
      });
    },
    [],
  );

  const resetGenerationPreferences = useCallback(() => {
    setGenerationPreferencesRaw(DEFAULT_GENERATION_PREFERENCES);
    try {
      localStorage.removeItem(GENERATION_PREFS_STORAGE_KEY);
    } catch {
      // localStorage may be unavailable
    }
  }, []);

  const isMountedRef = useRef(false);

  // -------------------------------------------------------------------------
  // Persistence
  // -------------------------------------------------------------------------

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

  const setWeeklyBudget = useCallback(
    (budget: number | null) => {
      setWeeklyBudgetRaw(budget);
      void persistMenu({ weeklyBudget: budget });
    },
    [persistMenu],
  );

  const setInventoryAndPersist = useCallback(
    (inv: string[]) => {
      setInventory(inv);
      void persistMenu({ inventory: inv });
    },
    [setInventory, persistMenu],
  );

  const toggleSyncWithLunarCycle = useCallback(() => {
    setSyncWithLunarCycle((prev) => !prev);
  }, []);

  // -- Auto grocery sync --
  useEffect(() => {
    if (currentMenu?.meals) {
      setGroceryList(generateGroceryList(currentMenu.meals));
    } else {
      setGroceryList([]);
    }
  }, [currentMenu?.meals, inventory]);

  // -- Initialize menu on mount / week change --
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
        const initError =
          err instanceof Error ? err : new Error("Failed to initialize menu");
        logger.error("Menu initialization error:", err);
        if (isMountedRef.current) {
          setError(initError);
          setIsLoading(false);
        }
      }
    };

    void initializeMenu();

    return () => {
      isMountedRef.current = false;
    };
  }, [currentWeekStart, currentUser?.userId]);

  // -- Debounced auto-persist --
  useEffect(() => {
    if (!currentMenu || isLoading || !currentUser?.userId) return;
    const timeoutId = setTimeout(() => {
      void persistMenu();
    }, 250);
    return () => clearTimeout(timeoutId);
  }, [currentMenu, groceryList, isLoading, persistMenu, currentUser?.userId]);

  // -------------------------------------------------------------------------
  // Natal chart / personalization
  // -------------------------------------------------------------------------

  const natalChart = currentUser?.natalChart;
  const [chartComparison, setChartComparison] =
    useState<ChartComparison | null>(null);

  useEffect(() => {
    const updateChartComparison = async () => {
      if (!natalChart) {
        setChartComparison(null);
        return;
      }
      try {
        const comparison = await ChartComparisonService.compareCharts(natalChart);
        setChartComparison(comparison);
      } catch (err) {
        logger.error("Failed to calculate chart comparison:", err);
      }
    };
    void updateChartComparison();
  }, [natalChart]);

  // -------------------------------------------------------------------------
  // Meal generation
  // -------------------------------------------------------------------------

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

        const mergedDietaryRestrictions =
          options.dietaryRestrictions ?? generationPreferences.dietaryRestrictions;
        const mergedPreferredCuisines =
          options.preferredCuisines ?? generationPreferences.preferredCuisines;
        const mergedExcludeIngredients =
          options.excludeIngredients ?? generationPreferences.excludeIngredients;
        const mergedRequiredIngredients =
          options.requiredIngredients ?? generationPreferences.requiredIngredients;
        const mergedCookingMethods =
          options.preferredCookingMethods ?? generationPreferences.preferredCookingMethods;
        const mergedFlavorPreferences =
          options.flavorPreferences ?? generationPreferences.flavorPreferences;
        const mergedMaxPrepTime =
          options.maxPrepTimeMinutes !== undefined
            ? options.maxPrepTimeMinutes
            : generationPreferences.maxPrepTimeMinutes;

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

        const userContext: UserPersonalizationContext | undefined =
          hasPersonalization && natalChart
            ? { natalChart, chartComparison: chartComparison || undefined, prioritizeHarmony: true }
            : undefined;

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
              return proteinIng && typeof proteinIng !== "string"
                ? (proteinIng as any).name
                : undefined;
            })(),
          }));

        const totalPlannedMeals = currentMenu.meals.filter((m) => m.recipe).length;
        const budgetPerMealValue = weeklyBudget
          ? weeklyBudget / Math.max(21, totalPlannedMeals)
          : undefined;

        const nutTargets = generationPreferences.nutritionalTargets;
        const hasNutritionalTargets =
          nutTargets.dailyCalories !== null ||
          nutTargets.dailyProteinG !== null ||
          nutTargets.prioritizeProtein ||
          nutTargets.prioritizeFiber;

        let nutritionalContext:
          | {
              remainingCalories?: number;
              remainingProteinG?: number;
              remainingCarbsG?: number;
              remainingFatG?: number;
              remainingFiberG?: number;
              prioritizeProtein?: boolean;
              prioritizeFiber?: boolean;
            }
          | undefined;

        if (hasNutritionalTargets) {
          const dayMeals = currentMenu.meals.filter(
            (m) => m.dayOfWeek === dayOfWeek && m.recipe,
          );
          let plannedCals = 0,
            plannedProtein = 0,
            plannedCarbs = 0,
            plannedFat = 0,
            plannedFiber = 0;
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

          let eatenCals = 0,
            eatenProtein = 0,
            eatenCarbs = 0,
            eatenFat = 0,
            eatenFiber = 0;
          const todayDow = new Date().getDay();
          if (dayOfWeek === todayDow && currentUser?.userId) {
            try {
              const { getServerDayEntries } = await import("@/actions/foodDiary");
              const todaysEntries = await getServerDayEntries(
                currentUser.userId,
                new Date(),
              );
              for (const entry of todaysEntries) {
                const n = entry.nutrition as Record<string, number | undefined>;
                eatenCals += n?.calories ?? 0;
                eatenProtein += n?.protein ?? 0;
                eatenCarbs += n?.carbs ?? 0;
                eatenFat += n?.fat ?? 0;
                eatenFiber += n?.fiber ?? 0;
              }
            } catch (err) {
              logger.warn("Could not load diary totals for today", { err });
            }
          }

          const consumedCals = plannedCals + eatenCals;
          const consumedProtein = plannedProtein + eatenProtein;
          const consumedCarbs = plannedCarbs + eatenCarbs;
          const consumedFat = plannedFat + eatenFat;
          const consumedFiber = plannedFiber + eatenFiber;

          nutritionalContext = {
            remainingCalories: nutTargets.dailyCalories
              ? Math.max(0, nutTargets.dailyCalories - consumedCals)
              : undefined,
            remainingProteinG: nutTargets.dailyProteinG
              ? Math.max(0, nutTargets.dailyProteinG - consumedProtein)
              : undefined,
            remainingCarbsG: nutTargets.dailyCarbsG
              ? Math.max(0, nutTargets.dailyCarbsG - consumedCarbs)
              : undefined,
            remainingFatG: nutTargets.dailyFatG
              ? Math.max(0, nutTargets.dailyFatG - consumedFat)
              : undefined,
            remainingFiberG: nutTargets.dailyFiberG
              ? Math.max(0, nutTargets.dailyFiberG - consumedFiber)
              : undefined,
            prioritizeProtein: nutTargets.prioritizeProtein,
            prioritizeFiber: nutTargets.prioritizeFiber,
          };
        }

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
            maxRecipesPerMeal: 1,
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
          for (const recommendation of recommendations) {
            const existingSlot = currentMenu.meals.find(
              (m) =>
                m.dayOfWeek === dayOfWeek &&
                m.mealType === recommendation.mealType &&
                m.recipe,
            );
            if (!existingSlot) {
              await addMealToSlot(
                dayOfWeek,
                recommendation.mealType,
                recommendation.recipe,
                1,
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
      currentUser?.userId,
    ],
  );

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

  // -------------------------------------------------------------------------
  // Grocery list helpers
  // -------------------------------------------------------------------------

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

  const regenerateGroceryList = useCallback(() => {
    if (!currentMenu) return;
    try {
      const newGroceryList = generateGroceryList(
        currentMenu.meals,
        GROCERY_LIST_OPTIONS,
      );
      setGroceryList(newGroceryList);
      logger.info(`Generated grocery list with ${newGroceryList.length} items`);
    } catch (err) {
      logger.error("Failed to regenerate grocery list:", err);
    }
  }, [currentMenu]);

  // -------------------------------------------------------------------------
  // Template persistence
  // -------------------------------------------------------------------------

  const {
    saveAsTemplate,
    loadTemplate,
    isSaving: isTemplateSaving,
    isLoading: isTemplateLoading,
    persistenceError,
  } = useMenuPersistence({
    currentMenu,
    groceryList,
    inventory,
    weeklyBudget,
    currentWeekStart,
    createInitialMenu,
    setCurrentMenu,
    setGroceryList,
    setInventoryRaw,
    setWeeklyBudgetRaw,
    persistMenu,
  });

  const weeklyStats = useMenuStats(currentMenu);
  const refreshStats = useCallback(() => {
    // Stats are computed eagerly via useMenuStats — no-op for backward compat
  }, []);

  const saveMenu = useCallback(async () => {
    await persistMenu();
  }, [persistMenu]);

  // -------------------------------------------------------------------------
  // Cost estimation
  // -------------------------------------------------------------------------

  const [estimatedCostState, setEstimatedCostState] = useState<{
    total: number;
    confidence: "high" | "medium" | "low";
    breakdown: Array<{
      ingredient: string;
      estimatedCost: number;
      confidence: string;
    }>;
  }>({ total: 0, confidence: "low", breakdown: [] });

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

    const { totalCost, recipeBreakdown } = estimateWeeklyGroceryCost(
      recipesWithIngredients,
      inventory,
    );
    const allIngredientsBreakdown = recipeBreakdown.flatMap((rb) => rb.breakdown);
    const avgMatchRatio =
      recipeBreakdown.reduce(
        (acc, rb) =>
          acc +
          (rb.confidence === "high" ? 1 : rb.confidence === "medium" ? 0.5 : 0),
        0,
      ) / recipeBreakdown.length;

    setEstimatedCostState({
      total: totalCost,
      confidence:
        avgMatchRatio >= 0.7 ? "high" : avgMatchRatio >= 0.4 ? "medium" : "low",
      breakdown: allIngredientsBreakdown,
    });

    const probeTimeout = setTimeout(() => {
      void (async () => {
        try {
          const lineItems = allIngredientsBreakdown
            .slice(0, 50)
            .map((b) => ({ name: b.ingredient, display_text: b.ingredient }));
          const response = await fetch("/api/instacart/price-estimate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ line_items: lineItems }),
          });
          if (response.ok) {
            const data = await response.json();
            if (data.confidence === "high") {
              setEstimatedCostState((prev) => ({ ...prev, confidence: "high" }));
            }
          }
        } catch (err) {
          logger.warn("Cost probe failed:", err);
        }
      })();
    }, 2000);

    return () => clearTimeout(probeTimeout);
  }, [currentMenu, inventory]);

  const loadMenu = useCallback(
    async (menuId: string) => {
      try {
        await loadTemplate(menuId);
      } catch (err) {
        logger.error("Failed to load menu:", err);
        throw err;
      }
    },
    [loadTemplate],
  );

  // -------------------------------------------------------------------------
  // Circuit calculations
  // -------------------------------------------------------------------------

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
          setMealCircuitMetrics((prev) => ({ ...prev, [mealSlotId]: metrics }));
        }
        return metrics;
      } catch (err) {
        logger.error(`Failed to calculate meal circuit for ${mealSlotId}:`, err);
        return null;
      }
    },
    [currentMenu],
  );

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
        setDayCircuitMetrics((prev) => ({ ...prev, [dayOfWeek]: metrics }));
        return metrics;
      } catch (err) {
        logger.error(`Failed to calculate day circuit for day ${dayOfWeek}:`, err);
        return null;
      }
    },
    [currentMenu],
  );

  const calculateWeeklyCircuitMetrics =
    useCallback(async (): Promise<WeeklyMenuCircuitMetrics | null> => {
      if (!currentMenu) return null;
      try {
        const metrics = calculateWeeklyCircuit(
          currentMenu,
          currentMenu.meals[0]?.planetarySnapshot.planetaryPositions,
        );
        setWeeklyCircuitMetrics(metrics);
        if (metrics) {
          setDayCircuitMetrics({
            0: metrics.days.sunday,
            1: metrics.days.monday,
            2: metrics.days.tuesday,
            3: metrics.days.wednesday,
            4: metrics.days.thursday,
            5: metrics.days.friday,
            6: metrics.days.saturday,
          });
        }
        return metrics;
      } catch (err) {
        logger.error("Failed to calculate weekly circuit:", err);
        return null;
      }
    }, [currentMenu]);

  const refreshCircuitMetrics = useCallback(async () => {
    if (!currentMenu) return;
    try {
      await calculateWeeklyCircuitMetrics();
      logger.info("Circuit metrics refreshed");
    } catch (err) {
      logger.error("Failed to refresh circuit metrics:", err);
    }
  }, [currentMenu, calculateWeeklyCircuitMetrics]);

  const findBottlenecks = useCallback((): CircuitBottleneck[] => {
    if (!currentMenu || !dayCircuitMetrics) return [];
    const validDayCircuits = Object.values(dayCircuitMetrics).filter(
      (d): d is DayCircuitMetrics => d !== null,
    );
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

  const getSuggestions = useCallback((): CircuitImprovementSuggestion[] => {
    if (!currentMenu || !dayCircuitMetrics) return [];
    const validDayCircuits = Object.values(dayCircuitMetrics).filter(
      (d): d is DayCircuitMetrics => d !== null,
    );
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

  useEffect(() => {
    if (currentMenu && isMountedRef.current) {
      const timeoutId = setTimeout(() => {
        void refreshCircuitMetrics();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [currentMenu, refreshCircuitMetrics]);

  // -------------------------------------------------------------------------
  // Context value
  // -------------------------------------------------------------------------

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
      isTemplateSaving,
      isTemplateLoading,
      persistenceError,
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
      budgetPerMeal: weeklyBudget
        ? Math.round((weeklyBudget / 21) * 100) / 100
        : null,
      inventory,
      setInventory: setInventoryAndPersist,
      generationPreferences,
      setGenerationPreferences,
      updateGenerationPreference,
      resetGenerationPreferences,
    }),
    [
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
      isTemplateSaving,
      isTemplateLoading,
      persistenceError,
      calculateMealCircuitMetrics,
      calculateDayCircuitMetrics,
      calculateWeeklyCircuitMetrics,
      refreshCircuitMetrics,
      findBottlenecks,
      getSuggestions,
      saveMenu,
      loadMenu,
      syncWithLunarCycle,
      toggleSyncWithLunarCycle,
      weeklyBudget,
      setWeeklyBudget,
      inventory,
      setInventoryAndPersist,
      estimatedCostState,
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
