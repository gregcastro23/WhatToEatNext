/**
 * Quest Service
 *
 * Manages Cosmic Quests — daily rituals, weekly quests, and one-time achievements.
 * Tracks progress, handles completion, and distributes token rewards.
 *
 * @file src/services/QuestService.ts
 */

import { _logger } from "@/lib/logger";
import type {
  QuestDefinition,
  QuestProgress,
  QuestPanelData,
  TokenType,
} from "@/types/economy";
import { TOKEN_TYPES } from "@/types/economy";
import { tokenEconomy } from "./TokenEconomyService";
import { notificationDatabase } from "./notificationDatabaseService";

// ─── DB Bootstrapping ─────────────────────────────────────────────────

const isServerWithDB = (): boolean =>
  typeof window === "undefined" && !!process.env.DATABASE_URL;

let dbModule: typeof import("@/lib/database") | null = null;
const getDbModule = async () => {
  if (!dbModule && isServerWithDB()) {
    try {
      dbModule = await import("@/lib/database");
    } catch {
      _logger.warn("[QuestService] Database module not available");
    }
  }
  return dbModule;
};

// ─── In-Memory Fallback ───────────────────────────────────────────────

const memoryQuests: QuestDefinition[] = [];
const memoryProgress = new Map<string, { progress: number; completedAt: string | null; claimedAt: string | null }>();

// ─── Row Converters ───────────────────────────────────────────────────

function rowToQuestDef(row: any): QuestDefinition {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description || null,
    questType: row.quest_type,
    tokenRewardType: row.token_reward_type,
    tokenRewardAmount: parseFloat(row.token_reward_amount),
    triggerEvent: row.trigger_event,
    triggerThreshold: row.trigger_threshold || 1,
    isActive: row.is_active !== false,
    sortOrder: row.sort_order ?? 0,
  };
}

// ─── Date Helpers ─────────────────────────────────────────────────────

function getDailyPeriodStart(): string {
  return new Date().toISOString().slice(0, 10);
}

function getWeeklyPeriodStart(): string {
  const now = new Date();
  const day = now.getUTCDay();
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - ((day + 6) % 7)); // Monday
  return monday.toISOString().slice(0, 10);
}

function getPeriodStartForType(questType: string): string | null {
  switch (questType) {
    case "daily":
      return getDailyPeriodStart();
    case "weekly":
      return getWeeklyPeriodStart();
    case "achievement":
      return null; // achievements have no period
    default:
      return getDailyPeriodStart();
  }
}

// ─── Service Class ────────────────────────────────────────────────────

class QuestService {

  // ═══════════════════════════════════════════════════════════════════
  // QUEST DEFINITIONS
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Get all active quest definitions.
   */
  async getActiveQuests(): Promise<QuestDefinition[]> {
    const db = await getDbModule();

    if (db) {
      try {
        const result = await db.executeQuery(
          `SELECT * FROM quest_definitions WHERE is_active = true ORDER BY sort_order ASC`,
        );
        return result.rows.map(rowToQuestDef);
      } catch (error) {
        _logger.error("[QuestService] getActiveQuests failed:", error as any);
      }
    }

    return memoryQuests.filter(q => q.isActive);
  }

  // ═══════════════════════════════════════════════════════════════════
  // QUEST PROGRESS
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Get full quest panel data for a user (daily + weekly + achievements with progress).
   */
  async getQuestPanel(userId: string): Promise<QuestPanelData> {
    const quests = await this.getActiveQuests();
    const daily: QuestProgress[] = [];
    const weekly: QuestProgress[] = [];
    const achievements: QuestProgress[] = [];

    for (const quest of quests) {
      const progress = await this.getUserQuestProgress(userId, quest);
      const entry: QuestProgress = {
        quest,
        progress: progress.progress,
        completedAt: progress.completedAt,
        claimedAt: progress.claimedAt,
        periodStart: progress.periodStart,
      };

      switch (quest.questType) {
        case "daily":
          daily.push(entry);
          break;
        case "weekly":
          weekly.push(entry);
          break;
        case "achievement":
          achievements.push(entry);
          break;
      }
    }

    return { daily, weekly, achievements };
  }

