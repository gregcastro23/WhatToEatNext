import { NextResponse } from "next/server";
import { buildRecipeNftContent } from "@/lib/recipe-nft/content";
import { computeRecipeFingerprint } from "@/lib/recipe-nft/fingerprint";
import { resolveNftRecipe } from "@/lib/recipe-nft/resolve";

export const runtime = "nodejs";

/**
 * The canonical recipe content envelope (the exact object the on-chain
 * `contentHash` commits) — the `contentURI` target. Deterministic and immutable
 * for a given recipe + engine version, so it's cache-forever.
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

  const fingerprint = computeRecipeFingerprint(resolved.recipe);
  const content = buildRecipeNftContent(resolved.recipe, fingerprint);

  return NextResponse.json(content, {
    headers: { "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
