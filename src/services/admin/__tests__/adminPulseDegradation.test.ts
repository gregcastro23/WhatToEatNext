/**
 * Tests for Admin & Agents Truthful Degradation (B2)
 *
 * Verifies that database and external service boundary failures are represented
 * truthfully as null / UNKNOWN rather than fabricating zeroes, while genuine
 * measured zeroes are preserved.
 *
 * @file src/services/admin/__tests__/adminPulseDegradation.test.ts
 */

jest.mock("@/lib/database/connection", () => ({
  executeQuery: jest.fn(),
}));

jest.mock("@/services/admin/asolHealthService", () => ({
  getAsolHealthOverview: jest.fn(),
}));

jest.mock("@/services/agentCreditPathHealth", () => {
  const actual = jest.requireActual("@/services/agentCreditPathHealth");
  return {
    ...actual,
    fetchCreditPathSignals: jest.fn(),
  };
});

jest.mock("@/services/agentDebitPathHealth", () => {
  const actual = jest.requireActual("@/services/agentDebitPathHealth");
  return {
    ...actual,
    fetchDebitPathSignals: jest.fn(),
  };
});

import { executeQuery } from "@/lib/database/connection";
import { getAsolHealthOverview } from "@/services/admin/asolHealthService";
import { fetchCreditPathSignals } from "@/services/agentCreditPathHealth";
import { fetchDebitPathSignals } from "@/services/agentDebitPathHealth";
import { getAgentsPulse } from "@/services/admin/adminPulseService";
import { getActionMetrics } from "@/services/admin/adminAgentsQueries";

const mockExecuteQuery = jest.mocked(executeQuery);
const mockGetAsolHealthOverview = jest.mocked(getAsolHealthOverview);
const mockFetchCreditPathSignals = jest.mocked(fetchCreditPathSignals);
const mockFetchDebitPathSignals = jest.mocked(fetchDebitPathSignals);

