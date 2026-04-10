/**
 * POST /api/economy/purchase — Purchase a shop item with ESMS tokens
 *
 * Body: { shopItemSlug: string }
 * Returns: { success, balances, transactionGroupId } or error
 *
 * @file src/app/api/economy/purchase/route.ts
 */

import { NextResponse } from "next/server";
import { getDatabaseUserFromRequest } from "@/lib/auth/validateRequest";
import { applyLivePricing, getLivePricingContext } from "@/lib/economy/livePricing";
import { tokenEconomy } from "@/services/TokenEconomyService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const user = await getDatabaseUserFromRequest(request);
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const shopItemSlug = searchParams.get("shopItemSlug");
  if (!shopItemSlug) {
    return NextResponse.json(
      { success: false, message: "shopItemSlug is required" },
      { status: 400 },
    );
  }

  const item = await tokenEconomy.getShopItem(shopItemSlug);
  if (!item || !item.isActive) {
    return NextResponse.json(
      { success: false, message: "Shop item not found or unavailable" },
      { status: 404 },
    );
  }

  const hasAccess = item.isOneTime
    ? await tokenEconomy.hasActivePurchase(user.id, shopItemSlug)
    : false;

  return NextResponse.json({
    success: true,
    hasAccess,
    item: {
      slug: item.slug,
      title: item.title,
      isOneTime: item.isOneTime,
      cost: {
        spirit: item.costSpirit,
        essence: item.costEssence,
        matter: item.costMatter,
        substance: item.costSubstance,
      },
    },
  });
}

export async function POST(request: NextRequest) {
  const user = await getDatabaseUserFromRequest(request);
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 },
    );
  }

  let body: { shopItemSlug?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request body" },
      { status: 400 },
    );
  }

  const { shopItemSlug } = body;
  if (!shopItemSlug || typeof shopItemSlug !== "string") {
    return NextResponse.json(
      { success: false, message: "shopItemSlug is required" },
      { status: 400 },
    );
  }

  // Validate the item exists
  const item = await tokenEconomy.getShopItem(shopItemSlug);
  if (!item || !item.isActive) {
    return NextResponse.json(
      { success: false, message: "Shop item not found or unavailable" },
      { status: 404 },
    );
  }

  const pricing = await getLivePricingContext();
  const liveCost = applyLivePricing(
    {
      spirit: item.costSpirit,
      essence: item.costEssence,
      matter: item.costMatter,
      substance: item.costSubstance,
    },
    pricing.multiplier,
  );

  // Attempt purchase
  const result = await tokenEconomy.purchaseShopItem(user.id, shopItemSlug, {
    overrideCosts: liveCost,
    descriptionSuffix: `live x${pricing.multiplier.toFixed(2)}`,
  });
  if (!result.success) {
    if (result.reason === "already_owned") {
      return NextResponse.json(
        {
          success: false,
          reason: "already_owned",
          message: "You already unlocked this item.",
        },
        { status: 409 },
      );
    }

    if (result.reason === "item_not_found") {
      return NextResponse.json(
        { success: false, message: "Shop item not found or unavailable" },
        { status: 404 },
      );
    }

    // Get current balances to show the user what they're short
    const currentBalances = await tokenEconomy.getBalances(user.id);
    return NextResponse.json(
      {
        success: false,
        reason: result.reason,
        message: "Insufficient tokens to purchase this item",
        currentBalances,
        cost: {
          spirit: liveCost.spirit,
          essence: liveCost.essence,
          matter: liveCost.matter,
          substance: liveCost.substance,
        },
      },
      { status: 402 },
    );
  }

  return NextResponse.json({
    success: true,
    balances: result.balances,
    transactionGroupId: result.transactionGroupId,
    liveCost,
    pricing,
    message: `✨ Purchased: ${item.title}`,
  });
}
