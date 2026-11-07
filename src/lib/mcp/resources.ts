/**
 * @file src/lib/mcp/resources.ts
 *
 * Server-defined resources for the Model Context Protocol (MCP).
 * Provides zero-cost, static and dynamic alchemical and catalog context
 * without burning LLM tool calling steps or debiting ESMS tokens.
 */
import { executeQuery } from "@/lib/database/connection";
import {
  getIngredientCatalog,
  resolveCatalogIngredient,
  catalogRecord,
} from "@/lib/ingredients/ingredientCatalog";
import { rpmForTier } from "@/lib/rateLimit";
import { LocalRecipeService } from "@/services/LocalRecipeService";
import { toStringArray } from "./culinaryCommon";
import {
  RESOURCE_DEFINITIONS,
  RESOURCE_TEMPLATES,
  STATIC_RESOURCE_MAP,
  CULINARY_TECHNIQUES,
  type ResourceContents,
  type ResourceDefinition,
  type ResourceTemplateDefinition,
} from "./resourceCatalog";
import type { ResolvedCaller } from "./auth";

export {
  RESOURCE_DEFINITIONS,
  RESOURCE_TEMPLATES,
  type ResourceContents,
  type ResourceDefinition,
  type ResourceTemplateDefinition,
};

interface CallerCulinaryProfileResource {
  authenticated: boolean;
  userId: string | null;
  allergens: string[];
  dietaryFrameworks: string[];
  dislikedIngredients: string[];
  spiceTolerance: string | null;
  householdSize: number | null;
  kitchenEquipment: string[];
  dominantElement: string | null;
}



function makeTextResult(uri: string, payload: unknown): { contents: ResourceContents[] } {
  return {
    contents: [
      {
        uri,
        mimeType: "application/json",
        text: JSON.stringify(payload, null, 2),
      },
    ],
  };
}

async function readAccountAllowance(
  uri: string,
  caller: ResolvedCaller,
): Promise<{ contents: ResourceContents[] }> {
  let balances = null;
  const tier = caller.rateLimitTier ?? "anonymous";
  if (caller.userId && process.env.DATABASE_URL) {
    try {
      const res = await executeQuery<{
        spirit: string | number;
        essence: string | number;
        matter: string | number;
        substance: string | number;
      }>(
        `SELECT spirit, essence, matter, substance FROM token_balances WHERE user_id = $1 LIMIT 1`,
        [caller.userId],
      );
      const [row] = res.rows;
      if (row) {
        balances = {
          spirit: Number(row.spirit) || 0,
          essence: Number(row.essence) || 0,
          matter: Number(row.matter) || 0,
          substance: Number(row.substance) || 0,
        };
      }
    } catch {
      // Fallback to null
    }
  }
  return makeTextResult(uri, {
    authenticated: Boolean(caller.userId),
    userId: caller.userId,
    tier,
    rateLimitRpm: rpmForTier(caller.rateLimitTier),
    balances,
  });
}

async function readAccountCulinaryProfile(
  uri: string,
  caller: ResolvedCaller,
): Promise<{ contents: ResourceContents[] }> {
  const profile: CallerCulinaryProfileResource = {
    authenticated: Boolean(caller.userId),
    userId: caller.userId,
    allergens: [],
    dietaryFrameworks: [],
    dislikedIngredients: [],
    spiceTolerance: null,
    householdSize: null,
    kitchenEquipment: [],
    dominantElement: null,
  };

  if (caller.userId && process.env.DATABASE_URL) {
    try {
      const res = await executeQuery<{
        dietary_preferences: Record<string, unknown> | null;
        kitchen_settings: Record<string, unknown> | null;
        dominant_element: string | null;
      }>(
        `SELECT dietary_preferences, kitchen_settings, dominant_element
           FROM user_profiles
          WHERE user_id = $1
          LIMIT 1`,
        [caller.userId],
      );
      const [row] = res.rows;
      if (row) {
        const prefs = row.dietary_preferences ?? {};
        const kitchen = row.kitchen_settings ?? {};
        profile.allergens = toStringArray(prefs.allergens);
        profile.dietaryFrameworks = toStringArray(prefs.restrictions);
        profile.dislikedIngredients = toStringArray(prefs.dislikes);
        profile.kitchenEquipment = toStringArray(kitchen.appliances);
        profile.spiceTolerance = typeof prefs.spiceTolerance === "string" ? prefs.spiceTolerance : null;
        profile.householdSize = typeof prefs.householdSize === "number" ? prefs.householdSize : null;
        profile.dominantElement = row.dominant_element ?? null;
      }
    } catch {
      // Keep defaults
    }
  }

  return makeTextResult(uri, profile);
}

