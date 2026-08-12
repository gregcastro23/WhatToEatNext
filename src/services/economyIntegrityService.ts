/**
 * Economy integrity — invariant checks over the token ledger.
 *
 * Three watched invariants, each of which has actually broken in production:
 *  - drift: `token_balances` is documented as rebuildable from the immutable
 *    `token_transactions` ledger; a 67-user / 521.7-Spirit divergence has
 *    happened. This compares the materialized balances to per-axis ledger sums.
 *  - welcomeGrant: #744 moved the signup grant to user creation, but humans
 *    created before the fix can still hold no `signup_grant` row.
 *  - onchainClaims: `esms_onchain_claims` rows stuck in `pending` mean a user
 *    was debited off-chain with no confirmed mint — retryable, but only if
 *    someone can see the backlog.
 *
 * SQL lives in `tokenEconomyQueries.ts` (the zero-import module) so the
 * PREPARE gate validates every statement against a real PostgreSQL.
 *
 * Honesty contract: each sub-check degrades independently to `live: false`
 * with zeroed values — the panel renders absence, never a fabricated zero.
 *
 * @file src/services/economyIntegrityService.ts
 */

import { executeQuery } from "@/lib/database";
import { _logger } from "@/lib/logger";
import {
  ledgerDriftSql,
  onchainClaimBacklogSql,
  welcomeGrantCoverageSql,
} from "@/services/tokenEconomyQueries";

export interface LedgerDriftStatus {
  /** Users whose materialized balance differs from their ledger sum. */
  driftedUsers: number;
  /** Largest absolute per-axis divergence found, in token units. */
  maxAbsDelta: number;
  /** Distinct users compared — the union of balance-row holders and ledger
   *  users, so a user missing from either side is still checked. */
  checkedUsers: number;
  live: boolean;
}

export interface WelcomeGrantCoverage {
  /** Human users holding no `signup_grant` ledger row — should trend to 0. */
  humansWithoutGrant: number;
  live: boolean;
}

export interface OnchainClaimBacklog {
  /** Claims stuck in `pending` (debited off-chain, mint unconfirmed). */
  pending: number;
  /** Age of the oldest pending claim in hours, null when none pending. */
  oldestPendingHours: number | null;
  live: boolean;
}

export interface EconomyIntegrityData {
  drift: LedgerDriftStatus;
  welcomeGrant: WelcomeGrantCoverage;
  onchainClaims: OnchainClaimBacklog;
  generatedAt: string;
}

async function checkLedgerDrift(): Promise<LedgerDriftStatus> {
  try {
    const { sql, values } = ledgerDriftSql();
    const res = await executeQuery(sql, values);
    const row = res.rows[0] as
      | { drifted_users: number; max_abs_delta: number; checked_users: number }
      | undefined;
    return {
      driftedUsers: Number(row?.drifted_users ?? 0),
      maxAbsDelta: Number(row?.max_abs_delta ?? 0),
      checkedUsers: Number(row?.checked_users ?? 0),
      live: true,
    };
  } catch (error) {
    _logger.error("[economyIntegrity] ledger-drift check failed:", error);
    return { driftedUsers: 0, maxAbsDelta: 0, checkedUsers: 0, live: false };
  }
}

async function checkWelcomeGrantCoverage(): Promise<WelcomeGrantCoverage> {
  try {
    const { sql, values } = welcomeGrantCoverageSql();
    const res = await executeQuery(sql, values);
    const row = res.rows[0] as { humans_without_grant: number } | undefined;
    return {
      humansWithoutGrant: Number(row?.humans_without_grant ?? 0),
      live: true,
    };
  } catch (error) {
    _logger.error("[economyIntegrity] welcome-grant check failed:", error);
    return { humansWithoutGrant: 0, live: false };
  }
}

async function checkOnchainClaimBacklog(): Promise<OnchainClaimBacklog> {
  try {
    const { sql, values } = onchainClaimBacklogSql();
    const res = await executeQuery(sql, values);
    const row = res.rows[0] as
      | { pending: number; oldest_pending_hours: number | null }
      | undefined;
    // MIN() over zero pending rows is SQL NULL — keep it null. Coercing with
    // Number() would fabricate "oldest claim: 0h" out of an empty backlog.
    const oldest = row?.oldest_pending_hours;
    return {
      pending: Number(row?.pending ?? 0),
      oldestPendingHours: oldest === null || oldest === undefined ? null : Number(oldest),
      live: true,
    };
  } catch (error) {
    _logger.error("[economyIntegrity] onchain-claims check failed:", error);
    return { pending: 0, oldestPendingHours: null, live: false };
  }
}

/**
 * Run all three invariant checks. Each degrades independently — one failed
 * query flips only its own `live` flag, never the siblings'.
 */
export async function getEconomyIntegrity(): Promise<EconomyIntegrityData> {
  const [drift, welcomeGrant, onchainClaims] = await Promise.all([
    checkLedgerDrift(),
    checkWelcomeGrantCoverage(),
    checkOnchainClaimBacklog(),
  ]);
  return {
    drift,
    welcomeGrant,
    onchainClaims,
    generatedAt: new Date().toISOString(),
  };
}
