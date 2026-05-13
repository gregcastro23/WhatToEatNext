/**
 * Quests API Route
 * GET /api/quests - Get available quests with user progress
 * POST /api/quests - Report a quest event completion
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { rateLimit } from "@/lib/rateLimit";
import { questService } from "@/services/QuestService";
import { streakService } from "@/services/StreakService";
import type { QuestsResponse } from "@/types/economy";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const QUESTS_LIMIT = { window: 60_000, max: 60, bucket: "quests" };

/**
 * GET /api/quests — Get all quest definitions with user's current progress
 */
export async function GET(request: NextRequest) {
  const rl = await rateLimit(request, QUESTS_LIMIT);
  if (!rl.allowed) return rl.response!;
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 },
    );
  }

  const [quests, streak] = await Promise.all([
    questService.getQuestPanel(userId),
    streakService.getStreak(userId),
  ]);

  const response: QuestsResponse = {
    success: true,
    quests,
    streak,
  };

  return NextResponse.json(response);
}

/**
 * POST /api/quests — Report a quest event
 *
 * Body: { event: string }
 * Example: { event: "view_chart" }
 */
export async function POST(request: NextRequest) {
  const rl = await rateLimit(request, QUESTS_LIMIT);
  if (!rl.allowed) return rl.response!;
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 },
    );
  }

  let body: { event: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request body" },
      { status: 400 },
    );
  }

  if (!body.event) {
    return NextResponse.json(
      { success: false, message: "event is required" },
      { status: 400 },
    );
  }

  const completed = await questService.reportEvent(userId, body.event);

  return NextResponse.json({
    success: true,
    completedQuests: completed,
    message: completed.length > 0
      ? `🏆 ${completed.length} quest(s) completed!`
      : "Progress updated.",
  });
}
