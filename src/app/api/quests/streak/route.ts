/**
 * Streak API Route
 * GET /api/quests/streak - Get user's streak information
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { streakService } from "@/services/StreakService";
import { getStreakMultiplier } from "@/types/economy";
import type { NextRequest } from "next/server";

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

  const streak = await streakService.getStreak(userId);
  const isAlive = await streakService.isStreakAlive(userId);
  const currentMultiplier = getStreakMultiplier(streak.currentStreak);

  return NextResponse.json({
    success: true,
    streak,
    isAlive,
    currentMultiplier: Math.round(currentMultiplier * 100) / 100,
    nextMilestone: getNextMilestone(streak.currentStreak),
  });
}

function getNextMilestone(current: number): { days: number; label: string } | null {
  const milestones = [
    { days: 7, label: "Planetary Vigil" },
    { days: 14, label: "Fortnight of Focus" },
    { days: 30, label: "Lunar Cycle" },
    { days: 60, label: "Mercury Return" },
    { days: 90, label: "Seasonal Mastery" },
    { days: 365, label: "Solar Return" },
  ];

  for (const m of milestones) {
    if (current < m.days) return m;
  }
  return null;
}
