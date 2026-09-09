/**
 * Token Transmutation API Route
 * POST /api/economy/transmute - Convert one token type to another at 3:1 ratio
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { _logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rateLimit";
import { EconomyTransmuteRequestSchema } from "@/lib/validation/apiSchemas";
import { tokenEconomy } from "@/services/TokenEconomyService";
import { TRANSMUTATION_RATIO } from "@/types/economy";
import type { TransmuteResponse } from "@/types/economy";
import type { NextRequest } from "next/server";

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

    const rl = await rateLimit(request, { window: 60_000, max: 20, bucket: "economy-transmute", identifier: userId });
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

    const parseResult = EconomyTransmuteRequestSchema.safeParse(rawBody);
    if (!parseResult.success) {
      const [issue] = parseResult.error.issues;
      const isMissingFields =
        !rawBody ||
        typeof rawBody !== "object" ||
        !("fromToken" in rawBody) ||
        !("toToken" in rawBody) ||
        !("amount" in rawBody);
      const message = isMissingFields
        ? "fromToken, toToken, and amount are required"
        : issue?.message === "Cannot transmute a token into itself."
          ? "Cannot transmute a token into itself."
          : issue?.path.includes("amount")
            ? "Amount must be a positive number"
            : "Invalid token type. Must be Spirit, Essence, Matter, or Substance.";

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

    const costAmount = amount * TRANSMUTATION_RATIO;

    const result = await tokenEconomy.transmute(
      userId,
      fromToken,
      toToken,
      amount,
    );

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          message: `Insufficient ${fromToken} tokens. You need ${costAmount} ${fromToken} to receive ${amount} ${toToken}.`,
        },
        { status: 400 },
      );
    }

    const response: TransmuteResponse = {
      success: true,
      result,
      message: `⚗️ Transmutation complete! ${costAmount} ${fromToken} → ${amount} ${toToken}`,
    };

    return NextResponse.json(response);
  } catch (error) {
    _logger.error("[economy/transmute] Error:", error);
    return NextResponse.json(
      { success: false, message: "Transmutation failed. Please try again." },
      { status: 500 },
    );
  }
}
