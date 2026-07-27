/**
 * Token Economy Service
 *
 * Core ledger operations for the ESMS token economy.
 * Implements double-entry bookkeeping with immutable transactions.
 * Follows the same lazy-DB / in-memory-fallback pattern as notificationDatabaseService.
 *
 * @file src/services/TokenEconomyService.ts
 */

import { _logger } from "@/lib/logger";
import type {
  TokenType,
  TokenBalances,
  TokenTransaction,
  TransactionSourceType,
  TransmutationResult,
} from "@/types/economy";
import {
  EMPTY_BALANCES,
  TRANSMUTATION_RATIO,
} from "@/types/economy";

// ─── DB Bootstrapping (lazy import pattern) ───────────────────────────

const isServerWithDB = (): boolean =>
  typeof window === "undefined" && !!process.env.DATABASE_URL;

let dbModule: typeof import("@/lib/database") | null = null;
const getDbModule = async () => {
  if (!dbModule && isServerWithDB()) {
    try {
      dbModule = await import("@/lib/database");
    } catch {
      _logger.warn("[TokenEconomy] Database module not available");
    }
  }
  return dbModule;
};

// ─── In-Memory Fallback ───────────────────────────────────────────────

const memoryBalances = new Map<string, TokenBalances>();
const memoryTransactions: TokenTransaction[] = [];
const memoryIdempotencyKeys = new Set<string>();
let memoryTxnId = 1;

// ─── Row Converters ───────────────────────────────────────────────────

type DbScalar = Date | number | string | null | undefined;

interface TokenBalanceRow {
  spirit?: DbScalar;
  essence?: DbScalar;
  matter?: DbScalar;
  substance?: DbScalar;
  last_daily_claim_at?: DbScalar;
  last_daily_claim_agents_at?: DbScalar;
  updated_at?: DbScalar;
}

interface TokenTransactionRow {
  id?: DbScalar;
  transaction_group_id?: DbScalar;
  user_id?: DbScalar;
  token_type?: DbScalar;
  amount?: DbScalar;
  source_type?: DbScalar;
  source_id?: DbScalar;
  description?: DbScalar;
  created_at?: DbScalar;
}

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseFloat(value)
        : Number.NaN;

  return Number.isFinite(parsed) ? parsed : fallback;
};

const toNullableIsoString = (value: unknown): string | null => {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return null;
};

const toIsoString = (value: unknown, fallback = new Date().toISOString()): string =>
  toNullableIsoString(value) ?? fallback;

const toNullableString = (value: unknown): string | null => {
  if (value == null) return null;
  return String(value);
};

