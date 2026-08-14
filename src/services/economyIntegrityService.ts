/**
 * Economy integrity — invariant checks over the token ledger.
 *
 * Three watched invariants, each of which has actually broken in production:
 *  - drift: `token_balances` is documented as rebuildable from the immutable
 *    `token_transactions` ledger; a 67-user / 521.7-Spirit divergence has
 *    happened. This compares the materialized balances to per-axis ledger sums.
 *  - welcomeGrant: #744 moved the signup grant to user creation, but humans
 *    created before the fix can still hold no grant row at all. Both spellings
 *    of the grant count as covered — see `welcomeGrantCoverageSql`. The check
 *    also NAMES the users behind a non-zero count; a bare number left the
 *    operator with nothing to act on but an unfiltered user list.
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

import { memoize } from "@/lib/cache/memoryCache";
import { executeQuery } from "@/lib/database";
import { _logger } from "@/lib/logger";
import {
  ledgerDriftSql,
  onchainClaimBacklogSql,
  welcomeGrantCoverageSql,
  welcomeGrantMissingUsersSql,
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

/** One ungranted user, named so the count can be acted on. */
export interface MissingGrantUser {
  id: string;
  /** Nullable in the schema; the panel falls back to the id. */
  email: string | null;
  /** ISO 8601, or null when the row predates a populated `created_at`. */
  createdAt: string | null;
}

export interface WelcomeGrantCoverage {
  /** Non-agent users holding no welcome grant under EITHER spelling
   *  (`signup_grant`, or its closed-set predecessor `initial_grant`).
   *  0 in production as of 2026-08-13; a non-zero value is a real miss. */
  humansWithoutGrant: number;
  /** WHO those users are, newest first, capped at
   *  `WELCOME_GRANT_SAMPLE_LIMIT`. Necessarily empty when the count is 0.
   *
   *  Truncation needs no separate field: `humansWithoutGrant - missing.length`
   *  is exactly how many went unnamed, and stays correct if the cap changes.
   *
   *  Empty while the count is NON-zero means the identity query failed, and
   *  the panel says so — distinguishable from the count alone, which is why
   *  this needs no separate `live` flag either. */
  missing: MissingGrantUser[];
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
  const empty = { missing: [] as MissingGrantUser[] };
  let humansWithoutGrant: number;
  try {
    const { sql, values } = welcomeGrantCoverageSql();
    const res = await executeQuery(sql, values);
    const row = res.rows[0] as { humans_without_grant: number } | undefined;
    humansWithoutGrant = Number(row?.humans_without_grant ?? 0);
  } catch (error) {
    _logger.error("[economyIntegrity] welcome-grant check failed:", error);
    return { humansWithoutGrant: 0, ...empty, live: false };
  }

  // The alarm is already answered when nobody is missing a grant, and the
  // sample would be empty by construction — so don't spend a second query on
  // the healthy case, which is every poll in a healthy production.
  if (humansWithoutGrant === 0) {
    return { humansWithoutGrant, ...empty, live: true };
  }

  try {
    const { sql, values } = welcomeGrantMissingUsersSql();
    const res = await executeQuery(sql, values);
    const rows = res.rows as Array<{
      id: string;
      email: string | null;
      created_at: Date | string | null;
    }>;
    return {
      humansWithoutGrant,
      missing: rows.map((r) => ({
        id: String(r.id),
        email: r.email ?? null,
        createdAt:
          r.created_at === null || r.created_at === undefined
            ? null
            : new Date(r.created_at).toISOString(),
      })),
      live: true,
    };
  } catch (error) {
    // The count survived, so the alarm still fires with a real number — only
    // the names are missing. Degrading the whole check to `live: false` here
    // would hide a genuine miss behind "unreadable".
    _logger.error("[economyIntegrity] welcome-grant identities failed:", error);
    return { humansWithoutGrant, ...empty, live: true };
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
 * Invariants change on write-path bugs, not poll-to-poll — but the drift
 * check aggregates the ENTIRE ledger (no time bound can exist for a
 * balance-vs-ledger comparison), which is far too heavy to re-run on the
 * dashboard's 5s-memoized 30s poll cadence. 10 minutes bounds the scan to
 * ~6/hour per instance. A payload with any degraded sub-check is NOT
 * cached, so an outage can't pin `live: false` for the TTL.
 */
const INTEGRITY_CACHE_TTL_MS = 10 * 60 * 1000;

/**
 * Run all three invariant checks. Each degrades independently — one failed
 * query flips only its own `live` flag, never the siblings'.
 */
export async function getEconomyIntegrity(): Promise<EconomyIntegrityData> {
  return memoize("economy-integrity", INTEGRITY_CACHE_TTL_MS, async () => {
    const [drift, welcomeGrant, onchainClaims] = await Promise.all([
      checkLedgerDrift(),
      checkWelcomeGrantCoverage(),
      checkOnchainClaimBacklog(),
    ]);
    const payload: EconomyIntegrityData = {
      drift,
      welcomeGrant,
      onchainClaims,
      generatedAt: new Date().toISOString(),
    };
    if (!drift.live || !welcomeGrant.live || !onchainClaims.live) {
      // Degraded payloads must not be pinned for the TTL — surface once and
      // let the next poll retry the real queries.
      throw new DegradedIntegrityPayload(payload);
    }
    return payload;
  }).catch((err) => {
    if (err instanceof DegradedIntegrityPayload) return err.payload;
    throw err;
  });
}

/** Carrier that lets a degraded payload escape the memoize without being cached. */
class DegradedIntegrityPayload extends Error {
  constructor(readonly payload: EconomyIntegrityData) {
    super("economy integrity degraded — not cached");
  }
}
