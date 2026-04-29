"use client";

/**
 * GroceryCartContext — lightweight, app-wide cart that aggregates ingredients
 * from one or more recipes and hands off to Instacart for checkout.
 *
 * Lives independently of MenuPlannerContext (which is scoped to weekly menu
 * planning). Persisted to localStorage so the cart survives reloads.
 *
 * Pipeline:
 *   addRecipe(recipe, servings) → ingredients scaled and aggregated by
 *   (name, normalizedUnit) → checkoutToInstacart() → /api/instacart/shopping-list
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { instacartService } from "@/services/InstacartService";
import type { GroceryItem } from "@/types/menuPlanner";

const STORAGE_KEY = "alchm:grocery-cart:v1";

export interface GroceryCartIngredientInput {
  name: string;
  amount?: number;
  unit?: string;
  category?: string;
  notes?: string;
}

export interface GroceryCartRecipeInput {
  id: string;
  name: string;
  baseServings: number;
  ingredients: GroceryCartIngredientInput[];
}

export interface GroceryCartItem {
  /** Stable id derived from ingredient name + normalized unit */
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category?: string;
  /** Recipe ids that contributed to this line */
  recipeIds: string[];
  /** Free-form notes from any contributing recipe */
  notes?: string;
  addedAt: number;
}

interface GroceryCartContextValue {
  items: GroceryCartItem[];
  itemCount: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  /**
   * Add a recipe's ingredients to the cart, scaled to `targetServings`.
   * Returns the number of cart lines added or merged.
   */
  addRecipe: (recipe: GroceryCartRecipeInput, targetServings: number) => number;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clear: () => void;
  /**
   * Hands off the current cart to Instacart and returns the shoppable URL.
   * Throws if cart is empty or the IDP call fails.
   */
  checkoutToInstacart: () => Promise<string>;
}

const GroceryCartContext = createContext<GroceryCartContextValue | null>(null);

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeUnit(unit?: string): string {
  if (!unit) return "each";
  return unit.toLowerCase().trim();
}

function buildItemId(name: string, unit?: string): string {
  return `${slugify(name)}__${slugify(normalizeUnit(unit))}`;
}

function safeRound(n: number): number {
  return Math.round(n * 100) / 100;
}

function readFromStorage(): GroceryCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is GroceryCartItem =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as GroceryCartItem).id === "string" &&
        typeof (item as GroceryCartItem).name === "string",
    );
  } catch {
    return [];
  }
}

function writeToStorage(items: GroceryCartItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore quota errors
  }
}

export function GroceryCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<GroceryCartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const hydratedRef = useRef(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setItems(readFromStorage());
    hydratedRef.current = true;
  }, []);

  // Persist on change (skip first paint before hydration)
  useEffect(() => {
    if (!hydratedRef.current) return;
    writeToStorage(items);
  }, [items]);

  const addRecipe = useCallback(
    (recipe: GroceryCartRecipeInput, targetServings: number): number => {
      const baseServings = Math.max(1, recipe.baseServings || 1);
      const scale = Math.max(0, targetServings) / baseServings;
      if (scale === 0 || recipe.ingredients.length === 0) return 0;

      let touched = 0;
      setItems((prev) => {
        const map = new Map<string, GroceryCartItem>();
        prev.forEach((item) => map.set(item.id, item));

        for (const ing of recipe.ingredients) {
          if (!ing.name) continue;
          const unit = normalizeUnit(ing.unit);
          const id = buildItemId(ing.name, unit);
          const scaledAmount = safeRound((ing.amount ?? 1) * scale);

          const existing = map.get(id);
          if (existing) {
            map.set(id, {
              ...existing,
              quantity: safeRound(existing.quantity + scaledAmount),
              recipeIds: existing.recipeIds.includes(recipe.id)
                ? existing.recipeIds
                : [...existing.recipeIds, recipe.id],
              notes: existing.notes ?? ing.notes,
            });
          } else {
            map.set(id, {
              id,
              name: ing.name,
              quantity: scaledAmount,
              unit,
              category: ing.category,
              recipeIds: [recipe.id],
              notes: ing.notes,
              addedAt: Date.now(),
            });
          }
          touched += 1;
        }

        return Array.from(map.values()).sort((a, b) => b.addedAt - a.addedAt);
      });
      return touched;
    },
    [],
  );

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, qty: number) => {
    setItems((prev) => {
      if (qty <= 0) return prev.filter((item) => item.id !== id);
      return prev.map((item) =>
        item.id === id ? { ...item, quantity: safeRound(qty) } : item,
      );
    });
  }, []);

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  const checkoutToInstacart = useCallback(async (): Promise<string> => {
    if (items.length === 0) {
      throw new Error("Your grocery cart is empty.");
    }
    // Map our cart items into the GroceryItem shape InstacartService expects.
    const groceryItems: GroceryItem[] = items.map((item) => ({
      id: item.id,
      ingredient: item.name,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category ?? "other",
      inPantry: false,
      purchased: false,
      usedInRecipes: item.recipeIds,
      notes: item.notes,
    }));

    const url = await instacartService.createShoppingList(
      groceryItems,
      "Alchm Kitchen Grocery Cart",
    );
    return url;
  }, [items]);

  const value = useMemo<GroceryCartContextValue>(
    () => ({
      items,
      itemCount: items.length,
      isOpen,
      open,
      close,
      toggle,
      addRecipe,
      removeItem,
      updateQuantity,
      clear,
      checkoutToInstacart,
    }),
    [
      items,
      isOpen,
      open,
      close,
      toggle,
      addRecipe,
      removeItem,
      updateQuantity,
      clear,
      checkoutToInstacart,
    ],
  );

  return (
    <GroceryCartContext.Provider value={value}>
      {children}
    </GroceryCartContext.Provider>
  );
}

export function useGroceryCart(): GroceryCartContextValue {
  const ctx = useContext(GroceryCartContext);
  if (!ctx) {
    throw new Error("useGroceryCart must be used inside <GroceryCartProvider>");
  }
  return ctx;
}
