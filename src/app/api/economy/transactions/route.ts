/**
 * Transaction History API Route
 * GET /api/economy/transactions - Get user's token transaction history
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { tokenEconomy } from "@/services/TokenEconomyService";
import type { NextRequest } from "next/server";
import type { TransactionsResponse } from "@/types/economy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 },
    );
  }

  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20", 10), 50);
  const offset = parseInt(url.searchParams.get("offset") || "0", 10);

  const { transactions, total } = await tokenEconomy.getTransactions(userId, { limit, offset });

  const response: TransactionsResponse = {
    success: true,
    transactions,
    total,
  };

  return NextResponse.json(response);
}
