/**
 * GET /api/economy/grimoire — everything the grimoire page reads in one call.
 *
 * The grimoire is the opt-in legibility layer of the invisible economy: the
 * practices and their natures, today's sky and the reader's personal resonance
 * per coin, the celestial allowance (budget) and what's been drawn from it,
 * chambers discovered, the streak and its milestones, and the feats
 * (achievement quests) absorbed from the retired quest UI — completed feats
 * can still be claimed from here.
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { getCelestialRewardContext } from "@/lib/economy/celestial";
import { PRACTICES } from "@/lib/economy/practices";
import { getCurrentSwapRates } from "@/lib/economy/swapRates";
import { rateLimit } from "@/lib/rateLimit";
import { practiceRewardService } from "@/services/practiceRewardService";
import { questService } from "@/services/QuestService";
import { streakService } from "@/services/StreakService";
import { STREAK_MILESTONE_BONUSES } from "@/types/economy";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }

  const rl = await rateLimit(request, { window: 60_000, max: 20, bucket: "economy-grimoire", identifier: userId });
  if (!rl.allowed) return rl.response!;

  try {
    const [ctx, spent, discovered, panel, streak] = await Promise.all([
      getCelestialRewardContext(userId),
      practiceRewardService.todaysSpend(userId),
      practiceRewardService.discoveredSurfaces(userId),
      questService.getQuestPanel(userId),
      streakService.getStreak(userId),
    ]);
    const swap = getCurrentSwapRates();

    const practices = Object.values(PRACTICES).map((p) => {
      const coin = p.tokenType.toLowerCase() as "spirit" | "essence" | "matter" | "substance";
      return {
        type: p.type,
        tokenType: p.tokenType,
        description: p.description,
        baseAmount: p.baseAmount,
        dedupe: p.dedupe,
        dailyCap: p.dailyCap,
        /** What the act pays THIS reader under THIS sky, right now. */
        todayAmount: Math.round(p.baseAmount * ctx.perCoinReward[coin] * 100) / 100,
        todayModifier: ctx.perCoinReward[coin],
      };
    });

    const nextMilestone =
      STREAK_MILESTONE_BONUSES.find((m) => m.days > (streak?.currentStreak ?? 0)) ?? null;

    return NextResponse.json({
      success: true,
      sky: {
        dominantElement: ctx.dominantElement,
        aNumber: ctx.aNumber,
        skyMultiplier: ctx.skyMultiplier,
        transitWeights: ctx.transitWeights,
        rulingDayPlanet: swap.rulingDayPlanet,
        rulingHourPlanet: swap.rulingHourPlanet,
        personalized: ctx.personalized,
        timestamp: ctx.timestamp,
      },
      resonance: ctx.perCoinReward,
      allowance: {
        total: ctx.dailyBudget,
        spent: Math.round(spent * 100) / 100,
        remaining: Math.max(0, Math.round((ctx.dailyBudget - spent) * 100) / 100),
      },
      practices,
      discoveredSurfaces: discovered,
      streak: {
        current: streak?.currentStreak ?? 0,
        longest: streak?.longestStreak ?? 0,
        nextMilestone,
        milestones: STREAK_MILESTONE_BONUSES,
      },
      feats: panel.achievements.map((a) => ({
        slug: a.quest.slug,
        title: a.quest.title,
        description: a.quest.description,
        tokenRewardType: a.quest.tokenRewardType,
        tokenRewardAmount: a.quest.tokenRewardAmount,
        progress: a.progress,
        threshold: a.quest.triggerThreshold,
        completedAt: a.completedAt,
        claimedAt: a.claimedAt,
      })),
    });
  } catch (error) {
    console.error("[economy/grimoire] failed:", error);
    return NextResponse.json({ success: false, message: "The grimoire would not open." }, { status: 500 });
  }
}
