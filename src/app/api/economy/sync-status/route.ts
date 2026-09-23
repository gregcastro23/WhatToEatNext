/**
 * GET /api/economy/sync-status
 *
 * Checks if a specific idempotency key or escrow conversion has been applied
 * to the token ledger or webhook inbox.
 *
 * Queried by Pentacles Reconciler (alchm-agents-solana).
 *
 * Headers:
 *   X-Sync-Secret: <ALCHM_KITCHEN_SYNC_SECRET>
 *
 * Query params:
 *   ?idempotencyKey=<key>
 *
 * Response:
 *   { ok: true, idempotencyKey: string, applied: boolean }
 *
 * CRITICAL INVARIANT:
 *   Never return `applied: false` on an internal error or query failure —
 *   returning false on error would cause the caller to initiate an erroneous refund.
 *   Always return 5xx on database or server error.
 */

import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/database/connection";
import { safeEqual } from "@/lib/hooks/secureCompare";
import { _logger } from "@/lib/logger";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const syncSecret = process.env.ALCHM_KITCHEN_SYNC_SECRET;
  const syncHeader = request.headers.get("x-sync-secret");

  if (!safeEqual(syncHeader, syncSecret)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const idempotencyKey = searchParams.get("idempotencyKey");

  if (!idempotencyKey || idempotencyKey.trim().length === 0) {
    return NextResponse.json(
      { ok: false, error: "Missing required query parameter: idempotencyKey" },
      { status: 400 },
    );
  }

  const key = idempotencyKey.trim();

  try {
    // 1. Probe token_transactions for direct match or prefix match
    const prefix = `${key}:%`;
    const txnResult = await executeQuery<{ id: string | number }>(
      `SELECT id FROM token_transactions
        WHERE idempotency_key = $1
           OR idempotency_key LIKE $2
           OR source_id = $1
           OR description LIKE $2
        LIMIT 1`,
      [key, prefix],
    );

    if (txnResult.rows.length > 0) {
      return NextResponse.json({
        ok: true,
        idempotencyKey: key,
        applied: true,
      });
    }

    // 2. Probe webhook_events for processed delivery
    const hookResult = await executeQuery<{ id: string | number }>(
      `SELECT id FROM webhook_events
        WHERE event_id = $1
          AND status = 'processed'
        LIMIT 1`,
      [key],
    );

    const applied = hookResult.rows.length > 0;

    return NextResponse.json({
      ok: true,
      idempotencyKey: key,
      applied,
    });
  } catch (error) {
    _logger.error("[GET /api/economy/sync-status] Database probe failed:", error);
    // CRITICAL: return 500 on database failure, NEVER applied: false
    return NextResponse.json(
      { ok: false, error: "database_error", message: "Ledger status probe failed" },
      { status: 500 },
    );
  }
}
