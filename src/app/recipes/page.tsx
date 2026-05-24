"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useState, useEffect, Suspense, useCallback } from "react";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { PlanetaryScoringService } from "@/services/planetaryScoring";
import type { Recipe } from "@/types/recipe";

function RecipesPageContent() {
  const searchParams = useSearchParams();
  const cuisine = searchParams?.get("cuisine") || null;
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScoring, setIsScoring] = useState(false);

  const fetchAndScoreRecipes = useCallback(async () => {
    setIsLoading(true);
    try {
      // Request the full catalog — this page scores and sorts every recipe
      // client-side, so it must not be capped to the API's default page size.
      const params = new URLSearchParams({ limit: "1000" });
      if (cuisine) params.set("cuisine", cuisine);
      const res = await fetch(`/api/recipes?${params.toString()}`);
      if (!res.ok) {
        setRecipes([]);
        setIsLoading(false);
        return;
      }
      const data = await res.json();
      let cuisineRecipes: Recipe[] = [];
      if (data.success && data.recipes) {
        cuisineRecipes = data.recipes;
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
        scoredRecipes.sort(
          (a, b) => (b.score ?? 0) - (a.score ?? 0),
        );
        setRecipes(scoredRecipes);
      } catch (error) {
        console.error("Failed to score recipes:", error);
      } finally {
        setIsScoring(false);
      }
    } catch (error) {
      console.error("Failed to fetch recipes:", error);
      setIsLoading(false);
    }
  }, [cuisine]);

  useEffect(() => {
    void fetchAndScoreRecipes();
  }, [cuisine, fetchAndScoreRecipes]);

  const displayCuisine = cuisine
    ? cuisine.charAt(0).toUpperCase() + cuisine.slice(1)
    : "All";

  return (
    <main className="min-h-screen bg-[#08080e] text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            {displayCuisine} Recipes
          </h1>
          {!isLoading && (
            <p className="text-lg text-gray-400">
              {recipes.length} recipes
              {isScoring
                ? " - consulting the heavens..."
                : " sorted by current planetary alignment"}
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
        ) : recipes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-6">🍽️</p>
            <h2 className="text-2xl font-bold text-white mb-3">No Recipes Found</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              We couldn&apos;t find any recipes matching your selection. Try a different cuisine or check back later.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors"
            >
              ← Back to Home
            </Link>
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
