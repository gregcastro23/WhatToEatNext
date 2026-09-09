/**
 * Route handler tests for PATCH /api/user/dietary-preferences.
 *
 * @file src/app/api/user/dietary-preferences/__tests__/route.test.ts
 */

jest.mock("@/lib/auth/validateRequest", () => ({
  getDatabaseUserFromRequest: jest.fn(),
}));

jest.mock("@/lib/database/connection", () => ({
  executeQuery: jest.fn(),
}));

import { NextRequest } from "next/server";
import { PATCH } from "../route";
import { UserRole } from "@/lib/auth/roles";
import { getDatabaseUserFromRequest } from "@/lib/auth/validateRequest";
import { executeQuery } from "@/lib/database/connection";
import type { UserWithProfile } from "@/services/userDatabaseService";

const mockedGetUser = jest.mocked(getDatabaseUserFromRequest);
const mockedExecuteQuery = jest.mocked(executeQuery);

const USER_ID = "66666666-6666-6666-6666-666666666666";

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

function makeNextRequest(json?: unknown): NextRequest {
  return new NextRequest("http://localhost:3000/api/user/dietary-preferences", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: json !== undefined ? JSON.stringify(json) : undefined,
  });
}

beforeEach(() => {
  mockedGetUser.mockReset();
  mockedExecuteQuery.mockReset();
});

describe("PATCH /api/user/dietary-preferences", () => {
  it("401s when unauthenticated", async () => {
    mockedGetUser.mockResolvedValueOnce(null);
    const res = await PATCH(makeNextRequest({ preferences: ["vegan"] }));
    expect(res.status).toBe(401);
  });

  it("400s on invalid JSON body", async () => {
    mockedGetUser.mockResolvedValueOnce(makeTestUser());
    const res = await PATCH(
      new NextRequest("http://localhost:3000/api/user/dietary-preferences", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: "not json",
      }),
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.message).toBe("Invalid JSON body");
  });

  it("400s when preferences field is missing", async () => {
    mockedGetUser.mockResolvedValueOnce(makeTestUser());
    const res = await PATCH(makeNextRequest({}));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.message).toContain("preferences");
  });

  it("updates preferences successfully", async () => {
    mockedGetUser.mockResolvedValueOnce(makeTestUser());
    mockedExecuteQuery.mockResolvedValueOnce({
      rows: [],
      rowCount: 1,
      command: "UPDATE",
      oid: 0,
      fields: [],
    });

    const res = await PATCH(makeNextRequest({ preferences: { allergies: ["peanuts"] } }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.preferences).toEqual({ allergies: ["peanuts"] });
    expect(mockedExecuteQuery).toHaveBeenCalled();
  });
});
