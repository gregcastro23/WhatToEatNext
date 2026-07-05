/**
 * Chain reconciliation — heals every seam between the Postgres ledgers and
 * the Base (Sepolia) contracts. Four independent jobs, each safe to re-run:
 *
 * 1. settleStaleClaims — pending esms_onchain_claims older than 30min: if the
 *    contract says claimed(claimId), mark minted; otherwise re-send the mint
 *    (the contract's claimId uniqueness makes retries idempotent).
 * 2. healBurnedPurchases — one-time shop items burn against a DETERMINISTIC
 *    orderId (keccak of shop:<user>:<slug>:), so "burned on-chain but never
 *    granted" is directly discoverable: recompute ids for wallet-linked users'
 *    ungranted one-time items, read redeemedOrders(), grant what burned.
 * 3. checkWalletInvariants — per wallet: on-chain balance must never EXCEED
 *    the sum of ledger-minted claims (burns only decrease it). A violation
 *    means tokens were minted outside the ledger → loud alert, no auto-fix.
 * 4. backfillPendingNfts — recipe_nft_mints stuck in pending_chain (created
 *    before the registry deployed, or whose mint send died): re-attempt the
 *    sponsored mint from the stored commitments.
 *
 * Everything is capped per run and returns a summary the cron reports.
 */

import { keccak256, toHex, formatUnits } from "viem";
import { executeQuery } from "@/lib/database";
import {
  esmsOnchainConfigured,
  readEsmsBalances,
  readEsmsClaimed,
  readEsmsRedeemed,
} from "@/lib/esms-chain/contract";
import { mintEsmsClaim, minterConfigured } from "@/lib/esms-chain/minter";
import { recipeNftEnabled } from "@/lib/recipe-nft/contract";
import { defaultRecipient, mintRecipeOnChain } from "@/lib/recipe-nft/minter";
import { esmsOnchainClaimService } from "@/services/esmsOnchainClaimService";
import { getSelfBaseUrl } from "@/utils/urlUtils";
import type { Address, Hex } from "viem";

const EVM_ADDRESS = /^0x[0-9a-fA-F]{40}$/;
const HEX32 = /^0x[0-9a-fA-F]{64}$/;

export interface ClaimSettlerSummary {
  scanned: number;
  reconciled: number; // claimed() was already true — marked minted
  retried: number; // mint re-sent
  failures: number;
}

export interface BurnHealSummary {
  pairsChecked: number;
  healed: number; // burned on-chain, grant inserted
  failures: number;
}

export interface InvariantSummary {
  walletsChecked: number;
  violations: Array<{ wallet: string; coin: string; onchain: number; ledger: number }>;
  failures: number;
}

export interface NftBackfillSummary {
  scanned: number;
  minted: number;
  failures: number;
}

