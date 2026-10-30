/**
 * Economy Balance API Route
 * GET /api/economy/balance - Get user's ESMS token balances + streak info
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { executeQuery } from "@/lib/database";
import { safeEqual } from "@/lib/hooks/secureCompare";
import { _logger } from "@/lib/logger";
import { streakService } from "@/services/StreakService";
import { tokenEconomy } from "@/services/TokenEconomyService";
import type { EconomyBalanceResponse } from "@/types/economy";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    // Server-to-server balance read for the PA verifier: a valid X-Sync-Secret
    // plus ?email=<email> returns just that user's balances — no session needed.
    // Mirrors the auth on POST /api/economy/sync-credit.
    const syncSecret = process.env.ALCHM_KITCHEN_SYNC_SECRET;
    const syncHeader = request.headers.get("X-Sync-Secret");
    const emailParam = new URL(request.url).searchParams.get("email");
    if (emailParam && safeEqual(syncHeader, syncSecret)) {
      const userRow = await executeQuery<{ id: string }>(
        "SELECT id FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1",
        [emailParam.trim()],
      );
      if (userRow.rows.length === 0) {
        return NextResponse.json({ error: "user_not_found" }, { status: 404 });
      }
      const [balanceUser] = userRow.rows;
      if (!balanceUser) throw new Error("economy/balance: user row missing");
      const balanceRow = await executeQuery<{
        spirit: string | number;
        essence: string | number;
        matter: string | number;
        substance: string | number;
      }>(
        "SELECT spirit, essence, matter, substance FROM token_balances WHERE user_id = $1 LIMIT 1",
        [balanceUser.id],
      );
      if (balanceRow.rows.length === 0) {
        return NextResponse.json({ error: "no_ledger_row" }, { status: 404 });
      }
      const [b] = balanceRow.rows;
      if (!b) throw new Error("economy/balance: balance row missing");
      return NextResponse.json({
        balances: {
          spirit: Number(b.spirit),
          essence: Number(b.essence),
          matter: Number(b.matter),
          substance: Number(b.substance),
        },
      });
    }

    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const siteParam = searchParams.get("site");
    const site: "main" | "agents" = siteParam === "agents" ? "agents" : "main";

    const [balances, streak] = await Promise.all([
      tokenEconomy.getBalances(userId),
      streakService.getStreak(userId),
    ]);

    const canClaimDaily = !(await tokenEconomy.hasClaimedToday(userId, site));

    const response: EconomyBalanceResponse = {
      success: true,
      balances,
      streak,
      canClaimDaily,
    };

    return NextResponse.json(response);
  } catch (error) {
    _logger.error("[economy/balance] Error fetching balance:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch balance" },
      { status: 500 },
    );
  }
}
