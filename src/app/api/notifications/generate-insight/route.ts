/**
 * Generate Daily Insight API Route
 * POST /api/notifications/generate-insight - Generate personalized daily insight (premium only)
 */

import { NextResponse } from "next/server";
import { getDatabaseUserFromRequest } from "@/lib/auth/validateRequest";
import { generateDailyInsightNotification } from "@/services/dailyInsightService";
import { rateLimit } from "@/lib/rateLimit";
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

    const rl = await rateLimit(request, { window: 60_000, max: 5, bucket: "generate-insight", identifier: user.id });
    if (!rl.allowed) return rl.response!;

    // Check premium tier
    const tier = (user as any).tier || (user as any).profile?.tier || "free";
    if (tier !== "premium") {
      return NextResponse.json(
        { success: false, message: "Daily insights are a premium feature" },
        { status: 403 },
      );
    }

    // Get natal chart from user profile
    const natalChart =
      (user as any).profile?.natalChart ||
      (user as any).profile?.natal_chart ||
      (user as any).natalChart;

    if (!natalChart) {
      return NextResponse.json(
        { success: false, message: "Complete your birth chart first to receive daily insights" },
        { status: 400 },
      );
    }

    const hasPositions = !!(
      natalChart.planetaryPositions ||
      natalChart.planets?.length > 0 ||
      natalChart.Sun
    );

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
    console.error("[notifications/generate-insight] Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate daily insight" },
      { status: 500 },
    );
  }
}