describe("adminPulseDegradation (B2)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAgentsPulse", () => {
    it("reports activeDeliveryEvents24h as null when asolHealth fails, not fabricated zero", async () => {
      mockExecuteQuery.mockResolvedValue({
        rows: [{ count: 12 }],
        rowCount: 1,
        command: "SELECT",
        oid: 0,
        fields: [],
      });
      mockFetchCreditPathSignals.mockResolvedValue({
        live: true,
        calls24h: 10,
        credits24h: 10,
        lastCreditAgeMs: 1000,
        priorCalls7d: 50,
        priorCredits7d: 50,
      });
      mockFetchDebitPathSignals.mockResolvedValue({
        live: true,
        agentTraffic24h: 5,
        debits24h: 5,
        lastDebitAgeMs: 2000,
      });
      mockGetAsolHealthOverview.mockRejectedValue(new Error("Postgres query timeout"));

      const pulse = await getAgentsPulse();

      expect(pulse.activeDeliveryEvents24h).toBeNull();
      expect(pulse.totalAgents).toBe(12);
      expect(pulse.creditVerdict).toBe("OK");
      expect(pulse.debitVerdict).toBe("OK");
    });

    it("preserves genuine measured zero for activeDeliveryEvents24h when asolHealth reports zero", async () => {
      mockExecuteQuery.mockResolvedValue({
        rows: [{ count: 5 }],
        rowCount: 1,
        command: "SELECT",
        oid: 0,
        fields: [],
      });
      mockFetchCreditPathSignals.mockResolvedValue({
        live: true,
        calls24h: 0,
        credits24h: 0,
        lastCreditAgeMs: null,
        priorCalls7d: 0,
        priorCredits7d: 0,
      });
      mockFetchDebitPathSignals.mockResolvedValue({
        live: true,
        agentTraffic24h: 0,
        debits24h: 0,
        lastDebitAgeMs: null,
      });
      mockGetAsolHealthOverview.mockResolvedValue({
        generatedAt: "2026-10-14T00:00:00.000Z",
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
          signatureMode: "strict",
          signatureModeInfo: { mode: "strict", raw: "strict", valid: true },
          internalSecretConfigured: true,
          syncSecretConfigured: true,
          hookSecretConfigured: true,
        },
      });

      const pulse = await getAgentsPulse();

      expect(pulse.activeDeliveryEvents24h).toBe(0);
      expect(pulse.totalAgents).toBe(5);
    });

    it("reports totalAgents as null when roster query fails, not fabricated zero", async () => {
      mockExecuteQuery.mockRejectedValue(new Error("Connection refused"));
      mockFetchCreditPathSignals.mockResolvedValue({
        live: true,
        calls24h: 0,
        credits24h: 0,
        lastCreditAgeMs: null,
        priorCalls7d: 0,
        priorCredits7d: 0,
      });
      mockFetchDebitPathSignals.mockResolvedValue({
        live: true,
        agentTraffic24h: 0,
        debits24h: 0,
        lastDebitAgeMs: null,
      });
      mockGetAsolHealthOverview.mockResolvedValue({
        generatedAt: "2026-10-14T00:00:00.000Z",
        totalReceived: 42,
        totalProcessed: 42,
        totalInFlight: 0,
        totalLiveInFlight: 0,
        totalStaleLocks: 0,
        totalFailed: 0,
        totalDuplicates: 0,
        overallP95LatencyMs: 15,
        sources: [],
        recentEvents: [],
        feedStatus: {
          lastEmit: null,
          signatureMode: "strict",
          signatureModeInfo: { mode: "strict", raw: "strict", valid: true },
          internalSecretConfigured: true,
          syncSecretConfigured: true,
          hookSecretConfigured: true,
        },
      });

      const pulse = await getAgentsPulse();

      expect(pulse.totalAgents).toBeNull();
      expect(pulse.activeDeliveryEvents24h).toBe(42);
    });

    it("reports UNKNOWN verdicts when credit/debit signal fetches reject", async () => {
      mockExecuteQuery.mockResolvedValue({
        rows: [{ count: 0 }],
        rowCount: 1,
        command: "SELECT",
        oid: 0,
        fields: [],
      });
      mockFetchCreditPathSignals.mockRejectedValue(new Error("Credit DB unavailable"));
      mockFetchDebitPathSignals.mockRejectedValue(new Error("Debit DB unavailable"));
      mockGetAsolHealthOverview.mockRejectedValue(new Error("Asol DB unavailable"));

      const pulse = await getAgentsPulse();

      expect(pulse.creditVerdict).toBe("UNKNOWN");
      expect(pulse.debitVerdict).toBe("UNKNOWN");
      expect(pulse.activeDeliveryEvents24h).toBeNull();
      expect(pulse.totalAgents).toBe(0);
    });
  });

  describe("getActionMetrics", () => {
    it("reports calls24h, successes24h, failures24h as null when query rejects", async () => {
      mockExecuteQuery.mockRejectedValue(new Error("Table request_log_entries locked"));

      const metrics = await getActionMetrics();

      expect(metrics.length).toBeGreaterThan(0);
      for (const m of metrics) {
        expect(m.calls24h).toBeNull();
        expect(m.successes24h).toBeNull();
        expect(m.failures24h).toBeNull();
        expect(m.serverFailures24h).toBeNull();
        expect(m.p50Ms).toBeNull();
        expect(m.p95Ms).toBeNull();
        expect(m.lastSeenAt).toBeNull();
      }
    });

    it("preserves genuine measured zeroes when query succeeds with no matching rows", async () => {
      mockExecuteQuery.mockResolvedValue({
        rows: [],
        rowCount: 0,
        command: "SELECT",
        oid: 0,
        fields: [],
      });

      const metrics = await getActionMetrics();

      expect(metrics.length).toBeGreaterThan(0);
      for (const m of metrics) {
        expect(m.calls24h).toBe(0);
        expect(m.successes24h).toBe(0);
        expect(m.failures24h).toBe(0);
        expect(m.serverFailures24h).toBe(0);
        expect(m.p50Ms).toBeNull();
        expect(m.p95Ms).toBeNull();
        expect(m.lastSeenAt).toBeNull();
      }
    });
  });
});
