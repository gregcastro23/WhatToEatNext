/**
 * SECURITY REGRESSION: GET /api/food-diary must not accept an unauthenticated
 * caller's own ?userId= as identity. It previously did (query-param fallback
 * in getUserIdFromRequest, plus a second local fallback in this route), which
 * let anyone read another user's food diary just by knowing their UUID.
 */
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      status: init?.status ?? 200,
      json: async () => body,
    })),
  },
}));

jest.mock("jose", () => ({
  jwtVerify: jest.fn(),
  errors: {
    JWTExpired: class extends Error {},
    JWSInvalid: class extends Error {},
    JWTInvalid: class extends Error {},
  },
}));

jest.mock("@/lib/rateLimit", () => ({ rateLimit: jest.fn().mockResolvedValue({ allowed: true }) }));
jest.mock("@/services/FoodDiaryService", () => ({ foodDiaryService: {} }));
jest.mock("@/services/questEventReporter", () => ({ reportQuestEventBestEffort: jest.fn() }));

import { __resetValidateRequestTestLoaders, __setValidateRequestTestLoaders } from "@/lib/auth/validateRequest";
import { GET } from "../route";

function makeRequest(url: string): any {
  return {
    url,
    method: "GET",
    nextUrl: { pathname: "/api/food-diary" },
    headers: { get: () => null },
    cookies: { get: () => undefined },
  };
}

describe("GET /api/food-diary", () => {
  const auth = jest.fn();
  const userDb = { getUserById: jest.fn(), getUserByEmail: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    auth.mockResolvedValue(null);
    __setValidateRequestTestLoaders({
      authLoader: async () => auth,
      userDatabaseLoader: async () => userDb,
    });
  });

  afterEach(() => {
    __resetValidateRequestTestLoaders();
  });

  it("401s an unauthenticated request carrying only ?userId=", async () => {
    const res = await GET(
      makeRequest(
        "http://localhost/api/food-diary?userId=00000000-0000-4000-8000-000000000000",
      ),
    );

    expect(res.status).toBe(401);
    expect(userDb.getUserById).not.toHaveBeenCalled();
  });
});
