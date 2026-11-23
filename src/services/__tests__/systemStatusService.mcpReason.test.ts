/**
 * @jest-environment node
 *
 * The Control Plane's MCP flow said "PA telemetry unavailable" with no reason, while
 * `/admin/mcp` (through the proxy) showed WTEN-local data as healthy. `probeMcp` calls
 * Planetary Agents directly on the server, so when that read fails the summary now
 * names the step that failed. `buildMcpSummary`'s own wording is covered in
 * systemStatusService.test.ts; this proves `probeMcp` actually hands the reason on.
 *
 * @file src/services/__tests__/systemStatusService.mcpReason.test.ts
 */
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

type Query = (...args: unknown[]) => Promise<{ rows: Array<Record<string, unknown>> }>;

// `mock`-prefixed so jest lets the factories close over them; read lazily at call time.
const mockExecuteQuery = jest.fn<Query>();
const mockGetSummary = jest.fn<() => Promise<unknown>>();

jest.mock("@/lib/database/connection", () => ({
  executeQuery: (...args: unknown[]) => mockExecuteQuery(...args),
  checkDatabaseHealth: jest.fn(),
}));
jest.mock("@/services/mcpNetworkService", () => ({
  getMcpNetworkSummary: () => mockGetSummary(),
}));
jest.mock("@/lib/logger", () => ({
  _logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));

import { probeMcp } from "@/services/systemStatusService";

const UNREAD = {
  live: false,
  generatedAt: "2026-11-23T03:00:00.000Z",
  windowMinutes: 60,
  verdict: "UNKNOWN",
  totals: { calls: 0, success: 0, failures: 0, errorRate: 0, p50LatencyMs: null, p95LatencyMs: null, p99LatencyMs: null },
  byTool: [],
  byAgent: [],
  byCaller: [],
  syntheticProbe: { verdict: "UNKNOWN", lastCalledAt: null, lastSuccess: null, consecutiveFailures: 0 },
};

beforeEach(() => {
  mockExecuteQuery.mockReset();
  mockGetSummary.mockReset();
  // an idle WTEN MCP: one row, no calls in the last hour
  mockExecuteQuery.mockResolvedValue({ rows: [{ calls: 0, failures: 0, p95: 0, callers: 0 }] });
});

describe("probeMcp: why PA telemetry was unavailable", () => {
  it("puts the reason in the summary when the direct PA read failed", async () => {
    mockGetSummary.mockResolvedValue({ ...UNREAD, fallbackReason: "http_401" });

    const flow = await probeMcp([]);

    expect(flow.summary).toContain("PA telemetry unavailable (http_401)");
  });

  it("says nothing about a reason when none was recorded (a control: unchanged wording)", async () => {
    mockGetSummary.mockResolvedValue(UNREAD);

    const flow = await probeMcp([]);

    expect(flow.summary).toContain("PA telemetry unavailable");
    expect(flow.summary).not.toContain("PA telemetry unavailable (");
  });

  it("does not report PA as unavailable when it was read (a control)", async () => {
    mockGetSummary.mockResolvedValue({ ...UNREAD, live: true, verdict: "OK", fallbackReason: "http_401" });

    const flow = await probeMcp([]);

    expect(flow.summary).not.toContain("PA telemetry unavailable");
  });
});
