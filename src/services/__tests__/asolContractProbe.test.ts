/**
 * Unit tests for AsolContractProbeService
 *
 * Verifies positive authentication checks, schema validation,
 * and negative control assertions across boundary endpoints.
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

describe("AsolContractProbeService", () => {
  it("exports a singleton instance", () => {
    expect(asolContractProbe).toBeInstanceOf(AsolContractProbeService);
  });

  describe("probeAgentRoster", () => {
    it("returns passed=true for valid 200 responses", async () => {
      const mockFetch: typeof fetch = jest.fn().mockResolvedValue(
        jsonResponse({ agents: [{ id: "agent-1", email: "mercury@agentic.alchm.kitchen" }] }, 200),
      );

      const service = new AsolContractProbeService();
      const res = await service.probeAgentRoster("valid-secret", { fetchFn: mockFetch });

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
      const mockFetch: typeof fetch = jest.fn().mockResolvedValue(
        jsonResponse({ error: "Unauthorized" }, 401),
      );

      const service = new AsolContractProbeService();
      const res = await service.probeAgentRoster("bad-secret", { fetchFn: mockFetch });

      expect(res.passed).toBe(false);
      expect(res.status).toBe(401);
    });

    it("returns passed=false for malformed payload", async () => {
      const mockFetch: typeof fetch = jest.fn().mockResolvedValue(
        jsonResponse({ invalid: "payload" }, 200),
      );

      const service = new AsolContractProbeService();
      const res = await service.probeAgentRoster("valid-secret", { fetchFn: mockFetch });

      expect(res.passed).toBe(false);
      expect(res.message).toContain("Invalid roster schema");
    });
  });

  describe("probeSyncStatus", () => {
    it("returns passed=true for valid 200 responses", async () => {
      const mockFetch: typeof fetch = jest.fn().mockResolvedValue(
        jsonResponse({ ok: true, idempotencyKey: "test-key", applied: false }, 200),
      );

      const service = new AsolContractProbeService();
      const res = await service.probeSyncStatus("sync-secret", "test-key", { fetchFn: mockFetch });

      expect(res.passed).toBe(true);
      expect(res.status).toBe(200);
    });

    it("returns passed=false for 401 responses", async () => {
      const mockFetch: typeof fetch = jest.fn().mockResolvedValue(
        jsonResponse({ ok: false, error: "Unauthorized" }, 401),
      );

      const service = new AsolContractProbeService();
      const res = await service.probeSyncStatus("bad-secret", "test-key", { fetchFn: mockFetch });

      expect(res.passed).toBe(false);
      expect(res.status).toBe(401);
    });
  });

  describe("probeVessel", () => {
    it("returns passed=true for 200 (user found)", async () => {
      const mockFetch: typeof fetch = jest.fn().mockResolvedValue(
        jsonResponse({ success: true, balances: {} }, 200),
      );

      const service = new AsolContractProbeService();
      const res = await service.probeVessel("sync-secret", "user@alchm.kitchen", { fetchFn: mockFetch });

      expect(res.passed).toBe(true);
      expect(res.status).toBe(200);
    });

    it("returns passed=true for 404 (valid auth, user not in db)", async () => {
      const mockFetch: typeof fetch = jest.fn().mockResolvedValue(
        jsonResponse({ success: false, error: "user_not_found" }, 404),
      );

      const service = new AsolContractProbeService();
      const res = await service.probeVessel("sync-secret", "missing@alchm.kitchen", { fetchFn: mockFetch });

      expect(res.passed).toBe(true);
      expect(res.status).toBe(404);
    });

    it("returns passed=false for 401 (bad sync secret)", async () => {
      const mockFetch: typeof fetch = jest.fn().mockResolvedValue(
        jsonResponse({ success: false, error: "Authentication required" }, 401),
      );

      const service = new AsolContractProbeService();
      const res = await service.probeVessel("bad-secret", "user@alchm.kitchen", { fetchFn: mockFetch });

      expect(res.passed).toBe(false);
      expect(res.status).toBe(401);
    });
  });

  describe("probeCheckShared", () => {
    it("returns passed=true for valid 200 responses", async () => {
      const mockFetch: typeof fetch = jest.fn().mockResolvedValue(
        jsonResponse({ success: true, sharedEmails: ["user@alchm.kitchen"] }, 200),
      );

      const service = new AsolContractProbeService();
      const res = await service.probeCheckShared("sync-secret", ["user@alchm.kitchen"], { fetchFn: mockFetch });

      expect(res.passed).toBe(true);
      expect(res.status).toBe(200);
    });

    it("returns passed=false for 401 responses", async () => {
      const mockFetch: typeof fetch = jest.fn().mockResolvedValue(
        jsonResponse({ success: false, error: "Unauthorized" }, 401),
      );

      const service = new AsolContractProbeService();
      const res = await service.probeCheckShared("bad-secret", ["user@alchm.kitchen"], { fetchFn: mockFetch });

      expect(res.passed).toBe(false);
      expect(res.status).toBe(401);
    });
  });

  describe("runNegativeControls", () => {
    it("returns passed=true when all 4 endpoints reject with 401", async () => {
      const mockFetch: typeof fetch = jest.fn().mockResolvedValue(
        jsonResponse({ error: "Unauthorized" }, 401),
      );

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
      const mockFetch: typeof fetch = jest.fn().mockImplementation(async (url: string) => {
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

  describe("executeProbe", () => {
    it("executes full report and aggregates success", async () => {
      const mockFetch: typeof fetch = jest.fn().mockImplementation(async (url: string, init?: RequestInit) => {
        const hasAuth =
          Boolean(init?.headers && "Authorization" in init.headers) ||
          Boolean(init?.headers && "X-Sync-Secret" in init.headers);

        if (!hasAuth) {
          return jsonResponse({ error: "Unauthorized" }, 401);
        }

        if (url.includes("agent-roster")) {
          return jsonResponse({ agents: [] }, 200);
        }
        if (url.includes("sync-status")) {
          return jsonResponse({ ok: true, applied: false }, 200);
        }
        if (url.includes("vessel")) {
          return jsonResponse({ success: true }, 200);
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
      expect(report.checks.agentRosterAuth.passed).toBe(true);
      expect(report.checks.syncStatusAuth.passed).toBe(true);
      expect(report.checks.vesselAuth.passed).toBe(true);
      expect(report.checks.checkSharedAuth.passed).toBe(true);
      expect(report.checks.negativeControls.passed).toBe(true);
    });
  });
});
