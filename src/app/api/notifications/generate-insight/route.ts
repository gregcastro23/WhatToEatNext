import { NextResponse } from "next/server";
import { getDatabaseUserFromRequest } from "@/lib/auth/validateRequest";
import { _logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rateLimit";
import { generateDailyInsightNotification } from "@/services/dailyInsightService";
import type { NatalChart } from "@/types/natalChart";
import { isObject } from "@/utils/typeGuards";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await getDatabaseUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    const rl = await rateLimit(request, { window: 60_000, max: 5, bucket: "generate-insight", identifier: user.id });
    if (!rl.allowed) return rl.response!;

    // Tier gate removed with the premium concept — see group/compatibility.
    // The rate limit above (5/min) is the real protection here.

    // Get natal chart from user profile
    const profile = isObject(user.profile) ? (user.profile as Record<string, unknown>) : null;
    const rawChart = profile?.natalChart ?? profile?.natal_chart ?? (isObject(user) && "natalChart" in user ? user.natalChart : null);
    const natalChart = isObject(rawChart) ? (rawChart as unknown as NatalChart) : null;

    if (!natalChart) {
      return NextResponse.json(
        { success: false, message: "Complete your birth chart first to receive daily insights" },
        { status: 400 },
      );
    }

    const hasPositions =
      Object.keys(natalChart.planetaryPositions).length > 0 ||
      (Array.isArray(natalChart.planets) && natalChart.planets.length > 0);

    if (!hasPositions) {
      return NextResponse.json(
        { success: false, message: "Complete your birth chart first to receive daily insights" },
        { status: 400 },
      );
    }

    const notification = await generateDailyInsightNotification(user.id, natalChart);

    if (!notification) {
      return NextResponse.json(
        { success: true, message: "Daily insight already generated today", alreadyGenerated: true },
      );
    }

    return NextResponse.json({ success: true, notification }, { status: 201 });
  } catch (error) {
    _logger.error("[notifications/generate-insight] Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate daily insight" },
      { status: 500 },
    );
  }
}
