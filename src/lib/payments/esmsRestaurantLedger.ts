import "server-only";

import { randomUUID } from "node:crypto";
import { withTransaction } from "@/lib/database";
import {
  esmsBasketTotal,
  esmsRestaurantAggregateDailyCap,
  esmsRestaurantPerUserDailyCap,
  type EsmsBasketCost,
} from "@/lib/payments/restaurantEsms";
import type { TokenBalances, TokenType } from "@/types/economy";

export type RedemptionCapScope = "per_user" | "aggregate";

export interface RedemptionCapInfo {
  scope: RedemptionCapScope;
  /** Cap ceiling in tokens for the UTC day. */
  limit: number;
  /** Tokens already redeemed for food in the window before this order. */
  used: number;
  /** Tokens this order would redeem. */
  requested: number;
}

interface ReservationResult {
  reserved: boolean;
  alreadyReserved: boolean;
  balances: TokenBalances | null;
  /** Set when the reservation was refused because a daily cap would be exceeded. */
  capExceeded: RedemptionCapInfo | null;
}

// Stable 64-bit key so every restaurant-redemption reservation that needs a
// cap check serializes on the same advisory lock — without it, two concurrent
// orders could each read the pre-debit total and both slip past an aggregate
// (or same-user) ceiling. Held only for the transaction; pilot volume is low.
const CAP_LOCK_KEY = "esms_restaurant_redemption_cap";

function rowToBalances(row: Record<string, unknown>): TokenBalances {
  return {
    spirit: Number(row.spirit) || 0,
    essence: Number(row.essence) || 0,
    matter: Number(row.matter) || 0,
    substance: Number(row.substance) || 0,
    lastDailyClaimAt:
      row.last_daily_claim_at instanceof Date
        ? row.last_daily_claim_at.toISOString()
        : (row.last_daily_claim_at as string | null) ?? null,
    lastDailyClaimAgentsAt:
      row.last_daily_claim_agents_at instanceof Date
        ? row.last_daily_claim_agents_at.toISOString()
        : (row.last_daily_claim_agents_at as string | null) ?? null,
    updatedAt:
      row.updated_at instanceof Date
        ? row.updated_at.toISOString()
        : String(row.updated_at ?? new Date().toISOString()),
  };
}

export async function reserveEsmsForRestaurantOrder(input: {
  orderId: string;
  userId: string;
  restaurantName: string;
  cost: EsmsBasketCost;
}): Promise<ReservationResult> {
  return withTransaction(async (client) => {
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [input.orderId]);

    const existing = await client.query(
      `SELECT 1
       FROM token_transactions
       WHERE source_type = 'restaurant_order'
         AND source_id = $1
       LIMIT 1`,
      [input.orderId],
    );

    if (existing.rows.length > 0) {
      const current = await client.query(
        "SELECT * FROM token_balances WHERE user_id = $1",
        [input.userId],
      );
      return {
        reserved: true,
        alreadyReserved: true,
        balances: current.rows[0] ? rowToBalances(current.rows[0]) : null,
        capExceeded: null,
      };
    }

    // Enforce per-user and aggregate daily redemption caps before any debit.
    // Counts gross restaurant_order debits in the current UTC day; refunds use
    // a different source_type so a refunded order still counts toward the day's
    // cap (conservative — resets at the next UTC day).
    const perUserCap = esmsRestaurantPerUserDailyCap();
    const aggregateCap = esmsRestaurantAggregateDailyCap();
    const requested = esmsBasketTotal(input.cost);

    if ((perUserCap > 0 || aggregateCap > 0) && requested > 0) {
      // Serialize concurrent cap checks so two orders can't both pass.
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [
        CAP_LOCK_KEY,
      ]);

      if (perUserCap > 0) {
        const perUser = await client.query<{ used: string }>(
          `SELECT COALESCE(SUM(-amount), 0) AS used
           FROM token_transactions
           WHERE source_type = 'restaurant_order'
             AND amount < 0
             AND user_id = $1
             AND created_at >= date_trunc('day', now())`,
          [input.userId],
        );
        const used = Number(perUser.rows[0]?.used) || 0;
        if (used + requested > perUserCap) {
          return {
            reserved: false,
            alreadyReserved: false,
            balances: null,
            capExceeded: {
              scope: "per_user",
              limit: perUserCap,
              used,
              requested,
            },
          };
        }
      }

      if (aggregateCap > 0) {
        const aggregate = await client.query<{ used: string }>(
          `SELECT COALESCE(SUM(-amount), 0) AS used
           FROM token_transactions
           WHERE source_type = 'restaurant_order'
             AND amount < 0
             AND created_at >= date_trunc('day', now())`,
        );
        const used = Number(aggregate.rows[0]?.used) || 0;
        if (used + requested > aggregateCap) {
          return {
            reserved: false,
            alreadyReserved: false,
            balances: null,
            capExceeded: {
              scope: "aggregate",
              limit: aggregateCap,
              used,
              requested,
            },
          };
        }
      }
    }

    await client.query(
      `INSERT INTO token_balances (user_id)
       VALUES ($1)
       ON CONFLICT (user_id) DO NOTHING`,
      [input.userId],
    );

    const updated = await client.query(
      `UPDATE token_balances
       SET spirit = spirit - $2,
           essence = essence - $3,
           matter = matter - $4,
           substance = substance - $5,
           updated_at = NOW()
       WHERE user_id = $1
         AND spirit >= $2
         AND essence >= $3
         AND matter >= $4
         AND substance >= $5
       RETURNING *`,
      [
        input.userId,
        input.cost.spirit,
        input.cost.essence,
        input.cost.matter,
        input.cost.substance,
      ],
    );

    if (updated.rows.length === 0) {
      return {
        reserved: false,
        alreadyReserved: false,
        balances: null,
        capExceeded: null,
      };
    }

    const transactionGroupId = randomUUID();
    const entries: Array<[TokenType, number]> = [
      ["Spirit", input.cost.spirit],
      ["Essence", input.cost.essence],
      ["Matter", input.cost.matter],
      ["Substance", input.cost.substance],
    ];

    for (const [tokenType, amount] of entries) {
      if (amount <= 0) continue;
      await client.query(
        `INSERT INTO token_transactions (
           transaction_group_id, user_id, token_type, amount, source_type,
           source_id, description, idempotency_key
         ) VALUES ($1, $2, $3, $4, 'restaurant_order', $5, $6, $7)`,
        [
          transactionGroupId,
          input.userId,
          tokenType,
          -amount,
          input.orderId,
          `Restaurant order at ${input.restaurantName}`,
          `restaurant_order:${input.orderId}:${tokenType}`,
        ],
      );
    }

    return {
      reserved: true,
      alreadyReserved: false,
      balances: rowToBalances(updated.rows[0]),
      capExceeded: null,
    };
  });
}

