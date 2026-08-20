/**
 * Unit tests for POST /api/stripe/checkout-tokens
 */

import { POST } from "../route";

const authMock = jest.fn();
const rateLimitMock = jest.fn().mockResolvedValue({ allowed: true });
const customerCreateMock = jest.fn();
const sessionCreateMock = jest.fn();
const getOrCreateSubMock = jest.fn();
const updateSubMock = jest.fn();

jest.mock("@/lib/auth/auth", () => ({
  auth: () => authMock(),
}));

jest.mock("@/lib/rateLimit", () => ({
  rateLimit: (...args: unknown[]) => rateLimitMock(...args),
}));

jest.mock("@/lib/stripe/stripe", () => ({
  getStripe: () => ({
    customers: { create: customerCreateMock },
    checkout: { sessions: { create: sessionCreateMock } },
  }),
}));

jest.mock("@/services/subscriptionService", () => ({
  subscriptionService: {
    getOrCreateSubscription: (...args: unknown[]) => getOrCreateSubMock(...args),
    updateSubscription: (...args: unknown[]) => updateSubMock(...args),
  },
}));

describe("POST /api/stripe/checkout-tokens", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authMock.mockResolvedValue({
      user: { id: "user-123", email: "alchemist@alchm.kitchen" },
    });
    getOrCreateSubMock.mockResolvedValue({
      id: "sub-1",
      userId: "user-123",
      stripeCustomerId: "cus_existing123",
    });
    sessionCreateMock.mockResolvedValue({
      url: "https://checkout.stripe.com/c/pay_test_session_123",
    });
  });

  it("rejects unauthenticated callers with 401", async () => {
    authMock.mockResolvedValueOnce(null);
    const req = new Request("http://localhost:3000/api/stripe/checkout-tokens", {
      method: "POST",
      body: JSON.stringify({ sku: "initiate_box" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("rejects unknown SKU with 404", async () => {
    const req = new Request("http://localhost:3000/api/stripe/checkout-tokens", {
      method: "POST",
      body: JSON.stringify({ sku: "invalid_mystery_box" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it("creates checkout session for a valid token package", async () => {
    const req = new Request("http://localhost:3000/api/stripe/checkout-tokens", {
      method: "POST",
      body: JSON.stringify({ sku: "initiate_box" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.url).toBe("https://checkout.stripe.com/c/pay_test_session_123");
    expect(data.sku).toBe("initiate_box");
    expect(sessionCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        customer: "cus_existing123",
        mode: "payment",
        metadata: {
          purpose: "token_package",
          userId: "user-123",
          sku: "initiate_box",
        },
      }),
    );
  });
});
