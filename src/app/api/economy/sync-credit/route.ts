import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/database";
import { tokenEconomy } from "@/services/TokenEconomyService";
import { TokenType, TransactionSourceType } from "@/types/economy";

/**
 * POST /api/economy/sync-credit
 * 
 * Internal server-to-server endpoint for syncing token credits from planetary-agents.
 * 
 * Headers:
 *   X-Sync-Secret: <ALCHM_KITCHEN_SYNC_SECRET>
 * 
 * Body:
 *   {
 *     userEmail: string,
 *     amounts: { spirit: number, essence: number, matter: number, substance: number },
 *     source: string,
 *     idempotencyKey: string
 *   }
 */
interface SyncCreditBody {
  userEmail: string;
  amounts: {
    spirit?: number;
    essence?: number;
    matter?: number;
    substance?: number;
  };
  source?: TransactionSourceType;
  idempotencyKey: string;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Validate Sync Secret
    const authHeader = req.headers.get("X-Sync-Secret");
    const syncSecret = process.env.ALCHM_KITCHEN_SYNC_SECRET;

    if (!syncSecret || authHeader !== syncSecret) {
      return NextResponse.json(
        { ok: false, reason: "unauthorized" },
        { status: 401 }
      );
    }

    const body = (await req.json()) as SyncCreditBody;
    const { userEmail, amounts, source, idempotencyKey } = body;

    if (!userEmail || !amounts || !idempotencyKey) {
      return NextResponse.json(
        { ok: false, reason: "invalid_request", message: "Missing required fields" },
        { status: 400 }
      );
    }

    // 2. Look up user ID by email
    const userResult = await executeQuery<{ id: string }>(
      "SELECT id FROM users WHERE email = $1 LIMIT 1",
      [userEmail]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { ok: false, reason: "user_not_found" },
        { status: 404 }
      );
    }

    const userId = userResult.rows[0].id;

    // 3. Check for existing idempotency hit (TokenEconomyService handles this in creditMultipleTokens, 
    // but the requirement says to check it explicitly)
    const existingTxn = await executeQuery(
      "SELECT id FROM token_transactions WHERE idempotency_key = $1 LIMIT 1",
      [idempotencyKey]
    );

    if (existingTxn.rows.length > 0) {
      return NextResponse.json(
        { ok: false, reason: "already_applied" },
        { status: 409 }
      );
    }

    // 4. Transform amounts to Credit array
    const credits: Array<{ tokenType: TokenType; amount: number }> = [
      { tokenType: "Spirit" as const, amount: amounts.spirit || 0 },
      { tokenType: "Essence" as const, amount: amounts.essence || 0 },
      { tokenType: "Matter" as const, amount: amounts.matter || 0 },
      { tokenType: "Substance" as const, amount: amounts.substance || 0 },
    ].filter(c => c.amount > 0);

    // 5. Apply credits
    const result = await tokenEconomy.creditMultipleTokens(
      userId,
      credits,
      source || "agents_yield",
      {
        idempotencyKey,
        description: `Sync: ${source || 'agents_yield'}`,
      }
    );

    if (!result) {
      // This might happen if idempotency was hit inside the service (race condition)
      return NextResponse.json(
        { ok: false, reason: "already_applied" },
        { status: 409 }
      );
    }

    // 6. Success Response
    return NextResponse.json({
      ok: true,
      balances: {
        spirit: result.spirit,
        essence: result.essence,
        matter: result.matter,
        substance: result.substance,
      },
    });

  } catch (error) {
    console.error("[sync-credit] Internal Error:", error);
    return NextResponse.json(
      { ok: false, reason: "internal_error", message: (error as Error).message },
      { status: 500 }
    );
  }
}
