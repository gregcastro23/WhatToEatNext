/**
 * Claim Daily Yield API Route
 * POST /api/economy/claim-daily - Claim the user's Cosmic Paycheck
 *
 * Requires user to have completed onboarding (birth data + natal chart).
 * Yields are personalized based on natal chart and current transits.
 */

import { NextResponse } from "next/server";
import { getDatabaseUserFromRequest } from "@/lib/auth/validateRequest";
import { dailyYieldService } from "@/services/DailyYieldService";
import { subscriptionService } from "@/services/subscriptionService";
import type { NextRequest } from "next/server";
import type { ClaimDailyResponse } from "@/types/economy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const user = await getDatabaseUserFromRequest(request);
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 },
    );
  }

  // Extract natal chart positions from user profile
  const natalChart = user.profile?.natalChart;
  if (!natalChart) {
    return NextResponse.json(
      {
        success: false,
        message: "Complete onboarding with your birth data to start earning tokens",
      },
      { status: 400 },
    );
  }

  // Build planet → sign map from natal chart
  // The natal chart stores positions as { Sun: { sign: "Gemini", ... }, ... }
  const natalPositions: Record<string, string> = {};
  const chartData = typeof natalChart === "string" ? JSON.parse(natalChart) : natalChart;

  // Extract sign from each planet's position data
  const planets = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];
  for (const planet of planets) {
    const position = chartData[planet] || chartData[planet.toLowerCase()];
    if (position) {
      const sign = typeof position === "string" ? position : position.sign;
      if (sign) {
        // Capitalize first letter for consistency
        natalPositions[planet] = sign.charAt(0).toUpperCase() + sign.slice(1).toLowerCase();
      }
    }
  }

  if (Object.keys(natalPositions).length === 0) {
    return NextResponse.json(
      {
        success: false,
        message: "Natal chart data is incomplete. Please update your birth data.",
      },
      { status: 400 },
    );
  }

  // Check if user is premium for yield multiplier
  const sub = await subscriptionService.getUserSubscription(user.id);
  const isPremium = sub?.tier === "premium";

  // Claim the daily yield
  const yieldResult = await dailyYieldService.claimDailyYield(user.id, natalPositions, isPremium);

  if (!yieldResult) {
    return NextResponse.json(
      {
        success: false,
        message: "You have already claimed your Cosmic Paycheck today. Return tomorrow!",
      },
      { status: 409 },
    );
  }

  const response: ClaimDailyResponse = {
    success: true,
    yield: yieldResult,
    message: `✨ Cosmic Paycheck collected! +${yieldResult.totalTokens.toFixed(1)} tokens across Spirit, Essence, Matter & Substance.`,
  };

  return NextResponse.json(response);
}
