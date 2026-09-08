/**
 * POST /api/economy/swap
 *
 * Authenticated ESMS coin swap. Unlike /api/economy/transmute (fixed 3:1) the
 * swap rate floats with the current planetary hour and day. The server is the
 * sole source of truth for the rate — clients can preview but never dictate
 * pricing. Atomic debit + credit; transactions are linked via a shared
 * transaction_group_id and tagged source_type='transmutation'.
 */

import crypto from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { findRate, getCurrentSwapRates } from "@/lib/economy/swapRates";
import { _logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rateLimit";
import { EconomySwapRequestSchema } from "@/lib/validation/apiSchemas";
import { tokenEconomy } from "@/services/TokenEconomyService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    const rl = await rateLimit(request, { window: 60_000, max: 30, bucket: "economy-swap", identifier: userId });
    if (!rl.allowed) return rl.response!;

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid request body" },
        { status: 400 },
      );
    }

    const parseResult = EconomySwapRequestSchema.safeParse(rawBody);
    if (!parseResult.success) {
      const [issue] = parseResult.error.issues;
      const message =
        issue?.message === "Cannot swap a token for itself"
          ? "Cannot swap a token for itself"
          : !rawBody || typeof rawBody !== "object" || !("fromToken" in rawBody) || !("toToken" in rawBody)
            ? "fromToken and toToken are required"
            : issue?.path.includes("amount")
              ? "amount must be a positive number"
              : (issue?.message ?? "Invalid token type");

      return NextResponse.json(
        {
          success: false,
          message,
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { fromToken, toToken, amount } = parseResult.data;

    const rateContext = getCurrentSwapRates();
    const rateEntry = findRate(rateContext, fromToken, toToken);
    if (!rateEntry) {
      return NextResponse.json(
        { success: false, message: "Rate unavailable for this pair" },
        { status: 500 },
      );
    }

    const costAmount = Number((amount * rateEntry.rate).toFixed(4));
    const groupId = crypto.randomUUID();

    // Debit first; if it fails, no credit is issued.
    const debitDescription = `Swap ${costAmount} ${fromToken} → ${amount} ${toToken} @ rate ${rateEntry.rate} (hour: ${rateContext.rulingHourPlanet})`;
    const afterDebit = await tokenEconomy.debitTokens(
      userId,
      fromToken,
      costAmount,
      "transmutation",
      { description: debitDescription, transactionGroupId: groupId },
    );

    if (!afterDebit) {
      return NextResponse.json(
        {
          success: false,
          message: `Insufficient ${fromToken}. Need ${costAmount}.`,
          rate: rateEntry,
        },
        { status: 402 },
      );
    }

    const creditDescription = `Received ${amount} ${toToken} from swap of ${fromToken}`;
    const newBalances = await tokenEconomy.creditTokens(
      userId,
      toToken,
      amount,
      "transmutation",
      { description: creditDescription, transactionGroupId: groupId },
    );

    if (!newBalances) {
      // The debit committed but the credit didn't — refund the spent coins so
      // the swap is all-or-nothing instead of silently destroying tokens.
      const refunded = await tokenEconomy.creditTokens(
        userId,
        fromToken,
        costAmount,
        "transmutation",
        {
          description: `Refund — swap credit failed (${debitDescription})`,
          transactionGroupId: groupId,
          idempotencyKey: `swap_refund:${groupId}`,
        },
      );
      if (!refunded) {
        _logger.error("[POST /api/economy/swap] credit AND refund failed — tokens need manual reconcile:", {
          userId,
          groupId,
          fromToken,
          costAmount,
        });
      }
      return NextResponse.json(
        { success: false, message: "Swap failed — your coins were returned. Try again.", refunded: !!refunded },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      result: {
        spent: { tokenType: fromToken, amount: costAmount },
        received: { tokenType: toToken, amount },
        newBalances,
      },
      rate: rateEntry,
      planetaryContext: {
        rulingHourPlanet: rateContext.rulingHourPlanet,
        rulingDayPlanet: rateContext.rulingDayPlanet,
      },
      message: `⚗️ Swap complete under the hour of ${rateContext.rulingHourPlanet}: ${costAmount} ${fromToken} → ${amount} ${toToken}`,
    });
  } catch (error) {
    _logger.error("[POST /api/economy/swap]", error);
    return NextResponse.json(
      { success: false, message: "Swap failed" },
      { status: 500 },
    );
  }
}
