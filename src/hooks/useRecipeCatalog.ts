"use client";

import { useCallback, useEffect, useState } from "react";
import { z } from "zod";
import { readJson, parseEach } from "@/lib/api/json";
import { _logger } from "@/lib/logger";
import { isDisplayableRecipe } from "@/lib/recipes/catalogValidity";
import { PlanetaryScoringService } from "@/services/planetaryScoring";
import type { Recipe } from "@/types/recipe";

const ValidatedRecipeSchema = z.custom<Recipe>(
  isDisplayableRecipe,
  "Expected valid Recipe with id, name, ingredients, instructions, and elementalProperties",
);

const RecipesResponseEnvelopeSchema = z
  .object({
    success: z.boolean().optional(),
    recipes: z.array(z.unknown()).optional(),
    total: z.number().optional(),
  })
  .passthrough();

interface CatalogLoad {
  recipes: Recipe[];
  /** How many recipes the server holds. */
  total: number;
  /** Served but not displayable: counted, never silently hidden. */
  dropped: number;
}

/**
 * The whole catalog, in one request. The API has no cap, so there is no limit
 * to send and nothing to paginate around; the page narrows it by cuisine and
 * search in memory. A failed request throws: an empty catalog and a broken one
 * must not look alike.
 */
async function loadCatalog(): Promise<CatalogLoad> {
  const res = await fetch("/api/recipes");
  if (!res.ok) throw new Error(`The recipe service answered ${res.status}`);
  const data = await readJson(res, {
    parse: (raw) => RecipesResponseEnvelopeSchema.parse(raw),
  });
  if (data.success === false) throw new Error("The recipe service reported a failure");
  const parsed = parseEach(data.recipes ?? [], (r) => ValidatedRecipeSchema.parse(r));
  return {
    recipes: parsed.items,
    total: data.total ?? parsed.total,
    dropped: parsed.dropped,
  };
}

/** Score every recipe against the current sky and sort best first. */
async function scoreAndSort(catalogRecipes: Recipe[]): Promise<Recipe[]> {
  const scoringService = PlanetaryScoringService.getInstance();
  // Warm the shared planetary-position cache once up front. Otherwise
  // the concurrent scoreRecipe() calls below would each fire their own
  // /api/astrologize request (one per recipe in the catalog).
  await scoringService.getCurrentPlanetaryPositions();
  const scoredRecipes = await Promise.all(
    catalogRecipes.map(async (recipe) => {
      try {
        const result = await scoringService.scoreRecipe(recipe);
        return {
          ...recipe,
          score: result.overallScore,
          planetaryScore: result.overallScore,
          planetaryReason: result.planetaryReason,
          recommendedTiming: result.recommendedTiming,
          rulingPlanet: result.rulingPlanet,
        };
      } catch {
        return { ...recipe, score: 50 };
      }
    }),
  );
  // Sort by planetary score descending
  scoredRecipes.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  return scoredRecipes;
}

export interface RecipeCatalogState {
  recipes: Recipe[];
  /** How many recipes the server holds. */
  total: number;
  /** Served but not displayable. */
  dropped: number;
  error: string | null;
  isLoading: boolean;
  isScoring: boolean;
  reload: () => Promise<void>;
}

/**
 * The whole catalog, loaded once and then scored. Whatever narrows the list
 * (a cuisine, a search) works on what this holds and never fetches.
 */
export function useRecipeCatalog(): RecipeCatalogState {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [counts, setCounts] = useState({ total: 0, dropped: 0 });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScoring, setIsScoring] = useState(false);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    let catalog: CatalogLoad;
    try {
      catalog = await loadCatalog();
    } catch (fetchError) {
      _logger.error("Failed to fetch recipes:", fetchError);
      setRecipes([]);
      setCounts({ total: 0, dropped: 0 });
      setError("We couldn't load the recipes just now.");
      setIsLoading(false);
      return;
    }
    setCounts({ total: catalog.total, dropped: catalog.dropped });
    if (catalog.dropped > 0) _logger.warn(`${catalog.dropped} of ${catalog.total} recipes failed validation`);

    // Show the recipes at once, then order them by the current sky.
    setRecipes(catalog.recipes);
    setIsLoading(false);
    if (catalog.recipes.length === 0) return;
    setIsScoring(true);
    try {
      setRecipes(await scoreAndSort(catalog.recipes));
    } catch (scoringError) {
      _logger.error("Failed to score recipes:", scoringError);
    } finally {
      setIsScoring(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { recipes, total: counts.total, dropped: counts.dropped, error, isLoading, isScoring, reload };
}
