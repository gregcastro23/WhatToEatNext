/**
 * @jest-environment node
 *
 * Chart-priced ESMS charges for the formerly premium features (owner ruling
 * 2026-09-28): midpoint 3, group recommendations 5, manual insight 2, tilt
 * skillet 5, each a TOTAL split across the four axes and scaled by live
 * pricing. Operators are never charged.
 */

const mockGetBalances = jest.fn();
const mockDebitAllTokens = jest.fn();
const mockPricingContext = jest.fn();
const mockApplyPricing = jest.fn();

jest.mock("@/services/TokenEconomyService", () => ({
  tokenEconomy: {
    getBalances: (...a: unknown[]) => mockGetBalances(...a),
    debitAllTokens: (...a: unknown[]) => mockDebitAllTokens(...a),
  },
}));

jest.mock("@/lib/economy/livePricing", () => ({
  getPersonalizedPricingContext: (...a: unknown[]) => mockPricingContext(...a),
  applyPersonalizedPricing: (...a: unknown[]) => mockApplyPricing(...a),
}));

import { ADMIN_EMAILS } from "@/lib/auth/adminEmails";
import {
  collect,
  collectOrRefuse,
  quoteFeature,
  refuseIfUnaffordable,
  type FeatureQuote,
} from "@/lib/economy/featureCharge";
import { FEATURE_BASE_ESMS, type ChargedFeature } from "@/lib/economy/featurePrices";

const OPERATOR_EMAIL = ADMIN_EMAILS[1] ?? "missing-admin-email";
const MEMBER = { id: "u1", roles: ["user"], email: "member@example.com", profile: {} };
const OPERATOR = { id: "u2", roles: ["admin", "user"], email: OPERATOR_EMAIL, profile: {} };

function quoted(cost: number): FeatureQuote {
  return {
    feature: "groupRecommendations",
    exempt: false,
    cost: { spirit: cost, essence: cost, matter: cost, substance: cost },
    pricing: null,
  };
}

beforeEach(() => {
  for (const fn of [mockGetBalances, mockDebitAllTokens, mockPricingContext, mockApplyPricing]) fn.mockReset();
  mockPricingContext.mockResolvedValue({ personalized: true, multiplier: 1.2 });
  // Identity pricing, so a test can see the base basket the quote hands over.
  mockApplyPricing.mockImplementation((base: unknown) => base);
});

describe("quoteFeature", () => {
  const FEATURES: ChargedFeature[] = [
    "alchemicalMidpoint",
    "groupRecommendations",
    "dailyInsight",
    "tiltSkillet",
  ];

  it.each(FEATURES)(
    "splits the %s base total evenly across the four axes",
    async (feature) => {
      const quote = await quoteFeature(MEMBER, feature);
      const each = FEATURE_BASE_ESMS[feature] / 4;
      expect(quote.exempt).toBe(false);
      expect(quote.cost).toEqual({ spirit: each, essence: each, matter: each, substance: each });
      expect(mockApplyPricing).toHaveBeenCalledTimes(1);
    },
  );

  it("pins the owner's base totals", () => {
    expect(FEATURE_BASE_ESMS).toEqual({
      alchemicalMidpoint: 3,
      groupRecommendations: 5,
      dailyInsight: 2,
      tiltSkillet: 5,
    });
  });

  it("exempts an operator without pricing anything", async () => {
    const quote = await quoteFeature(OPERATOR, "alchemicalMidpoint");
    expect(quote.exempt).toBe(true);
    expect(quote.cost).toEqual({ spirit: 0, essence: 0, matter: 0, substance: 0 });
    expect(mockPricingContext).not.toHaveBeenCalled();
  });

  it("does not exempt the admin role without an allowlisted email", async () => {
    const quote = await quoteFeature({ ...MEMBER, roles: ["admin", "user"] }, "dailyInsight");
    expect(quote.exempt).toBe(false);
  });
});

describe("refuseIfUnaffordable", () => {
  it("passes when every axis covers its share", async () => {
    mockGetBalances.mockResolvedValue({ spirit: 2, essence: 2, matter: 2, substance: 2 });
    await expect(refuseIfUnaffordable("u1", quoted(1.25))).resolves.toBeNull();
  });

  it("answers 402 when any one axis falls short, even if the total would cover it", async () => {
    mockGetBalances.mockResolvedValue({ spirit: 100, essence: 100, matter: 100, substance: 1 });
    const res = await refuseIfUnaffordable("u1", quoted(1.25));
    expect(res?.status).toBe(402);
    expect(await res?.json()).toEqual(expect.objectContaining({ success: false, reason: "insufficient_tokens" }));
  });

  it("never reads the balance for an exempt quote", async () => {
    await expect(refuseIfUnaffordable("u2", { ...quoted(0), exempt: true })).resolves.toBeNull();
    expect(mockGetBalances).not.toHaveBeenCalled();
  });
});

describe("collect / collectOrRefuse", () => {
  it("debits the quoted basket as one purchase, with the idempotency key", async () => {
    mockDebitAllTokens.mockResolvedValue({ success: true, transactionGroupId: "grp-9", balances: {} });
    const result = await collect("u1", quoted(1.25), "daily_insight:n1");
    expect(result).toEqual({ paid: true, transactionGroupId: "grp-9" });
    expect(mockDebitAllTokens).toHaveBeenCalledWith(
      "u1",
      { spirit: 1.25, essence: 1.25, matter: 1.25, substance: 1.25 },
      "purchase",
      expect.objectContaining({ idempotencyKey: "daily_insight:n1" }),
    );
  });

  it("never debits an exempt quote", async () => {
    await expect(collect("u2", { ...quoted(0), exempt: true })).resolves.toEqual({ paid: true, transactionGroupId: null });
    expect(mockDebitAllTokens).not.toHaveBeenCalled();
  });

  it.each([
    ["insufficient_funds", 402],
    ["already_applied", 409],
    ["debit_failed", 503],
  ])("turns a %s refusal into a %d response", async (reason, status) => {
    mockDebitAllTokens.mockResolvedValue({ success: false, reason });
    const res = await collectOrRefuse("u1", quoted(1));
    expect(res?.status).toBe(status);
  });

  it("returns null once paid, so the route sends its result", async () => {
    mockDebitAllTokens.mockResolvedValue({ success: true, transactionGroupId: "grp-1", balances: {} });
    await expect(collectOrRefuse("u1", quoted(1))).resolves.toBeNull();
  });
});