function rowToBalances(row: TokenBalanceRow): TokenBalances {
  return {
    spirit: toNumber(row.spirit),
    essence: toNumber(row.essence),
    matter: toNumber(row.matter),
    substance: toNumber(row.substance),
    lastDailyClaimAt: toNullableIsoString(row.last_daily_claim_at),
    lastDailyClaimAgentsAt: toNullableIsoString(row.last_daily_claim_agents_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

function rowToTransaction(row: TokenTransactionRow): TokenTransaction {
  return {
    id: toNumber(row.id),
    transactionGroupId: String(row.transaction_group_id ?? ""),
    userId: String(row.user_id ?? ""),
    tokenType: row.token_type as TokenType,
    amount: toNumber(row.amount),
    sourceType: row.source_type as TransactionSourceType,
    sourceId: toNullableString(row.source_id),
    description: toNullableString(row.description),
    createdAt: toIsoString(row.created_at),
  };
}

/** Source types that are once-per-user-per-UTC-day BY DEFINITION. Only these
 *  get a `yield_day`, and only these are covered by
 *  `uniq_daily_yield_per_user_day`. Everything else — Sky Drops, transit
 *  attunement — is legitimately multi-per-day and must stay unconstrained. */
const DAILY_YIELD_SOURCES = ["agents_yield", "daily_yield"] as const;

/** The same list as a SQL literal, so the writer and the partial index in
 *  `database/init/73-daily-yield-once-per-day.sql` cannot drift apart. If they
 *  do, rows get a yield_day the index ignores (or vice versa) and the guard
 *  silently stops guarding. */
const DAILY_YIELD_SOURCES_SQL = DAILY_YIELD_SOURCES.map((s) => `'${s}'`).join(
  ", ",
);

// Single-statement credit: insert an immutable ledger entry (idempotency-guarded)
// and apply the delta to the typed column, atomically. `column` is a constrained
// union literal (never user input), so interpolating it is injection-safe.
//
// ── Why the balance write is an UPSERT and not an UPDATE ────────────────────
//
// It used to be an `UPDATE token_balances … WHERE user_id = $1` preceded by an
// `ensure_balance` CTE that INSERTed the row. That silently lost every user's
// FIRST-EVER credit. In a data-modifying CTE, every sub-statement AND the main
// query run against ONE snapshot taken before the statement begins, so the
// UPDATE could not see the row `ensure_balance` had just inserted: the ledger
// row committed, the UPDATE matched ZERO rows, and the balance never moved.
//
// It failed silently because `creditMultipleTokens` only assigns `last` when
// `res.rows.length > 0`. Spirit returning nothing just left `last` null, Essence
// then set it, and the endpoint returned 200 with a balances object.
//
// `[MEASURED 2026-07-26 on production]` 67 users, 521.7141 Spirit. For 67 of 67
// the shortfall equals that user's FIRST ledger row, and all 67 are
// auto-provisioned agents — human signup seeds `token_balances` in its own
// statement, so the row pre-existed and the UPDATE landed. Spirit is simply the
// first of the four axes written, so it is the only one that ever meets the
// missing-row state; Essence/Matter/Substance always found the row and
// reconciled EXACTLY, which is why only Spirit looked wrong.
//
// The upsert has no such ordering hazard: with no row it INSERTs the credited
// amount (the other three axes default to 0), and with a row it adds the delta
// under `ON CONFLICT`. Idempotency is preserved because `SELECT … FROM inserted`
// yields no row when the ledger insert was suppressed, so nothing is written.
//
// ── Why $4 is cast to text in BOTH of its references ────────────────────────
//
// A bind parameter has exactly ONE deduced type. $4 is bound as the INSERT value
// for `source_type` (character varying) and is also compared against the string
// literals in the CASE, which deduce `text`. Left uncast, PostgreSQL refuses to
// prepare the statement at all:
//
//     42P08  inconsistent types deduced for parameter $4
//
// and every credit throws. Casting only the comparison side does NOT fix it —
// the INSERT target still deduces varchar. Both references must agree; text ->
// varchar is an assignment cast, so pinning both to text is safe.
//
// This shipped to production once. Thirteen unit tests covered the path and all
// passed, because they mock the database — a mock accepts SQL no database will.
// `scripts/checkEconomySqlParses.ts` now PREPAREs every variant against a real
// PostgreSQL in CI, which is the only thing that can catch this class.
//
// Params, in order:
//   $1 userId  $2 tokenType  $3 amount  $4 sourceType
//   $5 sourceId  $6 description  $7 transactionGroupId  $8 idempotencyKey
//
// `yield_day` is computed IN THE DATABASE from `now()`, not passed in from the
// caller. That matters: the whole point is a day key the application cannot get
// wrong or disagree with itself about, and two producers running in different
// timezones (or one of them holding a stale clock) is precisely how the
// original double-credit arose. It is NULL for every non-daily-yield source, so
// those rows do not participate in the unique index at all.
function creditTokensSql(
  column: "spirit" | "essence" | "matter" | "substance",
): string {
  return `WITH inserted AS (
            INSERT INTO token_transactions
              (transaction_group_id, user_id, token_type, amount, source_type, source_id, description, idempotency_key, yield_day)
            VALUES
              (COALESCE($7::uuid, uuid_generate_v4()), $1, $2, $3, $4::text, $5, $6, $8,
               CASE WHEN $4::text IN (${DAILY_YIELD_SOURCES_SQL})
                    THEN (now() AT TIME ZONE 'UTC')::date
                    ELSE NULL END)
            ON CONFLICT (idempotency_key) DO NOTHING
            RETURNING id
          )
          INSERT INTO token_balances (user_id, ${column}, updated_at)
          SELECT $1, $3, now() FROM inserted
          ON CONFLICT (user_id) DO UPDATE
            SET ${column} = token_balances.${column} + EXCLUDED.${column},
                updated_at = now()
          RETURNING *`;
}

// Single-statement debit: check the balance, write the ledger entry only if the
// funds are there, and apply the delta — atomically. Params, in order:
//   $1 userId  $2 tokenType  $3 amount  $4 sourceType
//   $5 sourceId  $6 transactionGroupId  $7 description
//
// ── Why this one is NOT an upsert, unlike the credit above ──────────────────
//
// This statement also used to open with an `ensure_balance` INSERT, which was
// inert for exactly the reason described above the credit builder: no other
// sub-statement could see the row it created. Removing it changes nothing, and
// leaving it in read as a safeguard that was never operating.
//
// It must NOT become `INSERT … ON CONFLICT DO UPDATE`. `[MEASURED 2026-07-27]`
// against production, in a rolled-back transaction: an upsert-shaped debit of 25
// against a user with NO balance row produces `spirit = -25.0000` — it lets
// someone spend tokens they never had. The `check_balance` CTE is what makes this
// fail CLOSED: with no row it selects nothing, the ledger insert selects FROM it
// and writes nothing, the UPDATE matches nothing, and the caller reads "0 rows"
// as insufficient balance. Verified in the same run: the guarded shape touched 0
// rows and created no balance.
//
// The asymmetry is the point. A credit for a missing row SHOULD create it; a debit
// for a missing row should refuse.
function debitTokensSql(
  column: "spirit" | "essence" | "matter" | "substance",
): string {
  return `WITH check_balance AS (
            SELECT ${column} AS current_balance FROM token_balances WHERE user_id = $1
          ),
          inserted AS (
            INSERT INTO token_transactions
              (transaction_group_id, user_id, token_type, amount, source_type, source_id, description)
            SELECT COALESCE($6::uuid, uuid_generate_v4()), $1, $2, -$3::numeric, $4::text, $5, $7
            FROM check_balance
            WHERE current_balance >= $3::numeric
            RETURNING id
          )
          UPDATE token_balances
          SET ${column} = ${column} - $3::numeric,
              updated_at = now()
          WHERE user_id = $1
            AND EXISTS (SELECT 1 FROM inserted)
          RETURNING *`;
}

// ─── Service Class ────────────────────────────────────────────────────

class TokenEconomyService {

  // ═══════════════════════════════════════════════════════════════════
  // BALANCES
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Get user's current ESMS balances. Creates a default row if none exists.
   */
  async getBalances(userId: string): Promise<TokenBalances> {
    const db = await getDbModule();

    if (db) {
      try {
        // ONE statement, and it returns the row whether it was just created or
        // already existed. `DO UPDATE` rather than `DO NOTHING` is what makes
        // that true: `RETURNING` yields nothing for a conflicting row under DO
        // NOTHING, so the ensure and the read have to be the same statement to
        // be both atomic and readable. The SET is deliberately a no-op write of
        // the column's own value — nothing about the row should change here.
        //
        // This replaces `INSERT …; SELECT …` sent as ONE string with a bind
        // parameter, which PostgreSQL rejects outright:
        // `[MEASURED 2026-07-27]` against production it throws
        // `42601 cannot insert multiple commands into a prepared statement`.
        // It was never the multi-statement support question the old comment
        // assumed — the extended query protocol permits exactly one command per
        // parameterised message. So EVERY balance read raised, was swallowed by
        // the catch, and silently took the two-query fallback: correct results,
        // an exception per call, and a "primary" path that had never once run.
        const result = await db.executeQuery(
          `INSERT INTO token_balances (user_id) VALUES ($1)
           ON CONFLICT (user_id) DO UPDATE SET updated_at = token_balances.updated_at
           RETURNING *`,
          [userId],
        );
        if (result.rows.length > 0) {
          return rowToBalances(result.rows[0]);
        }
      } catch (error) {
        _logger.error("[TokenEconomy] getBalances failed:", error);
      }
    }

    // In-memory fallback
    if (!memoryBalances.has(userId)) {
      memoryBalances.set(userId, { ...EMPTY_BALANCES });
    }
    return memoryBalances.get(userId)!;
  }

  // ═══════════════════════════════════════════════════════════════════
  // CREDIT / DEBIT
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Credit tokens to a user (immutable ledger entry + balance update).
   * Returns the new balance or null if idempotency check blocked the operation.
   */
  async creditTokens(
    userId: string,
    tokenType: TokenType,
    amount: number,
    sourceType: TransactionSourceType,
    opts?: {
      sourceId?: string;
      description?: string;
      idempotencyKey?: string;
      transactionGroupId?: string;
    },
  ): Promise<TokenBalances | null> {
    if (amount <= 0) {
      _logger.warn("[TokenEconomy] creditTokens called with non-positive amount", { amount });
      return null;
    }

    const db = await getDbModule();
    const column = tokenType.toLowerCase() as "spirit" | "essence" | "matter" | "substance";

    if (db) {
      try {
        // Single atomic statement (insert ledger row + apply delta).
        const result = await db.executeQuery(creditTokensSql(column), [
          userId,
          tokenType,
          amount,
          sourceType,
          opts?.sourceId || null,
          opts?.description || null,
          opts?.transactionGroupId || null,
          opts?.idempotencyKey || null,
        ]);

        if (result.rows.length > 0) {
          return rowToBalances(result.rows[0]);
        }

        // Idempotency blocked: return current balance
        if (opts?.idempotencyKey) {
          return this.getBalances(userId);
        }
        return null;
      } catch (error) {
        _logger.error("[TokenEconomy] creditTokens failed:", error);
        return null;
      }
    }

    // In-memory fallback
    if (opts?.idempotencyKey) {
      const exists = memoryIdempotencyKeys.has(opts.idempotencyKey);
      if (exists) return this.getBalances(userId);
    }

    const balances = await this.getBalances(userId);
    balances[column] += amount;
    balances.updatedAt = new Date().toISOString();

    memoryTransactions.push({
      id: memoryTxnId++,
      transactionGroupId: opts?.transactionGroupId || crypto.randomUUID(),
      userId,
      tokenType,
      amount,
      sourceType,
      sourceId: opts?.sourceId || null,
      description: opts?.description || null,
      createdAt: new Date().toISOString(),
    });
    if (opts?.idempotencyKey) {
      memoryIdempotencyKeys.add(opts.idempotencyKey);
    }

    return balances;
  }

  /**
   * Debit tokens from a user. Returns null if insufficient balance.
   */
  async debitTokens(
    userId: string,
    tokenType: TokenType,
    amount: number,
    sourceType: TransactionSourceType,
    opts?: {
      sourceId?: string;
      description?: string;
      transactionGroupId?: string;
    },
  ): Promise<TokenBalances | null> {
    if (amount <= 0) return null;

    const column = tokenType.toLowerCase() as "spirit" | "essence" | "matter" | "substance";
    const db = await getDbModule();

    if (db) {
      try {
        const result = await db.executeQuery(
          debitTokensSql(column),
          [
            userId,
            tokenType,
            amount,
            sourceType,
            opts?.sourceId || null,
            opts?.transactionGroupId || null,
            opts?.description || null,
          ],
        );

        if (result.rows.length > 0) {
          return rowToBalances(result.rows[0]);
        }
        return null; // Insufficient balance
      } catch (error) {
        _logger.error("[TokenEconomy] debitTokens failed:", error);
        return null;
      }
    }

    // In-memory fallback
    const balances = await this.getBalances(userId);
    if (balances[column] < amount) return null;

    balances[column] -= amount;
    balances.updatedAt = new Date().toISOString();
    return balances;
  }

  /**
   * Atomically debit all four coins at once (e.g. moving a balance snapshot
   * on-chain via an ESMS claim). Same one-statement CTE shape as
   * purchaseShopItem — balance check, per-axis ledger rows, and the balance
   * update either all commit or none do — but with no shop item involved.
   * Per-axis idempotency keys (`<key>:<TokenType>`) make a retry after a
   * network error a clean `already_applied` instead of a double debit.
   */
  async debitAllTokens(
    userId: string,
    amounts: { spirit: number; essence: number; matter: number; substance: number },
    sourceType: TransactionSourceType,
    opts?: {
      sourceId?: string;
      description?: string;
      idempotencyKey?: string;
    },
  ): Promise<
    | { success: true; balances: TokenBalances; transactionGroupId: string }
    | { success: false; reason: "insufficient_funds" | "already_applied" | "debit_failed" }
  > {
    const db = await getDbModule();
    const idemKey = opts?.idempotencyKey ?? null;

    if (db) {
      try {
        if (idemKey) {
          const dup = await db.executeQuery(
            `SELECT 1 FROM token_transactions WHERE idempotency_key LIKE $1 LIMIT 1`,
            [`${idemKey}:%`],
          );
          if (dup.rows.length > 0) {
            return { success: false, reason: "already_applied" };
          }
        }

        const result = await db.executeQuery(
          // No `ensure_balance` CTE: it could not be seen by any other
          // sub-statement (one snapshot per statement), so it never protected
          // anything, and `balance_check` is what makes this fail CLOSED for a
          // user with no row. See debitTokensSql for the measurement showing why
          // an upsert would be WRONG here.
          `WITH balance_check AS (
            SELECT * FROM token_balances WHERE user_id = $1
            AND spirit >= $2 AND essence >= $3 AND matter >= $4 AND substance >= $5
          ),
          new_group AS (
            SELECT uuid_generate_v4() AS gid
          ),
          debit_spirit AS (
            INSERT INTO token_transactions (transaction_group_id, user_id, token_type, amount, source_type, source_id, description, idempotency_key)
            SELECT g.gid, $1, 'Spirit', -$2, $6, $7, $8,
                   CASE WHEN $9::text IS NOT NULL THEN $9 || ':Spirit' ELSE NULL END
            FROM balance_check bc, new_group g
            WHERE $2 > 0
            RETURNING id
          ),
          debit_essence AS (
            INSERT INTO token_transactions (transaction_group_id, user_id, token_type, amount, source_type, source_id, description, idempotency_key)
            SELECT g.gid, $1, 'Essence', -$3, $6, $7, $8,
                   CASE WHEN $9::text IS NOT NULL THEN $9 || ':Essence' ELSE NULL END
            FROM balance_check bc, new_group g
            WHERE $3 > 0
            RETURNING id
          ),
          debit_matter AS (
            INSERT INTO token_transactions (transaction_group_id, user_id, token_type, amount, source_type, source_id, description, idempotency_key)
            SELECT g.gid, $1, 'Matter', -$4, $6, $7, $8,
                   CASE WHEN $9::text IS NOT NULL THEN $9 || ':Matter' ELSE NULL END
            FROM balance_check bc, new_group g
            WHERE $4 > 0
            RETURNING id
          ),
          debit_substance AS (
            INSERT INTO token_transactions (transaction_group_id, user_id, token_type, amount, source_type, source_id, description, idempotency_key)
            SELECT g.gid, $1, 'Substance', -$5, $6, $7, $8,
                   CASE WHEN $9::text IS NOT NULL THEN $9 || ':Substance' ELSE NULL END
            FROM balance_check bc, new_group g
            WHERE $5 > 0
            RETURNING id
          ),
          updated AS (
            UPDATE token_balances
            SET spirit = token_balances.spirit - $2,
                essence = token_balances.essence - $3,
                matter = token_balances.matter - $4,
                substance = token_balances.substance - $5,
                updated_at = now()
            FROM balance_check bc
            WHERE token_balances.user_id = $1
            RETURNING token_balances.*
          )
          SELECT u.*, g.gid AS txn_group_id FROM updated u, new_group g`,
          [
            userId,
            amounts.spirit,
            amounts.essence,
            amounts.matter,
            amounts.substance,
            sourceType,
            opts?.sourceId || null,
            opts?.description || null,
            idemKey,
          ],
        );

        if (result.rows.length === 0) {
          return { success: false, reason: "insufficient_funds" };
        }
        return {
          success: true,
          balances: rowToBalances(result.rows[0]),
          transactionGroupId: result.rows[0].txn_group_id,
        };
      } catch (error) {
        if ((error as { code?: string })?.code === "23505") {
          return { success: false, reason: "already_applied" };
        }
        _logger.error("[TokenEconomy] debitAllTokens failed:", error);
        return { success: false, reason: "debit_failed" };
      }
    }

    // In-memory fallback: honest affordability check across all four axes.
    const balances = await this.getBalances(userId);
    if (
      balances.spirit < amounts.spirit ||
      balances.essence < amounts.essence ||
      balances.matter < amounts.matter ||
      balances.substance < amounts.substance
    ) {
      return { success: false, reason: "insufficient_funds" };
    }
    balances.spirit -= amounts.spirit;
    balances.essence -= amounts.essence;
    balances.matter -= amounts.matter;
    balances.substance -= amounts.substance;
    balances.updatedAt = new Date().toISOString();
    return { success: true, balances, transactionGroupId: `mem_${Date.now()}` };
  }

  /**
   * Credit multiple token types at once (for 'all' rewards or daily yield).
   */
  async creditMultipleTokens(
    userId: string,
    credits: Array<{ tokenType: TokenType; amount: number }>,
    sourceType: TransactionSourceType,
    opts?: {
      sourceId?: string;
      description?: string;
      idempotencyKey?: string;
    },
  ): Promise<TokenBalances | null> {
    const groupId = crypto.randomUUID();
    const db = await getDbModule();

    if (db) {
      // All credits in ONE transaction so a multi-token grant is all-or-nothing:
      // previously each credit auto-committed independently, so a failure on
      // (say) the 3rd of 4 left a partially-applied grant. Per-type idempotency
      // keys still make the whole grant safe to replay.
      try {
        const lastRow = await db.withTransaction(async (client) => {
          let last: Record<string, unknown> | null = null;
          for (const { tokenType, amount } of credits) {
            if (amount <= 0) continue;
            const column = tokenType.toLowerCase() as
              | "spirit"
              | "essence"
              | "matter"
              | "substance";
            const idemKey = opts?.idempotencyKey
              ? `${opts.idempotencyKey}:${tokenType}`
              : null;
            const res = await client.query(creditTokensSql(column), [
              userId,
              tokenType,
              amount,
              sourceType,
              opts?.sourceId || null,
              opts?.description || null,
              groupId,
              idemKey,
            ]);
            if (res.rows.length > 0) last = res.rows[0];
          }
          return last;
        });

        if (lastRow) return rowToBalances(lastRow);
        // No row updated: every credit hit ON CONFLICT DO NOTHING (idempotency
        // replay) or all amounts were non-positive. The balance already
        // reflects any prior claim, so return the current balance.
        return this.getBalances(userId);
      } catch (error) {
        // A unique violation on `uniq_daily_yield_per_user_day` is not a
        // failure — it is the atomic backstop doing its job. The application
        // guard in sync-credit §3b is a check-then-act SELECT, so two concurrent
        // requests can both pass it; this index is what makes the second one
        // lose. Returning null routes it to the same 409 "already_applied" the
        // caller already produces for an idempotency replay, which is exactly
        // the right answer: the day's yield IS already applied.
        //
        // Distinguished from a genuine fault so it is not logged as an error and
        // does not read as an incident. 23505 = unique_violation.
        const pgError = error as { code?: string; constraint?: string };
        if (
          pgError?.code === "23505" &&
          pgError?.constraint === "uniq_daily_yield_per_user_day"
        ) {
          _logger.info(
            `[TokenEconomy] daily-yield double-credit prevented by the DB for user ${userId} (${sourceType}); ` +
              "the application guard lost a race and the index caught it.",
          );
          return null;
        }
        _logger.error(
          "[TokenEconomy] creditMultipleTokens failed, rolled back:",
          error,
        );
        return null;
      }
    }

    // In-memory fallback (no DB): apply sequentially via creditTokens.
    let lastBalances: TokenBalances | null = null;
    for (const { tokenType, amount } of credits) {
      if (amount <= 0) continue;
      const idemKey = opts?.idempotencyKey
        ? `${opts.idempotencyKey}:${tokenType}`
        : undefined;
      lastBalances = await this.creditTokens(userId, tokenType, amount, sourceType, {
        sourceId: opts?.sourceId,
        description: opts?.description,
        idempotencyKey: idemKey,
        transactionGroupId: groupId,
      });
      if (lastBalances === null && idemKey) {
        return null;
      }
    }
    return lastBalances || this.getBalances(userId);
  }

  // ═══════════════════════════════════════════════════════════════════
  // SIGNUP GRANT
  // ═══════════════════════════════════════════════════════════════════

  /** Welcome grant: every new user starts with this even ESMS balance. */
  static readonly SIGNUP_GRANT_PER_TOKEN = 15;

  /**
   * Grant (or heal) a new user's one-time welcome balance.
   *
   * Idempotent via the per-user key `signup_grant:<userId>` (per-token under
   * the hood), so it is safe to call on every sign-in: an already-granted user
   * is a cheap no-op, and a user whose grant failed once is healed the next
   * time they sign in.
   *
   * Resilient by design. `creditMultipleTokens` swallows DB errors and returns
   * `null` rather than throwing, so the previous caller's try/catch was dead
   * code — a transient blip (likely during a cold-start sign-in storm at
   * influx) dropped the grant silently and left the user token-broke with no
   * signal. Here we treat a `null` result as failure, retry a few times with
   * short backoff (the grant is all-or-nothing + idempotent, so a replay can
   * never double-credit), and on final failure log a distinct, greppable error.
   *
   * @returns true if the grant is in place (freshly applied or already
   *          present), false if every attempt failed.
   */
  async grantSignupBonus(userId: string): Promise<boolean> {
    const amount = TokenEconomyService.SIGNUP_GRANT_PER_TOKEN;
    const credits = (
      ["Spirit", "Essence", "Matter", "Substance"] as TokenType[]
    ).map((tokenType) => ({ tokenType, amount }));
    const backoffsMs = [0, 250, 750];

    for (let attempt = 0; attempt < backoffsMs.length; attempt++) {
      if (backoffsMs[attempt] > 0) {
        await new Promise((resolve) => setTimeout(resolve, backoffsMs[attempt]));
      }
      const result = await this.creditMultipleTokens(
        userId,
        credits,
        "signup_grant",
        {
          description: "Welcome to Alchm.kitchen — starter cosmic balance",
          idempotencyKey: `signup_grant:${userId}`,
        },
      );
      if (result !== null) return true;
      _logger.warn(
        `[TokenEconomy] signup grant attempt ${attempt + 1}/${backoffsMs.length} failed for ${userId}`,
      );
    }

    _logger.error(
      `[TokenEconomy] signup_grant_failed — exhausted retries for user ${userId}; ` +
        "starting balance stays zero until a later sign-in re-attempts the grant",
    );
    return false;
  }

  // ═══════════════════════════════════════════════════════════════════
  // DAILY CLAIM TRACKING
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Update the site-specific daily claim timestamp.
   * 'main' updates last_daily_claim_at; 'agents' updates last_daily_claim_agents_at.
   */
  async updateDailyClaimTimestamp(userId: string, site: "main" | "agents" = "main"): Promise<void> {
    const column = site === "agents" ? "last_daily_claim_agents_at" : "last_daily_claim_at";
    const db = await getDbModule();

    if (db) {
      try {
        await db.executeQuery(
          `UPDATE token_balances SET ${column} = now(), updated_at = now() WHERE user_id = $1`,
          [userId],
        );
      } catch (error) {
        _logger.error("[TokenEconomy] updateDailyClaimTimestamp failed:", error);
      }
    }

    // In-memory
    const bal = memoryBalances.get(userId);
    if (bal) {
      const ts = new Date().toISOString();
      if (site === "agents") {
        bal.lastDailyClaimAgentsAt = ts;
      } else {
        bal.lastDailyClaimAt = ts;
      }
    }
  }

  /**
   * Check if a user has already claimed their daily yield today for the given site.
   * Main and agents yields are tracked independently.
   */
  async hasClaimedToday(userId: string, site: "main" | "agents" = "main"): Promise<boolean> {
    const balances = await this.getBalances(userId);
    const claimTimestamp = site === "agents" ? balances.lastDailyClaimAgentsAt : balances.lastDailyClaimAt;
    if (!claimTimestamp) return false;

    const lastClaim = new Date(claimTimestamp);
    const now = new Date();

    // Compare UTC dates
    return (
      lastClaim.getUTCFullYear() === now.getUTCFullYear() &&
      lastClaim.getUTCMonth() === now.getUTCMonth() &&
      lastClaim.getUTCDate() === now.getUTCDate()
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // TRANSMUTATION
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Transmute tokens: spend 3:1 ratio to convert one type to another.
   */
  async transmute(
    userId: string,
    fromToken: TokenType,
    toToken: TokenType,
    targetAmount: number,
  ): Promise<TransmutationResult | null> {
    if (fromToken === toToken) return null;
    if (targetAmount <= 0) return null;

    const costAmount = targetAmount * TRANSMUTATION_RATIO;
    const groupId = crypto.randomUUID();
    const db = await getDbModule();
    const fromColumn = fromToken.toLowerCase() as "spirit" | "essence" | "matter" | "substance";
    const toColumn = toToken.toLowerCase() as "spirit" | "essence" | "matter" | "substance";

    if (db) {
      try {
        const result = await db.executeQuery(
          // No `ensure_balance` CTE — inert within the statement, and
          // `check_balance` is what makes a transmutation fail CLOSED for a user
          // with no balance row. See debitTokensSql.
          `WITH check_balance AS (
            SELECT ${fromColumn} AS current_balance
            FROM token_balances
            WHERE user_id = $1
          ),
          updated AS (
            UPDATE token_balances
            SET ${fromColumn} = ${fromColumn} - $2,
                ${toColumn} = ${toColumn} + $3,
                updated_at = now()
            WHERE user_id = $1
              AND EXISTS (
                SELECT 1
                FROM check_balance
                WHERE current_balance >= $2
              )
            RETURNING *
          ),
          debit_txn AS (
            INSERT INTO token_transactions
              (transaction_group_id, user_id, token_type, amount, source_type, source_id, description)
            SELECT
              $4::uuid, $1, $5, -$2, 'transmutation', NULL, $6
            FROM updated
          ),
          credit_txn AS (
            INSERT INTO token_transactions
              (transaction_group_id, user_id, token_type, amount, source_type, source_id, description)
            SELECT
              $4::uuid, $1, $7, $3, 'transmutation', NULL, $8
            FROM updated
          )
          SELECT * FROM updated`,
          [
            userId,
            costAmount,
            targetAmount,
            groupId,
            fromToken,
            `Transmute ${costAmount} ${fromToken} → ${targetAmount} ${toToken}`,
            toToken,
            `Received from transmutation of ${fromToken}`,
          ],
        );

        if (result.rows.length === 0) {
          return null;
        }

        return {
          spent: { tokenType: fromToken, amount: costAmount },
          received: { tokenType: toToken, amount: targetAmount },
          newBalances: rowToBalances(result.rows[0]),
        };
      } catch (error) {
        _logger.error("[TokenEconomy] transmute DB failed:", error);
        return null;
      }
    }

    // Debit first
    const afterDebit = await this.debitTokens(
      userId,
      fromToken,
      costAmount,
      "transmutation",
      {
        description: `Transmute ${costAmount} ${fromToken} → ${targetAmount} ${toToken}`,
        transactionGroupId: groupId,
      },
    );

    if (!afterDebit) return null; // Insufficient balance

    // Credit
    const newBalances = await this.creditTokens(
      userId,
      toToken,
      targetAmount,
      "transmutation",
      {
        description: `Received from transmutation of ${fromToken}`,
        transactionGroupId: groupId,
      },
    );

    return {
      spent: { tokenType: fromToken, amount: costAmount },
      received: { tokenType: toToken, amount: targetAmount },
      newBalances: newBalances || afterDebit,
    };
  }

  // ═══════════════════════════════════════════════════════════════════
  // TRANSACTION HISTORY
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Get transaction history for a user.
   */
  async getTransactions(
    userId: string,
    opts?: { limit?: number; offset?: number },
  ): Promise<{ transactions: TokenTransaction[]; total: number }> {
    const limit = opts?.limit ?? 20;
    const offset = opts?.offset ?? 0;
    const db = await getDbModule();

    if (db) {
      try {
        const [txnResult, countResult] = await Promise.all([
          db.executeQuery(
            `SELECT * FROM token_transactions
             WHERE user_id = $1
             ORDER BY created_at DESC
             LIMIT $2 OFFSET $3`,
            [userId, limit, offset],
          ),
          db.executeQuery(
            `SELECT COUNT(*)::int AS total FROM token_transactions WHERE user_id = $1`,
            [userId],
          ),
        ]);

        return {
          transactions: txnResult.rows.map(rowToTransaction),
          total: countResult.rows[0]?.total || 0,
        };
      } catch (error) {
        _logger.error("[TokenEconomy] getTransactions failed:", error);
      }
    }

    // In-memory fallback
    const userTxns = memoryTransactions
      .filter(t => t.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      transactions: userTxns.slice(offset, offset + limit),
      total: userTxns.length,
    };
  }

  // ═══════════════════════════════════════════════════════════════════
  // SHOP PURCHASES
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Purchase a shop item by slug. Atomically checks affordability,
   * debits all required token types, and records the purchase.
   *
   * @returns New balances + transaction group ID, or null if insufficient funds
   */
  async purchaseShopItem(
    userId: string,
    shopItemSlug: string,
    opts?: {
      overrideCosts?: {
        spirit: number;
        essence: number;
        matter: number;
        substance: number;
      };
      descriptionSuffix?: string;
      idempotencyKey?: string;
    },
  ): Promise<
    | { success: true; balances: TokenBalances; transactionGroupId: string }
    | { success: false; reason: "item_not_found" | "already_owned" | "already_applied" | "insufficient_funds" | "purchase_failed" }
  > {
    const db = await getDbModule();

    if (db) {
      try {
        // 1. Look up the shop item
        const itemResult = await db.executeQuery(
          `SELECT * FROM shop_items WHERE slug = $1 AND is_active = true`,
          [shopItemSlug],
        );
        const item = itemResult.rows[0];
        if (!item) {
          _logger.warn("[TokenEconomy] Shop item not found:", shopItemSlug);
          return { success: false, reason: "item_not_found" };
        }

        // 2. Check if one-time item already purchased
        if (item.is_one_time) {
          const existing = await db.executeQuery(
            `SELECT 1 FROM user_purchases up
             JOIN shop_items si ON si.id = up.shop_item_id
             WHERE up.user_id = $1 AND si.slug = $2`,
            [userId, shopItemSlug],
          );
          if (existing.rows.length > 0) {
            _logger.info("[TokenEconomy] One-time item already purchased:", shopItemSlug);
            return { success: false, reason: "already_owned" };
          }
        }

        // 2b. Idempotency pre-check: reject duplicate submissions (client retry after network error)
        const idemKey = opts?.idempotencyKey ?? null;
        if (idemKey) {
          const dup = await db.executeQuery(
            `SELECT 1 FROM token_transactions WHERE idempotency_key LIKE $1 LIMIT 1`,
            [`${idemKey}:%`],
          );
          if (dup.rows.length > 0) {
            _logger.info("[TokenEconomy] Duplicate purchase blocked by idempotency key:", idemKey);
            return { success: false, reason: "already_applied" };
          }
        }

        const costs = opts?.overrideCosts || {
          spirit: parseFloat(item.cost_spirit) || 0,
          essence: parseFloat(item.cost_essence) || 0,
          matter: parseFloat(item.cost_matter) || 0,
          substance: parseFloat(item.cost_substance) || 0,
        };
        const description = opts?.descriptionSuffix
          ? `Shop: ${item.title} (${opts.descriptionSuffix})`
          : `Shop: ${item.title}`;

        // 3. Atomic: check balance + debit + record purchase in one CTE.
        //    $8 is the idempotency key prefix (null when not provided).
        //    Each debit_* INSERT includes idempotency_key = $8 || ':<TokenType>'
        //    so the unique constraint on token_transactions.idempotency_key catches
        //    any concurrent duplicate that slips past the pre-check above.
        const result = await db.executeQuery(
          // No `ensure_balance` CTE: it could not be seen by any other
          // sub-statement (one snapshot per statement), so it never protected
          // anything, and `balance_check` is what makes this fail CLOSED for a
          // user with no row. See debitTokensSql for the measurement showing why
          // an upsert would be WRONG here.
          `WITH balance_check AS (
            SELECT * FROM token_balances WHERE user_id = $1
            AND spirit >= $2 AND essence >= $3 AND matter >= $4 AND substance >= $5
          ),
          new_group AS (
            SELECT uuid_generate_v4() AS gid
          ),
          debit_spirit AS (
            INSERT INTO token_transactions (transaction_group_id, user_id, token_type, amount, source_type, source_id, description, idempotency_key)
            SELECT g.gid, $1, 'Spirit', -$2, 'premium_purchase', $6, $7,
                   CASE WHEN $8::text IS NOT NULL THEN $8 || ':Spirit' ELSE NULL END
            FROM balance_check bc, new_group g
            WHERE $2 > 0
            RETURNING id
          ),
          debit_essence AS (
            INSERT INTO token_transactions (transaction_group_id, user_id, token_type, amount, source_type, source_id, description, idempotency_key)
            SELECT g.gid, $1, 'Essence', -$3, 'premium_purchase', $6, $7,
                   CASE WHEN $8::text IS NOT NULL THEN $8 || ':Essence' ELSE NULL END
            FROM balance_check bc, new_group g
            WHERE $3 > 0
            RETURNING id
          ),
          debit_matter AS (
            INSERT INTO token_transactions (transaction_group_id, user_id, token_type, amount, source_type, source_id, description, idempotency_key)
            SELECT g.gid, $1, 'Matter', -$4, 'premium_purchase', $6, $7,
                   CASE WHEN $8::text IS NOT NULL THEN $8 || ':Matter' ELSE NULL END
            FROM balance_check bc, new_group g
            WHERE $4 > 0
            RETURNING id
          ),
          debit_substance AS (
            INSERT INTO token_transactions (transaction_group_id, user_id, token_type, amount, source_type, source_id, description, idempotency_key)
            SELECT g.gid, $1, 'Substance', -$5, 'premium_purchase', $6, $7,
                   CASE WHEN $8::text IS NOT NULL THEN $8 || ':Substance' ELSE NULL END
            FROM balance_check bc, new_group g
            WHERE $5 > 0
            RETURNING id
          ),
          updated AS (
            -- Qualify token_balances.<col> on the right-hand side of each
            -- SET so the planner doesn't see the bare column name as
            -- ambiguous between token_balances and balance_check (both
            -- have spirit/essence/matter/substance columns). Without
            -- these qualifiers Postgres raises 42702 and the whole CTE
            -- rolls back, surfacing as purchase_failed in the caller.
            UPDATE token_balances
            SET spirit = token_balances.spirit - $2,
                essence = token_balances.essence - $3,
                matter = token_balances.matter - $4,
                substance = token_balances.substance - $5,
                updated_at = now()
            FROM balance_check bc
            WHERE token_balances.user_id = $1
            RETURNING token_balances.*
          ),
          purchase AS (
            INSERT INTO user_purchases (user_id, shop_item_id, transaction_group_id)
            SELECT $1, $6::uuid, g.gid FROM updated u, new_group g
            RETURNING transaction_group_id
          )
          SELECT u.*, p.transaction_group_id AS txn_group_id
          FROM updated u, purchase p`,
          [
            userId,
            costs.spirit,
            costs.essence,
            costs.matter,
            costs.substance,
            item.id,
            description,
            idemKey,
          ],
        );

        if (result.rows.length === 0) {
          _logger.info("[TokenEconomy] Insufficient funds for:", shopItemSlug);
          return { success: false, reason: "insufficient_funds" };
        }

        return {
          success: true,
          balances: rowToBalances(result.rows[0]),
          transactionGroupId: result.rows[0].txn_group_id,
        };
      } catch (error) {
        // Unique-violation on idempotency_key (race condition) → already_applied
        if ((error as { code?: string })?.code === "23505") {
          return { success: false, reason: "already_applied" };
        }
        _logger.error("[TokenEconomy] purchaseShopItem failed:", error);
        return { success: false, reason: "purchase_failed" };
      }
    }

    // In-memory fallback
    const balances = memoryBalances.get(userId) || { ...EMPTY_BALANCES };
    // Simple affordability check placeholder
    _logger.warn("[TokenEconomy] purchaseShopItem in-memory fallback for:", shopItemSlug);
    return { success: true, balances, transactionGroupId: `mem_${Date.now()}` };
  }

  /**
   * Check if a user has purchased a particular shop item.
   * For time-limited items, pass maxAgeDays to check recency.
   */
  async hasActivePurchase(
    userId: string,
    shopItemSlug: string,
    maxAgeDays?: number,
  ): Promise<boolean> {
    const db = await getDbModule();

    if (db) {
      try {
        const dateCondition = maxAgeDays
          ? `AND up.purchased_at >= now() - interval '${maxAgeDays} days'`
          : "";

        const result = await db.executeQuery(
          `SELECT 1 FROM user_purchases up
           JOIN shop_items si ON si.id = up.shop_item_id
           WHERE up.user_id = $1 AND si.slug = $2
           ${dateCondition}
           LIMIT 1`,
          [userId, shopItemSlug],
        );
        return result.rows.length > 0;
      } catch (error) {
        _logger.error("[TokenEconomy] hasActivePurchase failed:", error);
      }
    }

    return false;
  }

  /**
   * Get a shop item by slug.
   */
  async getShopItem(slug: string): Promise<{
    id: string;
    slug: string;
    title: string;
    description: string | null;
    category: string;
    costSpirit: number;
    costEssence: number;
    costMatter: number;
    costSubstance: number;
    isOneTime: boolean;
    isActive: boolean;
  } | null> {
    const db = await getDbModule();

    if (db) {
      try {
        const result = await db.executeQuery(
          `SELECT id, slug, title, description, category,
                  cost_spirit, cost_essence, cost_matter, cost_substance,
                  is_one_time, is_active
           FROM shop_items WHERE slug = $1`,
          [slug],
        );
        const row = result.rows[0];
        if (!row) return null;
        return {
          id: row.id,
          slug: row.slug,
          title: row.title,
          description: row.description,
          category: row.category,
          costSpirit: parseFloat(row.cost_spirit) || 0,
          costEssence: parseFloat(row.cost_essence) || 0,
          costMatter: parseFloat(row.cost_matter) || 0,
          costSubstance: parseFloat(row.cost_substance) || 0,
          isOneTime: row.is_one_time,
          isActive: row.is_active,
        };
      } catch (error) {
        _logger.error("[TokenEconomy] getShopItem failed:", error);
      }
    }

    return null;
  }

  /**
   * List active shop items, optionally filtered by category.
   */
  async getShopItems(opts?: { category?: string; onlyActive?: boolean }): Promise<Array<{
    id: string;
    slug: string;
    title: string;
    description: string | null;
    category: string;
    costSpirit: number;
    costEssence: number;
    costMatter: number;
    costSubstance: number;
    isOneTime: boolean;
    isActive: boolean;
    sortOrder: number;
  }>> {
    const db = await getDbModule();
    if (!db) return [];

    try {
      const where: string[] = [];
      const params: unknown[] = [];
      let idx = 1;

      if (opts?.category) {
        where.push(`category = $${idx++}`);
        params.push(opts.category);
      }
      if (opts?.onlyActive !== false) {
        where.push(`is_active = true`);
      }

      const whereClause = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

      const result = await db.executeQuery(
        `SELECT id, slug, title, description, category,
                cost_spirit, cost_essence, cost_matter, cost_substance,
                is_one_time, is_active, sort_order
         FROM shop_items
         ${whereClause}
         ORDER BY sort_order ASC, title ASC`,
        params,
      );

      return result.rows.map(row => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        description: row.description || null,
        category: row.category,
        costSpirit: parseFloat(row.cost_spirit) || 0,
        costEssence: parseFloat(row.cost_essence) || 0,
        costMatter: parseFloat(row.cost_matter) || 0,
        costSubstance: parseFloat(row.cost_substance) || 0,
        isOneTime: row.is_one_time,
        isActive: row.is_active,
        sortOrder: row.sort_order || 0,
      }));
    } catch (error) {
      _logger.error("[TokenEconomy] getShopItems failed:", error);
      return [];
    }
  }
}

export const tokenEconomy = new TokenEconomyService();
