/**
 * Instacart Recipe Page API Route
 *
 * Calls the Instacart Developer Platform (IDP) API to create a branded
 * recipe page with ingredients, instructions, and pantry exclusion.
 *
 * POST /idp/v1/products/recipe
 */

import { NextResponse } from "next/server";
import type {
  InstacartRecipeRequest,
  InstacartRecipeResponse,
} from "@/types/instacart";
import type { NextRequest } from "next/server";

const INSTACART_IDP_BASE_URL = "https://connect.instacart.com";
const INSTACART_IDP_BASE_URL_DEV = "https://connect.dev.instacart.tools";
const FETCH_TIMEOUT_MS = 15_000;

// In-memory cache: recipe external_reference_id → products_link_url
interface CacheEntry {
  url: string;
  expiresAt: number;
}
const recipeUrlCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours (URLs expire in 365 days)

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as InstacartRecipeRequest;

    // Validate required fields
    if (!body.title || !body.ingredients || body.ingredients.length === 0) {
      return NextResponse.json(
        { error: "title and ingredients are required" },
        { status: 400 },
      );
    }

    // Check cache by external_reference_id
    if (body.external_reference_id) {
      const cached = recipeUrlCache.get(body.external_reference_id);
      if (cached && cached.expiresAt > Date.now()) {
        return NextResponse.json({
          url: cached.url,
          products_link_url: cached.url,
          cached: true,
        });
      }
    }

    const apiKey =
      process.env.INSTACART_API_KEY || process.env.instacart_development_api;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Instacart API key not configured. Set INSTACART_API_KEY in your environment.",
        },
        { status: 503 },
      );
    }

    const isDevEnv =
      process.env.NODE_ENV !== "production" ||
      process.env.INSTACART_USE_PROD !== "true";

    const baseUrl = isDevEnv
      ? INSTACART_IDP_BASE_URL_DEV
      : INSTACART_IDP_BASE_URL;

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
      ingredients: body.ingredients,
      landing_page_configuration: {
        partner_linkback_url:
          body.landing_page_configuration?.partner_linkback_url ||
          "https://alchm.kitchen/menu-planner",
        enable_pantry_items:
          body.landing_page_configuration?.enable_pantry_items ?? true,
      },
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let instacartResponse: Response;
    try {
      instacartResponse = await fetch(
        `${baseUrl}/idp/v1/products/recipe`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(instacartPayload),
          signal: controller.signal,
        },
      );
    } finally {
      clearTimeout(timeoutId);
    }

    if (!instacartResponse.ok) {
      const errorText = await instacartResponse.text();

      let statusCode = instacartResponse.status;
      const statusMessages: Record<number, string> = {
        400: `Bad Request: ${errorText}`,
        401: "Unauthorized: Invalid API key",
        403: "Forbidden: API key does not have required permissions",
        422: `Unprocessable Entity: Invalid recipe format: ${errorText}`,
        429: "Too Many Requests: Rate limit exceeded",
      };

      const details =
        statusMessages[statusCode] ??
        (statusCode >= 500
          ? "Instacart service unavailable"
          : `Instacart returned status ${statusCode}`);

      if (statusCode >= 500) statusCode = 502;

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

    // Cache the URL
    if (body.external_reference_id) {
      recipeUrlCache.set(body.external_reference_id, {
        url: productsLinkUrl,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });
    }

    return NextResponse.json({
      url: productsLinkUrl,
      products_link_url: productsLinkUrl,
      recipe_title: body.title,
      ingredient_count: body.ingredients.length,
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
