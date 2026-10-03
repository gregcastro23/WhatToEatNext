import { NextResponse } from "next/server";
import {
  getRecipeCountForIngredient,
  getRecipesByCuisineForIngredient,
  getRecipesForIngredient,
  resolveIngredientSlug,
} from "@/data/ingredientRecipeIndex";
import {
  catalogRecord,
  resolveCatalogIngredient,
  type CatalogIngredient,
} from "@/lib/ingredients/ingredientCatalog";
import { buildRelatedIngredientRecipe } from "@/lib/ingredients/relatedRecipe";
import { _logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rateLimit";
import { IngredientService } from "@/services/IngredientService";
import { UnifiedRecipeService } from "@/services/UnifiedRecipeService";
import type { RelatedIngredientRecipe } from "@/types/ingredient";
import type { Recipe } from "@/types/recipe";

export const revalidate = 86400;

const { HONO_API_URL } = process.env;

/**
 * The card for a name. An exact identity (slug, key, either catalog's name,
 * alias) wins; that alone fixes the 15 names the substring match sent to
 * another card ("Apple Cider Vinegar" → Apple). The IngredientDrawer also
 * sends recipe lines ("ground beef (80/20)"), which are not identities.
 * [MEASURED 2026-09-23] Only 649 of 2,880 distinct recipe lines are exact
 * names, so for the rest the legacy match still answers, mapped onto the union
 * card: the drawer shows a card for every line it showed one before. Better
 * line resolution is its own measured change; dossier URLs turn strictly
 * exact in Phase 2.5b, when the page stops calling this route.
 */
function cardFor(text: string): CatalogIngredient | null {
  const exact = resolveCatalogIngredient(text);
  if (exact) return exact.entry;
  const legacy = IngredientService.getInstance().getIngredientByName(text);
  return legacy ? (resolveCatalogIngredient(legacy.name)?.entry ?? null) : null;
}

type IndexMatch = ReturnType<typeof getRecipesForIngredient>[number];

/** The dossier shows the top 24 recipes with timing detail. */
const RELATED_RECIPE_LIMIT = 24;

function relatedRecipe(match: IndexMatch, recipe: Recipe | undefined): RelatedIngredientRecipe {
  return buildRelatedIngredientRecipe(match, recipe);
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

    const card = cardFor(ingredientName);
    const ingredient = card ? catalogRecord(card) : null;

    // Resolve canonical slug for the recipe index
    const canonicalName = card?.name ?? ingredientName;
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

    return NextResponse.json(
      {
        success: true,
        ingredient,
        slug: card?.slug ?? null,
        relatedRecipes,
        recipesByCuisine,
        substitutions,
        totalRecipeMatches,
      },
      {
        headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" },
      },
    );
  } catch (error) {
    _logger.error("[ingredients/:name] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch ingredient details" },
      { status: 500 },
    );
  }
}