  /**
   * Get a user's progress on a specific quest.
   */
  async getUserQuestProgress(
    userId: string,
    quest: QuestDefinition,
  ): Promise<{ progress: number; completedAt: string | null; claimedAt: string | null; periodStart: string | null }> {
    const periodStart = getPeriodStartForType(quest.questType);
    const db = await getDbModule();

    if (db) {
      try {
        const periodCondition = periodStart !== null
          ? `AND period_start = $3`
          : `AND period_start IS NULL`;
        const params = periodStart !== null
          ? [userId, quest.id, periodStart]
          : [userId, quest.id];

        const result = await db.executeQuery(
          `SELECT progress, completed_at, claimed_at, period_start
           FROM user_quest_progress
           WHERE user_id = $1 AND quest_id = $2
             ${periodCondition}
           LIMIT 1`,
          params,
        );

        if (result.rows.length > 0) {
          return {
            progress: result.rows[0].progress || 0,
            completedAt: result.rows[0].completed_at?.toISOString?.() || result.rows[0].completed_at || null,
            claimedAt: result.rows[0].claimed_at?.toISOString?.() || result.rows[0].claimed_at || null,
            periodStart: result.rows[0].period_start || null,
          };
        }
      } catch (error) {
        _logger.error("[QuestService] getUserQuestProgress failed:", error as any);
      }
    }

    // In-memory fallback
    const key = `${userId}:${quest.id}:${periodStart || "all"}`;
    const mem = memoryProgress.get(key);
    return {
      progress: mem?.progress || 0,
      completedAt: mem?.completedAt || null,
      claimedAt: mem?.claimedAt || null,
      periodStart,
    };
  }

  // ═══════════════════════════════════════════════════════════════════
  // EVENT REPORTING
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Report a quest event (e.g., 'view_chart', 'log_meal').
   * Automatically checks all matching quests and awards tokens on completion.
   *
   * @returns Array of completed quest slugs and tokens earned
   */
  async reportEvent(
    userId: string,
    event: string,
  ): Promise<Array<{ questSlug: string; tokensAwarded: number; tokenType: string }>> {
    const quests = await this.getActiveQuests();
    const matchingQuests = quests.filter(q => q.triggerEvent === event);
    const completed: Array<{ questSlug: string; tokensAwarded: number; tokenType: string }> = [];

    for (const quest of matchingQuests) {
      const result = await this.incrementProgress(userId, quest);
      if (result) {
        completed.push(result);
      }
    }

    // Check if all dailies are complete (meta-quest)
    if (event !== "complete_all_dailies" && completed.length > 0) {
      const allDailiesComplete = await this.checkAllDailiesComplete(userId);
      if (allDailiesComplete) {
        const metaResults = await this.reportEvent(userId, "complete_all_dailies");
        completed.push(...metaResults);
      }
    }

    return completed;
  }

  /**
   * Increment progress on a quest and send a notification if threshold met.
   */
  private async incrementProgress(
    userId: string,
    quest: QuestDefinition,
  ): Promise<{ questSlug: string; tokensAwarded: number; tokenType: string } | null> {
    const periodStart = getPeriodStartForType(quest.questType);
    const db = await getDbModule();

    // Get current progress
    const current = await this.getUserQuestProgress(userId, quest);

    // Already completed this period
    if (current.completedAt !== null) {
      return null;
    }

    const newProgress = current.progress + 1;
    const isNowComplete = newProgress >= quest.triggerThreshold;

    if (db) {
      try {
        const periodVal = periodStart;
        await db.executeQuery(
          `INSERT INTO user_quest_progress (user_id, quest_id, progress, completed_at, period_start)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (user_id, quest_id, period_start) DO UPDATE SET
             progress = $3,
             completed_at = COALESCE(user_quest_progress.completed_at, $4)`,
          [
            userId,
            quest.id,
            newProgress,
            isNowComplete ? new Date().toISOString() : null,
            periodVal,
          ],
        );
      } catch (error) {
        _logger.error("[QuestService] incrementProgress DB failed:", error as any);
      }
    }

    // In-memory fallback
    const key = `${userId}:${quest.id}:${periodStart || "all"}`;
    memoryProgress.set(key, {
      progress: newProgress,
      completedAt: isNowComplete ? new Date().toISOString() : null,
      claimedAt: null,
    });

    // Award tokens on completion
    if (isNowComplete) {
      // Notify the user they can claim their reward
      try {
        await notificationDatabase.createNotification(
          userId,
          "quest_completed",
          "Sanctum Task Completed!",
          `You completed "${quest.title}". Claim your ${quest.tokenRewardAmount} ${quest.tokenRewardType} tokens!`,
          {
            metadata: {
              questSlug: quest.slug,
              tokenType: quest.tokenRewardType,
              tokenAmount: quest.tokenRewardAmount,
            }
          }
        );
      } catch (err) {
        _logger.error("[QuestService] Failed to create quest completion notification", err as any);
      }

      return {
        questSlug: quest.slug,
        tokensAwarded: quest.tokenRewardAmount,
        tokenType: quest.tokenRewardType,
      };
    }

    return null;
  }

