/**
 * Tests for `defaultRateLimitTier` (Item 3) — verifies that mint-time
 * tier defaulting maps a user's subscription to the correct
 * api_keys.rate_limit_tier value, and falls through safely when the
 * subscription lookup fails.
 */

jest.mock("@/services/subscriptionService", () => ({
  subscriptionService: {
    getUserSubscription: jest.fn(),
  },
}));

import { defaultRateLimitTier } from "@/lib/api-keys/queries";
import { subscriptionService } from "@/services/subscriptionService";

const mockedGetSub = subscriptionService.getUserSubscription as jest.MockedFunction<
  typeof subscriptionService.getUserSubscription
>;

const USER_ID = "11111111-1111-1111-1111-111111111111";

describe("defaultRateLimitTier", () => {
  beforeEach(() => {
    mockedGetSub.mockReset();
  });

  it("returns alchemist for premium subscriptions", async () => {
    mockedGetSub.mockResolvedValueOnce({
      id: "s1",
      userId: USER_ID,
      tier: "premium",
      status: "active",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      currentPeriodStart: "2026-05-01",
      currentPeriodEnd: "2026-05-31",
      cancelAtPeriodEnd: false,
      createdAt: "2026-05-01",
      updatedAt: "2026-05-01",
    });
    await expect(defaultRateLimitTier(USER_ID)).resolves.toBe("alchemist");
  });

  it("returns apprentice for free subscriptions", async () => {
    mockedGetSub.mockResolvedValueOnce({
      id: "s1",
      userId: USER_ID,
      tier: "free",
      status: "active",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      currentPeriodStart: "2026-05-01",
      currentPeriodEnd: "2026-05-31",
      cancelAtPeriodEnd: false,
      createdAt: "2026-05-01",
      updatedAt: "2026-05-01",
    });
    await expect(defaultRateLimitTier(USER_ID)).resolves.toBe("apprentice");
  });

  it("falls back to authenticated when subscription is null", async () => {
    mockedGetSub.mockResolvedValueOnce(null);
    await expect(defaultRateLimitTier(USER_ID)).resolves.toBe("authenticated");
  });

  it("falls back to authenticated when subscription lookup throws", async () => {
    mockedGetSub.mockRejectedValueOnce(new Error("db down"));
    await expect(defaultRateLimitTier(USER_ID)).resolves.toBe("authenticated");
  });
});
