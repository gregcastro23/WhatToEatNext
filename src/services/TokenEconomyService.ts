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
  TOKEN_TYPES,
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

function rowToBalances(row: any): TokenBalances {
  return {
    spirit: parseFloat(row.spirit) || 0,
    essence: parseFloat(row.essence) || 0,
    matter: parseFloat(row.matter) || 0,
    substance: parseFloat(row.substance) || 0,
    lastDailyClaimAt: row.last_daily_claim_at?.toISOString?.() || row.last_daily_claim_at || null,
    updatedAt: row.updated_at?.toISOString?.() || row.updated_at || new Date().toISOString(),
  };
}

function rowToTransaction(row: any): TokenTransaction {
  return {
    id: row.id,
    transactionGroupId: row.transaction_group_id,
    userId: row.user_id,
    tokenType: row.token_type as TokenType,
    amount: parseFloat(row.amount),
    sourceType: row.source_type as TransactionSourceType,
    sourceId: row.source_id || null,
    description: row.description || null,
    createdAt: row.created_at?.toISOString?.() || row.created_at,
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
        const result = await db.executeQuery(
          `INSERT INTO token_balances (user_id)
           VALUES ($1)
           ON CONFLICT (user_id) DO NOTHING;
           SELECT * FROM token_balances WHERE user_id = $1`,
          [userId],
        );
        // executeQuery returns the last statement's result
        if (result.rows.length > 0) {
          return rowToBalances(result.rows[0]);
        }
      } catch {
        // Fallback: separate queries if multi-statement not supported
        try {
          await db.executeQuery(
            `INSERT INTO token_balances (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`,
            [userId],
          );
          const result = await db.executeQuery(
            `SELECT * FROM token_balances WHERE user_id = $1`,
            [userId],
          );
          if (result.rows.length > 0) {
            return rowToBalances(result.rows[0]);
          }
        } catch (error) {
          _logger.error("[TokenEconomy] getBalances failed:", error as any);
        }
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
        // Use a transaction for atomicity
        const result = await db.executeQuery(
          `WITH ensure_balance AS (
            INSERT INTO token_balances (user_id)
            VALUES ($1)
            ON CONFLICT (user_id) DO NOTHING
          ),
          inserted AS (
            INSERT INTO token_transactions
              (transaction_group_id, user_id, token_type, amount, source_type, source_id, description, idempotency_key)
            VALUES
              (COALESCE($7::uuid, uuid_generate_v4()), $1, $2, $3, $4, $5, $6, $8)
            ON CONFLICT (idempotency_key) DO NOTHING
            RETURNING id
          )
          UPDATE token_balances
          SET ${column} = ${column} + $3,
              updated_at = now()
          WHERE user_id = $1
            AND EXISTS (SELECT 1 FROM inserted)
          RETURNING *`,
          [
            userId,
            tokenType,
            amount,
            sourceType,
            opts?.sourceId || null,
            opts?.description || null,
            opts?.transactionGroupId || null,
            opts?.idempotencyKey || null,
          ],
        );

        if (result.rows.length > 0) {
          return rowToBalances(result.rows[0]);
        }

        // Idempotency blocked: return current balance
        if (opts?.idempotencyKey) {
          return this.getBalances(userId);
        }
        return null;
      } catch (error) {
        _logger.error("[TokenEconomy] creditTokens failed:", error as any);
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
          `WITH ensure_balance AS (
            INSERT INTO token_balances (user_id)
            VALUES ($1)
            ON CONFLICT (user_id) DO NOTHING
          ),
          check_balance AS (
            SELECT ${column} AS current_balance FROM token_balances WHERE user_id = $1
          ),
          inserted AS (
            INSERT INTO token_transactions
              (transaction_group_id, user_id, token_type, amount, source_type, source_id, description)
            SELECT COALESCE($6::uuid, uuid_generate_v4()), $1, $2, -$3, $4, $5, $7
            FROM check_balance
            WHERE current_balance >= $3
            RETURNING id
          )
          UPDATE token_balances
          SET ${column} = ${column} - $3,
              updated_at = now()
          WHERE user_id = $1
            AND EXISTS (SELECT 1 FROM inserted)
          RETURNING *`,
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
        _logger.error("[TokenEconomy] debitTokens failed:", error as any);
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
        // Idempotency blocked — already claimed
        return null;
      }
    }

    return lastBalances || this.getBalances(userId);
  }

  // ═══════════════════════════════════════════════════════════════════
  // DAILY CLAIM TRACKING
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Update the last_daily_claim_at timestamp.
   */
  async updateDailyClaimTimestamp(userId: string): Promise<void> {
    const db = await getDbModule();

    if (db) {
      try {
        await db.executeQuery(
          `UPDATE token_balances SET last_daily_claim_at = now(), updated_at = now() WHERE user_id = $1`,
          [userId],
        );
      } catch (error) {
        _logger.error("[TokenEconomy] updateDailyClaimTimestamp failed:", error as any);
      }
    }

    // In-memory
    const bal = memoryBalances.get(userId);
    if (bal) {
      bal.lastDailyClaimAt = new Date().toISOString();
    }
  }

  /**
   * Check if a user has already claimed their daily yield today.
   */
  async hasClaimedToday(userId: string): Promise<boolean> {
    const balances = await this.getBalances(userId);
    if (!balances.lastDailyClaimAt) return false;

    const lastClaim = new Date(balances.lastDailyClaimAt);
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
          `WITH ensure_balance AS (
            INSERT INTO token_balances (user_id)
            VALUES ($1)
            ON CONFLICT (user_id) DO NOTHING
          ),
          check_balance AS (
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
        _logger.error("[TokenEconomy] transmute DB failed:", error as any);
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
        _logger.error("[TokenEconomy] getTransactions failed:", error as any);
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
    },
  ): Promise<
    | { success: true; balances: TokenBalances; transactionGroupId: string }
    | { success: false; reason: "item_not_found" | "already_owned" | "insufficient_funds" | "purchase_failed" }
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

        const costs = opts?.overrideCosts || {
          spirit: parseFloat(item.cost_spirit) || 0,
          essence: parseFloat(item.cost_essence) || 0,
          matter: parseFloat(item.cost_matter) || 0,
          substance: parseFloat(item.cost_substance) || 0,
        };
        const description = opts?.descriptionSuffix
          ? `Shop: ${item.title} (${opts.descriptionSuffix})`
          : `Shop: ${item.title}`;

        // 3. Atomic: check balance + debit + record purchase in one CTE
        const result = await db.executeQuery(
          `WITH ensure_balance AS (
            INSERT INTO token_balances (user_id) VALUES ($1)
            ON CONFLICT (user_id) DO NOTHING
          ),
          balance_check AS (
            SELECT * FROM token_balances WHERE user_id = $1
            AND spirit >= $2 AND essence >= $3 AND matter >= $4 AND substance >= $5
          ),
          new_group AS (
            SELECT uuid_generate_v4() AS gid
          ),
          debit_spirit AS (
            INSERT INTO token_transactions (transaction_group_id, user_id, token_type, amount, source_type, source_id, description)
            SELECT g.gid, $1, 'Spirit', -$2, 'premium_purchase', $6, $7
            FROM balance_check bc, new_group g
            WHERE $2 > 0
            RETURNING id
          ),
          debit_essence AS (
            INSERT INTO token_transactions (transaction_group_id, user_id, token_type, amount, source_type, source_id, description)
            SELECT g.gid, $1, 'Essence', -$3, 'premium_purchase', $6, $7
            FROM balance_check bc, new_group g
            WHERE $3 > 0
            RETURNING id
          ),
          debit_matter AS (
            INSERT INTO token_transactions (transaction_group_id, user_id, token_type, amount, source_type, source_id, description)
            SELECT g.gid, $1, 'Matter', -$4, 'premium_purchase', $6, $7
            FROM balance_check bc, new_group g
            WHERE $4 > 0
            RETURNING id
          ),
          debit_substance AS (
            INSERT INTO token_transactions (transaction_group_id, user_id, token_type, amount, source_type, source_id, description)
            SELECT g.gid, $1, 'Substance', -$5, 'premium_purchase', $6, $7
            FROM balance_check bc, new_group g
            WHERE $5 > 0
            RETURNING id
          ),
          updated AS (
            UPDATE token_balances
            SET spirit = spirit - $2,
                essence = essence - $3,
                matter = matter - $4,
                substance = substance - $5,
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
        _logger.error("[TokenEconomy] purchaseShopItem failed:", error as any);
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
        _logger.error("[TokenEconomy] hasActivePurchase failed:", error as any);
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
        _logger.error("[TokenEconomy] getShopItem failed:", error as any);
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
      _logger.error("[TokenEconomy] getShopItems failed:", error as any);
      return [];
    }
  }
}

export const tokenEconomy = new TokenEconomyService();
