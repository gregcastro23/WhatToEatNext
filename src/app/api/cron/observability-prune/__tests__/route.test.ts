/** @jest-environment node */
import { NextRequest } from "next/server";
import { GET } from "../route";

const mockExecuteQuery = jest.fn();
const mockRecordCronRun = jest.fn();
const mockLoggerInfo = jest.fn();
const mockLoggerError = jest.fn();

jest.mock("@/lib/database/connection", () => ({
  executeQuery: (...args: unknown[]) => mockExecuteQuery(...args),
}));

jest.mock("@/services/cronHeartbeatService", () => ({
  recordCronRun: (...args: unknown[]) => mockRecordCronRun(...args),
}));

jest.mock("@/lib/logger", () => ({
  _logger: {
    info: (...args: unknown[]) => mockLoggerInfo(...args),
    error: (...args: unknown[]) => mockLoggerError(...args),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe("/api/cron/observability-prune", () => {
  const originalCronSecret = process.env.CRON_SECRET;

  beforeEach(() => {
    mockExecuteQuery.mockReset();
    mockRecordCronRun.mockReset().mockResolvedValue(undefined);
    mockLoggerInfo.mockReset();
    mockLoggerError.mockReset();
    process.env.CRON_SECRET = "test-cron-secret";
  });

  afterEach(() => {
    process.env.CRON_SECRET = originalCronSecret;
  });

  it("rejects unauthorized requests without Bearer CRON_SECRET", async () => {
    const res = await GET(
      new NextRequest("http://localhost:3000/api/cron/observability-prune"),
    );
    expect(res.status).toBe(401);
  });

  it("prunes observability, telemetry, webhooks, and 60-day feed_events", async () => {
    mockExecuteQuery
      .mockResolvedValueOnce({
        rows: [
          {
            request_log_deleted: "12",
            slow_query_log_deleted: "3",
            mcp_invocations_deleted: "7",
          },
        ],
      }) // prune_observability_logs
      .mockResolvedValueOnce({
        rows: [{ faucet_resonance_deleted: "5" }],
      }) // prune_faucet_claim_resonance
      .mockResolvedValueOnce({
        rows: [{ page_views_deleted: "19" }],
      }) // prune_page_views
      .mockResolvedValueOnce({
        rows: [
          {
            synthetic_probes_deleted: "100",
            system_metrics_deleted: "50",
            health_snapshots_deleted: "25",
            webhook_events_deleted: "40",
          },
        ],
      }) // prune_telemetry_and_webhooks
      .mockResolvedValueOnce({
        rows: [{ feed_events_deleted: "5000" }],
      }); // prune_feed_events

    const res = await GET(
      new NextRequest("http://localhost:3000/api/cron/observability-prune", {
        headers: { Authorization: "Bearer test-cron-secret" },
      }),
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body).toEqual({
      success: true,
      retainDays: 7,
      requestLogDeleted: 12,
      slowQueryLogDeleted: 3,
      mcpInvocationsDeleted: 7,
      faucetResonanceDeleted: 5,
      pageViewsDeleted: 19,
      syntheticProbesDeleted: 100,
      systemMetricsDeleted: 50,
      healthSnapshotsDeleted: 25,
      webhookEventsDeleted: 40,
      feedEventsDeleted: 5000,
    });

    expect(mockExecuteQuery).toHaveBeenCalledWith(
      "SELECT * FROM prune_telemetry_and_webhooks($1, $2, $3, $4)",
      [14, 14, 30, 30],
    );
    expect(mockExecuteQuery).toHaveBeenCalledWith(
      "SELECT * FROM prune_feed_events($1, $2)",
      [60, 5000],
    );
    expect(mockRecordCronRun).toHaveBeenCalledWith(
      "observability-prune",
      expect.objectContaining({ status: "success" }),
    );
  });

  it("falls back to zero counts when migration 108 functions are not yet deployed", async () => {
    const missingFnErr = Object.assign(new Error("function does not exist"), {
      code: "42883",
    });

    mockExecuteQuery
      .mockResolvedValueOnce({
        rows: [
          {
            request_log_deleted: "2",
            slow_query_log_deleted: "0",
            mcp_invocations_deleted: "1",
          },
        ],
      })
      .mockResolvedValueOnce({ rows: [{ faucet_resonance_deleted: "0" }] })
      .mockResolvedValueOnce({ rows: [{ page_views_deleted: "4" }] })
      .mockRejectedValueOnce(missingFnErr)
      .mockRejectedValueOnce(missingFnErr);

    const res = await GET(
      new NextRequest("http://localhost:3000/api/cron/observability-prune", {
        headers: { Authorization: "Bearer test-cron-secret" },
      }),
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body).toMatchObject({
      success: true,
      requestLogDeleted: 2,
      pageViewsDeleted: 4,
      syntheticProbesDeleted: 0,
      systemMetricsDeleted: 0,
      healthSnapshotsDeleted: 0,
      webhookEventsDeleted: 0,
      feedEventsDeleted: 0,
    });
    expect(mockLoggerError).toHaveBeenCalledTimes(2);
  });
});
