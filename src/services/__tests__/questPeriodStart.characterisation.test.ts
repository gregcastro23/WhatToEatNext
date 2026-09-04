/**
 * `period_start` boundary conversion.
 *
 * `period_start` is a DATE column. This repo overrides pg type parsers for
 * NUMERIC and INT8 only (src/lib/database/rawPool.ts:60,63), so DATE uses
 * node-pg's default parser, which yields a JS Date at LOCAL midnight — while
 * getUserQuestProgress declares `periodStart: string | null`.
 *
 * Untouched, that Date serialises through /api/quests as a full ISO instant,
 * which the client posts back into claimQuestReward and into a SQL WHERE
 * against the DATE column. These tests pin the conversion back to the same
 * 'YYYY-MM-DD' shape getDailyPeriodStart()/getWeeklyPeriodStart() emit.
 */
import { toPeriodStartString } from "@/services/QuestService";

describe("toPeriodStartString", () => {
  it("renders a node-pg DATE (local midnight) as its calendar date", () => {
    // Exactly what node-pg's DATE parser hands back for '2026-09-04'.
    const fromPg = new Date(2026, 8, 4);
    expect(toPeriodStartString(fromPg)).toBe("2026-09-04");
  });

  it("does not roll the day backwards the way toISOString() can", () => {
    const fromPg = new Date(2026, 0, 1); // local midnight, Jan 1
    const converted = toPeriodStartString(fromPg);
    expect(converted).toBe("2026-01-01");

    // The naive conversion agrees only when the host is at/behind UTC. This
    // documents the divergence rather than asserting a fixed wrong value, so
    // the test is correct in every timezone CI might run in.
    const naive = fromPg.toISOString().slice(0, 10);
    if (fromPg.getTimezoneOffset() < 0) {
      // east of UTC: local midnight is the previous day in UTC
      expect(naive).not.toBe(converted);
    } else {
      expect(naive).toBe(converted);
    }
  });

  it("passes a well-formed date string through unchanged", () => {
    expect(toPeriodStartString("2026-09-04")).toBe("2026-09-04");
  });

  it("trims an ISO instant back to its date part", () => {
    expect(toPeriodStartString("2026-09-04T00:00:00.000Z")).toBe("2026-09-04");
  });

  it("keeps absence absent", () => {
    expect(toPeriodStartString(null)).toBeNull();
    expect(toPeriodStartString(undefined)).toBeNull();
  });
});
