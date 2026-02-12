"use client";

import React, { useState, useEffect } from "react";
import { UnifiedRecipeService } from "@/services/UnifiedRecipeService";
import { sauceRecommender } from "@/services/sauceRecommender";
import { _recipeRecommender } from "@/services/recipeRecommendations";
import type { Recipe } from "@/types/recipe";
import type { CuisineType } from "@/types/alchemy";
import { RecipeCard } from "@/components/recipes/RecipeCard";

export default function RecipePage({
  params,
}: {
  params: { recipeId: string };
}) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [recommendedSauces, setRecommendedSauces] = useState<string[]>([]);
  const [recommendedRecipes, setRecommendedRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.recipeId) {
      const fetchRecipe = async () => {
        setIsLoading(true);
        try {
          const recipeService = UnifiedRecipeService.getInstance();
          const fetchedRecipe = await recipeService.getRecipeById(
            params.recipeId,
          );
          setRecipe(fetchedRecipe);

          if (fetchedRecipe) {
            // recommend sauces
            const proteins = fetchedRecipe.ingredients
              .filter((i) => i.category === "protein")
              .map((i) => i.name);
            const vegetables = fetchedRecipe.ingredients
              .filter((i) => i.category === "vegetable")
              .map((i) => i.name);
            const cookingMethods = Array.isArray(fetchedRecipe.cookingMethods)
              ? fetchedRecipe.cookingMethods.map((m) =>
                  typeof m === "string" ? m : m.name,
                )
              : fetchedRecipe.cookingMethods
                ? [fetchedRecipe.cookingMethods]
                : [];

            const sauces = sauceRecommender.recommendSauce(
              fetchedRecipe.cuisine as CuisineType,
              {
                protein: proteins[0], // Simplified for now
                vegetable: vegetables[0], // Simplified for now
                cookingMethod: cookingMethods[0], // Simplified for now
              },
            );
            setRecommendedSauces(sauces);

            // recommend recipes
            const allRecipes = await recipeService.getAllRecipes();
            const recommended =
              await _recipeRecommender.recommendSimilarRecipes(
                fetchedRecipe,
                allRecipes,
              );
            setRecommendedRecipes(recommended);
          }
        } catch (error) {
          console.error("Failed to fetch recipe:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchRecipe();
    }
  }, [params.recipeId]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <p>Loading recipe...</p>
        </div>
      </main>
    );
  }

  if (!recipe) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <p>Recipe not found.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-5xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-300 to-indigo-400 py-2">
          {recipe.name}
        </h1>
        <p className="text-lg text-center text-slate-400">
          {recipe.description}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-4 border-b-2 border-slate-700 pb-2">
                Ingredients
              </h2>
              <ul className="list-disc list-inside space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index}>
                    {ingredient.amount} {ingredient.unit} {ingredient.name}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-4 border-b-2 border-slate-700 pb-2">
                Instructions
              </h2>
              <ol className="list-decimal list-inside space-y-4">
                {recipe.instructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ol>
            </div>
            {recommendedSauces.length > 0 && (
              <div>
                <h2 className="text-3xl font-bold mb-4 border-b-2 border-slate-700 pb-2">
                  Recommended Sauces
                </h2>
                <ul className="list-disc list-inside space-y-2">
                  {recommendedSauces.map((sauce, index) => (
                    <li key={index}>{sauce}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-4 border-b-2 border-slate-700 pb-2">
                Details
              </h2>
              <div className="space-y-2">
                <p>
                  <strong>Cuisine:</strong> {recipe.cuisine}
                </p>
                <p>
                  <strong>Prep Time:</strong> {recipe.prepTime}
                </p>
                <p>
                  <strong>Cook Time:</strong> {recipe.cookTime}
                </p>
                <p>
                  <strong>Serving Size:</strong> {recipe.servingSize}
                </p>
                <p>
                  <strong>Spice Level:</strong> {recipe.spiceLevel}
                </p>
                <p>
                  <strong>Season:</strong>{" "}
                  {Array.isArray(recipe.season)
                    ? recipe.season.join(", ")
                    : recipe.season}
                </p>
                <p>
                  <strong>Meal Type:</strong>{" "}
                  {Array.isArray(recipe.mealType)
                    ? recipe.mealType.join(", ")
                    : recipe.mealType}
                </p>
                <p>
                  <strong>Cooking Methods:</strong>{" "}
                  {Array.isArray(recipe.cookingMethods)
                    ? recipe.cookingMethods
                        .map((m) => (typeof m === "string" ? m : m.name))
                        .join(", ")
                    : recipe.cookingMethods &&
                      (recipe.cookingMethods as any).name}
                </p>
              </div>
            </div>

            {recipe.elementalProperties && (
              <div>
                <h2 className="text-2xl font-bold mb-4 border-b-2 border-slate-700 pb-2">
                  Elemental Properties
                </h2>
                <div className="space-y-2">
                  {Object.entries(recipe.elementalProperties).map(
                    ([key, value]) => (
                      <p key={key}>
                        <strong>{key}:</strong> {value}
                      </p>
                    ),
                  )}
                </div>
              </div>
            )}

            {recipe && (
              <div>
                <h2 className="text-2xl font-bold mb-4 border-b-2 border-slate-700 pb-2">
                  Astrological Affinities
                </h2>
                <div className="space-y-2">
                  <p>
                    <strong>Planets:</strong>{" "}
                    {(recipe as any).planetaryInfluences.join(", ")}
                  </p>
                  <p>
                    <strong>Signs:</strong>{" "}
                    {(recipe as any).zodiacInfluences.join(", ")}
                  </p>
                  <p>
                    <strong>Lunar Phases:</strong>{" "}
                    {(recipe as any).lunarPhaseInfluences.join(", ")}
                  </p>
                </div>
              </div>
            )}

            {recipe.nutrition && (
              <div>
                <h2 className="text-2xl font-bold mb-4 border-b-2 border-slate-700 pb-2">
                  Nutrition
                </h2>
                <div className="space-y-2">
                  <p>
                    <strong>Calories:</strong> {recipe.nutrition.calories}
                  </p>
                  <p>
                    <strong>Protein:</strong> {recipe.nutrition.protein}g
                  </p>
                  <p>
                    <strong>Carbs:</strong> {recipe.nutrition.carbs}g
                  </p>
                  <p>
                    <strong>Fat:</strong> {recipe.nutrition.fat}g
                  </p>
                  <p>
                    <strong>Fiber:</strong> {recipe.nutrition.fiber}g
                  </p>
                </div>
              </div>
            )}

            {recipe.culturalNotes && (
              <div>
                <h2 className="text-2xl font-bold mb-4 border-b-2 border-slate-700 pb-2">
                  Cultural Notes
                </h2>
                <p>{recipe.culturalNotes as string}</p>
              </div>
            )}

            {recipe.pairingRecommendations && (
              <div>
                <h2 className="text-2xl font-bold mb-4 border-b-2 border-slate-700 pb-2">
                  Pairing Suggestions
                </h2>
                <ul className="list-disc list-inside space-y-2">
                  {Array.isArray(recipe.pairingRecommendations) &&
                    recipe.pairingRecommendations.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                </ul>
              </div>
            )}

            {recipe.substitutions && (
              <div>
                <h2 className="text-2xl font-bold mb-4 border-b-2 border-slate-700 pb-2">
                  Substitutions
                </h2>
                <ul className="list-disc list-inside space-y-2">
                  {Object.entries(recipe.substitutions).map(([key, value]) => (
                    <li key={key}>
                      <strong>{key}:</strong>{" "}
                      {Array.isArray(value) ? value.join(", ") : (value as any)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        {recommendedRecipes.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold mb-4 border-b-2 border-slate-700 pb-2">
              Similar Recipes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
