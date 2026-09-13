"use client";

/**
 * Menu Planner — Meal slot CRUD hook
 *
 * All add / remove / update / copy / move / swap operations on individual meal
 * slots live here.  The hook is parameterized — it receives the current menu
 * and its setter from MenuPlannerProvider so it can share state without
 * duplicating it.
 *
 * @file src/contexts/menu-planner/useMealSlots.ts
 */

import { useCallback } from "react";
import { allSauces } from "@/data/sauces";
import type { MonicaOptimizedRecipe } from "@/data/unified/recipeBuilding";
import type {
  WeeklyMenu,
  MealSlot,
  MealSlotSauce,
  DayOfWeek,
  MealType,
  GroceryItem,
} from "@/types/menuPlanner";
import { generateGroceryList } from "@/utils/groceryListGenerator";
import { logger } from "@/utils/logger";

const GROCERY_LIST_OPTIONS = {
  consolidateBy: "ingredient" as const,
  convertUnits: true,
  excludePantryItems: false,
};

/**
 * Rebuild the menu envelope around an updated meal list and regenerate the
 * derived grocery list in one shot.
 */
function applyMealUpdate(
  menu: WeeklyMenu,
  updatedMeals: MealSlot[],
): { menu: WeeklyMenu; groceryList: GroceryItem[] } {
  return {
    menu: { ...menu, meals: updatedMeals, updatedAt: new Date() },
    groceryList: generateGroceryList(updatedMeals, GROCERY_LIST_OPTIONS),
  };
}

/**
 * What `addMealToSlot` is actually able to accept.
 *
 * Two distinct `EnhancedRecipe` types are in play:
 *   - `MealSlot["recipe"]` is `EnhancedRecipe` from `@/types/recipe` — the shape
 *     the planner stores and reads back out of a slot.
 *   - `MonicaOptimizedRecipe` extends the *unified* `EnhancedRecipe`
 *     (`@/data/unified/recipes`) and additionally requires the Monica /
 *     seasonal / cuisine / nutrition optimisation blocks.
 *
 * `addMealToSlot` only ever reads `name` off the recipe, so demanding the
 * stronger of the two was an over-strong precondition: it forced `copyMeal` to
 * assert that a slot's own recipe (where those four blocks are optional) was a
 * fully Monica-optimised one. Accepting either removes that false assertion.
 */
export type SlotRecipeInput =
  | MonicaOptimizedRecipe
  | NonNullable<MealSlot["recipe"]>;

export interface UseMealSlotsParams {
  currentMenu: WeeklyMenu | null;
  setCurrentMenu: React.Dispatch<React.SetStateAction<WeeklyMenu | null>>;
  setGroceryList: React.Dispatch<React.SetStateAction<GroceryItem[]>>;
}

export interface UseMealSlotsReturn {
  addMealToSlot: (
    dayOfWeek: DayOfWeek,
    mealType: MealType,
    recipe: SlotRecipeInput,
    servings?: number,
    locked?: boolean,
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
  clearDay: (dayOfWeek: DayOfWeek) => Promise<void>;
  clearWeek: () => Promise<void>;
  addSauceToMeal: (
    mealSlotId: string,
    sauceId: string,
    servings?: number,
  ) => void;
  removeSauceFromMeal: (mealSlotId: string) => void;
  updateSauceServings: (mealSlotId: string, servings: number) => void;
  lockMeal: (mealSlotId: string) => void;
  unlockMeal: (mealSlotId: string) => void;
  isMealLocked: (mealSlotId: string) => boolean;
}

/**
 * Pure transition helper: clears the recipe from a meal slot while preserving
 * all other slot properties and strictly omitting the `recipe` key.
 */
export function removeRecipeFromMealSlot(meal: MealSlot): MealSlot {
  const { recipe: _recipe, ...mealWithoutRecipe } = meal;
  return { ...mealWithoutRecipe, updatedAt: new Date() };
}

/**
 * Pure transition helper: moves a recipe from source to target slot,
 * ensuring target was empty and source is cleared.
 */
export function moveMealBetweenSlots(
  sourceMeal: MealSlot,
  targetMeal: MealSlot,
): { source: MealSlot; target: MealSlot } {
  if (!sourceMeal.recipe) throw new Error("Source meal not found or has no recipe");
  if (targetMeal.recipe) throw new Error("Target slot is already occupied");

  const { recipe: _old, ...rest } = targetMeal;
  const target: MealSlot = {
    ...rest,
    servings: sourceMeal.servings,
    recipe: sourceMeal.recipe,
    updatedAt: new Date(),
  };
  const source = removeRecipeFromMealSlot(sourceMeal);
  return { source, target };
}

/**
 * Pure transition helper: swaps recipe and servings between two slots.
 * Correctly handles both occupied-to-occupied and occupied-to-empty swaps
 * without leaking undefined recipe keys.
 */
export function swapMealsBetweenSlots(
  meal1: MealSlot,
  meal2: MealSlot,
): { meal1: MealSlot; meal2: MealSlot } {
  const { recipe: _old1, ...rest1 } = meal1;
  const nextMeal1: MealSlot = {
    ...rest1,
    servings: meal2.servings,
    ...(meal2.recipe !== undefined ? { recipe: meal2.recipe } : {}),
    updatedAt: new Date(),
  };

  const { recipe: _old2, ...rest2 } = meal2;
  const nextMeal2: MealSlot = {
    ...rest2,
    servings: meal1.servings,
    ...(meal1.recipe !== undefined ? { recipe: meal1.recipe } : {}),
    updatedAt: new Date(),
  };

  return { meal1: nextMeal1, meal2: nextMeal2 };
}

export interface MealSlotSauceInput {
  name: string;
  nutritionalProfile?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
  };
  elementalProperties?: MealSlotSauce["elementalProperties"];
  ingredients?: string[];
}

