"use client";

import { useGroceryCart } from "@/contexts/GroceryCartContext";
import type { SavedAdaptation } from "@/lib/recipes/savedAdaptationSchemas";
import type { JSX } from "react";

export function SavedAdaptationCartButton({
  version,
}: {
  version: SavedAdaptation;
}): JSX.Element {
  const { addRecipe, open } = useGroceryCart();
  const { recipe, id } = version;
  const servings = recipe.numberOfServings ?? recipe.servingSize;
  const addToCart = (): void => {
    if (servings === undefined) return;
    addRecipe(
      {
        id,
        name: recipe.name,
        baseServings: servings,
        ingredients: recipe.ingredients,
      },
      servings,
    );
    open();
  };
  return (
    <>
      <button
        type="button"
        disabled={servings === undefined}
        onClick={addToCart}
        className="mt-3 rounded border px-3 py-2 disabled:opacity-50"
      >
        Add saved version ingredients to cart
      </button>
      {servings === undefined && (
        <p className="text-sm">
          Cart unavailable because the saved batch serving count is unknown.
        </p>
      )}
    </>
  );
}

