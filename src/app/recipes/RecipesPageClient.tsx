"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useState, useEffect, Suspense, useCallback } from "react";
import { z } from "zod";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { readJson, parseEach } from "@/lib/api/json";
import { _logger } from "@/lib/logger";
import { cuisineHeading, isDisplayableRecipe } from "@/lib/recipes/catalogValidity";
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
  /** How many recipes the server holds for this selection. */
  total: number;
  /** Served but not displayable: counted, never silently hidden. */
  dropped: number;
}

/**
 * The whole catalog for a selection, in one request. The API has no cap, so
 * there is no limit to send and nothing to paginate around. A failed request
 * throws: an empty catalog and a broken one must not look alike.
 */
async function loadCatalog(cuisine: string | null): Promise<CatalogLoad> {
  const params = new URLSearchParams();
  if (cuisine) params.set("cuisine", cuisine);
  const query = params.toString();
  const res = await fetch(query ? `/api/recipes?${query}` : "/api/recipes");
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

function RecipesPageContent() {
  const searchParams = useSearchParams();
  const cuisine = searchParams?.get("cuisine") || null;
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [total, setTotal] = useState(0);
  const [dropped, setDropped] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScoring, setIsScoring] = useState(false);

  const fetchAndScoreRecipes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    let cuisineRecipes: Recipe[];
    try {
      const catalog = await loadCatalog(cuisine);
      cuisineRecipes = catalog.recipes;
      setTotal(catalog.total);
      setDropped(catalog.dropped);
      if (catalog.dropped > 0)
        _logger.warn(`${catalog.dropped} of ${catalog.total} recipes failed validation`);
    } catch (fetchError) {
      _logger.error("Failed to fetch recipes:", fetchError);
      setRecipes([]);
      setTotal(0);
      setDropped(0);
      setError("We couldn't load the recipes just now.");
      setIsLoading(false);
      return;
    }

    // Initially display recipes unsorted
    setRecipes(cuisineRecipes);
    setIsLoading(false);
    if (cuisineRecipes.length === 0) return;

    // Then score each recipe with planetary alignment
    setIsScoring(true);
    try {
      const scoringService = PlanetaryScoringService.getInstance();
      // Warm the shared planetary-position cache once up front. Otherwise
      // the concurrent scoreRecipe() calls below would each fire their own
      // /api/astrologize request (one per recipe in the catalog).
      await scoringService.getCurrentPlanetaryPositions();
      const scoredRecipes = await Promise.all(
        cuisineRecipes.map(async (recipe) => {
          const r = recipe;
          try {
            const result = await scoringService.scoreRecipe(r);
            return {
              ...r,
              score: result.overallScore,
              planetaryScore: result.overallScore,
              planetaryReason: result.planetaryReason,
              recommendedTiming: result.recommendedTiming,
              rulingPlanet: result.rulingPlanet,
            };
          } catch {
            return { ...r, score: 50 };
          }
        }),
      );

      // Sort by planetary score descending
      scoredRecipes.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
      setRecipes(scoredRecipes);
    } catch (scoringError) {
      _logger.error("Failed to score recipes:", scoringError);
    } finally {
      setIsScoring(false);
    }
  }, [cuisine]);

  useEffect(() => {
    void fetchAndScoreRecipes();
  }, [cuisine, fetchAndScoreRecipes]);

  const displayCuisine = cuisineHeading(cuisine);

  return (
    <main className="min-h-screen bg-[#08080e] text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            {displayCuisine} Recipes
          </h1>
          {!isLoading && !error && (
            <p className="text-lg text-gray-400">
              {recipes.length} recipes
              {isScoring
                ? " - consulting the heavens..."
                : " sorted by current planetary alignment"}
            </p>
          )}
          {!isLoading && !error && dropped > 0 && (
            <p role="status" className="mt-2 text-sm text-amber-300">
              {dropped} of {total} recipes couldn&apos;t be displayed because their data is incomplete.
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="glass-card-premium rounded-2xl border border-white/8 animate-pulse h-48"
              />
            ))}
          </div>
        ) : error ? (
          <div role="alert" className="text-center py-20">
            <p className="text-6xl mb-6">⚠️</p>
            <h2 className="text-2xl font-bold text-white mb-3">Recipes Unavailable</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              {error} This is a connection problem, not an empty catalog.
            </p>
            <button
              type="button"
              onClick={() => void fetchAndScoreRecipes()}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors"
            >
              ↻ Try Again
            </button>
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-6">🍽️</p>
            <h2 className="text-2xl font-bold text-white mb-3">No Recipes Found</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              {cuisine
                ? `We have no ${displayCuisine} recipes yet. Try another cuisine, or browse everything.`
                : "We couldn't find any recipes. Check back later."}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {cuisine && (
                <Link
                  href="/recipes"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors"
                >
                  View All Recipes
                </Link>
              )}
              <Link
                href="/cuisines"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 text-white font-bold hover:bg-white/20 transition-colors"
              >
                Explore Cuisines
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function RecipesPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#08080e] text-white p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
          <div className="h-12 w-64 glass-card-premium rounded-2xl border border-white/8 mx-auto mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="glass-card-premium rounded-2xl border border-white/8 h-48" />
            ))}
          </div>
        </div>
      </main>
    }>
      <RecipesPageContent />
    </Suspense>
  );
}
