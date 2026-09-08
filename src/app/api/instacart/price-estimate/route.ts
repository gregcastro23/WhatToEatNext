import { NextResponse } from "next/server";
import {
  fetchInstacartIdp,
  InstacartConfigurationError,
} from "@/lib/instacart/idpClient";
import {
  InstacartPriceEstimateRequestSchema,
  type ParsedInstacartPriceEstimateRequest,
} from "@/lib/validation/apiSchemas";
import type {
  InstacartLineItem,
  InstacartShoppingListRequest,
} from "@/types/instacart";
import { createLogger } from "@/utils/logger";

const logger = createLogger("instacart/price-estimate");

function mapToLineItems(
  items: ParsedInstacartPriceEstimateRequest["line_items"],
): InstacartLineItem[] {
  return items.slice(0, 50).map((item) => {
    if (typeof item === "string") return { name: item };
    return {
      name: item.name,
      ...(item.display_text ? { display_text: item.display_text } : {}),
      ...(item.product_ids ? { product_ids: item.product_ids } : {}),
      ...(item.upcs ? { upcs: item.upcs } : {}),
      ...(item.line_item_measurements
        ? { line_item_measurements: item.line_item_measurements }
        : {}),
    };
  });
}

async function probeIdp(idpRequest: InstacartShoppingListRequest) {
  try {
    return await fetchInstacartIdp("products/products_link", {
      method: "POST",
      body: idpRequest,
      timeoutMs: 12_000,
    });
  } catch (error) {
    if (error instanceof InstacartConfigurationError) {
      logger.warn("Instacart IDP misconfigured", error);
      return null;
    }
    throw error;
  }
}

/**
 * POST /api/instacart/price-estimate
 * 
 * Performs a "silent" probe of the Instacart IDP to verify match confidence.
 * This does NOT create a user-visible list, it just checks if the IDP
 * accepts the ingredient names and units.
 */
export async function POST(req: Request) {
  try {
    const rawBody: unknown = await req.json().catch(() => null);
    if (!rawBody) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = InstacartPriceEstimateRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Missing line_items", details: parsed.error.issues },
        { status: 400 },
      );
    }
    const { line_items: lineItems } = parsed.data;

    const idpRequest: InstacartShoppingListRequest = {
      title: "Price Probe (Internal)",
      link_type: "shopping_list",
      line_items: mapToLineItems(lineItems), // Limit probe size
      landing_page_configuration: {
        partner_linkback_url: "https://alchm.kitchen",
      },
    };

    const response = await probeIdp(idpRequest);
    if (!response) {
      return NextResponse.json({
        confidence: "low",
        message: "Instacart integration unavailable.",
      });
    }

    if (!response.ok) {
      await response.json().catch(() => ({}));
      logger.warn("Instacart IDP rejected payload", { status: response.status });
      return NextResponse.json({
        confidence: "low",
        reason: "IDP rejected payload",
        validated_item_count: 0,
      });
    }

    return NextResponse.json({
      confidence: "high",
      message: "Ingredients validated by Instacart IDP",
      validated_item_count: lineItems.length,
      status: response.status,
    });
  } catch (error) {
    logger.error("Price probe error", error);
    return NextResponse.json({ confidence: "low", error: "Internal probe failure" }, { status: 500 });
  }
}
