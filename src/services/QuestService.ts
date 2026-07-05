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
import { notificationDatabase } from "./notificationDatabaseService";
import { tokenEconomy } from "./TokenEconomyService";

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

const MASTER_QUEST_DEFINITIONS = [
  {
    slug: "master-curie-transmutation",
    title: "Master Quest: Curie's Transmutation",
    description: "Marie Curie demonstrates an alchemical transmutation for the human community.",
    questType: "achievement",
    tokenRewardType: "Substance",
    tokenRewardAmount: 20,
    triggerEvent: "agent_alchemical_transmutation",
    triggerThreshold: 1,
    sortOrder: 90,
  },
  {
    slug: "master-da-vinci-geometry",
    title: "Master Quest: Da Vinci's Geometry",
    description: "Leonardo da Vinci opens a sacred geometry design pattern for the human community.",
    questType: "achievement",
    tokenRewardType: "Spirit",
    tokenRewardAmount: 20,
    triggerEvent: "agent_sacred_geometry_design",
    triggerThreshold: 1,
    sortOrder: 91,
  },
  {
    slug: "master-tesla-harmonics",
    title: "Master Quest: Tesla Harmonics",
    description: "Nikola Tesla calibrates an energy harmonic that rewards the human community.",
    questType: "achievement",
    tokenRewardType: "Matter",
    tokenRewardAmount: 20,
    triggerEvent: "agent_energy_harmonic_calibration",
    triggerThreshold: 1,
    sortOrder: 92,
  },
] as const;

const MASTER_QUEST_EVENTS = new Set<string>(MASTER_QUEST_DEFINITIONS.map(q => q.triggerEvent));
const MASTER_QUEST_SLUGS = new Set<string>(MASTER_QUEST_DEFINITIONS.map(q => q.slug));
const COMMUNITY_REWARD_AMOUNT = 0.1;
const DECIMAL_PRECISION = 4;
const formatDecimal = (n: number): string => n.toFixed(DECIMAL_PRECISION);
let masterQuestsEnsured = false;

export interface QuestEventMetadata {
  agentName?: string;
  sacredStat?: string;
  planetarySignature?: Record<string, unknown>;
  [key: string]: unknown;
}

// ─── Row Converters ───────────────────────────────────────────────────

interface QuestDefinitionRow {
  id?: unknown;
  slug?: unknown;
  title?: unknown;
  description?: unknown;
  quest_type?: unknown;
  token_reward_type?: unknown;
  token_reward_amount?: unknown;
  trigger_event?: unknown;
  trigger_threshold?: unknown;
  is_active?: unknown;
  sort_order?: unknown;
}

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseFloat(value)
        : Number.NaN;

  return Number.isFinite(parsed) ? parsed : fallback;
};

