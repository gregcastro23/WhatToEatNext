/**
 * POST /api/push/preference — the per-user push opt-out gate (PR 5, review §2).
 * Proves the jsonb write targets the whole '{push}' object (not the nested
 * '{push,enabled}' path, which is a NO-OP when 'push' is absent).
 */

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      status: init?.status ?? 200,
      json: async () => body,
      headers: init?.headers ?? {},
    })),
  },
}));

jest.mock("@/lib/redis", () => ({ getRedisClient: () => null }));
jest.mock("@/lib/rateLimit", () => ({ rateLimit: jest.fn().mockResolvedValue({ allowed: true }) }));
jest.mock("@/lib/auth/validateRequest", () => ({ getUserIdFromRequest: jest.fn() }));
jest.mock("@/lib/database", () => ({ executeQuery: jest.fn() }));

import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { executeQuery } from "@/lib/database";
import { POST } from "../route";

const TESLA = "22222222-2222-4222-8222-222222222222";
const mockQuery = executeQuery as jest.Mock;

function makeRequest(body: unknown): any {
  return {
    url: "http://localhost/api/push/preference",
    method: "POST",
    nextUrl: { pathname: "/api/push/preference" },
    json: async () => body,
    headers: { get: () => null },
  };
}

describe("POST /api/push/preference", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getUserIdFromRequest as jest.Mock).mockResolvedValue(TESLA);
    mockQuery.mockResolvedValue({ rows: [], rowCount: 1 });
  });

  it("401s an anonymous caller", async () => {
    (getUserIdFromRequest as jest.Mock).mockResolvedValue(null);
    const res = await POST(makeRequest({ enabled: false }));
    expect(res.status).toBe(401);
  });

  it("persists an opt-out by writing the WHOLE {push} object (works from '{}' prefs)", async () => {
    const res = await POST(makeRequest({ enabled: false }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body).toEqual({ success: true, enabled: false });

    const [sql, params] = mockQuery.mock.calls[0];
    // The fix: target '{push}' with jsonb_build_object — NOT the nested
    // '{push,enabled}' path, which no-ops when 'push' is absent.
    expect(sql).toContain("'{push}'");
    expect(sql).not.toContain("'{push,enabled}'");
    expect(sql).toContain("jsonb_build_object('enabled', $2::boolean)");
    expect(sql).toContain("COALESCE(preferences, '{}'::jsonb)");
    expect(params).toEqual([TESLA, false]);
  });

  it("coerces a truthy enable and records it", async () => {
    const res = await POST(makeRequest({ enabled: true }));
    const body = await res.json();
    expect(body).toEqual({ success: true, enabled: true });
    expect(mockQuery.mock.calls[0][1]).toEqual([TESLA, true]);
  });
});
