import { NextResponse } from "next/server";
import { IngredientService } from "@/services/IngredientService";
import { UnifiedRecipeService } from "@/services/UnifiedRecipeService";
import type { UnifiedIngredient } from "@/data/unified/unifiedTypes";
import type { Recipe } from "@/types/recipe";

export const dynamic = "force-dynamic";

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Tokenized match: does `candidate` contain `target` as a word/substring?
 * We normalize both sides so "Basil, fresh" matches "basil".
 */
function ingredientMatches(candidate: string, target: string): boolean {
  const c = normalizeName(candidate);
  const t = normalizeName(target);
  if (!c || !t) return false;
  return c.includes(t) || t.includes(c);
}

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
    const ingredientName = decodeURIComponent(name);

    const ingredientService = IngredientService.getInstance();
    const ingredient = ingredientService.getIngredientByName(ingredientName);

    // Find recipes using this ingredient
    const recipeService = UnifiedRecipeService.getInstance();
    const allRecipes = await recipeService.getAllRecipes();

    const relatedRecipes: RelatedRecipe[] = [];
    for (const recipe of allRecipes) {
      if (!Array.isArray(recipe.ingredients)) continue;
      const match = recipe.ingredients.find((ing) =>
        ing?.name ? ingredientMatches(ing.name, ingredientName) : false,
      );
      if (match) {
        relatedRecipes.push({
          id: recipe.id as string,
          name: recipe.name,
          cuisine: recipe.cuisine,
          description: recipe.description,
          prepTime: extractTime(recipe, "prep"),
          cookTime: extractTime(recipe, "cook"),
          servings:
            (recipe as { baseServingSize?: number }).baseServingSize ||
            recipe.servingSize ||
            recipe.numberOfServings,
          amount: match.amount,
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
      substitutions,
      totalRecipeMatches: relatedRecipes.length,
    });
  } catch (error) {
    console.error("[ingredients/:name] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch ingredient details" },
      { status: 500 },
    );
  }
}
