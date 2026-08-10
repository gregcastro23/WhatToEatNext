/**
 * @jest-environment node
 *
 * Delayed-settlement (crypto) restaurant orders.
 *
 * Card payments settle during the Checkout redirect, so `checkout.session.
 * completed` already carries `payment_status: "paid"`. Crypto does NOT: Stripe
 * finishes the session as UNPAID and reports the real outcome minutes-to-hours
 * later on `checkout.session.async_payment_succeeded` / `…_failed`.
 *
 * Handling only `completed` left paid crypto orders written as
 * `payment_pending` / `waiting_for_paid_status` — a state NOTHING in the
 * codebase read. Terminal: the customer was charged, the Connect transfer to
 * the restaurant never ran, and fulfillment never fired because
 * `claimOrderForFulfillment` only claims rows at `status = 'paid'`.
 *
 * These tests drive the real route handler with synthetic Stripe events.
 */

const mockConstructEvent = jest.fn();
const mockTransfersCreate = jest.fn();
const mockPaymentIntentsRetrieve = jest.fn();
const mockExecuteQuery = jest.fn();
const mockTriggerOrderFulfillment = jest.fn();

jest.mock("@/lib/stripe/stripe", () => ({
  getStripe: () => ({
    webhooks: { constructEvent: (...a: unknown[]) => mockConstructEvent(...a) },
    transfers: { create: (...a: unknown[]) => mockTransfersCreate(...a) },
    paymentIntents: {
      retrieve: (...a: unknown[]) => mockPaymentIntentsRetrieve(...a),
    },
  }),
}));

jest.mock("@/lib/database/connection", () => ({
  executeQuery: (...a: unknown[]) => mockExecuteQuery(...a),
}));

jest.mock("@/lib/orders/fulfillment", () => ({
  triggerOrderFulfillment: (...a: unknown[]) => mockTriggerOrderFulfillment(...a),
}));

jest.mock("@/services/subscriptionService", () => ({
  subscriptionService: {},
}));

import { POST } from "@/app/api/stripe/webhook/route";

const ORDER_ID = "order_abc123";
const CONNECTED_ACCOUNT = "acct_restaurant_1";

function cryptoSession(paymentStatus: string) {
  return {
    id: "cs_test_crypto_1",
    mode: "payment",
    status: "complete",
    payment_status: paymentStatus,
    payment_intent: "pi_crypto_1",
    metadata: {
      purpose: "restaurant_order",
      orderId: ORDER_ID,
      splitMode: "separate_charges_and_transfers",
      stripeConnectedAccountId: CONNECTED_ACCOUNT,
      transferAmountCents: "4200",
      transferGroup: `restaurant_order_${ORDER_ID}`,
      restaurantName: "Test Kitchen",
      provider: "test",
    },
  };
}

