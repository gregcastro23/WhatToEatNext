import { NextResponse } from "next/server";
import { _recipeRecommender } from "@/services/recipeRecommendations";
import { sauceRecommender } from "@/services/sauceRecommender";
import { UnifiedRecipeService } from "@/services/UnifiedRecipeService";
import type { Recipe } from "@/types/recipe";

export const dynamic = "force-dynamic";

export async function GET(request: Request, props: { params: Promise<{ recipeId: string }> }) {
  try {
    const params = await props.params;
    const { recipeId } = params;
    
    const recipeService = UnifiedRecipeService.getInstance();
    const recipe = await recipeService.getRecipeById(recipeId);

    if (!recipe) {
      return NextResponse.json({ success: false, error: "Recipe not found" }, { status: 404 });
    }

    // Recommended sauces
    const proteins = recipe.ingredients
      .filter((i) => i.category === "protein")
      .map((i) => i.name);
    const vegetables = recipe.ingredients
      .filter((i) => i.category === "vegetable")
      .map((i) => i.name);
    
    const rUnknown = recipe as unknown as Record<string, unknown>;
    const methodsArr = Array.isArray(rUnknown.cookingMethods) ? rUnknown.cookingMethods : 
                       (rUnknown.cookingMethod ? (Array.isArray(rUnknown.cookingMethod) ? rUnknown.cookingMethod : [rUnknown.cookingMethod]) : []);
    const methodsStr = methodsArr.map((m) => typeof m === "string" ? m : (m as { name?: string })?.name || "").filter(Boolean);

    const recommendedSauces = await sauceRecommender.recommendSauce(
      recipe.cuisine ?? '',
      {
        protein: proteins[0],
        vegetable: vegetables[0],
        cookingMethod: methodsStr[0],
      },
    );

    // Recommended similar recipes
    const allRecipes = await recipeService.getAllRecipes() as unknown as Recipe[];
    const recommendedRecipes = await _recipeRecommender.recommendSimilarRecipes(
      recipe,
      allRecipes,
    );

    return NextResponse.json({
      success: true,
      recipe,
      recommendedSauces,
      recommendedRecipes
    });
  } catch (error) {
    console.error("[recipeId] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch recipe details" }, { status: 500 });
  }
}


