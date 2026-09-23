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

import { POST } from "../route";

const TEST_SECRET = "test-internal-feed-secret";

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
});
