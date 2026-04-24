/**
 * Economy Balance API Route
 * GET /api/economy/balance - Get user's ESMS token balances + streak info
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { streakService } from "@/services/StreakService";
import { tokenEconomy } from "@/services/TokenEconomyService";
import type { EconomyBalanceResponse } from "@/types/economy";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    const [balances, streak] = await Promise.all([
      tokenEconomy.getBalances(userId),
      streakService.getStreak(userId),
    ]);

    const canClaimDaily = !(await tokenEconomy.hasClaimedToday(userId));

    const response: EconomyBalanceResponse = {
      success: true,
      balances,
      streak,
      canClaimDaily,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[economy/balance] Error fetching balance:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch balance" },
      { status: 500 },
    );
  }
}
