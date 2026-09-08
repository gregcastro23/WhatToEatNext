/**
 * Claim Daily Yield API Route
 * POST /api/economy/claim-daily - Claim the user's Cosmic Yield
 *
 * Requires user to have completed onboarding (birth data + natal chart).
 * Yields are personalized based on natal chart and current transits.
 */

import { NextResponse } from "next/server";
import { getDatabaseUserFromRequest } from "@/lib/auth/validateRequest";
import {
  DegradedEphemerisError,
  validateLedgerClamp,
} from "@/lib/economy/discriminant-faucet";
import { _logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rateLimit";
import { dailyYieldService } from "@/services/DailyYieldService";
import { feedDatabase } from "@/services/feedDatabaseService";
import type { ClaimDailyResponse } from "@/types/economy";
import { extractAlchemicalPlanetPositions } from "@/utils/astrology/chartDataUtils";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const user = await getDatabaseUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    const rl = await rateLimit(request, { window: 60_000, max: 5, bucket: "economy-claim-daily", identifier: user.id });
    if (!rl.allowed) return rl.response!;

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

    // Preserve natal longitudes. Reducing the chart to signs here would erase
    // the degree-level synastry that sets an untethered claim's magnitude.
    const natalPositions = extractAlchemicalPlanetPositions(natalChart);

    if (Object.keys(natalPositions).length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Natal chart data is incomplete. Please update your birth data.",
        },
        { status: 400 },
      );
    }

    // Determine origin site — agents site passes ?site=agents
    const { searchParams } = new URL(request.url);
    const siteParam = searchParams.get("site");
    const site: "main" | "agents" = siteParam === "agents" ? "agents" : "main";

    // Claim the daily yield (site-specific idempotency)
    const claim = await dailyYieldService.claimDailyYield(
      user.id,
      {
        positions: natalPositions,
        alchemicalProperties: natalChart.alchemicalProperties,
      },
      site,
    );

    if (claim.status === "failed") {
      // NOT "already claimed": the credit rolled back, so the day is still
      // owed. Sending the 409 here — as this route did for any falsy result —
      // told the user to return tomorrow and silently cost them a yield they
      // could have collected by retrying. A 500 is honest and retryable.
      return NextResponse.json(
        {
          success: false,
          message: "Could not collect your Cosmic Yield just now. Please try again.",
        },
        { status: 500 },
      );
    }

    if (claim.status === "already_claimed") {
      return NextResponse.json(
        {
          success: false,
          message: "You have already claimed your Cosmic Yield today. Return tomorrow!",
        },
        { status: 409 },
      );
    }

    const yieldResult = claim.result;
    // HTTP defense-in-depth: never acknowledge a result outside the same
    // invariant enforced immediately before the ledger write.
    validateLedgerClamp({
      ...yieldResult.distribution,
      total: yieldResult.totalTokens,
    });
    const milestoneNote = yieldResult.milestoneBonus
      ? ` 🔥 ${yieldResult.milestoneBonus.days}-day streak milestone: +${yieldResult.milestoneBonus.totalTokens} bonus tokens!`
      : "";
    const response: ClaimDailyResponse = {
      success: true,
      yield: yieldResult,
      message: `✨ Cosmic Yield collected! +${yieldResult.totalTokens.toFixed(1)} tokens across Spirit, Essence, Matter & Substance.${milestoneNote}`,
    };

    // Record the action in the community feed
    feedDatabase.createEvent(user.id, "claim_daily", { site }).catch(console.error);

    return NextResponse.json(response);
  } catch (error) {
    _logger.error("[economy/claim-daily] Error claiming daily yield:", error);
    if (error instanceof DegradedEphemerisError) {
      return NextResponse.json(
        {
          success: false,
          message: "The live sky could not be verified, so no tokens were minted. Please retry shortly.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { success: false, message: "Failed to claim daily yield. Please try again." },
      { status: 500 },
    );
  }
}