/**
 * Pure transition helper: builds a MealSlot sauce object, cleanly omitting
 * nutritionalProfile if not provided or omitting undefined nutritional fields.
 */
export function buildMealSlotSauce(
  sauceId: string,
  sauceData: MealSlotSauceInput,
  servings = 1,
): MealSlotSauce {
  const { nutritionalProfile } = sauceData;
  const nutProfile = nutritionalProfile
    ? {
        ...(nutritionalProfile.calories !== undefined ? { calories: nutritionalProfile.calories } : {}),
        ...(nutritionalProfile.protein !== undefined ? { protein: nutritionalProfile.protein } : {}),
        ...(nutritionalProfile.carbs !== undefined ? { carbs: nutritionalProfile.carbs } : {}),
        ...(nutritionalProfile.fat !== undefined ? { fat: nutritionalProfile.fat } : {}),
        ...(nutritionalProfile.fiber !== undefined ? { fiber: nutritionalProfile.fiber } : {}),
      }
    : undefined;
  return {
    id: sauceId,
    name: sauceData.name,
    servings,
    ...(nutProfile !== undefined ? { nutritionalProfile: nutProfile } : {}),
    ...(sauceData.elementalProperties !== undefined
      ? { elementalProperties: sauceData.elementalProperties }
      : {}),
    ...(sauceData.ingredients !== undefined ? { ingredients: sauceData.ingredients } : {}),
  };
}

/**
 * All slot-level CRUD operations for the weekly menu planner.
 * State ownership stays in MenuPlannerProvider; this hook only provides
 * stable callback references via useCallback.
 */
