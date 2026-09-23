import { _logger } from "@/lib/logger";
import { questService } from "../QuestService";
import { notificationDatabase } from "../notificationDatabaseService";
import type { QuestDefinition } from "@/types/economy";

describe("QuestService notification enum resilience (Migration 30)", () => {
  const sampleQuest: QuestDefinition = {
    id: "quest-1",
    slug: "daily_alchemical_attunement",
    title: "Daily Attunement",
    description: "Align your elemental constitution",
    questType: "daily",
    tokenRewardType: "spirit",
    tokenRewardAmount: 10,
    triggerEvent: "attune",
    triggerThreshold: 1,
    isActive: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(_logger, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("handles 22P02 enum mismatch on master_quest_broadcast by logging error with migration hint", async () => {
    const mockDb = {
      executeQuery: jest.fn(async (sql: string) => {
        if (sql.includes("master_quest_broadcast")) {
          const err = new Error("invalid input value for enum notification_type: master_quest_broadcast");
          Object.assign(err, { code: "22P02" });
          throw err;
        }
        return { rows: [] };
      }),
    };

    await expect(
      questService.insertMasterQuestBroadcastNotification(mockDb, {
        broadcastKeyPrefix: "test",
        title: "Test",
        message: "Test message",
        metadata: "{}",
        expiresAt: new Date().toISOString(),
        completedByUserId: "user-1",
      }),
    ).resolves.not.toThrow();

    expect(_logger.error).toHaveBeenCalledWith(
      expect.stringContaining("rejected 'master_quest_broadcast' (code 22P02). Apply database/init/30-notification-type-master-quest-broadcast.sql"),
      expect.anything(),
    );
  });

  it("handles 22P02 enum mismatch on quest_completed without failing quest reward award", async () => {
    const enumErr = new Error("invalid input value for enum notification_type: quest_completed");
    Object.assign(enumErr, { code: "22P02" });
    jest.spyOn(notificationDatabase, "createNotification").mockRejectedValueOnce(enumErr);

    const result = await questService.incrementProgress("user-1", sampleQuest);

    expect(result).toEqual({
      questSlug: "daily_alchemical_attunement",
      tokensAwarded: 10,
      tokenType: "spirit",
    });

    expect(_logger.error).toHaveBeenCalledWith(
      expect.stringContaining("rejected 'quest_completed' (code 22P02). Apply database/init/30-notification-type-master-quest-broadcast.sql"),
      expect.anything(),
    );
  });
});
