/**
 * GET /api/economy/swap-rates
 *
 * The current ESMS swap rate sheet: every pair at `P_to / P_from` over the
 * live Elemental Exchange Index, no spread. Public — used by the Live Network
 * Feed page so anyone can see today's exchange rates before authenticating.
 *
 * These are the exact rates the Swapping Bridge auto-swaps a short payment at
 * within the same oracle minute (`validUntil`); the sheet carries the prices
 * it was computed from so a client can reproduce any rate.
 *
 * Honesty contract (the price-index precedent): when the oracle cannot price
 * the sky this answers 503 with `live: false` and NO rates — never a fallback
 * sheet under `success: true`.
 */

import { NextResponse } from "next/server";
import {
  SwapRatesUnavailableError,
  getCurrentSwapRates,
} from "@/lib/economy/swapRates";
import { _logger } from "@/lib/logger";

export const revalidate = 30;
export const runtime = "nodejs";

export function GET(): Promise<NextResponse> {
  try {
    const rates = getCurrentSwapRates();
    return Promise.resolve(
      NextResponse.json(
        { success: true, live: true, ...rates },
        { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } },
      ),
    );
  } catch (error) {
    const unavailable = error instanceof SwapRatesUnavailableError;
    _logger.error("[GET /api/economy/swap-rates]", error);
    return Promise.resolve(
      NextResponse.json(
        {
          success: false,
          live: false,
          message: unavailable
            ? "Swap rates are unavailable: the price oracle cannot price the current sky"
            : "Failed to compute swap rates",
        },
        { status: unavailable ? 503 : 500 },
      ),
    );
  }
}
