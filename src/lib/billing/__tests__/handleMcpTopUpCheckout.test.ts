/**
 * Tests for the MCP top-up webhook handler.
 *
 * Stripe + token economy are mocked at module boundaries — the test
 * asserts the handler's *outcome* and the exact shape of the credit
 * call (especially the idempotency key, which is the load-bearing
 * piece preventing double-credits on webhook retries).
 */

const creditMultipleTokens = jest.fn();

jest.mock("@/services/TokenEconomyService", () => ({
  tokenEconomy: { creditMultipleTokens },
}));

import { handleMcpTopUpCheckout } from "@/lib/billing/handleMcpTopUpCheckout";

const ENV_KEYS = [
  "STRIPE_MCP_TOP_UP_5_PRICE_ID",
  "STRIPE_MCP_TOP_UP_20_PRICE_ID",
  "STRIPE_MCP_TOP_UP_50_PRICE_ID",
] as const;

const USER_ID = "55555555-5555-5555-5555-555555555555";

beforeEach(() => {
  creditMultipleTokens.mockReset();
  creditMultipleTokens.mockResolvedValue({
    spirit: 250,
    essence: 250,
    matter: 250,
    substance: 250,
  });
  for (const k of ENV_KEYS) process.env[k] = `price_${k.toLowerCase()}`;
});

afterEach(() => {
  for (const k of ENV_KEYS) delete process.env[k];
});

describe("handleMcpTopUpCheckout", () => {
  it("skips when payment is not paid yet", async () => {
    const result = await handleMcpTopUpCheckout({
      id: "cs_pending",
      payment_status: "unpaid",
      metadata: { userId: USER_ID, sku: "mcp_top_up_20" },
    });
    expect(result.outcome).toBe("pending-payment");
    expect(creditMultipleTokens).not.toHaveBeenCalled();
  });

  it("skips when metadata is missing required fields", async () => {
    const result = await handleMcpTopUpCheckout({
      id: "cs_no_meta",
      payment_status: "paid",
      metadata: {},
    });
    expect(result.outcome).toBe("missing-metadata");
    expect(creditMultipleTokens).not.toHaveBeenCalled();
  });

  it("skips when the sku is unknown", async () => {
    const result = await handleMcpTopUpCheckout({
      id: "cs_bad_sku",
      payment_status: "paid",
      metadata: { userId: USER_ID, sku: "not_a_real_sku" },
    });
    expect(result.outcome).toBe("unknown-sku");
    expect(result.sku).toBe("not_a_real_sku");
    expect(creditMultipleTokens).not.toHaveBeenCalled();
  });

  it("credits 4 axes for a paid mcp_top_up_5 session", async () => {
    const result = await handleMcpTopUpCheckout({
      id: "cs_5",
      payment_status: "paid",
      metadata: { userId: USER_ID, sku: "mcp_top_up_5" },
    });
    expect(result.outcome).toBe("credited");
    expect(creditMultipleTokens).toHaveBeenCalledTimes(1);
    const args = creditMultipleTokens.mock.calls[0];
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
    await handleMcpTopUpCheckout({
      id: "cs_50",
      payment_status: "paid",
      metadata: { userId: USER_ID, sku: "mcp_top_up_50" },
    });
    expect(creditMultipleTokens.mock.calls[0][1]).toEqual([
      { tokenType: "Spirit", amount: 750 },
      { tokenType: "Essence", amount: 750 },
      { tokenType: "Matter", amount: 750 },
      { tokenType: "Substance", amount: 750 },
    ]);
  });

  it("propagates errors so Stripe retries on transient DB failures", async () => {
    creditMultipleTokens.mockRejectedValueOnce(new Error("db unavailable"));
    await expect(
      handleMcpTopUpCheckout({
        id: "cs_failure",
        payment_status: "paid",
        metadata: { userId: USER_ID, sku: "mcp_top_up_20" },
      }),
    ).rejects.toThrow("db unavailable");
  });
});
