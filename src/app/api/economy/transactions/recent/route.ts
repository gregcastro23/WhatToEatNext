/**
 * GET /api/economy/transactions/recent
 *
 * Public ticker of the most recent token movements across the entire network
 * (no per-user scoping). Used by the Live Network Feed page so visitors can
 * watch the alchemical economy breathe in real time.
 */

import { NextResponse, type NextRequest } from "next/server";
import { executeQuery } from "@/lib/database";
import { redisCached } from "@/lib/redis";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Public, globally-shared ticker polled every ~30s by the Live Network Feed.
// A short shared cache collapses the per-client poll storm into one query per
// limit per TTL (fails open to a direct read). A handful of seconds of lag on
// a "recent transactions" ticker is imperceptible.
const TXNS_CACHE_TTL_SECONDS = 10;

interface TxnRow {
  id: string;
  transaction_group_id: string;
  user_id: string;
  token_type: string;
  amount: string;
  source_type: string;
  description: string | null;
  created_at: string;
  is_agent: boolean | null;
  actor_name: string | null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "30", 10), 100);

  try {
    const transactions = await redisCached(
      `economy:txns:recent:${limit}`,
      TXNS_CACHE_TTL_SECONDS,
      async () => {
        const result = await executeQuery<TxnRow>(
          `SELECT t.id::text,
                  t.transaction_group_id::text,
                  t.user_id::text,
                  t.token_type,
                  t.amount::text,
                  t.source_type,
                  t.description,
                  t.created_at,
                  u.is_agent,
                  up.name AS actor_name
             FROM token_transactions t
             JOIN users u ON u.id = t.user_id
             LEFT JOIN user_profiles up ON up.user_id = u.id
            ORDER BY t.created_at DESC
            LIMIT $1`,
          [limit],
        );

        return result.rows.map((row) => ({
          id: row.id,
          transactionGroupId: row.transaction_group_id,
          userId: row.user_id,
          tokenType: row.token_type,
          amount: parseFloat(row.amount) || 0,
          sourceType: row.source_type,
          description: row.description,
          createdAt: row.created_at,
          actorIsAgent: row.is_agent === true,
          actorName: row.actor_name || (row.is_agent ? "Agent" : "Alchemist"),
        }));
      },
    );

    return NextResponse.json(
      { success: true, transactions },
      {
        headers: {
          "Cache-Control": `public, s-maxage=${TXNS_CACHE_TTL_SECONDS}, stale-while-revalidate=30`,
        },
      },
    );
  } catch (error) {
    console.error("[GET /api/economy/transactions/recent]", error);
    return NextResponse.json(
      { success: false, message: "Failed to load transactions", transactions: [] },
      { status: 500 },
    );
  }
}
