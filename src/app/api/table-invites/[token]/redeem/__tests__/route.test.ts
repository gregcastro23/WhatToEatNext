/**
 * Tests for POST /api/table-invites/[token]/redeem — token expiry/exhaustion
 * mapping to HTTP status codes.
 */

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      status: init?.status ?? 200,
      json: async () => body,
    })),
  },
}));

jest.mock("@/lib/auth/validateRequest", () => ({
  getUserIdFromRequest: jest.fn(),
}));

jest.mock("@/lib/redis", () => ({
  getRedisClient: () => null,
}));

jest.mock("@/services/tableDatabaseService", () => ({
  tableDatabase: {
    redeemInvite: jest.fn(),
  },
}));

import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { tableDatabase } from "@/services/tableDatabaseService";
import { POST } from "../route";

const USER = "user-1";
const TABLE_ID = "table-1";

function makeRequest(body: unknown): any {
  return {
    url: "http://localhost/api/table-invites/tok123/redeem",
    method: "POST",
    json: async () => body,
    text: async () => JSON.stringify(body ?? {}),
    headers: { get: () => null },
  };
}

function makeParams(token: string) {
  return { params: Promise.resolve({ token }) };
}

beforeEach(() => {
  jest.clearAllMocks();
  (getUserIdFromRequest as jest.Mock).mockResolvedValue(USER);
});

describe("POST /api/table-invites/[token]/redeem", () => {
  it("returns 401 when unauthenticated", async () => {
    (getUserIdFromRequest as jest.Mock).mockResolvedValue(null);

    const res = await POST(makeRequest({}), makeParams("tok123"));

    expect(res.status).toBe(401);
    expect(tableDatabase.redeemInvite).not.toHaveBeenCalled();
  });

  it("returns 200 with the tableId on success", async () => {
    (tableDatabase.redeemInvite as jest.Mock).mockResolvedValue({
      ok: true,
      tableId: TABLE_ID,
      alreadyMember: false,
    });

    const res = await POST(makeRequest({}), makeParams("tok123"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({ success: true, tableId: TABLE_ID, alreadyMember: false });
    expect(tableDatabase.redeemInvite).toHaveBeenCalledWith("tok123", USER, "link");
  });

  it("passes via='qr' through from the request body", async () => {
    (tableDatabase.redeemInvite as jest.Mock).mockResolvedValue({
      ok: true,
      tableId: TABLE_ID,
      alreadyMember: false,
    });

    await POST(makeRequest({ via: "qr" }), makeParams("tok123"));

    expect(tableDatabase.redeemInvite).toHaveBeenCalledWith("tok123", USER, "qr");
  });

  it("returns 404 for an invalid/unknown token", async () => {
    (tableDatabase.redeemInvite as jest.Mock).mockResolvedValue({
      ok: false,
      reason: "invalid",
    });

    const res = await POST(makeRequest({}), makeParams("does-not-exist"));

    expect(res.status).toBe(404);
  });

  it("returns 410 when the invite is expired or its use count is exhausted — never a silent success", async () => {
    (tableDatabase.redeemInvite as jest.Mock).mockResolvedValue({
      ok: false,
      reason: "expired",
    });

    const res = await POST(makeRequest({}), makeParams("tok123"));
    const data = await res.json();

    expect(res.status).toBe(410);
    expect(data.success).toBe(false);
    expect(data.message).toMatch(/expired|use limit/i);
  });

  it("does not consume attacker-controlled JSON in the body beyond 'via'", async () => {
    (tableDatabase.redeemInvite as jest.Mock).mockResolvedValue({
      ok: true,
      tableId: TABLE_ID,
      alreadyMember: true,
    });

    const res = await POST(
      makeRequest({ via: "link", userId: "someone-elses-id" }),
      makeParams("tok123"),
    );

    expect(res.status).toBe(200);
    // The caller identity always comes from getUserIdFromRequest, never the body.
    expect(tableDatabase.redeemInvite).toHaveBeenCalledWith("tok123", USER, "link");
  });
});
