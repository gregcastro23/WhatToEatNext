/**
 * Tests for AdminAgentsService
 *
 * @file src/services/admin/__tests__/adminAgentsService.test.ts
 */

jest.mock("@/lib/database/connection", () => ({
  executeQuery: jest.fn(),
}));

jest.mock("@/services/admin/asolHealthService", () => ({
  getAsolHealthOverview: jest.fn(),
}));

jest.mock("@/services/asolContractProbeService", () => ({
  asolContractProbe: {
    executeProbe: jest.fn(),
  },
}));

jest.mock("@/services/cronHeartbeatService", () => {
  const actual = jest.requireActual("@/services/cronHeartbeatService");
  return {
    ...actual,
    getCronHeartbeats: jest.fn(),
  };
});

import { executeQuery } from "@/lib/database/connection";
import { getAsolHealthOverview } from "@/services/admin/asolHealthService";
import { asolContractProbe } from "@/services/asolContractProbeService";
import { getCronHeartbeats } from "@/services/cronHeartbeatService";
import {
  getAdminAgentsOverview,
} from "@/services/admin/adminAgentsService";

const mockExecuteQuery = jest.mocked(executeQuery);
const mockGetAsolHealthOverview = jest.mocked(getAsolHealthOverview);
const mockExecuteProbe = jest.mocked(asolContractProbe.executeProbe);
const mockGetCronHeartbeats = jest.mocked(getCronHeartbeats);

