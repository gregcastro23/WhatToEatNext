import { NextResponse } from "next/server";
import { gateDemoOrAuth } from "@/lib/auth/demoAccess";
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
 *
 * AUTH REQUIRED. This runs the full ingredient-catalog fingerprint over a
 * client-supplied recipe body, so it is the same compute surface as `/mint`
 * minus the debit. It was unauthenticated, which made every degenerate-input
 * path in `computeRecipeFingerprint` anonymously reachable. `dailyDemoQuota: 0`
 * matches `/mint` — there is no demo tier for this.
 */
export async function POST(request: NextRequest) {
  const access = await gateDemoOrAuth(request, { dailyDemoQuota: 0, feature: "mint recipe quote" });
  if (access.mode !== "auth") {
    if (access.mode === "denied") return access.blocked;
    return NextResponse.json({ error: "Sign in to quote a recipe mint." }, { status: 401 });
  }

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
