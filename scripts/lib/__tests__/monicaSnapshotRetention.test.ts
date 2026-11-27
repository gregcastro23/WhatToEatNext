import {
  MONICA_SNAPSHOT_NAME_RE,
  PROTECTED_MONICA_ROLLBACK_SNAPSHOTS,
  parseMonicaSnapshotTimestamp,
  selectExpiredMonicaSnapshots,
} from "../monicaSnapshotRetention";

describe("parseMonicaSnapshotTimestamp", () => {
  it("parses valid monica_preconstruction UTC timestamps", () => {
    const parsed = parseMonicaSnapshotTimestamp("monica_preconstruction_20261120_154637");
    expect(parsed?.toISOString()).toBe("2026-11-20T15:46:37.000Z");
  });

  it("rejects malformed names and invalid calendar dates", () => {
    expect(parseMonicaSnapshotTimestamp("monica_preconstruction_20261301_000000")).toBeNull();
    expect(parseMonicaSnapshotTimestamp("monica_preconstruction_20260230_000000")).toBeNull();
    expect(parseMonicaSnapshotTimestamp('monica_preconstruction_20261101_000000"; DROP TABLE users;--')).toBeNull();
    expect(parseMonicaSnapshotTimestamp("agent_monica_snapshot_20260803_224249")).toBeNull();
  });
});

describe("selectExpiredMonicaSnapshots", () => {
  const NOW = new Date("2026-11-27T18:00:00.000Z");

  it("never drops monica_preconstruction_20260722_160100 even if flagged non-rollback", () => {
    const selected = selectExpiredMonicaSnapshots(
      [
        {
          tableName: "monica_preconstruction_20260722_160100",
          isTrueRollbackPoint: false,
        },
        {
          tableName: "monica_preconstruction_20261101_120000",
          isTrueRollbackPoint: false,
        },
      ],
      { now: NOW, retainDays: 7 },
    );

    expect(PROTECTED_MONICA_ROLLBACK_SNAPSHOTS.has("monica_preconstruction_20260722_160100")).toBe(true);
    expect(selected).toEqual(["monica_preconstruction_20261101_120000"]);
  });

  it("excludes any content-verified true rollback point regardless of age", () => {
    const selected = selectExpiredMonicaSnapshots(
      [
        {
          tableName: "monica_preconstruction_20260801_000000",
          isTrueRollbackPoint: true,
        },
        {
          tableName: "monica_preconstruction_20260802_000000",
          isTrueRollbackPoint: false,
        },
      ],
      { now: NOW, retainDays: 7 },
    );

    expect(selected).toEqual(["monica_preconstruction_20260802_000000"]);
  });

  it("keeps snapshots <= 7 days old and drops only those strictly > 7 days old", () => {
    const selected = selectExpiredMonicaSnapshots(
      [
        // Strictly older than 7 days (7d + 1s) -> drop
        { tableName: "monica_preconstruction_20261120_175959", isTrueRollbackPoint: false },
        // Exactly 7 days old -> keep
        { tableName: "monica_preconstruction_20261120_180000", isTrueRollbackPoint: false },
        // Within 7 days -> keep
        { tableName: "monica_preconstruction_20261125_173854", isTrueRollbackPoint: false },
        // Current run snapshot -> always keep
        { tableName: "monica_preconstruction_20261110_000000", isTrueRollbackPoint: false },
      ],
      {
        now: NOW,
        retainDays: 7,
        currentSnapshot: "monica_preconstruction_20261110_000000",
      },
    );

    expect(selected).toEqual(["monica_preconstruction_20261120_175959"]);
    for (const tbl of selected) {
      expect(MONICA_SNAPSHOT_NAME_RE.test(tbl)).toBe(true);
    }
  });

  it("ignores unexpected table names and deduplicates sorted output", () => {
    const selected = selectExpiredMonicaSnapshots(
      [
        { tableName: "users", isTrueRollbackPoint: false },
        { tableName: "monica_preconstruction_bad", isTrueRollbackPoint: false },
        { tableName: "monica_preconstruction_20261102_000000", isTrueRollbackPoint: false },
        { tableName: "monica_preconstruction_20261101_000000", isTrueRollbackPoint: false },
        { tableName: "monica_preconstruction_20261101_000000", isTrueRollbackPoint: false },
      ],
      { now: NOW, retainDays: 7 },
    );

    expect(selected).toEqual([
      "monica_preconstruction_20261101_000000",
      "monica_preconstruction_20261102_000000",
    ]);
  });
});
