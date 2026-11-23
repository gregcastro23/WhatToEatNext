/**
 * @jest-environment node
 *
 * /admin/agents showed "0 active agents in the last 24h" beside 946 agent events,
 * and "Fail (4xx)" that was really every status >= 400 (402 insufficient_funds and
 * 409 already_applied included). The statements run in PostgreSQL, which Jest
 * cannot start here, so this file pins two things: the SQL text that defines the
 * categories, and how the rows they return are mapped. The category SEMANTICS
 * (which status lands in which column) are proved against a real PostgreSQL by
 * `scripts/checkAdminInboxSqlParses.ts`, which CI runs (monica-integrity.yml).
 *
 * @file src/services/admin/__tests__/adminAgentMetrics.test.ts
 */
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

type Query = (...args: unknown[]) => Promise<{ rows: Array<Record<string, unknown>> }>;

// `mock`-prefixed so jest lets the factory close over it; read lazily at call time.
const mockExecuteQuery = jest.fn<Query>();

jest.mock("@/lib/database/connection", () => ({
  executeQuery: (...args: unknown[]) => mockExecuteQuery(...args),
}));
jest.mock("@/lib/logger", () => ({
  _logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));

import { AGENT_ACTION_METRICS_SQL, AGENT_ROSTER_STATS_SQL } from "@/services/admin/adminAgentSql";
import { getActionMetrics, getAgentRosterStats } from "@/services/admin/adminAgentsQueries";

/** The SELECT-list line that defines `column`, so a pin cannot be satisfied by another column. */
function definitionOf(sql: string, column: string): string {
  const line = sql.split("\n").find((l) => l.includes(`AS ${column}`));
  if (!line) throw new Error(`no column ${column}`);
  return line.trim();
}

beforeEach(() => {
  mockExecuteQuery.mockReset();
});

describe("AGENT_ACTION_METRICS_SQL", () => {
  it("counts only 402 and 409 as refusals", () => {
    expect(definitionOf(AGENT_ACTION_METRICS_SQL, "refusals")).toContain("status IN (402, 409)");
  });

  it("counts 4xx as a failure only when it is not a refusal", () => {
    const def = definitionOf(AGENT_ACTION_METRICS_SQL, "client_failures");
    expect(def).toContain("status >= 400 AND status < 500");
    expect(def).toContain("status NOT IN (402, 409)");
  });

  it("keeps 5xx as its own column and has no column that lumps every status >= 400", () => {
    expect(definitionOf(AGENT_ACTION_METRICS_SQL, "server_failures")).toContain("status >= 500");
    expect(AGENT_ACTION_METRICS_SQL).not.toMatch(/AS failures\b/);
  });
});

describe("AGENT_ROSTER_STATS_SQL", () => {
  it("counts an agent as active when it has a feed event in 24 h, not when it last signed in", () => {
    expect(AGENT_ROSTER_STATS_SQL).toContain("feed_events");
    expect(AGENT_ROSTER_STATS_SQL).toContain("COUNT(DISTINCT f.actor_id)");
    expect(AGENT_ROSTER_STATS_SQL).toContain("a.is_agent = true");
    expect(AGENT_ROSTER_STATS_SQL).not.toContain("last_login_at");
  });
});

describe("getActionMetrics", () => {
  it("separates expected refusals from failures for the agent debit route", async () => {
    mockExecuteQuery.mockResolvedValue({
      rows: [
        {
          path: "/api/economy/sync-debit",
          total: 100,
          successes: 40,
          client_failures: 2,
          refusals: 57,
          server_failures: 1,
          p50_ms: 30,
          p95_ms: 90,
          last_seen: new Date("2026-11-23T03:28:00Z"),
        },
      ],
    });

    const metrics = await getActionMetrics();
    const debit = metrics.find((m) => m.path === "/api/economy/sync-debit");

    expect(debit).toMatchObject({
      calls24h: 100,
      successes24h: 40,
      clientFailures24h: 2,
      refusals24h: 57,
      serverFailures24h: 1,
    });
    // every call lands in exactly one bucket
    expect(40 + 2 + 57 + 1).toBe(debit?.calls24h);
  });

  it("reports unknown, not zero, for every outcome when the query fails (a control)", async () => {
    mockExecuteQuery.mockRejectedValue(new Error("pool exhausted"));

    const [first] = await getActionMetrics();

    expect(first).toMatchObject({
      calls24h: null,
      successes24h: null,
      clientFailures24h: null,
      refusals24h: null,
      serverFailures24h: null,
    });
  });
});

describe("getAgentRosterStats", () => {
  it("reports the active count the statement returns", async () => {
    mockExecuteQuery.mockResolvedValue({ rows: [{ total_agents: 5531, active_agents: 41 }] });

    await expect(getAgentRosterStats()).resolves.toEqual({
      totalAgents: 5531,
      activeAgents24h: 41,
      live: true,
    });
  });
});
