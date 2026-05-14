import { randomUUID } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { withTransaction } from "@/lib/database";
import type { TokenType } from "@/types/economy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/economy/sync-debit
 *
 * Internal server-to-server endpoint for the planetary-agents action engine
 * to debit ESMS tokens from an agentic user when they perform an action
 * (feed post, transmutation, etc).
 *
 * Headers:
 *   X-Sync-Secret: <ALCHM_KITCHEN_SYNC_SECRET>
 *
 * Body: see SyncDebitBody.
 *
 * Responses:
 *   200 { ok: true, transactionGroupId, balances }
 *   401 { error: "Unauthorized" }
 *   400 { ok: false, reason: "invalid_request", message }
 *   404 { ok: false, reason: "user_not_found" }
 *   402 { ok: false, reason: "insufficient_funds", balances }
 *   409 { ok: false, reason: "already_applied" }
 *   500 { ok: false, reason: "internal_error", message }
 */

const AGENTIC_EMAIL_DOMAIN = "@agentic.alchm.kitchen";

interface SyncDebitBody {
  userEmail: string;
  amounts: {
    spirit?: number;
    essence?: number;
    matter?: number;
    substance?: number;
  };
  operationType?: string;
  source?: string;
  idempotencyKey: string;
  metadata?: Record<string, unknown>;
}

type BalancesDto = {
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
};

