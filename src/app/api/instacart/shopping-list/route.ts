/**
 * Instacart Shopping List API Route
 *
 * Calls the Instacart Developer Platform (IDP) API to create a shoppable
 * shopping list page from the meal planner grocery list.
 *
 * Docs: https://docs.instacart.com/developer_platform_api/api/products/create_shopping_list_page/
 *
 * @file src/app/api/instacart/shopping-list/route.ts
 */

import { NextRequest, NextResponse } from "next/server";
import { createLogger } from "@/utils/logger";

const logger = createLogger("InstacartAPI");

const INSTACART_IDP_BASE_URL = "https://connect.instacart.com";
const INSTACART_IDP_BASE_URL_DEV = "https://connect.dev.instacart.tools";

export interface InstacartLineItem {
  name: string;
  quantity?: number;
  unit?: string;
  display_text?: string;
}

export interface InstacartShoppingListRequest {
  title?: string;
  line_items: InstacartLineItem[];
  partner_linkback_url?: string;
  expires_in?: number;
}

export interface InstacartShoppingListResponse {
  url: string;
  list_id?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as InstacartShoppingListRequest;
    const { title, line_items, partner_linkback_url, expires_in } = body;

    if (!line_items || line_items.length === 0) {
      return NextResponse.json(
        { error: "No items provided" },
        { status: 400 }
      );
    }

    const apiKey = process.env.INSTACART_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Instacart API key not configured. Set INSTACART_API_KEY in your environment." },
        { status: 503 }
      );
    }

    const isDev = process.env.NODE_ENV !== "production";
    const baseUrl = isDev ? INSTACART_IDP_BASE_URL_DEV : INSTACART_IDP_BASE_URL;

    const instacartPayload = {
      title: title || "Grocery List from WhatToEatNext",
      expires_in: expires_in ?? 7, // 7 days default
      line_items: line_items.map((item) => ({
        name: item.name,
        ...(item.quantity !== undefined && { quantity: item.quantity }),
        ...(item.unit && { unit: item.unit }),
        ...(item.display_text && { display_text: item.display_text }),
      })),
      landing_page_configuration: {
        ...(partner_linkback_url && { partner_linkback_url }),
        enable_pantry_items: true,
      },
    };

    logger.info("Creating Instacart shopping list", {
      itemCount: line_items.length,
      title: instacartPayload.title,
      environment: isDev ? "development" : "production",
    });

    const instacartResponse = await fetch(
      `${baseUrl}/idp/v1/products/products_link`,
      {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify(instacartPayload),
      }
    );

    if (!instacartResponse.ok) {
      const errorText = await instacartResponse.text();
      logger.error("Instacart API error", {
        status: instacartResponse.status,
        error: errorText,
      });
      return NextResponse.json(
        {
          error: "Failed to create Instacart shopping list",
          details: instacartResponse.status === 401
            ? "Invalid API key"
            : `Instacart returned status ${instacartResponse.status}`,
        },
        { status: instacartResponse.status >= 500 ? 502 : instacartResponse.status }
      );
    }

    const data = await instacartResponse.json() as InstacartShoppingListResponse;

    logger.info("Instacart shopping list created", { url: data.url });

    return NextResponse.json({ url: data.url });
  } catch (error) {
    logger.error("Instacart shopping list creation failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
