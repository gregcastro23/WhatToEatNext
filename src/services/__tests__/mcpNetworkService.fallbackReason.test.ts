/**
 * @jest-environment node
 *
 * "PA telemetry unavailable" had no reason attached anywhere: a failed read was a bare
 * `live: false`. The summary now carries `fallbackReason` for the step that failed (and
 * passes along the proxy's `source` / `fallbackReason` when it set them), and a failed
 * read is logged once as an error.
 *
 * @file src/services/__tests__/mcpNetworkService.fallbackReason.test.ts
 */
import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";

const mockLoggerError = jest.fn<(...args: unknown[]) => void>();

jest.mock("@/lib/logger", () => ({
  _logger: {
    error: (...args: unknown[]) => mockLoggerError(...args),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

import { resetMcpFallbackLog } from "@/services/mcpFallback";
import { clearMcpNetworkSummaryCache, getMcpNetworkSummary } from "@/services/mcpNetworkService";

const LIVE_BODY = {
  live: true,
  generatedAt: "2026-11-23T03:00:00.000Z",
  windowMinutes: 60,
  verdict: "OK",
  totals: { calls: 12, success: 12, failures: 0, errorRate: 0, p50LatencyMs: 40, p95LatencyMs: 90, p99LatencyMs: 120 },
  byTool: [],
  byAgent: [],
  byCaller: [],
  syntheticProbe: { verdict: "OK", lastCalledAt: null, lastSuccess: null, consecutiveFailures: 0 },
};

const originalFetch = global.fetch;
const originalSecret = process.env.INTERNAL_API_SECRET;

type FetchFn = (input: URL | RequestInfo, init?: RequestInit) => Promise<Response>;

/** Install a typed fetch fake; `typeof fetch` also carries `preconnect`, which a bare mock lacks. */
const installFetch = (mock: jest.Mock<FetchFn>): void => {
  global.fetch = Object.assign(mock, { preconnect: () => undefined });
};

/** Answer every call with a real Response of this status and JSON body. */
const respondWith = (response: { ok: boolean; status?: number; body?: unknown }): void => {
  installFetch(
    jest.fn<FetchFn>().mockResolvedValue(
      new Response(JSON.stringify(response.body ?? {}), { status: response.status ?? (response.ok ? 200 : 500) }),
    ),
  );
};

beforeEach(() => {
  clearMcpNetworkSummaryCache();
  resetMcpFallbackLog();
  mockLoggerError.mockReset();
  process.env.INTERNAL_API_SECRET = "test-secret";
});

afterEach(() => {
  global.fetch = originalFetch;
  if (originalSecret === undefined) delete process.env.INTERNAL_API_SECRET;
  else process.env.INTERNAL_API_SECRET = originalSecret;
});

describe("getMcpNetworkSummary: why a read failed", () => {
  it("records the HTTP status when PA answers an error", async () => {
    respondWith({ ok: false, status: 401 });

    const summary = await getMcpNetworkSummary(60);

    expect(summary).toMatchObject({ live: false, fallbackReason: "http_401" });
  });

  it("records a timeout, and a network failure, as different reasons", async () => {
    installFetch(jest.fn<FetchFn>().mockRejectedValue(new DOMException("timed out", "TimeoutError")));
    expect((await getMcpNetworkSummary(60)).fallbackReason).toBe("timeout");

    clearMcpNetworkSummaryCache();
    resetMcpFallbackLog();
    installFetch(jest.fn<FetchFn>().mockRejectedValue(new TypeError("fetch failed")));
    expect((await getMcpNetworkSummary(60)).fallbackReason).toBe("unreachable");
  });

  it("records a 200 whose body is not a summary as malformed", async () => {
    respondWith({ ok: true, body: { success: false, message: "pa_unreachable" } });

    expect(await getMcpNetworkSummary(60)).toMatchObject({ live: false, fallbackReason: "malformed_response" });
  });

  it("records an upstream that reports itself not live", async () => {
    respondWith({ ok: true, body: { ...LIVE_BODY, live: false } });

    expect(await getMcpNetworkSummary(60)).toMatchObject({ live: false, fallbackReason: "pa_not_live" });
  });

  it("logs a failed read once, as an error, with the reason", async () => {
    respondWith({ ok: false, status: 503 });

    await getMcpNetworkSummary(60);
    clearMcpNetworkSummaryCache();
    await getMcpNetworkSummary(60);

    expect(mockLoggerError).toHaveBeenCalledTimes(1);
    expect(String(mockLoggerError.mock.calls[0]?.[0])).toContain("http_503");
  });
});

describe("getMcpNetworkSummary: provenance passed through", () => {
  it("keeps the proxy's source and reason on a payload that is live (WTEN's own tables)", async () => {
    respondWith({ ok: true, body: { ...LIVE_BODY, source: "wten-local", fallbackReason: "timeout" } });

    const summary = await getMcpNetworkSummary(60);

    expect(summary).toMatchObject({ live: true, source: "wten-local", fallbackReason: "timeout" });
  });

  it("carries no fallback reason on a healthy Planetary Agents payload (a control)", async () => {
    respondWith({ ok: true, body: { ...LIVE_BODY, source: "pa" } });

    const summary = await getMcpNetworkSummary(60);

    expect(summary.source).toBe("pa");
    expect(summary.fallbackReason).toBeUndefined();
    expect(mockLoggerError).not.toHaveBeenCalled();
  });
});
