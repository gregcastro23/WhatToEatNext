/**
 * Instacart Shopping List API Route
 *
 * Calls the Instacart Developer Platform (IDP) API to create a shoppable
 * shopping list page from the meal planner grocery list.
 *
 * Docs: https://docs.instacart.com/developer_platform_api/api/products/create_shopping_list_page/
 *
 * IDP Terms compliance:
 * - API key stored server-side only, never exposed to client
 * - Shopping list URL returned to client, not raw API response
 * - Rate limit errors handled gracefully per IDP error handling guidelines
 */

import { NextRequest, NextResponse } from "next/server";
import { createLogger } from "@/utils/logger";
import type {
  InstacartShoppingListRequest,
  InstacartShoppingListResponse,
} from "@/types/instacart";

const logger = createLogger("InstacartAPI");

const INSTACART_IDP_BASE_URL = "https://connect.instacart.com";
const INSTACART_IDP_BASE_URL_DEV = "https://connect.dev.instacart.tools";
const FETCH_TIMEOUT_MS = 15_000;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as InstacartShoppingListRequest;
    const { title, line_items } = body;

    if (!line_items || line_items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    const apiKey = process.env.INSTACART_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Instacart API key not configured. Set INSTACART_API_KEY in your environment.",
        },
        { status: 503 },
      );
    }

    const useProd =
      process.env.NODE_ENV === "production" &&
      process.env.INSTACART_USE_PROD === "true";
    const baseUrl = useProd ? INSTACART_IDP_BASE_URL : INSTACART_IDP_BASE_URL_DEV;

    const instacartPayload: InstacartShoppingListRequest = {
      title: title || "Grocery List from WhatToEatNext",
      link_type: "shopping_list",
      line_items,
    };

    logger.info("Creating Instacart shopping list", {
      itemCount: line_items.length,
      title: instacartPayload.title,
      environment: useProd ? "production" : "development",
    });

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
      logger.error("Instacart API error", {
        status: instacartResponse.status,
        error: errorText,
      });

      const statusMessages: Record<number, string> = {
        401: "Invalid API key",
        422: `Invalid request: ${errorText}`,
        429: "Rate limit exceeded, please try again shortly",
      };
      const details =
        statusMessages[instacartResponse.status] ??
        (instacartResponse.status >= 500
          ? "Instacart service unavailable"
          : `Instacart returned status ${instacartResponse.status}`);

      return NextResponse.json(
        { error: "Failed to create Instacart shopping list", details },
        { status: instacartResponse.status >= 500 ? 502 : instacartResponse.status },
      );
    }

    const data =
      (await instacartResponse.json()) as InstacartShoppingListResponse;

    logger.info("Instacart shopping list created", {
      url: data.products_link_url,
    });

    return NextResponse.json({
      url: data.products_link_url,
      item_count: line_items.length,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      logger.error("Instacart API request timed out");
      return NextResponse.json(
        { error: "Failed to reach Instacart", details: "Request timed out" },
        { status: 504 },
      );
    }
    logger.error("Instacart shopping list creation failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
