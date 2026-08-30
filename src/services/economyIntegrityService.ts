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
import { esmsCaip2 } from "@/lib/esms-chain/contract";
import {
  esmsSplCluster,
  esmsSplMintAddress,
  esmsSplMirrorEnabled,
  type SplCoinKey,
} from "@/lib/esms-chain/solanaMirror";
import { _logger } from "@/lib/logger";
import {
  ledgerDriftSql,
  onchainClaimBacklogSql,
  solanaMintedSupplySql,
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

export type SolanaCluster = "devnet" | "mainnet-beta";
export type SupplyAtoms = Record<SplCoinKey, bigint>;

export interface SolanaSupplyViolation {
  token: SplCoinKey;
  onchainAtoms: string;
  ledgerAtoms: string;
}

export interface SolanaSupplyInvariant {
  cluster: SolanaCluster;
  enabled: boolean;
  live: boolean;
  onchainAtoms: Record<SplCoinKey, string> | null;
  ledgerAtoms: Record<SplCoinKey, string> | null;
  violations: SolanaSupplyViolation[];
}

export interface EconomyIntegrityData {
  drift: LedgerDriftStatus;
  welcomeGrant: WelcomeGrantCoverage;
  onchainClaims: OnchainClaimBacklog;
  solanaSupply: SolanaSupplyInvariant;
  generatedAt: string;
}

const SPL_COINS: readonly SplCoinKey[] = [
  "spirit",
  "essence",
  "matter",
  "substance",
];

const SOLANA_RPC_URLS: Record<SolanaCluster, string> = {
  devnet: "https://api.devnet.solana.com",
  "mainnet-beta": "https://api.mainnet-beta.solana.com",
};

type SolanaSupplyReader = (
  cluster: SolanaCluster,
  mints: Record<SplCoinKey, string>,
) => Promise<SupplyAtoms>;

function decimalToAtoms(value: unknown): bigint {
  const text = typeof value === "string" || typeof value === "number"
    ? String(value)
    : "0";
  if (!/^\d+(?:\.\d{1,4})?$/.test(text)) {
    throw new Error(`invalid 4-decimal ledger supply: ${text}`);
  }
  const separator = text.indexOf(".");
  const whole = separator === -1 ? text : text.slice(0, separator);
  const fraction = separator === -1 ? "" : text.slice(separator + 1);
  return BigInt(whole) * 10_000n + BigInt(fraction.padEnd(4, "0") || "0");
}

async function readSolanaSupplies(
  cluster: SolanaCluster,
  mints: Record<SplCoinKey, string>,
): Promise<SupplyAtoms> {
  const configuredUrl = cluster === "mainnet-beta"
    ? process.env.SOLANA_MAINNET_RPC_URL
    : process.env.SOLANA_DEVNET_RPC_URL;
  const rpcUrl = configuredUrl ?? SOLANA_RPC_URLS[cluster];
  const entries = await Promise.all(
    SPL_COINS.map(async (coin) => {
      const response = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: `wten-supply-${coin}`,
          method: "getTokenSupply",
          params: [mints[coin]],
        }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) throw new Error(`Solana RPC returned HTTP ${response.status}`);
      const payload: unknown = await response.json();
      if (typeof payload !== "object" || payload === null) {
        throw new Error("Solana RPC returned a non-object supply payload");
      }
      const { result } = payload as { result?: unknown };
      if (typeof result !== "object" || result === null) {
        throw new Error("Solana RPC supply result is missing");
      }
      const { value } = result as { value?: unknown };
      if (typeof value !== "object" || value === null) {
        throw new Error("Solana RPC supply value is missing");
      }
      const { amount, decimals } = value as {
        amount?: unknown;
        decimals?: unknown;
      };
      if (typeof amount !== "string" || !/^\d+$/.test(amount) || decimals !== 4) {
        throw new Error("Solana RPC supply is not an exact 4-decimal atom count");
      }
      return [coin, BigInt(amount)] as const;
    }),
  );
  return Object.fromEntries(entries) as SupplyAtoms;
}

/** Exact aggregate upper-bound check: one Solana atom over ledger is a violation. */
export async function checkSolanaSupplyInvariants(
  cluster: SolanaCluster,
  readSupply: SolanaSupplyReader = readSolanaSupplies,
): Promise<SolanaSupplyInvariant> {
  const empty: SolanaSupplyInvariant = {
    cluster,
    enabled: false,
    live: true,
    onchainAtoms: null,
    ledgerAtoms: null,
    violations: [],
  };
  if (!esmsSplMirrorEnabled() || esmsSplCluster() !== cluster) return empty;

  const mintEntries = SPL_COINS.map((coin) => [coin, esmsSplMintAddress(coin)] as const);
  if (mintEntries.some(([, mint]) => mint === undefined)) return empty;
  const mints = Object.fromEntries(mintEntries) as Record<SplCoinKey, string>;

  try {
    const { sql, values } = solanaMintedSupplySql(`solana:${cluster}`);
    const [ledgerResult, onchain] = await Promise.all([
      executeQuery(sql, values),
      readSupply(cluster, mints),
    ]);
    const row = ledgerResult.rows.at(0) as Record<string, unknown> | undefined;
    const ledger = Object.fromEntries(
      SPL_COINS.map((coin) => [coin, decimalToAtoms(row?.[coin])]),
    ) as SupplyAtoms;
    const violations = SPL_COINS.flatMap((token) =>
      onchain[token] > ledger[token]
        ? [{
            token,
            onchainAtoms: onchain[token].toString(),
            ledgerAtoms: ledger[token].toString(),
          }]
        : [],
    );
    if (violations.length > 0) {
      _logger.error("[economyIntegrity] Solana supply exceeds ledger backing", {
        cluster,
        violations,
      });
    }
    return {
      cluster,
      enabled: true,
      live: true,
      onchainAtoms: Object.fromEntries(
        SPL_COINS.map((coin) => [coin, onchain[coin].toString()]),
      ) as Record<SplCoinKey, string>,
      ledgerAtoms: Object.fromEntries(
        SPL_COINS.map((coin) => [coin, ledger[coin].toString()]),
      ) as Record<SplCoinKey, string>,
      violations,
    };
  } catch (error) {
    _logger.error("[economyIntegrity] Solana supply invariant failed:", error);
    return { ...empty, enabled: true, live: false };
  }
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
          r.created_at === null
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
    const rail = esmsCaip2();
    const { sql, values } = onchainClaimBacklogSql(rail);
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
    const [drift, welcomeGrant, onchainClaims, solanaSupply] = await Promise.all([
      checkLedgerDrift(),
      checkWelcomeGrantCoverage(),
      checkOnchainClaimBacklog(),
      checkSolanaSupplyInvariants(esmsSplCluster()),
    ]);
    const payload: EconomyIntegrityData = {
      drift,
      welcomeGrant,
      onchainClaims,
      solanaSupply,
      generatedAt: new Date().toISOString(),
    };
    if (
      !drift.live ||
      !welcomeGrant.live ||
      !onchainClaims.live ||
      (solanaSupply.enabled && !solanaSupply.live)
    ) {
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
