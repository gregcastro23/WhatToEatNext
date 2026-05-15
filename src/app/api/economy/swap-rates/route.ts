/**
 * GET /api/economy/swap-rates
 *
 * Returns the current ESMS swap rate sheet, modulated by the ruling planetary
 * hour and day. Public — used by the Live Network Feed page so anyone can see
 * how the cosmos is biasing today's exchanges before authenticating.
 */

import { NextResponse } from "next/server";
import { getCurrentSwapRates } from "@/lib/economy/swapRates";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const rates = getCurrentSwapRates();
    return NextResponse.json({ success: true, ...rates });
  } catch (error) {
    console.error("[GET /api/economy/swap-rates]", error);
    return NextResponse.json(
      { success: false, message: "Failed to compute swap rates" },
      { status: 500 },
    );
  }
}
