/**
 * @jest-environment node
 *
 * The check that would have caught the twelve-week sync-debit outage.
 *
 * `/api/economy/sync-debit` 500'd on 100% of calls from 2026-05-15 to
 * 2026-08-07 while every dashboard stayed green. These pin the three
 * behaviours that make the check work, each of which a naive version got wrong:
 *
 *   1. traffic + no debits  -> INCIDENT   (the bug)
 *   2. no traffic           -> IDLE       (not an alarm; alarming on silence
 *                                          alone flagged 9 of 13 ledger sources)
 *   3. query failed         -> UNKNOWN    (never green from missing data)
 */

import {
  classifyDebitPath,
  type DebitPathSignals,
} from "@/services/agentDebitPathHealth";

const base: DebitPathSignals = {
  agentTraffic24h: 0,
  debits24h: 0,
  lastDebitAgeMs: null,
  live: true,
};
const DAY = 24 * 60 * 60 * 1000;

describe("classifyDebitPath", () => {
  it("raises INCIDENT when agents are active but no debits land", () => {
    const r = classifyDebitPath({
      ...base,
      agentTraffic24h: 307,
      debits24h: 0,
      lastDebitAgeMs: 84 * DAY,
    });
    expect(r.verdict).toBe("INCIDENT");
    expect(r.summary).toMatch(/ZERO debits/);
    expect(r.summary).toMatch(/84d ago/);
  });

  it("stays IDLE when there is no agent traffic — silence is not breakage", () => {
    // The failure mode of every staleness-only alarm: a naturally quiet path
    // is not a broken one, and crying wolf here makes the alarm worthless.
    expect(classifyDebitPath({ ...base, agentTraffic24h: 0, debits24h: 0 }).verdict).toBe("IDLE");
  });

  it("reports OK once debits are landing again", () => {
    // Live production values measured immediately after the fix deployed.
    const r = classifyDebitPath({
      ...base,
      agentTraffic24h: 410,
      debits24h: 143,
      lastDebitAgeMs: 60_000,
    });
    expect(r.verdict).toBe("OK");
    expect(r.summary).toMatch(/143 debits/);
  });

  it("reports UNKNOWN rather than green when the query failed", () => {
    const r = classifyDebitPath({ ...base, agentTraffic24h: 307, live: false });
    expect(r.verdict).toBe("UNKNOWN");
    expect(r.summary).toMatch(/No source/);
  });

  it("says 'never' when the ledger has no debit at all", () => {
    const r = classifyDebitPath({
      ...base,
      agentTraffic24h: 12,
      debits24h: 0,
      lastDebitAgeMs: null,
    });
    expect(r.verdict).toBe("INCIDENT");
    expect(r.summary).toMatch(/never/);
  });

  it("treats a single debit as landing — the boundary is zero, not a threshold", () => {
    expect(
      classifyDebitPath({ ...base, agentTraffic24h: 500, debits24h: 1 }).verdict,
    ).toBe("OK");
  });

  describe("replay of the real 2026 history", () => {
    // (day, agent feed events 24h, agents_operation rows 24h) measured from
    // production. The regression landed 2026-05-15.
    const HISTORY: Array<[string, number, number]> = [
      ["2026-05-10", 0, 0],
      ["2026-05-13", 0, 0],
      ["2026-05-16", 48, 210],
      ["2026-05-19", 0, 0],
      ["2026-05-22", 1, 0],
      ["2026-06-03", 316, 0],
      ["2026-07-21", 357, 0],
      ["2026-08-05", 350, 0],
    ];

    const verdicts = HISTORY.map(([day, traffic, debits]) => ({
      day,
      verdict: classifyDebitPath({
        ...base,
        agentTraffic24h: traffic,
        debits24h: debits,
        lastDebitAgeMs: debits > 0 ? 60_000 : 30 * DAY,
      }).verdict,
    }));

    it("fires on 2026-05-22, seven days in rather than eighty-four", () => {
      expect(verdicts.find((v) => v.day === "2026-05-22")?.verdict).toBe("INCIDENT");
    });

    it("stays quiet on the genuinely idle days", () => {
      for (const day of ["2026-05-10", "2026-05-13", "2026-05-19"]) {
        expect(verdicts.find((v) => v.day === day)?.verdict).toBe("IDLE");
      }
    });

    it("is OK on 2026-05-16, the one healthy sample before the break", () => {
      expect(verdicts.find((v) => v.day === "2026-05-16")?.verdict).toBe("OK");
    });

    it("never returns OK on any day of the outage", () => {
      const outage = verdicts.filter((v) => v.day >= "2026-05-22");
      expect(outage).toHaveLength(4);
      expect(outage.every((v) => v.verdict === "INCIDENT")).toBe(true);
    });
  });
});
