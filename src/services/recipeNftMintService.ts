/**
 * Persistence for recipe-NFT mints — the off-chain ledger that bridges the ESMS
 * debit to the on-chain token. Best-effort: returns null when the DB is
 * unavailable so the mint response can still surface the result.
 */

import { executeQuery } from "@/lib/database";
import { _logger } from "@/lib/logger";
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
  /**
   * The EXACT content envelope `contentHash` commits to. The content route
   * serves this verbatim; recomputing from the live catalog made the served
   * bytes drift from the hash in the URL (migration 57).
   */
  contentJson?: unknown;
  imageUrl?: string | null;
}

interface MintIdRow { id: unknown }
interface MintStatusRow { id: unknown; status: unknown }
interface MintPayloadRow {
  recipe_json: unknown;
  content_json: unknown;
  image_url: unknown;
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

export const recipeNftMintService = {
  /** Insert a mint record; null on DB error or duplicate content_hash. */
  async recordMint(input: RecordMintInput): Promise<{ id: string } | null> {
    try {
      const res = await executeQuery<MintIdRow>(
        `INSERT INTO recipe_nft_mints
           (user_id, recipe_id, title, source, content_hash, computation_hash,
            ingredient_catalog_root, engine_version, aggregation_mode, a_sharp,
            cost, transaction_group_id, status, chain, token_id, tx_hash, metadata_uri,
            recipe_json, content_json, image_url, minted_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
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
          input.contentJson != null ? JSON.stringify(input.contentJson) : null,
          // NOTE `|| null`, not `?? null`: an empty string here means "image
          // generation failed at mint time" — storing "" would permanently pin
          // a blank image, because the metadata route regenerates only when the
          // stored value is absent.
          input.imageUrl ?? null,
        ],
      );
      const id = readString(res.rows.at(0)?.id);
      return id ? { id } : null;
    } catch (err) {
      _logger.error("[recipeNftMintService] recordMint failed", err);
      return null;
    }
  },

  /** Has this exact recipe content already been minted? */
  async findByContentHash(contentHash: string): Promise<{ id: string; status: string } | null> {
    try {
      const res = await executeQuery<MintStatusRow>(
        `SELECT id, status FROM recipe_nft_mints WHERE content_hash = $1 LIMIT 1`,
        [contentHash],
      );
      const row = res.rows.at(0);
      const id = readString(row?.id);
      const status = readString(row?.status);
      return id && status ? { id, status } : null;
    } catch (error) {
      _logger.error("[recipeNftMintService] findByContentHash failed", error);
      return null;
    }
  },

  /** Fetch a minted recipe's stored payload (for the metadata/content routes). */
  async getByContentHash(
    contentHash: string,
  ): Promise<{ recipeJson: unknown; contentJson: unknown; imageUrl: string | null } | null> {
    try {
      const res = await executeQuery<MintPayloadRow>(
        `SELECT recipe_json, content_json, image_url FROM recipe_nft_mints WHERE content_hash = $1 LIMIT 1`,
        [contentHash],
      );
      const row = res.rows.at(0);
      if (row?.recipe_json == null) return null;
      return {
        recipeJson: row.recipe_json,
        contentJson: row.content_json ?? null,
        // `|| null` deliberately: a legacy "" must read as absent so the
        // metadata route regenerates instead of serving a blank image forever.
        imageUrl: readString(row.image_url),
      };
    } catch (error) {
      _logger.error("[recipeNftMintService] getByContentHash failed", error);
      return null;
    }
  },
};
