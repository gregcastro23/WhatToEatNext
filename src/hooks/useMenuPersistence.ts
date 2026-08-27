"use client";

import { useCallback, useState } from "react";
import type { WeeklyMenu, GroceryItem, MealSlot } from "@/types/menuPlanner";
import { logger } from "@/utils/logger";

interface MenuTemplateData {
  name: string;
  meals: MealSlot[];
  groceryList?: GroceryItem[];
  inventory?: string[];
  weeklyBudget?: number | null;
}

interface MenuTemplateResponse {
  template?: MenuTemplateData;
}

interface UseMenuPersistenceArgs {
  currentMenu: WeeklyMenu | null;
  groceryList: GroceryItem[];
  inventory: string[];
  weeklyBudget: number | null;
  currentWeekStart: Date;
  createInitialMenu: (weekStart: Date) => WeeklyMenu;
  setCurrentMenu: (menu: WeeklyMenu) => void;
  setGroceryList: (list: GroceryItem[]) => void;
  setInventoryRaw: (inv: string[]) => void;
  setWeeklyBudgetRaw: (budget: number | null) => void;
  persistMenu: (overrides?: {
    menu?: WeeklyMenu;
    groceryList?: GroceryItem[];
    inventory?: string[];
    weeklyBudget?: number | null;
  }) => Promise<void>;
}

interface UseMenuPersistenceReturn {
  saveAsTemplate: (name: string, description?: string) => Promise<void>;
  loadTemplate: (templateId: string) => Promise<void>;
  isSaving: boolean;
  isLoading: boolean;
  persistenceError: Error | null;
}

export function useMenuPersistence({
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
}: UseMenuPersistenceArgs): UseMenuPersistenceReturn {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [persistenceError, setPersistenceError] = useState<Error | null>(null);

  const saveAsTemplate = useCallback(
    async (name: string, _description?: string) => {
      if (!currentMenu) return;

      setIsSaving(true);
      setPersistenceError(null);
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
        const error = err instanceof Error ? err : new Error(String(err));
        setPersistenceError(error);
        logger.error("Failed to save template:", err);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [currentMenu, groceryList, inventory, weeklyBudget],
  );

  const loadTemplate = useCallback(
    async (templateId: string) => {
      setIsLoading(true);
      setPersistenceError(null);
      try {
        const response = await fetch(
          `/api/menu-planner/templates?id=${encodeURIComponent(templateId)}`,
          { credentials: "include" },
        );
        if (!response.ok) {
          throw new Error(`Template load failed with status ${response.status}`);
        }
        const { template } = (await response.json()) as MenuTemplateResponse;

        if (!template) {
          throw new Error("Template not found");
        }

        const newMenu = createInitialMenu(currentWeekStart);
        newMenu.meals = template.meals.map((m, index) => {
          const defaultSnapshot = newMenu.meals.find(
            (nm) => nm.dayOfWeek === m.dayOfWeek && nm.mealType === m.mealType,
          )?.planetarySnapshot ?? m.planetarySnapshot;

          return {
            ...m,
            id: `${m.dayOfWeek}-${m.mealType}-${Date.now()}-${index}`,
            planetarySnapshot: defaultSnapshot,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        });

        setCurrentMenu(newMenu);
        setGroceryList(template.groceryList ?? []);
        setInventoryRaw(
          Array.isArray(template.inventory) ? template.inventory : [],
        );
        setWeeklyBudgetRaw(
          typeof template.weeklyBudget === "number"
            ? template.weeklyBudget
            : null,
        );
        persistMenu({
          menu: newMenu,
          groceryList: template.groceryList ?? [],
          inventory: Array.isArray(template.inventory)
            ? template.inventory
            : [],
          weeklyBudget:
            typeof template.weeklyBudget === "number"
              ? template.weeklyBudget
              : null,
        }).catch((err: unknown) => {
          logger.error("Failed to persist menu after loading template:", err);
        });
        logger.info(`Loaded template: ${template.name}`);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setPersistenceError(error);
        logger.error("Failed to load template:", err);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [
      currentWeekStart,
      createInitialMenu,
      setCurrentMenu,
      setGroceryList,
      setInventoryRaw,
      setWeeklyBudgetRaw,
      persistMenu,
    ],
  );

  return { saveAsTemplate, loadTemplate, isSaving, isLoading, persistenceError };
}
