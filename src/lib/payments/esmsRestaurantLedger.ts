import "server-only";

import { randomUUID } from "node:crypto";
import { withTransaction } from "@/lib/database";
import type { EsmsBasketCost } from "@/lib/payments/restaurantEsms";
import type { TokenBalances, TokenType } from "@/types/economy";

interface ReservationResult {
  reserved: boolean;
  alreadyReserved: boolean;
  balances: TokenBalances | null;
}

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
      };
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
      return { reserved: false, alreadyReserved: false, balances: null };
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
    };
  });
}

