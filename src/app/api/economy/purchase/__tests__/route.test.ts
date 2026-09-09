/**
 * SECURITY REGRESSION: POST /api/economy/purchase must not accept an
 * unauthenticated caller's own ?userId= as identity. It previously did
 * (query-param fallback in getUserIdFromRequest -> getDatabaseUserFromRequest),
 * which let anyone spend another user's ESMS balance just by knowing their UUID.
 *
 * Phase 27: runtime boundary validation with EconomyPurchaseRequestSchema.
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
  applyPersonalizedPricing: jest.fn((cost) => cost),
  getPersonalizedPricingContext: jest.fn().mockResolvedValue({ multiplier: 1, personalized: false }),
  applyLivePricing: jest.fn((cost) => cost),
  getLivePricingContext: jest.fn(),
}));

const mockGetShopItem = jest.fn();
const mockPurchaseShopItem = jest.fn();
jest.mock("@/services/TokenEconomyService", () => ({
  tokenEconomy: {
    getShopItem: (...args: unknown[]) => mockGetShopItem(...args),
    purchaseShopItem: (...args: unknown[]) => mockPurchaseShopItem(...args),
  },
}));

jest.mock("@/utils/astrology/chartDataUtils", () => ({ getCapitalizedNatalPositions: jest.fn().mockReturnValue({}) }));

import { __resetValidateRequestTestLoaders, __setValidateRequestTestLoaders } from "@/lib/auth/validateRequest";
import { POST } from "../route";

function makeRequest(url: string, body: unknown, throwOnJson = false): any {
  return {
    url,
    method: "POST",
    nextUrl: { pathname: "/api/economy/purchase" },
    headers: { get: () => null },
    cookies: { get: () => undefined },
    json: async () => {
      if (throwOnJson) throw new Error("Invalid JSON");
      return body;
    },
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

  it("400s on malformed JSON body", async () => {
    auth.mockResolvedValue({ user: { id: "u-123", email: "test@example.com" } });
    userDb.getUserById.mockResolvedValue({ id: "u-123", email: "test@example.com", profile: {} });

    const res = await POST(makeRequest("http://localhost/api/economy/purchase", null, true));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toBe("Invalid request body");
  });

  it("400s when shopItemSlug is missing or empty", async () => {
    auth.mockResolvedValue({ user: { id: "u-123", email: "test@example.com" } });
    userDb.getUserById.mockResolvedValue({ id: "u-123", email: "test@example.com", profile: {} });

    const res = await POST(makeRequest("http://localhost/api/economy/purchase", {}));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toBe("shopItemSlug is required");
    expect(body.details).toHaveProperty("shopItemSlug");
  });

  it("200s on valid { shopItemSlug } matching in-repo caller", async () => {
    auth.mockResolvedValue({ user: { id: "u-123", email: "test@example.com" } });
    userDb.getUserById.mockResolvedValue({ id: "u-123", email: "test@example.com", profile: {} });

    mockGetShopItem.mockResolvedValue({
      slug: "recipe-card-theme",
      title: "Recipe Card Theme",
      isActive: true,
      costSpirit: 10,
      costEssence: 0,
      costMatter: 0,
      costSubstance: 0,
    });

    mockPurchaseShopItem.mockResolvedValue({
      success: true,
      balances: { spirit: 90, essence: 100, matter: 100, substance: 100 },
      transactionGroupId: "grp-123",
    });

    const res = await POST(
      makeRequest("http://localhost/api/economy/purchase", { shopItemSlug: "recipe-card-theme" }),
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.message).toContain("Recipe Card Theme");
    expect(mockPurchaseShopItem).toHaveBeenCalledWith(
      "u-123",
      "recipe-card-theme",
      expect.objectContaining({
        overrideCosts: { spirit: 10, essence: 0, matter: 0, substance: 0 },
      }),
    );
  });
});
