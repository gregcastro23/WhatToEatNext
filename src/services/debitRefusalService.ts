/**
 * Why `POST /api/economy/sync-debit` answered 402, counted per UTC hour and reason.
 *
 * `request_log_entries` stores the status of a sync-debit call but never the reason, and has no
 * user id for the route, so "79% of debits are refused" could not be told apart from a bug. The
 * route knows which of five things refused the debit; this keeps that answer (migration 107) as
 * aggregates only: no user id, no email, no per-call amounts.
 *
 * Counting starts when the writer deploys. Hours before `recordingSince` are unmeasured, not
 * zero, and the report says so instead of showing a total that looks like it covers them.
 *
 * @file src/services/debitRefusalService.ts
 */

import type { AssertTrue, ServerSatisfies } from "@/lib/admin/schemas/drift";
import { executeQuery } from "@/lib/database";
import type { AutoSwapRefusalReason } from "@/lib/economy/swappingBridge";
import { _logger } from "@/lib/logger";
import type { AxisAmounts } from "@/services/tokenEconomyQueries";

/**
 * Every way a sync-debit can end in 402. The first three are the Swapping Bridge's own reasons
 * (`AutoSwapRefusalReason`); the last two are refusals the bridge never sees: the caller opted out
 * of auto-swap, or a concurrent debit took the balance after the row was read.
 *
 * Keep in lockstep with the CHECK in database/init/107-economy-debit-refusals.sql; a test
 * compares the two lists.
 */
export const DEBIT_REFUSAL_REASONS = [
  "insufficient_value",
  "rates_unavailable",
  "no_balance",
  "auto_swap_off",
  "lost_race",
] as const;

export type DebitRefusalReason = (typeof DEBIT_REFUSAL_REASONS)[number];

// Compile-time: a reason the bridge adds must be added above, or this line fails `tsc`.
type _BridgeReasonsAreCovered = AssertTrue<ServerSatisfies<AutoSwapRefusalReason, DebitRefusalReason>>;

/** What sync-debit hands over about one refused call. */
export interface DebitRefusal {
  reason: DebitRefusalReason;
  /** The payer's balances at the moment of refusal. */
  balances: AxisAmounts;
  /** Uncovered value in tokens at index 1.0; null when no swap plan was computed. */
  shortfallValue: number | null;
}

/** The shape of a refused outcome inside sync-debit's transaction. */
export interface RefusedOutcome {
  cause: DebitRefusalReason;
  balances: AxisAmounts;
  autoSwap?: { shortfallValue: number | null } | null;
}

export function toDebitRefusal(outcome: RefusedOutcome): DebitRefusal {
  return {
    reason: outcome.cause,
    balances: outcome.balances,
    shortfallValue: outcome.autoSwap ? outcome.autoSwap.shortfallValue : null,
  };
}

const HOUR_MS = 3_600_000;

/** The UTC hour a moment falls in, as an ISO string (whole hours only; no time-zone dependence). */
export function hourBucket(nowMs: number): string {
  return new Date(Math.floor(nowMs / HOUR_MS) * HOUR_MS).toISOString();
}

export const RECORD_DEBIT_REFUSAL_SQL = `INSERT INTO economy_debit_refusals
       (hour, reason, refusals, empty_basket, shortfall_value_sum, shortfall_value_n)
     VALUES ($1::timestamptz, $2::text, 1, $3::int, $4::numeric, $5::int)
     ON CONFLICT (hour, reason) DO UPDATE SET
       refusals = economy_debit_refusals.refusals + 1,
       empty_basket = economy_debit_refusals.empty_basket + EXCLUDED.empty_basket,
       shortfall_value_sum = economy_debit_refusals.shortfall_value_sum + EXCLUDED.shortfall_value_sum,
       shortfall_value_n = economy_debit_refusals.shortfall_value_n + EXCLUDED.shortfall_value_n,
       updated_at = NOW()`;

