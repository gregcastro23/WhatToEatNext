/**
 * Persistence for recipe-NFT mints — the off-chain ledger that bridges the ESMS
 * debit to the on-chain token. Best-effort: returns null when the DB is
 * unavailable so the mint response can still surface the result.
 */

import { executeQuery } from "@/lib/database";
import type { RecipeNftCommitments } from "@/lib/recipe-nft/content";
import type { RecipeProvenance } from "@/lib/recipe-nft/mintableRecipe";
import type { MintOnChainResult } from "@/lib/recipe-nft/minter";
import type { CoinAmounts } from "@/lib/recipe-nft/types";

export interface RecordMintInput {
  userId: string;
  recipeId: string;
  title: string;
  provenance: RecipeProvenance;
  commitments: RecipeNftCommitments;
  engineVersion: number;
  aggregationMode: string;
  aSharp: number;
  cost: CoinAmounts;
  transactionGroupId: string | null;
  chainResult: MintOnChainResult;
  metadataUri?: string;
  /** Validated recipe payload, so the metadata/content routes can rebuild the token JSON. */
  recipeJson?: unknown;
  imageUrl?: string | null;
}

export const recipeNftMintService = {
  /** Insert a mint record; null on DB error or duplicate content_hash. */
  async recordMint(input: RecordMintInput): Promise<{ id: string } | null> {
    try {
      const res = await executeQuery(
        `INSERT INTO recipe_nft_mints
           (user_id, recipe_id, title, source, content_hash, computation_hash,
            ingredient_catalog_root, engine_version, aggregation_mode, a_sharp,
            cost, transaction_group_id, status, chain, token_id, tx_hash, metadata_uri,
            recipe_json, image_url, minted_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,
                 CASE WHEN $13 = 'minted' THEN now() ELSE NULL END)
         ON CONFLICT (content_hash) DO NOTHING
         RETURNING id`,
        [
          input.userId,
          input.recipeId,
          input.title,
          input.provenance.source,
          input.commitments.contentHash,
          input.commitments.computationHash,
          input.commitments.ingredientCatalogRoot,
          input.engineVersion,
          input.aggregationMode,
          input.aSharp,
          JSON.stringify(input.cost),
          input.transactionGroupId,
          input.chainResult.status,
          input.chainResult.chain ?? null,
          input.chainResult.tokenId ?? null,
          input.chainResult.txHash ?? null,
          input.metadataUri ?? null,
          input.recipeJson != null ? JSON.stringify(input.recipeJson) : null,
          input.imageUrl ?? null,
        ],
      );
      const id = res.rows?.[0]?.id;
      return id ? { id } : null;
    } catch (err) {
      console.error("recordMint failed", err);
      return null;
    }
  },

  /**
   * Backfill the on-chain token id once it has been decoded from the
   * RecipeMinted event (the mint tx records only the hash). Returns true when a
   * row was updated. Used by scripts/backfill-recipe-token-ids.ts.
   */
  async updateTokenId(contentHash: string, tokenId: string): Promise<boolean> {
    try {
      const res = await executeQuery(
        `UPDATE recipe_nft_mints
            SET token_id = $2
          WHERE content_hash = $1 AND token_id IS NULL`,
        [contentHash, tokenId],
      );
      return (res.rowCount ?? 0) > 0;
    } catch (err) {
      console.error("updateTokenId failed", err);
      return false;
    }
  },

  /** Has this exact recipe content already been minted? */
  async findByContentHash(contentHash: string): Promise<{ id: string; status: string } | null> {
    try {
      const res = await executeQuery(
        `SELECT id, status FROM recipe_nft_mints WHERE content_hash = $1 LIMIT 1`,
        [contentHash],
      );
      const row = res.rows?.[0];
      return row ? { id: row.id, status: row.status } : null;
    } catch {
      return null;
    }
  },

  /** Fetch a minted recipe's stored payload (for the metadata/content routes). */
  async getByContentHash(
    contentHash: string,
  ): Promise<{ recipeJson: unknown; imageUrl: string | null } | null> {
    try {
      const res = await executeQuery(
        `SELECT recipe_json, image_url FROM recipe_nft_mints WHERE content_hash = $1 LIMIT 1`,
        [contentHash],
      );
      const row = res.rows?.[0];
      if (!row?.recipe_json) return null;
      return { recipeJson: row.recipe_json, imageUrl: row.image_url ?? null };
    } catch {
      return null;
    }
  },
};
