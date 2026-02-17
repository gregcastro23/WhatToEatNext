"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { UnifiedRecipeService } from "@/services/UnifiedRecipeService";
import { PlanetaryScoringService } from "@/services/planetaryScoring";
import type { Recipe } from "@/types/recipe";
import { RecipeCard } from "@/components/recipes/RecipeCard";

export default function RecipesPage() {
  const searchParams = useSearchParams();
  const cuisine = searchParams ? searchParams.get("cuisine") : null;
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScoring, setIsScoring] = useState(false);

  useEffect(() => {
    if (cuisine) {
      const fetchAndScoreRecipes = async () => {
        setIsLoading(true);
        try {
          const recipeService = UnifiedRecipeService.getInstance();
          const cuisineRecipes =
            await recipeService.getRecipesForCuisine(cuisine);

          // Initially display recipes unsorted
          setRecipes(cuisineRecipes as unknown as Recipe[]);
          setIsLoading(false);

          // Then score each recipe with planetary alignment
          setIsScoring(true);
          try {
            const scoringService = PlanetaryScoringService.getInstance();
            const scoredRecipes = await Promise.all(
              cuisineRecipes.map(async (recipe) => {
                const r = recipe as unknown as Recipe;
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

      fetchAndScoreRecipes();
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
