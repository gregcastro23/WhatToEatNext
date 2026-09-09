/**
 * Route handler tests for POST /api/adept-table.
 *
 * @file src/app/api/adept-table/__tests__/route.test.ts
 */

jest.mock("@/lib/auth/validateRequest", () => ({
  getDatabaseUserFromRequest: jest.fn(),
}));

jest.mock("@/lib/rateLimit", () => ({
  rateLimit: jest.fn().mockResolvedValue({ allowed: true }),
}));

jest.mock("@/services/groupNatalChartService", () => ({
  calculateCompositeNatalChart: jest.fn().mockReturnValue({
    id: "composite-1",
    name: "Composite Chart",
    alchemicalProperties: {
      Spirit: 25,
      Essence: 25,
      Matter: 25,
      Substance: 25,
    },
    elementalProperties: {
      Fire: 25,
      Water: 25,
      Air: 25,
      Earth: 25,
    },
  }),
}));

jest.mock("@/services/LocalRecipeService", () => ({
  LocalRecipeService: {
    getAllRecipes: jest.fn().mockResolvedValue([
      {
        id: "recipe-1",
        name: "Sun Soup",
        alchemical_properties: {
          Spirit: 30,
          Essence: 20,
          Matter: 25,
          Substance: 25,
        },
      },
    ]),
  },
}));

import { NextRequest } from "next/server";
import { POST } from "../route";
import { UserRole } from "@/lib/auth/roles";
import { getDatabaseUserFromRequest } from "@/lib/auth/validateRequest";
import type { UserWithProfile } from "@/services/userDatabaseService";

const mockGetUser = jest.mocked(getDatabaseUserFromRequest);

function makeTestUser(): UserWithProfile {
  return {
    id: "user-test-id",
    email: "test@example.com",
    roles: [UserRole.USER],
    isActive: true,
    createdAt: new Date().toISOString(),
    profile: {
      userId: "user-test-id",
      name: "Test User",
      preferences: {},
    },
  };
}

function makeRequest(body?: unknown): NextRequest {
  return new NextRequest("http://localhost:3000/api/adept-table", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

beforeEach(() => {
  mockGetUser.mockReset();
  mockGetUser.mockResolvedValue(makeTestUser());
});

describe("POST /api/adept-table", () => {
  it("401s when unauthenticated", async () => {
    mockGetUser.mockResolvedValueOnce(null);
    const res = await POST(makeRequest({ hostData: {}, friendData: {} }));
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe("Authentication required to compute composite charts.");
  });

  it("400s when body is invalid JSON or non-object", async () => {
    const req = new NextRequest("http://localhost:3000/api/adept-table", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "not-json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe("Missing birth data for Host or Friend.");
  });

  it("400s when hostData or friendData is missing", async () => {
    const res = await POST(makeRequest({ hostData: { birthData: {} } }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe("Missing birth data for Host or Friend.");
  });

  it("200s on valid payload and computes composite chart recommendations", async () => {
    const res = await POST(
      makeRequest({
        hostData: { birthData: { year: 1990 } },
        friendData: { birthData: { year: 1992 } },
      }),
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.compositeChart).toBeDefined();
    expect(data.recipes).toBeDefined();
  });
});
