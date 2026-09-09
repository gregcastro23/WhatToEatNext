/**
 * Route handler tests for POST /api/waitlist.
 *
 * @file src/app/api/waitlist/__tests__/route.test.ts
 */

jest.mock("@/services/emailService", () => ({
  default: {
    ensureInitialized: jest.fn(),
    isConfigured: jest.fn().mockReturnValue(true),
    sendWelcomeEmail: jest.fn().mockResolvedValue(true),
  },
  ensureInitialized: jest.fn(),
  isConfigured: jest.fn().mockReturnValue(true),
  sendWelcomeEmail: jest.fn().mockResolvedValue(true),
}));

jest.mock("@/services/userDatabaseService", () => ({
  userDatabase: {
    getUserByEmail: jest.fn(),
    createUser: jest.fn(),
  },
}));

import { NextRequest } from "next/server";
import { POST } from "../route";
import { UserRole } from "@/lib/auth/roles";
import emailService from "@/services/emailService";
import { userDatabase } from "@/services/userDatabaseService";
import type { UserWithProfile } from "@/services/userDatabaseService";

const mockGetUserByEmail = jest.mocked(userDatabase.getUserByEmail);
const mockCreateUser = jest.mocked(userDatabase.createUser);
const mockSendEmail = jest.mocked(emailService.sendWelcomeEmail);

const SECRET = "test-waitlist-sync-secret";

function makeTestUser(overrides: Partial<UserWithProfile> = {}): UserWithProfile {
  return {
    id: "user-123",
    email: "test@example.com",
    roles: [UserRole.USER],
    isActive: true,
    createdAt: new Date().toISOString(),
    profile: {
      userId: "user-123",
      name: "Test User",
      preferences: {},
    },
    ...overrides,
  };
}

function makeRequest(
  json?: unknown,
  headers: Record<string, string> = {},
): NextRequest {
  const reqHeaders = new Headers({
    "content-type": "application/json",
    "x-sync-secret": SECRET,
    ...headers,
  });

  return new NextRequest("http://localhost:3000/api/waitlist", {
    method: "POST",
    headers: reqHeaders,
    body: json !== undefined ? JSON.stringify(json) : undefined,
  });
}

beforeEach(() => {
  process.env.ALCHM_KITCHEN_SYNC_SECRET = SECRET;
  mockGetUserByEmail.mockReset();
  mockCreateUser.mockReset();
  mockSendEmail.mockReset();
  mockSendEmail.mockResolvedValue(true);
});

describe("POST /api/waitlist", () => {
  it("401s when unauthorized (no sync secret)", async () => {
    const req = new NextRequest("http://localhost:3000/api/waitlist", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "test@example.com" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.ok).toBe(false);
    expect(data.message).toBe("Unauthorized");
  });

  it("400s on invalid JSON or non-object body", async () => {
    const req = new NextRequest("http://localhost:3000/api/waitlist", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-sync-secret": SECRET,
      },
      body: "not-json",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.ok).toBe(false);
    expect(data.message).toBe("A valid email is required");
  });

  it("400s on invalid email format", async () => {
    const res = await POST(makeRequest({ email: "invalid-email" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.ok).toBe(false);
    expect(data.message).toBe("A valid email is required");
  });

  it("200s returning existing user without duplicate welcome email", async () => {
    mockGetUserByEmail.mockResolvedValueOnce(
      makeTestUser({
        id: "user-123",
        email: "existing@example.com",
      }),
    );

    const res = await POST(makeRequest({ email: "existing@example.com" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.created).toBe(false);
    expect(data.userId).toBe("user-123");
    expect(data.welcomeEmailSent).toBe(false);
    expect(mockCreateUser).not.toHaveBeenCalled();
  });

  it("200s and handles kiosk angle-bracket wrapped emails correctly", async () => {
    mockGetUserByEmail.mockResolvedValueOnce(null);
    mockCreateUser.mockResolvedValueOnce(
      makeTestUser({
        id: "user-kiosk-456",
        email: "kiosk@example.com",
      }),
    );

    const res = await POST(
      makeRequest({
        email: "<kiosk@example.com>",
        name: "Kiosk User",
        source: "ondeck-booth",
      }),
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.created).toBe(true);
    expect(data.userId).toBe("user-kiosk-456");
    expect(mockGetUserByEmail).toHaveBeenCalledWith("kiosk@example.com");
  });
});
