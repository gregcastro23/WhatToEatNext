/**
 * scripts/backfill-recipe-token-ids.ts
 *
 * One-shot backfill: resolve the on-chain token id for every recipe-NFT mint
 * that settled on-chain but whose `token_id` is still NULL. The mint tx records
 * only the hash (writeContract returns no value), so the id has to be recovered
 * from the RecipeMinted event in the receipt logs — or, as a fallback, from the
 * registry's `tokenForContentHash` view.
 *
 * Use it (a) after the first deploy that flips `recipeNftEnabled()` on, to fill
 * rows minted before this decoder existed, and (b) as a safety net for any row
 * where the synchronous decode in minter.ts came up empty.
 *
 * Required env vars:
 *   DATABASE_PUBLIC_URL | DATABASE_URL    — WTEN Postgres connection string
 *   NEXT_PUBLIC_RECIPE_REGISTRY_ADDRESS   — deployed RecipeRegistry address
 *   NEXT_PUBLIC_RECIPE_NFT_CHAIN          — "base" | "base-sepolia" (default sepolia)
 *   BASE_RPC_URL | BASE_SEPOLIA_RPC_URL   — RPC endpoint for the chosen chain
 *
 * Run (DATABASE_URL points at the internal hostname, so use the public URL or
 * `railway run --service Postgres`):
 *   bun run scripts/backfill-recipe-token-ids.ts [--dry-run]
 */

import pg from "pg";
import type { Hex } from "viem";
import {
  recipeNftPublicClient,
  recipeRegistryAbi,
  recipeRegistryAddress,
} from "../src/lib/recipe-nft/contract";
import { decodeMintedTokenId } from "../src/lib/recipe-nft/minter";

const { Pool } = pg;

const DRY_RUN = process.argv.includes("--dry-run");
const connectionString = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error(
    "DATABASE_PUBLIC_URL / DATABASE_URL not set — did you forget `railway run --service Postgres`?",
  );
  process.exit(2);
}

const registry = recipeRegistryAddress();
if (!registry) {
  console.error(
    "NEXT_PUBLIC_RECIPE_REGISTRY_ADDRESS not set — the protocol must be deployed before token ids exist.",
  );
  process.exit(2);
}

interface MintRow {
  id: string;
  content_hash: string;
  tx_hash: string | null;
}

async function main() {
  const pool = new Pool({ connectionString });
  const client = await pool.connect();
  const publicClient = recipeNftPublicClient();
  let filled = 0;
  let skipped = 0;
  let failed = 0;

  try {
    const { rows } = await client.query<MintRow>(
      `SELECT id, content_hash, tx_hash
         FROM recipe_nft_mints
        WHERE status = 'minted' AND token_id IS NULL
        ORDER BY created_at ASC`,
    );
    console.log(`Found ${rows.length} minted row(s) missing token_id${DRY_RUN ? " (dry run)" : ""}.`);

    for (const row of rows) {
      try {
        let tokenId: string | undefined;

        // Primary: decode the RecipeMinted event from the mint tx receipt.
        if (row.tx_hash) {
          const receipt = await publicClient.getTransactionReceipt({ hash: row.tx_hash as Hex });
          tokenId = decodeMintedTokenId(receipt.logs, registry);
        }

        // Fallback: ask the registry directly which token holds this content.
        if (!tokenId) {
          const onChain = (await publicClient.readContract({
            address: registry,
            abi: recipeRegistryAbi,
            functionName: "tokenForContentHash",
            args: [row.content_hash as Hex],
          })) as bigint;
          if (onChain > 0n) tokenId = onChain.toString();
        }

        if (!tokenId) {
          console.warn(`SKIP id=${row.id} — no RecipeMinted event and no on-chain token for content.`);
          skipped++;
          continue;
        }

        if (DRY_RUN) {
          console.log(`DRY id=${row.id} token_id=${tokenId}`);
        } else {
          await client.query(
            `UPDATE recipe_nft_mints SET token_id = $1 WHERE id = $2 AND token_id IS NULL`,
            [tokenId, row.id],
          );
          console.log(`OK  id=${row.id} token_id=${tokenId}`);
        }
        filled++;
      } catch (err) {
        console.error(`FAIL id=${row.id}:`, err instanceof Error ? err.message : err);
        failed++;
      }
    }

    console.log(`\nBackfill complete — filled: ${filled}, skipped: ${skipped}, failed: ${failed}`);
    if (failed > 0) process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