describe("adminAgentsService", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  function setupDefaultMocks() {
    mockExecuteProbe.mockResolvedValue({
      success: true,
      timestamp: "2026-10-03T12:00:00Z",
      durationMs: 45,
      checks: {
        agentRosterAuth: { passed: true, status: 200 },
        syncStatusAuth: { passed: true, status: 200 },
        vesselAuth: { passed: true, status: 200 },
        checkSharedAuth: { passed: true, status: 200 },
        negativeControls: {
          passed: true,
          allRejectedWith401: true,
          statuses: {
            "agent-roster": 401,
            "sync-status": 401,
            vessel: 401,
            "check-shared": 401,
          },
        },
      },
    });

    mockGetAsolHealthOverview.mockResolvedValue({
      generatedAt: "2026-10-03T12:00:00Z",
      totalReceived: 50,
      totalProcessed: 48,
      totalInFlight: 1,
      totalLiveInFlight: 1,
      totalStaleLocks: 0,
      totalFailed: 1,
      totalDuplicates: 2,
      overallP95LatencyMs: 65,
      sources: [],
      recentEvents: [],
      feedStatus: {
        lastEmit: null,
        signatureMode: "shadow",
        signatureModeInfo: { mode: "shadow", raw: "shadow", valid: true },
        internalSecretConfigured: true,
        syncSecretConfigured: true,
        hookSecretConfigured: true,
      },
    });

    mockGetCronHeartbeats.mockResolvedValue({
      entries: [
        {
          name: "agents-daily-yield",
          schedule: "30 0 * * *",
          expectedIntervalMinutes: 1440,
          lastRun: "2026-10-03T00:30:00Z",
          lastStatus: "success",
          state: "ok",
        },
        {
          name: "prewarm-agent-recipes",
          schedule: "0 * * * *",
          expectedIntervalMinutes: 60,
          lastRun: "2026-10-03T08:00:00Z",
          lastStatus: "success",
          state: "ok",
        },
      ],
      live: true,
    });

    mockExecuteQuery.mockImplementation(async (sql: string | { text: string }) => {
      const q = typeof sql === "string" ? sql : sql.text;

      if (q.includes("FROM users") && q.includes("is_agent = true")) {
        return {
          command: "SELECT",
          rowCount: 1,
          oid: 0,
          fields: [],
          rows: [{ total_agents: 35, active_agents: 10 }],
        };
      }

      if (q.includes("path = '/api/economy/sync-credit'")) {
        return {
          command: "SELECT",
          rowCount: 1,
          oid: 0,
          fields: [],
          rows: [
            {
              calls_24h: 20,
              prior_calls_7d: 140,
              credits_24h: 18,
              prior_credits_7d: 130,
              last_credit_age_ms: 1200000,
            },
          ],
        };
      }

      if (q.includes("path = '/api/economy/sync-debit'")) {
        return {
          command: "SELECT",
          rowCount: 1,
          oid: 0,
          fields: [],
          rows: [
            {
              calls_24h: 15,
              traffic_24h: 15,
              debits_24h: 14,
              last_debit_age_ms: 800000,
            },
          ],
        };
      }

      if (q.includes("GROUP BY path") && q.includes("request_log_entries")) {
        return {
          command: "SELECT",
          rowCount: 2,
          oid: 0,
          fields: [],
          rows: [
            {
              path: "/api/economy/sync-credit",
              total: 20,
              successes: 20,
              failures: 0,
              server_failures: 0,
              p50_ms: 30,
              p95_ms: 75,
              last_seen: new Date("2026-10-03T11:45:00Z"),
            },
            {
              path: "/api/generate-cosmic-recipe",
              total: 10,
              successes: 9,
              failures: 1,
              server_failures: 1,
              p50_ms: 450,
              p95_ms: 1200,
              last_seen: new Date("2026-10-03T11:30:00Z"),
            },
          ],
        };
      }

      if (q.includes("cosmic_recipe_refund")) {
        return {
          command: "SELECT",
          rowCount: 1,
          oid: 0,
          fields: [],
          rows: [
            {
              refunds: 1,
              attempts: 10,
              final_failures: 1,
            },
          ],
        };
      }

      return { command: "SELECT", rowCount: 0, oid: 0, fields: [], rows: [] };
    });
  }

  it("aggregates live connectivity, contracts, actions, and roster correctly", async () => {
    setupDefaultMocks();

    const mockFetch: typeof fetch = async (url: RequestInfo | URL) => {
      const urlStr = String(url);
      if (urlStr.includes("/health")) {
        return new Response(JSON.stringify({ status: "ok" }), { status: 200 });
      }
      return new Response("<html>UI</html>", { status: 200 });
    };

    const overview = await getAdminAgentsOverview({
      fetchFn: mockFetch,
    });

    expect(overview.live).toBe(true);
    expect(overview.roster.totalAgents).toBe(35);
    expect(overview.roster.activeAgents24h).toBe(10);

    expect(overview.connectivity.services).toHaveLength(2);
    expect(overview.connectivity.services[0]?.reachable).toBe(true);
    expect(overview.connectivity.services[1]?.reachable).toBe(true);

    expect(overview.actions.creditPath.verdict).toBe("OK");
    expect(overview.actions.debitPath.verdict).toBe("OK");
    expect(overview.actions.recipePipeline.attempts).toBe(10);
    expect(overview.actions.recipePipeline.refunds).toBe(1);

    expect(overview.actions.cronHeartbeats).toHaveLength(2);
    expect(overview.actions.cronHeartbeats[0]?.state).toBe("ok");
    expect(mockExecuteProbe).toHaveBeenCalledTimes(1);
  });

  it("handles degraded state: ASOL service unreachable", async () => {
    setupDefaultMocks();

    const mockFetch: typeof fetch = async () => {
      throw new Error("Connection refused (ECONNREFUSED)");
    };

    const overview = await getAdminAgentsOverview({
      fetchFn: mockFetch,
    });

    expect(overview.connectivity.services[0]?.reachable).toBe(false);
    expect(overview.connectivity.services[0]?.latencyMs).toBeNull();
    expect(overview.connectivity.services[0]?.error).toContain("Connection refused");
  });

  it("handles degraded state: database failure / no rows", async () => {
    setupDefaultMocks();
    mockGetAsolHealthOverview.mockResolvedValue({
      generatedAt: "2026-10-03T12:00:00Z",
      totalReceived: 0,
      totalProcessed: 0,
      totalInFlight: 0,
      totalLiveInFlight: 0,
      totalStaleLocks: 0,
      totalFailed: 0,
      totalDuplicates: 0,
      overallP95LatencyMs: null,
      sources: [],
      recentEvents: [],
      feedStatus: {
        lastEmit: null,
        signatureMode: "off",
        signatureModeInfo: { mode: "off", raw: "off", valid: true },
        internalSecretConfigured: false,
        syncSecretConfigured: false,
        hookSecretConfigured: false,
      },
    });

    mockGetCronHeartbeats.mockResolvedValue({
      entries: [],
      live: false,
    });

    mockExecuteQuery.mockRejectedValue(new Error("Database offline"));

    const mockFetch: typeof fetch = async () => {
      return new Response(JSON.stringify({ status: "ok" }), { status: 200 });
    };

    const overview = await getAdminAgentsOverview({
      fetchFn: mockFetch,
    });

    expect(overview.live).toBe(false);
    expect(overview.roster.live).toBe(false);
    expect(overview.roster.totalAgents).toBe(0);
    expect(overview.actions.creditPath.live).toBe(false);
    expect(overview.actions.creditPath.verdict).toBe("UNKNOWN");
    expect(overview.actions.debitPath.live).toBe(false);
    expect(overview.actions.debitPath.verdict).toBe("UNKNOWN");
    expect(overview.actions.recipePipeline.live).toBe(false);

    // Fallback crons match vercel.json exactly
    const yieldCron = overview.actions.cronHeartbeats.find((c) => c.name === "agents-daily-yield");
    const prewarmCron = overview.actions.cronHeartbeats.find((c) => c.name === "prewarm-agent-recipes");
    expect(yieldCron?.schedule).toBe("30 0 * * *");
    expect(yieldCron?.expectedIntervalMinutes).toBe(1440);
    expect(prewarmCron?.schedule).toBe("0 * * * *");
    expect(prewarmCron?.expectedIntervalMinutes).toBe(60);
  });

  it("handles degraded state: cron heartbeat stale or failing", async () => {
    setupDefaultMocks();

    mockGetCronHeartbeats.mockResolvedValue({
      entries: [
        {
          name: "agents-daily-yield",
          schedule: "30 0 * * *",
          expectedIntervalMinutes: 1440,
          lastRun: "2026-10-01T00:30:00Z",
          lastStatus: "failure",
          state: "failing",
        },
        {
          name: "prewarm-agent-recipes",
          schedule: "0 * * * *",
          expectedIntervalMinutes: 60,
          lastRun: null,
          lastStatus: null,
          state: "never",
        },
      ],
      live: true,
    });

    const mockFetch: typeof fetch = async () => {
      return new Response(JSON.stringify({ status: "ok" }), { status: 200 });
    };

    const overview = await getAdminAgentsOverview({
      fetchFn: mockFetch,
    });

    const yieldCron = overview.actions.cronHeartbeats.find((c) => c.name === "agents-daily-yield");
    const prewarmCron = overview.actions.cronHeartbeats.find((c) => c.name === "prewarm-agent-recipes");

    expect(yieldCron?.state).toBe("failing");
    expect(prewarmCron?.state).toBe("never");
  });
});
