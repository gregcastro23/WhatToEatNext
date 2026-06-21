import { NextResponse } from "next/server";
import { parseRecipeForMint } from "@/lib/recipe-nft/mintableRecipe";
import { buildMintQuote } from "@/lib/recipe-nft/quote";
import type { NextRequest } from "next/server";

// Cost floats with the planetary hour/day — never cache.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Live mint-cost quote for ANY recipe (POST { recipe }). Read-only — validates
 * the recipe and returns its fingerprint + four-coin cost so the recipe builder
 * can show what minting a just-generated recipe would cost. The recipe is
 * re-validated server-side; the quote reflects server-computed ESMS only.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = parseRecipeForMint((body as { recipe?: unknown })?.recipe);
  if (!parsed.ok || !parsed.recipe) {
    return NextResponse.json({ error: "Invalid recipe payload.", detail: parsed.error }, { status: 400 });
  }

  try {
    const quote = await buildMintQuote(parsed.recipe);
    return NextResponse.json(quote);
  } catch (err) {
    console.error("mint-quote failed", err);
    return NextResponse.json({ error: "Failed to compute mint quote" }, { status: 500 });
  }
}
