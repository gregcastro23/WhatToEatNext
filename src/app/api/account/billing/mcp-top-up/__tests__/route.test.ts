/**
 * Route handler tests for POST /api/account/billing/mcp-top-up.
 *
 * Mocks Stripe + the subscription service + the auth resolver so the
 * test only exercises the route's validation, SKU lookup, and Stripe
 * session metadata wiring.
 */

jest.mock("@/lib/auth/validateRequest", () => ({
  getUserIdFromRequest: jest.fn(),
}));

jest.mock("@/lib/rateLimit", () => ({
  rateLimit: jest
    .fn()
    .mockResolvedValue({ allowed: true, remaining: 100, resetMs: 60_000 }),
}));

const createSession = jest.fn();

jest.mock("@/lib/stripe/stripe", () => ({
  getStripe: () => ({
    checkout: {
      sessions: {
        create: createSession,
      },
    },
  }),
}));

jest.mock("@/services/subscriptionService", () => ({
  subscriptionService: {
    getOrCreateSubscription: jest
      .fn()
      .mockResolvedValue({ stripeCustomerId: "cus_test_123" }),
  },
}));

// Re-import after the env vars are set in beforeEach — mcpTopUp reads
// the price ids lazily so the SKUs become available on demand.
import { POST } from "@/app/api/account/billing/mcp-top-up/route";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import type { NextRequest } from "next/server";

const mockedGetUserId = getUserIdFromRequest as jest.MockedFunction<
  typeof getUserIdFromRequest
>;

const USER_ID = "44444444-4444-4444-4444-444444444444";

function makeRequest(json: unknown): NextRequest {
  return new Request("http://x/api/account/billing/mcp-top-up", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(json),
  }) as unknown as NextRequest;
}

beforeEach(() => {
  mockedGetUserId.mockReset();
  createSession.mockReset();
  process.env.STRIPE_MCP_TOP_UP_5_PRICE_ID = "price_starter";
  process.env.STRIPE_MCP_TOP_UP_20_PRICE_ID = "price_builder";
  process.env.STRIPE_MCP_TOP_UP_50_PRICE_ID = "price_adept";
});

afterEach(() => {
  delete process.env.STRIPE_MCP_TOP_UP_5_PRICE_ID;
  delete process.env.STRIPE_MCP_TOP_UP_20_PRICE_ID;
  delete process.env.STRIPE_MCP_TOP_UP_50_PRICE_ID;
});

describe("POST /api/account/billing/mcp-top-up", () => {
  it("401s when not authenticated", async () => {
    mockedGetUserId.mockResolvedValueOnce(null);
    const res = await POST(makeRequest({ sku: "mcp_top_up_5" }));
    expect(res.status).toBe(401);
  });

  it("400s on unknown sku", async () => {
    mockedGetUserId.mockResolvedValueOnce(USER_ID);
    const res = await POST(makeRequest({ sku: "totally-not-a-sku" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/Unknown sku/);
  });

  it("400s on invalid JSON body", async () => {
    mockedGetUserId.mockResolvedValueOnce(USER_ID);
    const res = await POST(
      new Request("http://x/api/account/billing/mcp-top-up", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "not json",
      }) as unknown as NextRequest,
    );
    expect(res.status).toBe(400);
  });

  it("503s when the SKU has no configured Stripe price id", async () => {
    delete process.env.STRIPE_MCP_TOP_UP_50_PRICE_ID;
    mockedGetUserId.mockResolvedValueOnce(USER_ID);
    const res = await POST(makeRequest({ sku: "mcp_top_up_50" }));
    expect(res.status).toBe(503);
  });

  it("creates a one-shot Checkout session with mcp_top_up metadata", async () => {
    mockedGetUserId.mockResolvedValueOnce(USER_ID);
    createSession.mockResolvedValueOnce({
      id: "cs_test_abc",
      url: "https://checkout.stripe.test/abc",
    });
    const res = await POST(makeRequest({ sku: "mcp_top_up_20" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.url).toBe("https://checkout.stripe.test/abc");
    expect(body.sku).toBe("mcp_top_up_20");
    expect(body.esmsPerAxis).toBe(250);

    expect(createSession).toHaveBeenCalledTimes(1);
    const args = createSession.mock.calls[0][0];
    expect(args.mode).toBe("payment");
    expect(args.line_items).toEqual([{ price: "price_builder", quantity: 1 }]);
    expect(args.metadata).toEqual({
      purpose: "mcp_top_up",
      sku: "mcp_top_up_20",
      userId: USER_ID,
      esmsPerAxis: "250",
    });
    expect(args.success_url).toMatch(/sku=mcp_top_up_20/);
    expect(args.cancel_url).toMatch(/canceled/);
  });

  it("500s when Stripe throws", async () => {
    mockedGetUserId.mockResolvedValueOnce(USER_ID);
    createSession.mockRejectedValueOnce(new Error("stripe down"));
    const res = await POST(makeRequest({ sku: "mcp_top_up_5" }));
    expect(res.status).toBe(500);
  });
});
