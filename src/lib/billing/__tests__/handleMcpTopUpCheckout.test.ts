/**
 * Tests for the MCP top-up webhook handler.
 *
 * Stripe + token economy are mocked at module boundaries — the test
 * asserts the handler's *outcome* and the exact shape of the credit
 * call (especially the idempotency key, which is the load-bearing
 * piece preventing double-credits on webhook retries).
 *
 * The failure cases are the point of this suite. Stripe has already taken the
 * customer's money before the handler runs, so reporting success on a credit
 * that rolled back loses paid-for tokens with no later chance to fix it — the
 * handler answering 2xx is what tells Stripe to stop retrying. Each
 * `CreditResult` status therefore gets an explicit test.
 */

const creditMultipleTokensDetailed = jest.fn();
const loggerError = jest.fn();
const loggerWarn = jest.fn();

// Mocked so the assertions read the exact call, and so `@/lib/logger` does not
// drag `@/services/LoggingService` into this suite.
jest.mock("@/lib/logger", () => ({
  _logger: {
    error: loggerError,
    warn: loggerWarn,
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

jest.mock("@/services/TokenEconomyService", () => {
  const actual = jest.requireActual("@/services/TokenEconomyService");
  return {
    tokenEconomy: { creditMultipleTokensDetailed },
    // Deliberately the REAL classifier. Whether a failure is permanent (no
    // such user → give up) or transient (→ let Stripe retry) is the decision
    // under test; a stub here would assert the test's own opinion of SQLSTATE
    // mapping rather than the production one.
    isMissingUserFailure: actual.isMissingUserFailure,
  };
});

import { handleMcpTopUpCheckout } from "@/lib/billing/handleMcpTopUpCheckout";

const ENV_KEYS = [
  "STRIPE_MCP_TOP_UP_5_PRICE_ID",
  "STRIPE_MCP_TOP_UP_20_PRICE_ID",
  "STRIPE_MCP_TOP_UP_50_PRICE_ID",
] as const;

const USER_ID = "55555555-5555-5555-5555-555555555555";

const BALANCES = { spirit: 250, essence: 250, matter: 250, substance: 250 };

/** A successful 4-axis credit. */
const CREDITED = {
  status: "credited",
  balances: BALANCES,
  written: 4,
  requested: 4,
} as const;

beforeEach(() => {
  creditMultipleTokensDetailed.mockReset();
  creditMultipleTokensDetailed.mockResolvedValue(CREDITED);
  loggerError.mockReset();
  loggerWarn.mockReset();
  for (const k of ENV_KEYS) process.env[k] = `price_${k.toLowerCase()}`;
});

afterEach(() => {
  for (const k of ENV_KEYS) delete process.env[k];
});

const paidSession = (id: string, sku = "mcp_top_up_20") => ({
  id,
  payment_status: "paid",
  metadata: { userId: USER_ID, sku },
});

describe("handleMcpTopUpCheckout", () => {
  it("skips when payment is not paid yet", async () => {
    const result = await handleMcpTopUpCheckout({
      id: "cs_pending",
      payment_status: "unpaid",
      metadata: { userId: USER_ID, sku: "mcp_top_up_20" },
    });
    expect(result.outcome).toBe("pending-payment");
    expect(creditMultipleTokensDetailed).not.toHaveBeenCalled();
  });

  it("skips when metadata is missing required fields", async () => {
    const result = await handleMcpTopUpCheckout({
      id: "cs_no_meta",
      payment_status: "paid",
      metadata: {},
    });
    expect(result.outcome).toBe("missing-metadata");
    expect(creditMultipleTokensDetailed).not.toHaveBeenCalled();
  });

  it("skips when the sku is unknown", async () => {
    const result = await handleMcpTopUpCheckout({
      id: "cs_bad_sku",
      payment_status: "paid",
      metadata: { userId: USER_ID, sku: "not_a_real_sku" },
    });
    expect(result.outcome).toBe("unknown-sku");
    expect(result.sku).toBe("not_a_real_sku");
    expect(creditMultipleTokensDetailed).not.toHaveBeenCalled();
  });

  it("credits 4 axes for a paid mcp_top_up_5 session", async () => {
    const result = await handleMcpTopUpCheckout(paidSession("cs_5", "mcp_top_up_5"));
    expect(result.outcome).toBe("credited");
    expect(creditMultipleTokensDetailed).toHaveBeenCalledTimes(1);
    const args = creditMultipleTokensDetailed.mock.calls[0];
    expect(args[0]).toBe(USER_ID);
    expect(args[1]).toEqual([
      { tokenType: "Spirit", amount: 50 },
      { tokenType: "Essence", amount: 50 },
      { tokenType: "Matter", amount: 50 },
      { tokenType: "Substance", amount: 50 },
    ]);
    expect(args[2]).toBe("mcp_top_up");
    expect(args[3]).toMatchObject({
      sourceId: "mcp_top_up_5",
      // The idempotency key is the Stripe session id namespaced — this is
      // the load-bearing piece that prevents double-credit on retries.
      idempotencyKey: "mcp_top_up:cs_5",
    });
  });

  it("scales credits with the SKU tier", async () => {
    await handleMcpTopUpCheckout(paidSession("cs_50", "mcp_top_up_50"));
    expect(creditMultipleTokensDetailed.mock.calls[0][1]).toEqual([
      { tokenType: "Spirit", amount: 750 },
      { tokenType: "Essence", amount: 750 },
      { tokenType: "Matter", amount: 750 },
      { tokenType: "Substance", amount: 750 },
    ]);
  });

  it("reports a redelivered session as replayed, not as a fresh credit", async () => {
    creditMultipleTokensDetailed.mockResolvedValueOnce({
      status: "replayed",
      balances: BALANCES,
    });
    const result = await handleMcpTopUpCheckout(paidSession("cs_replay"));
    // Distinct from "credited": nothing was written this time. The tokens are
    // already in the balance, so this is success, and Stripe must get a 2xx.
    expect(result.outcome).toBe("replayed");
  });

  it("logs but still reports credited when only some axes were written", async () => {
    creditMultipleTokensDetailed.mockResolvedValueOnce({
      status: "credited",
      balances: BALANCES,
      written: 2,
      requested: 4,
    });
    const result = await handleMcpTopUpCheckout(paidSession("cs_partial"));
    expect(result.outcome).toBe("credited");
    // Error level on purpose: `_logger.warn` is a no-op in production, and an
    // uneven bundle is only reachable against a real database.
    expect(loggerError).toHaveBeenCalledWith(
      expect.stringContaining("2/4 axes written"),
    );
  });

  // ─── The defect this suite exists to pin ───

  it("NEVER reports credited when the transaction rolled back", async () => {
    // The original bug: the credit's return value was discarded and the
    // handler returned `credited` unconditionally. Stripe saw 200, never
    // retried, and the paid-for tokens were gone.
    creditMultipleTokensDetailed.mockResolvedValueOnce({
      status: "failed",
      code: "40P01",
      constraint: null,
      message: "deadlock detected",
    });
    await expect(
      handleMcpTopUpCheckout(paidSession("cs_rollback")),
    ).rejects.toThrow(/deadlock detected/);
  });

  it("throws on a transient failure so Stripe retries the delivery", async () => {
    creditMultipleTokensDetailed.mockResolvedValueOnce({
      status: "failed",
      code: null,
      constraint: null,
      message: "connection terminated unexpectedly",
    });
    await expect(
      handleMcpTopUpCheckout(paidSession("cs_conn")),
    ).rejects.toThrow(/connection terminated unexpectedly/);
  });

  it("propagates a thrown DB error rather than swallowing it", async () => {
    creditMultipleTokensDetailed.mockRejectedValueOnce(new Error("db unavailable"));
    await expect(
      handleMcpTopUpCheckout(paidSession("cs_failure")),
    ).rejects.toThrow("db unavailable");
  });

  it.each([
    ["23503", "token_transactions_user_id_fkey", "FK violation on the user"],
    ["22P02", null, "malformed user id"],
  ])(
    "returns credit-failed WITHOUT throwing for a permanent failure (%s — %s)",
    async (code, constraint) => {
      creditMultipleTokensDetailed.mockResolvedValueOnce({
        status: "failed",
        code,
        constraint,
        message: "no such user",
      });
      // Permanent: retrying for three days cannot conjure the user into
      // existing. Stripe gets a 2xx and the operator gets a loud log.
      const result = await handleMcpTopUpCheckout(paidSession("cs_no_user"));
      expect(result.outcome).toBe("credit-failed");
      expect(result.userId).toBe(USER_ID);
      expect(loggerError).toHaveBeenCalledWith(
        expect.stringContaining("PAID BUT NOT CREDITED"),
      );
    },
  );

  it("retries (throws) on a 23503 whose constraint is NOT a user FK", async () => {
    // Same SQLSTATE as the permanent case, different constraint — this one is
    // not evidence the user is missing, so it must not be given up on.
    creditMultipleTokensDetailed.mockResolvedValueOnce({
      status: "failed",
      code: "23503",
      constraint: "token_transactions_some_other_fkey",
      message: "fk violation elsewhere",
    });
    await expect(
      handleMcpTopUpCheckout(paidSession("cs_other_fk")),
    ).rejects.toThrow(/fk violation elsewhere/);
  });
});
