import { NextResponse } from "next/server";
import { buildRecipeNftContent } from "@/lib/recipe-nft/content";
import { computeRecipeFingerprint } from "@/lib/recipe-nft/fingerprint";
import { resolveNftRecipe } from "@/lib/recipe-nft/resolve";

export const runtime = "nodejs";

/**
 * The canonical recipe content envelope (the exact object the on-chain
 * `contentHash` commits) — the `contentURI` target.
 *
 * For MINTED recipes this serves the envelope STORED at mint time (migration
 * 57), verbatim. It used to recompute the fingerprint from the live ingredient
 * catalog on every request — while sending `Cache-Control: immutable` — so any
 * catalog edit (e.g. PR #686's potency corrections) silently changed the served
 * bytes out from under the hash in the URL. An on-chain commitment must resolve
 * to stored bytes, not to a function of mutable inputs.
 *
 * The featured recipe (pre-mint, no ledger row) still recomputes: its URL is
 * always derived from the CURRENT hash, so content and address move together.
 */
export async function GET(
  _req: Request,
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params;
  const resolved = await resolveNftRecipe(id);
  if (!resolved) {
    return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
  }

  if (resolved.storedContent != null) {
    return NextResponse.json(resolved.storedContent, {
      headers: { "Cache-Control": "public, max-age=31536000, immutable" },
    });
  }

  const fingerprint = computeRecipeFingerprint(resolved.recipe);
  const content = buildRecipeNftContent(resolved.recipe, fingerprint);

  return NextResponse.json(content, {
    // No `immutable` on the recomputed path: without a stored envelope this
    // response tracks the live catalog, and a year-long immutable cache would
    // freeze whichever version a CDN saw first.
    headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
  });
}
