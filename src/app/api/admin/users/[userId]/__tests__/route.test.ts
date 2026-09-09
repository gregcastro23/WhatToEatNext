/**
 * Route handler tests for /api/admin/users/[userId].
 *
 * @file src/app/api/admin/users/[userId]/__tests__/route.test.ts
 */

jest.mock("@/lib/auth/validateRequest", () => ({
  validateAdminRequest: jest.fn(),
}));

jest.mock("@/services/userDatabaseService", () => ({
  userDatabase: {
    getUserById: jest.fn(),
    updateUserRole: jest.fn(),
    deactivateUser: jest.fn(),
  },
}));

jest.mock("@/services/subscriptionService", () => ({
  subscriptionService: {
    getOrCreateSubscription: jest.fn(),
    updateSubscription: jest.fn(),
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
const mockUpdateUserRole = jest.mocked(userDatabase.updateUserRole);

const ADMIN_ID = "11111111-1111-1111-1111-111111111111";
const TARGET_ID = "22222222-2222-2222-2222-222222222222";

function makeAdminUser(): UserWithProfile {
  return {
    id: ADMIN_ID,
    email: "admin@alchm.kitchen",
    roles: [UserRole.ADMIN, UserRole.USER],
    isActive: true,
    createdAt: new Date().toISOString(),
    profile: {
      userId: ADMIN_ID,
      name: "Admin User",
      preferences: {},
    },
  };
}

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

function makePatchRequest(userId: string, body?: unknown): NextRequest {
  return new NextRequest(`http://localhost:3000/api/admin/users/${userId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

beforeEach(() => {
  mockValidateAdminRequest.mockReset();
  mockGetUserById.mockReset();
  mockUpdateUserRole.mockReset();

  mockValidateAdminRequest.mockResolvedValue({
    user: {
      userId: ADMIN_ID,
      email: "admin@alchm.kitchen",
      roles: ["admin"],
    },
  });
});

describe("PATCH /api/admin/users/[userId]", () => {
  it("returns auth error if not admin", async () => {
    mockValidateAdminRequest.mockResolvedValueOnce({
      error: NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 },
      ),
    });

    const res = await PATCH(makePatchRequest(TARGET_ID, { role: "ADMIN" }), {
      params: Promise.resolve({ userId: TARGET_ID }),
    });
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.message).toBe("Admin access required");
  });

  it("400s on invalid JSON body", async () => {
    const req = new NextRequest(`http://localhost:3000/api/admin/users/${TARGET_ID}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: "not-json",
    });

    const res = await PATCH(req, {
      params: Promise.resolve({ userId: TARGET_ID }),
    });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.message).toBe("Invalid JSON body");
  });

  it("404s when user not found", async () => {
    mockGetUserById.mockResolvedValueOnce(null);

    const res = await PATCH(makePatchRequest(TARGET_ID, { role: "ADMIN" }), {
      params: Promise.resolve({ userId: TARGET_ID }),
    });
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.message).toBe("User not found");
  });

  it("403s on self-role change attempt", async () => {
    mockGetUserById.mockResolvedValueOnce(makeAdminUser());

    const res = await PATCH(makePatchRequest(ADMIN_ID, { role: "USER" }), {
      params: Promise.resolve({ userId: ADMIN_ID }),
    });
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.message).toBe("Cannot change your own role");
  });

  it("403s when attempting to demote an admin", async () => {
    mockGetUserById.mockResolvedValueOnce(
      makeTargetUser({ roles: [UserRole.ADMIN] }),
    );

    const res = await PATCH(makePatchRequest(TARGET_ID, { role: "USER" }), {
      params: Promise.resolve({ userId: TARGET_ID }),
    });
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.message).toBe("Cannot demote admin users");
  });

  it("403s when attempting to deactivate an admin", async () => {
    mockGetUserById.mockResolvedValueOnce(
      makeTargetUser({ roles: [UserRole.ADMIN] }),
    );

    const res = await PATCH(makePatchRequest(TARGET_ID, { isActive: false }), {
      params: Promise.resolve({ userId: TARGET_ID }),
    });
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.message).toBe("Cannot deactivate admin users");
  });

  it("200s and updates role successfully", async () => {
    mockGetUserById.mockResolvedValueOnce(makeTargetUser());
    mockUpdateUserRole.mockResolvedValueOnce(true);

    const res = await PATCH(makePatchRequest(TARGET_ID, { role: "ADMIN" }), {
      params: Promise.resolve({ userId: TARGET_ID }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(mockUpdateUserRole).toHaveBeenCalledWith(TARGET_ID, "admin");
  });
});
