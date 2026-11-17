/**
 * `LiveActivityPayload.live` is documented as "True only when every source
 * query succeeded". It was structurally incapable of being false: all six
 * readers caught their own errors and returned `[]`, so every promise handed
 * to `Promise.allSettled` was fulfilled and `every(fulfilled)` was a tautology.
 *
 * The visible consequence was the worst kind: a total database outage rendered
 * as a green "all sources live" feed reading "Quiet — no activity".
 */

import { getLiveActivity } from "@/services/liveActivityService";

// NOTE: the service imports from "@/lib/database/connection", not
// "@/lib/database". Mocking the wrong path leaves the real executeQuery in
// place, which rejects under the no-network test env — the failure assertions
// would then pass for entirely the wrong reason.
jest.mock("@/lib/database/connection", () => ({
  executeQuery: jest.fn(),
}));

jest.mock("@/lib/logger", () => ({
  _logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn() },
}));

const { executeQuery } = jest.requireMock("@/lib/database/connection") as {
  executeQuery: jest.Mock;
};

describe("getLiveActivity live flag", () => {
  beforeEach(() => {
    executeQuery.mockReset();
  });

  it("reports live: false when every source query fails", async () => {
    executeQuery.mockRejectedValue(new Error("connection refused"));

    const payload = await getLiveActivity();

    // The whole point: a dead database must not read as a healthy quiet feed.
    expect(payload.live).toBe(false);
    expect(payload.events).toEqual([]);
  });

  it("reports live: false when only one source fails", async () => {
    let call = 0;
    executeQuery.mockImplementation(() => {
      call += 1;
      if (call === 1) return Promise.reject(new Error("one source down"));
      return Promise.resolve({ rows: [] });
    });

    const payload = await getLiveActivity();

    expect(payload.live).toBe(false);
  });

  it("reports live: true when every source succeeds, even with no rows", async () => {
    executeQuery.mockResolvedValue({ rows: [] });

    const payload = await getLiveActivity();

    // A genuinely quiet window is a real measurement, not a degraded one.
    expect(payload.live).toBe(true);
    expect(payload.events).toEqual([]);
  });

  it("reserves space for human visits so high-volume agent events never evict them", async () => {
    const now = Date.now();
    executeQuery.mockImplementation((sql: string) => {
      if (sql.includes("FROM feed_events")) {
        // 25 automated planetary-agent feed events (newest)
        return Promise.resolve({
          rows: Array.from({ length: 25 }, (_, i) => ({
            id: `agent-feed-${i}`,
            actor_id: `agent-${i}`,
            event_type: "transit_reflection",
            created_at: new Date(now - i * 1_000),
            email: `agent${i}@agentic.alchm.kitchen`,
            name: `Agent ${i}`,
            is_agent: true,
          })),
        });
      }
      if (sql.includes("FROM token_transactions")) {
        // 25 automated planetary-agent token sweeps (also newest)
        return Promise.resolve({
          rows: Array.from({ length: 25 }, (_, i) => ({
            id: `agent-tok-${i}`,
            user_id: `agent-${i}`,
            token_type: "SPIRIT",
            amount: "1.00",
            source_type: "daily_yield",
            description: "Agent yield",
            created_at: new Date(now - i * 1_000),
            email: `agent${i}@agentic.alchm.kitchen`,
            name: `Agent ${i}`,
            is_agent: true,
          })),
        });
      }
      if (sql.includes("FROM page_views")) {
        // 1 human visit from 30 minutes ago (older than all 50 agent events)
        const visitTime = new Date(now - 30 * 60_000);
        return Promise.resolve({
          rows: [
            {
              sid: "human-session-1",
              first_at: visitTime,
              last_at: visitTime,
              pages: 3,
              duration_ms: 95_000,
              paths: ["/", "/menu-planner", "/recipes"],
              ref_tag: "friend-review",
              visitor_hash: "a4f9c2001122334455667788",
              path: "/",
              referrer_host: null,
              city: "New York",
              region: "NY",
              country: "US",
              browser: "Chrome",
              os: "macOS",
              device_type: "desktop",
              user_id: null,
              email: null,
              name: null,
              is_agent: false,
            },
          ],
        });
      }
      return Promise.resolve({ rows: [] });
    });

    const payload = await getLiveActivity();
    expect(payload.live).toBe(true);
    expect(payload.countsByCategory.visit).toBe(1);
    const visitEvent = payload.events.find((e) => e.category === "visit");
    expect(visitEvent).toBeDefined();
    expect(visitEvent?.description).toContain("(#a4f9c2)");
    expect(visitEvent?.description).toContain("/ → /menu-planner → /recipes");
  });
});
