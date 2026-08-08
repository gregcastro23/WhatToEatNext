/**
 * @jest-environment node
 *
 * Which measurement the debit-path check uses for "the producer is alive".
 *
 * The real signal is the sync-debit call count in request_log_entries. The
 * older feed-event proxy is retained as a FALLBACK, and that fallback is
 * load-bearing rather than defensive: request_log_entries began covering this
 * route only when instrumentation shipped, and keeps 7 days. A hard switch
 * would report zero traffic on a perfectly healthy system, drop the check to
 * IDLE, and stop alarming — a regression indistinguishable from success, which
 * is the exact failure this whole check exists to prevent.
 */

const executeQuery = jest.fn();

jest.mock("@/lib/database/connection", () => ({
  executeQuery: (...args: unknown[]) => executeQuery(...args),
}));
jest.mock("@/lib/logger", () => ({ _logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn() } }));

import {
  fetchDebitPathSignals,
  classifyDebitPath,
} from "@/services/agentDebitPathHealth";

function rowsFrom(calls: number, feed: number, debits: number) {
  executeQuery.mockResolvedValue({
    rows: [{ calls_24h: calls, traffic_24h: feed, debits_24h: debits, last_debit_age_ms: 60_000 }],
  });
}

describe("debit-path traffic source", () => {
  beforeEach(() => executeQuery.mockReset());

  it("uses the real call count once the request log has data", async () => {
    rowsFrom(1349, 412, 143);
    const s = await fetchDebitPathSignals();
    expect(s.trafficSource).toBe("sync-debit-calls");
    expect(s.agentTraffic24h).toBe(1349);
  });

  it("falls back to feed events when the route has no call history yet", async () => {
    // The state immediately after deploy. Reporting 0 here would read as IDLE
    // on a live system and silence the alarm.
    rowsFrom(0, 412, 143);
    const s = await fetchDebitPathSignals();
    expect(s.trafficSource).toBe("agent-feed-events");
    expect(s.agentTraffic24h).toBe(412);
  });

  it("does not go IDLE just because the call count is empty", async () => {
    // The regression the fallback exists to prevent, stated as a verdict.
    rowsFrom(0, 307, 0);
    const s = await fetchDebitPathSignals();
    expect(classifyDebitPath(s).verdict).toBe("INCIDENT");
  });

  it("still reports IDLE when BOTH signals are quiet", async () => {
    rowsFrom(0, 0, 0);
    const s = await fetchDebitPathSignals();
    expect(classifyDebitPath(s).verdict).toBe("IDLE");
  });

  it("reports no source rather than a verdict when the query fails", async () => {
    executeQuery.mockRejectedValue(new Error("relation does not exist"));
    const s = await fetchDebitPathSignals();
    expect(s.live).toBe(false);
    expect(classifyDebitPath(s).verdict).toBe("UNKNOWN");
  });

  describe("the summary names the measurement it used", () => {
    it("says 'sync-debit calls' when that is what was counted", () => {
      const r = classifyDebitPath({
        agentTraffic24h: 1349, trafficSource: "sync-debit-calls",
        debits24h: 0, lastDebitAgeMs: null, live: true,
      });
      expect(r.summary).toMatch(/1349 sync-debit calls/);
    });

    it("says 'agent events' when falling back", () => {
      // The two can legitimately disagree; naming the wrong one sends the next
      // reader to the wrong table.
      const r = classifyDebitPath({
        agentTraffic24h: 412, trafficSource: "agent-feed-events",
        debits24h: 0, lastDebitAgeMs: null, live: true,
      });
      expect(r.summary).toMatch(/412 agent events/);
    });
  });
});
