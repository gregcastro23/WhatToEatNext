/**
 * @jest-environment node
 *
 * Idempotency deduplication tests for POST /api/feed.
 */

const mockExecuteQuery = jest.fn();
jest.mock("@/lib/database", () => ({
  executeQuery: (...args: unknown[]): unknown => mockExecuteQuery(...args),
}));
jest.mock("@/lib/database/connection", () => ({
  executeQuery: (...args: unknown[]): unknown => mockExecuteQuery(...args),
}));

const mockCreateEvent = jest.fn();
jest.mock("@/services/feedDatabaseService", () => ({
  feedDatabase: {
    createEvent: (...args: unknown[]): unknown => mockCreateEvent(...args),
    getRecentEvents: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock("@/services/feedEmitTracker", () => ({
  feedEmitTracker: {
    setLastEmit: jest.fn(),
  },
}));

const mockGetUserByEmail = jest.fn();
const mockEnsurePlanetaryAgent = jest.fn();
jest.mock("@/services/userDatabaseService", () => ({
  userDatabase: {
    getUserByEmail: (...args: unknown[]): unknown => mockGetUserByEmail(...args),
    ensurePlanetaryAgent: (...args: unknown[]): unknown => mockEnsurePlanetaryAgent(...args),
  },
}));

jest.mock("@/lib/redis", () => ({
  redisCached: jest.fn(),
}));

import {
  computeV1Signature,
  parseWebhookSecret,
} from "@/lib/hooks/standardWebhooks";
import { POST } from "../route";

const TEST_SECRET = "test-internal-feed-secret";
const TEST_HOOK_SECRET = "test-hook-secret-98765";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function makeFeedRequest(
  body: Record<string, unknown>,
  idempotencyKey?: string,
): Request {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${TEST_SECRET}`,
  };
  if (idempotencyKey) {
    headers["Idempotency-Key"] = idempotencyKey;
  }
  return new Request("http://localhost/api/feed", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

describe("POST /api/feed idempotency", () => {
  const originalSecret = process.env.INTERNAL_API_SECRET;

  beforeEach(() => {
    process.env.INTERNAL_API_SECRET = TEST_SECRET;
    mockExecuteQuery.mockReset();
    mockCreateEvent.mockReset().mockResolvedValue(true);
    mockGetUserByEmail.mockReset().mockResolvedValue({
      id: "agent-123",
      email: "sol@agentic.alchm.kitchen",
      isAgent: true,
      profile: { name: "Sol" },
    });
    mockEnsurePlanetaryAgent.mockReset();
  });

  afterAll(() => {
    process.env.INTERNAL_API_SECRET = originalSecret;
  });

  it("claims a first feed event delivery via webhook_events and creates the event", async () => {
    // 1. webhook_events INSERT claim
    mockExecuteQuery.mockResolvedValueOnce({
      rows: [{ id: 201, attempts: 1 }],
    });
    // 2. webhook_events UPDATE complete
    mockExecuteQuery.mockResolvedValueOnce({ rows: [] });

    const req = makeFeedRequest(
      {
        agentEmail: "sol@agentic.alchm.kitchen",
        eventType: "recipe_generation",
        metadataPayload: { title: "Golden Elixir" },
      },
      "feed-key-001",
    );
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(isRecord(data) && data.success).toBe(true);
    expect(mockCreateEvent).toHaveBeenCalledTimes(1);
  });

  it("recognizes a duplicate feed event and returns deduplicated: true without re-creating event", async () => {
    // 1. webhook_events INSERT conflict -> no rows
    mockExecuteQuery.mockResolvedValueOnce({ rows: [] });
    // 2. webhook_events retry update -> no rows
    mockExecuteQuery.mockResolvedValueOnce({ rows: [] });
    // 3. webhook_events mark duplicate -> status: 'processed'
    mockExecuteQuery.mockResolvedValueOnce({
      rows: [{ status: "processed" }],
    });
    // 4. fetch previous result
    mockExecuteQuery.mockResolvedValueOnce({
      rows: [
        {
          result: {
            success: true,
            agentEmail: "sol@agentic.alchm.kitchen",
            eventType: "recipe_generation",
          },
        },
      ],
    });

    const req = makeFeedRequest(
      {
        agentEmail: "sol@agentic.alchm.kitchen",
        eventType: "recipe_generation",
        metadataPayload: { title: "Golden Elixir" },
      },
      "feed-key-001",
    );
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(isRecord(data) && data.deduplicated).toBe(true);
    expect(mockCreateEvent).not.toHaveBeenCalled();
  });

  it("returns 409 Conflict when a duplicate feed event is currently in flight", async () => {
    // 1. webhook_events INSERT conflict -> no rows
    mockExecuteQuery.mockResolvedValueOnce({ rows: [] });
    // 2. webhook_events retry update -> no rows
    mockExecuteQuery.mockResolvedValueOnce({ rows: [] });
    // 3. webhook_events mark duplicate -> status: 'processing'
    mockExecuteQuery.mockResolvedValueOnce({
      rows: [{ status: "processing" }],
    });

    const req = makeFeedRequest(
      {
        agentEmail: "sol@agentic.alchm.kitchen",
        eventType: "recipe_generation",
        metadataPayload: { title: "Golden Elixir" },
      },
      "feed-key-001",
    );
    const res = await POST(req);
    expect(res.status).toBe(409);
    expect(res.headers.get("Retry-After")).toBe("1");
    const data = await res.json();
    expect(isRecord(data) && data.status).toBe("in_flight");
    expect(mockCreateEvent).not.toHaveBeenCalled();
  });

  it("records signature: 'valid' in summary when Standard Webhook headers are valid", async () => {
    process.env.HOOK_SECRET_ASOL = TEST_HOOK_SECRET;
    mockExecuteQuery.mockResolvedValueOnce({ rows: [{ id: 202, attempts: 1 }] });
    mockExecuteQuery.mockResolvedValueOnce({ rows: [] });

    const body = {
      agentEmail: "sol@agentic.alchm.kitchen",
      eventType: "recipe_generation",
      metadataPayload: { title: "Signed Elixir" },
    };
    const bodyStr = JSON.stringify(body);
    const nowSec = Math.floor(Date.now() / 1000);
    const msgId = "msg_valid_123";
    const sig = computeV1Signature(msgId, nowSec, bodyStr, parseWebhookSecret(TEST_HOOK_SECRET));

    const req = new Request("http://localhost/api/feed", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TEST_SECRET}`,
        "webhook-id": msgId,
        "webhook-timestamp": String(nowSec),
        "webhook-signature": `v1,${sig}`,
      },
      body: bodyStr,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    // Verify payload summary passed to executeQuery
    const firstCallArgs: unknown[] = mockExecuteQuery.mock.calls[0] ?? [];
    const params = Array.isArray(firstCallArgs[1]) ? firstCallArgs[1] : [];
    const payloadStr = typeof params[5] === "string" ? params[5] : "{}";
    const payload = JSON.parse(payloadStr);
    expect(isRecord(payload) && payload.signature).toBe("valid");

    delete process.env.HOOK_SECRET_ASOL;
  });

  it("records keyMismatch: true when webhook-id and Idempotency-Key differ", async () => {
    mockExecuteQuery.mockResolvedValueOnce({ rows: [{ id: 203, attempts: 1 }] });
    mockExecuteQuery.mockResolvedValueOnce({ rows: [] });

    const req = new Request("http://localhost/api/feed", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TEST_SECRET}`,
        "webhook-id": "msg_key_a",
        "Idempotency-Key": "key_b",
      },
      body: JSON.stringify({
        agentEmail: "sol@agentic.alchm.kitchen",
        eventType: "recipe_generation",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const firstCallArgs: unknown[] = mockExecuteQuery.mock.calls[0] ?? [];
    const params = Array.isArray(firstCallArgs[1]) ? firstCallArgs[1] : [];
    const payloadStr = typeof params[5] === "string" ? params[5] : "{}";
    const payload = JSON.parse(payloadStr);
    expect(isRecord(payload) && payload.keyMismatch).toBe(true);
    expect(isRecord(payload) && payload.webhookId).toBe("msg_key_a");
    expect(isRecord(payload) && payload.idempotencyKey).toBe("key_b");
  });

  it("rejects with 401 when ASOL_WEBHOOK_SIGNATURES='required' and request is unsigned", async () => {
    process.env.ASOL_WEBHOOK_SIGNATURES = "required";
    process.env.HOOK_SECRET_ASOL = TEST_HOOK_SECRET;

    const req = makeFeedRequest({
      agentEmail: "sol@agentic.alchm.kitchen",
      eventType: "recipe_generation",
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(isRecord(data) && data.error).toContain("unsigned");

    delete process.env.ASOL_WEBHOOK_SIGNATURES;
    delete process.env.HOOK_SECRET_ASOL;
  });
});
