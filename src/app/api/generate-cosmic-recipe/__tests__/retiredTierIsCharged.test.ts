/**
 * @jest-environment node
 *
 * The premium tier is retired: it exempts no one from the ESMS economy (owner
 * ruling 2026-09-28). Operators, the admin role plus an allowlisted email, are
 * the only accounts that generate without paying.
 *
 * On this route the tier exemption was indirect. The daily counter skipped
 * tier "premium" accounts, so their count stayed 0 and every generation read
 * as the free first one of the day. Prod held 4,253 such rows (4,250 agents,
 * 3 admins) when this was fixed. So the regression to pin is: a legacy
 * "premium" account's generation IS counted, and a later one IS charged.
 */

const purchaseShopItem = jest.fn();
const getShopItem = jest.fn();
const executeQuery = jest.fn();
const getUserById = jest.fn();
const getUserSubscription = jest.fn();

import { NextRequest } from "next/server";
import { installFetchMock } from "@/__tests__/helpers/fetchMock";
import { ADMIN_EMAILS } from "@/lib/auth/adminEmails";
import { VALID_RECIPE } from "./helpers/validCosmicRecipe";

jest.mock("@/services/TokenEconomyService", () => ({
  tokenEconomy: {
    purchaseShopItem: (...a: unknown[]) => purchaseShopItem(...a),
    creditMultipleTokensDetailed: async () => ({ status: "applied" }),
    getShopItem: (...a: unknown[]) => getShopItem(...a),
  },
}));

jest.mock("@/lib/auth/demoAccess", () => ({
  gateDemoOrAuth: async () => ({ mode: "auth", userId: "user-1" }),
}));

jest.mock("@/lib/database", () => ({
  executeQuery: (...a: unknown[]) => executeQuery(...a),
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
  applyPersonalizedPricing: () => ({ spirit: 7.5, essence: 7.5, matter: 7.5, substance: 7.5 }),
}));

jest.mock("@/services/questEventReporter", () => ({
  reportQuestEventBestEffort: async () => undefined,
}));

jest.mock("@/services/FoodDiaryService", () => ({
  foodDiaryService: { getEntries: async () => [] },
}));

const OPERATOR_EMAIL = ADMIN_EMAILS[1] ?? "missing-admin-email";

function storedUser(roles: string[], email: string): Record<string, unknown> {
  return { id: "user-1", email, roles, profile: {} };
}

/** SELECT answers `generatedToday`; the counting UPSERT answers one more. */
function dailyLimitsDb(generatedToday: number): void {
  executeQuery.mockImplementation(async (sql: string) => {
    if (sql.includes("SELECT recipes_generated")) {
      return { rows: [{ recipes_generated: generatedToday }] };
    }
    if (sql.includes("INSERT INTO user_daily_limits")) {
      return { rows: [{ recipes_generated: generatedToday + 1 }] };
    }
    return { rows: [] };
  });
}

function countingCalls(): unknown[][] {
  return executeQuery.mock.calls.filter(
    ([sql]) => typeof sql === "string" && sql.includes("INSERT INTO user_daily_limits"),
  );
}

async function generate(): Promise<Response> {
  const mod = await import("@/app/api/generate-cosmic-recipe/route");
  return await mod.POST(
    new NextRequest("https://alchm.kitchen/api/generate-cosmic-recipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "something nourishing" }),
    }),
  );
}

describe("cosmic recipe: the retired premium tier exempts no one", () => {
  beforeEach(() => {
    jest.resetModules();
    for (const fn of [purchaseShopItem, getShopItem, executeQuery, getUserById, getUserSubscription]) {
      fn.mockReset();
    }
    getShopItem.mockResolvedValue({
      isActive: true,
      costSpirit: 5,
      costEssence: 5,
      costMatter: 5,
      costSubstance: 5,
    });
    purchaseShopItem.mockResolvedValue({ success: true, transactionGroupId: "grp-1" });
    getUserSubscription.mockResolvedValue({ tier: "premium", status: "active" });
    installFetchMock(
      jest.fn().mockResolvedValue(
        new Response(JSON.stringify(VALID_RECIPE), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => jest.restoreAllMocks());

  it("counts a legacy premium account's free first generation, so its next one is chargeable", async () => {
    dailyLimitsDb(0);
    getUserById.mockResolvedValue(storedUser(["user"], "agent@agentic.alchm.kitchen"));

    const res = await generate();

    expect(res.status).toBe(200);
    // The defect: this UPSERT was skipped for tier "premium", so the count
    // never left 0 and the free first generation repeated forever.
    expect(countingCalls()).toHaveLength(1);
    expect(purchaseShopItem).not.toHaveBeenCalled();
  });

  it("charges a legacy premium account once it has generated today", async () => {
    dailyLimitsDb(1);
    getUserById.mockResolvedValue(storedUser(["user"], "agent@agentic.alchm.kitchen"));

    const res = await generate();

    expect(res.status).toBe(200);
    expect(purchaseShopItem).toHaveBeenCalledTimes(1);
    expect(purchaseShopItem).toHaveBeenCalledWith(
      "user-1",
      "unlock-cosmic-recipe",
      expect.objectContaining({
        overrideCosts: { spirit: 7.5, essence: 7.5, matter: 7.5, substance: 7.5 },
      }),
    );
    expect(countingCalls()).toHaveLength(1);
  });

  it("does not charge an operator, and still counts the generation", async () => {
    dailyLimitsDb(1);
    getUserById.mockResolvedValue(storedUser(["admin", "user"], OPERATOR_EMAIL));

    const res = await generate();

    expect(res.status).toBe(200);
    expect(purchaseShopItem).not.toHaveBeenCalled();
    expect(countingCalls()).toHaveLength(1);
  });

  it.each([
    ["the admin role without an allowlisted email", ["admin", "user"], "someone@example.com"],
    ["an allowlisted email without the admin role", ["user"], OPERATOR_EMAIL],
  ])("charges %s", async (_label, roles, email) => {
    dailyLimitsDb(1);
    getUserById.mockResolvedValue(storedUser(roles, email));

    const res = await generate();

    expect(res.status).toBe(200);
    expect(purchaseShopItem).toHaveBeenCalledTimes(1);
  });
});
