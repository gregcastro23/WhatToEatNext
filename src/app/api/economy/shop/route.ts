/**
 * GET /api/economy/shop
 * Returns shop items with live current-moment pricing.
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

  const url = new URL(request.url);
  const category = url.searchParams.get("category") || "feature";

  const [balances, items, pricing] = await Promise.all([
    tokenEconomy.getBalances(user.id),
    tokenEconomy.getShopItems({ category, onlyActive: true }),
    getLivePricingContext(),
  ]);

  const shopItems = items.map(item => {
    const baseCost = {
      spirit: item.costSpirit,
      essence: item.costEssence,
      matter: item.costMatter,
      substance: item.costSubstance,
    };
    const liveCost = applyLivePricing(baseCost, pricing.multiplier);
    const canAfford =
      balances.spirit >= liveCost.spirit &&
      balances.essence >= liveCost.essence &&
      balances.matter >= liveCost.matter &&
      balances.substance >= liveCost.substance;

    return {
      id: item.id,
      slug: item.slug,
      title: item.title,
      description: item.description,
      category: item.category,
      isOneTime: item.isOneTime,
      baseCost,
      liveCost,
      canAfford,
    };
  });

  return NextResponse.json({
    success: true,
    balances,
    pricing,
    items: shopItems,
  });
}

