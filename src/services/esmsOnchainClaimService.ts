/**
 * Persistence for ESMS on-chain claims — the bridge ledger that moves a user's
 * off-chain earned balance onto the soulbound EsmsToken (Base) via claimMint.
 *
 * Lifecycle: pending (off-chain debit committed, mint in flight/retryable) →
 * minted (claimMint confirmed) | refunded (permanently failed, debit re-credited).
 * claim_id is the bytes32 the CONTRACT enforces uniqueness on, so any pending
 * row can always be reconciled against readEsmsClaimed(claim_id) — retries never
 * double-mint and an interrupted request never strands tokens.
 */

import { randomUUID } from "crypto";
import { keccak256, toHex } from "viem";
import { executeQuery } from "@/lib/database";
import type { Hex } from "viem";

export interface EsmsClaimAmounts {
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
}

export interface EsmsOnchainClaim {
  id: string;
  userId: string;
  walletAddress: string;
  claimId: Hex;
  amounts: EsmsClaimAmounts;
  status: "pending" | "minted" | "refunded";
  txHash: string | null;
  error: string | null;
  transactionGroupId: string | null;
  createdAt: string;
}

interface ClaimRow {
  id: string;
  user_id: string;
  wallet_address: string;
  claim_id: string;
  spirit: string;
  essence: string;
  matter: string;
  substance: string;
  status: "pending" | "minted" | "refunded";
  tx_hash: string | null;
  error: string | null;
  transaction_group_id: string | null;
  created_at: string;
}

function rowToClaim(row: ClaimRow): EsmsOnchainClaim {
  return {
    id: row.id,
    userId: row.user_id,
    walletAddress: row.wallet_address,
    claimId: row.claim_id as Hex,
    amounts: {
      spirit: parseFloat(row.spirit) || 0,
      essence: parseFloat(row.essence) || 0,
      matter: parseFloat(row.matter) || 0,
      substance: parseFloat(row.substance) || 0,
    },
    status: row.status,
    txHash: row.tx_hash,
    error: row.error,
    transactionGroupId: row.transaction_group_id,
    createdAt: row.created_at,
  };
}

/** Deterministic bytes32 claim id for a claim row (the on-chain idempotency key). */
export function deriveClaimId(claimRowId: string): Hex {
  return keccak256(toHex(`esms-claim:${claimRowId}`));
}

export const esmsOnchainClaimService = {
  /**
   * Open a new pending claim. Returns null on DB error — including the partial
   * unique index rejecting a second in-flight claim for the same user (the
   * caller should reconcile the existing pending claim instead).
   */
  async createPending(input: {
    userId: string;
    walletAddress: string;
    amounts: EsmsClaimAmounts;
  }): Promise<EsmsOnchainClaim | null> {
    const id = randomUUID();
    const claimId = deriveClaimId(id);
    try {
      const res = await executeQuery<ClaimRow>(
        `INSERT INTO esms_onchain_claims
           (id, user_id, wallet_address, claim_id, spirit, essence, matter, substance)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          id,
          input.userId,
          input.walletAddress,
          claimId,
          input.amounts.spirit,
          input.amounts.essence,
          input.amounts.matter,
          input.amounts.substance,
        ],
      );
      return res.rows[0] ? rowToClaim(res.rows[0]) : null;
    } catch (err) {
      console.error("[esmsOnchainClaimService] createPending failed:", err);
      return null;
    }
  },

  /**
   * All in-flight claims older than `minAgeMinutes`, oldest first — the
   * reconcile cron's worklist. Fresh claims are skipped so the cron never
   * races a request that is still confirming its own mint.
   */
  async listStalePending(minAgeMinutes = 30, limit = 25): Promise<EsmsOnchainClaim[]> {
    try {
      const res = await executeQuery<ClaimRow>(
        `SELECT * FROM esms_onchain_claims
         WHERE status = 'pending'
           AND updated_at < now() - ($1 || ' minutes')::interval
         ORDER BY created_at ASC LIMIT $2`,
        [String(Math.max(1, minAgeMinutes)), Math.min(Math.max(limit, 1), 100)],
      );
      return res.rows.map(rowToClaim);
    } catch (err) {
      console.error("[esmsOnchainClaimService] listStalePending failed:", err);
      return [];
    }
  },

  /** The user's single in-flight claim, if any. */
  async findPending(userId: string): Promise<EsmsOnchainClaim | null> {
    try {
      const res = await executeQuery<ClaimRow>(
        `SELECT * FROM esms_onchain_claims
         WHERE user_id = $1 AND status = 'pending'
         ORDER BY created_at DESC LIMIT 1`,
        [userId],
      );
      return res.rows[0] ? rowToClaim(res.rows[0]) : null;
    } catch (err) {
      console.error("[esmsOnchainClaimService] findPending failed:", err);
      return null;
    }
  },

  /** Recent claim history for the wallet panel. */
  async listRecent(userId: string, limit = 10): Promise<EsmsOnchainClaim[]> {
    try {
      const res = await executeQuery<ClaimRow>(
        `SELECT * FROM esms_onchain_claims
         WHERE user_id = $1
         ORDER BY created_at DESC LIMIT $2`,
        [userId, Math.min(Math.max(limit, 1), 50)],
      );
      return res.rows.map(rowToClaim);
    } catch (err) {
      console.error("[esmsOnchainClaimService] listRecent failed:", err);
      return [];
    }
  },

  /** Attach the off-chain debit's transaction group to the claim row. */
  async attachDebit(id: string, transactionGroupId: string): Promise<void> {
    try {
      await executeQuery(
        `UPDATE esms_onchain_claims
         SET transaction_group_id = $2, updated_at = now()
         WHERE id = $1`,
        [id, transactionGroupId],
      );
    } catch (err) {
      console.error("[esmsOnchainClaimService] attachDebit failed:", err);
    }
  },

  /** Record a mint tx hash while it confirms (row stays pending until verified). */
  async recordTxHash(id: string, txHash: string): Promise<void> {
    try {
      await executeQuery(
        `UPDATE esms_onchain_claims
         SET tx_hash = $2, error = NULL, updated_at = now()
         WHERE id = $1`,
        [id, txHash],
      );
    } catch (err) {
      console.error("[esmsOnchainClaimService] recordTxHash failed:", err);
    }
  },

  async markMinted(id: string, txHash?: string | null): Promise<void> {
    try {
      await executeQuery(
        `UPDATE esms_onchain_claims
         SET status = 'minted', tx_hash = COALESCE($2, tx_hash), error = NULL, updated_at = now()
         WHERE id = $1`,
        [id, txHash ?? null],
      );
    } catch (err) {
      console.error("[esmsOnchainClaimService] markMinted failed:", err);
    }
  },

  /** Keep the row pending (retryable) but remember why the last attempt failed. */
  async recordError(id: string, error: string): Promise<void> {
    try {
      await executeQuery(
        `UPDATE esms_onchain_claims
         SET error = $2, updated_at = now()
         WHERE id = $1`,
        [id, error.slice(0, 1000)],
      );
    } catch (err) {
      console.error("[esmsOnchainClaimService] recordError failed:", err);
    }
  },

  /** Close a claim whose debit was re-credited (only for never-mined claims). */
  async markRefunded(id: string, error: string): Promise<void> {
    try {
      await executeQuery(
        `UPDATE esms_onchain_claims
         SET status = 'refunded', error = $2, updated_at = now()
         WHERE id = $1 AND status = 'pending'`,
        [id, error.slice(0, 1000)],
      );
    } catch (err) {
      console.error("[esmsOnchainClaimService] markRefunded failed:", err);
    }
  },
};
