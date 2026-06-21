/**
 * Resolve a recipe for the NFT metadata/content routes — SERVER ONLY.
 *
 * Accepts either a recipe id or a contentHash. The featured recipe is always
 * resolvable (even before it's minted, so its token JSON is live for the Promo
 * and marketplaces); any other recipe resolves from the `recipe_nft_mints`
 * ledger by content hash once minted.
 */

import { featuredRecipe } from "@/data/featuredRecipe";
import { recipeNftMintService } from "@/services/recipeNftMintService";
import { computeCommitments } from "./content";
import { computeRecipeFingerprint } from "./fingerprint";
import { parseRecipeForMint, type MintableRecipe } from "./mintableRecipe";

export interface ResolvedNftRecipe {
  recipe: MintableRecipe;
  /** A durable image URL stored at mint time, if any (else generate on demand). */
  storedImageUrl: string | null;
}

let _featuredContentHash: string | null = null;
function featuredContentHash(): string {
  if (_featuredContentHash) return _featuredContentHash;
  const fp = computeRecipeFingerprint(featuredRecipe);
  _featuredContentHash = computeCommitments(featuredRecipe, fp).contentHash.toLowerCase();
  return _featuredContentHash;
}

export async function resolveNftRecipe(id: string): Promise<ResolvedNftRecipe | null> {
  const key = id.trim();
  const lower = key.toLowerCase();

  // 1. The featured recipe — by id or by its content hash (serveable pre-mint).
  if (key === featuredRecipe.id || lower === featuredContentHash()) {
    return { recipe: featuredRecipe, storedImageUrl: null };
  }

  // 2. Any minted recipe — by content hash from the ledger.
  if (lower.startsWith("0x")) {
    const stored = await recipeNftMintService.getByContentHash(lower);
    if (stored) {
      const parsed = parseRecipeForMint(stored.recipeJson);
      if (parsed.ok && parsed.recipe) {
        return { recipe: parsed.recipe, storedImageUrl: stored.imageUrl };
      }
    }
  }

  return null;
}
