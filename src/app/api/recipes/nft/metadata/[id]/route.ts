import { NextResponse } from "next/server";
import { buildMetadata } from "@/lib/recipe-nft/content";
import { computeRecipeFingerprint } from "@/lib/recipe-nft/fingerprint";
import { generateRecipeImage } from "@/lib/recipe-nft/image";
import { resolveNftRecipe } from "@/lib/recipe-nft/resolve";
import { getSelfBaseUrl } from "@/utils/urlUtils";

export const runtime = "nodejs";

/**
 * ERC-721 display metadata for a recipe NFT (the `metadataURI` / `tokenURI`
 * target). Resolves the recipe by id or contentHash, rebuilds the fingerprint,
 * resolves the hero image via the live nanobanana pipeline (Redis-cached), and
 * returns marketplace-standard JSON. Hosted on our own infra (no IPFS).
 *
 * The recipe content is immutable (contentHash), so the JSON is cache-stable;
 * only the image/external_url may refresh.
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

  const { recipe, storedImageUrl } = resolved;
  const fingerprint = computeRecipeFingerprint(recipe);
  const imageUrl =
    storedImageUrl ??
    (await generateRecipeImage({
      id: recipe.id,
      title: recipe.title,
      description: recipe.short_description,
      cuisine: recipe.cuisine,
      elemental: fingerprint.elemental,
    })) ??
    "";
  const externalUrl = `${getSelfBaseUrl()}/recipe-builder`;

  const metadata = buildMetadata(recipe, fingerprint, { imageUrl, externalUrl });

  return NextResponse.json(metadata, {
    headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
  });
}
