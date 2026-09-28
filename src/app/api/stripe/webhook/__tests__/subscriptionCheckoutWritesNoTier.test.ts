/**
 * @jest-environment node
 *
 * A subscription-mode checkout must not grant a tier. The subscription tier is
 * retired and exempts no one from the ESMS economy (owner ruling 2026-09-28),
 * but this branch wrote `metadata.tier ?? "premium"` into the user's
 * subscription row. No WTEN route opens a subscription-mode checkout, so the
 * branch only sees checkouts made elsewhere on the shared Stripe account. It
 * still records the customer, subscription and period, which billing reads.
 */

const mockConstructEvent = jest.fn();
const mockSubscriptionsRetrieve = jest.fn();
const mockExecuteQuery = jest.fn();
const mockGetOrCreateSubscription = jest.fn();
const mockUpdateSubscription = jest.fn();

jest.mock("@/lib/stripe/stripe", () => ({
  getStripe: () => ({
    webhooks: { constructEvent: (...a: unknown[]) => mockConstructEvent(...a) },
    subscriptions: { retrieve: (...a: unknown[]) => mockSubscriptionsRetrieve(...a) },
  }),
}));

jest.mock("@/lib/database/connection", () => ({
  executeQuery: (...a: unknown[]) => mockExecuteQuery(...a),
}));

jest.mock("@/services/subscriptionService", () => ({
  subscriptionService: {
    getOrCreateSubscription: (...a: unknown[]) => mockGetOrCreateSubscription(...a),
    updateSubscription: (...a: unknown[]) => mockUpdateSubscription(...a),
  },
}));

import { POST } from "@/app/api/stripe/webhook/route";

const PERIOD_START = 1_790_000_000;
const PERIOD_END = 1_792_592_000;

function subscriptionCheckout(metadata: Record<string, string>): Record<string, unknown> {
  return {
    id: "cs_test_sub_1",
    mode: "subscription",
    status: "complete",
    payment_status: "paid",
    customer: "cus_1",
    subscription: "sub_1",
    metadata,
  };
}

function request(): Request {
  return new Request("https://alchm.kitchen/api/stripe/webhook", {
    method: "POST",
    headers: { "stripe-signature": "sig_test" },
    body: "{}",
  });
}

function onlyUpdate(): unknown {
  expect(mockUpdateSubscription).toHaveBeenCalledTimes(1);
  const [userId, updates] = mockUpdateSubscription.mock.calls[0] ?? [];
  expect(userId).toBe("user-1");
  return updates;
}

beforeEach(() => {
  jest.clearAllMocks();
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
  mockExecuteQuery.mockResolvedValue({ rows: [] });
  mockGetOrCreateSubscription.mockResolvedValue({ tier: "free" });
  mockUpdateSubscription.mockResolvedValue(null);
  mockSubscriptionsRetrieve.mockResolvedValue({
    id: "sub_1",
    items: { data: [{ current_period_start: PERIOD_START, current_period_end: PERIOD_END }] },
  });
});

describe("checkout.session.completed in subscription mode", () => {
  it.each([
    ["no tier in the metadata (the old default was premium)", { userId: "user-1" }],
    ["an explicit premium tier in the metadata", { userId: "user-1", tier: "premium" }],
  ])("writes no tier for %s", async (_label, metadata) => {
    mockConstructEvent.mockReturnValue({
      id: "evt_sub_1",
      type: "checkout.session.completed",
      data: { object: subscriptionCheckout(metadata) },
    });

    const res = await POST(request());

    expect(res.status).toBe(200);
    const updates = onlyUpdate();
    expect(updates).not.toHaveProperty("tier");
    expect(updates).toEqual({
      status: "active",
      stripeCustomerId: "cus_1",
      stripeSubscriptionId: "sub_1",
      currentPeriodStart: new Date(PERIOD_START * 1000).toISOString(),
      currentPeriodEnd: new Date(PERIOD_END * 1000).toISOString(),
    });
  });
});
