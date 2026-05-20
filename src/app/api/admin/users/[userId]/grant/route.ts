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
import { z } from "zod";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { tokenEconomy } from "@/services/TokenEconomyService";
import { TOKEN_TYPES, type TokenType } from "@/types/economy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const tokenTypeEnum = z.enum(TOKEN_TYPES as [TokenType, ...TokenType[]]);

const grantBodySchema = z.object({
  credits: z
    .array(
      z.object({
        tokenType: tokenTypeEnum,
        amount: z.number().positive().max(10_000),
      }),
    )
    .min(1)
    .max(TOKEN_TYPES.length),
  idempotencyKey: z.string().min(8).max(200),
  description: z.string().max(500).optional(),
});

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

  let body: z.infer<typeof grantBodySchema>;
  try {
    const json = await request.json();
    body = grantBodySchema.parse(json);
  } catch (err) {
    const message =
      err instanceof z.ZodError ? err.issues[0]?.message ?? "Invalid body" : "Invalid JSON";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }

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
    const balances = await tokenEconomy.creditMultipleTokens(
      userId,
      credits,
      "admin",
      {
        description: body.description ?? `Admin grant by ${authResult.user.email}`,
        idempotencyKey: body.idempotencyKey,
      },
    );

    if (balances === null) {
      // Idempotency hit — credit had already been applied for this key.
      const current = await tokenEconomy.getBalances(userId);
      return NextResponse.json({
        success: true,
        alreadyClaimed: true,
        balances: current,
      });
    }

    return NextResponse.json({
      success: true,
      alreadyClaimed: false,
      balances,
    });
  } catch (error) {
    console.error("[admin/users/grant] credit failed:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Grant failed",
      },
      { status: 500 },
    );
  }
}
