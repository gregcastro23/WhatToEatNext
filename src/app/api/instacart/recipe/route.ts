/**
 * Instacart Recipe Page API Route
 *
 * Calls the Instacart Developer Platform (IDP) API to create a branded
 * recipe page with ingredients, instructions, and pantry exclusion.
 *
 * POST /idp/v1/products/recipe
 */

import { NextResponse } from "next/server";
import {
  fetchInstacartIdp,
  InstacartConfigurationError,
  mapInstacartProxyError,
} from "@/lib/instacart/idpClient";
import type {
  InstacartRecipeRequest,
  InstacartRecipeResponse,
} from "@/types/instacart";
import { splitItemsByInventory } from "@/utils/instacart/ingredientIntelligence";
import type { NextRequest } from "next/server";

const FETCH_TIMEOUT_MS = 15_000;

// In-memory cache: recipe external_reference_id → products_link_url
interface CacheEntry {
  url: string;
  expiresAt: number;
}
const recipeUrlCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours (URLs expire in 365 days)

interface InstacartRecipeRouteRequest extends InstacartRecipeRequest {
  inventory?: string[];
}

/**
 * Generates a stable cache key for a recipe + inventory combination.
 */
function getRecipeCacheKey(recipeId: string, inventory: string[] = []): string {
  const sortedInventory = [...inventory].sort();
  return `${recipeId}:${sortedInventory.join(",")}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as InstacartRecipeRouteRequest;

    // Validate required fields
    if (!body.title || !body.ingredients || body.ingredients.length === 0) {
      return NextResponse.json(
        { error: "title and ingredients are required" },
        { status: 400 },
      );
    }

    const inventory = Array.isArray(body.inventory)
      ? body.inventory.filter(
        (item): item is string => typeof item === "string" && item.trim() !== "",
      )
      : [];

    // Check cache by external_reference_id and inventory
    if (body.external_reference_id) {
      const cacheKey = getRecipeCacheKey(body.external_reference_id, inventory);
      const cached = recipeUrlCache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        return NextResponse.json({
          url: cached.url,
          products_link_url: cached.url,
          cached: true,
        });
      }
    }
    const { included: ingredients, excluded: pantryExcludedItems } =
      splitItemsByInventory(body.ingredients, inventory);

    if (ingredients.length === 0) {
      return NextResponse.json(
        {
          error: "All recipe ingredients are already covered by pantry inventory.",
          excluded_pantry_items: pantryExcludedItems.map((item) => item.name),
        },
        { status: 400 },
      );
    }

    // Build the IDP recipe payload
    const instacartPayload: InstacartRecipeRequest = {
      title: body.title,
      image_url: body.image_url,
      author: body.author || "Alchm Kitchen",
      servings: body.servings,
      cooking_time: body.cooking_time,
      external_reference_id: body.external_reference_id,
      content_creator_credit_info:
        body.content_creator_credit_info ||
        "Recipe by Alchm Kitchen — alchm.kitchen",
      expires_in: body.expires_in || 365,
      instructions: body.instructions,
      ingredients,
      landing_page_configuration: {
        partner_linkback_url:
          body.landing_page_configuration?.partner_linkback_url ||
          "https://alchm.kitchen/menu-planner",
        enable_pantry_items:
          body.landing_page_configuration?.enable_pantry_items ?? true,
      },
    };

    let instacartResponse: Response;
    try {
      instacartResponse = await fetchInstacartIdp("products/recipe", {
        method: "POST",
        body: instacartPayload,
        timeoutMs: FETCH_TIMEOUT_MS,
      });
    } catch (error) {
      if (error instanceof InstacartConfigurationError) {
        return NextResponse.json({ error: error.message }, { status: 503 });
      }
      throw error;
    }

    if (!instacartResponse.ok) {
      const errorText = await instacartResponse.text();
      const { statusCode, details } = mapInstacartProxyError(
        instacartResponse,
        errorText,
        "Instacart service unavailable",
      );

      return NextResponse.json(
        { error: "Failed to create Instacart recipe page", details },
        { status: statusCode },
      );
    }

    const data =
      (await instacartResponse.json()) as InstacartRecipeResponse;
    let productsLinkUrl = data.products_link_url;

    // Append affiliate UTM parameters
    try {
      const urlObj = new URL(productsLinkUrl);
      urlObj.searchParams.set("utm_source", "alchm_kitchen");
      urlObj.searchParams.set("utm_medium", "affiliate");
      urlObj.searchParams.set("utm_campaign", "recipe_page");
      productsLinkUrl = urlObj.toString();
    } catch {
      const separator = productsLinkUrl.includes("?") ? "&" : "?";
      productsLinkUrl += `${separator}utm_source=alchm_kitchen&utm_medium=affiliate&utm_campaign=recipe_page`;
    }

    // Cache the URL (inventory-aware)
    if (body.external_reference_id) {
      const cacheKey = getRecipeCacheKey(body.external_reference_id, inventory);
      recipeUrlCache.set(cacheKey, {
        url: productsLinkUrl,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });
    }

    return NextResponse.json({
      url: productsLinkUrl,
      products_link_url: productsLinkUrl,
      recipe_title: body.title,
      ingredient_count: ingredients.length,
      excluded_pantry_items: pantryExcludedItems.map((item) => item.name),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { error: "Failed to reach Instacart", details: "Request timed out" },
        { status: 504 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
