/**
 * Tests for POST /api/economy/practice
 *
 * Covers:
 * - 401 unauthenticated
 * - 400 malformed JSON
 * - 400 missing or invalid practice type
 * - 400 server-only practice type
 * - 200 positive test with no targetId key (e.g. feed_visit)
 * - 200 positive test with targetId (e.g. recommendation_acted)
 */
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      status: init?.status ?? 200,
      json: async () => body,
    })),
  },
}));

jest.mock("@/lib/rateLimit", () => ({
  rateLimit: jest.fn().mockResolvedValue({ allowed: true }),
}));

const mockRecognize = jest.fn();
const mockDiscoveredSurfaces = jest.fn();
jest.mock("@/services/practiceRewardService", () => ({
  practiceRewardService: {
    recognize: (...args: unknown[]) => mockRecognize(...args),
    discoveredSurfaces: (...args: unknown[]) => mockDiscoveredSurfaces(...args),
  },
}));

const mockGetUser = jest.fn();
jest.mock("@/lib/auth/validateRequest", () => ({
  getDatabaseUserFromRequest: (...args: unknown[]) => mockGetUser(...args),
}));

import { POST } from "../route";

function makeRequest(body: unknown, throwOnJson = false): any {
  return {
    url: "http://localhost/api/economy/practice",
    method: "POST",
    headers: { get: () => null },
    cookies: { get: () => undefined },
    json: async () => {
      if (throwOnJson) throw new Error("Invalid JSON");
      return body;
    },
  };
}

describe("POST /api/economy/practice", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({ id: "user-123", email: "user@example.com" });
  });

  it("401s when unauthenticated", async () => {
    mockGetUser.mockResolvedValue(null);
    const res = await POST(makeRequest({ type: "feed_visit" }));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.message).toBe("Authentication required");
  });

  it("400s on malformed JSON", async () => {
    const res = await POST(makeRequest(null, true));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toBe("Invalid JSON body");
  });

  it("400s on missing or invalid practice type", async () => {
    const resMissing = await POST(makeRequest({}));
    expect(resMissing.status).toBe(400);
    const bodyMissing = await resMissing.json();
    expect(bodyMissing.message).toBe("Invalid request body");
    expect(bodyMissing.details).toHaveProperty("type");

    const resInvalid = await POST(makeRequest({ type: "non_existent_practice" }));
    expect(resInvalid.status).toBe(400);
    const bodyInvalid = await resInvalid.json();
    expect(bodyInvalid.message).toBe("Invalid request body");
  });

  it("400s on server-only practice type (e.g. cooked_recipe)", async () => {
    const res = await POST(makeRequest({ type: "cooked_recipe", targetId: "recipe-123" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.rewarded).toBe(false);
    expect(body.reason).toBe("invalid");
    expect(mockRecognize).not.toHaveBeenCalled();
  });

  it("200s on valid practice without targetId key (e.g. feed_visit)", async () => {
    mockRecognize.mockResolvedValue({
      rewarded: true,
      reason: "rewarded",
      tokenType: "Spirit",
      amount: 1,
      hint: "The celestial currents greet your return",
      balances: { spirit: 10, essence: 5, matter: 5, substance: 5 },
    });

    const res = await POST(makeRequest({ type: "feed_visit" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.rewarded).toBe(true);
    expect(body.amount).toBe(1);
    expect(mockRecognize).toHaveBeenCalledWith("user-123", "feed_visit", undefined);
  });

  it("200s on valid practice with targetId (e.g. recommendation_acted)", async () => {
    mockRecognize.mockResolvedValue({
      rewarded: true,
      reason: "rewarded",
      tokenType: "Matter",
      amount: 2,
      hint: "Your path resonates with the recipe",
      balances: { spirit: 10, essence: 5, matter: 7, substance: 5 },
    });

    const res = await POST(
      makeRequest({ type: "recommendation_acted", targetId: "recipe-456" }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.rewarded).toBe(true);
    expect(mockRecognize).toHaveBeenCalledWith("user-123", "recommendation_acted", "recipe-456");
  });
});
