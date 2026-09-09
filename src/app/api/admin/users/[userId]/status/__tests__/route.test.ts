/**
 * Route handler tests for PATCH /api/admin/users/[userId]/status.
 *
 * @file src/app/api/admin/users/[userId]/status/__tests__/route.test.ts
 */

jest.mock("@/lib/auth/validateRequest", () => ({
  validateAdminRequest: jest.fn(),
}));

jest.mock("@/services/userDatabaseService", () => ({
  userDatabase: {
    getUserById: jest.fn(),
    activateUser: jest.fn(),
    deactivateUser: jest.fn(),
  },
}));

import { NextRequest, NextResponse } from "next/server";
import { PATCH } from "../route";
import { UserRole } from "@/lib/auth/roles";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { userDatabase } from "@/services/userDatabaseService";
import type { UserWithProfile } from "@/services/userDatabaseService";

const mockValidateAdminRequest = jest.mocked(validateAdminRequest);
const mockGetUserById = jest.mocked(userDatabase.getUserById);
const mockActivateUser = jest.mocked(userDatabase.activateUser);
const mockDeactivateUser = jest.mocked(userDatabase.deactivateUser);

const ADMIN_ID = "11111111-1111-1111-1111-111111111111";
const TARGET_ID = "22222222-2222-2222-2222-222222222222";

function makeTargetUser(overrides: Partial<UserWithProfile> = {}): UserWithProfile {
  return {
    id: TARGET_ID,
    email: "target@example.com",
    roles: [UserRole.USER],
    isActive: true,
    createdAt: new Date().toISOString(),
    profile: {
      userId: TARGET_ID,
      name: "Target User",
      preferences: {},
    },
    ...overrides,
  };
}

function makeStatusRequest(userId: string, body?: unknown): NextRequest {
  return new NextRequest(`http://localhost:3000/api/admin/users/${userId}/status`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

beforeEach(() => {
  mockValidateAdminRequest.mockReset();
  mockGetUserById.mockReset();
  mockActivateUser.mockReset();
  mockDeactivateUser.mockReset();

  mockValidateAdminRequest.mockResolvedValue({
    user: {
      userId: ADMIN_ID,
      email: "admin@alchm.kitchen",
      roles: ["admin"],
    },
  });
});

describe("PATCH /api/admin/users/[userId]/status", () => {
  it("returns auth error if not admin", async () => {
    mockValidateAdminRequest.mockResolvedValueOnce({
      error: NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 },
      ),
    });

    const res = await PATCH(makeStatusRequest(TARGET_ID, { isActive: true }), {
      params: Promise.resolve({ userId: TARGET_ID }),
    });
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.message).toBe("Admin access required");
  });

  it("400s on invalid JSON or missing isActive boolean", async () => {
    const res = await PATCH(makeStatusRequest(TARGET_ID, { isActive: "yes" }), {
      params: Promise.resolve({ userId: TARGET_ID }),
    });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.message).toBe("isActive boolean is required");
  });

  it("404s when target user not found", async () => {
    mockGetUserById.mockResolvedValueOnce(null);

    const res = await PATCH(makeStatusRequest(TARGET_ID, { isActive: true }), {
      params: Promise.resolve({ userId: TARGET_ID }),
    });
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.message).toBe("User not found");
  });

  it("403s when attempting to deactivate an admin", async () => {
    mockGetUserById.mockResolvedValueOnce(
      makeTargetUser({ roles: [UserRole.ADMIN] }),
    );

    const res = await PATCH(makeStatusRequest(TARGET_ID, { isActive: false }), {
      params: Promise.resolve({ userId: TARGET_ID }),
    });
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.message).toBe("Cannot deactivate admin users");
  });

  it("200s and activates user", async () => {
    mockGetUserById.mockResolvedValueOnce(makeTargetUser({ isActive: false }));
    mockActivateUser.mockResolvedValueOnce();

    const res = await PATCH(makeStatusRequest(TARGET_ID, { isActive: true }), {
      params: Promise.resolve({ userId: TARGET_ID }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.user.isActive).toBe(true);
    expect(mockActivateUser).toHaveBeenCalledWith(TARGET_ID);
  });

  it("200s and deactivates regular user", async () => {
    mockGetUserById.mockResolvedValueOnce(makeTargetUser({ isActive: true }));
    mockDeactivateUser.mockResolvedValueOnce();

    const res = await PATCH(makeStatusRequest(TARGET_ID, { isActive: false }), {
      params: Promise.resolve({ userId: TARGET_ID }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.user.isActive).toBe(false);
    expect(mockDeactivateUser).toHaveBeenCalledWith(TARGET_ID);
  });
});
