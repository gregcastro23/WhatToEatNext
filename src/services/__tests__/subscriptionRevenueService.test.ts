/**
 * @jest-environment node
 *
 * Tests for getSubscriptionRevenueBreakdown — the single source of truth for
 * "what counts as real subscription revenue". The rule under test: MRR is
 * derived ONLY from Stripe-backed subs; provisioned/agent accounts (premium
 * tier, no stripe_subscription_id) are NOT revenue. This is what stops the
 * admin dashboard from reporting a fabricated $22.6k MRR off 944 comp subs.
 */

jest.mock("@/lib/database", () => ({
  executeQuery: jest.fn(),
}));

import { executeQuery } from "@/lib/database";
import {
  getSubscriptionRevenueBreakdown,
  PREMIUM_MONTHLY_PRICE_USD,
} from "@/services/subscriptionRevenueService";

const mockExecuteQuery = executeQuery as jest.MockedFunction<
  typeof executeQuery
>;

describe("getSubscriptionRevenueBreakdown", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("derives MRR from Stripe-backed subs only — provisioned subs are not revenue", async () => {
    mockExecuteQuery.mockResolvedValueOnce({
      rows: [{ paid: 3, provisioned: 941 }],
    } as never);

    const result = await getSubscriptionRevenueBreakdown();

    expect(result.paidSubs).toBe(3);
    expect(result.provisionedSubs).toBe(941);
    expect(result.mrr).toBe(3 * PREMIUM_MONTHLY_PRICE_USD);
  });

  it("reports $0 MRR when nobody is paying, even with hundreds provisioned", async () => {
    mockExecuteQuery.mockResolvedValueOnce({
      rows: [{ paid: 0, provisioned: 944 }],
    } as never);

    const result = await getSubscriptionRevenueBreakdown();

    expect(result.paidSubs).toBe(0);
    expect(result.provisionedSubs).toBe(944);
    expect(result.mrr).toBe(0);
  });

  it("defaults to zeros on an empty result set", async () => {
    mockExecuteQuery.mockResolvedValueOnce({ rows: [] } as never);

    await expect(getSubscriptionRevenueBreakdown()).resolves.toEqual({
      paidSubs: 0,
      provisionedSubs: 0,
      mrr: 0,
    });
  });

  it("propagates query failures so callers can mark the panel offline (not a false $0)", async () => {
    mockExecuteQuery.mockRejectedValueOnce(new Error("connection refused"));

    await expect(getSubscriptionRevenueBreakdown()).rejects.toThrow(
      "connection refused",
    );
  });
});
