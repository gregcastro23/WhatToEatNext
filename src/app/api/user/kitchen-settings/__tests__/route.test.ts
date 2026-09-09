/**
 * Route handler tests for /api/user/kitchen-settings (GET, POST).
 *
 * @file src/app/api/user/kitchen-settings/__tests__/route.test.ts
 */

jest.mock("@/lib/auth/validateRequest", () => ({
  getDatabaseUserFromRequest: jest.fn(),
}));

jest.mock("@/services/kitchenSettingsService", () => ({
  persistKitchenSettings: jest.fn(),
  getKitchenSettings: jest.fn(),
}));

import { NextRequest } from "next/server";
import { GET, POST } from "../route";
import { UserRole } from "@/lib/auth/roles";
import { getDatabaseUserFromRequest } from "@/lib/auth/validateRequest";
import { persistKitchenSettings, getKitchenSettings } from "@/services/kitchenSettingsService";
import type { UserWithProfile } from "@/services/userDatabaseService";

const mockedGetUser = jest.mocked(getDatabaseUserFromRequest);
const mockedPersist = jest.mocked(persistKitchenSettings);
const mockedGet = jest.mocked(getKitchenSettings);

const USER_ID = "77777777-7777-7777-7777-777777777777";

function makeTestUser(): UserWithProfile {
  return {
    id: USER_ID,
    email: "user@example.com",
    roles: [UserRole.USER],
    isActive: true,
    createdAt: new Date().toISOString(),
    profile: {
      userId: USER_ID,
      name: "Test User",
      preferences: {},
    },
  };
}

function makeNextRequest(url: string, method = "GET", json?: unknown): NextRequest {
  return new NextRequest(url, {
    method,
    headers: { "content-type": "application/json" },
    body: json !== undefined ? JSON.stringify(json) : undefined,
  });
}

beforeEach(() => {
  mockedGetUser.mockReset();
  mockedPersist.mockReset();
  mockedGet.mockReset();
});

describe("GET /api/user/kitchen-settings", () => {
  it("401s when unauthenticated", async () => {
    mockedGetUser.mockResolvedValueOnce(null);
    const res = await GET(makeNextRequest("http://localhost:3000/api/user/kitchen-settings"));
    expect(res.status).toBe(401);
  });

  it("returns settings on success", async () => {
    mockedGetUser.mockResolvedValueOnce(makeTestUser());
    mockedGet.mockResolvedValueOnce({
      kitchenElevationM: 100,
      kitchenElevationBasis: null,
      kitchenSettings: null,
      updatedAt: new Date().toISOString(),
    });

    const res = await GET(makeNextRequest("http://localhost:3000/api/user/kitchen-settings"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.settings.kitchenElevationM).toBe(100);
  });
});

describe("POST /api/user/kitchen-settings", () => {
  it("401s when unauthenticated", async () => {
    mockedGetUser.mockResolvedValueOnce(null);
    const res = await POST(makeNextRequest("http://localhost:3000/api/user/kitchen-settings", "POST", { kitchenElevationM: 50 }));
    expect(res.status).toBe(401);
  });

  it("400s on invalid JSON body", async () => {
    mockedGetUser.mockResolvedValueOnce(makeTestUser());
    const res = await POST(
      new NextRequest("http://localhost:3000/api/user/kitchen-settings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "not json",
      }),
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.message).toBe("Invalid JSON body");
  });

  it("400s when elevation is out of range", async () => {
    mockedGetUser.mockResolvedValueOnce(makeTestUser());
    const res = await POST(makeNextRequest("http://localhost:3000/api/user/kitchen-settings", "POST", { kitchenElevationM: 15000 }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.message).toContain("kitchenElevationM must be a number");
  });

  it("saves kitchen settings successfully", async () => {
    mockedGetUser.mockResolvedValueOnce(makeTestUser());
    mockedPersist.mockResolvedValueOnce({
      kitchenElevationM: 250,
      kitchenElevationBasis: null,
      kitchenSettings: null,
      updatedAt: new Date().toISOString(),
    });

    const res = await POST(makeNextRequest("http://localhost:3000/api/user/kitchen-settings", "POST", { kitchenElevationM: 250 }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(mockedPersist).toHaveBeenCalled();
  });
});
