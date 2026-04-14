/**
 * Instacart Shopping List API Route
 *
 * Calls the Instacart Developer Platform (IDP) API to create a shoppable
 * shopping list page from the meal planner grocery list.
 */

import { NextResponse } from "next/server";
import {
  fetchInstacartIdp,
  InstacartConfigurationError,
  mapInstacartProxyError,
} from "@/lib/instacart/idpClient";
import type {
  InstacartShoppingListRequest,
  InstacartShoppingListResponse,
  InstacartLineItem,
} from "@/types/instacart";
import type { NextRequest } from "next/server";

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

    let quantity: number = parseFloat(qtyRaw);
    if (qtyRaw.includes("/")) {
      const [num, den] = qtyRaw.split("/");
      if (num && den && !isNaN(Number(num)) && !isNaN(Number(den))) {
        quantity = Number(num) / Number(den);
      }
    }

    if (IDP_UNITS.has(mappedUnit)) {
      return {
        name: name.trim(),
        line_item_measurements: [{ quantity, unit: mappedUnit }],
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

    const finalTitle = body.title || "Grocery List from WhatToEatNext";
    const instacartPayload: InstacartShoppingListRequest = {
      title: finalTitle,
      link_type: "shopping_list",
      line_items: parsedLineItems,
    };

    let instacartResponse: Response;
    try {
      instacartResponse = await fetchInstacartIdp("products/products_link", {
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
    } catch {
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
