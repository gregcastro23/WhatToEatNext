/**
 * Token Transmutation API Route
 * POST /api/economy/transmute - Convert one token type to another at 3:1 ratio
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { tokenEconomy } from "@/services/TokenEconomyService";
import { TOKEN_TYPES, TRANSMUTATION_RATIO } from "@/types/economy";
import type { TokenType, TransmuteResponse } from "@/types/economy";
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

    let body: { fromToken: string; toToken: string; amount: number };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid request body" },
        { status: 400 },
      );
    }

    const { fromToken, toToken, amount } = body;

    // Validate
    if (!fromToken || !toToken || !amount) {
      return NextResponse.json(
        { success: false, message: "fromToken, toToken, and amount are required" },
        { status: 400 },
      );
    }

    if (!TOKEN_TYPES.includes(fromToken as TokenType) || !TOKEN_TYPES.includes(toToken as TokenType)) {
      return NextResponse.json(
        { success: false, message: "Invalid token type. Must be Spirit, Essence, Matter, or Substance." },
        { status: 400 },
      );
    }

    if (fromToken === toToken) {
      return NextResponse.json(
        { success: false, message: "Cannot transmute a token into itself." },
        { status: 400 },
      );
    }

    if (amount <= 0 || !Number.isFinite(amount)) {
      return NextResponse.json(
        { success: false, message: "Amount must be a positive number" },
        { status: 400 },
      );
    }

    const costAmount = amount * TRANSMUTATION_RATIO;

    const result = await tokenEconomy.transmute(
      userId,
      fromToken as TokenType,
      toToken as TokenType,
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
    console.error("[economy/transmute] Error:", error);
    return NextResponse.json(
      { success: false, message: "Transmutation failed. Please try again." },
      { status: 500 },
    );
  }
}