function isEmptyBasket(b: AxisAmounts): boolean {
  return b.spirit <= 0 && b.essence <= 0 && b.matter <= 0 && b.substance <= 0;
}

/** Postgres puts its SQLSTATE on `code`; 42P01 is undefined_table. */
const UNDEFINED_TABLE = "42P01";

function pgCode(error: unknown): string | undefined {
  return typeof error === "object" && error !== null && "code" in error && typeof error.code === "string"
    ? error.code
    : undefined;
}

let missingTableLogged = false;

/** Forget that the missing-table error was logged. Exclusively for unit tests. */
export function resetMissingTableLog(): void {
  missingTableLogged = false;
}

/**
 * Count one refused debit. Callers run it through `runAfterResponse`, which logs a failure and
 * keeps it from reaching the debit's response. One failure is handled here: the table not
 * existing (42P01, the code deployed before migration 107 ran) would otherwise log an error for
 * each of the ~70 refusals an hour, so it is logged once per process, as an error, and counting
 * resumes by itself once the table exists.
 */
export async function recordDebitRefusal(refusal: DebitRefusal, nowMs: number = Date.now()): Promise<void> {
  const measured = typeof refusal.shortfallValue === "number" && Number.isFinite(refusal.shortfallValue);
  try {
    await executeQuery(RECORD_DEBIT_REFUSAL_SQL, [
      hourBucket(nowMs),
      refusal.reason,
      isEmptyBasket(refusal.balances) ? 1 : 0,
      measured ? Math.max(0, refusal.shortfallValue ?? 0) : 0,
      measured ? 1 : 0,
    ]);
  } catch (error) {
    if (pgCode(error) !== UNDEFINED_TABLE) throw error;
    if (!missingTableLogged) {
      missingTableLogged = true;
      _logger.error("[debit-refusals] economy_debit_refusals is missing (migration 107 has not run): refusals are not being counted");
    }
  }
}

// ─── Reading ─────────────────────────────────────────────────────────────────

/**
 * Default window: one week (168 h). It is the window the 2026-11-23 investigation measured, and
 * it covers the daily funding cycle seven times, so a time-of-day pattern shows up as a pattern.
 */
export const DEFAULT_WINDOW_HOURS = 168;
/** Longest window the endpoint serves: 30 days, a bound on rows read (30 x 24 x 5 = 3,600). */
export const MAX_WINDOW_HOURS = 720;

export interface DebitRefusalReasonRow {
  reason: string;
  refusals: number;
  /** Of `refusals`, those from a payer holding nothing on any axis. */
  emptyBasket: number;
  /** Mean uncovered value over the refusals that had one; null when none did. */
  meanShortfallValue: number | null;
  /** How many refusals the mean is over (only 'insufficient_value' computes a shortfall). */
  shortfallKnown: number;
}

export interface DebitRefusalHour {
  hour: string;
  refusals: number;
  emptyBasket: number;
}

export interface DebitRefusalReport {
  /** False when the table could not be read: nothing below is a measurement then. */
  live: boolean;
  /** Why `live` is false; null otherwise. */
  note: string | null;
  generatedAt: string;
  windowHours: number;
  /** First hour with any recorded refusal; hours before it are unmeasured, not zero. Null when none yet. */
  recordingSince: string | null;
  total: number;
  emptyBasket: number;
  byReason: DebitRefusalReasonRow[];
  /** Oldest first; an hour with no refusal is absent, not zero. */
  byHour: DebitRefusalHour[];
}

export interface RefusalHourRow {
  hour: Date | string;
  reason: string;
  refusals: number;
  empty_basket: number;
  shortfall_value_sum: number;
  shortfall_value_n: number;
}

export const READ_DEBIT_REFUSALS_SQL = `SELECT hour, reason, refusals, empty_basket,
       shortfall_value_sum::float8 AS shortfall_value_sum, shortfall_value_n
  FROM economy_debit_refusals
 WHERE hour >= $1::timestamptz
 ORDER BY hour, reason`;