function rowToQuestDef(row: QuestDefinitionRow): QuestDefinition {
  return {
    id: String(row.id ?? ""),
    slug: String(row.slug ?? ""),
    title: String(row.title ?? ""),
    description: row.description == null ? null : String(row.description),
    questType: row.quest_type as QuestDefinition["questType"],
    tokenRewardType: row.token_reward_type as TokenType | "all",
    tokenRewardAmount: toNumber(row.token_reward_amount),
    triggerEvent: String(row.trigger_event ?? ""),
    triggerThreshold: toNumber(row.trigger_threshold, 1),
    isActive: row.is_active !== false,
    sortOrder: toNumber(row.sort_order),
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

  private async ensureMasterQuests(): Promise<void> {
    if (masterQuestsEnsured) return;

    const db = await getDbModule();
    if (!db) return;

    try {
      for (const quest of MASTER_QUEST_DEFINITIONS) {
        await db.executeQuery(
          `INSERT INTO quest_definitions
             (slug, title, description, quest_type, token_reward_type, token_reward_amount, trigger_event, trigger_threshold, sort_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (slug) DO UPDATE SET
             title = EXCLUDED.title,
             description = EXCLUDED.description,
             quest_type = EXCLUDED.quest_type,
             token_reward_type = EXCLUDED.token_reward_type,
             token_reward_amount = EXCLUDED.token_reward_amount,
             trigger_event = EXCLUDED.trigger_event,
             trigger_threshold = EXCLUDED.trigger_threshold,
             sort_order = EXCLUDED.sort_order,
             is_active = true`,
          [
            quest.slug,
            quest.title,
            quest.description,
            quest.questType,
            quest.tokenRewardType,
            quest.tokenRewardAmount,
            quest.triggerEvent,
            quest.triggerThreshold,
            quest.sortOrder,
          ],
        );
      }
      masterQuestsEnsured = true;
    } catch (error) {
      _logger.error("[QuestService] ensureMasterQuests failed:", error);
    }
  }

  /**
   * Get all active quest definitions.
   */
  async getActiveQuests(): Promise<QuestDefinition[]> {
    const db = await getDbModule();

    if (db) {
      try {
        await this.ensureMasterQuests();
        const result = await db.executeQuery(
          `SELECT * FROM quest_definitions WHERE is_active = true ORDER BY sort_order ASC`,
        );
        return result.rows.map(rowToQuestDef);
      } catch (error) {
        _logger.error("[QuestService] getActiveQuests failed:", error);
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
        _logger.error("[QuestService] getUserQuestProgress failed:", error);
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
    eventMetadata?: QuestEventMetadata,
  ): Promise<Array<{ questSlug: string; tokensAwarded: number; tokenType: string }>> {
    const isMasterEvent = MASTER_QUEST_EVENTS.has(event);
    if (isMasterEvent && !(await this.isAgenticUser(userId))) {
      _logger.warn("[QuestService] Ignoring agent-only master quest event from human user", {
        userId,
        event,
      });
      return [];
    }

    const quests = await this.getActiveQuests();
    const matchingQuests = quests.filter(q => q.triggerEvent === event);
    const completed: Array<{ questSlug: string; tokensAwarded: number; tokenType: string }> = [];

    for (const quest of matchingQuests) {
      const result = await this.incrementProgress(userId, quest);
      if (result) {
        completed.push(result);
        if (MASTER_QUEST_SLUGS.has(quest.slug)) {
          await this.broadcastMasterQuestReward(userId, quest, eventMetadata);
        }
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
        _logger.error("[QuestService] incrementProgress DB failed:", error);
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
        _logger.error("[QuestService] Failed to create quest completion notification", err);
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
    const periodCondition = periodStart !== null
      ? `AND period_start = $3`
      : `AND period_start IS NULL`;
    const stampParams = periodStart !== null
      ? [new Date().toISOString(), userId, quest.id, periodStart]
      : [new Date().toISOString(), userId, quest.id];
    const unstampParams = periodStart !== null
      ? [userId, quest.id, periodStart]
      : [userId, quest.id];

    if (db) {
      try {
        // Atomic claim gate: only the caller whose UPDATE flips claimed_at from
        // NULL wins — two concurrent claims can both pass the pre-check above,
        // but only one gets a row back here.
        const stamped = await db.executeQuery(
          `UPDATE user_quest_progress
           SET claimed_at = $1
           WHERE user_id = $2 AND quest_id = $3
             ${periodCondition}
             AND claimed_at IS NULL
           RETURNING user_id`,
          stampParams,
        );
        if (stamped.rows.length === 0) {
          return { success: false, tokensAwarded: 0, tokenType: "", message: "Reward already claimed" };
        }
      } catch (error) {
        _logger.error("[QuestService] claimQuestReward DB failed:", error);
        return { success: false, tokensAwarded: 0, tokenType: "", message: "Database error" };
      }
    }

    // In-memory fallback
    const key = `${userId}:${quest.id}:${periodStart || "all"}`;
    const mem = memoryProgress.get(key);
    if (mem) {
      memoryProgress.set(key, { ...mem, claimedAt: new Date().toISOString() });
    }

    const reward = await this.awardQuestReward(userId, quest, periodStart);
    if (!reward.credited) {
      // The stamp committed but the credit didn't — release the stamp so the
      // reward isn't permanently burned; the period-scoped idempotency key
      // keeps the retry from ever double-crediting.
      if (db) {
        try {
          await db.executeQuery(
            `UPDATE user_quest_progress
             SET claimed_at = NULL
             WHERE user_id = $1 AND quest_id = $2
               ${periodStart !== null ? "AND period_start = $3" : "AND period_start IS NULL"}`,
            unstampParams,
          );
        } catch (error) {
          _logger.error(
            "[QuestService] claim credit failed AND stamp release failed — reward needs manual reconcile:",
            { userId, questSlug, periodStart, error },
          );
        }
      }
      return { success: false, tokensAwarded: 0, tokenType: "", message: "Reward crediting failed — try again." };
    }

    return {
      success: true,
      tokensAwarded: reward.tokensAwarded,
      tokenType: reward.tokenType,
      message: "Reward claimed successfully!"
    };
  }

  /**
   * Award tokens for completing a quest. `credited: false` means nothing was
   * written (the caller must release the claim stamp). The idempotency key is
   * PERIOD-scoped — the previous day-scoped key collided when a current and a
   * prior period of the same quest were both claimed on the same day, silently
   * dropping the second reward.
   */
  private async awardQuestReward(
    userId: string,
    quest: QuestDefinition,
    periodStart: string | null,
  ): Promise<{ questSlug: string; tokensAwarded: number; tokenType: string; credited: boolean }> {
    const idemKey = `quest_claim:${userId}:${quest.slug}:${periodStart || "all"}`;

    if (quest.tokenRewardType === "all") {
      // Split evenly across all 4 token types
      const perToken = Math.round((quest.tokenRewardAmount / 4) * 100) / 100;
      const credits = TOKEN_TYPES.map((t: TokenType) => ({ tokenType: t, amount: perToken }));

      const balances = await tokenEconomy.creditMultipleTokens(userId, credits, "quest_reward", {
        sourceId: quest.slug,
        description: `Quest completed: ${quest.title}`,
        idempotencyKey: idemKey,
      });

      return {
        questSlug: quest.slug,
        tokensAwarded: quest.tokenRewardAmount,
        tokenType: "all",
        credited: balances !== null,
      };
    } else {
      const balances = await tokenEconomy.creditTokens(
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
        credited: balances !== null,
      };
    }
  }

  private async isAgenticUser(userId: string): Promise<boolean> {
    const db = await getDbModule();
    if (!db) return false;

    try {
      const result = await db.executeQuery(
        `SELECT COALESCE(is_agent, false) AS is_agent
         FROM users
         WHERE id = $1
         LIMIT 1`,
        [userId],
      );
      return result.rows[0]?.is_agent === true;
    } catch (error) {
      _logger.error("[QuestService] isAgenticUser failed:", error);
      return false;
    }
  }

  private async broadcastMasterQuestReward(
    completedByUserId: string,
    quest: QuestDefinition,
    eventMetadata?: QuestEventMetadata,
  ): Promise<void> {
    const db = await getDbModule();
    if (!db) return;

    const todayStr = new Date().toISOString().slice(0, 10);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const agentName = eventMetadata?.agentName?.trim() || "A planetary agent";
    const sacredStat = eventMetadata?.sacredStat;

    // ESMS columns mirror token_balances; map TokenType -> column name.
    const columnOf = (t: TokenType): "spirit" | "essence" | "matter" | "substance" =>
      t.toLowerCase() as "spirit" | "essence" | "matter" | "substance";

    // Build a single credit-list keyed by token type. For "all" rewards, split
    // evenly across the four ESMS tokens; otherwise the full amount goes to
    // the quest's target type. Amounts are formatted as fixed-point strings
    // to satisfy the DECIMAL(12,4) operator constraints.
    const credits: Array<{ tokenType: TokenType; amount: string }> = [];
    if (quest.tokenRewardType === "all") {
      const per = COMMUNITY_REWARD_AMOUNT / TOKEN_TYPES.length;
      for (const t of TOKEN_TYPES) credits.push({ tokenType: t, amount: formatDecimal(per) });
    } else {
      credits.push({
        tokenType: quest.tokenRewardType,
        amount: formatDecimal(COMMUNITY_REWARD_AMOUNT),
      });
    }

    try {
      // Single set-based credit per token type. Ledger insert is gated by a
      // composite idempotency key so the broadcast can only land once per
      // (quest, completing agent, day) for each recipient — replays of the
      // same agent event do not double-credit.
      for (const { tokenType, amount } of credits) {
        const column = columnOf(tokenType);
        const idempotencyPrefix =
          `master_reward:${quest.id}:${completedByUserId}:${todayStr}:${tokenType}`;

        await db.executeQuery(
          `WITH recipients AS (
             SELECT id AS user_id
             FROM users
             WHERE COALESCE(is_agent, false) = false
               AND COALESCE(is_active, true) = true
               AND id <> $1
           ),
           ensure_balances AS (
             INSERT INTO token_balances (user_id)
             SELECT user_id FROM recipients
             ON CONFLICT (user_id) DO NOTHING
           ),
           ledger AS (
             INSERT INTO token_transactions
               (transaction_group_id, user_id, token_type, amount,
                source_type, source_id, description, idempotency_key)
             SELECT
               uuid_generate_v4(),
               r.user_id,
               $2::varchar,
               $3::numeric,
               'quest_reward'::varchar,
               $4::varchar,
               $5::text,
               $6 || ':' || r.user_id
             FROM recipients r
             ON CONFLICT (idempotency_key) DO NOTHING
             RETURNING user_id
           )
           UPDATE token_balances tb
           SET ${column} = tb.${column} + $3::numeric,
               updated_at = now()
           FROM ledger l
           WHERE tb.user_id = l.user_id`,
          [
            completedByUserId,
            tokenType,
            amount,
            quest.slug,
            `Community reward: ${quest.title}`,
            idempotencyPrefix,
          ],
        );
      }

      // Set-based notification insert. notifications.id is UUID, so we derive
      // a deterministic v5 UUID from (quest, agent, day, recipient) — that
      // gives us a stable dedup key without needing an extra unique column.
      const broadcastKeyPrefix =
        `master_broadcast:${quest.id}:${completedByUserId}:${todayStr}`;
      const rewardAmountStr = formatDecimal(COMMUNITY_REWARD_AMOUNT);
      const summaryTokenLabel =
        quest.tokenRewardType === "all" ? "ESMS" : quest.tokenRewardType;
      const sacredStatPhrase = sacredStat ? ` (${sacredStat})` : "";
      const title = "Master Quest Broadcast";
      const message =
        `${agentName} completed "${quest.title}"${sacredStatPhrase}. ` +
        `You received ${rewardAmountStr} ${summaryTokenLabel}.`;
      const metadata = JSON.stringify({
        questSlug: quest.slug,
        completedByUserId,
        communityRewardAmount: COMMUNITY_REWARD_AMOUNT,
        tokenType: quest.tokenRewardType,
        agentName,
        sacredStat: sacredStat ?? null,
        communityBuff: {
          kind: "master_quest_resonance",
          yieldMultiplier: 1.05,
          expiresAt,
        },
      });

      await db.executeQuery(
        `INSERT INTO notifications
           (id, user_id, type, title, message, metadata, expires_at)
         SELECT
           uuid_generate_v5(
             '6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid,
             $1 || ':' || u.id::text
           ),
           u.id,
           'master_quest_broadcast'::notification_type,
           $2,
           $3,
           $4::jsonb,
           $5::timestamptz
         FROM users u
         WHERE COALESCE(u.is_agent, false) = false
           AND COALESCE(u.is_active, true) = true
           AND u.id <> $6
         ON CONFLICT (id) DO NOTHING`,
        [
          broadcastKeyPrefix,
          title,
          message,
          metadata,
          expiresAt,
          completedByUserId,
        ],
      );
    } catch (error) {
      _logger.error("[QuestService] broadcastMasterQuestReward failed:", error);
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
