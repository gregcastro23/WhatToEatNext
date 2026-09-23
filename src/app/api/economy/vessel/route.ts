/**
 * GET /api/economy/vessel
 *
 * Authoritative Kitchen Vessel Ledger endpoint (v1 contract).
 * Serves the elemental treasury (ESMS balances, stream breakdowns, streak, quests, recent transactions)
 * to Planetary Agents, Pentacles drawer, and cross-app treasury surfaces.
 *
 * Auth:
 *   1. Cookie session (NextAuth) via getUserIdFromRequest
 *   2. Or server-to-server: ?email=<userEmail> + X-Sync-Secret: <ALCHM_KITCHEN_SYNC_SECRET>
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { executeQuery } from "@/lib/database/connection";
import { safeEqual } from "@/lib/hooks/secureCompare";
import { _logger } from "@/lib/logger";
import { questService } from "@/services/QuestService";
import { streakService } from "@/services/StreakService";
import { tokenEconomy } from "@/services/TokenEconomyService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const STREAM_SOURCE_TYPES = {
  jingDuels: ["jing_duel", "duel"],
  staking: ["staking", "star_vault", "daily_yield", "agents_yield", "streak_bonus"],
  pentaclesMelee: [
    "pentacles_melee",
    "pentacles_conversion",
    "pentacle_conversion",
    "pentacles_word_duel",
    "pentacles_claim",
    "word_duel",
    "pentacles",
  ],
  kitchenAchievements: [
    "quest_reward",
    "practice_reward",
    "transit_attunement",
    "achievement_reward",
    "recipe_reward",
    "alchemical_milestone",
  ],
} as const;

type VesselStreamKey = "jingDuels" | "staking" | "pentaclesMelee" | "kitchenAchievements";

function mapSourceTypeToStream(sourceType: string): VesselStreamKey | "other" {
  const s = sourceType.toLowerCase();
  if (STREAM_SOURCE_TYPES.jingDuels.some((t) => t === s)) return "jingDuels";
  if (STREAM_SOURCE_TYPES.staking.some((t) => t === s)) return "staking";
  if (STREAM_SOURCE_TYPES.pentaclesMelee.some((t) => t === s)) return "pentaclesMelee";
  if (STREAM_SOURCE_TYPES.kitchenAchievements.some((t) => t === s)) return "kitchenAchievements";
  return "other";
}

function quantize(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 10_000) / 10_000;
}

export async function GET(request: NextRequest) {
  try {
    const syncSecret = process.env.ALCHM_KITCHEN_SYNC_SECRET;
    const syncHeader = request.headers.get("x-sync-secret");
    const { searchParams } = new URL(request.url);
    const emailParam = searchParams.get("email");

    let userId: string | null = null;

    if (emailParam && safeEqual(syncHeader, syncSecret)) {
      const userRes = await executeQuery<{ id: string }>(
        "SELECT id FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1",
        [emailParam.trim()],
      );
      const [u] = userRes.rows;
      if (!u) {
        return NextResponse.json(
          { success: false, error: "user_not_found" },
          { status: 404 },
        );
      }
      userId = u.id;
    } else {
      userId = await getUserIdFromRequest(request);
      if (!userId) {
        return NextResponse.json(
          { success: false, error: "Authentication required" },
          { status: 401 },
        );
      }
    }

    // 1. Balances & Streak
    const [balances, streak] = await Promise.all([
      tokenEconomy.getBalances(userId),
      streakService.getStreak(userId),
    ]);

    // 2. Streams aggregation (credit-only: amount > 0)
    const streamRes = await executeQuery<{
      source_type: string;
      token_type: string;
      total_amount: string | number;
      entry_count: string | number;
      last_created_at: string | Date | null;
    }>(
      `SELECT source_type, token_type, SUM(amount) AS total_amount, COUNT(*) AS entry_count, MAX(created_at) AS last_created_at
         FROM token_transactions
        WHERE user_id = $1 AND amount > 0
        GROUP BY source_type, token_type`,
      [userId],
    );

    const streams: Record<
      VesselStreamKey,
      {
        esms: [number, number, number, number];
        entries: number;
        lastAt: string | null;
        sourceTypes: string[];
      }
    > = {
      jingDuels: {
        esms: [0, 0, 0, 0],
        entries: 0,
        lastAt: null,
        sourceTypes: [...STREAM_SOURCE_TYPES.jingDuels],
      },
      staking: {
        esms: [0, 0, 0, 0],
        entries: 0,
        lastAt: null,
        sourceTypes: [...STREAM_SOURCE_TYPES.staking],
      },
      pentaclesMelee: {
        esms: [0, 0, 0, 0],
        entries: 0,
        lastAt: null,
        sourceTypes: [...STREAM_SOURCE_TYPES.pentaclesMelee],
      },
      kitchenAchievements: {
        esms: [0, 0, 0, 0],
        entries: 0,
        lastAt: null,
        sourceTypes: [...STREAM_SOURCE_TYPES.kitchenAchievements],
      },
    };

    for (const row of streamRes.rows) {
      const streamKey = mapSourceTypeToStream(row.source_type);
      if (streamKey === "other") continue;

      const target = streams[streamKey];
      target.entries += Number(row.entry_count);

      const amt = Number(row.total_amount) || 0;
      const t = row.token_type;
      if (t === "Spirit") target.esms[0] += amt;
      else if (t === "Essence") target.esms[1] += amt;
      else if (t === "Matter") target.esms[2] += amt;
      else if (t === "Substance") target.esms[3] += amt;

      if (row.last_created_at) {
        const rowDate = new Date(row.last_created_at).toISOString();
        if (!target.lastAt || rowDate > target.lastAt) {
          target.lastAt = rowDate;
        }
      }
    }

    // Quantize streams esms
    const streamKeys: readonly VesselStreamKey[] = [
      "jingDuels",
      "staking",
      "pentaclesMelee",
      "kitchenAchievements",
    ];
    for (const k of streamKeys) {
      const s = streams[k];
      s.esms = [
        quantize(s.esms[0]),
        quantize(s.esms[1]),
        quantize(s.esms[2]),
        quantize(s.esms[3]),
      ];
    }

    // 3. Quest Panel
    let quests: {
      achievementsUnlocked: number;
      questsCompleted: number;
      rewardsClaimed: number;
    } | null = null;

    try {
      const panel = await questService.getQuestPanel(userId);
      const allProgress = [...panel.daily, ...panel.weekly, ...panel.achievements];
      quests = {
        achievementsUnlocked: panel.achievements.filter((p) => p.completedAt !== null).length,
        questsCompleted: allProgress.filter((p) => p.completedAt !== null).length,
        rewardsClaimed: allProgress.filter((p) => p.claimedAt !== null).length,
      };
    } catch (questErr) {
      _logger.warn("[GET /api/economy/vessel] could not read quest progress:", questErr);
    }

    // 4. Recent transactions
    const recentRes = await executeQuery<{
      id: string | number;
      source_type: string;
      token_type: string;
      amount: string | number;
      description: string | null;
      created_at: string | Date;
    }>(
      `SELECT id, source_type, token_type, amount, description, created_at
         FROM token_transactions
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 25`,
      [userId],
    );

    const recent = recentRes.rows.map((r) => ({
      id: String(r.id),
      stream: mapSourceTypeToStream(r.source_type),
      sourceType: r.source_type,
      tokenType: r.token_type,
      amount: quantize(Number(r.amount)),
      description: r.description ?? null,
      createdAt: new Date(r.created_at).toISOString(),
    }));

    return NextResponse.json(
      {
        success: true,
        version: 1,
        generatedAt: new Date().toISOString(),
        balances: {
          spirit: quantize(balances.spirit),
          essence: quantize(balances.essence),
          matter: quantize(balances.matter),
          substance: quantize(balances.substance),
        },
        streakDays: streak.currentStreak ?? 0,
        streams,
        quests,
        recent,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    _logger.error("[GET /api/economy/vessel] Error assembling ledger:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
