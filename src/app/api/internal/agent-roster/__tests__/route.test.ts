/**
 * @jest-environment node
 *
 * Tests for GET /api/internal/agent-roster:
 * - 401 on missing or invalid Bearer auth.
 * - 200 with schemaVersion 1, count, notFlagged, and mapped agents.
 * - Cache-Control: no-store header.
 * - 500 on database error.
 */

const mockExecuteQuery = jest.fn();
jest.mock("@/lib/database/connection", () => ({
  executeQuery: (...args: unknown[]): unknown => mockExecuteQuery(...args),
}));

import { NextRequest } from "next/server";
import { GET } from "../route";

const TEST_SECRET = "roster-internal-secret-999";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function makeRosterRequest(authHeader?: string): NextRequest {
  const headers: Record<string, string> = {};
  if (authHeader !== undefined) {
    headers["Authorization"] = authHeader;
  }
  return new NextRequest("http://localhost/api/internal/agent-roster", {
    method: "GET",
    headers,
  });
}

describe("GET /api/internal/agent-roster", () => {
  const origSecret = process.env.INTERNAL_API_SECRET;

  beforeEach(() => {
    process.env.INTERNAL_API_SECRET = TEST_SECRET;
    mockExecuteQuery.mockReset();
  });

  afterAll(() => {
    process.env.INTERNAL_API_SECRET = origSecret;
  });

  it("returns 401 Unauthorized when Authorization header is missing", async () => {
    const req = makeRosterRequest();
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns 401 Unauthorized when Bearer token is incorrect", async () => {
    const req = makeRosterRequest("Bearer wrong-token");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns 200 with roster payload, Cache-Control: no-store, and correct notFlagged count", async () => {
    const sampleRows = [
      {
        id: "1",
        email: "sol@agentic.alchm.kitchen",
        name: "Sol Invictus",
        is_agent: true,
        is_active: true,
        dominant_element: "Fire",
        has_natal_chart: true,
        created_at: "2026-07-01T00:00:00Z",
      },
      {
        id: "2",
        email: "luna@agentic.alchm.kitchen",
        name: "Luna",
        is_agent: false, // not flagged as agent
        is_active: true,
        dominant_element: "Water",
        has_natal_chart: false,
        created_at: "2026-07-02T00:00:00Z",
      },
      {
        id: "3",
        email: "mercury@agentic.alchm.kitchen",
        name: null,
        is_agent: null, // also not flagged
        is_active: false,
        dominant_element: null,
        has_natal_chart: false,
        created_at: "2026-07-03T00:00:00Z",
      },
    ];

    mockExecuteQuery.mockResolvedValueOnce({ rows: sampleRows });

    const req = makeRosterRequest(`Bearer ${TEST_SECRET}`);
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("no-store");

    const data = await res.json();
    expect(isRecord(data)).toBe(true);
    if (isRecord(data)) {
      expect(data.schemaVersion).toBe(1);
      expect(typeof data.generatedAt).toBe("string");
      expect(data.count).toBe(3);
      expect(data.notFlagged).toBe(2);

      const agents = data.agents;
      expect(Array.isArray(agents)).toBe(true);
      if (Array.isArray(agents)) {
        expect(agents.length).toBe(3);
        expect(agents[0]).toEqual({
          id: "1",
          email: "sol@agentic.alchm.kitchen",
          name: "Sol Invictus",
          isAgent: true,
          isActive: true,
          dominantElement: "Fire",
          hasNatalChart: true,
          createdAt: "2026-07-01T00:00:00.000Z",
        });
        expect(agents[1]).toEqual({
          id: "2",
          email: "luna@agentic.alchm.kitchen",
          name: "Luna",
          isAgent: false,
          isActive: true,
          dominantElement: "Water",
          hasNatalChart: false,
          createdAt: "2026-07-02T00:00:00.000Z",
        });
      }
    }
  });

  it("returns 500 when database query throws", async () => {
    mockExecuteQuery.mockRejectedValueOnce(new Error("Database connection lost"));
    const req = makeRosterRequest(`Bearer ${TEST_SECRET}`);
    const res = await GET(req);
    expect(res.status).toBe(500);
  });
});
