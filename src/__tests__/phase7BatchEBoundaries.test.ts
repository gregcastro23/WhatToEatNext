const executeQuery = jest.fn();
const logError = jest.fn();

jest.mock("@/lib/database", () => ({ executeQuery }));
jest.mock("@/lib/logger", () => ({
  _logger: {
    debug: jest.fn(),
    error: logError,
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

import {
  claimDailyResponseSchema,
  economyBalanceResponseSchema,
  purchaseResponseSchema,
  shopResponseSchema,
} from "@/lib/economy/clientSchemas";
import {
  getAdminUserStats,
  getRecentHumanSignups,
} from "@/services/adminStatsService";
import { recipeNftMintService } from "@/services/recipeNftMintService";

const balances = {
  spirit: 1,
  essence: 2,
  matter: 3,
  substance: 4,
  lastDailyClaimAt: null,
  lastDailyClaimAgentsAt: null,
  updatedAt: "2026-08-29T00:00:00.000Z",
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Phase 7 Batch E runtime boundaries", () => {
  it("accepts complete economy payloads and rejects malformed siblings", () => {
    const balancePayload = {
      success: true,
      balances,
      streak: {
        currentStreak: 2,
        longestStreak: 4,
        lastActivityDate: null,
        streakFrozenUntil: null,
        updatedAt: balances.updatedAt,
      },
      canClaimDaily: true,
    };
    const distribution = { spirit: 1, essence: 1, matter: 1, substance: 1 };
    const shopPayload = {
      success: true,
      balances: distribution,
      pricing: {
        multiplier: 1,
        aNumber: 2,
        dominantElement: "Fire",
        timestamp: balances.updatedAt,
      },
      items: [
        {
          id: "item-1",
          slug: "cosmic-spice",
          title: "Cosmic Spice",
          description: null,
          category: "ingredient",
          isOneTime: false,
          baseCost: distribution,
          liveCost: distribution,
          canAfford: true,
        },
      ],
    };

    expect(economyBalanceResponseSchema.safeParse(balancePayload).success).toBe(true);
    expect(shopResponseSchema.safeParse(shopPayload).success).toBe(true);
    expect(purchaseResponseSchema.safeParse({ success: false, message: "No funds" }).success).toBe(true);
    expect(economyBalanceResponseSchema.safeParse({ ...balancePayload, balances: null }).success).toBe(false);
    expect(shopResponseSchema.safeParse({ ...shopPayload, items: [{ id: 7 }] }).success).toBe(false);
    expect(claimDailyResponseSchema.safeParse({ success: true, yield: {}, message: "ok" }).success).toBe(false);
  });

  it("normalizes aggregate counts without trusting database driver values", async () => {
    executeQuery.mockResolvedValueOnce({
      rows: [
        {
          total_users: "12",
          active_users: 9,
          new_users_today: "invalid",
          completed_onboarding: -1,
          agent_users: "2",
          human_users: "10",
        },
      ],
    });

    await expect(getAdminUserStats()).resolves.toEqual({
      totalUsers: 12,
      activeUsers: 9,
      newUsersToday: 0,
      completedOnboarding: 0,
      agentUsers: 2,
      humanUsers: 10,
      live: true,
    });
  });

  it("skips malformed recent-user rows while preserving valid siblings", async () => {
    executeQuery.mockResolvedValueOnce({
      rows: [
        {
          id: "user-1",
          email: "cook@example.com",
          name: "Cook",
          created_at: "2026-08-29T00:00:00.000Z",
          dominant_element: "Fire",
          is_active: true,
        },
        {
          id: 7,
          email: "malformed@example.com",
          name: null,
          created_at: "not-a-date",
          dominant_element: null,
          is_active: false,
        },
      ],
    });

    const result = await getRecentHumanSignups();
    expect(result.live).toBe(true);
    expect(result.users).toHaveLength(1);
    expect(result.users[0]?.id).toBe("user-1");
  });

  it("marks an admin read unavailable and logs the production failure", async () => {
    executeQuery.mockRejectedValueOnce(new Error("database unavailable"));

    await expect(getAdminUserStats()).resolves.toMatchObject({ live: false, totalUsers: 0 });
    expect(logError).toHaveBeenCalledWith(
      "[adminStatsService] stats query failed:",
      expect.any(Error),
    );
  });

  it("rejects malformed mint rows and logs settlement lookup failures", async () => {
    executeQuery.mockResolvedValueOnce({ rows: [{ id: 42, status: "minted" }] });
    await expect(recipeNftMintService.findByContentHash("hash")).resolves.toBeNull();

    executeQuery.mockRejectedValueOnce(new Error("ledger unavailable"));
    await expect(recipeNftMintService.getByContentHash("hash")).resolves.toBeNull();
    expect(logError).toHaveBeenCalledWith(
      "[recipeNftMintService] getByContentHash failed",
      expect.any(Error),
    );
  });
});
