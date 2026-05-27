/**
 * Tests for `recordInvocation` — focuses on the latency-computation
 * contract (positive integer ms, floored at 1, rounded from fractional
 * performance.now() output). The DB module is mocked so no Postgres is
 * required.
 */

const mockExecuteQuery = jest.fn().mockResolvedValue({ rows: [] });

jest.mock("@/lib/database/connection", () => ({
  executeQuery: mockExecuteQuery,
}));

// Make sure the module sees DATABASE_URL so it doesn't no-op.
const originalDbUrl = process.env.DATABASE_URL;
beforeAll(() => {
  process.env.DATABASE_URL = "postgresql://test/test";
});
afterAll(() => {
  if (originalDbUrl === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = originalDbUrl;
});

import { recordInvocation } from "@/lib/mcp/invocationLog";

describe("recordInvocation latency_ms contract", () => {
  beforeEach(() => {
    mockExecuteQuery.mockClear();
  });

  it("writes a positive integer latency_ms even for sub-ms calls", async () => {
    // performance.now() reading taken "now" — latency is essentially zero.
    const startedAt = performance.now();
    await recordInvocation(
      {
        toolName: "test_tool",
        arguments: {},
        caller: "test",
        userId: null,
        apiKeyId: null,
      },
      { startedAt, calledAtIso: new Date().toISOString() },
      { success: true, errorMessage: null, resultSummary: {} },
    );
    expect(mockExecuteQuery).toHaveBeenCalledTimes(1);
    const params = mockExecuteQuery.mock.calls[0][1] as unknown[];
    const latencyMs = params[3] as number;
    expect(Number.isInteger(latencyMs)).toBe(true);
    expect(latencyMs).toBeGreaterThanOrEqual(1);
  });

  it("rounds fractional perf-now deltas to integer ms", async () => {
    // Past perf-mark so the delta is comfortably > 1ms after rounding.
    const startedAt = performance.now() - 12.7;
    await recordInvocation(
      {
        toolName: "test_tool",
        arguments: {},
        caller: "test",
        userId: null,
        apiKeyId: null,
      },
      { startedAt, calledAtIso: new Date().toISOString() },
      { success: true, errorMessage: null, resultSummary: {} },
    );
    const params = mockExecuteQuery.mock.calls[0][1] as unknown[];
    const latencyMs = params[3] as number;
    expect(Number.isInteger(latencyMs)).toBe(true);
    expect(latencyMs).toBeGreaterThanOrEqual(12);
  });

  it("uses the provided calledAtIso for the called_at column", async () => {
    const calledAtIso = "2026-05-27T12:34:56.789Z";
    await recordInvocation(
      {
        toolName: "test_tool",
        arguments: {},
        caller: "test",
        userId: null,
        apiKeyId: null,
      },
      { startedAt: performance.now(), calledAtIso },
      { success: true, errorMessage: null, resultSummary: {} },
    );
    const params = mockExecuteQuery.mock.calls[0][1] as unknown[];
    expect(params[1]).toBe(calledAtIso);
  });
});
