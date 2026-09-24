import { NextResponse } from "next/server";
import {
  getRecipeCountForIngredient,
  getRecipesByCuisineForIngredient,
  getRecipesForIngredient,
  resolveIngredientSlug,
} from "@/data/ingredientRecipeIndex";
import { catalogRecord, resolveCatalogIngredient } from "@/lib/ingredients/ingredientCatalog";
import { _logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rateLimit";
import { UnifiedRecipeService } from "@/services/UnifiedRecipeService";
import type { Recipe } from "@/types/recipe";

export const dynamic = "force-dynamic";

const { HONO_API_URL } = process.env;

interface RelatedRecipe {
  id: string;
  name: string;
  cuisine?: string | undefined;
  description?: string | undefined;
  prepTime?: number | undefined;
  cookTime?: number | undefined;
  servings?: number | undefined;
  amount?: number | undefined;
  unit?: string | undefined;
}

function extractTime(recipe: Recipe, kind: "prep" | "cook"): number | undefined {
  const { details } = (recipe as { details?: { prepTimeMinutes?: number; cookTimeMinutes?: number } });
  if (details) {
    const v = kind === "prep" ? details.prepTimeMinutes : details.cookTimeMinutes;
    if (typeof v === "number") return v;
  }
  const raw = kind === "prep" ? recipe.prepTime : recipe.cookTime;
  if (typeof raw === "string") {
    const m = raw.match(/(\d+)/);
    if (m) return parseInt(m[1] ?? "", 10);
  }
  return undefined;
}

type IndexMatch = ReturnType<typeof getRecipesForIngredient>[number];

/** The dossier shows the top 24 recipes with timing detail. */
const RELATED_RECIPE_LIMIT = 24;

function relatedRecipe(match: IndexMatch, recipe: Recipe | undefined): RelatedRecipe {
  const amount = typeof match.amount === "number" ? match.amount : undefined;
  if (!recipe) {
    // Fallback if not loaded in memory
    return { id: match.recipeId, name: match.recipeName, cuisine: match.cuisine, amount, unit: match.unit };
  }
  return {
    id: recipe.id,
    name: recipe.name,
    cuisine: recipe.cuisine,
    description: recipe.description,
    prepTime: extractTime(recipe, "prep"),
    cookTime: extractTime(recipe, "cook"),
    servings:
      (recipe as { baseServingSize?: number }).baseServingSize ??
      recipe.servingSize ??
      recipe.numberOfServings,
    amount,
    unit: match.unit,
  };
}

/** `pairingRecommendations.complementary`, read defensively: cards store several shapes. */
function complementaryOf(card: Record<string, unknown>): string[] {
  const pairing = card.pairingRecommendations;
  if (typeof pairing !== "object" || pairing === null || !("complementary" in pairing)) return [];
  const { complementary } = pairing;
  return Array.isArray(complementary) ? complementary.filter((alt): alt is string => typeof alt === "string") : [];
}

function buildSubstitutions(
  card: Record<string, unknown> | null,
  name: string,
): Array<{ name: string; rationale: string; type: "complementary" | "direct" }> {
  if (!card) return [];
  return complementaryOf(card).slice(0, 5).map((alt) => ({
    name: alt,
    rationale: `Shares flavor affinity with ${name} — works well in similar contexts.`,
    type: "complementary",
  }));
}

export async function GET(
  request: Request,
  props: { params: Promise<{ name: string }> },
): Promise<Response> {
  const rl = await rateLimit(request, { window: 60_000, max: 60, bucket: "ingredients-by-name" });
  if (!rl.allowed) return rl.response!;
  try {
    const { name } = await props.params;

    // Proxy to Hono if configured
    if (HONO_API_URL) {
      try {
        const honoResponse = await fetch(`${HONO_API_URL}/api/ingredients/${name}`);
        if (honoResponse.ok) {
          const data = await honoResponse.json();
          return NextResponse.json(data);
        }
      } catch (err) {
        _logger.error(`Hono Gateway proxy failed for ingredient ${name}:`, err);
      }
    }

    const ingredientName = decodeURIComponent(name || "").trim();
    if (!ingredientName) {
      return NextResponse.json(
        { success: false, error: "Ingredient name is required" },
        { status: 400 },
      );
    }

    // Exact: slug, key, name or alias of one catalog card (no substring guess).
    const resolved = resolveCatalogIngredient(ingredientName);
    const ingredient = resolved ? catalogRecord(resolved.entry) : null;

    // Resolve canonical slug for the recipe index
    const canonicalName = resolved?.entry.name ?? ingredientName;
    const slug = resolveIngredientSlug(canonicalName) ?? resolveIngredientSlug(ingredientName) ?? canonicalName;

    // Get from pre-computed recipe index
    const matches = getRecipesForIngredient(slug);
    const totalRecipeMatches = getRecipeCountForIngredient(slug);
    const recipesByCuisine = getRecipesByCuisineForIngredient(slug);

    // Enhance the top 24 recipes with detailed timing info for the UI
    const recipeService = UnifiedRecipeService.getInstance();
    const allRecipes = await recipeService.getAllRecipes();
    const recipeMap = new Map(allRecipes.map((r) => [r.id, r]));

    const relatedRecipes = matches
      .slice(0, RELATED_RECIPE_LIMIT)
      .map((match) => relatedRecipe(match, recipeMap.get(match.recipeId)));

    const substitutions = buildSubstitutions(ingredient, canonicalName);

    return NextResponse.json({
      success: true,
      ingredient,
      slug: resolved?.entry.slug ?? null,
      relatedRecipes,
      recipesByCuisine,
      substitutions,
      totalRecipeMatches,
    });
  } catch (error) {
    _logger.error("[ingredients/:name] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch ingredient details" },
      { status: 500 },
    );
  }
}
