/**
 * Admin Token Grant API Route
 * POST /api/admin/users/[userId]/grant — Grant ESMS tokens to a user
 *
 * @requires Authentication - Admin role required
 *
 * This is the clickable, audit-logged equivalent of
 * scripts/grant-test-tokens.ts — it lets an admin top up a specific
 * user from the admin panel rather than the CLI. Two safety properties
 * mirror the script:
 *
 *   1. Admin gate via validateAdminRequest before any DB write.
 *   2. Required `idempotencyKey` in the body so repeat presses of a
 *      button (e.g. a network retry) never double-credit. Reusing a
 *      key returns the existing balance unchanged.
 *
 * Body shape:
 * ```
 * {
 *   credits: [
 *     { tokenType: "Spirit", amount: 5 },
 *     { tokenType: "Essence", amount: 5 },
 *     { tokenType: "Matter", amount: 5 },
 *     { tokenType: "Substance", amount: 5 }
 *   ],
 *   idempotencyKey: "admin-grant-<...>",
 *   description?: "Optional human-readable reason"
 * }
 * ```
 */

import { NextResponse, type NextRequest } from "next/server";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { _logger } from "@/lib/logger";
import { AdminGrantTokensRequestSchema } from "@/lib/validation/apiSchemas";
import {
  isMissingUserFailure,
  tokenEconomy,
  type CreditResult,
} from "@/services/TokenEconomyService";
import type { TokenType } from "@/types/economy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * A rolled-back grant, reported as one. Names the SQLSTATE rather than
 * guessing a cause: 22P02 carries no constraint at all, and 23503 can name
 * either of two user FKs, so only those two justify "no such user".
 */
function failureResponse(
  outcome: Extract<CreditResult, { status: "failed" }>,
): NextResponse {
  const missingUser = isMissingUserFailure(outcome);
  const detail = outcome.code
    ? ` (${outcome.code}${outcome.constraint ? ` ${outcome.constraint}` : ""})`
    : "";
  return NextResponse.json(
    {
      success: false,
      result: "failed",
      code: outcome.code,
      constraint: outcome.constraint,
      message: missingUser
        ? `The database rejected that user id${detail}. No tokens were credited.`
        : `The grant transaction rolled back${detail}. No tokens were credited.`,
    },
    { status: missingUser ? 404 : 500 },
  );
}

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ userId: string }> },
) {
  const authResult = await validateAdminRequest(request);
  if ("error" in authResult) {
    return authResult.error;
  }

  const { userId } = await props.params;
  if (!userId || !/^[0-9a-f-]{8,}$/i.test(userId)) {
    return NextResponse.json(
      { success: false, message: "Invalid userId" },
      { status: 400 },
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
  }

  const parsed = AdminGrantTokensRequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid body";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
  const body = parsed.data;

  // Coalesce duplicate tokenType entries — if the caller sends two
  // { tokenType: "Spirit" } credits we fold them so the per-tokenType
  // idempotency keys inside creditMultipleTokens stay unique.
  const merged = new Map<TokenType, number>();
  for (const c of body.credits) {
    merged.set(c.tokenType, (merged.get(c.tokenType) ?? 0) + c.amount);
  }
  const credits = Array.from(merged.entries()).map(([tokenType, amount]) => ({
    tokenType,
    amount,
  }));

  try {
    // Deliberately the *Detailed* variant. `creditMultipleTokens` answers
    // `TokenBalances | null`, and for sourceType "admin" a null can only mean
    // the transaction rolled back — the daily-yield carve-out that also returns
    // null is backed by an index covering DAILY_YIELD_SOURCES only, and a
    // genuine idempotency replay returns balances rather than null. Reading
    // that null as "already granted" told the operator a lost grant had landed.
    const outcome = await tokenEconomy.creditMultipleTokensDetailed(
      userId,
      credits,
      "admin",
      {
        description: body.description ?? `Admin grant by ${authResult.user.email}`,
        idempotencyKey: body.idempotencyKey,
      },
    );

    switch (outcome.status) {
      case "credited":
        return NextResponse.json({
          success: true,
          result: "credited",
          balances: outcome.balances,
          written: outcome.written,
          requested: outcome.requested,
        });

      // A real replay of this idempotency key, and the daily-yield race — which
      // cannot occur for "admin", but is answered honestly rather than falling
      // through to a failure it is not.
      case "replayed":
      case "already_applied":
        return NextResponse.json({
          success: true,
          result: "replayed",
          balances: outcome.balances,
        });

      case "failed":
        return failureResponse(outcome);
    }
  } catch (error) {
    _logger.error("[admin/users/grant] credit failed:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Grant failed",
      },
      { status: 500 },
    );
  }
}
