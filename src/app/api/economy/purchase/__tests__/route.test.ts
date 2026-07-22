/**
 * SECURITY REGRESSION: POST /api/economy/purchase must not accept an
 * unauthenticated caller's own ?userId= as identity. It previously did
 * (query-param fallback in getUserIdFromRequest -> getDatabaseUserFromRequest),
 * which let anyone spend another user's ESMS balance just by knowing their UUID.
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
jest.mock("@/lib/economy/livePricing", () => ({
  applyPersonalizedPricing: jest.fn(),
  getPersonalizedPricingContext: jest.fn(),
  applyLivePricing: jest.fn(),
  getLivePricingContext: jest.fn(),
}));
jest.mock("@/services/TokenEconomyService", () => ({ tokenEconomy: {} }));
jest.mock("@/utils/astrology/chartDataUtils", () => ({ getCapitalizedNatalPositions: jest.fn() }));

import { __resetValidateRequestTestLoaders, __setValidateRequestTestLoaders } from "@/lib/auth/validateRequest";
import { POST } from "../route";

function makeRequest(url: string, body: unknown): any {
  return {
    url,
    method: "POST",
    nextUrl: { pathname: "/api/economy/purchase" },
    headers: { get: () => null },
    cookies: { get: () => undefined },
    json: async () => body,
  };
}

describe("POST /api/economy/purchase", () => {
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

  it("401s an unauthenticated request carrying only ?userId=, before any spend", async () => {
    const res = await POST(
      makeRequest(
        "http://localhost/api/economy/purchase?userId=00000000-0000-4000-8000-000000000000",
        { shopItemSlug: "some-item" },
      ),
    );

    expect(res.status).toBe(401);
    expect(userDb.getUserById).not.toHaveBeenCalled();
  });
});
