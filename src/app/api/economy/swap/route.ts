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
import { rateLimit } from "@/lib/rateLimit";
import { tokenEconomy } from "@/services/TokenEconomyService";
import { TOKEN_TYPES } from "@/types/economy";
import type { TokenType } from "@/types/economy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface SwapRequestBody {
  fromToken: TokenType;
  toToken: TokenType;
  /** Amount of toToken the caller wants to receive. */
  amount: number;
}

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

    let body: SwapRequestBody;
    try {
      body = (await request.json()) as SwapRequestBody;
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid request body" },
        { status: 400 },
      );
    }

    const { fromToken, toToken, amount } = body;
    if (!fromToken || !toToken) {
      return NextResponse.json(
        { success: false, message: "fromToken and toToken are required" },
        { status: 400 },
      );
    }
    if (
      !TOKEN_TYPES.includes(fromToken) ||
      !TOKEN_TYPES.includes(toToken)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid token type" },
        { status: 400 },
      );
    }
    if (fromToken === toToken) {
      return NextResponse.json(
        { success: false, message: "Cannot swap a token for itself" },
        { status: 400 },
      );
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, message: "amount must be a positive number" },
        { status: 400 },
      );
    }

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

    return NextResponse.json({
      success: true,
      result: {
        spent: { tokenType: fromToken, amount: costAmount },
        received: { tokenType: toToken, amount },
        newBalances: newBalances || afterDebit,
      },
      rate: rateEntry,
      planetaryContext: {
        rulingHourPlanet: rateContext.rulingHourPlanet,
        rulingDayPlanet: rateContext.rulingDayPlanet,
      },
      message: `⚗️ Swap complete under the hour of ${rateContext.rulingHourPlanet}: ${costAmount} ${fromToken} → ${amount} ${toToken}`,
    });
  } catch (error) {
    console.error("[POST /api/economy/swap]", error);
    return NextResponse.json(
      { success: false, message: "Swap failed" },
      { status: 500 },
    );
  }
}
