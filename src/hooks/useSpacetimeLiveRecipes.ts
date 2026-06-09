"use client";

/**
 * useSpacetimeLiveRecipes — read-path swap for the recipe browse surfaces.
 *
 * When the SpacetimeDB connection is live AND the
 * NEXT_PUBLIC_SPACETIME_LIVE_CULINARY flag is on, subscribes to the
 * in-module `recipe` table and returns its rows mapped to the frontend
 * `Recipe` shape so they can merge into existing browse lists. In every
 * other case returns an empty array — the legacy static/REST path is the
 * fallback, never the live one.
 */

import { useEffect, useMemo, useState } from "react";
import { useSpacetime } from "@/contexts/SpacetimeContext";
import { isLiveCulinaryEnabled } from "@/lib/spacetime/config";
import type { Recipe as StdbRecipeRow } from "@/lib/spacetime/generated/types";
import type { Recipe } from "@/types/recipe";

/** Module convention: 0 = Fire, 1 = Earth, 2 = Air, 3 = Water. */
const ELEMENT_BY_INDEX = ["Fire", "Earth", "Air", "Water"] as const;

function mapStdbRecipe(row: StdbRecipeRow): Recipe {
  // The module stores a single classical-element classification per recipe
  // (`primary_element`), so represent it one-hot rather than inventing a mix.
  const elementalProperties = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
  const dominant = ELEMENT_BY_INDEX[row.primaryElement] ?? "Fire";
  elementalProperties[dominant] = 1;

  return {
    id: `stdb-${row.recipeId}`,
    name: row.name,
    ingredients: [],
    instructions: row.instructions ? [row.instructions] : [],
    elementalProperties,
    nutrition: {
      calories: row.totalCalories,
      protein: row.totalProtein,
      fat: row.totalFat,
      carbs: row.totalCarbs,
    },
  };
}

export function useSpacetimeLiveRecipes(): Recipe[] {
  const { connection, status } = useSpacetime();
  const enabled = isLiveCulinaryEnabled();
  const [rows, setRows] = useState<StdbRecipeRow[]>([]);

  useEffect(() => {
    if (!enabled || status !== "connected" || !connection) {
      setRows([]);
      return;
    }

    const refresh = () => {
      try {
        setRows([...connection.db.recipe.iter()]);
      } catch {
        // Connection raced a disconnect; the status change clears state.
      }
    };

    const subscription = connection
      .subscriptionBuilder()
      .onApplied(refresh)
      .subscribe(["SELECT * FROM recipe"]);

    connection.db.recipe.onInsert(refresh);
    connection.db.recipe.onUpdate(refresh);
    connection.db.recipe.onDelete(refresh);

    return () => {
      try {
        connection.db.recipe.removeOnInsert(refresh);
        connection.db.recipe.removeOnUpdate(refresh);
        connection.db.recipe.removeOnDelete(refresh);
        subscription.unsubscribe();
      } catch {
        // Already torn down with the connection.
      }
    };
  }, [connection, status, enabled]);

  return useMemo(() => rows.map(mapStdbRecipe), [rows]);
}