function request() {
  return new Request("https://alchm.kitchen/api/stripe/webhook", {
    method: "POST",
    headers: { "stripe-signature": "sig_test" },
    body: "{}",
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
  mockExecuteQuery.mockResolvedValue({ rows: [] });
  mockTriggerOrderFulfillment.mockResolvedValue(undefined);
  mockTransfersCreate.mockResolvedValue({ id: "tr_1" });
  mockPaymentIntentsRetrieve.mockResolvedValue({
    id: "pi_crypto_1",
    currency: "usd",
    latest_charge: { id: "ch_1", payment_method_details: { type: "crypto" } },
  });
});

/** The UPDATE statement's bound parameters, for the single order write. */
function orderUpdateParams(): unknown[] | null {
  const call = mockExecuteQuery.mock.calls.find(
    (c) => typeof c[0] === "string" && c[0].includes("restaurant_order_intents"),
  );
  return call ? (call[1] as unknown[]) : null;
}

describe("checkout.session.async_payment_succeeded — the event that was missing", () => {
  beforeEach(() => {
    mockConstructEvent.mockReturnValue({
      type: "checkout.session.async_payment_succeeded",
      data: { object: cryptoSession("paid") },
    });
  });

  // NB: this asserts only that the handler does not error. It does NOT prove
  // the event is handled — the `default` branch also returns 200, so this test
  // passes even with the async case deleted. The three below are the ones that
  // actually pin the behaviour.
  it("does not error — returns 2xx so Stripe stops retrying", async () => {
    const res = await POST(request());
    expect(res.status).toBe(200);
  });

  it("advances the order to paid instead of leaving it pending", async () => {
    await POST(request());
    const params = orderUpdateParams();
    expect(params).not.toBeNull();
    expect(params?.[1]).toBe("paid");
    // The state the old code wrote and nothing ever read.
    expect(params?.[1]).not.toBe("payment_pending");
  });

  it("pays the restaurant — creates the Connect transfer", async () => {
    await POST(request());
    expect(mockTransfersCreate).toHaveBeenCalledTimes(1);
    const [body, options] = mockTransfersCreate.mock.calls[0];
    expect(body).toMatchObject({
      amount: 4200,
      destination: CONNECTED_ACCOUNT,
      source_transaction: "ch_1",
    });
    // Redelivery is safe: Stripe delivers at least once.
    expect(options).toEqual({
      idempotencyKey: `restaurant_order_transfer_${ORDER_ID}`,
    });
  });

  it("triggers fulfillment, which the pending state never reached", async () => {
    await POST(request());
    expect(mockTriggerOrderFulfillment).toHaveBeenCalledWith(ORDER_ID);
  });
});

describe("checkout.session.async_payment_failed", () => {
  beforeEach(() => {
    mockConstructEvent.mockReturnValue({
      type: "checkout.session.async_payment_failed",
      data: { object: cryptoSession("unpaid") },
    });
  });

  it("marks the order failed rather than leaving it mid-flight", async () => {
    const res = await POST(request());
    expect(res.status).toBe(200);
    expect(orderUpdateParams()?.[1]).toBe("payment_failed");
  });

  it("moves no money and fulfils nothing", async () => {
    await POST(request());
    expect(mockTransfersCreate).not.toHaveBeenCalled();
    expect(mockTriggerOrderFulfillment).not.toHaveBeenCalled();
  });
});

describe("checkout.session.completed still behaves correctly", () => {
  it("a crypto session that has NOT settled yet stays pending, moving no money", async () => {
    mockConstructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: { object: cryptoSession("unpaid") },
    });

    await POST(request());
    expect(orderUpdateParams()?.[1]).toBe("payment_pending");
    expect(mockTransfersCreate).not.toHaveBeenCalled();
    expect(mockTriggerOrderFulfillment).not.toHaveBeenCalled();
  });

  it("a card session that HAS settled pays out inline, exactly as before", async () => {
    mockConstructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: { object: cryptoSession("paid") },
    });

    await POST(request());
    expect(orderUpdateParams()?.[1]).toBe("paid");
    expect(mockTransfersCreate).toHaveBeenCalledTimes(1);
    expect(mockTriggerOrderFulfillment).toHaveBeenCalledWith(ORDER_ID);
  });
});

describe("signature handling", () => {
  it("rejects a request with no stripe-signature header", async () => {
    const res = await POST(
      new Request("https://alchm.kitchen/api/stripe/webhook", {
        method: "POST",
        body: "{}",
      }),
    );
    expect(res.status).toBe(400);
    expect(mockConstructEvent).not.toHaveBeenCalled();
  });

  it("returns non-2xx when the signature does not verify, so Stripe retries", async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error("No signatures found matching the expected signature");
    });
    const res = await POST(request());
    expect(res.status).not.toBe(200);
    expect(mockExecuteQuery).not.toHaveBeenCalled();
  });
});

describe("control — the mocks are wired, so 'not called' means blocked", () => {
  it("proves executeQuery and constructEvent are reachable", async () => {
    mockConstructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: { object: cryptoSession("paid") },
    });
    await POST(request());
    expect(mockConstructEvent).toHaveBeenCalledTimes(1);
    expect(mockExecuteQuery).toHaveBeenCalled();
  });
});
