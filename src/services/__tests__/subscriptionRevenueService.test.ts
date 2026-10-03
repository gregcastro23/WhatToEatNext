/**
 * @jest-environment node
 *
 * Tests for getSubscriptionRevenueBreakdown — the single source of truth for
 * "what counts as real subscription revenue". The rule under test: MRR is
 * derived ONLY from Stripe-backed subs. The retired premium tier is not read at
 * all (owner ruling 2026-09-28); counting it once made the admin dashboard
 * report a fabricated $22.6k MRR off 944 comp subs.
 */

const mockExecuteQuery = jest.fn();

jest.mock("@/lib/database", () => ({
  executeQuery: (...a: unknown[]) => mockExecuteQuery(...a),
}));

import {
  getSubscriptionRevenueBreakdown,
  PREMIUM_MONTHLY_PRICE_USD,
} from "@/services/subscriptionRevenueService";

describe("getSubscriptionRevenueBreakdown", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("derives MRR from Stripe-backed subs only, and never reads the retired tier", async () => {
    mockExecuteQuery.mockResolvedValueOnce({
      rows: [{ paid: 3 }],
    });

    const result = await getSubscriptionRevenueBreakdown();

    expect(result.paidSubs).toBe(3);
    expect(result.mrr).toBe(3 * PREMIUM_MONTHLY_PRICE_USD);
    expect(result).not.toHaveProperty("provisionedSubs");
    expect(String(mockExecuteQuery.mock.calls[0]?.[0])).not.toMatch(/\btier\b/);
  });

  it("reports $0 MRR when nobody is paying", async () => {
    mockExecuteQuery.mockResolvedValueOnce({
      rows: [{ paid: 0 }],
    });

    const result = await getSubscriptionRevenueBreakdown();

    expect(result.paidSubs).toBe(0);
    expect(result.mrr).toBe(0);
  });

  it("defaults to zeros on an empty result set", async () => {
    mockExecuteQuery.mockResolvedValueOnce({ rows: [] });

    await expect(getSubscriptionRevenueBreakdown()).resolves.toEqual({
      paidSubs: 0,
      mrr: 0,
      tokenBundlesSold: 0,
      dailyYieldsClaimed: 0,
      tokensBurned: 0,
    });
  });

  it("propagates query failures so callers can mark the panel offline (not a false $0)", async () => {
    mockExecuteQuery.mockRejectedValueOnce(new Error("connection refused"));

    await expect(getSubscriptionRevenueBreakdown()).rejects.toThrow(
      "connection refused",
    );
  });
});
