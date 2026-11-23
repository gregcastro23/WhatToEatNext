/**
 * @jest-environment node
 *
 * `/api/admin/mcp-summary` answers from Planetary Agents when it can, and from WTEN's
 * own tables when it cannot. It used to return the local answer as `live: true` with
 * nothing saying so, and `/admin/mcp` printed "Planetary Agents status healthy" over
 * it. Every response now names its `source`, and a local one names why PA was not used.
 *
 * @file src/app/api/admin/mcp-summary/__tests__/route.test.ts
 */
import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { NextRequest } from "next/server";

type Query = (...args: unknown[]) => Promise<{ rows: Array<Record<string, unknown>> }>;

// `mock`-prefixed so jest lets the factories close over them; read lazily at call time.
const mockExecuteQuery = jest.fn<Query>();
const mockLoggerError = jest.fn<(...args: unknown[]) => void>();

jest.mock("@/lib/auth/validateRequest", () => ({
  validateAdminRequest: () => Promise.resolve({ user: { id: "admin" } }),
}));
jest.mock("@/lib/database", () => ({
  executeQuery: (...args: unknown[]) => mockExecuteQuery(...args),
}));
jest.mock("@/lib/serviceUrls", () => ({ getServiceUrl: () => "https://pa.test" }));
jest.mock("@/lib/logger", () => ({
  _logger: {
    error: (...args: unknown[]) => mockLoggerError(...args),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

import { GET } from "@/app/api/admin/mcp-summary/route";
import { resetMcpFallbackLog } from "@/services/mcpFallback";

const PA_WITH_CALLS = {
  live: true,
  generatedAt: "2026-11-23T03:00:00.000Z",
  windowMinutes: 60,
  verdict: "OK",
  totals: { calls: 142, success: 138, failures: 4, errorRate: 0.028, p50LatencyMs: 87, p95LatencyMs: 412, p99LatencyMs: 1180 },
  byTool: [],
  byAgent: [],
  byCaller: [],
  syntheticProbe: { verdict: "OK", lastCalledAt: null, lastSuccess: null, consecutiveFailures: 0 },
};

const originalFetch = global.fetch;
const originalSecret = process.env.INTERNAL_API_SECRET;
const mockFetch = jest.fn<(input: URL | RequestInfo, init?: RequestInit) => Promise<Response>>();

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

const call = async (): Promise<Record<string, unknown>> =>
  (await GET(new NextRequest("http://localhost/api/admin/mcp-summary?windowMinutes=60"))).json();

beforeEach(() => {
  mockFetch.mockReset();
  mockExecuteQuery.mockReset();
  mockExecuteQuery.mockResolvedValue({ rows: [] });
  mockLoggerError.mockReset();
  resetMcpFallbackLog();
  process.env.INTERNAL_API_SECRET = "test-secret";
  // `typeof fetch` also carries `preconnect`, which a bare mock does not have.
  global.fetch = Object.assign(mockFetch, { preconnect: () => undefined });
});

afterEach(() => {
  global.fetch = originalFetch;
  if (originalSecret === undefined) delete process.env.INTERNAL_API_SECRET;
  else process.env.INTERNAL_API_SECRET = originalSecret;
});

describe("GET /api/admin/mcp-summary provenance", () => {
  it("labels Planetary Agents' own answer as source pa, with no fallback reason", async () => {
    mockFetch.mockResolvedValue(json(PA_WITH_CALLS));

    const body = await call();

    expect(body.source).toBe("pa");
    expect(body.fallbackReason).toBeUndefined();
    expect(body.totals).toMatchObject({ calls: 142 });
    expect(mockExecuteQuery).not.toHaveBeenCalled();
  });

  it.each([
    ["answers HTTP 401", () => mockFetch.mockResolvedValue(json({}, 401)), "http_401"],
    ["answers HTTP 503", () => mockFetch.mockResolvedValue(json({}, 503)), "http_503"],
    ["times out", () => mockFetch.mockRejectedValue(new DOMException("timed out", "TimeoutError")), "timeout"],
    ["cannot be reached", () => mockFetch.mockRejectedValue(new TypeError("fetch failed")), "unreachable"],
    ["answers a body that is not JSON", () => mockFetch.mockResolvedValue(new Response("<html>", { status: 200 })), "malformed_response"],
    ["reports itself not live", () => mockFetch.mockResolvedValue(json({ ...PA_WITH_CALLS, live: false })), "pa_not_live"],
    [
      "reports no calls in the window",
      () => mockFetch.mockResolvedValue(json({ ...PA_WITH_CALLS, totals: { ...PA_WITH_CALLS.totals, calls: 0 } })),
      "pa_reported_no_calls",
    ],
  ])("labels WTEN's own tables as source wten-local, with the reason, when PA %s", async (_case, arrange, reason) => {
    arrange();

    const body = await call();

    expect(body.source).toBe("wten-local");
    expect(body.fallbackReason).toBe(reason);
    expect(mockExecuteQuery).toHaveBeenCalled();
  });

  it("names a missing INTERNAL_API_SECRET, and does not call PA at all", async () => {
    delete process.env.INTERNAL_API_SECRET;

    const body = await call();

    expect(body).toMatchObject({ source: "wten-local", fallbackReason: "no_internal_secret" });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("logs a failed PA read once, as an error, and never logs an idle PA", async () => {
    mockFetch.mockResolvedValue(json({}, 401));
    await call();
    await call();
    expect(mockLoggerError).toHaveBeenCalledTimes(1);
    expect(String(mockLoggerError.mock.calls[0]?.[0])).toContain("http_401");

    mockLoggerError.mockReset();
    resetMcpFallbackLog();
    mockFetch.mockResolvedValue(json({ ...PA_WITH_CALLS, totals: { ...PA_WITH_CALLS.totals, calls: 0 } }));
    await call();
    expect(mockLoggerError).not.toHaveBeenCalled();
  });
});
