/**
 * @jest-environment node
 *
 * Tests for POST /api/internal/agent-recipes:
 * - Authentication (bearer or sync-secret).
 * - Validation.
 * - Idempotency deduplication via webhook_events.
 */

const mockExecuteQuery = jest.fn();
jest.mock("@/lib/database/connection", () => ({
  executeQuery: (...args: unknown[]): unknown => mockExecuteQuery(...args),
}));

import { NextRequest } from "next/server";
import { POST } from "../route";

const TEST_INTERNAL_SECRET = "test-internal-secret-xyz";
const TEST_SYNC_SECRET = "test-sync-secret-xyz";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function makeRecipeRequest(
  body: unknown,
  options: {
    authHeader?: string;
    syncHeader?: string;
    idempotencyKey?: string;
  } = {},
): NextRequest {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (options.authHeader !== undefined) {
    headers["Authorization"] = options.authHeader;
  }
  if (options.syncHeader !== undefined) {
    headers["X-Sync-Secret"] = options.syncHeader;
  }
  if (options.idempotencyKey !== undefined) {
    headers["Idempotency-Key"] = options.idempotencyKey;
  }

  return new NextRequest("http://localhost/api/internal/agent-recipes", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

describe("POST /api/internal/agent-recipes", () => {
  const origInternal = process.env.INTERNAL_API_SECRET;
  const origSync = process.env.ALCHM_KITCHEN_SYNC_SECRET;

  beforeEach(() => {
    process.env.INTERNAL_API_SECRET = TEST_INTERNAL_SECRET;
    process.env.ALCHM_KITCHEN_SYNC_SECRET = TEST_SYNC_SECRET;
    mockExecuteQuery.mockReset();
  });

  afterAll(() => {
    process.env.INTERNAL_API_SECRET = origInternal;
    process.env.ALCHM_KITCHEN_SYNC_SECRET = origSync;
  });

  it("rejects unauthorized requests with 401", async () => {
    const req = makeRecipeRequest({ name: "Recipe 1" });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("validates body schema and returns 400 on missing userId or name", async () => {
    const req = makeRecipeRequest(
      { name: "Only Name" },
      { authHeader: `Bearer ${TEST_INTERNAL_SECRET}` },
    );
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("inserts new custom recipe and claims idempotency key", async () => {
    // 1. webhook_events INSERT claim
    mockExecuteQuery.mockResolvedValueOnce({
      rows: [{ id: 301, attempts: 1 }],
    });
    // 2. insert recipe into user_custom_recipes
    mockExecuteQuery.mockResolvedValueOnce({
      rows: [{ id: "recipe-uuid-1", created_at: "2026-09-23T12:00:00Z" }],
    });
    // 3. webhook_events UPDATE complete
    mockExecuteQuery.mockResolvedValueOnce({ rows: [] });

    const req = makeRecipeRequest(
      {
        userId: "agent-user-id",
        name: "Solar Stew",
        cuisine: "Solar Alchemical",
        payload: { ingredients: ["saffron", "gold leaf"] },
      },
      {
        authHeader: `Bearer ${TEST_INTERNAL_SECRET}`,
        idempotencyKey: "recipe-key-101",
      },
    );

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(isRecord(data) && data.success).toBe(true);
    expect(isRecord(data) && data.id).toBe("recipe-uuid-1");
  });

  it("returns deduplicated: true and skips insert when duplicate key is received", async () => {
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
            id: "recipe-uuid-1",
            createdAt: 1727092800000,
          },
        },
      ],
    });

    const req = makeRecipeRequest(
      {
        userId: "agent-user-id",
        name: "Solar Stew",
        payload: { ingredients: ["saffron"] },
      },
      {
        authHeader: `Bearer ${TEST_INTERNAL_SECRET}`,
        idempotencyKey: "recipe-key-101",
      },
    );

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(isRecord(data) && data.deduplicated).toBe(true);
    expect(isRecord(data) && data.id).toBe("recipe-uuid-1");
  });

  it("returns 409 Conflict when duplicate key is in-flight", async () => {
    // 1. webhook_events INSERT conflict -> no rows
    mockExecuteQuery.mockResolvedValueOnce({ rows: [] });
    // 2. webhook_events retry update -> no rows
    mockExecuteQuery.mockResolvedValueOnce({ rows: [] });
    // 3. webhook_events mark duplicate -> status: 'processing'
    mockExecuteQuery.mockResolvedValueOnce({
      rows: [{ status: "processing" }],
    });

    const req = makeRecipeRequest(
      {
        userId: "agent-user-id",
        name: "Solar Stew",
        payload: { ingredients: ["saffron"] },
      },
      {
        authHeader: `Bearer ${TEST_INTERNAL_SECRET}`,
        idempotencyKey: "recipe-key-101",
      },
    );

    const res = await POST(req);
    expect(res.status).toBe(409);
    expect(res.headers.get("Retry-After")).toBe("1");
    const data = await res.json();
    expect(isRecord(data) && data.status).toBe("in_flight");
  });
});
