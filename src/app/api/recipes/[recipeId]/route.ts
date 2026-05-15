import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { RecipeSchema } from "@/lib/validation/apiSchemas";
import { _recipeRecommender } from "@/services/recipeRecommendations";
import { sauceRecommender } from "@/services/sauceRecommender";

export const dynamic = "force-dynamic";

const RECIPE_DETAIL_LIMIT = { window: 60_000, max: 60, bucket: "recipe-detail" };
const HONO_API_URL = process.env.HONO_API_URL;

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

export async function GET(request: Request, props: { params: Promise<{ recipeId: string }> }) {
  const rl = await rateLimit(request, RECIPE_DETAIL_LIMIT);
  if (!rl.allowed) return rl.response!;
  try {
    const { recipeId } = await props.params;

    // Proxy to Hono if configured
    if (HONO_API_URL) {
      try {
        const honoResponse = await fetch(`${HONO_API_URL}/api/recipes/${recipeId}`);
        if (honoResponse.ok) {
          const data = await honoResponse.json();
          return NextResponse.json(data);
        }
      } catch (err) {
        console.error(`Hono Gateway proxy failed for recipe ${recipeId}:`, err);
      }
    }

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

    const cookingMethods = getCookingMethods(recipe);

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

    // Track interaction if user is logged in (Data Hose injection)
    try {
      const { auth } = await import("@/lib/auth/auth");
      const session = await auth();
      if (session?.user?.id) {
        const { recordInteraction } = await import("@/services/userInteractionsService");
        void recordInteraction({
          userId: session.user.id,
          type: "recipe_view",
          payload: {
            recipeId,
            cuisine: recipe.cuisine,
            cookingMethod: cookingMethods[0],
            ingredients: recipe.ingredients.map((i: any) => i.name),
            complexity: (recipe as any).complexity || "moderate",
            elementalBalance: recipe.elementalProperties,
          },
        }).catch((err) => console.error("Failed to record recipe_view interaction:", err));
      }
    } catch (err) {
      // Best effort; don't break the response if auth/tracking fails
      console.warn("Interaction tracking skipped:", err);
    }

    return NextResponse.json({ success: true, recipe, recommendedSauces, recommendedRecipes });
  } catch (error) {
    console.error("[recipeId] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch recipe details" },
      { status: 500 },
    );
  }
}
