import {
  getMcpNetworkSummary,
  clearMcpNetworkSummaryCache,
  type McpNetworkSummary,
} from "../mcpNetworkService";

const originalFetch = global.fetch;

const MOCK_SUMMARY: McpNetworkSummary = {
  live: true,
  generatedAt: "2026-05-27T16:00:00.000Z",
  windowMinutes: 60,
  verdict: "OK",
  totals: {
    calls: 142,
    success: 138,
    failures: 4,
    errorRate: 0.028,
    p50LatencyMs: 87,
    p95LatencyMs: 412,
    p99LatencyMs: 1180,
  },
  byTool: [
    { tool: "chat_with_planetary_agent", calls: 110, failures: 2, p95LatencyMs: 380 },
  ],
  byAgent: [
    { agentId: "socrates", calls: 42, modelTierMix: { free: 30, primary: 10, reflective: 2 } },
  ],
  byCaller: [
    { caller: "claude-desktop", calls: 65 },
  ],
  syntheticProbe: {
    verdict: "OK",
    lastCalledAt: "2026-05-27T15:55:00.000Z",
    lastSuccess: true,
    consecutiveFailures: 0,
  },
};

describe("mcpNetworkService", () => {
  beforeEach(() => {
    clearMcpNetworkSummaryCache();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("successfully parses 200 OK telemetry payloads from PA", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(MOCK_SUMMARY),
    });

    const summary = await getMcpNetworkSummary(60);

    expect(summary.live).toBe(true);
    expect(summary.verdict).toBe("OK");
    expect(summary.totals.calls).toBe(142);
    expect(summary.totals.p95LatencyMs).toBe(412);
    expect(summary.byTool[0].tool).toBe("chat_with_planetary_agent");
    expect(summary.byAgent[0].agentId).toBe("socrates");
    expect(summary.byCaller[0].caller).toBe("claude-desktop");
    expect(summary.syntheticProbe.verdict).toBe("OK");
  });

  it("gracefully falls back to live: false on non-200 responses", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    const summary = await getMcpNetworkSummary(60);

    expect(summary.live).toBe(false);
    expect(summary.verdict).toBe("UNKNOWN");
    expect(summary.totals.calls).toBe(0);
  });

  it("gracefully falls back to live: false on network timeout or fetch throw", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Timeout"));

    const summary = await getMcpNetworkSummary(60);

    expect(summary.live).toBe(false);
    expect(summary.verdict).toBe("UNKNOWN");
  });

  it("caches successful requests within the 30s TTL window", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(MOCK_SUMMARY),
    });
    global.fetch = fetchMock;

    // Call first time
    const summary1 = await getMcpNetworkSummary(60);
    expect(summary1.live).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Call second time immediately, should read from cache
    const summary2 = await getMcpNetworkSummary(60);
    expect(summary2.live).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1); // Call count should still be 1!
  });

  // The proxy can answer HTTP 200 while reporting its own failure, and
  // /admin/mcp renders straight out of this summary. Forcing `live: true`
  // over the body relabelled a known-degraded payload as live, and caching a
  // malformed body meant the page indexed into a missing `totals`.
  it("does not relabel an explicitly degraded upstream as live", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ...MOCK_SUMMARY, live: false }),
    });

    const summary = await getMcpNetworkSummary(60);

    expect(summary.live).toBe(false);
  });

  it("treats a 200 carrying a malformed body as not live", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({ success: false, message: "pa_unreachable" }),
    });

    const summary = await getMcpNetworkSummary(60);

    expect(summary.live).toBe(false);
    // The page dereferences these, so they must always be present.
    expect(summary.totals).toBeDefined();
    expect(summary.totals.calls).toBe(0);
    expect(Array.isArray(summary.byTool)).toBe(true);
    expect(Array.isArray(summary.byAgent)).toBe(true);
  });

  it("does not cache a degraded payload as the stale fallback", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: false }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(MOCK_SUMMARY),
      });
    global.fetch = fetchMock;

    const degraded = await getMcpNetworkSummary(60);
    expect(degraded.live).toBe(false);

    // A poisoned cache would short-circuit this second call.
    const recovered = await getMcpNetworkSummary(60);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(recovered.live).toBe(true);
    expect(recovered.totals.calls).toBe(142);
  });
});