function readIngredientResource(uri: string): { contents: ResourceContents[] } {
  const slug = uri.replace("alchm://ingredients/", "").toLowerCase().trim();
  const resolved = resolveCatalogIngredient(slug);
  if (resolved) {
    const record = catalogRecord(resolved.entry);
    return makeTextResult(uri, {
      slug: resolved.entry.slug,
      name: resolved.entry.name,
      canonical: resolved.isCanonical,
      aliases: resolved.entry.aliases,
      category: typeof record.category === "string" ? record.category : "ingredient",
      elementalProperties: record.elementalProperties ?? null,
      nutritionPer100g: record.nutritionPer100g ?? record.nutritionalContent ?? null,
      season: record.season ?? null,
      flavorProfile: record.flavorProfile ?? null,
      topPairings: record.topPairings ?? record.commonPairings ?? null,
      esms: record.esms ?? null,
    });
  }

  const catalog = getIngredientCatalog();
  const cleanTerm = slug.replace(/[-_]/g, " ");
  const suggestions = catalog.entries
    .filter(
      (e) =>
        e.slug.includes(slug) ||
        e.name.toLowerCase().includes(cleanTerm) ||
        e.aliases.some((a) => a.toLowerCase().includes(cleanTerm)),
    )
    .slice(0, 5)
    .map((e) => e.slug);

  return makeTextResult(uri, {
    error: "Ingredient not found",
    requestedSlug: slug,
    didYouMean: suggestions,
    totalCatalogIngredients: catalog.entries.length,
    suggestion: "Query alchm://catalog/cuisines or list ingredients via search.",
  });
}

function formatRecipeCard(
  recipe: Awaited<ReturnType<typeof LocalRecipeService.getRecipeById>> & object,
): Record<string, unknown> {
  const { instructions } = recipe;
  return {
    "@context": "https://schema.org",
    "@type": "Recipe",
    id: String(recipe.id),
    name: recipe.name,
    description: recipe.description ?? "",
    cuisine: recipe.cuisine ?? null,
    prepTime: recipe.prepTime ? `PT${recipe.prepTime}M` : null,
    cookTime: recipe.cookTime ? `PT${recipe.cookTime}M` : null,
    recipeYield: recipe.servings ?? 4,
    recipeIngredient: recipe.ingredients.map((ing) =>
      typeof ing === "string"
        ? ing
        : `${ing.amount ? `${ing.amount} ` : ""}${ing.unit ? `${ing.unit} ` : ""}${ing.name}${ing.notes ? ` (${ing.notes})` : ""}`,
    ),
    recipeInstructions: instructions.map((step, idx) => ({
      "@type": "HowToStep",
      position: idx + 1,
      text: step,
    })),
    dietaryFlags: recipe.dietaryRestrictions ?? recipe.dietaryFlags ?? [],
    elementalProperties: recipe.elementalProperties,
    dominantElement: recipe.dominantElement ?? null,
    resourceUri: `alchm://recipes/${recipe.id}`,
  };
}

async function readRecipeResource(uri: string): Promise<{ contents: ResourceContents[] }> {
  const idOrSlug = uri.replace("alchm://recipes/", "").trim();
  const recipe = await LocalRecipeService.getRecipeById(idOrSlug);
  if (recipe) {
    return makeTextResult(uri, formatRecipeCard(recipe));
  }

  const all = await LocalRecipeService.getAllRecipes().catch(() => []);
  const cleanSearch = idOrSlug.toLowerCase().replace(/[-_]/g, " ");
  const suggestions = all
    .filter(
      (r) =>
        r.id.toLowerCase().includes(cleanSearch) ||
        r.name.toLowerCase().includes(cleanSearch),
    )
    .slice(0, 5)
    .map((r) => ({ id: String(r.id), name: r.name }));

  return makeTextResult(uri, {
    error: "Recipe not found",
    requestedId: idOrSlug,
    didYouMean: suggestions,
    remediation: "Search recipes using generate_cosmic_recipe or what_to_cook_now.",
  });
}

function readTechniqueResource(uri: string): { contents: ResourceContents[] } {
  const slug = uri.replace("alchm://techniques/", "").toLowerCase().trim();
  const technique = CULINARY_TECHNIQUES[slug];
  if (technique) {
    return makeTextResult(uri, technique);
  }
  return makeTextResult(uri, {
    error: "Technique not found",
    requestedSlug: slug,
    availableTechniques: Object.keys(CULINARY_TECHNIQUES),
  });
}

export async function readResource(
  uri: string,
  caller: ResolvedCaller,
): Promise<{ contents: ResourceContents[] } | null> {
  const staticPayload = STATIC_RESOURCE_MAP[uri];
  if (staticPayload) {
    return makeTextResult(uri, staticPayload);
  }

  if (uri === "alchm://account/allowance") {
    return readAccountAllowance(uri, caller);
  }

  if (uri === "alchm://account/culinary-profile") {
    return readAccountCulinaryProfile(uri, caller);
  }

  if (uri.startsWith("alchm://ingredients/")) {
    return readIngredientResource(uri);
  }

  if (uri.startsWith("alchm://recipes/")) {
    return readRecipeResource(uri);
  }

  if (uri.startsWith("alchm://techniques/")) {
    return readTechniqueResource(uri);
  }

  return null;
}
