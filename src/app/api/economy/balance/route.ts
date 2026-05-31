/**
 * Economy Balance API Route
 * GET /api/economy/balance - Get user's ESMS token balances + streak info
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { executeQuery } from "@/lib/database";
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
    if (syncHeader && syncSecret && syncHeader === syncSecret && emailParam) {
      const userRow = await executeQuery<{ id: string }>(
        "SELECT id FROM users WHERE email = $1 LIMIT 1",
        [emailParam],
      );
      if (userRow.rows.length === 0) {
        return NextResponse.json({ error: "user_not_found" }, { status: 404 });
      }
      const b = await tokenEconomy.getBalances(userRow.rows[0].id);
      return NextResponse.json({
        balances: {
          spirit: b.spirit,
          essence: b.essence,
          matter: b.matter,
          substance: b.substance,
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
    console.error("[economy/balance] Error fetching balance:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch balance" },
      { status: 500 },
    );
  }
}
