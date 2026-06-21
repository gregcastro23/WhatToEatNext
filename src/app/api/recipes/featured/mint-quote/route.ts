import { NextResponse } from "next/server";
import { featuredRecipe } from "@/data/featuredRecipe";
import { buildMintQuote } from "@/lib/recipe-nft/quote";

// Cost floats with the planetary hour/day — never cache.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Live mint-cost quote for the featured recipe. Read-only and unauthenticated:
 * returns the recipe's alchemical fingerprint, the base + live (global-sky)
 * cost, and the premium chart-weighted redistribution preview. The
 * authenticated mint route personalizes this with the user's natal chart.
 */
export async function GET() {
  try {
    const quote = await buildMintQuote(featuredRecipe);
    return NextResponse.json(quote);
  } catch (err) {
    console.error("featured mint-quote failed", err);
    return NextResponse.json({ error: "Failed to compute mint quote" }, { status: 500 });
  }
}
