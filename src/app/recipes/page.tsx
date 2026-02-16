"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { UnifiedRecipeService } from "@/services/UnifiedRecipeService";
import type { Recipe } from "@/types/recipe";
import { RecipeCard } from "@/components/recipes/RecipeCard";

export default function RecipesPage() {
  const searchParams = useSearchParams();
  const cuisine = searchParams ? searchParams.get("cuisine") : null;
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (cuisine) {
      const fetchRecipes = async () => {
        setIsLoading(true);
        try {
          const recipeService = UnifiedRecipeService.getInstance();
          const cuisineRecipes =
            await recipeService.getRecipesForCuisine(cuisine);
          setRecipes(cuisineRecipes);
        } catch (error) {
          console.error("Failed to fetch recipes:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchRecipes();
    }
  }, [cuisine]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          Recipes for {cuisine}
        </h1>
        {/* TEMPORARY DEBUG INFO */}
        {!isLoading && (
          <div className="text-sm text-gray-400 text-center mb-4">
            Displaying {recipes.length} recipes for {cuisine}.
          </div>
        )}
        {/* END TEMPORARY DEBUG INFO */}
        {isLoading ? (
          <p>Loading recipes...</p>
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