export const FIRST_REFUSAL_HOUR_SQL = `SELECT MIN(hour) AS first_hour FROM economy_debit_refusals`;

const iso = (v: Date | string): string => (v instanceof Date ? v.toISOString() : new Date(v).toISOString());

/** Pure: fold the hourly rows into the report. Kept free of the database so it is tested directly. */
export function buildReport(
  rows: readonly RefusalHourRow[],
  firstHour: Date | string | null,
  windowHours: number,
  generatedAtMs: number,
): DebitRefusalReport {
  const reasons = new Map<string, { n: number; empty: number; sum: number; known: number }>();
  const hours = new Map<string, DebitRefusalHour>();
  for (const r of rows) {
    const agg = reasons.get(r.reason) ?? { n: 0, empty: 0, sum: 0, known: 0 };
    agg.n += r.refusals;
    agg.empty += r.empty_basket;
    agg.sum += r.shortfall_value_sum;
    agg.known += r.shortfall_value_n;
    reasons.set(r.reason, agg);
    const key = iso(r.hour);
    const h = hours.get(key) ?? { hour: key, refusals: 0, emptyBasket: 0 };
    h.refusals += r.refusals;
    h.emptyBasket += r.empty_basket;
    hours.set(key, h);
  }
  const byReason = [...reasons.entries()]
    .map(([reason, a]) => ({
      reason,
      refusals: a.n,
      emptyBasket: a.empty,
      meanShortfallValue: a.known > 0 ? a.sum / a.known : null,
      shortfallKnown: a.known,
    }))
    .sort((a, b) => b.refusals - a.refusals || a.reason.localeCompare(b.reason));
  return {
    live: true,
    note: null,
    generatedAt: new Date(generatedAtMs).toISOString(),
    windowHours,
    recordingSince: firstHour === null ? null : iso(firstHour),
    total: byReason.reduce((s, r) => s + r.refusals, 0),
    emptyBasket: byReason.reduce((s, r) => s + r.emptyBasket, 0),
    byReason,
    byHour: [...hours.values()].sort((a, b) => a.hour.localeCompare(b.hour)),
  };
}

/** Clamp a requested window to whole hours in [1, MAX_WINDOW_HOURS]; anything unusable is the default. */
export function clampWindowHours(requested: number | null | undefined): number {
  if (typeof requested !== "number" || !Number.isFinite(requested)) return DEFAULT_WINDOW_HOURS;
  return Math.min(MAX_WINDOW_HOURS, Math.max(1, Math.floor(requested)));
}

/**
 * Read the report. A database failure is reported as `live: false` with the reason, never as zero
 * refusals: an unreadable table and a quiet one must not look alike.
 */
export async function getDebitRefusalReport(
  windowHours: number = DEFAULT_WINDOW_HOURS,
  nowMs: number = Date.now(),
): Promise<DebitRefusalReport> {
  const hours = clampWindowHours(windowHours);
  try {
    const since = new Date(Math.floor(nowMs / HOUR_MS) * HOUR_MS - (hours - 1) * HOUR_MS).toISOString();
    const rows = await executeQuery<RefusalHourRow>(READ_DEBIT_REFUSALS_SQL, [since]);
    const first = await executeQuery<{ first_hour: Date | string | null }>(FIRST_REFUSAL_HOUR_SQL);
    return buildReport(rows.rows, first.rows[0]?.first_hour ?? null, hours, nowMs);
  } catch (error) {
    // The table is not there: the code deployed before migration 107 ran.
    const missing = pgCode(error) === UNDEFINED_TABLE;
    if (!missing) _logger.error("[debit-refusals] read failed:", error);
    return {
      ...buildReport([], null, hours, nowMs),
      live: false,
      note: missing
        ? "economy_debit_refusals does not exist yet (migration 107 not applied)"
        : "economy_debit_refusals could not be read (see the server log)",
    };
  }
}
