/**
 * @jest-environment node
 *
 * Liveness for the daily agents_yield cron.
 *
 * The interesting claim is not that a threshold works — it is that the OBVIOUS
 * check cannot work here. `agents_yield` has two writers: the daily cron and a
 * scattered ad-hoc writer that lands 8-20 times a day. So "hours since the last
 * yield row" never goes stale, and a staleness alarm would sit green through a
 * completely dead cron.
 */

import {
  classifyCronLedgerPath,
  MIN_CRON_BATCH,
  type CronLedgerSignals,
} from "@/services/cronLedgerHealth";

const healthy: CronLedgerSignals = {
  biggestBatch24h: 29,
  eligibleProducers: 30,
  live: true,
};

describe("classifyCronLedgerPath", () => {
  it("reports OK when the daily batch landed", () => {
    const r = classifyCronLedgerPath(healthy);
    expect(r.verdict).toBe("OK");
    expect(r.summary).toMatch(/29 agents/);
  });

  it("raises INCIDENT when only the ad-hoc writer is active", () => {
    // The exact shape of a dead cron: yield rows still arrive, but never as a
    // batch. This is what a staleness check cannot see.
    const r = classifyCronLedgerPath({ ...healthy, biggestBatch24h: 2 });
    expect(r.verdict).toBe("INCIDENT");
    expect(r.summary).toMatch(/has not run/);
  });

  it("raises INCIDENT when nothing was written at all", () => {
    expect(classifyCronLedgerPath({ ...healthy, biggestBatch24h: 0 }).verdict).toBe("INCIDENT");
  });

  it("stays IDLE when no agent is eligible — silence is not breakage", () => {
    expect(
      classifyCronLedgerPath({ ...healthy, eligibleProducers: 0, biggestBatch24h: 0 }).verdict,
    ).toBe("IDLE");
  });

  it("reports UNKNOWN rather than green when the query failed", () => {
    const r = classifyCronLedgerPath({ ...healthy, live: false });
    expect(r.verdict).toBe("UNKNOWN");
    expect(r.summary).toMatch(/No source/);
  });

  describe("back-test against 21 days of real history", () => {
    // (day, largest single-minute batch) measured from production. The ad-hoc
    // writer contributed 8-20 separate write instants on every one of these
    // days, never exceeding 2 agents each.
    const HISTORY: Array<[string, number]> = [
      ["2026-08-08", 29], ["2026-08-07", 29], ["2026-08-06", 29], ["2026-08-05", 29],
      ["2026-08-04", 29], ["2026-08-03", 29], ["2026-08-02", 29], ["2026-08-01", 29],
      ["2026-07-31", 29], ["2026-07-30", 29], ["2026-07-29", 29], ["2026-07-28", 29],
      ["2026-07-27", 29], ["2026-07-26", 29], ["2026-07-25", 29], ["2026-07-24", 29],
      ["2026-07-23", 29], ["2026-07-22", 30], ["2026-07-21", 30], ["2026-07-20", 30],
      ["2026-07-19", 56],
    ];

    it("is silent on every one of the 21 healthy days", () => {
      const verdicts = HISTORY.map(([, batch]) =>
        classifyCronLedgerPath({ ...healthy, biggestBatch24h: batch }).verdict,
      );
      expect(verdicts).toHaveLength(21);
      expect(verdicts.every((v) => v === "OK")).toBe(true);
    });

    it("keeps a wide margin — the threshold is a gap, not a tuned edge", () => {
      // Healthy floor 29, ad-hoc ceiling 2. A threshold anywhere between is
      // correct, which is what makes this robust rather than calibrated.
      const healthyFloor = Math.min(...HISTORY.map(([, b]) => b));
      const adHocCeiling = 2;
      expect(MIN_CRON_BATCH).toBeGreaterThan(adHocCeiling);
      expect(MIN_CRON_BATCH).toBeLessThan(healthyFloor);
      expect(healthyFloor / adHocCeiling).toBeGreaterThan(10);
    });

    it("would fire the day the cron stopped, with the ad-hoc writer still active", () => {
      // Simulated dead cron on an otherwise normal day.
      expect(classifyCronLedgerPath({ ...healthy, biggestBatch24h: 2 }).verdict).toBe("INCIDENT");
    });
  });
});
