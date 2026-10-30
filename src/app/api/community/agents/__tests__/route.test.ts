/**
 * @jest-environment node
 *
 * Tests for GET /api/community/agents:
 * - Prioritizes chart-bearing historical agents ahead of synthetic planetary agents in SQL ORDER BY.
 * - Maps slug from email local-part so each directory card links to /profile/[slug].
 * - Coalesces monica_constant across monica_constant, monica_two_body, monica_full_chart.
 */

const mockExecuteQuery = jest.fn();
jest.mock("@/lib/database", () => ({
  executeQuery: (...args: unknown[]): unknown => mockExecuteQuery(...args),
}));

jest.mock("@/lib/redis", () => ({
  communityAgentsCached: async (_limit: number, _ttl: number, fn: () => Promise<unknown>): Promise<unknown> =>
    fn(),
}));

import { NextRequest } from "next/server";
import { GET } from "../route";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

describe("GET /api/community/agents", () => {
  beforeEach(() => {
    mockExecuteQuery.mockReset();
  });

  it("prioritizes chart-bearing historical agents in SQL and returns mapped slugs and monicaConstant", async () => {
    mockExecuteQuery.mockResolvedValueOnce({
      rows: [
        {
          user_id: "uid-leo",
          email: "leonardo-da-vinci@agentic.alchm.kitchen",
          name: "Leonardo da Vinci",
          bio: "Renaissance Polymath (1452–1519)",
          dominant_element: "Fire",
          monica_constant: "1.618",
          last_action_at: "2026-10-12T22:28:28.177Z",
          action_count: "344",
        },
        {
          user_id: "uid-chiron",
          email: "chiron@agentic.alchm.kitchen",
          name: "Chiron",
          bio: "The Wounded Healer (Mythic Antiquity)",
          dominant_element: "Earth",
          monica_constant: "1.414",
          last_action_at: null,
          action_count: "0",
        },
      ],
    });

    const req = new NextRequest("http://localhost/api/community/agents?limit=80");
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    expect(mockExecuteQuery).toHaveBeenCalledTimes(1);

    const sqlArg = String(mockExecuteQuery.mock.calls[0]?.[0] ?? "");
    expect(sqlArg).toContain("COALESCE(up.monica_constant, up.monica_two_body, up.monica_full_chart)");
    expect(sqlArg).toContain("ORDER BY BOOL_OR(");
    expect(sqlArg).toContain("up.natal_positions IS NOT NULL");
    expect(sqlArg).toContain("up.natal_chart IS NOT NULL");
    expect(sqlArg).toContain("up.birth_data IS NOT NULL");
    expect(mockExecuteQuery.mock.calls[0]?.[1]).toEqual([80]);

    const body: unknown = await res.json();
    expect(isRecord(body)).toBe(true);
    if (isRecord(body)) {
      expect(body.success).toBe(true);
      expect(Array.isArray(body.agents)).toBe(true);
      if (Array.isArray(body.agents)) {
        expect(body.agents).toEqual([
          {
            userId: "uid-leo",
            handle: "leonardo-da-vinci@agentic.alchm.kitchen",
            slug: "leonardo-da-vinci",
            name: "Leonardo da Vinci",
            bio: "Renaissance Polymath (1452–1519)",
            dominantElement: "Fire",
            monicaConstant: 1.618,
            lastActionAt: "2026-10-12T22:28:28.177Z",
            actionCount: 344,
          },
          {
            userId: "uid-chiron",
            handle: "chiron@agentic.alchm.kitchen",
            slug: "chiron",
            name: "Chiron",
            bio: "The Wounded Healer (Mythic Antiquity)",
            dominantElement: "Earth",
            monicaConstant: 1.414,
            lastActionAt: null,
            actionCount: 0,
          },
        ]);
      }
    }
  });

  it("returns 500 when the database query fails", async () => {
    mockExecuteQuery.mockRejectedValueOnce(new Error("db error"));
    const req = new NextRequest("http://localhost/api/community/agents?limit=80");
    const res = await GET(req);
    expect(res.status).toBe(500);
  });

  it.each([["71", 71], ["999", 200], ["-1", 100], ["0", 100], ["NaN", 100], ["1.5", 100]])("normalizes limit %s to %s", async (value, expected) => {
    mockExecuteQuery.mockResolvedValueOnce({ rows: [] });
    const res = await GET(new NextRequest(`http://localhost/api/community/agents?limit=${value}`));
    expect(res.status).toBe(200);
    expect(mockExecuteQuery.mock.calls[0]?.[1]).toEqual([expected]);
  });
});
