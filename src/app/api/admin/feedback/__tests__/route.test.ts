/**
 * PATCH /api/admin/feedback — closed-loop admin feedback triage tests.
 *
 * @file src/app/api/admin/feedback/__tests__/route.test.ts
 */

jest.mock("@/lib/auth/validateRequest", () => ({
  validateAdminRequest: jest.fn(),
}));
jest.mock("@/services/admin/trafficAnalyticsService", () => ({
  updateSessionFeedbackStatus: jest.fn(),
}));

import { NextRequest, NextResponse } from "next/server";
import { PATCH } from "../route";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { updateSessionFeedbackStatus } from "@/services/admin/trafficAnalyticsService";

const mockAuth = jest.mocked(validateAdminRequest);
const mockUpdate = jest.mocked(updateSessionFeedbackStatus);

function patchReq(body: unknown): NextRequest {
  return new NextRequest("https://alchm.kitchen/api/admin/feedback", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("PATCH /api/admin/feedback", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth.mockResolvedValue({
      user: {
        userId: "admin-1",
        email: "admin@alchm.kitchen",
        roles: ["admin"],
        scopes: [],
        iat: 0,
        exp: 0,
        iss: "test",
      },
    });
  });

  it("enforces admin authentication", async () => {
    mockAuth.mockResolvedValueOnce({
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    });
    const res = await PATCH(patchReq({ id: "12", status: "resolved" }));
    expect(res.status).toBe(401);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("rejects malformed payloads with 400", async () => {
    const res = await PATCH(patchReq({ id: "not-a-number", status: "unknown" }));
    expect(res.status).toBe(400);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns 404 when the feedback item does not exist", async () => {
    mockUpdate.mockResolvedValueOnce(null);
    const res = await PATCH(patchReq({ id: 999, status: "resolved" }));
    expect(res.status).toBe(404);
  });

  it("transitions open feedback to resolved with resolvedAt timestamp", async () => {
    mockUpdate.mockResolvedValueOnce({
      id: "42",
      status: "resolved",
      resolvedAt: "2026-11-16T12:00:00.000Z",
    });

    const res = await PATCH(patchReq({ id: "42", status: "resolved" }));
    expect(res.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith("42", "resolved");
    const body: unknown = await res.json();
    expect(body).toEqual({
      success: true,
      feedback: {
        id: "42",
        status: "resolved",
        resolvedAt: "2026-11-16T12:00:00.000Z",
      },
    });
  });
});
