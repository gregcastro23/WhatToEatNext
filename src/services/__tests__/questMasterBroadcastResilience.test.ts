import {
  questService,
  resetMasterQuestBroadcastSupportCache,
} from "../QuestService";
import type { QuestDefinition } from "@/types/quest";

describe("QuestService master quest broadcast enum resilience", () => {
  const sampleQuest: QuestDefinition = {
    id: "quest-1",
    slug: "daily_alchemical_attunement",
    title: "Daily Attunement",
    description: "Align your elemental constitution",
    category: "exploration",
    questType: "master",
    status: "active",
    tokenRewardAmount: 10,
    tokenRewardType: "spirit",
    targetCount: 1,
    currentCount: 0,
    isCompleted: true,
    progressPercent: 100,
  };

  beforeEach(() => {
    resetMasterQuestBroadcastSupportCache();
    jest.clearAllMocks();
  });

  it("skips notification insert when database lacks master_quest_broadcast enum value", async () => {
    const executedQueries: string[] = [];
    const mockDb = {
      executeQuery: jest.fn(async (sql: string) => {
        executedQueries.push(sql);
        if (sql.includes("pg_enum")) {
          return { rows: [{ exists: false }] };
        }
        return { rows: [] };
      }),
    };

    const isSupported = await questService.isMasterQuestBroadcastSupported(mockDb);
    expect(isSupported).toBe(false);

    // Verify subsequent calls use cache
    const isSupportedCached = await questService.isMasterQuestBroadcastSupported(mockDb);
    expect(isSupportedCached).toBe(false);
    expect(mockDb.executeQuery).toHaveBeenCalledTimes(1);
  });

  it("permits notification insert when database supports master_quest_broadcast", async () => {
    const mockDb = {
      executeQuery: jest.fn(async (sql: string) => {
        if (sql.includes("pg_enum")) {
          return { rows: [{ exists: true }] };
        }
        return { rows: [] };
      }),
    };

    const isSupported = await questService.isMasterQuestBroadcastSupported(mockDb);
    expect(isSupported).toBe(true);
  });

  it("gracefully falls back to true if pg_enum query fails, letting SQL error handler manage it", async () => {
    const mockDb = {
      executeQuery: jest.fn(async () => {
        throw new Error("permission denied for pg_enum");
      }),
    };

    const isSupported = await questService.isMasterQuestBroadcastSupported(mockDb);
    expect(isSupported).toBe(true);
  });
});
