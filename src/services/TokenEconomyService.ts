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
import {
  columnFor,
  creditTokensSql,
  SIGNUP_GRANT_PER_TOKEN,
  TOKEN_TYPES,
  dailyClaimTimestampSql,
  debitAllTokensSql,
  debitTokensSql,
  getBalancesSql,
  hasActivePurchaseSql,
  idempotencyProbeSql,
  shopItemDetailSql,
  shopItemForPurchaseSql,
  shopItemsSql,
  transactionCountSql,
  transactionsPageSql,
  transmuteSql,
  userOwnsItemSql,
} from "@/services/tokenEconomyQueries";
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
        const query = getBalancesSql(userId);
        const result = await db.executeQuery(query.sql, query.values);
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

    if (db) {
      try {
        // Single atomic statement (insert ledger row + apply delta).
        const query = creditTokensSql({
          userId,
          tokenType,
          amount,
          sourceType,
          sourceId: opts?.sourceId || null,
          description: opts?.description || null,
          transactionGroupId: opts?.transactionGroupId || null,
          idempotencyKey: opts?.idempotencyKey || null,
        });
        const result = await db.executeQuery(query.sql, query.values);

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
    balances[columnFor(tokenType)] += amount;
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

    const db = await getDbModule();

    if (db) {
      try {
        const query = debitTokensSql({
          userId,
          tokenType,
          amount,
          sourceType,
          sourceId: opts?.sourceId || null,
          transactionGroupId: opts?.transactionGroupId || null,
          description: opts?.description || null,
        });
        const result = await db.executeQuery(query.sql, query.values);

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
    const column = columnFor(tokenType);
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
          const probe = idempotencyProbeSql(idemKey);
          const dup = await db.executeQuery(probe.sql, probe.values);
          if (dup.rows.length > 0) {
            return { success: false, reason: "already_applied" };
          }
        }

        const query = debitAllTokensSql({
          userId,
          amounts,
          description: opts?.description || null,
          idempotencyKey: idemKey,
          intent: {
            kind: "spend",
            sourceType,
            sourceId: opts?.sourceId || null,
          },
        });
        const result = await db.executeQuery(query.sql, query.values);

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
            const idemKey = opts?.idempotencyKey
              ? `${opts.idempotencyKey}:${tokenType}`
              : null;
            const query = creditTokensSql({
              userId,
              tokenType,
              amount,
              sourceType,
              sourceId: opts?.sourceId || null,
              description: opts?.description || null,
              transactionGroupId: groupId,
              idempotencyKey: idemKey,
            });
            const res = await client.query(query.sql, query.values);
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

  /** Welcome grant: every new user starts with this even ESMS balance.
   *  Defined in `tokenEconomyQueries` so `createUser` — which now seeds the
   *  grant in the same transaction as the user row — cannot drift from it. */
  static readonly SIGNUP_GRANT_PER_TOKEN = SIGNUP_GRANT_PER_TOKEN;

  /**
   * Heal a user's one-time welcome balance.
   *
   * NOT the primary producer any more. `userDatabase.createUser` seeds the
   * grant in the same transaction as the user row, so a user cannot be created
   * without one. This remains the repair path for users created before that —
   * and for any future path that manages to insert a user row some other way.
   *
   * `[MEASURED 2026-08-10]` why the primary moved: this method is reachable
   * from exactly one call site, the NextAuth `signIn` callback. Two OTHER code
   * paths create users (the JIT fallback in the `jwt` callback, and the JIT
   * heal in `getDatabaseUserFromRequest`), and neither granted. 6 of 14 human
   * signups were created by those paths and held nothing. The "self-heals on
   * every sign-in" promise below could never rescue them, because the sign-in
   * callback it lives in is the one that never completed for them — all 6 had
   * `login_count = 0` and no `accounts` row, months later.
   *
   * Idempotent via the per-user key `signup_grant:<userId>` (per-token under
   * the hood, see `signupGrantIdempotencyKey`), so it is safe to call on every
   * sign-in and safe to run alongside the `createUser` seed: whichever writes
   * first wins and the other hits `ON CONFLICT DO NOTHING`.
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
    const credits = (TOKEN_TYPES as readonly TokenType[]).map((tokenType) => ({
      tokenType,
      amount,
    }));
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
    const db = await getDbModule();

    if (db) {
      try {
        const query = dailyClaimTimestampSql({ userId, site });
        await db.executeQuery(query.sql, query.values);
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
   *
   * Pass `opts.idempotencyKey` to make a retry safe. Without one, a client that
   * retries after a network error transmutes a SECOND time and is debited
   * twice — every other money-moving path here takes a key for exactly that
   * reason. With one, the unique index on `token_transactions.idempotency_key`
   * rejects the duplicate and this returns null rather than charging again.
   */
  async transmute(
    userId: string,
    fromToken: TokenType,
    toToken: TokenType,
    targetAmount: number,
    opts?: { idempotencyKey?: string },
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
        const query = transmuteSql({
          fromColumn,
          toColumn,
          userId,
          costAmount,
          targetAmount,
          transactionGroupId: groupId,
          fromToken,
          toToken,
          debitDescription: `Transmute ${costAmount} ${fromToken} → ${targetAmount} ${toToken}`,
          creditDescription: `Received from transmutation of ${fromToken}`,
          idempotencyKey: opts?.idempotencyKey ?? null,
        });
        const result = await db.executeQuery(query.sql, query.values);

        if (result.rows.length === 0) {
          return null;
        }

        return {
          spent: { tokenType: fromToken, amount: costAmount },
          received: { tokenType: toToken, amount: targetAmount },
          newBalances: rowToBalances(result.rows[0]),
        };
      } catch (error) {
        // Unique-violation on idempotency_key: this transmutation already ran.
        // Returning null means the caller reports it as not-applied, which is
        // correct — the point is that the user is NOT debited a second time.
        if ((error as { code?: string })?.code === "23505") {
          _logger.info(
            "[TokenEconomy] Duplicate transmutation blocked by idempotency key:",
            opts?.idempotencyKey,
          );
          return null;
        }
        _logger.error("[TokenEconomy] transmute DB failed:", error);
        return null;
      }
    }

    // In-memory fallback. No idempotency guard here: `debitTokens` takes no key
    // and this path has no durable ledger to enforce one against. It runs only
    // when there is no database at all.
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
        const page = transactionsPageSql({ userId, limit, offset });
        const count = transactionCountSql(userId);
        const [txnResult, countResult] = await Promise.all([
          db.executeQuery(page.sql, page.values),
          db.executeQuery(count.sql, count.values),
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
        const lookup = shopItemForPurchaseSql(shopItemSlug);
        const itemResult = await db.executeQuery(lookup.sql, lookup.values);
        const item = itemResult.rows[0];
        if (!item) {
          _logger.warn("[TokenEconomy] Shop item not found:", shopItemSlug);
          return { success: false, reason: "item_not_found" };
        }

        // 2. Check if one-time item already purchased
        if (item.is_one_time) {
          const owned = userOwnsItemSql({ userId, slug: shopItemSlug });
          const existing = await db.executeQuery(owned.sql, owned.values);
          if (existing.rows.length > 0) {
            _logger.info("[TokenEconomy] One-time item already purchased:", shopItemSlug);
            return { success: false, reason: "already_owned" };
          }
        }

        // 2b. Idempotency pre-check: reject duplicate submissions (client retry after network error)
        const idemKey = opts?.idempotencyKey ?? null;
        if (idemKey) {
          const probe = idempotencyProbeSql(idemKey);
          const dup = await db.executeQuery(probe.sql, probe.values);
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

        // 3. Atomic: check balance + debit + record purchase in one statement.
        const query = debitAllTokensSql({
          userId,
          amounts: costs,
          description,
          idempotencyKey: idemKey,
          intent: { kind: "purchase", shopItemId: item.id },
        });
        const result = await db.executeQuery(query.sql, query.values);

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
        const query = hasActivePurchaseSql({
          userId,
          slug: shopItemSlug,
          maxAgeDays,
        });
        const result = await db.executeQuery(query.sql, query.values);
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
        const query = shopItemDetailSql(slug);
        const result = await db.executeQuery(query.sql, query.values);
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
      const query = shopItemsSql(opts);
      const result = await db.executeQuery(query.sql, query.values);

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
