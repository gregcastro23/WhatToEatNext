import { NextResponse } from "next/server";
import {
  getRecipeCountForIngredient,
  getRecipesByCuisineForIngredient,
  getRecipesForIngredient,
  resolveIngredientSlug,
} from "@/data/ingredientRecipeIndex";
import type { UnifiedIngredient } from "@/data/unified/unifiedTypes";
import { IngredientService } from "@/services/IngredientService";
import { UnifiedRecipeService } from "@/services/UnifiedRecipeService";
import type { Recipe } from "@/types/recipe";

export const dynamic = "force-dynamic";

interface RelatedRecipe {
  id: string;
  name: string;
  cuisine?: string;
  description?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  amount?: number;
  unit?: string;
}

function extractTime(recipe: Recipe, kind: "prep" | "cook"): number | undefined {
  const details = (recipe as { details?: { prepTimeMinutes?: number; cookTimeMinutes?: number } }).details;
  if (details) {
    const v = kind === "prep" ? details.prepTimeMinutes : details.cookTimeMinutes;
    if (typeof v === "number") return v;
  }
  const raw = kind === "prep" ? recipe.prepTime : recipe.cookTime;
  if (typeof raw === "string") {
    const m = raw.match(/(\d+)/);
    if (m) return parseInt(m[1], 10);
  }
  return undefined;
}

function buildSubstitutions(
  ingredient: UnifiedIngredient | undefined,
): Array<{ name: string; rationale: string; type: "complementary" | "direct" }> {
  if (!ingredient) return [];
  const subs: Array<{ name: string; rationale: string; type: "complementary" | "direct" }> = [];

  const pairing = (ingredient as { pairingRecommendations?: { complementary?: string[]; contrasting?: string[] } })
    .pairingRecommendations;

  if (pairing?.complementary) {
    for (const alt of pairing.complementary.slice(0, 5)) {
      subs.push({
        name: alt,
        rationale: `Shares flavor affinity with ${ingredient.name} — works well in similar contexts.`,
        type: "complementary",
      });
    }
  }

  return subs;
}

export async function GET(
  _request: Request,
  props: { params: Promise<{ name: string }> },
) {
  try {
    const { name } = await props.params;
    const ingredientName = decodeURIComponent(name || "").trim();
    if (!ingredientName) {
      return NextResponse.json(
        { success: false, error: "Ingredient name is required" },
        { status: 400 },
      );
    }

    const ingredientService = IngredientService.getInstance();
    const ingredient = ingredientService.getIngredientByName(ingredientName);

    // Resolve canonical slug for the recipe index
    const canonicalName = ingredient?.name || ingredientName;
    const slug = resolveIngredientSlug(canonicalName) ?? resolveIngredientSlug(ingredientName) ?? canonicalName;

    // Get from pre-computed recipe index
    const matches = getRecipesForIngredient(slug);
    const totalRecipeMatches = getRecipeCountForIngredient(slug);
    const recipesByCuisine = getRecipesByCuisineForIngredient(slug);

    // Enhance the top 24 recipes with detailed timing info for the UI
    const recipeService = UnifiedRecipeService.getInstance();
    const allRecipes = await recipeService.getAllRecipes();
    const recipeMap = new Map(allRecipes.map((r) => [r.id, r]));

    const relatedRecipes: RelatedRecipe[] = [];
    for (const match of matches) {
      const recipe = recipeMap.get(match.recipeId);
      if (recipe) {
        relatedRecipes.push({
          id: recipe.id,
          name: recipe.name,
          cuisine: recipe.cuisine,
          description: recipe.description,
          prepTime: extractTime(recipe, "prep"),
          cookTime: extractTime(recipe, "cook"),
          servings:
            (recipe as { baseServingSize?: number }).baseServingSize ||
            recipe.servingSize ||
            recipe.numberOfServings,
          amount: typeof match.amount === "number" ? match.amount : undefined,
          unit: match.unit,
        });
      } else {
        // Fallback if not loaded in memory
        relatedRecipes.push({
          id: match.recipeId,
          name: match.recipeName,
          cuisine: match.cuisine,
          amount: typeof match.amount === "number" ? match.amount : undefined,
          unit: match.unit,
        });
      }
      if (relatedRecipes.length >= 24) break;
    }

    const substitutions = buildSubstitutions(ingredient);

    return NextResponse.json({
      success: true,
      ingredient: ingredient ?? null,
      relatedRecipes,
      recipesByCuisine,
      substitutions,
      totalRecipeMatches,
    });
  } catch (error) {
    console.error("[ingredients/:name] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch ingredient details" },
      { status: 500 },
    );
  }
}
