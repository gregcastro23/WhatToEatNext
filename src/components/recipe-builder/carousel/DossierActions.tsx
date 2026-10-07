"use client";

/**
 * A dossier's actions: save the recipe, send its ingredients to the grocery
 * cart (when the cart provider is mounted), and open the full recipe page.
 *
 * @file src/components/recipe-builder/carousel/DossierActions.tsx
 */

import { Bookmark, Check, ExternalLink, ShoppingBag } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import {
  useOptionalGroceryCart,
  type GroceryCartIngredientInput,
  type GroceryCartRecipeInput,
} from "@/contexts/GroceryCartContext";
import type { RecipeIngredient } from "@/types/recipe";
import { saveRecipeToStore } from "@/utils/generatedRecipeStore";
import { createLogger } from "@/utils/logger";
import type { RecommendedMeal } from "@/utils/menuPlanner/recommendationBridge";
import { FOCUS_RING } from "../focusRing";

const logger = createLogger("RecipeSuggestionCarousel");

const DEFAULT_SERVINGS = 2;

/** An ingredient amount from generated JSON (number or numeric string) → a positive quantity, default 1. */
function quantityOf(amount: unknown): number {
  const value = typeof amount === "number" ? amount : Number.parseFloat(String(amount));
  return Number.isFinite(value) && value > 0 ? value : 1;
}

/** Generated JSON is checked only for the fields the carousel needs; a recipe without a list adds nothing. */
function cartIngredients(list: readonly RecipeIngredient[] | undefined): GroceryCartIngredientInput[] {
  return (list ?? []).map((i) => ({ name: i.name, amount: quantityOf(i.amount), unit: i.unit }));
}

export function toCartRecipe(meal: RecommendedMeal): GroceryCartRecipeInput {
  const { id, name, numberOfServings, ingredients } = meal.recipe;
  return {
    id: id || name.toLowerCase().replace(/\s+/g, "-"),
    name,
    baseServings: numberOfServings !== undefined && numberOfServings > 0 ? numberOfServings : DEFAULT_SERVINGS,
    ingredients: cartIngredients(ingredients),
  };
}

const BUTTON = `inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold transition-all active:scale-[0.98] ${FOCUS_RING}`;

function SaveButton({ isSaved, onSave }: { isSaved: boolean; onSave: () => void }): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onSave}
      className={`flex-1 ${BUTTON} ${
        isSaved
          ? "border border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
          : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-600/25"
      }`}
    >
      {isSaved ? <Check className="h-4 w-4 text-emerald-400" aria-hidden /> : <Bookmark className="h-4 w-4" aria-hidden />}
      <span>{isSaved ? "Recipe Saved" : "Save Recipe"}</span>
    </button>
  );
}

function CartNotice({ message }: { message: string }): React.JSX.Element {
  return (
    <div role="status" className="mx-5 mb-2 py-1.5 px-3 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-200 text-xs font-mono flex items-center gap-2">
      <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden />
      <span>{message}</span>
    </div>
  );
}

/** Sends the recipe to the grocery cart and opens it; `available` is false without the cart provider. */
function useCartDispatch(meal: RecommendedMeal): { available: boolean; notice: string | null; add: () => void } {
  const groceryCart = useOptionalGroceryCart();
  const [notice, setNotice] = useState<string | null>(null);
  const add = (): void => {
    if (!groceryCart) return;
    const cartRecipe = toCartRecipe(meal);
    const added = groceryCart.addRecipe(cartRecipe, cartRecipe.baseServings);
    setNotice(`Added ${added} ingredient${added === 1 ? "" : "s"} to grocery cart`);
    groceryCart.open();
  };
  return { available: groceryCart !== null, notice, add };
}

function FullRecipeLink({ id }: { id: string }): React.JSX.Element {
  return (
    <Link
      href={`/generated-recipe/${id}`}
      className={`${BUTTON} gap-1.5 font-mono font-medium border border-white/15 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white`}
    >
      <span>Full Recipe</span>
      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
    </Link>
  );
}

export default function DossierActions({
  meal,
  onSaved,
}: {
  meal: RecommendedMeal;
  onSaved: ((meal: RecommendedMeal) => void) | undefined;
}): React.JSX.Element {
  const cart = useCartDispatch(meal);
  const [isSaved, setIsSaved] = useState(false);
  const { recipe } = meal;

  const handleSave = (): void => {
    if (recipe.id) {
      saveRecipeToStore(recipe);
      logger.info(`Saved recipe to store: ${recipe.name}`);
    }
    setIsSaved(true);
    onSaved?.(meal);
  };

  return (
    <>
      {cart.notice && <CartNotice message={cart.notice} />}
      <div className="px-5 pb-5 flex flex-wrap gap-2.5 border-t border-white/10 pt-4">
        <SaveButton isSaved={isSaved} onSave={handleSave} />
        {cart.available && (
          <button
            type="button"
            onClick={cart.add}
            className={`${BUTTON} border border-amber-500/40 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20 hover:border-amber-500/60`}
            title="Add this recipe's ingredients to your grocery cart"
          >
            <ShoppingBag className="h-4 w-4 text-amber-400" aria-hidden />
            <span>Add to Cart</span>
          </button>
        )}
        {recipe.id && <FullRecipeLink id={recipe.id} />}
      </div>
    </>
  );
}