function toBalances(row: Record<string, unknown> | undefined): BalancesDto {
  return {
    spirit: parseFloat(String(row?.spirit ?? 0)) || 0,
    essence: parseFloat(String(row?.essence ?? 0)) || 0,
    matter: parseFloat(String(row?.matter ?? 0)) || 0,
    substance: parseFloat(String(row?.substance ?? 0)) || 0,
  };
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("X-Sync-Secret");
  const syncSecret = process.env.ALCHM_KITCHEN_SYNC_SECRET;
  if (!syncSecret || authHeader !== syncSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: SyncDebitBody;
  try {
    body = (await req.json()) as SyncDebitBody;
  } catch {
    return NextResponse.json(
      { ok: false, reason: "invalid_request", message: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const { userEmail, amounts, idempotencyKey, operationType, source, metadata } = body;
  if (!userEmail || !amounts || !idempotencyKey) {
    return NextResponse.json(
      {
        ok: false,
        reason: "invalid_request",
        message: "userEmail, amounts, and idempotencyKey are required",
      },
      { status: 400 },
    );
  }

  const spirit = Math.max(0, Number(amounts.spirit) || 0);
  const essence = Math.max(0, Number(amounts.essence) || 0);
  const matter = Math.max(0, Number(amounts.matter) || 0);
  const substance = Math.max(0, Number(amounts.substance) || 0);

  if (spirit + essence + matter + substance <= 0) {
    return NextResponse.json(
      {
        ok: false,
        reason: "invalid_request",
        message: "At least one token amount must be positive",
      },
      { status: 400 },
    );
  }

  const description = operationType
    ? `Agent op: ${operationType}${source ? ` (${source})` : ""}`
    : `Agent op${source ? ` (${source})` : ""}`;
  const sourceId = operationType ?? null;
  const email = userEmail.toLowerCase();

  try {
    const result = await withTransaction(async (client) => {
      // 1. Look up user — auto-provision if this is an agentic email and the
      //    user doesn't exist yet. Pre-seeding is therefore optional.
      let userRes = await client.query<{ id: string }>(
        "SELECT id FROM users WHERE email = $1 LIMIT 1",
        [email],
      );

      if (userRes.rowCount === 0) {
        if (!email.endsWith(AGENTIC_EMAIL_DOMAIN)) {
          return { kind: "user_not_found" as const };
        }
        userRes = await client.query<{ id: string }>(
          `INSERT INTO users (email, password_hash, role, is_active, email_verified, is_agent, profile, preferences)
           VALUES ($1, 'AGENT_NO_LOGIN', 'ALCHEMIST'::user_role, true, true, true, $2, '{}'::jsonb)
           ON CONFLICT (email) DO UPDATE SET is_agent = true
           RETURNING id`,
          [email, JSON.stringify({ email, isAgent: true })],
        );
      }
      const userId = userRes.rows[0].id;

      // 2. Idempotency check — child keys are per-token-type derived below.
      //    Any prior debit row for this group means this request was already applied.
      const dup = await client.query(
        `SELECT 1 FROM token_transactions
         WHERE idempotency_key LIKE $1 || ':%' LIMIT 1`,
        [idempotencyKey],
      );
      if ((dup.rowCount ?? 0) > 0) {
        return { kind: "already_applied" as const };
      }

      // 3. Ensure a balance row exists, then atomically check + debit all
      //    four token columns in a single UPDATE. If any column is short,
      //    rowCount = 0 and we return 402 with the current balances.
      await client.query(
        `INSERT INTO token_balances (user_id) VALUES ($1)
         ON CONFLICT (user_id) DO NOTHING`,
        [userId],
      );

      const updateRes = await client.query(
        `UPDATE token_balances
         SET spirit = spirit - $2,
             essence = essence - $3,
             matter = matter - $4,
             substance = substance - $5,
             updated_at = now()
         WHERE user_id = $1
           AND spirit >= $2
           AND essence >= $3
           AND matter >= $4
           AND substance >= $5
         RETURNING spirit, essence, matter, substance`,
        [userId, spirit, essence, matter, substance],
      );

      if (updateRes.rowCount === 0) {
        const currentRes = await client.query(
          `SELECT spirit, essence, matter, substance
           FROM token_balances WHERE user_id = $1`,
          [userId],
        );
        return {
          kind: "insufficient_funds" as const,
          balances: toBalances(currentRes.rows[0]),
        };
      }

      // 4. Write one ledger row per non-zero token type. The UNIQUE
      //    idempotency_key constraint is the ultimate guard against
      //    concurrent duplicates — if two requests race past step 2,
      //    the second INSERT will throw 23505 and roll back the txn.
      const groupId = randomUUID();
      const ledgerEntries: Array<{ token: TokenType; amount: number }> = (
        [
          { token: "Spirit", amount: spirit },
          { token: "Essence", amount: essence },
          { token: "Matter", amount: matter },
          { token: "Substance", amount: substance },
        ] as Array<{ token: TokenType; amount: number }>
      ).filter((e) => e.amount > 0);

      const metadataDescription =
        metadata && Object.keys(metadata).length > 0
          ? `${description} ${JSON.stringify(metadata)}`
          : description;

      for (const entry of ledgerEntries) {
        await client.query(
          `INSERT INTO token_transactions
             (transaction_group_id, user_id, token_type, amount,
              source_type, source_id, description, idempotency_key)
           VALUES ($1, $2, $3, -$4, 'agents_operation', $5, $6, $7)`,
          [
            groupId,
            userId,
            entry.token,
            entry.amount,
            sourceId,
            metadataDescription,
            `${idempotencyKey}:${entry.token}`,
          ],
        );
      }

      return {
        kind: "ok" as const,
        transactionGroupId: groupId,
        balances: toBalances(updateRes.rows[0]),
      };
    });

    switch (result.kind) {
      case "ok":
        return NextResponse.json({
          ok: true,
          transactionGroupId: result.transactionGroupId,
          balances: result.balances,
        });
      case "user_not_found":
        return NextResponse.json(
          { ok: false, reason: "user_not_found" },
          { status: 404 },
        );
      case "already_applied":
        return NextResponse.json(
          { ok: false, reason: "already_applied" },
          { status: 409 },
        );
      case "insufficient_funds":
        return NextResponse.json(
          {
            ok: false,
            reason: "insufficient_funds",
            balances: result.balances,
          },
          { status: 402 },
        );
    }
  } catch (error) {
    // Unique-violation on idempotency_key means a concurrent duplicate slipped
    // past the pre-check — surface it as the same 409.
    if ((error as { code?: string })?.code === "23505") {
      return NextResponse.json(
        { ok: false, reason: "already_applied" },
        { status: 409 },
      );
    }
    console.error("[sync-debit] Internal Error:", error);
    return NextResponse.json(
      {
        ok: false,
        reason: "internal_error",
        message: (error as Error).message,
      },
      { status: 500 },
    );
  }
}
