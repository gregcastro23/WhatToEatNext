import { NextResponse } from "next/server";
import {
  fetchInstacartIdp,
  InstacartConfigurationError,
} from "@/lib/instacart/idpClient";
import type { InstacartShoppingListRequest } from "@/types/instacart";

/**
 * POST /api/instacart/price-estimate
 * 
 * Performs a "silent" probe of the Instacart IDP to verify match confidence.
 * This does NOT create a user-visible list, it just checks if the IDP
 * accepts the ingredient names and units.
 */
export async function POST(req: Request) {
  try {
    const { line_items: lineItems } = await req.json();

    if (!lineItems || !Array.isArray(lineItems)) {
      return NextResponse.json({ error: "Missing line_items" }, { status: 400 });
    }

    const idpRequest: InstacartShoppingListRequest = {
      title: "Price Probe (Internal)",
      link_type: "shopping_list",
      line_items: lineItems.slice(0, 50), // Limit probe size
      landing_page_configuration: {
        partner_linkback_url: "https://alchm.kitchen"
      }
    };

    let response: Response;
    try {
      response = await fetchInstacartIdp("products/products_link", {
        method: "POST",
        body: idpRequest,
        timeoutMs: 12_000,
      });
    } catch (error) {
      if (error instanceof InstacartConfigurationError) {
        return NextResponse.json({
          confidence: "low",
          message: error.message,
        });
      }
      throw error;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json({
        confidence: "low",
        reason: "IDP rejected payload",
        validated_item_count: 0,
        details: errorData
      });
    }

    // Success means Instacart can handle these items!
    return NextResponse.json({
      confidence: "high",
      message: "Ingredients validated by Instacart IDP",
      validated_item_count: lineItems.length,
      status: response.status
    });

  } catch (error) {
    console.error("Price Probe Error:", error);
    return NextResponse.json({ confidence: "low", error: "Internal probe failure" }, { status: 500 });
  }
}
