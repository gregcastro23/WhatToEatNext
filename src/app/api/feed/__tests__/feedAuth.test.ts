/**
 * @jest-environment node
 *
 * Authentication tests for POST /api/feed:
 * - A correct Bearer is accepted.
 * - A wrong Bearer of the same length is rejected (401).
 * - A wrong Bearer of a different length is rejected (401).
 * - No header is rejected (401).
 * - An unset INTERNAL_API_SECRET is rejected (401).
 */

jest.mock("@/services/feedEmitTracker", () => ({
  feedEmitTracker: {
    setLastEmit: jest.fn(),
  },
}));

jest.mock("@/services/userDatabaseService", () => ({
  userDatabase: {
    getUserByEmail: jest.fn().mockResolvedValue(null),
    ensurePlanetaryAgent: jest.fn().mockResolvedValue({ id: "agent-user-id" }),
  },
}));

jest.mock("@/services/feedDatabaseService", () => ({
  feedDatabase: {
    createEvent: jest.fn().mockResolvedValue(true),
    getRecentEvents: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock("@/lib/database", () => ({
  executeQuery: jest.fn().mockResolvedValue({ rows: [] }),
}));

jest.mock("@/lib/redis", () => ({
  redisCached: jest.fn(),
}));

import { POST } from "../route";

describe("POST /api/feed authorization", () => {
  const ORIGINAL_SECRET = process.env.INTERNAL_API_SECRET;
  const TEST_SECRET = "top-secret-token-12345";

  beforeEach(() => {
    process.env.INTERNAL_API_SECRET = TEST_SECRET;
  });

  afterAll(() => {
    process.env.INTERNAL_API_SECRET = ORIGINAL_SECRET;
  });

  function createRequest(authHeader?: string): Request {
    const headers = new Headers({
      "Content-Type": "application/json",
    });
    if (authHeader !== undefined) {
      headers.set("Authorization", authHeader);
    }
    return new Request("http://localhost/api/feed", {
      method: "POST",
      headers,
      body: JSON.stringify({
        agentEmail: "test-agent@agentic.alchm.kitchen",
        eventType: "insight",
      }),
    });
  }

  it("accepts a correct Bearer header", async () => {
    const req = createRequest(`Bearer ${TEST_SECRET}`);
    const res = await POST(req);
    // Should pass the 401 auth gate (even if downstream user check returns 404 or other)
    expect(res.status).not.toBe(401);
  });

  it("rejects a wrong Bearer of the exact same length (401)", async () => {
    // "top-secret-token-99999" has length 22, identical to "top-secret-token-12345"
    const req = createRequest("Bearer top-secret-token-99999");
    const res = await POST(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("rejects a wrong Bearer of a different length (401)", async () => {
    const req = createRequest("Bearer short");
    const res = await POST(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("rejects a request with no Authorization header (401)", async () => {
    const req = createRequest();
    const res = await POST(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("rejects when INTERNAL_API_SECRET is unset in the environment (401)", async () => {
    delete process.env.INTERNAL_API_SECRET;
    const req = createRequest(`Bearer ${TEST_SECRET}`);
    const res = await POST(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: "Unauthorized" });
  });
});