  /**
   * Claim the reward for a completed quest.
   */
  async claimQuestReward(
    userId: string,
    questSlug: string,
    periodStartStr?: string | null
  ): Promise<{ success: boolean; tokensAwarded: number; tokenType: string; message: string }> {
    const db = await getDbModule();
    const quests = await this.getActiveQuests();
    const quest = quests.find(q => q.slug === questSlug);
    if (!quest) {
      return { success: false, tokensAwarded: 0, tokenType: "", message: "Quest not found" };
    }

    const current = await this.getUserQuestProgress(userId, quest);
    if (!current.completedAt) {
      return { success: false, tokensAwarded: 0, tokenType: "", message: "Quest not yet completed" };
    }
    if (current.claimedAt) {
      return { success: false, tokensAwarded: 0, tokenType: "", message: "Reward already claimed" };
    }

    const periodStart = periodStartStr !== undefined ? periodStartStr : getPeriodStartForType(quest.questType);

    if (db) {
      try {
        const periodCondition = periodStart !== null
          ? `AND period_start = $3`
          : `AND period_start IS NULL`;
        const params = periodStart !== null
          ? [new Date().toISOString(), userId, quest.id, periodStart]
          : [new Date().toISOString(), userId, quest.id];

        await db.executeQuery(
          `UPDATE user_quest_progress
           SET claimed_at = $1
           WHERE user_id = $2 AND quest_id = $3
             ${periodCondition}`,
          params,
        );
      } catch (error) {
        _logger.error("[QuestService] claimQuestReward DB failed:", error as any);
        return { success: false, tokensAwarded: 0, tokenType: "", message: "Database error" };
      }
    }

    // In-memory fallback
    const key = `${userId}:${quest.id}:${periodStart || "all"}`;
    const mem = memoryProgress.get(key);
    if (mem) {
      memoryProgress.set(key, { ...mem, claimedAt: new Date().toISOString() });
    }

    const reward = await this.awardQuestReward(userId, quest);
    return {
      success: true,
      tokensAwarded: reward.tokensAwarded,
      tokenType: reward.tokenType,
      message: "Reward claimed successfully!"
    };
  }

  /**
   * Award tokens for completing a quest.
   */
  private async awardQuestReward(
    userId: string,
    quest: QuestDefinition,
  ): Promise<{ questSlug: string; tokensAwarded: number; tokenType: string }> {
    const todayStr = new Date().toISOString().slice(0, 10);
    const idemKey = `quest_claim:${userId}:${quest.slug}:${todayStr}`;

    if (quest.tokenRewardType === "all") {
      // Split evenly across all 4 token types
      const perToken = Math.round((quest.tokenRewardAmount / 4) * 100) / 100;
      const credits = TOKEN_TYPES.map((t: TokenType) => ({ tokenType: t, amount: perToken }));

      await tokenEconomy.creditMultipleTokens(userId, credits, "quest_reward", {
        sourceId: quest.slug,
        description: `Quest completed: ${quest.title}`,
        idempotencyKey: idemKey,
      });

      return {
        questSlug: quest.slug,
        tokensAwarded: quest.tokenRewardAmount,
        tokenType: "all",
      };
    } else {
      await tokenEconomy.creditTokens(
        userId,
        quest.tokenRewardType,
        quest.tokenRewardAmount,
        "quest_reward",
        {
          sourceId: quest.slug,
          description: `Quest completed: ${quest.title}`,
          idempotencyKey: idemKey,
        },
      );

      return {
        questSlug: quest.slug,
        tokensAwarded: quest.tokenRewardAmount,
        tokenType: quest.tokenRewardType,
      };
    }
  }

  /**
   * Check if all non-meta daily quests are complete.
   */
  private async checkAllDailiesComplete(userId: string): Promise<boolean> {
    const quests = await this.getActiveQuests();
    const dailyQuests = quests.filter(
      q => q.questType === "daily" && q.triggerEvent !== "complete_all_dailies"
    );

    for (const quest of dailyQuests) {
      const progress = await this.getUserQuestProgress(userId, quest);
      if (progress.completedAt === null) {
        return false;
      }
    }

    return dailyQuests.length > 0;
  }
}

export const questService = new QuestService();
