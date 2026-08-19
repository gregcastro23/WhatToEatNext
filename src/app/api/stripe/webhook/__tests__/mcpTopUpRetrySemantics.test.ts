/**
 * @jest-environment node
 *
 * Proves the link the MCP top-up fix depends on: what the ROUTE answers when
 * the credit does not land.
 *
 * The handler decides whether to throw, but throwing is only useful if it
 * reaches Stripe as a non-2xx — Stripe retries a delivery for up to three days
 * while the endpoint answers non-2xx, and settles the event permanently the
 * moment it sees a 2xx. The handler unit tests assert the throw; nothing
 * asserted that the throw actually becomes a retryable response, so a change
 * to the route's catch block could silently convert every transient credit
 * failure back into a permanent token loss.
 *
 * These tests drive the real route handler with synthetic Stripe events.
 */

const mockConstructEvent = jest.fn();
const creditMultipleTokensDetailed = jest.fn();

jest.mock("@/lib/stripe/stripe", () => ({
  getStripe: () => ({
    webhooks: { constructEvent: (...a: unknown[]) => mockConstructEvent(...a) },
  }),
}));

jest.mock("@/services/TokenEconomyService", () => {
  const actual = jest.requireActual("@/services/TokenEconomyService");
  return {
    tokenEconomy: { creditMultipleTokensDetailed },
    // The real permanent-vs-transient classifier, so this suite and the
    // handler's own tests cannot drift apart on what counts as permanent.
    isMissingUserFailure: actual.isMissingUserFailure,
  };
});

jest.mock("@/services/subscriptionService", () => ({ subscriptionService: {} }));

jest.mock("@/lib/logger", () => ({
  _logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));

import { POST } from "@/app/api/stripe/webhook/route";

const USER_ID = "55555555-5555-5555-5555-555555555555";

const ENV_KEYS = [
  "STRIPE_MCP_TOP_UP_5_PRICE_ID",
  "STRIPE_MCP_TOP_UP_20_PRICE_ID",
  "STRIPE_MCP_TOP_UP_50_PRICE_ID",
] as const;

function topUpEvent() {
  return {
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_top_up_1",
        mode: "payment",
        status: "complete",
        payment_status: "paid",
        metadata: {
          purpose: "mcp_top_up",
          userId: USER_ID,
          sku: "mcp_top_up_20",
        },
      },
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

let errorSpy: jest.SpyInstance;
let logSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
  for (const k of ENV_KEYS) process.env[k] = `price_${k.toLowerCase()}`;
  mockConstructEvent.mockReturnValue(topUpEvent());
  errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
  delete process.env.STRIPE_WEBHOOK_SECRET;
  for (const k of ENV_KEYS) delete process.env[k];
  errorSpy.mockRestore();
  logSpy.mockRestore();
});

describe("MCP top-up — what Stripe is told when the credit fails", () => {
  it("answers non-2xx on a transient credit failure, so Stripe retries", async () => {
    creditMultipleTokensDetailed.mockResolvedValue({
      status: "failed",
      code: "40P01",
      constraint: null,
      message: "deadlock detected",
    });

    const res = await POST(request());

    // The exact code matters less than the class: anything outside 2xx keeps
    // the event in Stripe's retry schedule. A 2xx here would permanently
    // settle an event whose tokens were never credited.
    expect(res.status).toBeGreaterThanOrEqual(300);
    // Guards against a vacuous pass: a non-2xx caused by anything BEFORE the
    // credit (bad signature, a missing mock) would prove nothing about the
    // retry semantics. The credit has to have actually been attempted.
    expect(creditMultipleTokensDetailed).toHaveBeenCalledTimes(1);
  });

  it("answers 2xx on a permanent failure, so Stripe stops retrying", async () => {
    creditMultipleTokensDetailed.mockResolvedValue({
      status: "failed",
      code: "23503",
      constraint: "token_transactions_user_id_fkey",
      message: "no such user",
    });

    const res = await POST(request());

    // Retrying for three days cannot make the user exist. The event is settled
    // and the operator is told instead.
    expect(res.status).toBe(200);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("PAID, NOT CREDITED"),
    );
  });

  it("answers 2xx once the credit lands", async () => {
    creditMultipleTokensDetailed.mockResolvedValue({
      status: "credited",
      balances: { spirit: 250, essence: 250, matter: 250, substance: 250 },
      written: 4,
      requested: 4,
    });

    const res = await POST(request());

    expect(res.status).toBe(200);
    expect(creditMultipleTokensDetailed).toHaveBeenCalledTimes(1);
  });

  it("answers 2xx on a redelivery that was already credited", async () => {
    creditMultipleTokensDetailed.mockResolvedValue({
      status: "replayed",
      balances: { spirit: 250, essence: 250, matter: 250, substance: 250 },
    });

    const res = await POST(request());

    expect(res.status).toBe(200);
  });
});
