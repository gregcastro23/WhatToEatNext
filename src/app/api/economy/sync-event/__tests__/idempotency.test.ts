/**
 * @jest-environment node
 *
 * Idempotency deduplication tests for POST /api/economy/sync-event.
 */

import { NextRequest } from "next/server";
import {
  computeV1Signature,
  parseWebhookSecret,
} from "@/lib/hooks/standardWebhooks";
import { POST } from "../route";

const mockExecuteQuery = jest.fn();
jest.mock("@/lib/database", () => ({
  executeQuery: (...args: unknown[]): unknown => mockExecuteQuery(...args),
}));
jest.mock("@/lib/database/connection", () => ({
  executeQuery: (...args: unknown[]): unknown => mockExecuteQuery(...args),
}));

const mockReportEvent = jest.fn();
jest.mock("@/services/QuestService", () => ({
  questService: {
    reportEvent: (...args: unknown[]): unknown => mockReportEvent(...args),
  },
}));

const TEST_SECRET = "test-sync-secret-idemp";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function makeRequest(
  body: Record<string, unknown>,
  idempotencyKey?: string,
): NextRequest {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Sync-Secret": TEST_SECRET,
  };
  if (idempotencyKey) {
    headers["Idempotency-Key"] = idempotencyKey;
  }
  return new NextRequest("http://localhost/api/economy/sync-event", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

describe("POST /api/economy/sync-event idempotency", () => {
  const originalEnv = process.env.ALCHM_KITCHEN_SYNC_SECRET;

  beforeEach(() => {
    process.env.ALCHM_KITCHEN_SYNC_SECRET = TEST_SECRET;
    mockExecuteQuery.mockReset();
    mockReportEvent.mockReset().mockResolvedValue([
      { questSlug: "morning-brew", tokensAwarded: 5, tokenType: "alchm" },
    ]);
  });

  afterAll(() => {
    process.env.ALCHM_KITCHEN_SYNC_SECRET = originalEnv;
  });

  it("processes a first delivery and claims it via webhook_events", async () => {
    // 1. user lookup
    mockExecuteQuery.mockResolvedValueOnce({
      rows: [{ id: "user-1", is_agent: true }],
    });
    // 2. webhook_events INSERT claim
    mockExecuteQuery.mockResolvedValueOnce({
      rows: [{ id: 101, attempts: 1 }],
    });
    // 3. webhook_events UPDATE complete
    mockExecuteQuery.mockResolvedValueOnce({ rows: [] });

    const req = makeRequest(
      { userEmail: "agent@agentic.alchm.kitchen", event: "recipe_created" },
      "sync-key-1",
    );
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(isRecord(data) && data.ok).toBe(true);
    expect(mockReportEvent).toHaveBeenCalledTimes(1);
  });

  it("recognizes a duplicate delivery and returns deduplicated: true without re-executing questService", async () => {
    // 1. user lookup
    mockExecuteQuery.mockResolvedValueOnce({
      rows: [{ id: "user-1", is_agent: true }],
    });
    // 2. webhook_events INSERT conflict -> no rows
    mockExecuteQuery.mockResolvedValueOnce({ rows: [] });
    // 3. webhook_events retry update -> no rows
    mockExecuteQuery.mockResolvedValueOnce({ rows: [] });
    // 4. webhook_events mark duplicate -> status: 'processed'
    mockExecuteQuery.mockResolvedValueOnce({
      rows: [{ status: "processed" }],
    });
    // 5. fetch previous result
    mockExecuteQuery.mockResolvedValueOnce({
      rows: [{ result: { ok: true, completedCount: 1 } }],
    });

    const req = makeRequest(
      { userEmail: "agent@agentic.alchm.kitchen", event: "recipe_created" },
      "sync-key-1",
    );
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(isRecord(data) && data.deduplicated).toBe(true);
    expect(mockReportEvent).not.toHaveBeenCalled();
  });

  it("returns 409 Conflict when a duplicate delivery is currently in flight", async () => {
    // 1. user lookup
    mockExecuteQuery.mockResolvedValueOnce({
      rows: [{ id: "user-1", is_agent: true }],
    });
    // 2. webhook_events INSERT conflict -> no rows
    mockExecuteQuery.mockResolvedValueOnce({ rows: [] });
    // 3. webhook_events retry update -> no rows
    mockExecuteQuery.mockResolvedValueOnce({ rows: [] });
    // 4. webhook_events mark duplicate -> status: 'processing'
    mockExecuteQuery.mockResolvedValueOnce({
      rows: [{ status: "processing" }],
    });

    const req = makeRequest(
      { userEmail: "agent@agentic.alchm.kitchen", event: "recipe_created" },
      "sync-key-1",
    );
    const res = await POST(req);
    expect(res.status).toBe(409);
    expect(res.headers.get("Retry-After")).toBe("1");
    const data = await res.json();
    expect(isRecord(data) && data.status).toBe("in_flight");
    expect(mockReportEvent).not.toHaveBeenCalled();
  });

  it("records signature: 'valid' in summary when Standard Webhook headers are valid", async () => {
    // 1. user lookup
    mockExecuteQuery.mockResolvedValueOnce({
      rows: [{ id: "user-1", is_agent: true }],
    });
    // 2. webhook_events INSERT claim
    mockExecuteQuery.mockResolvedValueOnce({
      rows: [{ id: 102, attempts: 1 }],
    });
    // 3. webhook_events UPDATE complete
    mockExecuteQuery.mockResolvedValueOnce({ rows: [] });

    const body = { userEmail: "agent@agentic.alchm.kitchen", event: "recipe_created" };
    const bodyStr = JSON.stringify(body);
    const nowSec = Math.floor(Date.now() / 1000);
    const msgId = "msg_sync_456";
    const sig = computeV1Signature(msgId, nowSec, bodyStr, parseWebhookSecret(TEST_SECRET));

    const req = new NextRequest("http://localhost/api/economy/sync-event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Sync-Secret": TEST_SECRET,
        "webhook-id": msgId,
        "webhook-timestamp": String(nowSec),
        "webhook-signature": `v1,${sig}`,
      },
      body: bodyStr,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const claimCallArgs: unknown[] = mockExecuteQuery.mock.calls[1] ?? [];
    const params = Array.isArray(claimCallArgs[1]) ? claimCallArgs[1] : [];
    const payloadStr = typeof params[5] === "string" ? params[5] : "{}";
    const payload = JSON.parse(payloadStr);
    expect(isRecord(payload) && payload.signature).toBe("valid");
  });

  it("records keyMismatch: true when webhook-id and Idempotency-Key differ", async () => {
    // 1. user lookup
    mockExecuteQuery.mockResolvedValueOnce({
      rows: [{ id: "user-1", is_agent: true }],
    });
    // 2. webhook_events INSERT claim
    mockExecuteQuery.mockResolvedValueOnce({
      rows: [{ id: 103, attempts: 1 }],
    });
    // 3. webhook_events UPDATE complete
    mockExecuteQuery.mockResolvedValueOnce({ rows: [] });

    const req = new NextRequest("http://localhost/api/economy/sync-event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Sync-Secret": TEST_SECRET,
        "webhook-id": "msg_sync_key",
        "Idempotency-Key": "different_idemp_key",
      },
      body: JSON.stringify({ userEmail: "agent@agentic.alchm.kitchen", event: "recipe_created" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const claimCallArgs: unknown[] = mockExecuteQuery.mock.calls[1] ?? [];
    const params = Array.isArray(claimCallArgs[1]) ? claimCallArgs[1] : [];
    const payloadStr = typeof params[5] === "string" ? params[5] : "{}";
    const payload = JSON.parse(payloadStr);
    expect(isRecord(payload) && payload.keyMismatch).toBe(true);
  });

  it("rejects with 401 when ASOL_WEBHOOK_SIGNATURES='required' and request is unsigned", async () => {
    process.env.ASOL_WEBHOOK_SIGNATURES = "required";

    const req = makeRequest(
      { userEmail: "agent@agentic.alchm.kitchen", event: "recipe_created" },
      "sync-key-1",
    );

    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(isRecord(data) && data.error).toContain("unsigned");

    delete process.env.ASOL_WEBHOOK_SIGNATURES;
  });
});
