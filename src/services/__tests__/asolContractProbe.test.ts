/**
 * Unit tests for AsolContractProbeService (B5 receiver-probe contract)
 *
 * Verifies:
 *   - Named WTEN receiver vantage, destination, timeout, and 3-valued verdict
 *   - Unexpected vessel 404 rejection (generic 404 is not a healthy contract)
 *   - Destination safety (rejects arbitrary origins, preventing secret leakage)
 *   - Exclusion of synthetic mutations (no sync-credit, sync-debit, or transmute calls)
 *   - Positive auth checks, schema validation, and negative control assertions
 */

import {
  AsolContractProbeService,
  asolContractProbe,
} from "../asolContractProbeService";

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("AsolContractProbeService (B5)", () => {
  it("keeps unreadable HTTP 200 responses distinct from unreachable transport", async () => {
    const fetchFn = jest.fn().mockImplementation(async () => new Response("<html>not json</html>"));
    const report = await new AsolContractProbeService().executeProbe({ fetchFn });
    expect(report.verdict).toBe("degraded");
    expect(report.checks.vesselAuth).toMatchObject({ passed: false, status: 200 });
  });
  it.each([
    "https://another-project.vercel.app",
    "http://trusted-project.vercel.app",
    "https://username:password@trusted-project.vercel.app",
    "http://127.0.0.1:9999",
  ])(
    "rejects an unconfigured destination %s without sending credentials",
    async (baseUrl) => {
      const service = new AsolContractProbeService(
        "https://trusted-project.vercel.app",
      );
      const fetchFn = jest.fn();
      const report = await service.executeProbe({
        baseUrl,
        fetchFn,
        syncSecret: "secret",
      });
      expect(fetchFn).not.toHaveBeenCalled();
      expect(report.verdict).toBe("unreachable");
      expect(JSON.stringify(report)).not.toContain("password");
    },
  );

  it("refuses redirects on every authenticated and negative-control request", async () => {
    const fetchFn = jest.fn().mockResolvedValue(jsonResponse({}, 302));
    await new AsolContractProbeService().executeProbe({ fetchFn });
    expect(fetchFn).toHaveBeenCalledTimes(8);
    for (const [, init] of fetchFn.mock.calls)
      expect(init.redirect).toBe("error");
  });

  it.each([
    { ok: true },
    { ok: false, idempotencyKey: "requested", applied: false },
    { ok: true, idempotencyKey: "different", applied: false },
  ])(
    "rejects an incomplete or unrelated sync-status success %j",
    async (body) => {
      const result = await new AsolContractProbeService().probeSyncStatus(
        "secret",
        "requested",
        {
          fetchFn: jest.fn().mockResolvedValue(jsonResponse(body)),
        },
      );
      expect(result.passed).toBe(false);
    },
  );

  it.each([
    { success: true },
    { success: false, balances: {} },
    { success: true, balances: { essence: 1 } },
  ])("rejects an incomplete vessel success %j", async (body) => {
    const result = await new AsolContractProbeService().probeVessel(
      "secret",
      "probe@example.com",
      {
        fetchFn: jest.fn().mockResolvedValue(jsonResponse(body)),
      },
    );
    expect(result.passed).toBe(false);
  });
  it("exports a singleton instance with pinned vantage and default timeout", () => {
    expect(asolContractProbe).toBeInstanceOf(AsolContractProbeService);
    expect(AsolContractProbeService.VANTAGE).toBe("wten-internal-receiver");
    expect(AsolContractProbeService.DEFAULT_TIMEOUT_MS).toBe(3000);
  });

  describe("destination validation and secret protection", () => {
    it("allows only the configured origin, including a configured loopback", () => {
      const service = new AsolContractProbeService("http://localhost:3000");
      expect(service.resolveDestination()).toBe("http://localhost:3000");
      expect(() =>
        service.resolveDestination({ baseUrl: "http://127.0.0.1:3000" }),
      ).toThrow("Untrusted");
    });

    it("rejects untrusted arbitrary origins and never transmits secrets", async () => {
      const service = new AsolContractProbeService("http://localhost:3000");
      const mockFetch: typeof fetch = jest.fn();

      const report = await service.executeProbe({
        baseUrl: "https://evil-attacker.example.com",
        internalSecret: "super-secret-internal",
        syncSecret: "super-secret-sync",
        fetchFn: mockFetch,
      });

      expect(report.success).toBe(false);
      expect(report.verdict).toBe("unreachable");
      expect(report.destination).toBe("untrusted");
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("probeAgentRoster", () => {
    it("returns passed=true for valid 200 responses", async () => {
      const mockFetch: typeof fetch = jest
        .fn()
        .mockResolvedValue(
          jsonResponse(
            {
              schemaVersion: 1,
              count: 1,
              agents: [
                { id: "agent-1", email: "mercury@agentic.alchm.kitchen" },
              ],
            },
            200,
          ),
        );

      const service = new AsolContractProbeService();
      const res = await service.probeAgentRoster("valid-secret", {
        fetchFn: mockFetch,
      });

      expect(res.passed).toBe(true);
      expect(res.status).toBe(200);
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/internal/agent-roster",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer valid-secret",
          }),
        }),
      );
    });

    it("returns passed=false for 401 unauthorized", async () => {
      const mockFetch: typeof fetch = jest
        .fn()
        .mockResolvedValue(jsonResponse({ error: "Unauthorized" }, 401));

      const service = new AsolContractProbeService();
      const res = await service.probeAgentRoster("bad-secret", {
        fetchFn: mockFetch,
      });

      expect(res.passed).toBe(false);
      expect(res.status).toBe(401);
    });

    it("returns passed=false for malformed payload", async () => {
      const mockFetch: typeof fetch = jest
        .fn()
        .mockResolvedValue(jsonResponse({ invalid: "payload" }, 200));

      const service = new AsolContractProbeService();
      const res = await service.probeAgentRoster("valid-secret", {
        fetchFn: mockFetch,
      });

      expect(res.passed).toBe(false);
      expect(res.message).toContain("Invalid roster schema");
    });
  });

  describe("probeSyncStatus", () => {
    it("returns passed=true for valid 200 responses", async () => {
      const mockFetch: typeof fetch = jest
        .fn()
        .mockResolvedValue(
          jsonResponse(
            { ok: true, idempotencyKey: "test-key", applied: false },
            200,
          ),
        );

      const service = new AsolContractProbeService();
      const res = await service.probeSyncStatus("sync-secret", "test-key", {
        fetchFn: mockFetch,
      });

      expect(res.passed).toBe(true);
      expect(res.status).toBe(200);
    });

    it("returns passed=false for 401 responses", async () => {
      const mockFetch: typeof fetch = jest
        .fn()
        .mockResolvedValue(
          jsonResponse({ ok: false, error: "Unauthorized" }, 401),
        );

      const service = new AsolContractProbeService();
      const res = await service.probeSyncStatus("bad-secret", "test-key", {
        fetchFn: mockFetch,
      });

      expect(res.passed).toBe(false);
      expect(res.status).toBe(401);
    });
  });

  describe("probeVessel", () => {
    it("returns passed=true for 200 with valid vessel ledger payload", async () => {
      const mockFetch: typeof fetch = jest
        .fn()
        .mockResolvedValue(
          jsonResponse(
            {
              success: true,
              version: 1,
              balances: { spirit: 0, essence: 10, matter: 0, substance: 0 },
            },
            200,
          ),
        );

      const service = new AsolContractProbeService();
      const res = await service.probeVessel(
        "sync-secret",
        "user@alchm.kitchen",
        { fetchFn: mockFetch },
      );

      expect(res.passed).toBe(true);
      expect(res.status).toBe(200);
    });

    it("keeps the vessel unverified when an authenticated probe user is missing", async () => {
      const mockFetch: typeof fetch = jest
        .fn()
        .mockResolvedValue(
          jsonResponse({ success: false, error: "user_not_found" }, 404),
        );

      const service = new AsolContractProbeService();
      const res = await service.probeVessel(
        "sync-secret",
        "missing@alchm.kitchen",
        { fetchFn: mockFetch },
      );

      expect(res.passed).toBe(false);
      expect(res.status).toBe(404);
      expect(res.message).toContain("vessel ledger unverified");
    });

    it("returns passed=false for unexpected 404 (e.g. route missing or HTML)", async () => {
      const mockFetch: typeof fetch = jest
        .fn()
        .mockResolvedValue(
          new Response("<html>404 Not Found</html>", { status: 404 }),
        );

      const service = new AsolContractProbeService();
      const res = await service.probeVessel(
        "sync-secret",
        "probe@alchm.kitchen",
        { fetchFn: mockFetch },
      );

      expect(res.passed).toBe(false);
      expect(res.status).toBe(404);
      expect(res.message).toContain(
        "Unexpected vessel 404: route missing or invalid error payload",
      );
    });

    it("returns passed=false for 401 (bad sync secret)", async () => {
      const mockFetch: typeof fetch = jest
        .fn()
        .mockResolvedValue(
          jsonResponse(
            { success: false, error: "Authentication required" },
            401,
          ),
        );

      const service = new AsolContractProbeService();
      const res = await service.probeVessel(
        "bad-secret",
        "user@alchm.kitchen",
        { fetchFn: mockFetch },
      );

      expect(res.passed).toBe(false);
      expect(res.status).toBe(401);
    });
  });

  describe("probeCheckShared", () => {
    it("returns passed=true for valid 200 responses", async () => {
      const mockFetch: typeof fetch = jest
        .fn()
        .mockResolvedValue(
          jsonResponse(
            { success: true, sharedEmails: ["user@alchm.kitchen"] },
            200,
          ),
        );

      const service = new AsolContractProbeService();
      const res = await service.probeCheckShared(
        "sync-secret",
        ["user@alchm.kitchen"],
        { fetchFn: mockFetch },
      );

      expect(res.passed).toBe(true);
      expect(res.status).toBe(200);
    });

    it("returns passed=false for 401 responses", async () => {
      const mockFetch: typeof fetch = jest
        .fn()
        .mockResolvedValue(
          jsonResponse({ success: false, error: "Unauthorized" }, 401),
        );

      const service = new AsolContractProbeService();
      const res = await service.probeCheckShared(
        "bad-secret",
        ["user@alchm.kitchen"],
        { fetchFn: mockFetch },
      );

      expect(res.passed).toBe(false);
      expect(res.status).toBe(401);
    });
  });

  describe("runNegativeControls", () => {
    it("returns passed=true when all 4 endpoints reject with 401", async () => {
      const mockFetch: typeof fetch = jest
        .fn()
        .mockResolvedValue(jsonResponse({ error: "Unauthorized" }, 401));

      const service = new AsolContractProbeService();
      const res = await service.runNegativeControls({ fetchFn: mockFetch });

      expect(res.passed).toBe(true);
      expect(res.allRejectedWith401).toBe(true);
      expect(res.statuses).toEqual({
        "agent-roster": 401,
        "sync-status": 401,
        vessel: 401,
        "check-shared": 401,
      });
    });

    it("returns passed=false if any endpoint unexpectedly allows unauthenticated access", async () => {
      const mockFetch: typeof fetch = jest
        .fn()
        .mockImplementation(async (url: string) => {
          if (url.includes("agent-roster")) {
            return jsonResponse({}, 200);
          }
          return jsonResponse({}, 401);
        });

      const service = new AsolContractProbeService();
      const res = await service.runNegativeControls({ fetchFn: mockFetch });

      expect(res.passed).toBe(false);
      expect(res.allRejectedWith401).toBe(false);
    });
  });

  describe("executeProbe (three-valued verdict)", () => {
    it("returns verdict=healthy when all endpoints and negative controls pass", async () => {
      const calledUrls: string[] = [];
      const mockFetch: typeof fetch = jest
        .fn()
        .mockImplementation(async (url: string, init?: RequestInit) => {
          calledUrls.push(url);
          const hasAuth =
            Boolean(init?.headers && "Authorization" in init.headers) ||
            Boolean(init?.headers && "X-Sync-Secret" in init.headers);

          if (!hasAuth) {
            return jsonResponse({ error: "Unauthorized" }, 401);
          }

          if (url.includes("agent-roster")) {
            return jsonResponse(
              { schemaVersion: 1, count: 0, agents: [] },
              200,
            );
          }
          if (url.includes("sync-status")) {
            return jsonResponse(
              { ok: true, idempotencyKey: "probe-test-key", applied: false },
              200,
            );
          }
          if (url.includes("vessel")) {
            return jsonResponse(
              {
                success: true,
                version: 1,
                balances: { spirit: 0, essence: 0, matter: 0, substance: 0 },
              },
              200,
            );
          }
          if (url.includes("check-shared")) {
            return jsonResponse({ success: true, sharedEmails: [] }, 200);
          }

          return jsonResponse({}, 404);
        });

      const service = new AsolContractProbeService();
      const report = await service.executeProbe({
        internalSecret: "test-internal",
        syncSecret: "test-sync",
        fetchFn: mockFetch,
      });

      expect(report.success).toBe(true);
      expect(report.verdict).toBe("healthy");
      expect(report.vantage).toBe("wten-internal-receiver");
      expect(report.destination).toBe("http://localhost:3000");
      expect(report.timeoutMs).toBe(3000);
      expect(report.checks.agentRosterAuth.passed).toBe(true);
      expect(report.checks.syncStatusAuth.passed).toBe(true);
      expect(report.checks.vesselAuth.passed).toBe(true);
      expect(report.checks.checkSharedAuth.passed).toBe(true);
      expect(report.checks.negativeControls.passed).toBe(true);

      // Verify no synthetic mutation calls were made
      for (const u of calledUrls) {
        expect(u).not.toContain("sync-credit");
        expect(u).not.toContain("sync-debit");
        expect(u).not.toContain("transmut");
      }
    });

    it("returns verdict=unreachable when all endpoints fail to connect (status 0)", async () => {
      const mockFetch: typeof fetch = jest
        .fn()
        .mockRejectedValue(new Error("Connection refused (ECONNREFUSED)"));

      const service = new AsolContractProbeService();
      const report = await service.executeProbe({
        internalSecret: "test-internal",
        syncSecret: "test-sync",
        fetchFn: mockFetch,
      });

      expect(report.success).toBe(false);
      expect(report.verdict).toBe("unreachable");
      expect(report.vantage).toBe("wten-internal-receiver");
      expect(report.checks.agentRosterAuth.status).toBe(0);
      expect(report.checks.negativeControls.passed).toBe(false);
    });

    it("returns verdict=degraded when destination is reachable but some checks fail", async () => {
      const mockFetch: typeof fetch = jest
        .fn()
        .mockImplementation(async (url: string, init?: RequestInit) => {
          const hasAuth =
            Boolean(init?.headers && "Authorization" in init.headers) ||
            Boolean(init?.headers && "X-Sync-Secret" in init.headers);

          if (!hasAuth) {
            return jsonResponse({ error: "Unauthorized" }, 401);
          }

          if (url.includes("agent-roster")) {
            return jsonResponse({ error: "Internal Server Error" }, 500);
          }
          if (url.includes("sync-status")) {
            return jsonResponse(
              { ok: true, idempotencyKey: "probe-test-key", applied: false },
              200,
            );
          }
          if (url.includes("vessel")) {
            return jsonResponse(
              {
                success: true,
                version: 1,
                balances: { spirit: 0, essence: 0, matter: 0, substance: 0 },
              },
              200,
            );
          }
          if (url.includes("check-shared")) {
            return jsonResponse({ success: true, sharedEmails: [] }, 200);
          }

          return jsonResponse({}, 404);
        });

      const service = new AsolContractProbeService();
      const report = await service.executeProbe({
        internalSecret: "test-internal",
        syncSecret: "test-sync",
        fetchFn: mockFetch,
      });

      expect(report.success).toBe(false);
      expect(report.verdict).toBe("degraded");
      expect(report.checks.agentRosterAuth.passed).toBe(false);
      expect(report.checks.agentRosterAuth.status).toBe(500);
      expect(report.checks.syncStatusAuth.passed).toBe(true);
    });
  });
});
