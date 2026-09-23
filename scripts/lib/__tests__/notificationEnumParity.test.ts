import {
  CANONICAL_DB_NOTIFICATION_TYPES,
  checkEnumParity,
} from "../notificationEnumParity";

describe("verifyNotificationEnumParity", () => {
  it("declares exactly 19 canonical database notification types", () => {
    expect(CANONICAL_DB_NOTIFICATION_TYPES.length).toBe(19);
    expect(CANONICAL_DB_NOTIFICATION_TYPES).toContain("quest_completed");
    expect(CANONICAL_DB_NOTIFICATION_TYPES).toContain("master_quest_broadcast");
    expect(CANONICAL_DB_NOTIFICATION_TYPES).toContain("reaction_received");
    expect(CANONICAL_DB_NOTIFICATION_TYPES).toContain("comment_received");
  });

  it("detects when Migration 30 values are missing in database", async () => {
    // Mock database pool missing migration 30 values
    const mockDbValues = CANONICAL_DB_NOTIFICATION_TYPES.filter(
      (v) => v !== "quest_completed" && v !== "master_quest_broadcast",
    );

    const mockPool = {
      query: jest.fn(async () => ({
        rows: mockDbValues.map((enumlabel) => ({ enumlabel })),
      })),
    };

    const result = await checkEnumParity(mockPool as any, false);
    expect(result.isCompliant).toBe(false);
    expect(result.missingValues).toEqual(["quest_completed", "master_quest_broadcast"]);
    expect(mockPool.query).toHaveBeenCalledTimes(1);
  });

  it("passes when all 19 canonical values are present in database", async () => {
    const mockPool = {
      query: jest.fn(async () => ({
        rows: CANONICAL_DB_NOTIFICATION_TYPES.map((enumlabel) => ({ enumlabel })),
      })),
    };

    const result = await checkEnumParity(mockPool as any, false);
    expect(result.isCompliant).toBe(true);
    expect(result.missingValues).toEqual([]);
  });

  it("applies missing values when applyFixes is true", async () => {
    const executedQueries: string[] = [];
    const mockDbValues = CANONICAL_DB_NOTIFICATION_TYPES.filter(
      (v) => v !== "quest_completed" && v !== "master_quest_broadcast",
    );

    const mockPool = {
      query: jest.fn(async (sql: string) => {
        executedQueries.push(sql);
        if (sql.includes("SELECT e.enumlabel")) {
          return { rows: mockDbValues.map((enumlabel) => ({ enumlabel })) };
        }
        return { rows: [] };
      }),
    };

    const result = await checkEnumParity(mockPool as any, true);
    expect(result.appliedValues).toEqual(["quest_completed", "master_quest_broadcast"]);
    expect(executedQueries).toContain(
      "ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'quest_completed';",
    );
    expect(executedQueries).toContain(
      "ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'master_quest_broadcast';",
    );
  });
});
