import { notFound } from "next/navigation";
import { LocalRecipeService } from "@/services/LocalRecipeService";
import { _recipeRecommender } from "@/services/recipeRecommendations";
import { sauceRecommender } from "@/services/sauceRecommender";
import type { Recipe } from "@/types/recipe";
import RecipeClient from "./RecipeClient";

export const dynamic = "force-dynamic";

interface RecipePageProps {
  params: Promise<{ recipeId: string }>;
}

function getCookingMethods(recipe: Record<string, unknown>): string[] {
  const raw = recipe.cookingMethods ?? recipe.cookingMethod;
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr
    .map((m) =>
      typeof m === "string"
        ? m
        : typeof m === "object" && m !== null && "name" in m
          ? String((m as { name: unknown }).name)
          : "",
    )
    .filter(Boolean);
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { recipeId } = await params;

  const rawRecipe = await LocalRecipeService.getRecipeById(recipeId);

  if (!rawRecipe) {
    notFound();
  }

  const recipe = rawRecipe as unknown as Recipe;

  const proteins = (recipe.ingredients || [])
    .filter((i) => i.category === "protein")
    .map((i) => i.name);
  const vegetables = (recipe.ingredients || [])
    .filter((i) => i.category === "vegetable")
    .map((i) => i.name);

  const cookingMethods = getCookingMethods(recipe as Record<string, unknown>);

  const recommendedSauces = await sauceRecommender.recommendSauce(recipe.cuisine ?? "", {
    protein: proteins[0],
    vegetable: vegetables[0],
    cookingMethod: cookingMethods[0],
  });

  const allRecipes = await LocalRecipeService.getAllRecipes();
  const recommendedRecipes = await _recipeRecommender.recommendSimilarRecipes(
    rawRecipe,
    allRecipes,
  );

  return (
    <RecipeClient
      recipe={recipe}
      recommendedSauces={recommendedSauces}
      recommendedRecipes={recommendedRecipes}
    />
  );
}
