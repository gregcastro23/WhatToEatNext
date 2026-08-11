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

export interface LedgerDriftStatus {
  /** Users whose materialized balance differs from their ledger sum. */
  driftedUsers: number;
  /** Largest absolute per-axis divergence found, in token units. */
  maxAbsDelta: number;
  /** Users compared (rows in token_balances). */
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

/**
 * NOT YET WIRED — skeleton returning the honest degraded state. The
 * implementation executes the ledger-drift, welcome-grant-coverage, and
 * pending-claims statements from `tokenEconomyQueries.ts`.
 */
export async function getEconomyIntegrity(): Promise<EconomyIntegrityData> {
  return {
    drift: { driftedUsers: 0, maxAbsDelta: 0, checkedUsers: 0, live: false },
    welcomeGrant: { humansWithoutGrant: 0, live: false },
    onchainClaims: { pending: 0, oldestPendingHours: null, live: false },
    generatedAt: new Date().toISOString(),
  };
}
