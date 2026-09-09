/**
 * Tests for POST /api/economy/transmute
 *
 * Covers:
 * - 401 unauthenticated
 * - 400 malformed JSON
 * - 400 missing fields
 * - 400 invalid token type
 * - 400 self-transmutation
 * - 400 string amount ("5") and non-positive amount
 * - 200 successful transmutation
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

const mockTransmute = jest.fn();
jest.mock("@/services/TokenEconomyService", () => ({
  tokenEconomy: {
    transmute: (...args: unknown[]) => mockTransmute(...args),
  },
}));

const mockGetUserId = jest.fn();
jest.mock("@/lib/auth/validateRequest", () => ({
  getUserIdFromRequest: (...args: unknown[]) => mockGetUserId(...args),
}));

import { POST } from "../route";

function makeRequest(body: unknown, throwOnJson = false): any {
  return {
    url: "http://localhost/api/economy/transmute",
    method: "POST",
    headers: { get: () => null },
    cookies: { get: () => undefined },
    json: async () => {
      if (throwOnJson) throw new Error("Invalid JSON");
      return body;
    },
  };
}

describe("POST /api/economy/transmute", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserId.mockResolvedValue("user-123");
  });

  it("401s when unauthenticated", async () => {
    mockGetUserId.mockResolvedValue(null);
    const res = await POST(makeRequest({ fromToken: "Spirit", toToken: "Matter", amount: 1 }));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.message).toBe("Authentication required");
  });

  it("400s on malformed JSON", async () => {
    const res = await POST(makeRequest(null, true));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toBe("Invalid request body");
  });

  it("400s when required fields are missing", async () => {
    const res = await POST(makeRequest({ fromToken: "Spirit" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toBe("fromToken, toToken, and amount are required");
    expect(body.details).toBeDefined();
  });

  it("400s on invalid token type", async () => {
    const res = await POST(makeRequest({ fromToken: "Fire", toToken: "Matter", amount: 1 }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toBe("Invalid token type. Must be Spirit, Essence, Matter, or Substance.");
  });

  it("400s on self-transmutation", async () => {
    const res = await POST(makeRequest({ fromToken: "Spirit", toToken: "Spirit", amount: 1 }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toBe("Cannot transmute a token into itself.");
  });

  it("400s when amount is a string (e.g. '5')", async () => {
    const res = await POST(makeRequest({ fromToken: "Spirit", toToken: "Matter", amount: "5" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toBe("Amount must be a positive number");
  });

  it("400s when amount is zero or negative", async () => {
    const resZero = await POST(makeRequest({ fromToken: "Spirit", toToken: "Matter", amount: 0 }));
    expect(resZero.status).toBe(400);
    const bodyZero = await resZero.json();
    expect(bodyZero.message).toBe("Amount must be a positive number");

    const resNeg = await POST(makeRequest({ fromToken: "Spirit", toToken: "Matter", amount: -2 }));
    expect(resNeg.status).toBe(400);
  });

  it("200s on valid transmutation", async () => {
    mockTransmute.mockResolvedValue({
      fromToken: "Spirit",
      toToken: "Matter",
      fromAmount: 3,
      toAmount: 1,
      balances: { spirit: 97, essence: 100, matter: 101, substance: 100 },
    });

    const res = await POST(
      makeRequest({ fromToken: "Spirit", toToken: "Matter", amount: 1 }),
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.message).toContain("Transmutation complete");
    expect(mockTransmute).toHaveBeenCalledWith("user-123", "Spirit", "Matter", 1);
  });
});
