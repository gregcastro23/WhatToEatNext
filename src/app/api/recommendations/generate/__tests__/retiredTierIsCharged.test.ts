/**
 * @jest-environment node
 *
 * The premium tier is retired: it exempts no one from the ESMS economy (owner
 * ruling 2026-09-28). This route skipped its per-click charge for any account
 * whose subscription row said "premium", and prod held 4,253 of them (4,250
 * agents, 3 admins). Operators, the admin role plus an allowlisted email, are
 * now the only accounts that generate without paying.
 */

const purchaseShopItem = jest.fn();
const getShopItem = jest.fn();
const getUserById = jest.fn();
const getUserSubscription = jest.fn();
const generateDayRecommendations = jest.fn();

import { NextRequest } from "next/server";
import { ADMIN_EMAILS } from "@/lib/auth/adminEmails";

jest.mock("@/services/TokenEconomyService", () => ({
  tokenEconomy: {
    purchaseShopItem: (...a: unknown[]) => purchaseShopItem(...a),
    getShopItem: (...a: unknown[]) => getShopItem(...a),
  },
}));

jest.mock("@/lib/auth/demoAccess", () => ({
  gateDemoOrAuth: async () => ({ mode: "auth", userId: "user-1" }),
}));

jest.mock("@/services/userDatabaseService", () => ({
  userDatabase: { getUserById: (...a: unknown[]) => getUserById(...a) },
}));

// What the route read before the fix. Every account here holds the retired
// tier, so a route that still consulted it would exempt all of them.
jest.mock("@/services/subscriptionService", () => ({
  subscriptionService: {
    getUserSubscription: (...a: unknown[]) => getUserSubscription(...a),
  },
}));

jest.mock("@/lib/economy/livePricing", () => ({
  getPersonalizedPricingContext: async () => ({ personalized: false, multiplier: 1 }),
  applyPersonalizedPricing: () => ({ spirit: 2, essence: 2, matter: 2, substance: 2 }),
}));

jest.mock("@/utils/menuPlanner/recommendationBridge", () => ({
  generateDayRecommendations: (...a: unknown[]) => generateDayRecommendations(...a),
}));

const OPERATOR_EMAIL = ADMIN_EMAILS[1] ?? "missing-admin-email";

function storedUser(roles: string[], email: string): Record<string, unknown> {
  return { id: "user-1", email, roles, profile: {} };
}

async function generate(): Promise<{ status: number; body: unknown }> {
  const mod = await import("@/app/api/recommendations/generate/route");
  const res = await mod.POST(
    new NextRequest("https://alchm.kitchen/api/recommendations/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dayOfWeek: 2, astroState: {} }),
    }),
  );
  return { status: res.status, body: await res.json() };
}

describe("recommendations/generate: the retired premium tier exempts no one", () => {
  beforeEach(() => {
    // Fresh module per case: the route memoises results per user, and a memo
    // hit returns before the charge.
    jest.resetModules();
    for (const fn of [purchaseShopItem, getShopItem, getUserById, getUserSubscription, generateDayRecommendations]) {
      fn.mockReset();
    }
    getShopItem.mockResolvedValue({
      isActive: true,
      costSpirit: 1,
      costEssence: 1,
      costMatter: 1,
      costSubstance: 1,
    });
    purchaseShopItem.mockResolvedValue({ success: true, transactionGroupId: "grp-1" });
    getUserSubscription.mockResolvedValue({ tier: "premium", status: "active" });
    generateDayRecommendations.mockResolvedValue([]);
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => jest.restoreAllMocks());

  it("charges a legacy premium account per generation", async () => {
    getUserById.mockResolvedValue(storedUser(["user"], "agent@agentic.alchm.kitchen"));

    const { status, body } = await generate();

    expect(status).toBe(200);
    expect(body).toEqual(expect.objectContaining({ success: true, charged: true }));
    expect(purchaseShopItem).toHaveBeenCalledTimes(1);
    expect(purchaseShopItem).toHaveBeenCalledWith(
      "user-1",
      "unlock-basic-recipe",
      expect.objectContaining({
        overrideCosts: { spirit: 2, essence: 2, matter: 2, substance: 2 },
      }),
    );
  });

  it("refuses a legacy premium account that cannot pay", async () => {
    getUserById.mockResolvedValue(storedUser(["user"], "agent@agentic.alchm.kitchen"));
    purchaseShopItem.mockResolvedValue({ success: false, reason: "insufficient_funds" });

    const { status, body } = await generate();

    expect(status).toBe(402);
    expect(body).toEqual(expect.objectContaining({ reason: "insufficient_tokens" }));
    expect(generateDayRecommendations).not.toHaveBeenCalled();
  });

  it("does not charge an operator, whatever its subscription row says", async () => {
    getUserById.mockResolvedValue(storedUser(["admin", "user"], OPERATOR_EMAIL));
    getUserSubscription.mockResolvedValue({ tier: "free", status: "active" });

    const { status, body } = await generate();

    expect(status).toBe(200);
    expect(body).toEqual(expect.objectContaining({ success: true, charged: false }));
    expect(purchaseShopItem).not.toHaveBeenCalled();
  });

  it.each([
    ["the admin role without an allowlisted email", ["admin", "user"], "someone@example.com"],
    ["an allowlisted email without the admin role", ["user"], OPERATOR_EMAIL],
  ])("charges %s", async (_label, roles, email) => {
    getUserById.mockResolvedValue(storedUser(roles, email));

    const { status } = await generate();

    expect(status).toBe(200);
    expect(purchaseShopItem).toHaveBeenCalledTimes(1);
  });
});
