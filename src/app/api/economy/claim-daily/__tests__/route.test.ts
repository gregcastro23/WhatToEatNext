/**
 * @jest-environment node
 *
 * What the claim-daily route tells the USER when the credit does not land.
 *
 * This route rendered ANY falsy claim result as a 409 "You have already
 * claimed your Cosmic Yield today. Return tomorrow!" — including a rolled-back
 * transaction. The day was still claimable, but the user was told it was not,
 * and lost it. A 409 also reads as terminal to the client, so nothing retried.
 */

const claimDailyYield = jest.fn();
const getDatabaseUserFromRequest = jest.fn();
const getUserSubscription = jest.fn();

jest.mock("@/services/DailyYieldService", () => ({
  dailyYieldService: { claimDailyYield },
}));

jest.mock("@/lib/auth/validateRequest", () => ({
  getDatabaseUserFromRequest: (...a: unknown[]) => getDatabaseUserFromRequest(...a),
}));

jest.mock("@/lib/rateLimit", () => ({
  rateLimit: jest.fn().mockResolvedValue({ allowed: true }),
}));

jest.mock("@/services/subscriptionService", () => ({
  subscriptionService: { getUserSubscription: (...a: unknown[]) => getUserSubscription(...a) },
}));

jest.mock("@/services/feedDatabaseService", () => ({
  feedDatabase: { createEvent: jest.fn().mockResolvedValue(undefined) },
}));

jest.mock("@/utils/astrology/chartDataUtils", () => ({
  extractAlchemicalPlanetPositions: () => ({
    Sun: { sign: "leo", degree: 1, exactLongitude: 121 },
    Moon: { sign: "cancer", degree: 2, exactLongitude: 92 },
  }),
}));

import { POST } from "@/app/api/economy/claim-daily/route";
import { DegradedEphemerisError } from "@/lib/economy/discriminant-faucet";

const USER = {
  id: "55555555-5555-5555-5555-555555555555",
  profile: { natalChart: { planets: [{ name: "Sun", sign: "leo" }] } },
};

function request() {
  return new Request("https://alchm.kitchen/api/economy/claim-daily", {
    method: "POST",
  }) as never;
}

beforeEach(() => {
  jest.clearAllMocks();
  getDatabaseUserFromRequest.mockResolvedValue(USER);
  getUserSubscription.mockResolvedValue({ tier: "free", status: "active" });
});

describe("POST /api/economy/claim-daily", () => {
  it("answers 500, NOT the 409 'return tomorrow', when the credit rolled back", async () => {
    claimDailyYield.mockResolvedValue({
      status: "failed",
      code: "40P01",
      constraint: null,
      message: "deadlock detected",
    });

    const res = await POST(request());
    const body = await res.json();

    expect(res.status).toBe(500);
    // The exact wording matters: the user must not be told to come back
    // tomorrow for a yield they are still owed today.
    expect(body.message).not.toMatch(/already claimed/i);
    expect(body.message).toMatch(/try again/i);
  });

  it("still answers 409 when the day genuinely was claimed", async () => {
    claimDailyYield.mockResolvedValue({ status: "already_claimed" });

    const res = await POST(request());
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body.message).toMatch(/already claimed/i);
  });

  it("answers 200 with the yield when the credit lands", async () => {
    claimDailyYield.mockResolvedValue({
      status: "claimed",
      result: {
        totalTokens: 12.5,
        distribution: { spirit: 3, essence: 3, matter: 3, substance: 3.5 },
        resonance: { score: 2, baseline: 1.5, ratio: 1.333333 },
        breakdown: {},
        newBalances: { spirit: 10, essence: 10, matter: 10, substance: 10 },
        streakCount: 4,
      },
    });

    const res = await POST(request());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.yield.totalTokens).toBe(12.5);
    expect(claimDailyYield).toHaveBeenCalledWith(
      USER.id,
      expect.objectContaining({
        positions: expect.objectContaining({
          Sun: expect.objectContaining({ exactLongitude: 121 }),
        }),
      }),
      "main",
    );
  });

  it("answers 503 and states that nothing minted when the live sky is degraded", async () => {
    claimDailyYield.mockRejectedValue(
      new DegradedEphemerisError("Pluto:missing-longitude"),
    );

    const res = await POST(request());
    const body = await res.json();

    expect(res.status).toBe(503);
    expect(body.message).toMatch(/no tokens were minted/i);
  });
});
