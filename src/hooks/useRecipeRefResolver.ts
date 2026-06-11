"use client";

/**
 * useRecipeRefResolver — recipe_ref → full Recipe rehydration for the
 * SpacetimeDB planner sync (remote-slot materialization).
 *
 * Remote `meal_plan_slot` rows carry only a `recipe_ref` string: the static
 * catalog id for UI-added slots (e.g. "african-dinner-…-moroccan-harira") or
 * "stdb-{id}" for live module recipes. Turning a ref back into a meal needs
 * the full Recipe object, so this hook exposes a resolver backed by
 *  (a) the static catalog — lazy-loaded via getServerRecipes only once
 *      `active` flips on, so planner visits with nothing to rehydrate never
 *      pay the catalog fetch, and
 *  (b) the live in-module `recipe` table (useSpacetimeLiveRecipes, gated by
 *      the same `active` flag).
 *
 * Refs resolve by id first, then by exact lowercased name (UI-added slots
 * fall back to the name when a recipe has no id). Static entries win name
 * collisions, mirroring the browse-list rule that the static catalog is
 * authoritative for known names.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getServerRecipes } from "@/actions/recipes";
import { useSpacetimeLiveRecipes } from "@/hooks/useSpacetimeLiveRecipes";
import type { Recipe } from "@/types/recipe";
import { createLogger } from "@/utils/logger";

const logger = createLogger("useRecipeRefResolver");

export type RecipeRefResolver = (recipeRef: string) => Recipe | null;

export function useRecipeRefResolver(active: boolean): RecipeRefResolver {
  const [staticRecipes, setStaticRecipes] = useState<Recipe[] | null>(null);
  const loadingRef = useRef(false);
  const liveRecipes = useSpacetimeLiveRecipes(active);

  useEffect(() => {
    if (!active || staticRecipes !== null || loadingRef.current) return;
    loadingRef.current = true;
    let cancelled = false;
    getServerRecipes()
      .then((recipes) => {
        if (!cancelled) setStaticRecipes(recipes);
      })
      .catch((error: unknown) => {
        logger.error("Failed to load static catalog for ref resolution:", error);
        // Allow a retry the next time `active` toggles; until then the
        // resolver simply keeps returning null for static refs.
        loadingRef.current = false;
      });
    return () => {
      cancelled = true;
    };
  }, [active, staticRecipes]);

  const byRef = useMemo(() => {
    const map = new Map<string, Recipe>();
    const add = (recipe: Recipe) => {
      const name = (recipe.name ?? "").toString().trim();
      if (name) map.set(name.toLowerCase(), recipe);
      if (recipe.id) map.set(recipe.id.toString(), recipe);
    };
    // Live rows first so static entries overwrite on name collisions.
    liveRecipes.forEach(add);
    (staticRecipes ?? []).forEach(add);
    return map;
  }, [liveRecipes, staticRecipes]);

  return useCallback(
    (recipeRef: string): Recipe | null =>
      byRef.get(recipeRef) ?? byRef.get(recipeRef.toLowerCase()) ?? null,
    [byRef],
  );
}
