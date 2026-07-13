/**
 * Tests for POST /api/commensals/block — block/unblock a companion link.
 */

// Mock next/server before anything else
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

jest.mock("@/services/commensalDatabaseService", () => ({
  commensalDatabase: {
    blockCommensal: jest.fn(),
    unblockCommensal: jest.fn(),
  },
}));

import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { commensalDatabase } from "@/services/commensalDatabaseService";
import { POST } from "../route";

const ME = "user-me";
const TARGET = "user-target";

function makeRequest(body: unknown): any {
  return {
    url: "http://localhost/api/commensals/block",
    method: "POST",
    json: async () => body,
  };
}

const blockedRow = {
  id: "c-1",
  requesterId: ME,
  addresseeId: TARGET,
  status: "blocked",
  createdAt: "2026-07-01T00:00:00Z",
  updatedAt: "2026-07-11T00:00:00Z",
};

beforeEach(() => {
  jest.clearAllMocks();
  (getUserIdFromRequest as jest.Mock).mockResolvedValue(ME);
});

describe("POST /api/commensals/block", () => {
  it("returns 401 when unauthenticated", async () => {
    (getUserIdFromRequest as jest.Mock).mockResolvedValue(null);

    const res = await POST(makeRequest({ targetUserId: TARGET }));

    expect(res.status).toBe(401);
    expect(commensalDatabase.blockCommensal).not.toHaveBeenCalled();
  });

  it("returns 400 when neither commensalshipId nor targetUserId is given", async () => {
    const res = await POST(makeRequest({}));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toMatch(/commensalshipId or targetUserId/);
  });

  it("refuses self-blocking", async () => {
    const res = await POST(makeRequest({ targetUserId: ME }));

    expect(res.status).toBe(400);
    expect(commensalDatabase.blockCommensal).not.toHaveBeenCalled();
  });

  it("blocks by targetUserId and returns success WITHOUT the commensalship body", async () => {
    (commensalDatabase.blockCommensal as jest.Mock).mockResolvedValue(blockedRow);

    const res = await POST(makeRequest({ targetUserId: TARGET }));
    const data = await res.json();

    expect(res.status).toBe(200);
    // The row carries both parties' emails and blocking works from a bare
    // targetUserId — echoing it back would be an email-harvesting vector.
    expect(data).toEqual({ success: true });
    expect(commensalDatabase.blockCommensal).toHaveBeenCalledWith(ME, {
      commensalshipId: undefined,
      targetUserId: TARGET,
    });
  });

  it("blocks by commensalshipId", async () => {
    (commensalDatabase.blockCommensal as jest.Mock).mockResolvedValue(blockedRow);

    const res = await POST(makeRequest({ commensalshipId: "c-1" }));

    expect(res.status).toBe(200);
    expect(commensalDatabase.blockCommensal).toHaveBeenCalledWith(ME, {
      commensalshipId: "c-1",
      targetUserId: undefined,
    });
  });

  it("returns 400 when the service cannot block (e.g. not a party)", async () => {
    (commensalDatabase.blockCommensal as jest.Mock).mockResolvedValue(null);

    const res = await POST(makeRequest({ commensalshipId: "not-mine" }));

    expect(res.status).toBe(400);
  });

  it("unblocks with action: 'unblock'", async () => {
    (commensalDatabase.unblockCommensal as jest.Mock).mockResolvedValue(true);

    const res = await POST(
      makeRequest({ targetUserId: TARGET, action: "unblock" }),
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(commensalDatabase.unblockCommensal).toHaveBeenCalledWith(ME, {
      commensalshipId: undefined,
      targetUserId: TARGET,
    });
    expect(commensalDatabase.blockCommensal).not.toHaveBeenCalled();
  });

  it("returns 404 when there is no blocked row to unblock", async () => {
    (commensalDatabase.unblockCommensal as jest.Mock).mockResolvedValue(false);

    const res = await POST(
      makeRequest({ targetUserId: TARGET, action: "unblock" }),
    );

    expect(res.status).toBe(404);
  });

  it("rejects unknown actions", async () => {
    const res = await POST(
      makeRequest({ targetUserId: TARGET, action: "obliterate" }),
    );

    expect(res.status).toBe(400);
  });
});
