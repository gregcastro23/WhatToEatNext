import { NextResponse } from "next/server";
import { RecipeSchema } from "@/lib/validation/apiSchemas";
import { _recipeRecommender } from "@/services/recipeRecommendations";
import { sauceRecommender } from "@/services/sauceRecommender";

export const dynamic = "force-dynamic";

/** Safely extract cooking methods from a recipe regardless of singular/plural key. */
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

export async function GET(_request: Request, props: { params: Promise<{ recipeId: string }> }) {
  try {
    const { recipeId } = await props.params;

    // Use LocalRecipeService to fetch from database (matches /api/recipes listing)
    const { LocalRecipeService } = await import("@/services/LocalRecipeService");
    const rawRecipe = await LocalRecipeService.getRecipeById(recipeId);

    if (!rawRecipe) {
      return NextResponse.json({ success: false, error: "Recipe not found" }, { status: 404 });
    }

    // Validate recipe shape at the service boundary.
    // On failure we still serve the raw recipe; the warning surfaces schema
    // drift in logs without breaking the response.
    const parsed = RecipeSchema.safeParse(rawRecipe);
    if (!parsed.success) {
      console.warn(`[recipeId] Recipe ${recipeId} has unexpected shape:`, parsed.error.flatten());
    }
    const recipe = parsed.success ? parsed.data : rawRecipe;

    // Ingredient classification
    const proteins = recipe.ingredients
      .filter((i) => i.category === "protein")
      .map((i) => i.name);
    const vegetables = recipe.ingredients
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

    return NextResponse.json({ success: true, recipe, recommendedSauces, recommendedRecipes });
  } catch (error) {
    console.error("[recipeId] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch recipe details" },
      { status: 500 },
    );
  }
}
