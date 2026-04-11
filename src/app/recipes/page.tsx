"use client";

import { useSearchParams } from "next/navigation";
import React, { useState, useEffect, Suspense } from "react";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { PlanetaryScoringService } from "@/services/planetaryScoring";
import type { Recipe } from "@/types/recipe";

function RecipesPageContent() {
  const searchParams = useSearchParams();
  const cuisine = searchParams?.get("cuisine") || null;
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScoring, setIsScoring] = useState(false);

  useEffect(() => {
    if (cuisine) {
      const fetchAndScoreRecipes = async () => {
        setIsLoading(true);
        try {
          const res = await fetch(`/api/recipes?cuisine=${encodeURIComponent(cuisine)}`);
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
      };

      void fetchAndScoreRecipes();
    } else {
      setIsLoading(false);
    }
  }, [cuisine]);

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
            <p className="text-lg text-gray-400">
              {recipes.length} recipes
              {isScoring
                ? " - scoring by planetary alignment..."
                : " sorted by current planetary alignment"}
            </p>
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
