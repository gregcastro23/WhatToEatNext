"use client";

import { useSearchParams } from "next/navigation";
import React, { useState, useEffect, Suspense, useCallback } from "react";
import { FaWind } from "react-icons/fa";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { emitTokenEconomyUpdate } from "@/hooks/useTokenEconomy";
import { PlanetaryScoringService } from "@/services/planetaryScoring";
import type { Recipe } from "@/types/recipe";

function RecipesPageContent() {
  const searchParams = useSearchParams();
  const cuisine = searchParams?.get("cuisine") || null;
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScoring, setIsScoring] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAndScoreRecipes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/recipes?cuisine=${encodeURIComponent(cuisine ?? "")}`);
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
              } as Recipe;
            } catch {
              return { ...r, score: 50 } as Recipe;
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
    if (cuisine) {
      void fetchAndScoreRecipes();
    } else {
      setIsLoading(false);
    }
  }, [cuisine, fetchAndScoreRecipes]);

  const handleRefine = async () => {
    if (!cuisine) return;
    setIsRefining(true);
    setError(null);
    try {
      const res = await fetch("/api/recipes/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cuisine }),
      });
      const data = await res.json();
      if (data.success && data.recipes) {
        setRecipes(data.recipes);
        if (data.balances) {
          emitTokenEconomyUpdate({
            source: "refresh",
            credits: { substance: -5 },
          });
        }
      } else {
        setError(data.error || "Failed to refine recipes");
      }
    } catch (err) {
      setError("An error occurred while communicating with the Alchemical Oracle.");
    } finally {
      setIsRefining(false);
    }
  };

  const displayCuisine = cuisine
    ? cuisine.charAt(0).toUpperCase() + cuisine.slice(1)
    : "";

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            {displayCuisine} Recipes
          </h1>
          {!isLoading && (
            <div className="flex flex-col items-center gap-4">
              <p className="text-lg text-gray-400">
                {recipes.length} recipes
                {isScoring || isRefining
                  ? " - consulting the heavens..."
                  : " sorted by current planetary alignment"}
              </p>
              
              {cuisine && recipes.length > 0 && (
                <button
                  onClick={() => { void handleRefine(); }}
                  disabled={isRefining || isLoading || isScoring}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider bg-purple-600/20 text-purple-300 border border-purple-500/50 hover:bg-purple-600/40 transition-colors disabled:opacity-50"
                  title="Spend 5 Substance to use the Alchemical Oracle"
                >
                  <FaWind className="w-4 h-4" />
                  {isRefining ? "Refining..." : "Refine with Substance (5 🝉)"}
                </button>
              )}
              {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-slate-900 rounded-xl border border-slate-800 animate-pulse h-48"
              />
            ))}
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">
              No recipes found for {displayCuisine}.
            </p>
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
      <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
          <div className="h-12 w-64 bg-slate-900 rounded-xl mx-auto mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-slate-900 rounded-xl border border-slate-800 h-48" />
            ))}
          </div>
        </div>
      </main>
    }>
      <RecipesPageContent />
    </Suspense>
  );
}
