/**
 * Instacart Shopping List API Route
 *
 * Calls the Instacart Developer Platform (IDP) API to create a shoppable
 * shopping list page from the meal planner grocery list.
 */

import { NextResponse } from "next/server";
import type {
  InstacartShoppingListRequest,
  InstacartShoppingListResponse,
  InstacartLineItem,
} from "@/types/instacart";
import type { NextRequest } from "next/server";

const INSTACART_IDP_BASE_URL = "https://connect.instacart.com";
const INSTACART_IDP_BASE_URL_DEV = "https://connect.dev.instacart.tools";
const FETCH_TIMEOUT_MS = 15_000;

// Supported Instacart units
const IDP_UNITS = new Set([
  "ounce",
  "fluid_ounce",
  "pound",
  "pint",
  "quart",
  "gallon",
  "milliliter",
  "liter",
  "gram",
  "kilogram",
]);

// Map common unit abbreviations to IDP units
const UNIT_MAP: Record<string, string> = {
  oz: "ounce",
  ounces: "ounce",
  "fl oz": "fluid_ounce",
  "fluid ounce": "fluid_ounce",
  lb: "pound",
  lbs: "pound",
  pt: "pint",
  pints: "pint",
  qt: "quart",
  quarts: "quart",
  gal: "gallon",
  gallons: "gallon",
  ml: "milliliter",
  l: "liter",
  liters: "liter",
  g: "gram",
  grams: "gram",
  kg: "kilogram",
  kgs: "kilogram",
};

/**
 * Resilient ingredient parser that converts a string like "2 lbs chicken breast"
 * into a proper InstacartLineItem with quantity and mapped unit.
 */
function parseIngredientString(ingredient: string): InstacartLineItem {
  // Regex to extract quantity and unit if present
  // e.g., "1.5 lbs chicken breast", "2 apples", "1/2 cup sugar"
  const match = ingredient.trim().match(/^([\d./]+)\s+([A-Za-z]+)\s+(.+)$/);

  if (match) {
    const [, qtyRaw, rawUnit, name] = match;
    const lowerUnit = rawUnit.toLowerCase();
    const mappedUnit = UNIT_MAP[lowerUnit] || lowerUnit;

    let quantity = qtyRaw;
    if (qtyRaw.includes("/")) {
      const [num, den] = qtyRaw.split("/");
      if (num && den && !isNaN(Number(num)) && !isNaN(Number(den))) {
        quantity = (Number(num) / Number(den)).toFixed(2);
      }
    }

    if (IDP_UNITS.has(mappedUnit)) {
      return {
        name: name.trim(),
        line_item_measurements: [{ quantity: String(quantity), unit: mappedUnit }],
      };
    } else {
      // Unit not supported by IDP (like cups, tbsp), just send the full string as name
      return { name: ingredient.trim() };
    }
  }

  // Fallback: no obvious qty/unit pattern
  return { name: ingredient.trim() };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as InstacartShoppingListRequest;
    
    let parsedLineItems: InstacartLineItem[] = [];

    if (body.line_items && body.line_items.length > 0) {
      parsedLineItems = body.line_items;
    } else if (body.ingredients && body.ingredients.length > 0) {
      parsedLineItems = body.ingredients.map(parseIngredientString);
    } else {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    const apiKey = process.env.INSTACART_API_KEY || process.env.instacart_development_api;
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
      
    const baseUrl = isDevEnv ? INSTACART_IDP_BASE_URL_DEV : INSTACART_IDP_BASE_URL;

    const finalTitle = body.title || "Grocery List from WhatToEatNext";
    const instacartPayload: InstacartShoppingListRequest = {
      title: finalTitle,
      link_type: "shopping_list",
      line_items: parsedLineItems,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let instacartResponse: Response;
    try {
      instacartResponse = await fetch(
        `${baseUrl}/idp/v1/products/products_link`,
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
        422: `Unprocessable Entity: Invalid request format: ${errorText}`,
        429: "Too Many Requests: Rate limit exceeded, please try again shortly",
      };
      
      const details =
        statusMessages[statusCode] ??
        (statusCode >= 500
          ? "Instacart service unavailable"
          : `Instacart returned status ${statusCode}`);

      // Map upstream 500s to 502 Bad Gateway
      if (statusCode >= 500) statusCode = 502;

      return NextResponse.json(
        { error: "Failed to create Instacart shopping list", details },
        { status: statusCode },
      );
    }

    const data = (await instacartResponse.json()) as InstacartShoppingListResponse;
    let productsLinkUrl = data.products_link_url;

    // Append affiliate UTM parameters
    try {
      const urlObj = new URL(productsLinkUrl);
      urlObj.searchParams.set("utm_source", "whattoeatnext");
      urlObj.searchParams.set("utm_medium", "affiliate");
      urlObj.searchParams.set("utm_campaign", "idp_integration");
      productsLinkUrl = urlObj.toString();
    } catch (e) {
      // fallback if URL parsing fails
      const separator = productsLinkUrl.includes("?") ? "&" : "?";
      productsLinkUrl += `${separator}utm_source=whattoeatnext&utm_medium=affiliate&utm_campaign=idp_integration`;
    }

    return NextResponse.json({
      url: productsLinkUrl,
      item_count: parsedLineItems.length,
      title: finalTitle
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { error: "Failed to reach Instacart", details: "Request timed out" },
        { status: 504 },
      );
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
