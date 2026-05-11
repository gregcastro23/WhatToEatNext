"use client";

/**
 * GroceryCartContext — lightweight, app-wide cart that aggregates ingredients
 * from one or more recipes and checks out via Amazon Cart (POST form).
 *
 * Replaces the previous Instacart integration. Amazon associate royalties
 * are earned via the cookingwi03f1-20 tag.
 *
 * Pipeline:
 *   addRecipe(recipe, servings) → ingredients scaled and aggregated by
 *   (name, normalizedUnit) → checkoutToAmazon() → POST form submit
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
import { AMAZON_ASSOCIATE_TAG, resolveAsin, getStandardizedQuantity } from "@/data/amazon";

const STORAGE_KEY = "alchm:grocery-cart:v2";
const AMAZON_CART_URL = "https://www.amazon.com/gp/aws/cart/add.html";

export interface GroceryCartIngredientInput {
  name: string;
  amount?: number;
  unit?: string;
  category?: string;
  notes?: string;
  asin?: string;
}

export interface GroceryCartRecipeInput {
  id: string;
  name: string;
  baseServings: number;
  ingredients: GroceryCartIngredientInput[];
}

export interface GroceryCartItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category?: string;
  recipeIds: string[];
  notes?: string;
  addedAt: number;
  asin: string | null;
}

interface GroceryCartContextValue {
  items: GroceryCartItem[];
  itemCount: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  addRecipe: (recipe: GroceryCartRecipeInput, targetServings: number) => number;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clear: () => void;
  /**
   * Opens Amazon in a new tab with all resolved-ASIN items added to cart.
   * Returns the number of items sent.
   */
  checkoutToAmazon: () => number;
  /** Items that could not be mapped to an ASIN */
  unmappedItems: GroceryCartItem[];
  updateAsin: (id: string, asin: string) => void;
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

  useEffect(() => {
    setItems(readFromStorage());
    hydratedRef.current = true;
  }, []);

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
          const asin = ing.asin || resolveAsin(ing.name);

          const existing = map.get(id);
          if (existing) {
            map.set(id, {
              ...existing,
              quantity: safeRound(existing.quantity + scaledAmount),
              recipeIds: existing.recipeIds.includes(recipe.id)
                ? existing.recipeIds
                : [...existing.recipeIds, recipe.id],
              notes: existing.notes ?? ing.notes,
              asin: existing.asin || asin,
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
              asin,
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

  const unmappedItems = useMemo(
    () => items.filter((item) => !item.asin),
    [items],
  );

  const updateAsin = useCallback((id: string, asin: string) => {
    setItems((prev) => prev.map((item) => 
      item.id === id ? { ...item, asin } : item
    ));
  }, []);

  const searchedItemsRef = useRef<Set<string>>(new Set());
  const resolveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Automatically attempt to resolve unmapped items.
  // Batched POST to /api/amazon/search — one network call per debounce window
  // instead of N concurrent GETs (which previously self-DoS'd the rate limiter).
  useEffect(() => {
    if (!hydratedRef.current) return;

    const toResolve = unmappedItems.filter(
      (item) => !searchedItemsRef.current.has(item.id),
    );
    if (toResolve.length === 0) return;

    if (resolveTimerRef.current) clearTimeout(resolveTimerRef.current);
    resolveTimerRef.current = setTimeout(() => {
      // Mark optimistically so we don't double-fire while in-flight.
      toResolve.forEach((item) => searchedItemsRef.current.add(item.id));

      void (async () => {
        try {
          const res = await fetch("/api/amazon/search", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              ingredients: toResolve.map((item) => item.name),
            }),
          });

          // 429/503 = upstream throttling. Un-mark so the user can retry later.
          if (res.status === 429 || res.status === 503) {
            toResolve.forEach((item) => searchedItemsRef.current.delete(item.id));
            return;
          }
          if (!res.ok) return;

          const payload = (await res.json()) as {
            results?: Array<{ ingredient: string; asin: string | null }>;
          };
          const byName = new Map(
            (payload.results ?? []).map((r) => [r.ingredient.trim().toLowerCase(), r.asin]),
          );

          toResolve.forEach((item) => {
            const asin = byName.get(item.name.trim().toLowerCase());
            if (asin) updateAsin(item.id, asin);
          });
        } catch (e) {
          // Network/parse failure — let the items be re-tried on next render.
          toResolve.forEach((item) => searchedItemsRef.current.delete(item.id));
          console.error("Batch ASIN resolve failed", e);
        }
      })();
    }, 800);

    return () => {
      if (resolveTimerRef.current) clearTimeout(resolveTimerRef.current);
    };
  }, [unmappedItems, updateAsin]);

  const checkoutToAmazon = useCallback((): number => {
    const cartItems = items.filter((item) => item.asin);
    if (cartItems.length === 0) return 0;

    // Build and submit a hidden form to Amazon
    const form = document.createElement("form");
    form.method = "POST";
    form.action = AMAZON_CART_URL;
    form.target = "_blank";
    form.rel = "noopener noreferrer";
    form.style.display = "none";

    const tagInput = document.createElement("input");
    tagInput.type = "hidden";
    tagInput.name = "AssociateTag";
    tagInput.value = AMAZON_ASSOCIATE_TAG;
    form.appendChild(tagInput);

    const cartTypeInput = document.createElement("input");
    cartTypeInput.type = "hidden";
    cartTypeInput.name = "cart-type";
    cartTypeInput.value = "fresh";
    form.appendChild(cartTypeInput);

    const addInput = document.createElement("input");
    addInput.type = "hidden";
    addInput.name = "add";
    addInput.value = "add";
    form.appendChild(addInput);

    const submitAddInput = document.createElement("input");
    submitAddInput.type = "hidden";
    submitAddInput.name = "submit.add";
    submitAddInput.value = "1";
    form.appendChild(submitAddInput);

    cartItems.forEach((item, idx) => {
      const pos = idx + 1;
      const asinInput = document.createElement("input");
      asinInput.type = "hidden";
      asinInput.name = `ASIN.${pos}`;
      asinInput.value = item.asin!;
      form.appendChild(asinInput);

      const qtyInput = document.createElement("input");
      qtyInput.type = "hidden";
      qtyInput.name = `Quantity.${pos}`;
      qtyInput.value = String(getStandardizedQuantity(item.name, item.quantity));
      form.appendChild(qtyInput);
    });

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);

    return cartItems.length;
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
      checkoutToAmazon,
      unmappedItems,
      updateAsin,
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
      checkoutToAmazon,
      unmappedItems,
      updateAsin,
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
