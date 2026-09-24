/**
 * ASOL Health Service Tests
 *
 * @file src/services/admin/__tests__/asolHealthService.test.ts
 */

jest.mock("@/lib/database/connection", () => ({
  executeQuery: jest.fn(),
}));

import { executeQuery } from "@/lib/database/connection";
import { getAsolHealthOverview, sanitizeError } from "@/services/admin/asolHealthService";
import { feedEmitTracker } from "@/services/feedEmitTracker";

const mockExecuteQuery = jest.mocked(executeQuery);

describe("asolHealthService", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("aggregates overall metrics, source breakdowns, and recent events", async () => {
    process.env.INTERNAL_API_SECRET = "secret-1";
    process.env.ALCHM_KITCHEN_SYNC_SECRET = "secret-2";
    process.env.HOOK_SECRET_ASOL = "secret-3";
    process.env.ASOL_WEBHOOK_SIGNATURES = "shadow";

    feedEmitTracker.setLastEmit({
      eventType: "chat_activity",
      agentEmail: "mercury@agentic.alchm.kitchen",
      responseCode: 200,
      timestamp: "2026-09-23T12:00:00Z",
    });

    mockExecuteQuery
      .mockResolvedValueOnce({
        command: "SELECT",
        rowCount: 1,
        oid: 0,
        fields: [],
        rows: [
          {
            total_received: 42,
            total_processed: 40,
            total_in_flight: 2,
            total_live_in_flight: 1,
            total_stale_locks: 1,
            total_failed: 1,
            total_duplicates: 5,
            overall_p95_latency_ms: 123.4,
          },
        ],
      })
      .mockResolvedValueOnce({
        command: "SELECT",
        rowCount: 2,
        oid: 0,
        fields: [],
        rows: [
          {
            source: "asol-sync-event",
            received: 30,
            processed: 30,
            in_flight: 0,
            live_in_flight: 0,
            stale_locks: 0,
            failed: 0,
            duplicates: 3,
            p95_latency_ms: 95.2,
          },
          {
            source: "asol-feed",
            received: 12,
            processed: 10,
            in_flight: 2,
            live_in_flight: 1,
            stale_locks: 1,
            failed: 1,
            duplicates: 2,
            p95_latency_ms: 180.5,
          },
        ],
      })
      .mockResolvedValueOnce({
        command: "SELECT",
        rowCount: 3,
        oid: 0,
        fields: [],
        rows: [
          {
            source: "asol-sync-event",
            signature_tag: "valid",
            count: 30,
          },
          {
            source: "asol-feed",
            signature_tag: "unsigned",
            count: 10,
          },
          {
            source: "asol-feed",
            signature_tag: "signature_mismatch",
            count: 2,
          },
        ],
      })
      .mockResolvedValueOnce({
        command: "SELECT",
        rowCount: 1,
        oid: 0,
        fields: [],
        rows: [
          {
            id: "101",
            source: "asol-feed",
            event_id: "evt_123",
            event_type: "chat_activity",
            subject_id: "sub_1",
            status: "processed",
            attempts: 1,
            duplicates: 0,
            latency_ms: 45,
            last_error: null,
            received_at: "2026-09-23T12:00:00Z",
          },
        ],
      });

    const overview = await getAsolHealthOverview();

    expect(overview.totalReceived).toBe(42);
    expect(overview.totalProcessed).toBe(40);
    expect(overview.totalInFlight).toBe(2);
    expect(overview.totalLiveInFlight).toBe(1);
    expect(overview.totalStaleLocks).toBe(1);
    expect(overview.totalFailed).toBe(1);
    expect(overview.totalDuplicates).toBe(5);
    expect(overview.overallP95LatencyMs).toBe(123);

    expect(overview.sources).toHaveLength(3);
    const syncSource = overview.sources.find((s) => s.source === "asol-sync-event");
    expect(syncSource?.received).toBe(30);
    expect(syncSource?.processed).toBe(30);
    expect(syncSource?.p95LatencyMs).toBe(95);
    expect(syncSource?.signatureBreakdown.valid).toBe(30);
    expect(syncSource?.signatureBreakdown.unsigned).toBe(0);
    expect(syncSource?.signatureBreakdown.failed).toBe(0);

    const feedSource = overview.sources.find((s) => s.source === "asol-feed");
    expect(feedSource?.received).toBe(12);
    expect(feedSource?.liveInFlight).toBe(1);
    expect(feedSource?.staleLocks).toBe(1);
    expect(feedSource?.signatureBreakdown.valid).toBe(0);
    expect(feedSource?.signatureBreakdown.unsigned).toBe(10);
    expect(feedSource?.signatureBreakdown.failed).toBe(2);
    expect(feedSource?.signatureBreakdown.reasons.signature_mismatch).toBe(2);

    const recipeSource = overview.sources.find((s) => s.source === "asol-agent-recipes");
    expect(recipeSource?.received).toBe(0);
    expect(recipeSource?.processed).toBe(0);
    expect(recipeSource?.p95LatencyMs).toBeNull();
    expect(recipeSource?.signatureBreakdown.valid).toBe(0);

    expect(overview.recentEvents).toHaveLength(1);
    const [firstEvent] = overview.recentEvents;
    expect(firstEvent.eventId).toBe("evt_123");
    expect(firstEvent.status).toBe("processed");
    expect(firstEvent.latencyMs).toBe(45);

    expect(overview.feedStatus.internalSecretConfigured).toBe(true);
    expect(overview.feedStatus.syncSecretConfigured).toBe(true);
    expect(overview.feedStatus.hookSecretConfigured).toBe(true);
    expect(overview.feedStatus.signatureMode).toBe("shadow");
    expect(overview.feedStatus.lastEmit?.eventType).toBe("chat_activity");
  });

  it("handles empty database responses gracefully", async () => {
    mockExecuteQuery
      .mockResolvedValueOnce({
        command: "SELECT",
        rowCount: 0,
        oid: 0,
        fields: [],
        rows: [],
      })
      .mockResolvedValueOnce({
        command: "SELECT",
        rowCount: 0,
        oid: 0,
        fields: [],
        rows: [],
      })
      .mockResolvedValueOnce({
        command: "SELECT",
        rowCount: 0,
        oid: 0,
        fields: [],
        rows: [],
      })
      .mockResolvedValueOnce({
        command: "SELECT",
        rowCount: 0,
        oid: 0,
        fields: [],
        rows: [],
      });

    const overview = await getAsolHealthOverview();

    expect(overview.totalReceived).toBe(0);
    expect(overview.totalProcessed).toBe(0);
    expect(overview.totalInFlight).toBe(0);
    expect(overview.totalLiveInFlight).toBe(0);
    expect(overview.totalStaleLocks).toBe(0);
    expect(overview.totalFailed).toBe(0);
    expect(overview.totalDuplicates).toBe(0);
    expect(overview.overallP95LatencyMs).toBeNull();
    expect(overview.sources).toHaveLength(3);
    expect(overview.recentEvents).toEqual([]);
  });

  describe("sanitizeError", () => {
    it("returns null for empty or null error inputs", () => {
      expect(sanitizeError(null)).toBeNull();
      expect(sanitizeError("")).toBeNull();
    });

    it("truncates errors longer than 1000 characters", () => {
      const longError = "a".repeat(1500);
      const sanitized = sanitizeError(longError);
      expect(sanitized).toHaveLength(1000);
    });

    it("strips control characters", () => {
      const raw = "Error with \x00 null byte and \x07 bell";
      const sanitized = sanitizeError(raw);
      expect(sanitized).toBe("Error with  null byte and  bell");
    });
  });
});
