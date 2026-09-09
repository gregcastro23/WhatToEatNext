/**
 * Route handler tests for /api/user/identity (GET, PATCH).
 *
 * @file src/app/api/user/identity/__tests__/route.test.ts
 */

jest.mock("@/lib/auth/validateRequest", () => ({
  getUserIdFromRequest: jest.fn(),
}));

jest.mock("@/lib/rateLimit", () => ({
  rateLimit: jest
    .fn()
    .mockResolvedValue({ allowed: true, remaining: 100, resetMs: 60_000 }),
}));

jest.mock("@/lib/database", () => ({
  executeQuery: jest.fn(),
}));

import { NextRequest } from "next/server";
import { GET, PATCH } from "../route";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { executeQuery } from "@/lib/database";

const mockedGetUserId = jest.mocked(getUserIdFromRequest);
const mockedExecuteQuery = jest.mocked(executeQuery);

const USER_ID = "44444444-4444-4444-4444-444444444444";

function makeNextRequest(url: string, method = "GET", json?: unknown): NextRequest {
  return new NextRequest(url, {
    method,
    headers: { "content-type": "application/json" },
    body: json !== undefined ? JSON.stringify(json) : undefined,
  });
}

beforeEach(() => {
  mockedGetUserId.mockReset();
  mockedExecuteQuery.mockReset();
});

describe("GET /api/user/identity", () => {
  it("401s when unauthenticated", async () => {
    mockedGetUserId.mockResolvedValueOnce(null);
    const res = await GET(makeNextRequest("http://localhost:3000/api/user/identity"));
    expect(res.status).toBe(401);
  });

  it("returns identity preferences for authenticated user", async () => {
    mockedGetUserId.mockResolvedValueOnce(USER_ID);
    mockedExecuteQuery.mockResolvedValueOnce({
      rows: [{ share_identity: true, avatar_url: "https://avatar.test/1.png" }],
      rowCount: 1,
      command: "SELECT",
      oid: 0,
      fields: [],
    });

    const res = await GET(makeNextRequest("http://localhost:3000/api/user/identity"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.shareIdentity).toBe(true);
    expect(data.avatarUrl).toBe("https://avatar.test/1.png");
  });
});

describe("PATCH /api/user/identity", () => {
  it("401s when unauthenticated", async () => {
    mockedGetUserId.mockResolvedValueOnce(null);
    const res = await PATCH(makeNextRequest("http://localhost:3000/api/user/identity", "PATCH", { shareIdentity: false }));
    expect(res.status).toBe(401);
  });

  it("400s on invalid JSON body", async () => {
    mockedGetUserId.mockResolvedValueOnce(USER_ID);
    const res = await PATCH(
      new NextRequest("http://localhost:3000/api/user/identity", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: "not json",
      }),
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.message).toBe("Invalid JSON body");
  });

  it("400s when shareIdentity is not a boolean", async () => {
    mockedGetUserId.mockResolvedValueOnce(USER_ID);
    const res = await PATCH(makeNextRequest("http://localhost:3000/api/user/identity", "PATCH", { shareIdentity: "yes" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.message).toContain("shareIdentity must be a boolean");
  });

  it("updates shareIdentity successfully", async () => {
    mockedGetUserId.mockResolvedValueOnce(USER_ID);
    mockedExecuteQuery.mockResolvedValueOnce({
      rows: [],
      rowCount: 1,
      command: "UPDATE",
      oid: 0,
      fields: [],
    });

    const res = await PATCH(makeNextRequest("http://localhost:3000/api/user/identity", "PATCH", { shareIdentity: false }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.shareIdentity).toBe(false);
    expect(mockedExecuteQuery).toHaveBeenCalled();
  });
});
