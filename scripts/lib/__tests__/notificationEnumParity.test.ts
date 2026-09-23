import {
  CANONICAL_NOTIFICATION_TYPES,
  checkEnumParity,
  getMigrationNotificationTypes,
  getTypeScriptNotificationTypes,
} from "../notificationEnumParity";

describe("notificationEnumParity static gate & database verification", () => {
  it("declares exactly 20 canonical notification types matching TS union", () => {
    expect(CANONICAL_NOTIFICATION_TYPES.length).toBe(20);
    expect(CANONICAL_NOTIFICATION_TYPES).toContain("quest_completed");
    expect(CANONICAL_NOTIFICATION_TYPES).toContain("master_quest_broadcast");
    expect(CANONICAL_NOTIFICATION_TYPES).toContain("agent_broadcast");
    expect(CANONICAL_NOTIFICATION_TYPES).toContain("reaction_received");
    expect(CANONICAL_NOTIFICATION_TYPES).toContain("comment_received");
  });

  it("statically verifies 100% parity between SQL migrations and TypeScript NotificationType union", () => {
    const migrationTypes = getMigrationNotificationTypes();
    const typeScriptTypes = getTypeScriptNotificationTypes();

    // Verify all TypeScript types are covered in database/init migrations
    const missingInMigrations = typeScriptTypes.filter((t) => !migrationTypes.includes(t));
    expect(missingInMigrations).toEqual([]);

    // Verify all migration types exist in TypeScript definition
    const extraInMigrations = migrationTypes.filter((t) => !typeScriptTypes.includes(t));
    expect(extraInMigrations).toEqual([]);

    expect(migrationTypes).toEqual(typeScriptTypes);
  });

  it("detects when Migration 30 or Migration 88 values are missing in database", async () => {
    const mockDbValues = CANONICAL_NOTIFICATION_TYPES.filter(
      (v) => v !== "quest_completed" && v !== "master_quest_broadcast" && v !== "agent_broadcast",
    );

    const mockPool = {
      query: jest.fn(async () => ({
        rows: mockDbValues.map((enumlabel) => ({ enumlabel })),
      })),
    };

    const result = await checkEnumParity(mockPool as any, false);
    expect(result.isCompliant).toBe(false);
    expect(result.missingValues).toEqual([
      "quest_completed",
      "master_quest_broadcast",
      "agent_broadcast",
    ]);
    expect(mockPool.query).toHaveBeenCalledTimes(1);
  });

  it("passes when all 20 canonical values are present in database", async () => {
    const mockPool = {
      query: jest.fn(async () => ({
        rows: CANONICAL_NOTIFICATION_TYPES.map((enumlabel) => ({ enumlabel })),
      })),
    };

    const result = await checkEnumParity(mockPool as any, false);
    expect(result.isCompliant).toBe(true);
    expect(result.missingValues).toEqual([]);
  });

  it("applies missing values when applyFixes is true", async () => {
    const executedQueries: string[] = [];
    const mockDbValues = CANONICAL_NOTIFICATION_TYPES.filter(
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
    expect(result.isCompliant).toBe(false);
    expect(result.appliedValues).toEqual(["quest_completed", "master_quest_broadcast"]);
    expect(executedQueries.length).toBe(3); // 1 select + 2 alter statements
  });
});