export function useMealSlots({
  currentMenu,
  setCurrentMenu,
  setGroceryList,
}: UseMealSlotsParams): UseMealSlotsReturn {
  // -------------------------------------------------------------------------
  // Core add / remove / update
  // -------------------------------------------------------------------------

  const addMealToSlot = useCallback(
    async (
      dayOfWeek: DayOfWeek,
      mealType: MealType,
      recipe: SlotRecipeInput,
      servings = 1,
      locked?: boolean,
    ): Promise<void> => {
      if (!currentMenu) return;
      try {
        setCurrentMenu((prevMenu) => {
          if (!prevMenu) return prevMenu;
          const updatedMeals = prevMenu.meals.map((meal) => {
            if (meal.dayOfWeek === dayOfWeek && meal.mealType === mealType) {
              return {
                ...meal,
                // `MealSlot["recipe"]` is `EnhancedRecipe` (src/types/recipe.ts).
                // With `title?: string`, `SlotRecipeInput` matches directly without a cast.
                recipe,
                servings,
                // `locked` set in the same update as the recipe (remote-slot
                // materialization) — a follow-up lockMeal() would clobber the
                // add, since lockMeal rebuilds from the pre-add menu.
                ...(locked === undefined ? {} : { isLocked: locked }),
                updatedAt: new Date(),
              };
            }
            return meal;
          });
          return { ...prevMenu, meals: updatedMeals, updatedAt: new Date() };
        });
        await Promise.resolve();
        logger.info(`Added ${recipe.name} to ${mealType} on day ${dayOfWeek}`);
      } catch (err) {
        logger.error("Failed to add meal:", err);
        throw err;
      }
    },
    [currentMenu, setCurrentMenu],
  );

  const removeMealFromSlot = useCallback(
    async (mealSlotId: string): Promise<void> => {
      if (!currentMenu) return;
      try {
        setCurrentMenu((prevMenu) => {
          if (!prevMenu) return prevMenu;
          const updatedMeals = prevMenu.meals.map((meal) => {
            if (meal.id === mealSlotId) {
              return removeRecipeFromMealSlot(meal);
            }
            return meal;
          });
          return { ...prevMenu, meals: updatedMeals, updatedAt: new Date() };
        });
        await Promise.resolve();
        logger.info(`Removed meal from slot ${mealSlotId}`);
      } catch (err) {
        logger.error("Failed to remove meal:", err);
        throw err;
      }
    },
    [currentMenu, setCurrentMenu],
  );

  const updateMealServings = useCallback(
    async (mealSlotId: string, servings: number): Promise<void> => {
      if (!currentMenu) return;
      try {
        const updatedMeals = currentMenu.meals.map((meal) =>
          meal.id === mealSlotId
            ? { ...meal, servings, updatedAt: new Date() }
            : meal,
        );
        setCurrentMenu({ ...currentMenu, meals: updatedMeals, updatedAt: new Date() });
        await Promise.resolve();
        logger.info(`Updated servings for meal ${mealSlotId} to ${servings}`);
      } catch (err) {
        logger.error("Failed to update servings:", err);
        throw err;
      }
    },
    [currentMenu, setCurrentMenu],
  );

  // -------------------------------------------------------------------------
  // Copy / move / swap
  // -------------------------------------------------------------------------

  const copyMeal = useCallback(
    async (
      sourceMealSlotId: string,
      targetDay: DayOfWeek,
      targetMealType: MealType,
    ): Promise<void> => {
      if (!currentMenu) return;
      try {
        const sourceMeal = currentMenu.meals.find((m) => m.id === sourceMealSlotId);
        if (!sourceMeal?.recipe) throw new Error("Source meal not found or has no recipe");
        await addMealToSlot(
          targetDay,
          targetMealType,
          sourceMeal.recipe,
          sourceMeal.servings,
        );
        logger.info(`Copied meal from ${sourceMealSlotId} to ${targetDay}-${targetMealType}`);
      } catch (err) {
        logger.error("Failed to copy meal:", err);
        throw err;
      }
    },
    [currentMenu, addMealToSlot],
  );

  const moveMeal = useCallback(
    async (sourceMealSlotId: string, targetMealSlotId: string): Promise<void> => {
      if (!currentMenu) return;
      try {
        const sourceMeal = currentMenu.meals.find((m) => m.id === sourceMealSlotId);
        const targetMeal = currentMenu.meals.find((m) => m.id === targetMealSlotId);
        if (!sourceMeal?.recipe) throw new Error("Source meal not found or has no recipe");
        if (!targetMeal) throw new Error("Target meal slot not found");
        const { source, target } = moveMealBetweenSlots(sourceMeal, targetMeal);

        setCurrentMenu((prevMenu) => {
          if (!prevMenu) return prevMenu;
          const updatedMeals = prevMenu.meals.map((meal) => {
            if (meal.id === targetMealSlotId) return target;
            if (meal.id === sourceMealSlotId) return source;
            return meal;
          });
          return { ...prevMenu, meals: updatedMeals, updatedAt: new Date() };
        });
        await Promise.resolve();
        logger.info(`Moved meal from ${sourceMealSlotId} to ${targetMealSlotId}`);
      } catch (err) {
        logger.error("Failed to move meal:", err);
        throw err;
      }
    },
    [currentMenu, setCurrentMenu],
  );

  const swapMeals = useCallback(
    async (mealSlotId1: string, mealSlotId2: string): Promise<void> => {
      if (!currentMenu) return;
      try {
        const meal1 = currentMenu.meals.find((m) => m.id === mealSlotId1);
        const meal2 = currentMenu.meals.find((m) => m.id === mealSlotId2);
        if (!meal1 || !meal2) throw new Error("One or both meal slots not found");

        const { meal1: nextMeal1, meal2: nextMeal2 } = swapMealsBetweenSlots(meal1, meal2);

        const updatedMeals = currentMenu.meals.map((meal) => {
          if (meal.id === mealSlotId1) return nextMeal1;
          if (meal.id === mealSlotId2) return nextMeal2;
          return meal;
        });
        setCurrentMenu({ ...currentMenu, meals: updatedMeals, updatedAt: new Date() });
        await Promise.resolve();
        logger.info(`Swapped meals between ${mealSlotId1} and ${mealSlotId2}`);
      } catch (err) {
        logger.error("Failed to swap meals:", err);
        throw err;
      }
    },
    [currentMenu, setCurrentMenu],
  );

  const copyMealToSlots = useCallback(
    async (sourceMealSlotId: string, targetSlotIds: string[], servings?: number): Promise<void> => {
      if (!currentMenu) return;
      try {
        const sourceMeal = currentMenu.meals.find((m) => m.id === sourceMealSlotId);
        if (!sourceMeal?.recipe) throw new Error("Source meal not found or has no recipe");
        const useServings = servings ?? sourceMeal.servings;
        const updatedMeals = currentMenu.meals.map((meal) => {
          if (targetSlotIds.includes(meal.id)) {
            const { recipe: _old, ...rest } = meal;
            return {
              ...rest,
              servings: useServings,
              ...(sourceMeal.recipe !== undefined ? { recipe: sourceMeal.recipe } : {}),
              updatedAt: new Date(),
            };
          }
          return meal;
        });
        setCurrentMenu({ ...currentMenu, meals: updatedMeals, updatedAt: new Date() });
        await Promise.resolve();
        logger.info(`Copied meal from ${sourceMealSlotId} to ${targetSlotIds.length} slots`);
      } catch (err) {
        logger.error("Failed to copy meal to slots:", err);
        throw err;
      }
    },
    [currentMenu, setCurrentMenu],
  );

  const moveMealToSlots = useCallback(
    async (sourceMealSlotId: string, targetSlotIds: string[], servings?: number): Promise<void> => {
      if (!currentMenu) return;
      try {
        const sourceMeal = currentMenu.meals.find((m) => m.id === sourceMealSlotId);
        if (!sourceMeal?.recipe) throw new Error("Source meal not found or has no recipe");
        const useServings = servings ?? sourceMeal.servings;
        const updatedMeals = currentMenu.meals.map((meal) => {
          if (targetSlotIds.includes(meal.id)) {
            const { recipe: _old, ...rest } = meal;
            return {
              ...rest,
              servings: useServings,
              ...(sourceMeal.recipe !== undefined ? { recipe: sourceMeal.recipe } : {}),
              updatedAt: new Date(),
            };
          }
          if (meal.id === sourceMealSlotId) {
            const { recipe: _recipe, ...mealWithoutRecipe } = meal;
            return { ...mealWithoutRecipe, updatedAt: new Date() };
          }
          return meal;
        });
        setCurrentMenu({ ...currentMenu, meals: updatedMeals, updatedAt: new Date() });
        await Promise.resolve();
        logger.info(`Moved meal from ${sourceMealSlotId} to ${targetSlotIds.length} slots`);
      } catch (err) {
        logger.error("Failed to move meal to slots:", err);
        throw err;
      }
    },
    [currentMenu, setCurrentMenu],
  );

  // -------------------------------------------------------------------------
  // Bulk clear
  // -------------------------------------------------------------------------

  const clearDay = useCallback(
    async (dayOfWeek: DayOfWeek): Promise<void> => {
      if (!currentMenu) return;
      try {
        const updatedMeals = currentMenu.meals.map((meal) => {
          if (meal.dayOfWeek === dayOfWeek) {
            const { recipe: _recipe, ...mealWithoutRecipe } = meal;
            return { ...mealWithoutRecipe, updatedAt: new Date() };
          }
          return meal;
        });
        setCurrentMenu({ ...currentMenu, meals: updatedMeals, updatedAt: new Date() });
        await Promise.resolve();
        logger.info(`Cleared all meals for day ${dayOfWeek}`);
      } catch (err) {
        logger.error("Failed to clear day:", err);
        throw err;
      }
    },
    [currentMenu, setCurrentMenu],
  );

  const clearWeek = useCallback(async (): Promise<void> => {
    if (!currentMenu) return;
    try {
      const updatedMeals = currentMenu.meals.map((meal) => {
        const { recipe: _recipe, ...mealWithoutRecipe } = meal;
        return { ...mealWithoutRecipe, updatedAt: new Date() };
      });
      setCurrentMenu((prevMenu) => {
        if (!prevMenu) return prevMenu;
        return { ...prevMenu, meals: updatedMeals, groceryList: [], updatedAt: new Date() };
      });
      setGroceryList([]);
      await Promise.resolve();
      logger.info("Cleared entire week");
    } catch (err) {
      logger.error("Failed to clear week:", err);
      throw err;
    }
  }, [currentMenu, setCurrentMenu, setGroceryList]);

  // -------------------------------------------------------------------------
  // Sauce operations
  // -------------------------------------------------------------------------

  const addSauceToMeal = useCallback(
    (mealSlotId: string, sauceId: string, servings = 1): void => {
      if (!currentMenu) return;
      const sauceData = (allSauces as Record<string, (typeof allSauces)[string] | undefined>)[sauceId];
      if (!sauceData) {
        logger.warn(`Sauce not found: ${sauceId}`);
        return;
      }
      const updatedMeals = currentMenu.meals.map((meal) => {
        if (meal.id === mealSlotId) {
          return {
            ...meal,
            sauce: buildMealSlotSauce(sauceId, sauceData, servings),
            updatedAt: new Date(),
          };
        }
        return meal;
      });
      const { menu: updatedMenu, groceryList: newGroceryList } = applyMealUpdate(currentMenu, updatedMeals);
      setCurrentMenu(updatedMenu);
      setGroceryList(newGroceryList);
      logger.info(`Added sauce ${sauceData.name} to meal ${mealSlotId}`);
    },
    [currentMenu, setCurrentMenu, setGroceryList],
  );

  const removeSauceFromMeal = useCallback(
    (mealSlotId: string) => {
      if (!currentMenu) return;
      const updatedMeals = currentMenu.meals.map((meal) => {
        if (meal.id === mealSlotId) {
          const { sauce: _sauce, ...mealWithoutSauce } = meal;
          return { ...mealWithoutSauce, updatedAt: new Date() };
        }
        return meal;
      });
      const { menu: updatedMenu, groceryList: newGroceryList } = applyMealUpdate(currentMenu, updatedMeals);
      setCurrentMenu(updatedMenu);
      setGroceryList(newGroceryList);
      logger.info(`Removed sauce from meal ${mealSlotId}`);
    },
    [currentMenu, setCurrentMenu, setGroceryList],
  );

  const updateSauceServings = useCallback(
    (mealSlotId: string, servings: number) => {
      if (!currentMenu) return;
      const updatedMeals = currentMenu.meals.map((meal) => {
        if (meal.id === mealSlotId && meal.sauce) {
          return {
            ...meal,
            sauce: { ...meal.sauce, servings: Math.max(0.5, servings) },
            updatedAt: new Date(),
          };
        }
        return meal;
      });
      const { menu: updatedMenu, groceryList: newGroceryList } = applyMealUpdate(currentMenu, updatedMeals);
      setCurrentMenu(updatedMenu);
      setGroceryList(newGroceryList);
      logger.info(`Updated sauce servings to ${servings} for meal ${mealSlotId}`);
    },
    [currentMenu, setCurrentMenu, setGroceryList],
  );

  // -------------------------------------------------------------------------
  // Lock / unlock
  // -------------------------------------------------------------------------

  const lockMeal = useCallback(
    (mealSlotId: string) => {
      if (!currentMenu) return;
      const updatedMeals = currentMenu.meals.map((meal) =>
        meal.id === mealSlotId ? { ...meal, isLocked: true, updatedAt: new Date() } : meal,
      );
      setCurrentMenu({ ...currentMenu, meals: updatedMeals, updatedAt: new Date() });
      logger.info(`Locked meal ${mealSlotId}`);
    },
    [currentMenu, setCurrentMenu],
  );

  const unlockMeal = useCallback(
    (mealSlotId: string) => {
      if (!currentMenu) return;
      const updatedMeals = currentMenu.meals.map((meal) =>
        meal.id === mealSlotId ? { ...meal, isLocked: false, updatedAt: new Date() } : meal,
      );
      setCurrentMenu({ ...currentMenu, meals: updatedMeals, updatedAt: new Date() });
      logger.info(`Unlocked meal ${mealSlotId}`);
    },
    [currentMenu, setCurrentMenu],
  );

  const isMealLocked = useCallback(
    (mealSlotId: string): boolean => {
      if (!currentMenu) return false;
      const meal = currentMenu.meals.find((m) => m.id === mealSlotId);
      return meal?.isLocked ?? false;
    },
    [currentMenu],
  );

  return {
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
  };
}
