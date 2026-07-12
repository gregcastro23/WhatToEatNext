/**
 * @jest-environment node
 *
 * PATCH /api/notifications/[id]/join-request — status action route (PR 6
 * adversarial-review fix). Auth required; body must be 'actioned' or
 * 'dismissed'; delegates ownership/type scoping to
 * notificationDatabase.updateJoinRequestStatus.
 */

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({ status: init?.status ?? 200, json: async () => body })),
  },
}));

const mockGetUserId = jest.fn();
jest.mock("@/lib/auth/validateRequest", () => ({
  getUserIdFromRequest: (...args: unknown[]) => mockGetUserId(...args),
}));

const mockUpdateStatus = jest.fn();
jest.mock("@/services/notificationDatabaseService", () => ({
  notificationDatabase: {
    updateJoinRequestStatus: (...args: unknown[]) => mockUpdateStatus(...args),
  },
}));

import { PATCH as patchJoinRequest } from "../route";

const HOST = "10000000-0000-0000-0000-000000000001"; // da Vinci

function req(body: unknown): any {
  return {
    url: "http://localhost/api/notifications/n1/join-request",
    method: "PATCH",
    json: async () => body,
    headers: { get: () => null },
  };
}
function params(id: string) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  mockGetUserId.mockReset();
  mockUpdateStatus.mockReset();
});

describe("PATCH /api/notifications/[id]/join-request", () => {
  it("requires authentication", async () => {
    mockGetUserId.mockResolvedValue(null);
    const res = await patchJoinRequest(req({ status: "actioned" }), params("n1"));
    expect(res.status).toBe(401);
    expect(mockUpdateStatus).not.toHaveBeenCalled();
  });

  it("rejects an invalid status value", async () => {
    mockGetUserId.mockResolvedValue(HOST);
    const res = await patchJoinRequest(req({ status: "bogus" }), params("n1"));
    expect(res.status).toBe(400);
    expect(mockUpdateStatus).not.toHaveBeenCalled();
  });

  it("delegates to updateJoinRequestStatus with the caller's id and returns 200 on success", async () => {
    mockGetUserId.mockResolvedValue(HOST);
    mockUpdateStatus.mockResolvedValue(true);
    const res = await patchJoinRequest(req({ status: "actioned" }), params("n1"));
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockUpdateStatus).toHaveBeenCalledWith("n1", HOST, "actioned");
  });

  it("returns 404 when the notification is missing or not owned by the caller", async () => {
    mockGetUserId.mockResolvedValue(HOST);
    mockUpdateStatus.mockResolvedValue(false);
    const res = await patchJoinRequest(req({ status: "dismissed" }), params("n1"));
    expect(res.status).toBe(404);
  });
});