/** 1. Settle in-flight ESMS claims the request path lost track of. */
export async function settleStaleClaims(limit = 25): Promise<ClaimSettlerSummary> {
  const summary: ClaimSettlerSummary = { scanned: 0, reconciled: 0, retried: 0, failures: 0 };
  if (!esmsOnchainConfigured()) return summary;

  const stale = await esmsOnchainClaimService.listStalePending(30, limit);
  for (const claim of stale) {
    summary.scanned++;
    try {
      if (await readEsmsClaimed(claim.claimId)) {
        await esmsOnchainClaimService.markMinted(claim.id);
        summary.reconciled++;
        continue;
      }
      if (!minterConfigured() || !EVM_ADDRESS.test(claim.walletAddress)) {
        summary.failures++;
        continue;
      }
      // Not on-chain → re-send with the SAME claimId (contract-idempotent).
      // Confirmation is next run's job: claimed() flips once it mines.
      const txHash = await mintEsmsClaim({
        to: claim.walletAddress as Address,
        claimId: claim.claimId,
        amounts: {
          spirit: String(claim.amounts.spirit),
          essence: String(claim.amounts.essence),
          matter: String(claim.amounts.matter),
          substance: String(claim.amounts.substance),
        },
      });
      await esmsOnchainClaimService.recordTxHash(claim.id, txHash);
      summary.retried++;
    } catch (err) {
      summary.failures++;
      await esmsOnchainClaimService.recordError(
        claim.id,
        `reconcile: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
  return summary;
}

/** Deterministic one-time shop orderId — must mirror the purchase route. */
function oneTimeOrderId(userId: string, slug: string): Hex {
  return keccak256(toHex(`shop:${userId}:${slug}:`));
}

/** 2. Grant one-time purchases whose burn confirmed but whose grant was lost. */
export async function healBurnedPurchases(maxReads = 40): Promise<BurnHealSummary> {
  const summary: BurnHealSummary = { pairsChecked: 0, healed: 0, failures: 0 };
  if (!esmsOnchainConfigured()) return summary;

  let pairs: Array<{ user_id: string; slug: string; item_id: string }> = [];
  try {
    // Wallet-linked users × active one-time items they DON'T own. The hourly
    // hash shuffle rotates which slice of a large pair-space each run scans;
    // healed pairs drop out of the set, so the scan always makes progress.
    const res = await executeQuery<{ user_id: string; slug: string; item_id: string }>(
      `SELECT u.id AS user_id, si.slug, si.id AS item_id
       FROM users u
       CROSS JOIN shop_items si
       WHERE u.wallet_address IS NOT NULL
         AND si.is_active = true AND si.is_one_time = true
         AND NOT EXISTS (
           SELECT 1 FROM user_purchases up
           WHERE up.user_id = u.id AND up.shop_item_id = si.id
         )
       ORDER BY md5(u.id::text || si.slug || to_char(now(), 'YYYY-MM-DD-HH24'))
       LIMIT $1`,
      [Math.min(Math.max(maxReads, 1), 100)],
    );
    pairs = res.rows;
  } catch (err) {
    console.error("[chainReconcile] pair enumeration failed:", err);
    summary.failures++;
    return summary;
  }

  for (const pair of pairs) {
    summary.pairsChecked++;
    try {
      const burned = await readEsmsRedeemed(oneTimeOrderId(pair.user_id, pair.slug));
      if (!burned) continue;
      await executeQuery(
        `INSERT INTO user_purchases (user_id, shop_item_id, transaction_group_id)
         SELECT $1, $2, uuid_generate_v4()
         WHERE NOT EXISTS (
           SELECT 1 FROM user_purchases WHERE user_id = $1 AND shop_item_id = $2
         )`,
        [pair.user_id, pair.item_id],
      );
      summary.healed++;
    } catch {
      summary.failures++;
    }
  }
  return summary;
}

/** 3. On-chain balance must never exceed what the claim ledger minted. */
export async function checkWalletInvariants(maxWallets = 20): Promise<InvariantSummary> {
  const summary: InvariantSummary = { walletsChecked: 0, violations: [], failures: 0 };
  if (!esmsOnchainConfigured()) return summary;

  let rows: Array<{
    wallet_address: string;
    spirit: string;
    essence: string;
    matter: string;
    substance: string;
  }> = [];
  try {
    const res = await executeQuery<(typeof rows)[number]>(
      `SELECT u.wallet_address,
              COALESCE(SUM(c.spirit), 0) AS spirit,
              COALESCE(SUM(c.essence), 0) AS essence,
              COALESCE(SUM(c.matter), 0) AS matter,
              COALESCE(SUM(c.substance), 0) AS substance
       FROM users u
       LEFT JOIN esms_onchain_claims c
         ON c.user_id = u.id AND c.status = 'minted'
       WHERE u.wallet_address IS NOT NULL
       GROUP BY u.wallet_address
       LIMIT $1`,
      [Math.min(Math.max(maxWallets, 1), 100)],
    );
    rows = res.rows;
  } catch (err) {
    console.error("[chainReconcile] invariant enumeration failed:", err);
    summary.failures++;
    return summary;
  }

  const EPSILON = 0.0001;
  for (const row of rows) {
    if (!EVM_ADDRESS.test(row.wallet_address)) continue;
    summary.walletsChecked++;
    try {
      const onchain = await readEsmsBalances(row.wallet_address as Address);
      const chain = {
        spirit: Number(formatUnits(onchain.spirit, 18)),
        essence: Number(formatUnits(onchain.essence, 18)),
        matter: Number(formatUnits(onchain.matter, 18)),
        substance: Number(formatUnits(onchain.substance, 18)),
      };
      for (const coin of ["spirit", "essence", "matter", "substance"] as const) {
        const ledger = parseFloat(row[coin]) || 0;
        if (chain[coin] > ledger + EPSILON) {
          summary.violations.push({
            wallet: row.wallet_address,
            coin,
            onchain: chain[coin],
            ledger,
          });
        }
      }
    } catch {
      summary.failures++;
    }
  }
  return summary;
}

/** 4. Mint recipe NFTs recorded before the registry was live (or whose send died). */
export async function backfillPendingNfts(limit = 3): Promise<NftBackfillSummary> {
  const summary: NftBackfillSummary = { scanned: 0, minted: 0, failures: 0 };
  if (!recipeNftEnabled()) return summary;

  let rows: Array<{
    id: string;
    user_id: string;
    content_hash: string;
    computation_hash: string;
    ingredient_catalog_root: string;
    engine_version: number;
    metadata_uri: string | null;
  }> = [];
  try {
    const res = await executeQuery<(typeof rows)[number]>(
      `SELECT id, user_id, content_hash, computation_hash, ingredient_catalog_root,
              engine_version, metadata_uri
       FROM recipe_nft_mints
       WHERE status = 'pending_chain'
       ORDER BY created_at ASC
       LIMIT $1`,
      [Math.min(Math.max(limit, 1), 10)],
    );
    rows = res.rows;
  } catch (err) {
    console.error("[chainReconcile] pending-NFT scan failed:", err);
    summary.failures++;
    return summary;
  }

  const base = getSelfBaseUrl();
  for (const row of rows) {
    summary.scanned++;
    if (
      !HEX32.test(row.content_hash) ||
      !HEX32.test(row.computation_hash) ||
      !HEX32.test(row.ingredient_catalog_root)
    ) {
      summary.failures++;
      continue;
    }
    try {
      // Recipient wasn't stored at record time — resolve the user's CURRENT
      // wallet, falling back to rights-holder custody (the claim-mint model).
      let recipient: Address = defaultRecipient();
      const walletRes = await executeQuery<{ wallet_address: string | null }>(
        "SELECT wallet_address FROM users WHERE id = $1",
        [row.user_id],
      );
      const wallet = walletRes.rows[0]?.wallet_address;
      if (wallet && EVM_ADDRESS.test(wallet)) recipient = wallet as Address;

      const result = await mintRecipeOnChain({
        recipient,
        commitments: {
          contentHash: row.content_hash as Hex,
          computationHash: row.computation_hash as Hex,
          ingredientCatalogRoot: row.ingredient_catalog_root as Hex,
        },
        engineVersion: row.engine_version,
        contentURI: `${base}/api/recipes/nft/content/${row.content_hash}`,
        metadataURI: row.metadata_uri || `${base}/api/recipes/nft/metadata/${row.content_hash}`,
      });

      if (result.status === "minted" && result.txHash) {
        await executeQuery(
          `UPDATE recipe_nft_mints
           SET status = 'minted', chain = $2, token_id = $3, tx_hash = $4, minted_at = now()
           WHERE id = $1 AND status = 'pending_chain'`,
          [row.id, result.chain ?? null, result.tokenId ?? null, result.txHash],
        );
        summary.minted++;
      } else {
        summary.failures++;
      }
    } catch {
      summary.failures++;
    }
  }
  return summary;
}
